import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { formatSkillInvocation } from "@earendil-works/pi-agent-core";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type {
	ActiveStateIdentityV3,
	ActiveStatePointerV3,
	HarnessStateVersionV3,
	StateDecisionV3,
	StateStoreInspectionV3,
} from "../contracts/v3g2-types.ts";
import type { AdaptiveSkillStateEntryV3, HarnessStateEntryV3, StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { artifactRef, isArtifactRefV0B, validateArtifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { composePromptAddendaV3 } from "../prompts/adapter-v3.ts";
import { inspectValidationV3 } from "../refinement/comparator-v3.ts";
import { loadAdaptiveSkillV3 } from "../skill/adapter-v3.ts";
import { acceptedStateVersionDigestV3 } from "./identity-v3.ts";
import { loadStagedStateV3 } from "./staging-v3.ts";

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const WINDOWS_ALIAS = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;

function slash(path: string): string { return path.replace(/\\/g, "/"); }
function contained(root: string, target: string): boolean { const rel = relative(root, target); return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`)); }
function overlap(left: string, right: string): boolean { return contained(left, right) || contained(right, left); }

function exactKeys(value: unknown, expected: readonly string[], label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const actual = Object.keys(value).sort(); const wanted = [...expected].sort();
	if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) throw new Error(`${label} exact-key validation failed`);
}

function ordinaryRoot(path: string, label: string): string {
	const target = resolve(path); const stats = lstatSync(target);
	if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(target);
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

function createStoreRoot(options: { stateRoot: string; agentWorkspaceRoot: string; acceptedBaseRoots: string[] }): string {
	if (existsSync(options.stateRoot)) throw new Error("State store root already exists");
	const future = canonicalFuturePath(options.stateRoot, "stateRoot");
	const workspace = ordinaryRoot(options.agentWorkspaceRoot, "agentWorkspaceRoot");
	if (overlap(future, workspace)) throw new Error("State store must be outside the Agent tool Workspace");
	for (const [index, path] of options.acceptedBaseRoots.entries()) if (overlap(future, canonicalAuthority(path, `acceptedBaseRoots[${index}]`))) throw new Error("State store overlaps accepted base authority");
	mkdirSync(options.stateRoot, { recursive: true });
	return ordinaryRoot(options.stateRoot, "stateRoot");
}

function scanOrdinaryStore(root: string): string[] {
	const files: string[] = [];
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			if (entry.name.endsWith(".") || entry.name.endsWith(" ") || WINDOWS_ALIAS.test(entry.name)) throw new Error(`State store Windows path alias rejected: ${entry.name}`);
			const path = resolve(directory, entry.name); const stats = lstatSync(path);
			if (stats.isSymbolicLink()) throw new Error("State store link/reparse point rejected");
			if (entry.isDirectory()) { visit(path); continue; }
			if (!stats.isFile() || stats.nlink !== 1) throw new Error("State store non-ordinary file or hardlink rejected");
			if (!contained(root, realpathSync.native(path))) throw new Error("State store path escapes root");
			files.push(slash(relative(root, path)));
		}
	};
	visit(root); return files;
}

function pointerBody(pointer: ActiveStatePointerV3): Omit<ActiveStatePointerV3, "pointer_digest"> {
	const { pointer_digest: _digest, ...body } = pointer;
	return body;
}

function decisionBody(decision: StateDecisionV3): Omit<StateDecisionV3, "decision_id" | "decision_digest"> {
	const { decision_id: _id, decision_digest: _digest, ...body } = decision;
	return body;
}

function activeIdentity(pointer: ActiveStatePointerV3): ActiveStateIdentityV3 {
	return { binding_revision: pointer.binding_revision, state_version: pointer.state_version, state_digest: pointer.state_digest };
}

function sameActive(left: ActiveStateIdentityV3 | null, right: ActiveStateIdentityV3 | null): boolean {
	return stableJson(left) === stableJson(right);
}

function buildDecision(body: Omit<StateDecisionV3, "decision_id" | "decision_digest">): StateDecisionV3 {
	const decisionDigest = digestObject(body);
	return { ...body, decision_id: `decision-${decisionDigest.slice(0, 32)}`, decision_digest: decisionDigest };
}

function buildPointer(body: Omit<ActiveStatePointerV3, "pointer_digest">): ActiveStatePointerV3 {
	return { ...body, pointer_digest: digestObject(body) };
}

function atomicWritePointer(root: string, pointer: ActiveStatePointerV3): void {
	const temp = resolve(root, `.active-${randomUUID()}.tmp`);
	writeFileSync(temp, `${stableJson(pointer)}\n`, { encoding: "utf8", flag: "wx" });
	try { renameSync(temp, resolve(root, "active.json")); }
	catch (error) { if (existsSync(temp)) rmSync(temp); throw error; }
}

function readJsonFile<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (stats.isSymbolicLink() || !stats.isFile() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary file`);
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function validateVersion(root: string, version: HarnessStateVersionV3, directoryName: string, immutableBasePrompt: string, immutableBasePromptSha256: string): Promise<string[]> {
	exactKeys(version, ["schema_version", "status", "project_id", "state_version", "parent_state_digest", "source_candidate_id", "source_candidate_digest", "source_staged_state_digest", "entries", "state_digest"], "accepted State version");
	if (version.schema_version !== 1 || version.status !== "accepted" || !Number.isSafeInteger(version.state_version) || version.state_version < 0 || version.state_digest !== directoryName || acceptedStateVersionDigestV3(version) !== version.state_digest) throw new Error("accepted State version identity mismatch");
	if (!Array.isArray(version.entries) || version.entries.length > 2 || new Set(version.entries.map((entry) => entry.entry_id)).size !== version.entries.length) throw new Error("accepted State entry membership invalid");
	const expected = [`versions/${version.state_digest}/state.json`];
	const promptEntries = version.entries.filter((entry) => entry.kind === "prompt_addendum");
	const preview = promptEntries.length === 0 ? null : composePromptAddendaV3({ basePrompt: immutableBasePrompt, expectedBasePromptSha256: immutableBasePromptSha256, entries: promptEntries });
	for (const entry of version.entries) {
		if (entry.kind === "prompt_addendum") {
			exactKeys(entry, ["kind", "entry_id", "content", "applicability", "content_sha256", "composed_prompt_sha256"], "accepted prompt State entry");
			exactKeys(entry.applicability, ["task_kinds", "failure_families"], "accepted prompt applicability");
			if (sha256(entry.content) !== entry.content_sha256 || entry.composed_prompt_sha256 !== preview!.composed_prompt_sha256) throw new Error("accepted prompt State derived identity mismatch");
			continue;
		}
		if (entry.kind !== "adaptive_skill") throw new Error("unknown accepted State entry kind");
		exactKeys(entry, ["kind", "entry_id", "skill_name", "description", "markdown_body", "applicability", "source_ref", "source_sha256", "source_size_bytes", "wrapper_sha256", "wrapper_size_bytes", "disable_model_invocation", "invocation_mode"], "accepted adaptive Skill entry");
		exactKeys(entry.applicability, ["task_kinds", "failure_families"], "accepted Skill applicability");
		if (entry.disable_model_invocation !== true || entry.invocation_mode !== "explicit_skill" || entry.source_ref !== `skills/${entry.skill_name}/SKILL.md`) throw new Error("accepted adaptive Skill authority identity mismatch");
		const versionRoot = resolve(root, "versions", version.state_digest);
		const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(versionRoot, "skills"), expectedName: entry.skill_name, expectedSourceSha256: entry.source_sha256 });
		if (slash(relative(versionRoot, resolve(loaded.skill.filePath))) !== entry.source_ref || loaded.source_size_bytes !== entry.source_size_bytes || loaded.wrapper_sha256 !== entry.wrapper_sha256 || loaded.wrapper_size_bytes !== entry.wrapper_size_bytes) throw new Error("accepted adaptive Skill public identity mismatch");
		expected.push(`versions/${version.state_digest}/${entry.source_ref}`);
	}
	return expected;
}

export async function inspectStateStoreV3(options: { stateRoot: string; expectedProjectId?: string; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<StateStoreInspectionV3> {
	const errors: string[] = [];
	let projectId: string | null = null;
	let active: ActiveStatePointerV3 | null = null;
	const versions: HarnessStateVersionV3[] = [];
	const decisions: StateDecisionV3[] = [];
	try {
		const root = ordinaryRoot(options.stateRoot, "stateRoot");
		const inventory = scanOrdinaryStore(root);
		active = readJsonFile<ActiveStatePointerV3>(resolve(root, "active.json"), "active pointer");
		exactKeys(active, ["schema_version", "project_id", "binding_revision", "state_version", "state_digest", "decision_id", "pointer_digest"], "active pointer");
		if (active.schema_version !== 1 || !ID.test(active.project_id) || !Number.isSafeInteger(active.binding_revision) || active.binding_revision < 0 || !Number.isSafeInteger(active.state_version) || active.state_version < 0 || !SHA256.test(active.state_digest) || digestObject(pointerBody(active)) !== active.pointer_digest) throw new Error("active pointer identity mismatch");
		projectId = active.project_id;
		if (options.expectedProjectId && projectId !== options.expectedProjectId) throw new Error("State store project identity mismatch");
		const expectedInventory = ["active.json"];
		const versionRoot = resolve(root, "versions");
		for (const entry of readdirSync(versionRoot, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			if (!entry.isDirectory() || !SHA256.test(entry.name)) throw new Error("unexpected State version directory");
			const version = readJsonFile<HarnessStateVersionV3>(resolve(versionRoot, entry.name, "state.json"), "accepted State version");
			expectedInventory.push(...await validateVersion(root, version, entry.name, options.immutableBasePrompt, options.immutableBasePromptSha256));
			if (version.project_id !== projectId) throw new Error("accepted State version project mismatch");
			versions.push(version);
		}
		const decisionRoot = resolve(root, "decisions");
		for (const entry of readdirSync(decisionRoot, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			if (!entry.isFile() || !/^decision-[a-f0-9]{32}\.json$/.test(entry.name)) throw new Error("unexpected State decision file");
			const decision = readJsonFile<StateDecisionV3>(resolve(decisionRoot, entry.name), "State decision");
			exactKeys(decision, ["schema_version", "decision_id", "decision_sequence", "kind", "project_id", "result", "reason", "candidate_id", "candidate_digest", "staged_state_digest", "validation_id", "validation_digest", "validation_ref", "prior_active", "next_active", "rollback_target_digest", "decision_digest"], "State decision");
			if (decision.schema_version !== 1 || decision.project_id !== projectId || decision.decision_id !== entry.name.slice(0, -5) || digestObject(decisionBody(decision)) !== decision.decision_digest || decision.decision_id !== `decision-${decision.decision_digest.slice(0, 32)}`) throw new Error("State decision identity mismatch");
			if (decision.validation_ref !== null && !isArtifactRefV0B(decision.validation_ref)) throw new Error("State decision validation ref invalid");
			decisions.push(decision); expectedInventory.push(`decisions/${entry.name}`);
		}
		decisions.sort((left, right) => left.decision_sequence - right.decision_sequence);
		if (decisions.length === 0 || decisions.some((decision, index) => decision.decision_sequence !== index)) throw new Error("State decision sequence is not contiguous");
		const byDigest = new Map(versions.map((version) => [version.state_digest, version]));
		let simulated: ActiveStateIdentityV3 | null = null;
		let activeDecisionId: string | null = null;
		const referencedVersions = new Set<string>();
		let highestAcceptedVersion = -1;
		for (const decision of decisions) {
			if (decision.prior_active !== null) exactKeys(decision.prior_active, ["binding_revision", "state_version", "state_digest"], "decision prior active");
			exactKeys(decision.next_active, ["binding_revision", "state_version", "state_digest"], "decision next active");
			if (decision.kind === "initialize") {
				if (decision.decision_sequence !== 0 || simulated !== null || decision.prior_active !== null || decision.result !== "initialized" || decision.reason !== "initial_state" || decision.candidate_id !== null || decision.validation_ref !== null) throw new Error("invalid State initialization decision");
				simulated = decision.next_active; activeDecisionId = decision.decision_id;
				const initial = byDigest.get(simulated.state_digest);
				if (!initial || initial.state_version !== 0 || initial.parent_state_digest !== null || initial.entries.length !== 0) throw new Error("initial State version invalid");
				referencedVersions.add(initial.state_digest); highestAcceptedVersion = 0;
				continue;
			}
			if (!simulated || !sameActive(decision.prior_active, simulated)) throw new Error("State decision prior-active lineage mismatch");
			if (decision.kind === "rejection") {
				if (decision.result !== "rejected" || !["candidate_failed", "both_failed", "no_material_improvement", "candidate_regression_failed", "authority_or_fairness_invalid", "stale_base"].includes(decision.reason) || !sameActive(decision.next_active, simulated) || decision.rollback_target_digest !== null || !decision.candidate_id || !decision.validation_ref || !SHA256.test(decision.validation_digest ?? "")) throw new Error("invalid rejection decision");
				continue;
			}
			if (decision.next_active.binding_revision !== simulated.binding_revision + 1) throw new Error("active binding revision is not monotonic");
			const target = byDigest.get(decision.next_active.state_digest);
			if (!target || target.state_version !== decision.next_active.state_version) throw new Error("State decision target version missing");
			if (decision.kind === "promotion") {
				if (decision.result !== "promoted" || !["base_failed_candidate_passed", "both_passed_material_improvement"].includes(decision.reason) || !decision.candidate_id || !decision.validation_ref || !SHA256.test(decision.validation_digest ?? "") || target.state_version !== highestAcceptedVersion + 1 || target.parent_state_digest !== simulated.state_digest || target.source_candidate_id !== decision.candidate_id || target.source_staged_state_digest !== decision.staged_state_digest) throw new Error("invalid promotion/version lineage");
				referencedVersions.add(target.state_digest); highestAcceptedVersion = target.state_version;
			} else if (decision.kind === "rollback") {
				if (decision.result !== "rolled_back" || decision.reason !== "operator_rollback" || decision.validation_ref !== null || decision.candidate_id !== null || decision.rollback_target_digest !== target.state_digest || target.state_digest === simulated.state_digest) throw new Error("invalid rollback decision");
			} else throw new Error("unknown State decision kind");
			simulated = decision.next_active; activeDecisionId = decision.decision_id;
		}
		if (!simulated || !sameActive(simulated, activeIdentity(active)) || active.decision_id !== activeDecisionId) throw new Error("active pointer does not match immutable decision history");
		if (referencedVersions.size !== versions.length || versions.some((version) => !referencedVersions.has(version.state_digest))) throw new Error("State store contains an unreferenced version");
		if (stableJson(inventory) !== stableJson(expectedInventory.sort())) throw new Error("State store file inventory mismatch");
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { schema_version: 1, project_id: projectId, integrity_valid: errors.length === 0, errors, active, versions, decisions };
}

type ValidStateStoreV3 = Omit<StateStoreInspectionV3, "active"> & { active: ActiveStatePointerV3 };

async function requireValidStore(options: { stateRoot: string; projectId: string; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<ValidStateStoreV3> {
	const inspected = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!inspected.integrity_valid || !inspected.active) throw new Error(`State store fails closed: ${inspected.errors.join("; ")}`);
	return inspected as ValidStateStoreV3;
}

export async function initializeStateStoreV3(options: { stateRoot: string; projectId: string; agentWorkspaceRoot: string; acceptedBaseRoots: string[]; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ active: ActiveStatePointerV3; version: HarnessStateVersionV3; decision: StateDecisionV3 }> {
	if (!ID.test(options.projectId)) throw new Error("invalid State store project_id");
	const root = createStoreRoot(options);
	mkdirSync(resolve(root, "versions")); mkdirSync(resolve(root, "decisions"));
	const versionBody: Omit<HarnessStateVersionV3, "state_digest"> = { schema_version: 1, status: "accepted", project_id: options.projectId, state_version: 0, parent_state_digest: null, source_candidate_id: null, source_candidate_digest: null, source_staged_state_digest: null, entries: [] };
	const version: HarnessStateVersionV3 = { ...versionBody, state_digest: acceptedStateVersionDigestV3(versionBody) };
	writeOnceJson(root, `versions/${version.state_digest}/state.json`, version);
	const nextActive = { binding_revision: 0, state_version: 0, state_digest: version.state_digest };
	const decision = buildDecision({ schema_version: 1, decision_sequence: 0, kind: "initialize", project_id: options.projectId, result: "initialized", reason: "initial_state", candidate_id: null, candidate_digest: null, staged_state_digest: null, validation_id: null, validation_digest: null, validation_ref: null, prior_active: null, next_active: nextActive, rollback_target_digest: null });
	writeOnceJson(root, `decisions/${decision.decision_id}.json`, decision);
	const active = buildPointer({ schema_version: 1, project_id: options.projectId, ...nextActive, decision_id: decision.decision_id });
	atomicWritePointer(root, active);
	const inspected = await requireValidStore({ ...options });
	if (inspected.active.pointer_digest !== active.pointer_digest) throw new Error("initialized State store reopen mismatch");
	return { active, version, decision };
}

async function materializeAcceptedVersion(options: { root: string; stagedStateRoot: string; staged: StagedHarnessStateV3; prior: HarnessStateVersionV3; nextVersion: number }): Promise<HarnessStateVersionV3> {
	const semanticBody = { schema_version: 1 as const, status: "accepted" as const, project_id: options.prior.project_id, state_version: options.nextVersion, parent_state_digest: options.prior.state_digest, source_candidate_id: options.staged.candidate_id, source_candidate_digest: options.staged.candidate_digest, source_staged_state_digest: options.staged.state_digest, entries: structuredClone(options.staged.entries) };
	const stateDigest = acceptedStateVersionDigestV3(semanticBody);
	const finalRoot = resolve(options.root, "versions", stateDigest);
	if (existsSync(finalRoot)) throw new Error("immutable accepted State version already exists");
	const scratch = resolve(options.root, `.version-${randomUUID()}`); mkdirSync(scratch);
	try {
		const entries: HarnessStateEntryV3[] = [];
		for (const entry of semanticBody.entries) {
			if (entry.kind === "prompt_addendum") { entries.push(entry); continue; }
			const source = resolve(options.stagedStateRoot, "candidates", options.staged.state_digest, entry.source_ref);
			const sourceBytes = readFileSync(source);
			const scratchSource = resolve(scratch, entry.source_ref); mkdirSync(dirname(scratchSource), { recursive: true }); writeOnceBytes(scratch, entry.source_ref, sourceBytes);
			const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(scratch, "skills"), expectedName: entry.skill_name, expectedSourceSha256: entry.source_sha256 });
			const finalWrapper = formatSkillInvocation({ ...loaded.skill, filePath: slash(resolve(finalRoot, entry.source_ref)) });
			entries.push({ ...entry, wrapper_sha256: sha256(finalWrapper), wrapper_size_bytes: Buffer.byteLength(finalWrapper, "utf8") } as AdaptiveSkillStateEntryV3);
		}
		const version: HarnessStateVersionV3 = { ...semanticBody, entries, state_digest: stateDigest };
		writeOnceJson(scratch, "state.json", version);
		renameSync(scratch, finalRoot);
		return version;
	} catch (error) { if (existsSync(scratch)) rmSync(scratch, { recursive: true, force: true }); throw error; }
}

function nextDecisionSequence(store: StateStoreInspectionV3): number { return store.decisions.length; }

function persistDecision(root: string, decision: StateDecisionV3): void { writeOnceJson(root, `decisions/${decision.decision_id}.json`, decision); }

export async function applyValidationDecisionV3(options: { stateRoot: string; projectId: string; runRoot: string; validationRef: ArtifactRefV0B; stagedStateRoot: string; candidateStateDigest: string; expectedActive: ActiveStateIdentityV3; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ decision: StateDecisionV3; active: ActiveStatePointerV3; version: HarnessStateVersionV3 | null }> {
	const validationInspection = inspectValidationV3(options.runRoot);
	if (!validationInspection.integrity_valid || !validationInspection.validation || !validationInspection.seed || !validationInspection.recomputed_decision) throw new Error(`validation evidence fails closed: ${validationInspection.errors.join("; ")}`);
	if (validateArtifactRef(options.runRoot, options.validationRef).length !== 0 || options.validationRef.path !== "validation.json" || options.validationRef.sha256 !== artifactRef(options.runRoot, "validation.json", "application/json", false).sha256) throw new Error("validation ArtifactRef mismatch");
	const store = await requireValidStore({ stateRoot: options.stateRoot, projectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	const current = activeIdentity(store.active);
	const staged = await loadStagedStateV3({ stateRoot: options.stagedStateRoot, stateDigest: options.candidateStateDigest, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (staged.state_digest !== validationInspection.seed.candidate_state_digest || staged.candidate_id !== validationInspection.seed.candidate_id || staged.candidate_digest !== validationInspection.seed.candidate_digest) throw new Error("staged Candidate/validation lineage mismatch");
	const stale = !sameActive(current, options.expectedActive) || staged.expected_base_state_digest !== current.state_digest || validationInspection.seed.base_state_digest !== staged.expected_base_state_digest;
	const priorVersion = store.versions.find((version) => version.state_digest === current.state_digest);
	if (!priorVersion) throw new Error("active accepted State version is missing");
	const validation = validationInspection.validation;
	if (stale || validationInspection.recomputed_decision.result === "reject") {
		const reason = stale ? "stale_base" : validationInspection.recomputed_decision.reason;
		const decision = buildDecision({ schema_version: 1, decision_sequence: nextDecisionSequence(store), kind: "rejection", project_id: options.projectId, result: "rejected", reason, candidate_id: staged.candidate_id, candidate_digest: staged.candidate_digest, staged_state_digest: staged.state_digest, validation_id: validation.validation_id, validation_digest: validation.validation_digest, validation_ref: structuredClone(options.validationRef), prior_active: current, next_active: current, rollback_target_digest: null });
		persistDecision(options.stateRoot, decision);
		const reopened = await requireValidStore({ stateRoot: options.stateRoot, projectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		return { decision, active: reopened.active, version: null };
	}
	const nextVersionNumber = Math.max(...store.versions.map((version) => version.state_version)) + 1;
	const version = await materializeAcceptedVersion({ root: options.stateRoot, stagedStateRoot: options.stagedStateRoot, staged, prior: priorVersion, nextVersion: nextVersionNumber });
	const nextActive: ActiveStateIdentityV3 = { binding_revision: current.binding_revision + 1, state_version: version.state_version, state_digest: version.state_digest };
	const decision = buildDecision({ schema_version: 1, decision_sequence: nextDecisionSequence(store), kind: "promotion", project_id: options.projectId, result: "promoted", reason: validationInspection.recomputed_decision.reason, candidate_id: staged.candidate_id, candidate_digest: staged.candidate_digest, staged_state_digest: staged.state_digest, validation_id: validation.validation_id, validation_digest: validation.validation_digest, validation_ref: structuredClone(options.validationRef), prior_active: current, next_active: nextActive, rollback_target_digest: null });
	persistDecision(options.stateRoot, decision);
	const active = buildPointer({ schema_version: 1, project_id: options.projectId, ...nextActive, decision_id: decision.decision_id });
	atomicWritePointer(options.stateRoot, active);
	const reopened = await requireValidStore({ stateRoot: options.stateRoot, projectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	return { decision, active: reopened.active, version };
}

export async function rollbackActiveStateV3(options: { stateRoot: string; projectId: string; targetStateDigest: string; expectedActive: ActiveStateIdentityV3; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ decision: StateDecisionV3; active: ActiveStatePointerV3 }> {
	const store = await requireValidStore({ stateRoot: options.stateRoot, projectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	const current = activeIdentity(store.active);
	if (!sameActive(current, options.expectedActive)) throw new Error("stale rollback active pointer rejected");
	const target = store.versions.find((version) => version.state_digest === options.targetStateDigest);
	if (!target || target.state_digest === current.state_digest) throw new Error("rollback target must be an earlier accepted State version");
	const nextActive: ActiveStateIdentityV3 = { binding_revision: current.binding_revision + 1, state_version: target.state_version, state_digest: target.state_digest };
	const decision = buildDecision({ schema_version: 1, decision_sequence: nextDecisionSequence(store), kind: "rollback", project_id: options.projectId, result: "rolled_back", reason: "operator_rollback", candidate_id: null, candidate_digest: null, staged_state_digest: null, validation_id: null, validation_digest: null, validation_ref: null, prior_active: current, next_active: nextActive, rollback_target_digest: target.state_digest });
	persistDecision(options.stateRoot, decision);
	const active = buildPointer({ schema_version: 1, project_id: options.projectId, ...nextActive, decision_id: decision.decision_id });
	atomicWritePointer(options.stateRoot, active);
	const reopened = await requireValidStore({ stateRoot: options.stateRoot, projectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	return { decision, active: reopened.active };
}

export async function inspectGoal2LineageV3(options: { stateRoot: string; projectId: string; validationRunRoots: Record<string, string>; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<StateStoreInspectionV3> {
	const inspected = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	const errors = [...inspected.errors];
	for (const decision of inspected.decisions) {
		if (!decision.validation_id) continue;
		const runRoot = options.validationRunRoots[decision.validation_id];
		if (!runRoot || !decision.validation_ref || validateArtifactRef(runRoot, decision.validation_ref).length !== 0) { errors.push(`${decision.decision_id}: validation lineage Artifact missing`); continue; }
		const validation = inspectValidationV3(runRoot);
		if (!validation.integrity_valid || !validation.validation || !validation.seed || !validation.recomputed_decision) { errors.push(`${decision.decision_id}: validation lineage invalid`); continue; }
		if (validation.validation.validation_id !== decision.validation_id || validation.validation.validation_digest !== decision.validation_digest || validation.seed.candidate_id !== decision.candidate_id || validation.seed.candidate_digest !== decision.candidate_digest || validation.seed.candidate_state_digest !== decision.staged_state_digest) errors.push(`${decision.decision_id}: Candidate/validation/decision lineage mismatch`);
		if (decision.reason !== "stale_base" && (decision.result === "promoted") !== (validation.recomputed_decision.result === "promote")) errors.push(`${decision.decision_id}: decision result differs from independent validation`);
	}
	return { ...inspected, integrity_valid: errors.length === 0, errors };
}
