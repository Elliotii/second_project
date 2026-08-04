import type { BoundedTaskPolicy } from "../types.ts";

export const V1_STRATEGY_IDS = ["baseline", "skill_only", "skill_plus_runtime_control"] as const;
export type StrategyIdV1 = (typeof V1_STRATEGY_IDS)[number];

export const V1B_ARM_IDS = ["A", "B", "C"] as const;
export type ArmIdV1B = (typeof V1B_ARM_IDS)[number];

export interface BudgetCapsV1B {
	provider_requests: number;
	tool_calls: number;
	tokens: number;
	wall_time_ms: number;
	cost_usd: number;
	verifier_runs: number;
	child_attempts: number;
}

export interface BudgetUsageV1B {
	provider_requests: number;
	tool_calls: number;
	tokens: number;
	active_execution_time_ms: number;
	cost_usd: number;
	verifier_runs: number;
	child_attempts: number;
}

export interface ExecutionCellV1B {
	cell_id: string;
	planned_run_id: string;
	task_id: string;
	repetition: 1 | 2;
	order_slot: number;
	block: number;
	block_slot: 1 | 2 | 3;
	arm: ArmIdV1B;
	strategy_id: StrategyIdV1;
}

export interface ExecutionManifestV1B {
	schema_version: "v1b-execution-manifest-v1";
	manifest_id: string;
	experiment_id: "v1-b-bounded-pilot";
	experiment_revision: 1;
	execution_mode: "stage1_zero_call" | "stage2_real";
	created_at: string;
	control_baseline_commit: "de75ca7a4d5376713f01ca475bc5ad7637c70443";
	control_baseline_tree: "e930e1d0885b52bf911ed78912786723f321f06e";
	execution_baseline_commit: string;
	workbench_source_digest: string;
	pi_commit: "027a5847901b5dde30270abaa1041046cd2b4b55";
	pi_version: "0.82.1";
	protocol_id: "v1_skill_runtime_comparison";
	credential_profile_name: "DEEPSEEK_API_KEY";
	real_execution_authorized: boolean;
	bindings: {
		task_pack_digest: string;
		task_digests: Record<string, string>;
		workspace_digests: Record<string, string>;
		skill_digest: string;
		strategy_digests: Record<StrategyIdV1, string>;
		model_profile_digest: string;
		base_prompt_digest: string;
		tool_profile_digest: string;
		verifier_digests: Record<string, string>;
	};
	budgets: {
		initial_attempt: BudgetCapsV1B;
		arm_a_or_b_run: BudgetCapsV1B;
		arm_c_run: BudgetCapsV1B;
		pilot: BudgetCapsV1B;
	};
	policy: {
		alternate_model_fallback: false;
		retry_same_run: false;
		automatic_replacement: false;
		invalid_ratio_pause_threshold: 0.25;
		repeated_invalid_cause_pause_count: 2;
		failure_taxonomy: readonly [
			"task_pass", "task_fail", "treatment_guardrail_failure", "infrastructure_invalid",
			"evidence_invalid", "global_budget_stop", "paused_unclassified",
		];
	};
	cells: ExecutionCellV1B[];
}

export type LedgerStateV1B = "planned" | "started" | "terminal" | "invalid" | "paused";
export interface LedgerEntryV1B {
	schema_version: 1;
	seq: number;
	timestamp: string;
	manifest_id: string;
	cell_id: string;
	planned_run_id: string;
	state: LedgerStateV1B;
	cause_id: string | null;
	run_result_ref: string | null;
}

export interface AttemptEvidenceV1B {
	attempt_id: string;
	ordinal: 1 | 2;
	parent_attempt_id: string | null;
	trigger: "initial" | "verification_recovery";
	session_id: string;
	workspace_id: string;
	settled: true;
	provider_requests: number;
	tool_calls: number;
	tokens: number;
	cost_usd: number;
	active_execution_time_ms: number;
	verifier_status: VerifierStatusV1;
}

export type FailureClassV1B =
	| "task_pass"
	| "task_fail"
	| "treatment_guardrail_failure"
	| "infrastructure_invalid"
	| "evidence_invalid"
	| "global_budget_stop"
	| "paused_unclassified";

export interface BudgetReservationEvidenceV1B {
	reservation_id: string;
	scope_id: string;
	level: "attempt" | "run" | "pilot";
	kind: "provider_request" | "tool_call" | "verifier" | "child" | "attempt_time";
	before: BudgetUsageV1B;
	reserved: BudgetUsageV1B;
	actual: BudgetUsageV1B;
	after: BudgetUsageV1B;
	cap: BudgetCapsV1B;
}

export interface InitialDispatchEvidenceV1B {
	model: unknown;
	context: { systemPrompt: string | null; messages: unknown[]; tools: unknown[] };
	options: unknown;
	provider_payload: unknown;
	payload_sha256: string;
}

export interface WorkspaceTreeRefV1B {
	path: "workspace";
	sha256: string;
	file_count: number;
	size_bytes: number;
	scan: { passed: true; match_count: 0; reasoning_payloads: 0 };
}

export interface TerminalCellEvidenceV1B {
	schema_version: 1;
	manifest_id: string;
	cell: ExecutionCellV1B;
	run_id: string;
	session_id: string;
	workspace_id: string;
	disposition: "terminal" | "invalid" | "paused";
	failure_class: FailureClassV1B;
	cause_id: string | null;
	invalid_attribution: "none" | "treatment" | "infrastructure" | "evidence";
	exclusion_preauthorized: boolean;
	initial_dispatch: InitialDispatchEvidenceV1B;
	attempts: AttemptEvidenceV1B[];
	initial_verifier_status: VerifierStatusV1;
	final_verifier_status: VerifierStatusV1;
	recovery_eligible: boolean;
	recovery_started: boolean;
	budget_usage: BudgetUsageV1B;
	reservations: BudgetReservationEvidenceV1B[];
	protected_paths_unchanged: boolean;
	secret_scan: { passed: true; match_count: 0; reasoning_payloads: 0 };
	workspace_tree_ref: WorkspaceTreeRefV1B;
	real_call_counters: { credential_reads: number; network_calls: number; provider_calls: number; model_calls: number };
	artifact_refs: Array<{ path: string; sha256: string; size_bytes: number }>;
	created_at: string;
}

export interface SkillRefV1 {
	schema_version: 1;
	skill_id: "reliability-completion-v1";
	name: "reliability-completion";
	description: string;
	parent_ref: "fixtures/skills/v1";
	source_ref: "fixtures/skills/v1/reliability-completion/SKILL.md";
	canonical_source_path: string;
	source_sha256: string;
	source_size_bytes: number;
	wrapper_sha256: string;
	wrapper_size_bytes: number;
	disable_model_invocation: true;
	invocation_mode: "explicit_initial_skill";
	catalog_visibility: "hidden";
	self_contained: true;
	relative_resources: [];
}

export interface StrategySpecV1 {
	schema_version: 1;
	strategy_id: StrategyIdV1;
	initial_invocation: "prompt" | "skill";
	skill_id: string | null;
	measurement_verifier_id: "v1_measurement_verifier";
	completion_policy_id: "observe_only" | "verify_recover_once_same_session";
	recovery_mode: "none" | "same_session_once";
	recovery_budget: 0 | 1;
	verifier_runs_max: 1 | 2;
	initial_budget_id: "v1_common_initial_budget";
	child_reserve: "none" | "c_host_only_once";
	model_visible_policy_fields: [];
}

export interface TaskSpecV1 extends BoundedTaskPolicy {
	schema_version: 1;
	task_id: string;
	family: "normal" | "hidden_stronger" | "public_check_dependent" | "scope_guardrail";
	instruction_ref: string;
	instruction_sha256: string;
	workspace_source_ref: string;
	workspace_source_digest: string;
	public_check_id: "public_test";
	external_verifier_ref: string;
	external_verifier_sha256: string;
	external_verifier_id: string;
	reference_patch_ref: string;
	reference_patch_sha256: string;
	tool_profile_id: "bounded_tools_v1";
}

export interface ExperimentMemberV1 {
	run_id: string;
	task_id: string;
	repetition: 1 | 2;
	order_slot: number;
	strategy_id: StrategyIdV1;
	disposition: "required_terminal" | "preauthorized_paused_before_execution";
	pause_reason: "operator_declared_before_execution" | null;
}

export interface ExperimentManifestV1 {
	schema_version: 1;
	experiment_id: string;
	experiment_revision: 1;
	protocol_id: "v1_skill_runtime_comparison";
	manifest_id: string;
	created_at: string;
	task_pack_digest: string;
	task_digests: Record<string, string>;
	workspace_digests: Record<string, string>;
	skill_digest: string;
	strategy_digests: Record<StrategyIdV1, string>;
	model_profile_id: "deepseek_fixed_v1";
	model_profile_digest: string;
	thinking_level: "off";
	base_prompt_id: "project_minimal_base_v1";
	base_prompt_digest: string;
	tool_profile_id: "bounded_tools_v1";
	tool_profile_digest: string;
	verifier_digests: Record<string, string>;
	workbench_commit: string;
	workbench_tree_digest: string;
	pi_commit: "027a5847901b5dde30270abaa1041046cd2b4b55";
	members: ExperimentMemberV1[];
}

export type VerifierStatusV1 = "passed" | "failed" | "invalid" | "infrastructure_error" | "cancelled";
export interface AttemptIdentityV1 { attempt_id: string; ordinal: 1 | 2; parent_attempt_id: string | null; }

export interface RunResultV1 extends ExperimentMemberV1 {
	experiment_id: string;
	manifest_id: string;
	terminal: true;
	verifier_status: VerifierStatusV1;
	attempt_count: 1 | 2;
	child_attempt_count: 0 | 1;
	evidence: {
		task_digest: string;
		workspace_source_digest: string;
		prompt_digest: string;
		skill_digest: string | null;
		strategy_digest: string;
		tool_digest: string;
		verifier_digest: string;
		model_profile_digest: string;
		workbench_digest: string;
		pi_digest: string;
		initial_payload_digest: string;
		skill_wrapper_bytes: number;
		skill_body_bytes: number;
		attempts: AttemptIdentityV1[];
		session_id: string;
		workspace_id: string;
		initial_verifier_status: VerifierStatusV1;
		final_verifier_status: VerifierStatusV1;
		recovery_eligible: boolean;
		recovery_budget_available: boolean;
		recovery_started: boolean;
		provider_requests: number;
		tool_calls: number;
		tokens: number | "unknown";
		wall_time_ms: number;
		cost_usd: number;
		invalid_attribution: "none" | "treatment" | "infrastructure" | "evidence";
		exclusion_preauthorized: boolean;
		terminal_refs: string[];
	};
}

export interface StrategyAggregationV1 {
	planned: number;
	observed: number;
	comparable: number;
	excluded_infrastructure: number;
	treatment_invalid: number;
	passed: number;
	paused_before_execution: number;
}

export interface AggregationResultV1 {
	schema_version: 1;
	experiment_id: string;
	manifest_id: string;
	planned_runs: number;
	observed_runs: number;
	comparable_runs: number;
	excluded_infrastructure_runs: number;
	treatment_invalid_runs: number;
	passed_runs: number;
	paused_before_execution_runs: number;
	recovery_eligible: number;
	recovery_started: number;
	recovery_succeeded: number;
	totals: { provider_requests: number; tool_calls: number; wall_time_ms: number; cost_usd: number };
	by_strategy: Record<StrategyIdV1, StrategyAggregationV1>;
}

export function validateStrategySpecV1(value: StrategySpecV1): void {
	if (value.schema_version !== 1 || !V1_STRATEGY_IDS.includes(value.strategy_id)) throw new Error("Strategy identity invalid");
	const expected = value.strategy_id === "baseline"
		? { invocation: "prompt", skill: null, recovery: 0, verifiers: 1 }
		: value.strategy_id === "skill_only"
			? { invocation: "skill", skill: "reliability-completion-v1", recovery: 0, verifiers: 1 }
			: { invocation: "skill", skill: "reliability-completion-v1", recovery: 1, verifiers: 2 };
	if (value.initial_invocation !== expected.invocation || value.skill_id !== expected.skill || value.recovery_budget !== expected.recovery || value.verifier_runs_max !== expected.verifiers) throw new Error("Strategy semantics invalid");
	if (value.measurement_verifier_id !== "v1_measurement_verifier" || value.initial_budget_id !== "v1_common_initial_budget" || value.model_visible_policy_fields.length !== 0) throw new Error("Strategy fairness identity invalid");
	if (value.strategy_id === "skill_plus_runtime_control" ? value.completion_policy_id !== "verify_recover_once_same_session" || value.recovery_mode !== "same_session_once" || value.child_reserve !== "c_host_only_once" : value.completion_policy_id !== "observe_only" || value.recovery_mode !== "none" || value.child_reserve !== "none") throw new Error("Strategy completion semantics invalid");
}

function digest(value: string): boolean { return /^[0-9a-f]{64}$/.test(value) && value !== "0".repeat(64); }
export function validateTaskSpecV1(value: TaskSpecV1): void {
	if (value.schema_version !== 1 || !value.task_id.startsWith("v1-") || !value.instruction_ref.startsWith("fixtures/tasks/v1/")) throw new Error("Task identity invalid");
	if (!value.external_verifier_ref.startsWith("fixtures/verifiers/v1/") || !value.reference_patch_ref.startsWith("fixtures/calibration/v1/")) throw new Error("Task verifier/calibration boundary invalid");
	if (!digest(value.instruction_sha256) || !digest(value.workspace_source_digest) || !digest(value.external_verifier_sha256) || !digest(value.reference_patch_sha256)) throw new Error("Task digest invalid");
	if (value.writable_paths.join("\0") !== "src/subject.ts" || value.protected_paths.join("\0") !== "package.json\0test/public.test.mjs") throw new Error("Task writable/protected boundary invalid");
	if (value.command_descriptors.length !== 1 || value.command_descriptors[0]?.command_id !== "public_test" || value.command_descriptors[0].argv.join("\0") !== "--test\0test/public.test.mjs") throw new Error("Task public check invalid");
}
