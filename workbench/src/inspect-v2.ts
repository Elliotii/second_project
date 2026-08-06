import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
	CandidatePathV2A,
	InspectResultV2A,
	RecoverySeedV2A,
	RunManifestV2A,
	RunTerminalV2A,
	SelectionDecisionV2A,
} from "./contracts/v2-types.ts";
import { readJsonArtifact, resolveRunRelative, validateArtifactRef, validateRunRootBoundary } from "./evidence/artifacts.ts";
import { digestObject, fileSha256, stableJson, treeDigest, treeInventory } from "./hash.ts";
import { selectCandidateV2A } from "./recovery/selector-v2.ts";

const FORBIDDEN_EVIDENCE = /(?:(?:bearer|api[_-]?key|authorization)\s*[:=]\s*[A-Za-z0-9._-]{8,}|"(?:reasoning(?:_content)?|thinking|thoughtsignature|signature)"\s*:)/i;

function portable(path: string): string {
	return path.split(sep).join("/");
}

function addArtifactErrors(errors: string[], runRoot: string, label: string, ref: unknown): void {
	for (const error of validateArtifactRef(runRoot, ref)) errors.push(`${label}: ${error}`);
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
			const bytes = readFileSync(path);
			if (FORBIDDEN_EVIDENCE.test(bytes.toString("utf8"))) errors.push(`secret/reasoning scan rejected: ${relativePath}`);
		}
	};
	visit(runRoot);
}

function validateJournal(runRoot: string, terminal: RunTerminalV2A, errors: string[]): void {
	const path = resolve(runRoot, "journal.jsonl");
	if (!existsSync(path)) {
		errors.push("journal is missing");
		return;
	}
	let events: Array<{ seq?: unknown; type?: unknown; data?: Record<string, unknown> }>;
	try {
		events = readFileSync(path, "utf8")
			.trim()
			.split(/\r?\n/)
			.filter(Boolean)
			.map((line) => JSON.parse(line) as { seq?: unknown; type?: unknown; data?: Record<string, unknown> });
	} catch {
		errors.push("journal parse failed");
		return;
	}
	if (events.some((event, index) => event.seq !== index + 1)) errors.push("journal sequence is non-contiguous");
	const types = events.map((event) => event.type);
	for (const required of ["run_started", "primary_started", "primary_settled", "primary_verifier_completed", "run_terminal"]) {
		if (types.filter((type) => type === required).length !== 1) errors.push(`journal critical event count invalid: ${required}`);
	}
	if (terminal.outcome === "initial_pass") {
		if (types.some((type) => ["seed_frozen", "candidate_started", "candidate_terminal", "selection_written"].includes(String(type)))) {
			errors.push("initial-pass journal contains recovery events");
		}
		return;
	}
	if (types.filter((type) => type === "seed_frozen").length !== 1) errors.push("journal Seed freeze count invalid");
	if (types.filter((type) => type === "candidate_started").length !== 2) errors.push("journal Candidate start count invalid");
	if (types.filter((type) => type === "candidate_terminal").length !== 2) errors.push("journal Candidate terminal count invalid");
	if (types.filter((type) => type === "selection_written").length !== 1) errors.push("journal Selection count invalid");
	const seedIndex = types.indexOf("seed_frozen");
	const firstCandidateIndex = types.indexOf("candidate_started");
	const selectionIndex = types.indexOf("selection_written");
	const lastCandidateTerminalIndex = types.lastIndexOf("candidate_terminal");
	if (seedIndex < 0 || firstCandidateIndex < 0 || seedIndex >= firstCandidateIndex) errors.push("Seed was not frozen before every Candidate");
	if (selectionIndex <= lastCandidateTerminalIndex) errors.push("Selection occurred before both Candidate terminals");
	const startedIds = events.filter((event) => event.type === "candidate_started").map((event) => event.data?.candidate_path_id);
	const terminalIds = events.filter((event) => event.type === "candidate_terminal").map((event) => event.data?.candidate_path_id);
	if (new Set(startedIds).size !== 2 || stableJson([...startedIds].sort()) !== stableJson([...terminalIds].sort())) {
		errors.push("Candidate start/terminal identity mismatch");
	}
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

function jsonlEntryCount(path: string, errors: string[]): { count: number; header: Record<string, unknown> | null } {
	try {
		const lines = readFileSync(path, "utf8").trim().split(/\r?\n/).filter(Boolean);
		return { count: Math.max(0, lines.length - 1), header: JSON.parse(lines[0] ?? "null") as Record<string, unknown> | null };
	} catch {
		errors.push(`Session JSONL parse failed: ${portable(path)}`);
		return { count: -1, header: null };
	}
}

function validateCandidate(
	runRoot: string,
	candidate: CandidatePathV2A,
	seed: RecoverySeedV2A,
	expectedStrategy: CandidatePathV2A["strategy_id"],
	protectedPaths: readonly string[],
	errors: string[],
): void {
	if (candidate.recovery_group_id !== seed.recovery_group_id || candidate.recovery_seed_id !== seed.recovery_seed_id) {
		errors.push(`${candidate.candidate_path_id}: mixed Seed/Recovery Group identity`);
	}
	if (candidate.parent_attempt_id !== seed.parent_attempt_id) errors.push(`${candidate.candidate_path_id}: parent Attempt identity mismatch`);
	if (candidate.strategy_id !== expectedStrategy) errors.push(`${candidate.candidate_path_id}: strategy identity mismatch`);
	if (candidate.initial_workspace_digest !== seed.failed_workspace_snapshot_digest) errors.push(`${candidate.candidate_path_id}: initial Workspace digest mismatch`);
	if (candidate.session_digest_before_run !== candidate.session_snapshot_before_run_ref.sha256) errors.push(`${candidate.candidate_path_id}: pre-run Session digest mismatch`);
	for (const [label, ref] of [
		["Session", candidate.session_ref],
		["pre-run Session", candidate.session_snapshot_before_run_ref],
		["Workspace", candidate.workspace_ref],
		["final Workspace", candidate.final_workspace_ref],
		["Verifier", candidate.verifier_result_ref],
	] as const) addArtifactErrors(errors, runRoot, `${candidate.candidate_path_id} ${label}`, ref);
	const suffix = expectedStrategy === "continue_failed_session" ? "a" : "b";
	try {
		const finalWorkspaceRoot = resolve(runRoot, `candidates/${suffix}/workspace`);
		if (treeDigest(finalWorkspaceRoot) !== candidate.final_workspace_digest) {
			errors.push(`${candidate.candidate_path_id}: final Workspace digest mismatch`);
		}
		let protectedAndSecretValid = true;
		for (const path of protectedPaths) {
			if (fileSha256(resolve(runRoot, "seed/workspace", path)) !== fileSha256(resolve(finalWorkspaceRoot, path))) protectedAndSecretValid = false;
		}
		for (const file of treeInventory(finalWorkspaceRoot)) {
			if (/(?:bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i.test(readFileSync(resolve(finalWorkspaceRoot, file.path), "utf8"))) protectedAndSecretValid = false;
		}
		if (protectedAndSecretValid !== candidate.hard_gates.protected_secret_path_valid) errors.push(`${candidate.candidate_path_id}: protected/secret gate mismatch`);
	} catch (error) {
		errors.push(`${candidate.candidate_path_id}: final Workspace unavailable: ${error instanceof Error ? error.message : String(error)}`);
	}
	const before = jsonlEntryCount(resolveRunRelative(runRoot, candidate.session_snapshot_before_run_ref.path), errors);
	if (before.count !== candidate.parent_history_entry_count) errors.push(`${candidate.candidate_path_id}: parent history count mismatch`);
	if (expectedStrategy === "continue_failed_session") {
		if (before.count <= 0) errors.push(`${candidate.candidate_path_id}: derived Session lacks parent history`);
		if (typeof before.header?.parentSession !== "string") errors.push(`${candidate.candidate_path_id}: derived Session parent lineage missing`);
	} else {
		if (before.count !== 0) errors.push(`${candidate.candidate_path_id}: fresh Session contains parent history`);
		if (before.header && "parentSession" in before.header) errors.push(`${candidate.candidate_path_id}: fresh Session has parent lineage`);
	}
	if (candidate.budget_usage.verifier_runs !== 1) errors.push(`${candidate.candidate_path_id}: Verifier count mismatch`);
	if (candidate.budget_usage.faux_provider_dispatches > candidate.budget_caps.faux_provider_dispatches_max) errors.push(`${candidate.candidate_path_id}: provider budget exceeded`);
	if (candidate.budget_usage.tool_calls > candidate.budget_caps.tool_calls_max) errors.push(`${candidate.candidate_path_id}: Tool budget exceeded`);
	if (candidate.budget_within_limits !== candidate.hard_gates.budget_valid) errors.push(`${candidate.candidate_path_id}: budget gate mismatch`);
	if ((candidate.verifier_status === "passed") !== candidate.hard_gates.verifier_passed) errors.push(`${candidate.candidate_path_id}: Verifier gate mismatch`);
	if (candidate.settled !== candidate.hard_gates.unique_terminal_settled) errors.push(`${candidate.candidate_path_id}: terminal gate mismatch`);
	if (!candidate.evidence_valid && candidate.hard_gates.identity_complete) errors.push(`${candidate.candidate_path_id}: invalid evidence marked identity-complete`);
}

export function inspectRunV2A(options: { runRoot: string }): InspectResultV2A {
	const errors = validateRunRootBoundary(options.runRoot);
	const terminal = safeReadJson<RunTerminalV2A>(options.runRoot, "terminal.json", errors);
	const manifest = safeReadJson<RunManifestV2A>(options.runRoot, "config/manifest.json", errors);
	if (!terminal || !manifest) {
		return { schema_version: "v2a-inspection-v1", run_id: terminal?.run_id ?? null, integrity_valid: false, terminal_valid: false, errors, terminal, recovery_seed: null, candidates: [], selection: null };
	}
	const { manifest_id: declaredManifestId, ...manifestBody } = manifest;
	if (digestObject(manifestBody) !== declaredManifestId || terminal.manifest_id !== declaredManifestId) errors.push("Manifest identity mismatch");
	if (terminal.run_id !== manifest.run_id) errors.push("Run identity mismatch");
	if (stableJson(terminal.real_call_counters) !== stableJson({ credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 })) {
		errors.push("real-access counters are not zero");
	}
	validateJournal(options.runRoot, terminal, errors);
	scanEvidenceFiles(options.runRoot, errors);
	if (terminal.outcome === "initial_pass") {
		if (terminal.primary_verifier_status !== "passed" || terminal.recovery_group_id !== null || terminal.recovery_seed_ref !== null || terminal.candidate_refs.length !== 0 || terminal.selection_ref !== null || terminal.selected_candidate_id !== null) {
			errors.push("initial-pass terminal contains recovery state");
		}
		for (const path of ["seed/recovery-seed.json", "seed/failure-packet.json", "selection.json", "candidates"]) {
			if (existsSync(resolve(options.runRoot, path))) errors.push(`initial-pass Run created forbidden recovery object: ${path}`);
		}
		return { schema_version: "v2a-inspection-v1", run_id: terminal.run_id, integrity_valid: errors.length === 0, terminal_valid: errors.length === 0, errors, terminal, recovery_seed: null, candidates: [], selection: null };
	}
	if (terminal.primary_verifier_status !== "failed" || !terminal.recovery_group_id || !terminal.recovery_seed_ref || !terminal.selection_ref) {
		errors.push("recovery terminal identity is incomplete");
		return { schema_version: "v2a-inspection-v1", run_id: terminal.run_id, integrity_valid: false, terminal_valid: false, errors, terminal, recovery_seed: null, candidates: [], selection: null };
	}
	addArtifactErrors(errors, options.runRoot, "Recovery Seed", terminal.recovery_seed_ref);
	addArtifactErrors(errors, options.runRoot, "Selection", terminal.selection_ref);
	for (const [index, ref] of terminal.candidate_refs.entries()) addArtifactErrors(errors, options.runRoot, `Candidate ${index + 1}`, ref);
	const seed = safeReadJson<RecoverySeedV2A>(options.runRoot, terminal.recovery_seed_ref.path, errors);
	const selection = safeReadJson<SelectionDecisionV2A>(options.runRoot, terminal.selection_ref.path, errors);
	const candidates = terminal.candidate_refs.flatMap((ref) => {
		const candidate = safeReadJson<CandidatePathV2A>(options.runRoot, ref.path, errors);
		return candidate ? [candidate] : [];
	});
	if (!seed || !selection || candidates.length !== 2) {
		errors.push("recovery object set is incomplete");
		return { schema_version: "v2a-inspection-v1", run_id: terminal.run_id, integrity_valid: false, terminal_valid: false, errors, terminal, recovery_seed: seed, candidates, selection };
	}
	if (seed.recovery_group_id !== terminal.recovery_group_id || seed.parent_run_id !== terminal.run_id || seed.parent_attempt_id !== terminal.primary_attempt_id) errors.push("Recovery Seed lineage mismatch");
	if (!seed.created_before_candidate_attempts) errors.push("Recovery Seed order declaration is false");
	for (const [label, ref] of [
		["Seed instruction", seed.task_instruction_ref],
		["Failure Packet", seed.failure_packet_ref],
		["Seed Workspace", seed.failed_workspace_snapshot_ref],
		["parent Session", seed.parent_session_ref],
		["primary Verifier", seed.verifier_result_ref],
	] as const) addArtifactErrors(errors, options.runRoot, label, ref);
	if (seed.task_instruction_ref.sha256 !== seed.task_instruction_sha256 || seed.failure_packet_ref.sha256 !== seed.failure_packet_sha256 || seed.parent_session_ref.sha256 !== seed.parent_session_digest || seed.verifier_result_ref.sha256 !== seed.verifier_result_sha256) {
		errors.push("Recovery Seed declared digest mismatch");
	}
	try {
		if (treeDigest(resolve(options.runRoot, "seed/workspace")) !== seed.failed_workspace_snapshot_digest) errors.push("Recovery Seed Workspace tamper detected");
	} catch (error) {
		errors.push(`Recovery Seed Workspace scan failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	const failurePacket = safeReadJson<{ protected_paths?: unknown }>(options.runRoot, seed.failure_packet_ref.path, errors);
	const protectedPaths = Array.isArray(failurePacket?.protected_paths) && failurePacket.protected_paths.every((path) => typeof path === "string") ? failurePacket.protected_paths as string[] : [];
	if (protectedPaths.length === 0) errors.push("Failure Packet protected-path boundary is missing");
	validateCandidate(options.runRoot, candidates[0]!, seed, "continue_failed_session", protectedPaths, errors);
	validateCandidate(options.runRoot, candidates[1]!, seed, "fresh_session_from_failure_seed", protectedPaths, errors);
	if (candidates[0]!.candidate_path_id === candidates[1]!.candidate_path_id) errors.push("duplicate Candidate identity");
	if (candidates[0]!.common_artifact_digest !== candidates[1]!.common_artifact_digest) errors.push("Candidate common Artifact fairness mismatch");
	if (candidates[0]!.immediate_recovery_prompt_sha256 !== candidates[1]!.immediate_recovery_prompt_sha256 || candidates[0]!.immediate_recovery_prompt_sha256 !== seed.prompt_digest) errors.push("Candidate immediate prompt fairness mismatch");
	const group = safeReadJson<{
		recovery_group_id: string;
		recovery_seed_id: string;
		candidate_path_ids: string[];
		budget_usage: { faux_provider_dispatches: number; tool_calls: number; verifier_runs: number; real_cost_usd: number };
		budget_caps: { faux_provider_dispatches_max: number; tool_calls_max: number; verifier_runs_max: number };
		candidate_paths_terminal: number;
		common_artifact_digest: string;
	}>(options.runRoot, "recovery-group.json", errors);
	if (group) {
		if (group.recovery_group_id !== seed.recovery_group_id || group.recovery_seed_id !== seed.recovery_seed_id) errors.push("Recovery Group identity mismatch");
		if (stableJson([...group.candidate_path_ids].sort()) !== stableJson(candidates.map((candidate) => candidate.candidate_path_id).sort()) || group.candidate_paths_terminal !== 2) errors.push("Recovery Group Candidate membership mismatch");
		if (group.common_artifact_digest !== candidates[0]!.common_artifact_digest) errors.push("Recovery Group common Artifact mismatch");
		if (group.budget_usage.faux_provider_dispatches > group.budget_caps.faux_provider_dispatches_max || group.budget_usage.tool_calls > group.budget_caps.tool_calls_max || group.budget_usage.verifier_runs > group.budget_caps.verifier_runs_max || group.budget_usage.real_cost_usd !== 0) errors.push("Recovery Group budget exceeded");
	}
	validateWorkspaceIsolation(options.runRoot, errors);
	try {
		const recomputed = selectCandidateV2A(seed.recovery_group_id, candidates);
		if (stableJson(recomputed) !== stableJson(selection)) errors.push("Selection Decision is not reproducible");
	} catch (error) {
		errors.push(`Selection validation failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	if (selection.recovery_group_id !== terminal.recovery_group_id || selection.selected_candidate_id !== terminal.selected_candidate_id) errors.push("Selection/terminal lineage mismatch");
	if (!selection.evaluated_candidate_ids.every((id) => candidates.some((candidate) => candidate.candidate_path_id === id)) || selection.evaluated_candidate_ids.length !== 2) errors.push("Selection omitted or mixed Candidate identity");
	return {
		schema_version: "v2a-inspection-v1",
		run_id: terminal.run_id,
		integrity_valid: errors.length === 0,
		terminal_valid: errors.length === 0,
		errors,
		terminal,
		recovery_seed: seed,
		candidates,
		selection,
	};
}

export function inspectionFingerprintV2A(runRoot: string): string {
	const inventory = treeInventory(runRoot);
	return digestObject(inventory.map((entry) => ({ ...entry, path: portable(entry.path) })));
}
