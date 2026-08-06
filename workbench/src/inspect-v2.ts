import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { ArtifactRefV0B, VerifierResultV0B } from "./contracts/v0b-types.ts";
import {
	V2A_ATTEMPT_BUDGET_CAPS,
	V2A_GROUP_BUDGET_CAPS,
	V2A_MODEL_ID,
	V2A_PINNED_PI_COMMIT,
	V2A_POLICY_ID,
	V2A_SKILL_ID,
	V2A_STRATEGY_ORDER,
	V2A_TASK_ID,
	V2A_TOOL_PROFILE_ID,
	V2A_VERIFIER_ID,
	V2A_WORKBENCH_REVISION,
	V2A_WORKBENCH_SOURCE_SCOPE,
	type CandidateHardGatesV2A,
	type CandidatePathV2A,
	type InspectResultV2A,
	type RecoverySeedV2A,
	type RunManifestV2A,
	type RunTerminalV2A,
	type SelectionDecisionV2A,
	type SourceInventoryV2A,
	type WorkspaceSnapshotV2A,
} from "./contracts/v2-types.ts";
import { readJsonArtifact, resolveRunRelative, validateArtifactRef, validateRunRootBoundary } from "./evidence/artifacts.ts";
import { loadCandidateTaskPackV1 } from "./experiment/task-pack-v1.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest, treeInventory } from "./hash.ts";
import { SYSTEM_PROMPT } from "./prompts/base.ts";
import { selectCandidateV2A } from "./recovery/selector-v2.ts";
import { expectedSkillIdentityV1 } from "./skill/runtime-v1.ts";

const FORBIDDEN_EVIDENCE = /(?:(?:bearer|api[_-]?key|authorization)\s*[:=]\s*[A-Za-z0-9._-]{8,}|"(?:reasoning(?:_content)?|thinking|thoughtsignature|signature)"\s*:)/i;
const FORBIDDEN_WORKSPACE = /(?:bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i;

interface JournalEventV2A {
	seq?: unknown;
	type?: unknown;
	data?: Record<string, unknown>;
}

interface ParsedSessionV2A {
	rawBytes: Buffer;
	recordBytes: Buffer[];
	lines: Array<Record<string, unknown>>;
	header: Record<string, unknown>;
	entries: Array<Record<string, unknown>>;
}

interface RawUsageV2A {
	providerDispatches: number;
	toolCalls: number;
	tokens: number;
	activeExecutionTimeMs: number;
	settled: boolean;
}

interface ValidatedVerifierV2A {
	valid: boolean;
	status: VerifierResultV0B["status"] | null;
	passed: boolean;
}

interface ValidatedSnapshotV2A {
	valid: boolean;
	snapshot: WorkspaceSnapshotV2A | null;
	fileIdentities: string[];
}

function portable(path: string): string {
	return path.split(sep).join("/");
}

function canonicalWindowsPath(path: string): string {
	const canonical = resolve(path).replaceAll("/", "\\");
	return process.platform === "win32" ? canonical.toLowerCase() : canonical;
}

function sameRef(left: unknown, right: unknown): boolean {
	return stableJson(left) === stableJson(right);
}

function addArtifactErrors(errors: string[], runRoot: string, label: string, ref: unknown): boolean {
	const artifactErrors = validateArtifactRef(runRoot, ref);
	for (const error of artifactErrors) errors.push(`${label}: ${error}`);
	return artifactErrors.length === 0;
}

function safeReadJson<T>(runRoot: string, path: string, errors: string[]): T | null {
	try {
		return readJsonArtifact<T>(runRoot, path);
	} catch (error) {
		errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}

function scanEvidenceFiles(runRoot: string, errors: string[]): void {
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const path = resolve(directory, entry.name);
			const relativePath = portable(relative(runRoot, path));
			const stats = lstatSync(path);
			if (stats.isSymbolicLink()) {
				errors.push(`evidence link/reparse entry rejected: ${relativePath}`);
				continue;
			}
			if (entry.isDirectory()) {
				if (!relativePath.endsWith("/workspace") && !relativePath.includes("/workspace/")) visit(path);
				continue;
			}
			if (!entry.isFile()) {
				errors.push(`unsupported evidence entry rejected: ${relativePath}`);
				continue;
			}
			if (FORBIDDEN_EVIDENCE.test(readFileSync(path, "utf8"))) errors.push(`secret/reasoning scan rejected: ${relativePath}`);
		}
	};
	visit(runRoot);
}

function readJournal(runRoot: string, terminal: RunTerminalV2A, errors: string[]): JournalEventV2A[] {
	const path = resolve(runRoot, "journal.jsonl");
	if (!existsSync(path)) {
		errors.push("journal is missing");
		return [];
	}
	let events: JournalEventV2A[];
	try {
		events = readFileSync(path, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JournalEventV2A);
	} catch {
		errors.push("journal parse failed");
		return [];
	}
	if (events.some((event, index) => event.seq !== index + 1)) errors.push("journal sequence is non-contiguous");
	const types = events.map((event) => event.type);
	for (const required of ["run_started", "primary_started", "primary_settled", "primary_verifier_completed", "run_terminal"]) {
		if (types.filter((type) => type === required).length !== 1) errors.push(`journal critical event count invalid: ${required}`);
	}
	if (terminal.outcome === "initial_pass") {
		if (types.some((type) => ["seed_frozen", "candidate_workspace_initial_frozen", "candidate_started", "candidate_terminal", "selection_written"].includes(String(type)))) {
			errors.push("initial-pass journal contains recovery events");
		}
		return events;
	}
	for (const [type, count] of [
		["seed_frozen", 1],
		["candidate_workspace_initial_frozen", 2],
		["candidate_started", 2],
		["candidate_terminal", 2],
		["selection_written", 1],
	] as const) {
		if (types.filter((candidate) => candidate === type).length !== count) errors.push(`journal event count invalid: ${type}`);
	}
	const seedIndex = types.indexOf("seed_frozen");
	const freezeIndexes = types.map((type, index) => type === "candidate_workspace_initial_frozen" ? index : -1).filter((index) => index >= 0);
	const firstCandidateIndex = types.indexOf("candidate_started");
	const selectionIndex = types.indexOf("selection_written");
	const lastCandidateTerminalIndex = types.lastIndexOf("candidate_terminal");
	if (seedIndex < 0 || firstCandidateIndex < 0 || seedIndex >= firstCandidateIndex) errors.push("Seed was not frozen before every Candidate");
	if (freezeIndexes.length !== 2 || freezeIndexes.some((index) => index <= seedIndex || index >= firstCandidateIndex)) {
		errors.push("Candidate initial Workspace Artifacts were not frozen after Seed and before execution");
	}
	if (selectionIndex <= lastCandidateTerminalIndex) errors.push("Selection occurred before both Candidate terminals");
	const startedIds = events.filter((event) => event.type === "candidate_started").map((event) => event.data?.candidate_path_id);
	const terminalIds = events.filter((event) => event.type === "candidate_terminal").map((event) => event.data?.candidate_path_id);
	const frozenIds = events.filter((event) => event.type === "candidate_workspace_initial_frozen").map((event) => event.data?.candidate_path_id);
	if (
		new Set(startedIds).size !== 2 ||
		stableJson([...startedIds].sort()) !== stableJson([...terminalIds].sort()) ||
		stableJson([...startedIds].sort()) !== stableJson([...frozenIds].sort())
	) {
		errors.push("Candidate frozen/start/terminal identity mismatch");
	}
	return events;
}

function eventOf(events: readonly JournalEventV2A[], type: string, identity?: string): JournalEventV2A | null {
	return events.find((event) => event.type === type && (identity === undefined || event.data?.candidate_path_id === identity)) ?? null;
}

function validInventory(inventory: unknown, digest: unknown, label: string, errors: string[]): inventory is SourceInventoryV2A["inventory"] {
	if (!Array.isArray(inventory) || inventory.some((entry) => {
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) return true;
		const item = entry as Record<string, unknown>;
		return typeof item.path !== "string" || item.path.length === 0 || item.path.includes("\\") || isAbsolute(item.path) || item.path.split("/").includes("..") ||
			!Number.isSafeInteger(item.bytes) || Number(item.bytes) < 0 || !/^[a-f0-9]{64}$/.test(String(item.sha256));
	})) {
		errors.push(`${label}: inventory envelope invalid`);
		return false;
	}
	const paths = inventory.map((entry) => (entry as { path: string }).path);
	if (new Set(paths).size !== paths.length || stableJson(paths) !== stableJson([...paths].sort((a, b) => a.localeCompare(b)))) {
		errors.push(`${label}: inventory path order/uniqueness invalid`);
		return false;
	}
	if (digestObject(inventory) !== digest) {
		errors.push(`${label}: inventory digest mismatch`);
		return false;
	}
	return true;
}

function validateSourceAnchor(projectRoot: string, runRoot: string, manifest: RunManifestV2A, errors: string[]): SourceInventoryV2A | null {
	const refValid = addArtifactErrors(errors, runRoot, "Workbench source inventory", manifest.workbench_source_ref);
	if (manifest.workbench_source_ref.path !== "config/workbench-source.json") errors.push("Workbench source inventory path mismatch");
	if (!refValid) return null;
	const source = safeReadJson<SourceInventoryV2A>(runRoot, manifest.workbench_source_ref.path, errors);
	if (!source) return null;
	if (source.schema_version !== "v2a-source-inventory-v1" || source.scope !== V2A_WORKBENCH_SOURCE_SCOPE || source.root !== V2A_WORKBENCH_SOURCE_SCOPE) {
		errors.push("Workbench source inventory identity mismatch");
	}
	const inventoryValid = validInventory(source.inventory, source.digest, "Workbench source inventory", errors);
	if (manifest.workbench_source_digest !== source.digest) errors.push("Manifest Workbench source digest mismatch");
	try {
		const current = treeInventory(resolve(projectRoot, V2A_WORKBENCH_SOURCE_SCOPE));
		if (!inventoryValid || stableJson(current) !== stableJson(source.inventory) || digestObject(current) !== manifest.workbench_source_digest) {
			errors.push("Workbench source evidence is stale or does not match current projectRoot");
		}
	} catch (error) {
		errors.push(`Workbench source recomputation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	return source;
}

function validateManifest(
	projectRoot: string,
	runRoot: string,
	terminal: RunTerminalV2A,
	manifest: RunManifestV2A,
	errors: string[],
	expectedTaskId: string,
	expectedRealExecutionAuthorized: boolean,
): void {
	const { manifest_id: declaredManifestId, ...manifestBody } = manifest;
	if (digestObject(manifestBody) !== declaredManifestId || terminal.manifest_id !== declaredManifestId) errors.push("Manifest identity mismatch");
	if (
		manifest.schema_version !== "v2a-run-manifest-v2" ||
		manifest.task_id !== expectedTaskId || manifest.policy_id !== V2A_POLICY_ID || manifest.model_id !== V2A_MODEL_ID ||
		manifest.thinking_level !== "off" || manifest.tool_profile_id !== V2A_TOOL_PROFILE_ID || manifest.skill_id !== V2A_SKILL_ID ||
		manifest.pi_commit !== V2A_PINNED_PI_COMMIT ||
		manifest.workbench_revision !== V2A_WORKBENCH_REVISION || manifest.workbench_source_scope !== V2A_WORKBENCH_SOURCE_SCOPE ||
		manifest.real_execution_authorized !== expectedRealExecutionAuthorized || manifest.recovery_candidate_count_on_valid_failure !== 2 ||
		stableJson(manifest.strategy_ids) !== stableJson(V2A_STRATEGY_ORDER) ||
		stableJson(manifest.per_attempt_budget) !== stableJson(V2A_ATTEMPT_BUDGET_CAPS) ||
		stableJson(manifest.per_group_budget) !== stableJson(V2A_GROUP_BUDGET_CAPS)
	) {
		errors.push("Manifest frozen constants mismatch");
	}
	for (const [label, ref, path] of [
		["Manifest instruction", manifest.task_instruction_ref, "config/instruction.md"],
		["Manifest Skill", manifest.skill_ref, "config/skill.md"],
		["Manifest Verifier", manifest.verifier_ref, "config/verifier.mjs"],
	] as const) {
		addArtifactErrors(errors, runRoot, label, ref);
		if (ref.path !== path) errors.push(`${label}: frozen path mismatch`);
	}
	if (
		manifest.task_instruction_sha256 !== manifest.task_instruction_ref.sha256 ||
		manifest.skill_sha256 !== manifest.skill_ref.sha256 ||
		manifest.verifier_sha256 !== manifest.verifier_ref.sha256 ||
		manifest.base_prompt_sha256 !== sha256(SYSTEM_PROMPT)
	) {
		errors.push("Manifest frozen Artifact digest mismatch");
	}
	try {
		const task = loadCandidateTaskPackV1(projectRoot).find((candidate) => candidate.task_id === expectedTaskId);
		if (!task) throw new Error("frozen task missing");
		const toolDigest = digestObject({ tool_profile_id: task.tool_profile_id, command_descriptors: task.command_descriptors });
		const skill = expectedSkillIdentityV1(projectRoot);
		if (
			task.tool_profile_id !== V2A_TOOL_PROFILE_ID || task.external_verifier_id !== manifest.verifier_id ||
			task.instruction_sha256 !== manifest.task_instruction_sha256 || task.external_verifier_sha256 !== manifest.verifier_sha256 ||
			skill.source_sha256 !== manifest.skill_sha256 || toolDigest !== manifest.tool_profile_digest
		) {
			errors.push("Manifest current frozen Task/Skill/Tool/Verifier identity mismatch");
		}
	} catch (error) {
		errors.push(`Manifest frozen input validation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	validateSourceAnchor(projectRoot, runRoot, manifest, errors);
}

function parseSession(runRoot: string, ref: ArtifactRefV0B, label: string, errors: string[]): ParsedSessionV2A | null {
	if (!addArtifactErrors(errors, runRoot, label, ref)) return null;
	try {
		const rawBytes = readFileSync(resolveRunRelative(runRoot, ref.path));
		if (rawBytes.length === 0) throw new Error("Session is empty");
		if (rawBytes.at(-1) !== 0x0a) throw new Error("Session must end with the producer LF terminator");
		const recordBytes: Buffer[] = [];
		let recordStart = 0;
		for (let index = 0; index < rawBytes.length; index++) {
			if (rawBytes[index] !== 0x0a) continue;
			const record = rawBytes.subarray(recordStart, index);
			if (record.length === 0) throw new Error(`Session contains a blank record at line ${recordBytes.length + 1}`);
			if (record.at(-1) === 0x0d) throw new Error(`Session record ${recordBytes.length + 1} uses unsupported CRLF bytes`);
			recordBytes.push(record);
			recordStart = index + 1;
		}
		const lines = recordBytes.map((record) => JSON.parse(record.toString("utf8")) as Record<string, unknown>);
		const header = lines[0];
		if (!header || header.type !== "session" || typeof header.id !== "string" || typeof header.cwd !== "string") throw new Error("Session header invalid");
		return { rawBytes, recordBytes, lines, header, entries: lines.slice(1) };
	} catch (error) {
		errors.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
		return null;
	}
}

function equalRecordBytes(left: readonly Buffer[], right: readonly Buffer[]): boolean {
	return left.length === right.length && left.every((record, index) => record.equals(right[index]!));
}

function rawUsage(entries: readonly Record<string, unknown>[]): RawUsageV2A {
	let providerDispatches = 0;
	let toolCalls = 0;
	let tokens = 0;
	const timestamps: number[] = [];
	for (const entry of entries) {
		if (typeof entry.timestamp === "string") {
			const value = Date.parse(entry.timestamp);
			if (Number.isFinite(value)) timestamps.push(value);
		}
		const message = entry.message as Record<string, unknown> | undefined;
		if (message?.role !== "assistant") continue;
		if (message.stopReason !== "error") providerDispatches++;
		const content = Array.isArray(message.content) ? message.content as Array<Record<string, unknown>> : [];
		toolCalls += content.filter((block) => block.type === "toolCall").length;
		const usage = message.usage as Record<string, unknown> | undefined;
		for (const key of ["input", "output", "cacheRead", "cacheWrite"] as const) {
			const value = usage?.[key];
			if (typeof value === "number" && Number.isFinite(value)) tokens += value;
		}
	}
	const lastMessage = (entries.at(-1)?.message ?? null) as Record<string, unknown> | null;
	return {
		providerDispatches,
		toolCalls,
		tokens,
		activeExecutionTimeMs: timestamps.length > 1 ? Math.max(0, timestamps.at(-1)! - timestamps[0]!) : 0,
		settled: lastMessage?.role === "assistant" && lastMessage.stopReason === "stop",
	};
}

function parseWireOutput(output: string): { verifier_id?: unknown; status?: unknown; summary?: unknown; failed_checks?: unknown } | null {
	try {
		const last = output.replace(/^\[(?:stdout|stderr)\] /gm, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).at(-1);
		if (!last) return null;
		const value = JSON.parse(last) as unknown;
		return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
	} catch {
		return null;
	}
}

function validateVerifier(
	runRoot: string,
	manifest: RunManifestV2A,
	ref: ArtifactRefV0B,
	expectedAttemptId: string,
	expectedPrefix: "primary" | "candidates/a" | "candidates/b",
	errors: string[],
): ValidatedVerifierV2A {
	const start = errors.length;
	if (!addArtifactErrors(errors, runRoot, `${expectedPrefix} VerifierResult`, ref)) return { valid: false, status: null, passed: false };
	if (ref.path !== `${expectedPrefix}/verifier-result.json`) errors.push(`${expectedPrefix}: VerifierResult path mismatch`);
	const result = safeReadJson<VerifierResultV0B>(runRoot, ref.path, errors);
	if (!result) return { valid: false, status: null, passed: false };
	if (
		result.schema_version !== 1 || result.verifier_id !== manifest.verifier_id || result.verifier_sha256 !== manifest.verifier_sha256 ||
		result.attempt_id !== expectedAttemptId || result.execution?.source_sha256 !== manifest.verifier_sha256 ||
		result.execution?.source_digest_verified !== true || !sameRef(result.execution?.source_snapshot_ref, manifest.verifier_ref)
	) {
		errors.push(`${expectedPrefix}: Verifier identity/source lineage mismatch`);
	}
	addArtifactErrors(errors, runRoot, `${expectedPrefix} Verifier source`, result.execution?.source_snapshot_ref);
	const outputValid = addArtifactErrors(errors, runRoot, `${expectedPrefix} Verifier full output`, result.full_output_ref);
	if (
		result.full_output_ref?.path !== `${expectedPrefix}/verifier-output.txt` || result.full_output_ref?.truncated !== false ||
		result.full_output_sha256 !== result.full_output_ref?.sha256
	) {
		errors.push(`${expectedPrefix}: Verifier full-output lineage mismatch`);
	}
	if (
		result.execution?.cwd_identity !== "project_root" || result.execution?.shell !== false ||
		result.execution?.timeout_ms !== 15_000 || result.execution?.output_limit_bytes !== 32_768 ||
		stableJson(result.execution?.environment_allowlist_keys) !== stableJson(["NO_COLOR", "V1_WORKSPACE"])
	) {
		errors.push(`${expectedPrefix}: Verifier execution contract mismatch`);
	}
	let derivedStatus: VerifierResultV0B["status"] | null = null;
	if (outputValid) {
		const output = readFileSync(resolveRunRelative(runRoot, result.full_output_ref.path), "utf8");
		const wire = parseWireOutput(output);
		if (wire?.verifier_id === manifest.verifier_id && (wire.status === "passed" || wire.status === "failed") && typeof wire.summary === "string") {
			derivedStatus = wire.status;
			if (wire.summary !== result.summary || stableJson(wire.failed_checks ?? null) !== stableJson(result.public_failed_checks ?? null)) {
				errors.push(`${expectedPrefix}: Verifier raw output/result projection mismatch`);
			}
		} else {
			errors.push(`${expectedPrefix}: Verifier raw output contract invalid`);
		}
	}
	if (
		derivedStatus === null || result.status !== derivedStatus || result.timed_out !== false || result.invalid_reason !== null ||
		(derivedStatus === "passed" ? result.exit_code !== 0 : result.exit_code !== 1)
	) {
		errors.push(`${expectedPrefix}: Verifier exit/timeout/status semantics invalid`);
	}
	return { valid: errors.length === start, status: derivedStatus, passed: derivedStatus === "passed" && errors.length === start };
}

function validateWorkspaceSnapshot(
	runRoot: string,
	ref: ArtifactRefV0B,
	expectedPath: string,
	expectedWorkspaceRoot: string,
	expectedWorkspaceId: string,
	label: string,
	errors: string[],
	compareCurrentBytes: boolean,
): ValidatedSnapshotV2A {
	const start = errors.length;
	if (!addArtifactErrors(errors, runRoot, label, ref)) return { valid: false, snapshot: null, fileIdentities: [] };
	if (ref.path !== expectedPath) errors.push(`${label}: Artifact path mismatch`);
	const snapshot = safeReadJson<WorkspaceSnapshotV2A>(runRoot, ref.path, errors);
	if (!snapshot) return { valid: false, snapshot: null, fileIdentities: [] };
	if (
		snapshot.schema_version !== "v2a-workspace-snapshot-v2" || snapshot.workspace_id !== expectedWorkspaceId ||
		snapshot.root !== portable(relative(runRoot, expectedWorkspaceRoot)) ||
		stableJson(snapshot.link_policy) !== stableJson({ ordinary_files_only: true, nlink_one_required: true, cross_workspace_identity_unique_required: true })
	) {
		errors.push(`${label}: snapshot identity/path/link policy mismatch`);
	}
	const inventoryValid = validInventory(snapshot.inventory, snapshot.digest, label, errors);
	if (
		!Array.isArray(snapshot.file_links) || snapshot.file_links.length !== snapshot.inventory.length ||
		snapshot.file_links.some((link, index) => link.path !== snapshot.inventory[index]?.path || link.nlink !== 1 || typeof link.file_identity !== "string" || link.file_identity.length === 0)
	) {
		errors.push(`${label}: snapshot file-link inventory mismatch`);
	}
	const identities = Array.isArray(snapshot.file_links) ? snapshot.file_links.map((link) => link.file_identity) : [];
	if (new Set(identities).size !== identities.length) errors.push(`${label}: duplicate file identity within Workspace`);
	if (compareCurrentBytes) {
		try {
			const current = treeInventory(expectedWorkspaceRoot);
			if (!inventoryValid || stableJson(current) !== stableJson(snapshot.inventory) || treeDigest(expectedWorkspaceRoot) !== snapshot.digest) {
				errors.push(`${label}: current Workspace bytes differ from snapshot`);
			}
		} catch (error) {
			errors.push(`${label}: current Workspace scan failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	return { valid: errors.length === start, snapshot, fileIdentities: identities };
}

function validateWorkspaceIsolation(runRoot: string, errors: string[]): void {
	const roots = ["seed/workspace", "candidates/a/workspace", "candidates/b/workspace"].map((path) => resolve(runRoot, path));
	const identities = new Set<string>();
	for (const root of roots) {
		if (!existsSync(root)) {
			errors.push(`workspace missing: ${portable(relative(runRoot, root))}`);
			continue;
		}
		try {
			for (const file of treeInventory(root)) {
				const stats = lstatSync(resolve(root, file.path));
				if (stats.nlink !== 1) errors.push(`workspace hardlink rejected: ${file.path}`);
				const identity = `${stats.dev}:${stats.ino}`;
				if (identities.has(identity)) errors.push(`workspace cross-path identity sharing rejected: ${file.path}`);
				identities.add(identity);
			}
		} catch (error) {
			errors.push(`workspace isolation scan failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}

function changedSemanticBytes(sourceRoot: string, finalRoot: string, writablePaths: readonly string[]): number {
	let total = 0;
	for (const path of writablePaths) {
		const source = resolve(sourceRoot, path);
		const target = resolve(finalRoot, path);
		const sourceBytes = existsSync(source) ? readFileSync(source) : Buffer.alloc(0);
		const targetBytes = existsSync(target) ? readFileSync(target) : Buffer.alloc(0);
		if (!sourceBytes.equals(targetBytes)) total += targetBytes.length;
	}
	return total;
}

function protectedWorkspaceValid(runRoot: string, suffix: "a" | "b", protectedPaths: readonly string[], errors: string[]): boolean {
	try {
		const finalRoot = resolve(runRoot, `candidates/${suffix}/workspace`);
		let valid = true;
		for (const path of protectedPaths) {
			if (fileSha256(resolve(runRoot, "seed/workspace", path)) !== fileSha256(resolve(finalRoot, path))) valid = false;
		}
		for (const file of treeInventory(finalRoot)) {
			if (FORBIDDEN_WORKSPACE.test(readFileSync(resolve(finalRoot, file.path), "utf8"))) valid = false;
		}
		return valid;
	} catch (error) {
		errors.push(`Candidate ${suffix} protected/secret scan failed: ${error instanceof Error ? error.message : String(error)}`);
		return false;
	}
}

function terminalReasonFromRaw(usage: RawUsageV2A): CandidatePathV2A["terminal_reason"] {
	if (usage.settled) return "settled";
	if (usage.providerDispatches >= V2A_ATTEMPT_BUDGET_CAPS.faux_provider_dispatches_max || usage.toolCalls >= V2A_ATTEMPT_BUDGET_CAPS.tool_calls_max) return "budget_stopped";
	return "runtime_invalid";
}

function compareCandidateSummary(candidate: CandidatePathV2A, derived: CandidatePathV2A, errors: string[]): void {
	for (const key of [
		"settled", "terminal_reason", "verifier_status", "evidence_valid", "budget_within_limits", "allowed_semantic_diff_size",
		"parent_history_entry_count", "initial_workspace_digest", "final_workspace_digest",
	] as const) {
		if (candidate[key] !== derived[key]) errors.push(`${candidate.candidate_path_id}: derived ${key} mismatch`);
	}
	if (stableJson(candidate.budget_caps) !== stableJson(V2A_ATTEMPT_BUDGET_CAPS)) errors.push(`${candidate.candidate_path_id}: frozen Candidate budget caps mismatch`);
	if (stableJson(candidate.budget_usage) !== stableJson(derived.budget_usage)) errors.push(`${candidate.candidate_path_id}: raw-derived budget usage mismatch`);
	if (stableJson(candidate.hard_gates) !== stableJson(derived.hard_gates)) errors.push(`${candidate.candidate_path_id}: independently derived Hard Gates mismatch`);
}

function inspectCandidate(options: {
	runRoot: string;
	manifest: RunManifestV2A;
	seed: RecoverySeedV2A;
	candidate: CandidatePathV2A;
	suffix: "a" | "b";
	parentSession: ParsedSessionV2A;
	journal: readonly JournalEventV2A[];
	protectedPaths: readonly string[];
	writablePaths: readonly string[];
	seedSnapshot: ValidatedSnapshotV2A;
	errors: string[];
}): { derived: CandidatePathV2A; initial: ValidatedSnapshotV2A; sessionId: string | null } {
	const { runRoot, manifest, seed, candidate, suffix, parentSession, journal, protectedPaths, writablePaths, seedSnapshot, errors } = options;
	const expectedStrategy = suffix === "a" ? V2A_STRATEGY_ORDER[0] : V2A_STRATEGY_ORDER[1];
	const candidateStartErrors = errors.length;
	if (
		candidate.schema_version !== "v2a-candidate-path-v2" || candidate.recovery_group_id !== seed.recovery_group_id ||
		candidate.recovery_seed_id !== seed.recovery_seed_id || candidate.parent_attempt_id !== seed.parent_attempt_id ||
		candidate.strategy_id !== expectedStrategy
	) {
		errors.push(`${candidate.candidate_path_id}: Candidate/Seed/strategy identity mismatch`);
	}
	for (const [label, ref] of [
		["Session", candidate.session_ref],
		["pre-run Session", candidate.session_snapshot_before_run_ref],
		["initial Workspace", candidate.initial_workspace_ref],
		["final Workspace", candidate.final_workspace_ref],
		["Verifier", candidate.verifier_result_ref],
	] as const) addArtifactErrors(errors, runRoot, `${candidate.candidate_path_id} ${label}`, ref);
	if (!sameRef(candidate.workspace_ref, candidate.initial_workspace_ref)) errors.push(`${candidate.candidate_path_id}: Workspace ref is not immutable initial snapshot`);
	if (candidate.session_digest_before_run !== candidate.session_snapshot_before_run_ref.sha256) errors.push(`${candidate.candidate_path_id}: pre-run Session digest mismatch`);
	const workspaceRoot = resolve(runRoot, `candidates/${suffix}/workspace`);
	const initial = validateWorkspaceSnapshot(
		runRoot,
		candidate.initial_workspace_ref,
		`candidates/${suffix}/workspace-initial.json`,
		workspaceRoot,
		`${candidate.candidate_path_id}-workspace`,
		`${candidate.candidate_path_id} initial Workspace`,
		errors,
		false,
	);
	const final = validateWorkspaceSnapshot(
		runRoot,
		candidate.final_workspace_ref,
		`candidates/${suffix}/workspace-final.json`,
		workspaceRoot,
		`${candidate.candidate_path_id}-workspace`,
		`${candidate.candidate_path_id} final Workspace`,
		errors,
		true,
	);
	const initialMatchesSeed = Boolean(
		initial.valid && seedSnapshot.valid && initial.snapshot && seedSnapshot.snapshot &&
		stableJson(initial.snapshot.inventory) === stableJson(seedSnapshot.snapshot.inventory) &&
		initial.snapshot.digest === seedSnapshot.snapshot.digest,
	);
	if (!initialMatchesSeed) errors.push(`${candidate.candidate_path_id}: immutable initial Workspace differs from Seed`);
	const before = parseSession(runRoot, candidate.session_snapshot_before_run_ref, `${candidate.candidate_path_id} pre-run Session`, errors);
	const finalSession = parseSession(runRoot, candidate.session_ref, `${candidate.candidate_path_id} final Session`, errors);
	let sessionValid = Boolean(before && finalSession);
	if (before && finalSession) {
		if (canonicalWindowsPath(String(before.header.cwd)) !== canonicalWindowsPath(workspaceRoot)) {
			errors.push(`${candidate.candidate_path_id}: pre-run Session cwd mismatch`);
			sessionValid = false;
		}
		if (
			finalSession.rawBytes.length <= before.rawBytes.length ||
			!finalSession.rawBytes.subarray(0, before.rawBytes.length).equals(before.rawBytes)
		) {
			errors.push(`${candidate.candidate_path_id}: final Session raw byte prefix does not exactly extend the verified pre-run Session`);
			sessionValid = false;
		}
		if (suffix === "a") {
			const expectedParent = resolveRunRelative(runRoot, seed.parent_session_ref.path);
			if (typeof before.header.parentSession !== "string" || canonicalWindowsPath(before.header.parentSession) !== canonicalWindowsPath(expectedParent)) {
				errors.push(`${candidate.candidate_path_id}: canonical parent Session path mismatch`);
				sessionValid = false;
			}
			if (!equalRecordBytes(before.recordBytes.slice(1), parentSession.recordBytes.slice(1))) {
				errors.push(`${candidate.candidate_path_id}: parent Session entry bytes mismatch`);
				sessionValid = false;
			}
		} else if ("parentSession" in before.header || before.entries.length !== 0) {
			errors.push(`${candidate.candidate_path_id}: fresh Session retained parent lineage/history`);
			sessionValid = false;
		}
	}
	const attemptEntries = before && finalSession ? finalSession.entries.slice(before.entries.length) : [];
	const usage = rawUsage(attemptEntries);
	const terminalReason = terminalReasonFromRaw(usage);
	const verifier = validateVerifier(runRoot, manifest, candidate.verifier_result_ref, candidate.attempt_id, `candidates/${suffix}`, errors);
	const budgetValid =
		usage.providerDispatches <= V2A_ATTEMPT_BUDGET_CAPS.faux_provider_dispatches_max &&
		usage.toolCalls <= V2A_ATTEMPT_BUDGET_CAPS.tool_calls_max &&
		terminalReason !== "budget_stopped";
	const protectedValid = protectedWorkspaceValid(runRoot, suffix, protectedPaths, errors);
	const startEvent = eventOf(journal, "candidate_started", candidate.candidate_path_id);
	const frozenEvent = eventOf(journal, "candidate_workspace_initial_frozen", candidate.candidate_path_id);
	const terminalEvent = eventOf(journal, "candidate_terminal", candidate.candidate_path_id);
	if (
		!startEvent || !frozenEvent || !terminalEvent ||
		!sameRef(startEvent.data?.initial_workspace_ref, candidate.initial_workspace_ref) ||
		!sameRef(frozenEvent.data?.initial_workspace_ref, candidate.initial_workspace_ref) ||
		!sameRef(startEvent.data?.session_snapshot_before_run_ref, candidate.session_snapshot_before_run_ref) ||
		!sameRef(terminalEvent.data?.verifier_result_ref, candidate.verifier_result_ref) ||
		!sameRef(terminalEvent.data?.session_ref, candidate.session_ref) ||
		terminalEvent.data?.terminal_reason !== candidate.terminal_reason || terminalEvent.data?.verifier_status !== candidate.verifier_status
	) {
		errors.push(`${candidate.candidate_path_id}: Journal raw Artifact/terminal binding mismatch`);
	}
	const identityComplete = errors.length === candidateStartErrors;
	const lineageComplete = sessionValid && initial.valid && final.valid && verifier.valid;
	const evidenceValid = identityComplete && lineageComplete;
	const hardGates: CandidateHardGatesV2A = {
		identity_complete: evidenceValid,
		seed_and_isolation_valid: initialMatchesSeed,
		session_lineage_valid: sessionValid,
		unique_terminal_settled: usage.settled && journal.filter((event) => event.type === "candidate_terminal" && event.data?.candidate_path_id === candidate.candidate_path_id).length === 1,
		budget_valid: budgetValid,
		verifier_passed: verifier.passed,
		protected_secret_path_valid: protectedValid,
		lineage_complete: lineageComplete,
	};
	const derived: CandidatePathV2A = {
		...structuredClone(candidate),
		parent_history_entry_count: before?.entries.length ?? -1,
		initial_workspace_digest: initial.snapshot?.digest ?? "",
		settled: usage.settled,
		final_workspace_digest: final.snapshot?.digest ?? "",
		verifier_status: verifier.status ?? "invalid",
		evidence_valid: evidenceValid,
		budget_usage: {
			faux_provider_dispatches: usage.providerDispatches,
			tool_calls: usage.toolCalls,
			verifier_runs: verifier.valid ? 1 : 0,
			tokens: usage.tokens,
			active_execution_time_ms: usage.activeExecutionTimeMs,
			real_cost_usd: 0,
		},
		budget_caps: structuredClone(V2A_ATTEMPT_BUDGET_CAPS),
		budget_within_limits: budgetValid,
		terminal_reason: terminalReason,
		allowed_semantic_diff_size: changedSemanticBytes(resolve(runRoot, "seed/workspace"), workspaceRoot, writablePaths),
		hard_gates: hardGates,
	};
	compareCandidateSummary(candidate, derived, errors);
	return { derived, initial, sessionId: before && typeof before.header.id === "string" ? before.header.id : null };
}

export function inspectRunV2A(options: { projectRoot: string; runRoot: string; expectedTaskId?: string; expectedRealExecutionAuthorized?: boolean; expectedRealCallCounters?: { credential_reads: number; network_calls: number; external_provider_calls: number; real_model_calls: number } }): InspectResultV2A {
	const errors = validateRunRootBoundary(options.runRoot);
	const result = (terminal: RunTerminalV2A | null, seed: RecoverySeedV2A | null, candidates: CandidatePathV2A[], selection: SelectionDecisionV2A | null): InspectResultV2A => ({
		schema_version: "v2a-inspection-v2",
		run_id: terminal?.run_id ?? null,
		integrity_valid: errors.length === 0,
		terminal_valid: errors.length === 0,
		errors,
		terminal,
		recovery_seed: seed,
		candidates,
		selection,
	});
	const terminal = safeReadJson<RunTerminalV2A>(options.runRoot, "terminal.json", errors);
	const manifest = safeReadJson<RunManifestV2A>(options.runRoot, "config/manifest.json", errors);
	if (!terminal || !manifest) return result(terminal, null, [], null);
	if (terminal.schema_version !== "v2a-run-terminal-v2" || terminal.run_id !== manifest.run_id) errors.push("Run terminal/Manifest identity mismatch");
	if (stableJson(terminal.real_call_counters) !== stableJson(options.expectedRealCallCounters ?? { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 })) errors.push("real-access counters mismatch");
	validateManifest(options.projectRoot, options.runRoot, terminal, manifest, errors, options.expectedTaskId ?? V2A_TASK_ID, options.expectedRealExecutionAuthorized ?? false);
	const journal = readJournal(options.runRoot, terminal, errors);
	const runStartedEvent = eventOf(journal, "run_started");
	if (
		!runStartedEvent || !addArtifactErrors(errors, options.runRoot, "Journal Manifest", runStartedEvent.data?.manifest_ref) ||
		(runStartedEvent.data?.manifest_ref as ArtifactRefV0B | undefined)?.path !== "config/manifest.json" ||
		!sameRef(runStartedEvent.data?.workbench_source_ref, manifest.workbench_source_ref)
	) {
		errors.push("Journal Run-start Manifest/source binding mismatch");
	}
	scanEvidenceFiles(options.runRoot, errors);
	const primarySession = parseSession(options.runRoot, terminal.primary_session_ref, "primary Session", errors);
	const primaryUsage = primarySession ? rawUsage(primarySession.entries) : rawUsage([]);
	const primaryVerifier = validateVerifier(options.runRoot, manifest, terminal.primary_verifier_result_ref, terminal.primary_attempt_id, "primary", errors);
	const primarySettledEvent = eventOf(journal, "primary_settled");
	const primaryVerifierEvent = eventOf(journal, "primary_verifier_completed");
	if (
		!primarySession || !primaryUsage.settled || primaryUsage.providerDispatches > V2A_ATTEMPT_BUDGET_CAPS.faux_provider_dispatches_max ||
		primaryUsage.toolCalls > V2A_ATTEMPT_BUDGET_CAPS.tool_calls_max ||
		primarySettledEvent?.data?.provider_dispatches !== primaryUsage.providerDispatches || primarySettledEvent?.data?.tool_calls !== primaryUsage.toolCalls ||
		!sameRef(primarySettledEvent?.data?.session_ref, terminal.primary_session_ref) ||
		!sameRef(primaryVerifierEvent?.data?.verifier_result_ref, terminal.primary_verifier_result_ref) ||
		primaryVerifierEvent?.data?.status !== primaryVerifier.status || terminal.primary_verifier_status !== primaryVerifier.status
	) {
		errors.push("primary raw Session/Verifier/Journal budget or terminal semantics mismatch");
	}
	if (terminal.outcome === "initial_pass") {
		if (
			!primaryVerifier.valid || !primaryVerifier.passed || terminal.recovery_group_id !== null || terminal.recovery_seed_ref !== null ||
			terminal.candidate_refs.length !== 0 || terminal.selection_ref !== null || terminal.selected_candidate_id !== null
		) errors.push("initial-pass terminal is not derived from a valid raw primary pass");
		for (const path of ["seed/recovery-seed.json", "seed/failure-packet.json", "selection.json", "candidates"]) {
			if (existsSync(resolve(options.runRoot, path))) errors.push(`initial-pass Run created forbidden recovery object: ${path}`);
		}
		return result(terminal, null, [], null);
	}
	if (
		!primaryVerifier.valid || primaryVerifier.status !== "failed" || !terminal.recovery_group_id || !terminal.recovery_seed_ref ||
		!terminal.selection_ref || terminal.candidate_refs.length !== 2
	) {
		errors.push("recovery terminal is not derived from a valid raw primary failure");
		return result(terminal, null, [], null);
	}
	addArtifactErrors(errors, options.runRoot, "Recovery Seed", terminal.recovery_seed_ref);
	addArtifactErrors(errors, options.runRoot, "Selection", terminal.selection_ref);
	for (const [index, ref] of terminal.candidate_refs.entries()) {
		addArtifactErrors(errors, options.runRoot, `Candidate ${index + 1}`, ref);
		if (ref.path !== `candidates/${index === 0 ? "a" : "b"}/candidate.json`) errors.push(`Candidate ${index + 1} frozen path mismatch`);
	}
	const seed = safeReadJson<RecoverySeedV2A>(options.runRoot, terminal.recovery_seed_ref.path, errors);
	const selection = safeReadJson<SelectionDecisionV2A>(options.runRoot, terminal.selection_ref.path, errors);
	const candidates = terminal.candidate_refs.flatMap((ref) => {
		const candidate = safeReadJson<CandidatePathV2A>(options.runRoot, ref.path, errors);
		return candidate ? [candidate] : [];
	});
	if (!seed || !selection || candidates.length !== 2) {
		errors.push("recovery object set is incomplete");
		return result(terminal, seed, candidates, selection);
	}
	if (
		seed.schema_version !== "v2a-recovery-seed-v2" || seed.recovery_group_id !== terminal.recovery_group_id ||
		seed.parent_run_id !== terminal.run_id || seed.parent_attempt_id !== terminal.primary_attempt_id || seed.task_id !== manifest.task_id ||
		seed.pi_commit !== V2A_PINNED_PI_COMMIT || !sameRef(seed.workbench_source_ref, manifest.workbench_source_ref) ||
		seed.workbench_digest !== manifest.workbench_source_digest || !seed.created_before_candidate_attempts
	) {
		errors.push("Recovery Seed lineage/source/order mismatch");
	}
	for (const [label, ref] of [
		["Seed instruction", seed.task_instruction_ref],
		["Failure Packet", seed.failure_packet_ref],
		["Seed Workspace", seed.failed_workspace_snapshot_ref],
		["parent Session", seed.parent_session_ref],
		["primary Verifier", seed.verifier_result_ref],
		["Seed Workbench source", seed.workbench_source_ref],
	] as const) addArtifactErrors(errors, options.runRoot, label, ref);
	if (
		!sameRef(seed.task_instruction_ref, manifest.task_instruction_ref) || !sameRef(seed.parent_session_ref, terminal.primary_session_ref) ||
		!sameRef(seed.verifier_result_ref, terminal.primary_verifier_result_ref) ||
		seed.task_instruction_ref.sha256 !== seed.task_instruction_sha256 || seed.failure_packet_ref.sha256 !== seed.failure_packet_sha256 ||
		seed.parent_session_ref.sha256 !== seed.parent_session_digest || seed.verifier_result_ref.sha256 !== seed.verifier_result_sha256 ||
		seed.skill_digest !== manifest.skill_sha256 || seed.tool_profile_digest !== manifest.tool_profile_digest
	) {
		errors.push("Recovery Seed frozen Artifact digest/identity mismatch");
	}
	const seedSnapshot = validateWorkspaceSnapshot(
		options.runRoot,
		seed.failed_workspace_snapshot_ref,
		"seed/workspace-snapshot.json",
		resolve(options.runRoot, "seed/workspace"),
		`${seed.recovery_seed_id}-workspace`,
		"Recovery Seed Workspace",
		errors,
		true,
	);
	if (seedSnapshot.snapshot?.digest !== seed.failed_workspace_snapshot_digest) errors.push("Recovery Seed Workspace digest declaration mismatch");
	const failurePacket = safeReadJson<{ protected_paths?: unknown; writable_paths?: unknown; task_instruction?: unknown; verifier_id?: unknown }>(options.runRoot, seed.failure_packet_ref.path, errors);
	const protectedPaths = Array.isArray(failurePacket?.protected_paths) && failurePacket.protected_paths.every((path) => typeof path === "string") ? failurePacket.protected_paths as string[] : [];
	const writablePaths = Array.isArray(failurePacket?.writable_paths) && failurePacket.writable_paths.every((path) => typeof path === "string") ? failurePacket.writable_paths as string[] : [];
	if (protectedPaths.length === 0 || writablePaths.length === 0) errors.push("Failure Packet Workspace boundary is missing");
	let expectedCommonArtifactDigest: string | null = null;
	try {
		const instruction = readFileSync(resolveRunRelative(options.runRoot, seed.task_instruction_ref.path), "utf8");
		const recoveryPrompt = `${instruction.trim()}\n\nExternal verifier feedback:\n${stableJson(failurePacket)}\n`;
		if (failurePacket?.task_instruction !== instruction || failurePacket?.verifier_id !== manifest.verifier_id || sha256(recoveryPrompt) !== seed.prompt_digest) {
			errors.push("Recovery Seed prompt/Failure Packet derivation mismatch");
		}
		expectedCommonArtifactDigest = digestObject({
			seed_workspace_digest: seed.failed_workspace_snapshot_digest,
			failure_packet_sha256: seed.failure_packet_sha256,
			prompt_sha256: seed.prompt_digest,
			skill_sha256: seed.skill_digest,
			tool_profile_sha256: seed.tool_profile_digest,
			verifier_sha256: manifest.verifier_sha256,
			model_id: V2A_MODEL_ID,
			policy_id: V2A_POLICY_ID,
			pi_commit: seed.pi_commit,
			workbench_source_sha256: seed.workbench_digest,
			budget: V2A_ATTEMPT_BUDGET_CAPS,
		});
	} catch (error) {
		errors.push(`Recovery prompt/common Artifact derivation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	const parentSession = primarySession ?? parseSession(options.runRoot, seed.parent_session_ref, "Seed parent Session", errors);
	if (!parentSession) {
		errors.push("parent Session is unavailable");
		return result(terminal, seed, candidates, selection);
	}
	const inspectedA = inspectCandidate({ runRoot: options.runRoot, manifest, seed, candidate: candidates[0]!, suffix: "a", parentSession, journal, protectedPaths, writablePaths, seedSnapshot, errors });
	const inspectedB = inspectCandidate({ runRoot: options.runRoot, manifest, seed, candidate: candidates[1]!, suffix: "b", parentSession, journal, protectedPaths, writablePaths, seedSnapshot, errors });
	const parentId = typeof parentSession.header.id === "string" ? parentSession.header.id : null;
	const sessionIds = [parentId, inspectedA.sessionId, inspectedB.sessionId];
	if (sessionIds.some((id) => id === null) || new Set(sessionIds).size !== 3) errors.push("parent/A/B Session IDs are not unique");
	const frozenIdentities = [...seedSnapshot.fileIdentities, ...inspectedA.initial.fileIdentities, ...inspectedB.initial.fileIdentities];
	if (new Set(frozenIdentities).size !== frozenIdentities.length) errors.push("Seed/A/B initial Workspace snapshots share file identity");
	if (candidates[0]!.candidate_path_id === candidates[1]!.candidate_path_id) errors.push("duplicate Candidate identity");
	if (
		candidates[0]!.common_artifact_digest !== candidates[1]!.common_artifact_digest ||
		(expectedCommonArtifactDigest !== null && candidates[0]!.common_artifact_digest !== expectedCommonArtifactDigest)
	) errors.push("Candidate common Artifact fairness/derivation mismatch");
	if (candidates[0]!.immediate_recovery_prompt_sha256 !== candidates[1]!.immediate_recovery_prompt_sha256 || candidates[0]!.immediate_recovery_prompt_sha256 !== seed.prompt_digest) {
		errors.push("Candidate immediate prompt fairness mismatch");
	}
	const group = safeReadJson<{
		recovery_group_id: string;
		recovery_seed_id: string;
		candidate_path_ids: string[];
		budget_usage: { faux_provider_dispatches: number; tool_calls: number; verifier_runs: number; real_cost_usd: number };
		budget_caps: unknown;
		candidate_paths_terminal: number;
		common_artifact_digest: string;
	}>(options.runRoot, "recovery-group.json", errors);
	const derivedGroupUsage = {
		faux_provider_dispatches: primaryUsage.providerDispatches + inspectedA.derived.budget_usage.faux_provider_dispatches + inspectedB.derived.budget_usage.faux_provider_dispatches,
		tool_calls: primaryUsage.toolCalls + inspectedA.derived.budget_usage.tool_calls + inspectedB.derived.budget_usage.tool_calls,
		verifier_runs: 1 + inspectedA.derived.budget_usage.verifier_runs + inspectedB.derived.budget_usage.verifier_runs,
		real_cost_usd: 0,
	};
	if (
		!group || group.recovery_group_id !== seed.recovery_group_id || group.recovery_seed_id !== seed.recovery_seed_id ||
		stableJson([...group.candidate_path_ids].sort()) !== stableJson(candidates.map((candidate) => candidate.candidate_path_id).sort()) ||
		group.candidate_paths_terminal !== 2 || group.common_artifact_digest !== candidates[0]!.common_artifact_digest ||
		stableJson(group.budget_caps) !== stableJson(V2A_GROUP_BUDGET_CAPS) || stableJson(group.budget_usage) !== stableJson(derivedGroupUsage) ||
		derivedGroupUsage.faux_provider_dispatches > V2A_GROUP_BUDGET_CAPS.faux_provider_dispatches_max ||
		derivedGroupUsage.tool_calls > V2A_GROUP_BUDGET_CAPS.tool_calls_max || derivedGroupUsage.verifier_runs > V2A_GROUP_BUDGET_CAPS.verifier_runs_max
	) {
		errors.push("Recovery Group raw-derived membership/budget mismatch");
	}
	validateWorkspaceIsolation(options.runRoot, errors);
	try {
		const recomputed = selectCandidateV2A(seed.recovery_group_id, [inspectedA.derived, inspectedB.derived]);
		if (stableJson(recomputed) !== stableJson(selection)) errors.push("Selection Decision is not reproducible from independently derived gates/usage");
	} catch (error) {
		errors.push(`Selection validation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	if (selection.recovery_group_id !== terminal.recovery_group_id || selection.selected_candidate_id !== terminal.selected_candidate_id) errors.push("Selection/terminal lineage mismatch");
	if (!selection.evaluated_candidate_ids.every((id) => candidates.some((candidate) => candidate.candidate_path_id === id)) || selection.evaluated_candidate_ids.length !== 2) {
		errors.push("Selection omitted or mixed Candidate identity");
	}
	return result(terminal, seed, candidates, selection);
}

export function inspectionFingerprintV2A(runRoot: string): string {
	const inventory = treeInventory(runRoot);
	return digestObject(inventory.map((entry) => ({ ...entry, path: portable(entry.path) })));
}
