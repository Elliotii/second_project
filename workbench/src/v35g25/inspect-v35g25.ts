import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { Goal2FirstProviderPayloadEvidenceV35 } from "../contracts/v35g2-types.ts";
import type {
	Goal25ArmInspectionV35,
	Goal25ArmManifestV35,
	Goal25ArmOutcomeV35,
	Goal25ComparisonV35,
	Goal25PairInspectionV35,
	Goal25RuntimeEvidenceV35,
	Goal25SessionRunLinkV35,
	Goal25SettledVerifierHandoffV35,
} from "../contracts/v35g25-types.ts";
import { digestObject, fileSha256 } from "../hash.ts";
import { compareGoal25FirstProviderPayloadsV35 } from "./payload-fairness-v35g25.ts";

const PAIR_ID = "v35-g25-stable-unique-pair-01";
const RUN_IDS = {
	base: "v35-g25-stable-unique-base-run-01",
	candidate: "v35-g25-stable-unique-candidate-run-01",
} as const;
const SESSION_IDS = {
	base: "v35-g25-stable-unique-base-session-01",
	candidate: "v35-g25-stable-unique-candidate-session-01",
} as const;
const CASE_ID = "v35-g2-stable-unique-case-01";
const PROJECT_ID = "v35-g2-adaptive-skill-project";

const ARTIFACT_KEYS = ["media_type", "path", "sha256", "size_bytes", "truncated"] as const;
const COMPARISON_KEYS = ["arm_order", "base_manifest_ref", "base_task_outcome", "candidate_manifest_ref", "candidate_task_outcome", "comparison_digest", "cost_usd", "credential_reads", "external_provider_calls", "input_tokens", "network_calls", "output_tokens", "pair_id", "payload_fairness_digest", "provider_dispatches", "real_model_calls", "schema_version", "tool_interface_sha256"] as const;
const MANIFEST_KEYS = ["arm", "binding_digest", "case_authority_digest", "checkpoint_ref", "cost_usd", "final_workspace_sha256", "first_payload_ref", "initial_workspace_sha256", "input_tokens", "manifest_digest", "outcome_ref", "output_tokens", "provider_dispatches", "request_attempts", "run_id", "runtime_ref", "schema_version", "session_entries_sha256", "session_entry_count", "session_id", "session_link_ref", "session_ref", "session_ref_root", "settled_handoff_ref", "task_outcome", "tool_calls", "tool_interface_sha256", "trajectory_outcome", "verifier_ref"] as const;
const RUNTIME_KEYS = ["cost_usd", "credential_reads", "external_provider_calls", "input_tokens", "network_calls", "output_tokens", "pending_provider_reservations", "pending_side_effects", "pending_tool_calls", "protected_bytes_sha256_at_terminal", "provider_dispatches", "provider_request_after_successful_public_test", "provider_responses", "public_test_succeeded", "public_test_terminated", "raw_harness_settled_events", "real_model_calls", "request_attempts", "reservations", "run_id", "runtime_digest", "schema_version", "session_id", "task_outcome", "terminal_reason", "tool_calls", "tool_interface_sha256", "trajectory_outcome", "usage_known", "workspace_tree_sha256_at_terminal"] as const;
const RESERVATION_KEYS = ["cost_usd", "dispatch_ordinal", "input_tokens", "output_tokens", "request_attempt", "state"] as const;
const OUTCOME_KEYS = ["candidate_eligible", "outcome_digest", "run_id", "schema_version", "task_outcome", "tool_interface_sha256", "trajectory_outcome", "verifier_runs"] as const;
const LINK_KEYS = ["arm", "link_digest", "run_id", "run_ref", "schema_version", "session_entries_sha256", "session_entry_count", "session_id", "session_ref", "session_ref_root"] as const;
const HANDOFF_KEYS = ["first_payload_authenticated", "first_payload_ref", "handoff_before_verifier", "handoff_digest", "handoff_sequence", "protected_bytes_sha256", "protected_unchanged", "run_id", "runtime_authenticated", "runtime_matches_expected", "runtime_ref", "schema_version", "session_entries_sha256", "session_entry_count", "session_id", "session_ref", "session_reopen_equal", "session_snapshot_ref", "task_outcome", "tool_calls_closed", "tool_interface_sha256", "trajectory_outcome", "workspace_snapshot_ref", "workspace_tree_sha256", "workspace_unchanged_since_terminal"] as const;
const PAYLOAD_KEYS = ["actual_last_user_text_sha256", "arm", "capture_ordinal", "case_id", "evidence_digest", "expected_last_user_text_sha256", "last_user_message_index", "message_count", "model_sha256", "normalized_messages_sha256", "normalized_payload_sha256", "payload_sha256", "payload_top_level_keys_sha256", "project_id", "request_fields_sha256", "run_id", "schema_version", "skill_wrapper_sha256", "system_messages_sha256", "task_prompt_sha256", "tools_sha256", "treatment_kind", "treatment_marker_sha256"] as const;
const VERIFIER_KEYS = ["attempt_id", "completed_at", "duration_ms", "execution", "exit_code", "full_output_ref", "full_output_sha256", "invalid_reason", "schema_version", "started_at", "status", "summary", "timed_out", "verifier_id", "verifier_sha256"] as const;
const VERIFIER_EXECUTION_KEYS = ["argv", "cwd", "cwd_identity", "environment_allowlist_keys", "executable", "executable_identity", "output_limit_bytes", "shell", "source_digest_verified", "source_sha256", "source_snapshot_ref", "timeout_ms"] as const;
const BINDING_KEYS = ["active_binding_revision", "active_decision_id", "active_state_digest", "active_state_version", "adaptive_skill_name", "adaptive_skill_source_sha256", "adaptive_skill_wrapper_sha256", "binding_context", "binding_context_digest", "binding_digest", "bound_entries", "case_authority_digest", "composed_prompt_sha256", "lineage", "project_id", "schema_version"] as const;
const BINDING_CONTEXT_KEYS = ["trusted_failure_lineage", "trusted_task_identity"] as const;
const FAILURE_LINEAGE_KEYS = ["failure_family", "lineage_digest", "source_run_id"] as const;
const TASK_IDENTITY_KEYS = ["case_id", "identity_digest", "task_id", "task_kind"] as const;
const BINDING_LINEAGE_KEYS = ["admission_digest", "candidate_digest", "candidate_id", "decision_digest", "decision_id", "staged_state_digest", "validation_digest", "validation_id", "version_digest"] as const;
const BOUND_ENTRY_KEYS = ["entry_id", "kind", "semantic_digest", "source_digest"] as const;
const CASE_AUTHORITY_KEYS = ["allowed_failure_lineage", "authority_digest", "budget_profile_digest", "budget_profile_id", "case_id", "project_id", "provider_profile", "schema_version", "task_id", "task_kind", "task_prompt_sha256", "tool_profile_digest", "tool_profile_id", "verifier_id", "verifier_sha256"] as const;
const PROVIDER_PROFILE_KEYS = ["api", "endpoint", "fallback", "model_id", "profile_digest", "provider_id", "provider_kind", "retry", "thinking_level"] as const;

type Arm = "base" | "candidate";
type JsonObject = Record<string, unknown>;

function record(value: unknown, label: string): JsonObject {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function exactKeys(value: unknown, expected: readonly string[], label: string): JsonObject {
	const item = record(value, label);
	const actual = Object.keys(item).sort();
	const wanted = [...expected].sort();
	if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
		throw new Error(`${label} keys are not exact`);
	}
	return item;
}

function requireDigest(value: JsonObject, field: string, label: string): void {
	const body = { ...value };
	delete body[field];
	if (value[field] !== digestObject(body)) throw new Error(`${label} ${field} mismatch`);
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function ordinaryRoot(rootValue: string): string {
	const root = resolve(rootValue);
	const stats = lstatSync(root);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("Goal 2.5 Pair root must be an ordinary directory");
	return root;
}

function ordinaryFile(rootValue: string, ref: string, label: string): string {
	if (!ref || isAbsolute(ref) || /^[A-Za-z]:/.test(ref) || ref.includes("\0")) throw new Error(`${label} has an invalid relative path`);
	const segments = ref.replaceAll("\\", "/").split("/");
	if (segments.some((part) => part === "" || part === "." || part === "..")) throw new Error(`${label} has an invalid relative path`);
	const root = ordinaryRoot(rootValue);
	const target = resolve(root, ...segments);
	if (!contained(root, target)) throw new Error(`${label} escapes its evidence root`);
	let cursor = root;
	for (const segment of segments) {
		cursor = resolve(cursor, segment);
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
	}
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`${label} is not an ordinary file`);
	if (stats.nlink !== 1) throw new Error(`${label} is hardlinked`);
	const realRoot = realpathSync.native(root);
	const realTarget = realpathSync.native(target);
	if (!contained(realRoot, realTarget)) throw new Error(`${label} real path escapes its evidence root`);
	return target;
}

function jsonAt<T>(root: string, ref: string, label: string): T {
	return JSON.parse(readFileSync(ordinaryFile(root, ref, label), "utf8")) as T;
}

function validateRef(root: string, value: unknown, label: string): ArtifactRefV0B {
	const ref = exactKeys(value, ARTIFACT_KEYS, `${label} ArtifactRef`) as unknown as ArtifactRefV0B;
	if (typeof ref.path !== "string" || !/^[a-f0-9]{64}$/.test(String(ref.sha256)) || !Number.isSafeInteger(ref.size_bytes) || ref.size_bytes < 0 || typeof ref.media_type !== "string" || typeof ref.truncated !== "boolean") {
		throw new Error(`${label} ArtifactRef envelope is invalid`);
	}
	const path = ordinaryFile(root, ref.path, label);
	const stats = lstatSync(path);
	if (stats.size !== ref.size_bytes || fileSha256(path) !== ref.sha256) throw new Error(`${label} ArtifactRef identity mismatch`);
	return ref;
}

function sameRef(a: ArtifactRefV0B, b: ArtifactRefV0B, label: string): void {
	if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${label} ArtifactRef mismatch`);
}

function finiteCounter(value: unknown, label: string): number {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`${label} must be finite and non-negative`);
	return value;
}

function sessionEntries(pairRoot: string, ref: ArtifactRefV0B): unknown[] {
	const text = readFileSync(ordinaryFile(pairRoot, ref.path, "Session JSONL"), "utf8");
	const records = text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
	const header = record(records[0], "Session JSONL header");
	if (header.type !== "session") throw new Error("Session JSONL header is missing");
	return records.slice(1);
}

function inspectArm(pairRoot: string, arm: Arm, manifestRef: ArtifactRefV0B): { view: Goal25ArmInspectionV35; payload: Goal2FirstProviderPayloadEvidenceV35 } {
	const runId = RUN_IDS[arm];
	const sessionId = SESSION_IDS[arm];
	const expectedManifestRef = `runs/${runId}/goal25-manifest.json`;
	if (manifestRef.path !== expectedManifestRef) throw new Error(`${arm} Manifest membership is invalid`);
	const runRoot = resolve(pairRoot, "runs", runId);
	const manifest = jsonAt<Goal25ArmManifestV35>(pairRoot, manifestRef.path, `${arm} Manifest`);
	const manifestObject = exactKeys(manifest, MANIFEST_KEYS, `${arm} Manifest`);
	requireDigest(manifestObject, "manifest_digest", `${arm} Manifest`);
	if (manifest.schema_version !== 1 || manifest.arm !== arm || manifest.run_id !== runId || manifest.session_id !== sessionId) throw new Error(`${arm} Manifest semantic identity mismatch`);
	if (manifest.session_ref_root !== "pair_root" || manifest.trajectory_outcome !== "settled" || manifest.task_outcome !== "passed" || manifest.checkpoint_ref !== null || manifest.settled_handoff_ref === null) throw new Error(`${arm} Manifest is not a settled passing handoff`);

	for (const [name, value] of Object.entries({ request_attempts: manifest.request_attempts, provider_dispatches: manifest.provider_dispatches, input_tokens: manifest.input_tokens, output_tokens: manifest.output_tokens, tool_calls: manifest.tool_calls, cost_usd: manifest.cost_usd, session_entry_count: manifest.session_entry_count })) finiteCounter(value, `${arm} ${name}`);
	const runtimeRef = validateRef(runRoot, manifest.runtime_ref, `${arm} Runtime`);
	const payloadRef = validateRef(runRoot, manifest.first_payload_ref, `${arm} first payload`);
	const verifierRef = validateRef(runRoot, manifest.verifier_ref, `${arm} Verifier`);
	const outcomeRef = validateRef(runRoot, manifest.outcome_ref, `${arm} outcome`);
	const handoffRef = validateRef(runRoot, manifest.settled_handoff_ref, `${arm} settled handoff`);
	const linkRef = validateRef(runRoot, manifest.session_link_ref, `${arm} Session link`);
	const pairSessionRef = validateRef(pairRoot, manifest.session_ref, `${arm} Session`);

	const runtime = jsonAt<Goal25RuntimeEvidenceV35>(runRoot, runtimeRef.path, `${arm} Runtime`);
	const runtimeObject = exactKeys(runtime, RUNTIME_KEYS, `${arm} Runtime`);
	requireDigest(runtimeObject, "runtime_digest", `${arm} Runtime`);
	if (!Array.isArray(runtime.reservations)) throw new Error(`${arm} Runtime reservations are invalid`);
	runtime.reservations.forEach((entry, index) => exactKeys(entry, RESERVATION_KEYS, `${arm} reservation ${index + 1}`));
	if (runtime.reservations.length !== runtime.provider_dispatches || runtime.reservations.some((entry, index) => entry.request_attempt !== index + 1 || entry.dispatch_ordinal !== index + 1 || entry.state !== "responded" || entry.input_tokens === null || entry.output_tokens === null || entry.cost_usd === null)) throw new Error(`${arm} Runtime reservation lineage mismatch`);
	if (runtime.reservations.reduce((sum, entry) => sum + (entry.input_tokens ?? 0), 0) !== runtime.input_tokens || runtime.reservations.reduce((sum, entry) => sum + (entry.output_tokens ?? 0), 0) !== runtime.output_tokens || Math.abs(runtime.reservations.reduce((sum, entry) => sum + (entry.cost_usd ?? 0), 0) - runtime.cost_usd) > 1e-12) throw new Error(`${arm} Runtime reservation usage mismatch`);
	if (runtime.run_id !== runId || runtime.session_id !== sessionId || runtime.trajectory_outcome !== "settled" || runtime.task_outcome !== null || runtime.terminal_reason !== "successful_public_test" || !runtime.public_test_succeeded || !runtime.public_test_terminated || runtime.provider_request_after_successful_public_test || runtime.raw_harness_settled_events !== 1 || !runtime.usage_known || runtime.pending_provider_reservations !== 0 || runtime.pending_tool_calls !== 0 || runtime.pending_side_effects !== 0) throw new Error(`${arm} Runtime settled identity mismatch`);

	const outcome = jsonAt<Goal25ArmOutcomeV35>(runRoot, outcomeRef.path, `${arm} outcome`);
	const outcomeObject = exactKeys(outcome, OUTCOME_KEYS, `${arm} outcome`);
	requireDigest(outcomeObject, "outcome_digest", `${arm} outcome`);
	if (outcome.run_id !== runId || outcome.trajectory_outcome !== "settled" || outcome.task_outcome !== "passed" || outcome.verifier_runs !== 1 || !outcome.candidate_eligible) throw new Error(`${arm} outcome identity mismatch`);

	const verifier = jsonAt<JsonObject>(runRoot, verifierRef.path, `${arm} Verifier`);
	exactKeys(verifier, VERIFIER_KEYS, `${arm} Verifier`);
	const execution = exactKeys(verifier.execution, VERIFIER_EXECUTION_KEYS, `${arm} Verifier execution`);
	validateRef(runRoot, execution.source_snapshot_ref, `${arm} Verifier source`);
	validateRef(runRoot, verifier.full_output_ref, `${arm} Verifier output`);
	if (verifier.status !== "passed" || verifier.exit_code !== 0 || verifier.timed_out !== false || verifier.invalid_reason !== null || execution.source_digest_verified !== true) throw new Error(`${arm} Verifier result mismatch`);

	const link = jsonAt<Goal25SessionRunLinkV35>(runRoot, linkRef.path, `${arm} Session link`);
	const linkObject = exactKeys(link, LINK_KEYS, `${arm} Session link`);
	requireDigest(linkObject, "link_digest", `${arm} Session link`);
	const linkSessionRef = validateRef(pairRoot, link.session_ref, `${arm} linked Session`);
	if (link.arm !== arm || link.run_id !== runId || link.run_ref !== expectedManifestRef || link.session_id !== sessionId || link.session_ref_root !== "pair_root") throw new Error(`${arm} Session/Run linkage identity mismatch`);
	sameRef(pairSessionRef, linkSessionRef, `${arm} Session/Run link`);

	const handoff = jsonAt<Goal25SettledVerifierHandoffV35>(runRoot, handoffRef.path, `${arm} settled handoff`);
	const handoffObject = exactKeys(handoff, HANDOFF_KEYS, `${arm} settled handoff`);
	requireDigest(handoffObject, "handoff_digest", `${arm} settled handoff`);
	const snapshotSessionRef = validateRef(runRoot, handoff.session_snapshot_ref, `${arm} handoff Session snapshot`);
	validateRef(runRoot, handoff.workspace_snapshot_ref, `${arm} handoff Workspace snapshot`);
	sameRef(runtimeRef, validateRef(runRoot, handoff.runtime_ref, `${arm} handoff Runtime`), `${arm} handoff Runtime`);
	sameRef(payloadRef, validateRef(runRoot, handoff.first_payload_ref, `${arm} handoff first payload`), `${arm} handoff first payload`);
	if (handoff.run_id !== runId || handoff.session_id !== sessionId || handoff.trajectory_outcome !== "settled" || handoff.task_outcome !== null || handoff.handoff_sequence !== 1 || !handoff.runtime_authenticated || !handoff.runtime_matches_expected || !handoff.session_reopen_equal || !handoff.tool_calls_closed || !handoff.workspace_unchanged_since_terminal || !handoff.protected_unchanged || !handoff.first_payload_authenticated || !handoff.handoff_before_verifier) throw new Error(`${arm} settled handoff gate mismatch`);
	if (handoff.session_ref !== pairSessionRef.path || snapshotSessionRef.sha256 !== pairSessionRef.sha256 || snapshotSessionRef.size_bytes !== pairSessionRef.size_bytes) throw new Error(`${arm} settled handoff Session identity mismatch`);

	const payload = jsonAt<Goal2FirstProviderPayloadEvidenceV35>(runRoot, payloadRef.path, `${arm} first payload`);
	const payloadObject = exactKeys(payload, PAYLOAD_KEYS, `${arm} first payload`);
	requireDigest(payloadObject, "evidence_digest", `${arm} first payload`);
	if (payload.project_id !== PROJECT_ID || payload.case_id !== CASE_ID || payload.arm !== arm || payload.run_id !== runId || payload.capture_ordinal !== 1 || payload.tools_sha256 !== manifest.tool_interface_sha256 || payload.actual_last_user_text_sha256 !== payload.expected_last_user_text_sha256) throw new Error(`${arm} first payload semantic identity mismatch`);
	if ((arm === "base" && (payload.treatment_kind !== "task_prompt" || payload.skill_wrapper_sha256 !== null)) || (arm === "candidate" && (payload.treatment_kind !== "skill_wrapper_plus_task_prompt" || typeof payload.skill_wrapper_sha256 !== "string"))) throw new Error(`${arm} treatment identity mismatch`);

	const binding = jsonAt<JsonObject>(runRoot, "binding.json", `${arm} binding`);
	exactKeys(binding, BINDING_KEYS, `${arm} binding`);
	requireDigest(binding, "binding_digest", `${arm} binding`);
	const context = exactKeys(binding.binding_context, BINDING_CONTEXT_KEYS, `${arm} binding context`);
	const taskIdentity = exactKeys(context.trusted_task_identity, TASK_IDENTITY_KEYS, `${arm} trusted task identity`);
	const failureLineage = exactKeys(context.trusted_failure_lineage, FAILURE_LINEAGE_KEYS, `${arm} trusted failure lineage`);
	const bindingLineage = exactKeys(binding.lineage, BINDING_LINEAGE_KEYS, `${arm} binding lineage`);
	requireDigest(taskIdentity, "identity_digest", `${arm} trusted task identity`);
	requireDigest(failureLineage, "lineage_digest", `${arm} trusted failure lineage`);
	if (binding.binding_context_digest !== digestObject(context) || bindingLineage.admission_digest !== null) throw new Error(`${arm} binding context or admission lineage mismatch`);
	if (binding.project_id !== PROJECT_ID || binding.binding_digest !== manifest.binding_digest || binding.case_authority_digest !== manifest.case_authority_digest || taskIdentity.case_id !== CASE_ID) throw new Error(`${arm} binding semantic identity mismatch`);
	const boundEntries = binding.bound_entries;
	if (!Array.isArray(boundEntries) || (arm === "base" ? boundEntries.length !== 0 || binding.adaptive_skill_name !== null : boundEntries.length !== 1 || typeof binding.adaptive_skill_name !== "string")) throw new Error(`${arm} frozen treatment membership mismatch`);
	boundEntries.forEach((entry, index) => exactKeys(entry, BOUND_ENTRY_KEYS, `${arm} bound entry ${index + 1}`));

	const entries = sessionEntries(pairRoot, pairSessionRef);
	if (entries.length !== manifest.session_entry_count || digestObject(entries) !== manifest.session_entries_sha256 || link.session_entry_count !== manifest.session_entry_count || link.session_entries_sha256 !== manifest.session_entries_sha256 || handoff.session_entry_count !== manifest.session_entry_count || handoff.session_entries_sha256 !== manifest.session_entries_sha256) throw new Error(`${arm} Session evidence identity mismatch`);
	if (runtime.request_attempts !== manifest.request_attempts || runtime.provider_dispatches !== manifest.provider_dispatches || runtime.input_tokens !== manifest.input_tokens || runtime.output_tokens !== manifest.output_tokens || runtime.tool_calls !== manifest.tool_calls || runtime.cost_usd !== manifest.cost_usd || runtime.tool_interface_sha256 !== manifest.tool_interface_sha256 || outcome.tool_interface_sha256 !== manifest.tool_interface_sha256 || handoff.tool_interface_sha256 !== manifest.tool_interface_sha256 || runtime.workspace_tree_sha256_at_terminal !== manifest.final_workspace_sha256 || handoff.workspace_tree_sha256 !== manifest.final_workspace_sha256) throw new Error(`${arm} Run evidence counters or digests disagree`);

	return {
		view: { arm, manifest, runtime, outcome, verifier_status: verifier.status as "passed", verifier_id: String(verifier.verifier_id), manifest_source_ref: expectedManifestRef },
		payload,
	};
}

export function inspectGoal25PairV35(options: { pairRoot: string }): Goal25PairInspectionV35 {
	const result: Goal25PairInspectionV35 = { schema_version: 1, integrity_valid: false, errors: [], comparison: null, base: null, candidate: null, comparison_source_ref: "comparison.json" };
	try {
		const pairRoot = ordinaryRoot(options.pairRoot);
		const comparison = jsonAt<Goal25ComparisonV35>(pairRoot, "comparison.json", "Goal 2.5 comparison");
		const comparisonObject = exactKeys(comparison, COMPARISON_KEYS, "Goal 2.5 comparison");
		requireDigest(comparisonObject, "comparison_digest", "Goal 2.5 comparison");
		if (comparison.schema_version !== 1 || comparison.pair_id !== PAIR_ID || JSON.stringify(comparison.arm_order) !== JSON.stringify(["base", "candidate"])) throw new Error("Goal 2.5 comparison semantic identity mismatch");
		const baseManifestRef = validateRef(pairRoot, comparison.base_manifest_ref, "Base Manifest");
		const candidateManifestRef = validateRef(pairRoot, comparison.candidate_manifest_ref, "Candidate Manifest");
		const base = inspectArm(pairRoot, "base", baseManifestRef);
		const candidate = inspectArm(pairRoot, "candidate", candidateManifestRef);
		const fairness = compareGoal25FirstProviderPayloadsV35(base.payload, candidate.payload);
		if (fairness.fairness_digest !== comparison.payload_fairness_digest || fairness.tool_interface_sha256 !== comparison.tool_interface_sha256) throw new Error("Goal 2.5 payload fairness identity mismatch");
		if (base.view.manifest.initial_workspace_sha256 !== candidate.view.manifest.initial_workspace_sha256 || base.view.manifest.final_workspace_sha256 !== candidate.view.manifest.final_workspace_sha256 || base.view.manifest.case_authority_digest !== candidate.view.manifest.case_authority_digest || base.view.manifest.tool_interface_sha256 !== candidate.view.manifest.tool_interface_sha256) throw new Error("Goal 2.5 Base/Candidate frozen identity mismatch");
		const caseAuthority = jsonAt<JsonObject>(pairRoot, `authority/case/${CASE_ID}.json`, "Goal 2.5 Case authority");
		exactKeys(caseAuthority, CASE_AUTHORITY_KEYS, "Goal 2.5 Case authority");
		exactKeys(caseAuthority.allowed_failure_lineage, FAILURE_LINEAGE_KEYS, "Goal 2.5 Case failure lineage");
		const providerProfile = exactKeys(caseAuthority.provider_profile, PROVIDER_PROFILE_KEYS, "Goal 2.5 Provider profile");
		requireDigest(providerProfile, "profile_digest", "Goal 2.5 Provider profile");
		requireDigest(caseAuthority, "authority_digest", "Goal 2.5 Case authority");
		if (caseAuthority.project_id !== PROJECT_ID || caseAuthority.case_id !== CASE_ID || caseAuthority.authority_digest !== base.view.manifest.case_authority_digest) throw new Error("Goal 2.5 Case authority semantic identity mismatch");
		const sums = {
			// Access counters are one shared monotonic Pair authority and the Candidate
			// Runtime records its final aggregate value. Usage counters are per arm.
			credential_reads: candidate.view.runtime.credential_reads,
			network_calls: candidate.view.runtime.network_calls,
			external_provider_calls: candidate.view.runtime.external_provider_calls,
			real_model_calls: candidate.view.runtime.real_model_calls,
			provider_dispatches: base.view.runtime.provider_dispatches + candidate.view.runtime.provider_dispatches,
			input_tokens: base.view.runtime.input_tokens + candidate.view.runtime.input_tokens,
			output_tokens: base.view.runtime.output_tokens + candidate.view.runtime.output_tokens,
			cost_usd: base.view.runtime.cost_usd + candidate.view.runtime.cost_usd,
		};
		for (const name of ["credential_reads", "network_calls", "external_provider_calls", "real_model_calls"] as const) {
			if (base.view.runtime[name] > candidate.view.runtime[name]) throw new Error(`Goal 2.5 aggregate ${name} is not monotonic`);
		}
		for (const [name, value] of Object.entries(sums)) if (Math.abs(value - finiteCounter(comparison[name as keyof typeof sums], `comparison ${name}`)) > 1e-12) throw new Error(`Goal 2.5 aggregate ${name} mismatch`);
		if (comparison.base_task_outcome !== "passed" || comparison.candidate_task_outcome !== "passed" || comparison.base_task_outcome !== base.view.outcome.task_outcome || comparison.candidate_task_outcome !== candidate.view.outcome.task_outcome) throw new Error("Goal 2.5 comparison outcome mismatch");
		result.comparison = comparison;
		result.base = base.view;
		result.candidate = candidate.view;
		result.integrity_valid = true;
	} catch (error) {
		result.errors.push(error instanceof Error ? error.message : "Goal 2.5 inspection failed");
	}
	return result;
}
