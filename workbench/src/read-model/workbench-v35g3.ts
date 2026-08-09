import type {
	AdaptationLineageSafeViewV35,
	Goal25ArmSafeViewV35,
	Goal25ComparisonSafeViewV35,
	Goal3SessionRunViewV35,
	StateHistorySafeViewV35,
	V2RecoverySafeViewV35,
} from "../contracts/v35g3-types.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import type { PersistentSessionServiceV35 } from "../session/persistent-session-v35.ts";
import { inspectStateStoreV3 } from "../state/store-v3.ts";
import { inspectGoal25PairV35 } from "../v35g25/inspect-v35g25.ts";
import { readV2RecoveryComparisonV35, readV3PromptAdaptationV35 } from "./read-model-v35.ts";

const GOAL25_RESULT = "Both arms passed; no task-success advantage was observed for the Skill; Candidate used more tokens.";

export async function readSessionRunViewV35(service: PersistentSessionServiceV35): Promise<Goal3SessionRunViewV35> {
	const sessions = service.list().map((entry) => ({
		session_id: entry.session_id,
		title: entry.title,
		created_at: entry.created_at,
		updated_at: entry.updated_at,
		parent_session_id: entry.parent_session_id,
		run_ids: entry.run_ids,
	}));
	const details = [];
	for (const session of sessions) details.push(await service.inspect(session.session_id));
	return { schema_version: 1, source_status: "available", sessions, details };
}

function armView(arm: NonNullable<ReturnType<typeof inspectGoal25PairV35>["base"]>): Goal25ArmSafeViewV35 {
	return {
		arm: arm.arm,
		run_id: arm.manifest.run_id,
		session_id: arm.manifest.session_id,
		trajectory_outcome: arm.manifest.trajectory_outcome,
		task_outcome: arm.manifest.task_outcome,
		verifier_status: arm.verifier_status,
		verifier_id: arm.verifier_id,
		request_attempts: arm.manifest.request_attempts,
		provider_dispatches: arm.manifest.provider_dispatches,
		input_tokens: arm.manifest.input_tokens,
		output_tokens: arm.manifest.output_tokens,
		tool_calls: arm.manifest.tool_calls,
		cost_usd: arm.manifest.cost_usd,
		manifest_digest: arm.manifest.manifest_digest,
		binding_digest: arm.manifest.binding_digest,
		case_authority_digest: arm.manifest.case_authority_digest,
		tool_interface_sha256: arm.manifest.tool_interface_sha256,
		session_entries_sha256: arm.manifest.session_entries_sha256,
		source_ref: arm.manifest_source_ref,
	};
}

export function readGoal25ComparisonSafeV35(options: { pairRoot: string }): Goal25ComparisonSafeViewV35 {
	const inspected = inspectGoal25PairV35(options);
	if (!inspected.integrity_valid || !inspected.comparison || !inspected.base || !inspected.candidate) throw new Error(`Goal 2.5 Pair inspection rejected: ${inspected.errors.join("; ")}`);
	const comparison = inspected.comparison;
	return {
		schema_version: 1,
		kind: "goal25_skill_comparison",
		source_status: "available",
		derived_non_authoritative: false,
		pair_id: comparison.pair_id,
		comparison_digest: comparison.comparison_digest,
		payload_fairness_digest: comparison.payload_fairness_digest,
		result_statement: GOAL25_RESULT,
		base: armView(inspected.base),
		candidate: armView(inspected.candidate),
		aggregates: {
			credential_reads: comparison.credential_reads,
			network_calls: comparison.network_calls,
			external_provider_calls: comparison.external_provider_calls,
			real_model_calls: comparison.real_model_calls,
			provider_dispatches: comparison.provider_dispatches,
			input_tokens: comparison.input_tokens,
			output_tokens: comparison.output_tokens,
			cost_usd: comparison.cost_usd,
		},
		source_refs: ["comparison.json", inspected.base.manifest_source_ref, inspected.candidate.manifest_source_ref],
	};
}

export function unavailableGoal25ComparisonV35(): Goal25ComparisonSafeViewV35 {
	return {
		schema_version: 1,
		kind: "goal25_skill_comparison",
		source_status: "unavailable",
		derived_non_authoritative: false,
		pair_id: null,
		comparison_digest: null,
		payload_fairness_digest: null,
		result_statement: "Goal 2.5 comparison evidence is unavailable.",
		base: null,
		candidate: null,
		aggregates: { credential_reads: "not_recorded", network_calls: "not_recorded", external_provider_calls: "not_recorded", real_model_calls: "not_recorded", provider_dispatches: "not_recorded", input_tokens: "not_recorded", output_tokens: "not_recorded", cost_usd: "not_recorded" },
		source_refs: [],
	};
}

export function readV2RecoverySafeV35(options: { sourceRoot: string; terminalRef?: string }): V2RecoverySafeViewV35 {
	const view = readV2RecoveryComparisonV35(options);
	return {
		schema_version: 1,
		kind: "v2_recovery",
		source_status: view.source_status,
		outcome: view.outcome,
		selected_candidate_id: view.selected_candidate_id,
		candidate_ids: view.candidate_ids,
		note: "V2 is closed with limited mechanism evidence; the real Negative produced no Verifier result and is not a full PASS.",
		source_refs: view.source_refs,
	};
}

export function unavailableV2RecoveryV35(): V2RecoverySafeViewV35 {
	return { schema_version: 1, kind: "v2_recovery", source_status: "unavailable", outcome: null, selected_candidate_id: null, candidate_ids: [], note: "Historical V2 fields are unavailable; missing values are not inferred.", source_refs: [] };
}

export function readAdaptationLineageSafeV35(options: { sourceRoot: string }): AdaptationLineageSafeViewV35 {
	const source = readV3PromptAdaptationV35(options);
	const stages: AdaptationLineageSafeViewV35["stages"] = [
		{ stage: "evidence", status: "not_recorded", label: "Frozen evidence", digest: null, source_ref: null },
		{ stage: "diagnosis", status: "not_recorded", label: "Diagnosis", digest: null, source_ref: null },
		{ stage: "lesson", status: "not_recorded", label: "Lesson", digest: null, source_ref: null },
		{ stage: "prompt_or_skill", status: source.source_status, label: source.runtime_path ?? "Prompt or Skill", digest: source.binding_digest, source_ref: source.source_refs[1] ?? null },
		{ stage: "validation", status: source.verifier_status === null ? "not_recorded" : "available", label: source.verifier_status ?? "Validation not recorded", digest: null, source_ref: source.source_refs[0] ?? null },
		{ stage: "decision", status: "not_recorded", label: "Decision", digest: null, source_ref: null },
		{ stage: "active_state", status: "not_recorded", label: "Active State", digest: null, source_ref: null },
		{ stage: "selective_binding", status: source.binding_digest === null ? "not_recorded" : "available", label: "Selective binding", digest: source.binding_digest, source_ref: source.source_refs[1] ?? null },
	];
	return { schema_version: 1, kind: "v3_adaptation_lineage", source_status: source.source_status, run_id: source.run_id, runtime_path: source.runtime_path, stages, prompt_diff: "not_recorded", skill_diff: "not_recorded", selective_binding_explanation: "Accepted State entries bind only when frozen task and failure-lineage predicates match; the browser does not decide binding." };
}

export function unavailableAdaptationLineageV35(): AdaptationLineageSafeViewV35 {
	const labels: Array<[AdaptationLineageSafeViewV35["stages"][number]["stage"], string]> = [["evidence", "Evidence"], ["diagnosis", "Diagnosis"], ["lesson", "Lesson"], ["prompt_or_skill", "Prompt or Skill"], ["validation", "Validation"], ["decision", "Decision"], ["active_state", "Active State"], ["selective_binding", "Selective binding"]];
	return { schema_version: 1, kind: "v3_adaptation_lineage", source_status: "unavailable", run_id: null, runtime_path: null, stages: labels.map(([stage, label]) => ({ stage, status: "unavailable", label, digest: null, source_ref: null })), prompt_diff: "not_recorded", skill_diff: "not_recorded", selective_binding_explanation: "Adaptation lineage is unavailable; no missing historical decision is inferred." };
}

export async function readStateHistorySafeV35(options: { stateRoot: string; projectId: string }): Promise<StateHistorySafeViewV35> {
	const inspected = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	if (!inspected.integrity_valid || inspected.active === null) throw new Error(`State inspection rejected: ${inspected.errors.join("; ")}`);
	return {
		schema_version: 1,
		source_status: "available",
		active: { binding_revision: inspected.active.binding_revision, state_version: inspected.active.state_version, state_digest: inspected.active.state_digest, decision_id: inspected.active.decision_id },
		versions: inspected.versions.map((version) => ({ state_version: version.state_version, state_digest: version.state_digest, parent_state_digest: version.parent_state_digest, entry_kinds: version.entries.map((entry) => entry.kind) })),
		decisions: inspected.decisions.map((decision) => ({ decision_sequence: decision.decision_sequence, decision_id: decision.decision_id, kind: decision.kind, result: decision.result, reason: decision.reason, prior_state_digest: decision.prior_active?.state_digest ?? null, next_state_digest: decision.next_active.state_digest, rollback_target_digest: decision.rollback_target_digest, decision_digest: decision.decision_digest })),
		rollback_mutation: "deferred",
	};
}

export function unavailableStateHistoryV35(): StateHistorySafeViewV35 {
	return { schema_version: 1, source_status: "unavailable", active: "unavailable", versions: [], decisions: [], rollback_mutation: "deferred" };
}
