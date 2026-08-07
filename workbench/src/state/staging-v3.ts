import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { rename } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { formatSkillInvocation } from "@earendil-works/pi-agent-core";
import type { AdaptiveSkillStateEntryV3, HarnessStateEntryV3, RefinementCandidateV3, StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { composePromptAddendaV3 } from "../prompts/adapter-v3.ts";
import { loadAdaptiveSkillV3, renderAdaptiveSkillMarkdownV3 } from "../skill/adapter-v3.ts";

function slash(path: string): string { return path.replace(/\\/g, "/"); }
function contained(root: string, target: string): boolean { const rel = relative(root, target); return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`)); }
function overlap(left: string, right: string): boolean { return contained(left, right) || contained(right, left); }

function exactKeys(value: unknown, expected: readonly string[], label: string): asserts value is Record<string, unknown> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const actual = Object.keys(value).sort(); const wanted = [...expected].sort();
	if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) throw new Error(`${label} exact-key validation failed`);
}

function ordinaryFileInventory(root: string): string[] {
	const files: string[] = [];
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const path = resolve(directory, entry.name); const stats = lstatSync(path);
			if (stats.isSymbolicLink()) throw new Error("staged State link/reparse point rejected");
			if (stats.isDirectory()) { visit(path); continue; }
			if (!stats.isFile() || stats.nlink !== 1) throw new Error("staged State non-ordinary file or hardlink rejected");
			files.push(slash(relative(root, path)));
		}
	};
	visit(root); return files.sort();
}

function ordinaryRoot(path: string, label: string): string {
	const root = resolve(path); const stats = lstatSync(root);
	if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(root);
}

function canonicalFuturePath(path: string, label: string): string {
	const target = resolve(path); let ancestor = target; const suffix: string[] = [];
	while (!existsSync(ancestor)) {
		const parent = dirname(ancestor);
		if (parent === ancestor) throw new Error(`${label} has no existing ancestor`);
		suffix.unshift(basename(ancestor)); ancestor = parent;
	}
	const stats = lstatSync(ancestor);
	if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`${label} nearest existing ancestor must be an ordinary directory`);
	return resolve(realpathSync.native(ancestor), ...suffix);
}

function canonicalAuthority(path: string, label: string): string {
	const target = resolve(path); const stats = lstatSync(target);
	if (stats.isSymbolicLink() || (!stats.isDirectory() && !stats.isFile())) throw new Error(`${label} must be an ordinary file or directory`);
	return realpathSync.native(target);
}

function ensureStateBoundary(options: { stateRoot: string; agentWorkspaceRoot: string; acceptedBaseRoots: string[] }): string {
	const futureStateRoot = canonicalFuturePath(options.stateRoot, "stateRoot");
	const workspace = ordinaryRoot(options.agentWorkspaceRoot, "agentWorkspaceRoot");
	if (overlap(futureStateRoot, workspace)) throw new Error("stateRoot must be outside the Agent tool Workspace");
	const acceptedBases = options.acceptedBaseRoots.map((path, index) => canonicalAuthority(path, `acceptedBaseRoots[${index}]`));
	for (const target of acceptedBases) if (overlap(futureStateRoot, target)) throw new Error("stateRoot overlaps accepted base authority");
	mkdirSync(options.stateRoot, { recursive: true });
	const stateRoot = ordinaryRoot(options.stateRoot, "stateRoot");
	if (overlap(stateRoot, workspace)) throw new Error("stateRoot must be outside the Agent tool Workspace");
	for (const target of acceptedBases) if (overlap(stateRoot, target)) throw new Error("stateRoot overlaps accepted base authority");
	return stateRoot;
}

function semanticProjection(state: StagedHarnessStateV3): unknown {
	return {
		candidate_id: state.candidate_id,
		candidate_digest: state.candidate_digest,
		evidence_identity: state.evidence_identity,
		expected_base_state_digest: state.expected_base_state_digest,
		entries: state.entries.map((entry) => entry.kind === "prompt_addendum"
			? { kind: entry.kind, entry_id: entry.entry_id, content: entry.content, applicability: entry.applicability }
			: { kind: entry.kind, entry_id: entry.entry_id, skill_name: entry.skill_name, description: entry.description, markdown_body: entry.markdown_body, applicability: entry.applicability }),
	};
}

function stateDigestForCandidate(candidate: RefinementCandidateV3): string {
	return digestObject({ candidate_id: candidate.candidate_id, candidate_digest: candidate.candidate_digest, evidence_identity: candidate.evidence_identity, expected_base_state_digest: candidate.expected_base_state_digest, entries: [...candidate.edits].sort((left, right) => left.entry_id.localeCompare(right.entry_id)) });
}

function safeCleanup(stateRoot: string, scratch: string): void {
	const resolvedRoot = resolve(stateRoot); const resolvedScratch = resolve(scratch);
	if (resolvedScratch === resolvedRoot || !contained(resolvedRoot, resolvedScratch)) throw new Error("scratch cleanup boundary rejected");
	if (existsSync(resolvedScratch)) rmSync(resolvedScratch, { recursive: true, force: true });
}

async function renameWithWindowsRetry(source: string, target: string): Promise<void> {
	for (let attempt = 1; attempt <= 5; attempt++) {
		try { await rename(source, target); return; } catch (error) {
			const code = (error as NodeJS.ErrnoException).code;
			if (!(["EPERM", "EACCES", "EBUSY"].includes(code ?? "")) || attempt === 5) throw error;
			await new Promise<void>((resolveDelay) => setTimeout(resolveDelay, attempt * 20));
		}
	}
}

export async function stageCandidateStateV3(options: { candidate: RefinementCandidateV3; stateRoot: string; agentWorkspaceRoot: string; acceptedBaseRoots: string[]; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ state: StagedHarnessStateV3; statePath: string }> {
	const stateRoot = ensureStateBoundary(options);
	const { candidate_id: candidateId, candidate_digest: candidateDigest, ...candidateBody } = options.candidate;
	if (digestObject(candidateBody) !== candidateDigest || candidateId !== `candidate-${candidateDigest.slice(0, 32)}`) throw new Error("Candidate identity or digest mismatch");
	const stateDigest = stateDigestForCandidate(options.candidate);
	const finalRoot = resolve(stateRoot, "candidates", stateDigest);
	if (existsSync(finalRoot)) throw new Error("immutable staged Candidate already exists");
	const scratch = resolve(stateRoot, `.staging-${randomUUID()}`); mkdirSync(scratch, { recursive: false });
	let renamed = false;
	try {
		const promptEdits = options.candidate.edits.filter((entry) => entry.kind === "prompt_addendum");
		const skillEdits = options.candidate.edits.filter((entry) => entry.kind === "adaptive_skill");
		if (skillEdits.length > 1) throw new Error("at most one adaptive Skill may be staged");
		const promptPreview = promptEdits.length === 0 ? null : composePromptAddendaV3({ basePrompt: options.immutableBasePrompt, expectedBasePromptSha256: options.immutableBasePromptSha256, entries: promptEdits });
		const entries: HarnessStateEntryV3[] = promptEdits.map((entry) => ({ ...entry, content_sha256: sha256(entry.content), composed_prompt_sha256: promptPreview!.composed_prompt_sha256 }));
		for (const entry of skillEdits) {
			const markdown = renderAdaptiveSkillMarkdownV3(entry);
			const relativeSource = `skills/${entry.skill_name}/SKILL.md`; const scratchSource = resolve(scratch, relativeSource);
			mkdirSync(dirname(scratchSource), { recursive: true }); writeFileSync(scratchSource, markdown, { encoding: "utf8", flag: "wx" });
			const sourceSha = sha256(Buffer.from(markdown, "utf8"));
			const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(scratch, "skills"), expectedName: entry.skill_name, expectedSourceSha256: sourceSha });
			const finalFilePath = slash(resolve(finalRoot, relativeSource));
			const finalWrapper = formatSkillInvocation({ ...loaded.skill, filePath: finalFilePath });
			entries.push({ ...entry, source_ref: relativeSource, source_sha256: sourceSha, source_size_bytes: Buffer.byteLength(markdown, "utf8"), wrapper_sha256: sha256(finalWrapper), wrapper_size_bytes: Buffer.byteLength(finalWrapper, "utf8"), disable_model_invocation: true, invocation_mode: "explicit_skill" });
		}
		entries.sort((left, right) => left.entry_id.localeCompare(right.entry_id));
		const state: StagedHarnessStateV3 = { schema_version: 1, status: "staged_inactive", state_digest: stateDigest, candidate_id: options.candidate.candidate_id, candidate_digest: options.candidate.candidate_digest, evidence_identity: structuredClone(options.candidate.evidence_identity), expected_base_state_digest: options.candidate.expected_base_state_digest, entries };
		if (digestObject(semanticProjection(state)) !== stateDigest) throw new Error("staged State semantic digest mismatch");
		writeFileSync(resolve(scratch, "state.json"), `${stableJson(state)}\n`, { encoding: "utf8", flag: "wx" });
		mkdirSync(dirname(finalRoot), { recursive: true }); await renameWithWindowsRetry(scratch, finalRoot); renamed = true;
		return { state: await loadStagedStateV3({ stateRoot, stateDigest, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 }), statePath: resolve(finalRoot, "state.json") };
	} catch (error) {
		safeCleanup(stateRoot, renamed ? finalRoot : scratch);
		throw error;
	}
}

export async function loadStagedStateV3(options: { stateRoot: string; stateDigest: string; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<StagedHarnessStateV3> {
	if (!/^[a-f0-9]{64}$/.test(options.stateDigest)) throw new Error("invalid staged State digest");
	const root = ordinaryRoot(options.stateRoot, "stateRoot"); const candidateRoot = resolve(root, "candidates", options.stateDigest);
	if (!contained(root, candidateRoot) || !existsSync(candidateRoot)) throw new Error("staged State is missing");
	ordinaryRoot(candidateRoot, "Candidate root");
	const statePath = resolve(candidateRoot, "state.json"); const stats = lstatSync(statePath);
	if (stats.isSymbolicLink() || !stats.isFile() || stats.nlink !== 1) throw new Error("staged State manifest must be an ordinary file");
	const state = JSON.parse(readFileSync(statePath, "utf8")) as StagedHarnessStateV3;
	exactKeys(state, ["schema_version", "status", "state_digest", "candidate_id", "candidate_digest", "evidence_identity", "expected_base_state_digest", "entries"], "staged State");
	if (state.schema_version !== 1 || state.status !== "staged_inactive" || state.state_digest !== options.stateDigest || !Array.isArray(state.entries) || state.entries.length < 1 || state.entries.length > 2) throw new Error("invalid staged State envelope");
	exactKeys(state.evidence_identity, ["evidence_id", "evidence_digest"], "staged State evidence identity");
	if (digestObject(semanticProjection(state)) !== state.state_digest) throw new Error("staged State digest mismatch");
	const promptEntries = state.entries.filter((entry) => entry.kind === "prompt_addendum");
	const promptPreview = promptEntries.length === 0 ? null : composePromptAddendaV3({ basePrompt: options.immutableBasePrompt, expectedBasePromptSha256: options.immutableBasePromptSha256, entries: promptEntries });
	const expectedFiles = ["state.json"];
	for (const entry of state.entries) {
		if (entry.kind === "prompt_addendum") {
			exactKeys(entry, ["kind", "entry_id", "content", "applicability", "content_sha256", "composed_prompt_sha256"], "prompt addendum State entry");
			exactKeys(entry.applicability, ["task_kinds", "failure_families"], "prompt addendum applicability");
			if (sha256(entry.content) !== entry.content_sha256) throw new Error("prompt addendum digest mismatch");
			if (entry.composed_prompt_sha256 !== promptPreview!.composed_prompt_sha256) throw new Error("prompt addendum composed prompt digest mismatch");
			continue;
		}
		if (entry.kind !== "adaptive_skill") throw new Error("unknown staged State entry kind");
		exactKeys(entry, ["kind", "entry_id", "skill_name", "description", "markdown_body", "applicability", "source_ref", "source_sha256", "source_size_bytes", "wrapper_sha256", "wrapper_size_bytes", "disable_model_invocation", "invocation_mode"], "adaptive Skill State entry");
		exactKeys(entry.applicability, ["task_kinds", "failure_families"], "adaptive Skill applicability");
		if (entry.disable_model_invocation !== true || entry.invocation_mode !== "explicit_skill") throw new Error("adaptive Skill invocation authority flags mismatch");
		const expectedSourceRef = `skills/${entry.skill_name}/SKILL.md`;
		if (entry.source_ref !== expectedSourceRef) throw new Error("adaptive Skill source_ref mismatch");
		expectedFiles.push(entry.source_ref);
		const source = resolve(candidateRoot, entry.source_ref);
		if (!contained(candidateRoot, source)) throw new Error("adaptive Skill source escapes Candidate root");
		const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(candidateRoot, "skills"), expectedName: entry.skill_name, expectedSourceSha256: entry.source_sha256 });
		const typed = entry as AdaptiveSkillStateEntryV3;
		if (slash(relative(candidateRoot, resolve(loaded.skill.filePath))) !== expectedSourceRef) throw new Error("adaptive Skill loaded source identity mismatch");
		if (loaded.source_size_bytes !== typed.source_size_bytes || loaded.wrapper_sha256 !== typed.wrapper_sha256 || loaded.wrapper_size_bytes !== typed.wrapper_size_bytes) throw new Error("adaptive Skill public wrapper identity mismatch");
	}
	if (stableJson(ordinaryFileInventory(candidateRoot)) !== stableJson(expectedFiles.sort())) throw new Error("staged State file inventory mismatch");
	return structuredClone(state);
}
