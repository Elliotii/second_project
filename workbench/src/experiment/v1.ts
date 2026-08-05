import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AggregationResultV1, ExecutionCellV1B, ExecutionManifestV1B, ExperimentManifestV1, RunResultV1, StrategyAggregationV1, StrategyIdV1 } from "../contracts/v1-types.ts";
import { V1_STRATEGY_IDS } from "../contracts/v1-types.ts";
import { DEEPSEEK_FIXED_PROFILE_V1 } from "../provider/fixed-provider-v1.ts";
import { createBoundedToolProfile } from "../pi/tool-profile.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import { loadCandidateTaskPackV1 } from "./task-pack-v1.ts";

const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55" as const;
const WORKBENCH_COMMIT = "c9f91057db60cf61dab0d3aa305564d498c89cd6";
const ACCEPTED_V1A_WORKBENCH_TREE_DIGEST = "aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2";
const RUNTIME_DIGEST_DOMAIN = [
	"workbench/src/completion/controller-v1.ts", "workbench/src/contracts/v1-types.ts", "workbench/src/experiment/task-pack-v1.ts",
	"workbench/src/experiment/v1.ts", "workbench/src/pi/pi-adapter-v1.ts", "workbench/src/pi/tool-profile.ts",
	"workbench/src/provider/fixed-provider-v1.ts", "workbench/src/skill/runtime-v1.ts", "workbench/src/verifier/runner.ts",
] as const;
const STRATEGY_PATHS: Record<StrategyIdV1, string> = { baseline: "fixtures/strategies/v1/baseline.json", skill_only: "fixtures/strategies/v1/skill-only.json", skill_plus_runtime_control: "fixtures/strategies/v1/skill-runtime-control.json" };
function validDigest(value: string): boolean { return /^[0-9a-f]{64}$/.test(value) && value !== "0".repeat(64); }

export interface ManifestBindingsV1 extends Omit<ExperimentManifestV1, "schema_version" | "experiment_id" | "experiment_revision" | "protocol_id" | "manifest_id" | "created_at" | "thinking_level" | "members"> {}
export function deriveManifestBindingsV1(projectRoot: string): ManifestBindingsV1 {
	const tasks = loadCandidateTaskPackV1(projectRoot);
	const task_digests = Object.fromEntries(tasks.map((task) => [task.task_id, digestObject(task)]));
	const workspace_digests = Object.fromEntries(tasks.map((task) => [task.task_id, task.workspace_source_digest]));
	const profile = createBoundedToolProfile(resolve(projectRoot, tasks[0]!.workspace_source_ref), tasks[0]!);
	const toolProjection = profile.tools.map((tool) => ({ name: tool.name, description: tool.description, parameters: tool.parameters }));
	const verifier_digests = Object.fromEntries(tasks.map((task) => [task.external_verifier_id, task.external_verifier_sha256]));
	return { task_pack_digest: digestObject({ domain: "V1 task specs in task-id order", task_digests }), task_digests, workspace_digests,
		skill_digest: fileSha256(resolve(projectRoot, "fixtures/skills/v1/reliability-completion/SKILL.md")),
		strategy_digests: Object.fromEntries(V1_STRATEGY_IDS.map((id) => [id, fileSha256(resolve(projectRoot, STRATEGY_PATHS[id]))])) as Record<StrategyIdV1, string>,
		model_profile_id: "deepseek_fixed_v1", model_profile_digest: digestObject(DEEPSEEK_FIXED_PROFILE_V1), base_prompt_id: "project_minimal_base_v1", base_prompt_digest: SYSTEM_PROMPT_SHA256,
		tool_profile_id: "bounded_tools_v1", tool_profile_digest: digestObject(toolProjection), verifier_digests, workbench_commit: WORKBENCH_COMMIT,
		workbench_tree_digest: ACCEPTED_V1A_WORKBENCH_TREE_DIGEST, pi_commit: PI_COMMIT };
}

export function manifestIdentityV1(manifest: ExperimentManifestV1): string { return digestObject({ ...manifest, manifest_id: "" }); }
function deterministicMembersV1(): ExperimentManifestV1["members"] {
	const members: ExperimentManifestV1["members"] = [];
	for (const task_id of ["v1-parse-duration", "v1-bounded-index", "v1-state-transition", "v1-stable-format"]) for (const repetition of [1, 2] as const) for (const strategy_id of V1_STRATEGY_IDS) members.push({ run_id: `${task_id}-${repetition}-${strategy_id}`, task_id, repetition, order_slot: members.length + 1, strategy_id, disposition: "required_terminal", pause_reason: null });
	return members;
}
export function buildDeterministicManifestV1(projectRoot: string): ExperimentManifestV1 {
	const manifest: ExperimentManifestV1 = { schema_version: 1, experiment_id: "v1-bounded-pilot", experiment_revision: 1, protocol_id: "v1_skill_runtime_comparison", manifest_id: "", created_at: "2026-08-03T00:00:00.000Z", thinking_level: "off", ...deriveManifestBindingsV1(projectRoot), members: deterministicMembersV1() };
	manifest.manifest_id = manifestIdentityV1(manifest); return manifest;
}

export function validateExperimentManifestV1(manifest: ExperimentManifestV1, projectRoot: string): void {
	if (manifest.schema_version !== 1 || manifest.experiment_revision !== 1 || manifest.protocol_id !== "v1_skill_runtime_comparison" || !manifest.experiment_id || !manifest.created_at) throw new Error("Manifest metadata invalid");
	if (manifest.pi_commit !== PI_COMMIT || manifest.thinking_level !== "off" || manifest.workbench_commit !== WORKBENCH_COMMIT) throw new Error("Manifest frozen source identity invalid");
	const digests = [manifest.task_pack_digest, manifest.skill_digest, ...Object.values(manifest.task_digests), ...Object.values(manifest.workspace_digests), ...Object.values(manifest.strategy_digests), manifest.model_profile_digest, manifest.base_prompt_digest, manifest.tool_profile_digest, ...Object.values(manifest.verifier_digests), manifest.workbench_tree_digest];
	if (digests.some((value) => !validDigest(value))) throw new Error("Manifest placeholder or malformed digest rejected");
	if (manifest.manifest_id !== manifestIdentityV1(manifest)) throw new Error("Manifest identity drift");
	const ids = new Set<string>(); const cells = new Set<string>(); const slots = new Set<number>();
	for (const member of manifest.members) {
		if (ids.has(member.run_id)) throw new Error(`Duplicate Run membership: ${member.run_id}`); ids.add(member.run_id);
		if (!V1_STRATEGY_IDS.includes(member.strategy_id)) throw new Error("Unknown Strategy membership");
		if (!Number.isInteger(member.order_slot) || member.order_slot < 1 || slots.has(member.order_slot)) throw new Error("Experiment order slot invalid"); slots.add(member.order_slot);
		if (member.disposition === "required_terminal" ? member.pause_reason !== null : member.pause_reason !== "operator_declared_before_execution") throw new Error("Pause disposition is not pre-authorized and typed");
		const cell = `${member.task_id}\0${member.repetition}\0${member.strategy_id}`; if (cells.has(cell)) throw new Error(`Duplicate experiment cell: ${cell}`); cells.add(cell);
	}
	if (stableJson(manifest) !== stableJson(buildDeterministicManifestV1(projectRoot))) throw new Error("Complete frozen Manifest membership/source binding drift");
}

function emptyCell(): StrategyAggregationV1 { return { planned: 0, observed: 0, comparable: 0, excluded_infrastructure: 0, treatment_invalid: 0, passed: 0, paused_before_execution: 0 }; }
function assertRunIdentity(manifest: ExperimentManifestV1, run: RunResultV1): void {
	const expectedSkill = run.strategy_id === "baseline" ? null : manifest.skill_digest;
	const expectedVerifier = manifest.verifier_digests[Object.keys(manifest.verifier_digests).find((id) => id.includes(run.task_id.replace(/^v1-/, ""))) ?? ""];
	if (run.evidence.task_digest !== manifest.task_digests[run.task_id] || run.evidence.workspace_source_digest !== manifest.workspace_digests[run.task_id] || run.evidence.prompt_digest !== manifest.base_prompt_digest || run.evidence.skill_digest !== expectedSkill || run.evidence.strategy_digest !== manifest.strategy_digests[run.strategy_id] || run.evidence.tool_digest !== manifest.tool_profile_digest || run.evidence.verifier_digest !== expectedVerifier || run.evidence.model_profile_digest !== manifest.model_profile_digest || run.evidence.workbench_digest !== manifest.workbench_tree_digest || run.evidence.pi_digest !== manifest.pi_commit) throw new Error(`Run bounded identity drift: ${run.run_id}`);
}
function assertAttempts(run: RunResultV1): void {
	const attempts = run.evidence.attempts; if (attempts.length !== run.attempt_count || attempts[0]?.ordinal !== 1 || attempts[0].parent_attempt_id !== null) throw new Error(`Illegal attempt lineage: ${run.run_id}`);
	const child = run.child_attempt_count === 1;
	if (child && (run.strategy_id !== "skill_plus_runtime_control" || run.attempt_count !== 2 || attempts[1]?.ordinal !== 2 || attempts[1].parent_attempt_id !== attempts[0]!.attempt_id || run.evidence.initial_verifier_status !== "failed" || !run.evidence.recovery_eligible || !run.evidence.recovery_budget_available || !run.evidence.recovery_started)) throw new Error(`Illegal child topology: ${run.run_id}`);
	if (!child && (run.attempt_count !== 1 || run.evidence.recovery_started)) throw new Error(`Illegal child topology: ${run.run_id}`);
	if (run.strategy_id !== "skill_plus_runtime_control" && (run.evidence.recovery_eligible || child)) throw new Error(`Non-C recovery rejected: ${run.run_id}`);
	if (run.strategy_id === "skill_plus_runtime_control" && run.evidence.initial_verifier_status === "failed" && run.evidence.recovery_eligible && run.evidence.recovery_budget_available && !child) throw new Error(`Eligible C recovery missing: ${run.run_id}`);
	if (child && ["passed", "invalid", "infrastructure_error", "cancelled"].includes(run.evidence.initial_verifier_status)) throw new Error(`Ineligible verifier status created child: ${run.run_id}`);
}

export const V1_TERMINAL_CLASSIFICATION_POLICY = Object.freeze({
	none: Object.freeze({ statuses: Object.freeze(["passed", "failed"]), excluded: false }),
	treatment: Object.freeze({ statuses: Object.freeze(["invalid", "cancelled"]), excluded: false }),
	infrastructure: Object.freeze({ statuses: Object.freeze(["infrastructure_error"]), excluded: true }),
	evidence: Object.freeze({ statuses: Object.freeze(["invalid"]), excluded: true }),
} as const);
function assertTerminalClassification(run: RunResultV1): void {
	if (run.verifier_status !== run.evidence.final_verifier_status) throw new Error(`Run terminal/final Verifier status mismatch: ${run.run_id}`);
	const policy = V1_TERMINAL_CLASSIFICATION_POLICY[run.evidence.invalid_attribution];
	if (!(policy.statuses as readonly string[]).includes(run.verifier_status)) throw new Error(`Illegal terminal status/attribution combination: ${run.run_id}`);
	if (run.evidence.exclusion_preauthorized !== policy.excluded) throw new Error(`Run exclusion is not authorized by frozen protocol policy: ${run.run_id}`);
}

export function aggregateExperimentV1(manifest: ExperimentManifestV1, runs: readonly RunResultV1[], projectRoot: string): AggregationResultV1 {
	validateExperimentManifestV1(manifest, projectRoot); const before = stableJson(runs); const expected = new Map(manifest.members.map((member) => [member.run_id, member])); const observed = new Set<string>();
	const by_strategy: Record<StrategyIdV1, StrategyAggregationV1> = { baseline: emptyCell(), skill_only: emptyCell(), skill_plus_runtime_control: emptyCell() };
	for (const member of manifest.members) { by_strategy[member.strategy_id].planned++; if (member.disposition === "preauthorized_paused_before_execution") by_strategy[member.strategy_id].paused_before_execution++; }
	let comparable = 0, excluded = 0, treatmentInvalid = 0, passed = 0, recoveryEligible = 0, recoveryStarted = 0, recoverySucceeded = 0;
	const totals = { provider_requests: 0, tool_calls: 0, wall_time_ms: 0, cost_usd: 0 };
	for (const run of runs) {
		if (observed.has(run.run_id)) throw new Error(`Duplicate Run result: ${run.run_id}`); observed.add(run.run_id); const member = expected.get(run.run_id);
		if (!member) throw new Error(`Run not in immutable Manifest: ${run.run_id}`); if (member.disposition !== "required_terminal") throw new Error(`Paused cell executed: ${run.run_id}`);
		if (run.experiment_id !== manifest.experiment_id || run.manifest_id !== manifest.manifest_id || run.task_id !== member.task_id || run.repetition !== member.repetition || run.order_slot !== member.order_slot || run.strategy_id !== member.strategy_id || run.disposition !== member.disposition || run.pause_reason !== member.pause_reason) throw new Error(`Run membership/revision drift: ${run.run_id}`);
		if (run.terminal !== true || run.evidence.terminal_refs.length === 0 || !validDigest(run.evidence.initial_payload_digest)) throw new Error(`Nonterminal or incomplete Run rejected: ${run.run_id}`);
		assertRunIdentity(manifest, run); assertAttempts(run); assertTerminalClassification(run); by_strategy[run.strategy_id].observed++;
		if (run.evidence.recovery_eligible) recoveryEligible++; if (run.evidence.recovery_started) recoveryStarted++; if (run.evidence.recovery_started && run.evidence.final_verifier_status === "passed") recoverySucceeded++;
		totals.provider_requests += run.evidence.provider_requests; totals.tool_calls += run.evidence.tool_calls; totals.wall_time_ms += run.evidence.wall_time_ms; totals.cost_usd += run.evidence.cost_usd;
		const attribution = run.evidence.invalid_attribution;
		if (attribution === "infrastructure" || attribution === "evidence") { excluded++; by_strategy[run.strategy_id].excluded_infrastructure++; }
		else { comparable++; by_strategy[run.strategy_id].comparable++; if (attribution === "treatment") { treatmentInvalid++; by_strategy[run.strategy_id].treatment_invalid++; } if (run.verifier_status === "passed") { passed++; by_strategy[run.strategy_id].passed++; } }
	}
	for (const member of manifest.members) if (member.disposition === "required_terminal" && !observed.has(member.run_id)) throw new Error(`Missing required Run result: ${member.run_id}`);
	if (stableJson(runs) !== before) throw new Error("Read-only aggregation mutated Runs");
	const paused = manifest.members.filter((member) => member.disposition === "preauthorized_paused_before_execution").length;
	return { schema_version: 1, experiment_id: manifest.experiment_id, manifest_id: manifest.manifest_id, planned_runs: manifest.members.length, observed_runs: runs.length, comparable_runs: comparable, excluded_infrastructure_runs: excluded, treatment_invalid_runs: treatmentInvalid, passed_runs: passed, paused_before_execution_runs: paused, recovery_eligible: recoveryEligible, recovery_started: recoveryStarted, recovery_succeeded: recoverySucceeded, totals, by_strategy };
}

export const V1_MANIFEST_DIGEST_DOMAINS = Object.freeze({ task_pack_digest: "stable JSON of task_id -> TaskSpec digest", task_digests: "stable JSON of each complete TaskSpec", workspace_digests: "link-free workspace tree inventories", skill_digest: "exact SKILL.md bytes", strategy_digests: "exact Strategy JSON bytes", model_profile_digest: "stable JSON of frozen provider profile", base_prompt_digest: "exact base prompt bytes", tool_profile_digest: "actual model-visible tool name/description/schema projection", verifier_digests: "exact external verifier bytes", workbench_tree_digest: `stable inventory of ${RUNTIME_DIGEST_DOMAIN.join(", ")}` });

const V1B_SOURCE_DOMAIN = [
	"workbench/src/provider/fixed-provider-v1.ts",
	"workbench/src/pi/pi-run-handle-v1.ts",
	"workbench/src/run-v1.ts",
	"workbench/src/pilot-v1.ts",
	"workbench/src/inspect-v1.ts",
	"workbench/src/product-surface-v1.ts",
	"workbench/src/cli.ts",
	"workbench/src/contracts/v1-types.ts",
	"workbench/src/experiment/v1.ts",
	"workbench/src/pi/pi-adapter-v1.ts",
	"workbench/src/experiment/task-pack-v1.ts",
	"workbench/src/skill/runtime-v1.ts",
	"workbench/src/pi/tool-profile.ts",
	"workbench/src/verifier/runner.ts",
	"workbench/src/prompts/base.ts",
	"workbench/package.json",
	"workbench/README.md",
] as const;

const V1B_BLOCKS = [
	["v1-parse-duration", 1, ["A", "B", "C"]],
	["v1-bounded-index", 1, ["A", "C", "B"]],
	["v1-state-transition", 1, ["B", "A", "C"]],
	["v1-stable-format", 1, ["B", "C", "A"]],
	["v1-parse-duration", 2, ["C", "A", "B"]],
	["v1-bounded-index", 2, ["C", "B", "A"]],
	["v1-state-transition", 2, ["A", "B", "C"]],
	["v1-stable-format", 2, ["B", "C", "A"]],
] as const;

const ARM_STRATEGY = Object.freeze({ A: "baseline", B: "skill_only", C: "skill_plus_runtime_control" } as const);
export const V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID = "43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76" as const;

export function v1bManifestIdentity(manifest: ExecutionManifestV1B): string {
	return digestObject({ ...manifest, manifest_id: "" });
}

export function v1bSourceDigest(projectRoot: string): string {
	return digestObject(V1B_SOURCE_DOMAIN.map((path) => ({ path, sha256: fileSha256(resolve(projectRoot, path)) })));
}

function v1bCells(replacement = false): ExecutionCellV1B[] {
	const cells: ExecutionCellV1B[] = [];
	for (const [blockIndex, [task, repetition, arms]] of V1B_BLOCKS.entries()) {
		for (const [slotIndex, arm] of arms.entries()) {
			const order = cells.length + 1;
			cells.push({ cell_id: `${replacement ? "v1b-replacement-cell" : "v1b-cell"}-${String(order).padStart(2, "0")}`, planned_run_id: `${replacement ? "v1b-replacement-run" : "v1b-run"}-${String(order).padStart(2, "0")}-${task.slice(3)}-r${repetition}-${arm.toLowerCase()}`, task_id: task, repetition, order_slot: order, block: blockIndex + 1, block_slot: (slotIndex + 1) as 1 | 2 | 3, arm, strategy_id: ARM_STRATEGY[arm] });
		}
	}
	return cells;
}

export function buildReplacementExecutionManifestV1B(projectRoot: string, options: { executionBaselineCommit: string }): ExecutionManifestV1B {
	const manifest = buildExecutionManifestV1B(projectRoot, { executionMode: "stage2_real", executionBaselineCommit: options.executionBaselineCommit, realExecutionAuthorized: true });
	manifest.experiment_revision = 2;
	manifest.created_at = "2026-08-05T00:00:00.000Z";
	manifest.cells = v1bCells(true);
	manifest.budgets.pilot.cost_usd = 1.90;
	manifest.replacement_revision = {
		predecessor_manifest_id: V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID,
		conservative_prior_debit_usd: 0.10,
		replacement_pilot_cost_cap_usd: 1.90,
		predecessor_started_initial_runs: 1,
		sequence_started_initial_runs_max: 25,
		replacement_initial_runs_max: 24,
		replacement_child_attempts_max: 8,
	};
	manifest.manifest_id = v1bManifestIdentity(manifest);
	return manifest;
}

export function validateReplacementSequenceStateV1B(manifest: ExecutionManifestV1B, state: {
	predecessor_manifest_id: string;
	predecessor_started_run_ids: readonly string[];
	replacement_started_run_ids: readonly string[];
	replacement_child_attempts: number;
	retry_same_run: boolean;
	fallback: boolean;
	automatic_replacement: boolean;
}): void {
	const revision = manifest.replacement_revision;
	if (!revision || state.predecessor_manifest_id !== revision.predecessor_manifest_id) throw new Error("V1-B replacement predecessor mismatch");
	const allStarted = [...state.predecessor_started_run_ids, ...state.replacement_started_run_ids];
	if (new Set(allStarted).size !== allStarted.length) throw new Error("V1-B replacement sequence reused Run ID");
	const replacementMembers = new Set(manifest.cells.map((cell) => cell.planned_run_id));
	if (state.replacement_started_run_ids.some((runId) => !replacementMembers.has(runId)) || state.predecessor_started_run_ids.some((runId) => replacementMembers.has(runId))) throw new Error("V1-B replacement sequence Run membership drift");
	if (state.predecessor_started_run_ids.length !== revision.predecessor_started_initial_runs || state.replacement_started_run_ids.length > revision.replacement_initial_runs_max || allStarted.length > revision.sequence_started_initial_runs_max) throw new Error("V1-B replacement sequence started-Run cap exceeded");
	if (!Number.isSafeInteger(state.replacement_child_attempts) || state.replacement_child_attempts < 0 || state.replacement_child_attempts > revision.replacement_child_attempts_max) throw new Error("V1-B replacement child cap exceeded");
	if (state.retry_same_run || state.fallback || state.automatic_replacement) throw new Error("V1-B replacement retry/fallback/replacement drift");
}

export function buildExecutionManifestV1B(projectRoot: string, options: {
	executionMode?: "stage1_zero_call" | "stage2_real";
	executionBaselineCommit?: string;
	realExecutionAuthorized?: boolean;
} = {}): ExecutionManifestV1B {
	const bindings = deriveManifestBindingsV1(projectRoot);
	const initial = { provider_requests: 8, tool_calls: 12, tokens: 65_536, wall_time_ms: 300_000, cost_usd: 0.10, verifier_runs: 1, child_attempts: 0 };
	const manifest: ExecutionManifestV1B = {
		schema_version: "v1b-execution-manifest-v1", manifest_id: "", experiment_id: "v1-b-bounded-pilot", experiment_revision: 1,
		execution_mode: options.executionMode ?? "stage1_zero_call", created_at: "2026-08-04T00:00:00.000Z",
		control_baseline_commit: "de75ca7a4d5376713f01ca475bc5ad7637c70443", control_baseline_tree: "e930e1d0885b52bf911ed78912786723f321f06e",
		execution_baseline_commit: options.executionBaselineCommit ?? "de75ca7a4d5376713f01ca475bc5ad7637c70443", workbench_source_digest: v1bSourceDigest(projectRoot),
		pi_commit: PI_COMMIT, pi_version: "0.82.1", protocol_id: "v1_skill_runtime_comparison", credential_profile_name: "DEEPSEEK_API_KEY",
		real_execution_authorized: options.realExecutionAuthorized ?? false,
		bindings: { task_pack_digest: bindings.task_pack_digest, task_digests: bindings.task_digests, workspace_digests: bindings.workspace_digests, skill_digest: bindings.skill_digest, strategy_digests: bindings.strategy_digests, model_profile_digest: bindings.model_profile_digest, base_prompt_digest: bindings.base_prompt_digest, tool_profile_digest: bindings.tool_profile_digest, verifier_digests: bindings.verifier_digests },
		budgets: {
			initial_attempt: initial,
			arm_a_or_b_run: { ...initial, verifier_runs: 1 },
			arm_c_run: { provider_requests: 16, tool_calls: 24, tokens: 131_072, wall_time_ms: 900_000, cost_usd: 0.20, verifier_runs: 2, child_attempts: 1 },
			pilot: { provider_requests: 256, tool_calls: 384, tokens: 32 * 65_536, wall_time_ms: 7_200_000, cost_usd: 2.00, verifier_runs: 32, child_attempts: 8 },
		},
		policy: { alternate_model_fallback: false, retry_same_run: false, automatic_replacement: false, invalid_ratio_pause_threshold: 0.25, repeated_invalid_cause_pause_count: 2, failure_taxonomy: ["task_pass", "task_fail", "treatment_guardrail_failure", "infrastructure_invalid", "evidence_invalid", "global_budget_stop", "paused_unclassified"] },
		cells: v1bCells(),
	};
	manifest.manifest_id = v1bManifestIdentity(manifest);
	return manifest;
}

export function validateExecutionManifestV1B(manifest: ExecutionManifestV1B, projectRoot: string, options: { requireCurrentSource?: boolean } = {}): void {
	if (manifest.schema_version !== "v1b-execution-manifest-v1" || manifest.experiment_id !== "v1-b-bounded-pilot" || ![1, 2].includes(manifest.experiment_revision) || manifest.pi_commit !== PI_COMMIT || manifest.pi_version !== "0.82.1") throw new Error("V1-B Manifest metadata invalid");
	if (manifest.manifest_id !== v1bManifestIdentity(manifest)) throw new Error("V1-B Manifest identity drift");
	if (manifest.cells.length !== 24 || stableJson(manifest.cells) !== stableJson(v1bCells(manifest.experiment_revision === 2))) throw new Error("V1-B Manifest frozen 24-cell order drift");
	if (new Set(manifest.cells.map((cell) => cell.cell_id)).size !== 24 || new Set(manifest.cells.map((cell) => cell.planned_run_id)).size !== 24) throw new Error("V1-B Manifest duplicate membership");
	if (manifest.real_execution_authorized !== (manifest.execution_mode === "stage2_real")) throw new Error("V1-B Manifest execution authority mismatch");
	if (manifest.policy.alternate_model_fallback || manifest.policy.retry_same_run || manifest.policy.automatic_replacement) throw new Error("V1-B Manifest forbidden retry/fallback policy");
	if (options.requireCurrentSource !== false && manifest.workbench_source_digest !== v1bSourceDigest(projectRoot)) throw new Error("V1-B Manifest source drift");
	const expected = manifest.experiment_revision === 2
		? buildReplacementExecutionManifestV1B(projectRoot, { executionBaselineCommit: manifest.execution_baseline_commit })
		: buildExecutionManifestV1B(projectRoot, { executionMode: manifest.execution_mode, executionBaselineCommit: manifest.execution_baseline_commit, realExecutionAuthorized: manifest.real_execution_authorized });
	if (stableJson(manifest) !== stableJson(expected)) throw new Error("V1-B complete frozen Manifest binding drift");
}

export const V1B_SOURCE_DIGEST_DOMAIN = V1B_SOURCE_DOMAIN;
