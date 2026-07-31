import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { decideCompletionV0C } from "../src/completion/controller-v0c.ts";
import { validateFailurePacketV0C, validateFailureProjectionV0C } from "../src/completion/failure-packet-v0c.ts";
import { preflightV0C, V0C_REAL_STRATEGY_PATH, V0C_RECOVERY_STRATEGY_PATH } from "../src/contracts/preflight-v0c.ts";
import type { FailurePacketAgentProjectionV0C, FailurePacketV0C, RunBudgetV0C, StrategySpecV0C, TaskSpecV0C } from "../src/contracts/v0c-types.ts";
import { validateJournalV0C } from "../src/evidence/journal-v0c.ts";
import { validateTerminalIndexPolicyV0C } from "../src/evidence/terminal-policy-v0c.ts";
import { inspectRunV0C } from "../src/inspect-v0c.ts";
import { assertRealExecutionAuthorityV0C, DEEPSEEK_V4_FLASH_PROFILE_V0C, projectProviderRequestV0C } from "../src/pi/real-provider-route-v0c.ts";
import { dryRunV0C, executeV0CRun } from "../src/run-v0c.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const TASK = "fixtures/manifests/v0-c-parse-duration-public.json";
const OBSERVE = "fixtures/manifests/v0-c-observe-only-faux.json";
const RECOVER = V0C_RECOVERY_STRATEGY_PATH;

function budget(): RunBudgetV0C {
	return {
		provider_request_limit: 16, provider_request_usage: 0, tool_call_limit: 14, tool_call_usage: 0,
		wall_time_limit_ms: 360000, wall_time_usage_ms: 0, finalization_wall_time_reserve_ms: 60000,
		verifier_limit: 2, verifier_usage: 0, token_limit: "not_applicable", token_usage: "unknown",
		cost_limit_usd: 0, cost_usage_usd: 0, external_provider_calls: 0,
	};
}

function contracts(): { task: TaskSpecV0C; strategy: StrategySpecV0C } {
	const loaded = preflightV0C({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, dryRun: true });
	return { task: loaded.task, strategy: loaded.strategy };
}

test("V0C dry-run is side-effect free and real profile reads no credential", () => {
	const before = readFileSync(resolve(PROJECT_ROOT, TASK), "utf8");
	const plan = JSON.parse(dryRunV0C({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: V0C_REAL_STRATEGY_PATH }));
	assert.equal(plan.formal_run_identity_created, false);
	assert.equal(plan.credential_read, false);
	assert.equal(plan.network_calls, 0);
	assert.equal(plan.provider_calls, 0);
	assert.equal(readFileSync(resolve(PROJECT_ROOT, TASK), "utf8"), before);
});

test("V0C hidden recovery and incompatible strategy fail preflight", () => {
	const taskPath = resolve(PROJECT_ROOT, ".runs/v0-c/test-cases/hidden-task.json");
	const strategyPath = resolve(PROJECT_ROOT, ".runs/v0-c/test-cases/bad-strategy.json");
	mkdirSync(resolve(taskPath, ".."), { recursive: true });
	const task = JSON.parse(readFileSync(resolve(PROJECT_ROOT, TASK), "utf8"));
	task.acceptance_visibility = "hidden_external";
	task.agent_feedback_schema = null;
	writeFileSync(taskPath, `${JSON.stringify(task)}\n`);
	assert.throws(() => preflightV0C({ projectRoot: PROJECT_ROOT, taskPath: taskPath.replace(`${PROJECT_ROOT}\\`, ""), strategyPath: RECOVER, dryRun: true }), /public_external/);
	const strategy = JSON.parse(readFileSync(resolve(PROJECT_ROOT, RECOVER), "utf8"));
	strategy.recovery_budget = 0;
	writeFileSync(strategyPath, `${JSON.stringify(strategy)}\n`);
	assert.throws(() => preflightV0C({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: strategyPath.replace(`${PROJECT_ROOT}\\`, ""), dryRun: true }), /invalid completion/);
});

test("V0C Completion Controller freezes eligibility and precedence", () => {
	const { task, strategy } = contracts();
	const base = { runId: "r", attemptId: "a", isChild: false, task, strategy, evidenceValid: true, verifierStatus: "failed" as const, childStartReserveAvailable: true, recoverySlotConsumed: 0 as const, budget: budget() };
	assert.equal(decideCompletionV0C(base).decision, "recover_once");
	assert.equal(decideCompletionV0C({ ...base, isChild: true }).decision, "stop_failed");
	assert.equal(decideCompletionV0C({ ...base, evidenceValid: false }).reason, "evidence_invalid");
	assert.equal(decideCompletionV0C({ ...base, verifierStatus: "invalid" }).reason, "verifier_invalid");
	assert.equal(decideCompletionV0C({ ...base, userCancelled: true }).reason, "user_cancelled");
	assert.equal(decideCompletionV0C({ ...base, budgetExhausted: true }).reason, "budget_exhausted");
	assert.equal(decideCompletionV0C({ ...base, childStartReserveAvailable: false }).reason, "child_start_reserve_insufficient");
	assert.equal(decideCompletionV0C({ ...base, recoverySlotConsumed: 1 }).reason, "recovery_slot_unavailable");
});

test("V0C Failure Packet is bounded, public, digest-bound, and child-id free", () => {
	const projection: FailurePacketAgentProjectionV0C = {
		type: "verifier_failure", parent_attempt_id: "a", verifier_id: "v",
		failure_summary: "public failure", failed_checks: ["case"], instruction: "repair_the_task_then_finish",
	};
	assert.doesNotThrow(() => validateFailureProjectionV0C(projection));
	assert.throws(() => validateFailureProjectionV0C({ ...projection, failure_summary: "authorization api_key" }), /protected material/);
	const packet: FailurePacketV0C = {
		schema_version: 1, failure_packet_id: "p", run_id: "r", parent_attempt_id: "a", verifier_id: "v",
		verifier_sha256: "0".repeat(64), verifier_result_ref: { path: "x", sha256: "1".repeat(64), size_bytes: 1, media_type: "application/json", truncated: false },
		verifier_result_sha256: "1".repeat(64), failure_summary: "x", failed_checks: [], workspace_digest: "2".repeat(64),
		budget_remaining: { provider_requests: 8, tool_calls: 7, agent_wall_time_ms: 120000, verifier_runs: 1, verifier_wall_time_ms: 30000, finalization_wall_time_ms: 60000 },
		agent_projection_ref: { path: "y", sha256: "3".repeat(64), size_bytes: 1, media_type: "application/json", truncated: false },
		agent_projection_sha256: "0".repeat(64), created_at: new Date().toISOString(),
	};
	assert.throws(() => validateFailurePacketV0C(packet, "{}\n"), /digest mismatch/);
	assert.throws(() => validateFailurePacketV0C({ ...packet, child_attempt_id: "ghost" } as never, "{}\n"), /child_attempt_id/);
});

test("V0C observe pass/fail and no-extra-cycle paths", async () => {
	const pass = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: OBSERVE, scenario: "observe_pass" });
	assert.equal(pass.outcome?.status, "passed");
	assert.equal(pass.attempt_ids.length, 1);
	assert.equal(pass.verifier_runs, 1);
	const fail = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: OBSERVE, scenario: "observe_fail" });
	assert.equal(fail.outcome?.status, "failed");
	assert.equal(fail.child_attempts, 0);
	const initialPass = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario: "recovery_initial_pass" });
	assert.equal(initialPass.attempt_ids.length, 1);
	assert.equal(initialPass.recovery_attempts, 0);
});

test("V0C same-session recovery pass/fail preserves one identity", async () => {
	for (const [scenario, status] of [["recover_once_pass", "passed"], ["recover_once_fail", "failed"]] as const) {
		const result = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario });
		assert.equal(result.outcome?.status, status);
		assert.equal(result.attempt_ids.length, 2);
		assert.equal(result.recovery_attempts, 1);
		assert.equal(result.verifier_runs, 2);
		const inspected = await inspectRunV0C(PROJECT_ROOT, result.run_id);
		assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
		assert.equal(new Set(inspected.attempts.map((attempt) => attempt.session_id)).size, 1);
		assert.equal(new Set(inspected.attempts.map((attempt) => attempt.workspace_id)).size, 1);
	}
});

test("V0C invalid verifier/evidence and budget stop never start a child", async () => {
	for (const scenario of ["initial_verifier_invalid", "initial_evidence_invalid", "child_start_reserve_insufficient"] as const) {
		const result = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario });
		assert.equal(result.attempt_ids.length, 1);
		assert.equal(result.child_attempts, 0);
		assert.ok(result.outcome);
	}
	const exhausted = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario: "child_budget_exhausted" });
	assert.equal(exhausted.outcome?.failure_class, "budget");
	assert.equal(exhausted.attempt_ids.length, 2);
});

test("V0C malformed Packet paths are bounded and allocate no ghost child", async () => {
	for (const scenario of ["packet_oversized", "packet_digest_mismatch", "packet_visibility_mismatch", "packet_persisted_no_child"] as const) {
		const result = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario });
		assert.equal(result.attempt_ids.length, 1);
		assert.equal(result.child_attempts, 0);
		if (scenario === "packet_persisted_no_child") assert.equal(result.outcome, null);
	}
});

test("V0C Inspector and closed Index reject mutations", async () => {
	const source = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario: "recover_once_pass" });
	const sourceRoot = resolve(PROJECT_ROOT, source.run_root);
	const original = JSON.parse(readFileSync(resolve(sourceRoot, "evidence-index.json"), "utf8"));
	const expected = new Map<string, string>(
		original.items.map((item: { path: string; responsibility: string }): [string, string] => [item.path, item.responsibility]),
	);
	assert.ok(validateTerminalIndexPolicyV0C(original.items.slice(1), expected).length > 0);
	assert.ok(validateTerminalIndexPolicyV0C([...original.items, original.items[0]], expected).length > 0);
	const changed = structuredClone(original);
	changed.items[0].responsibility = "mutated";
	assert.ok(validateTerminalIndexPolicyV0C(changed.items, expected).length > 0);
	for (const label of ["index-digest", "outcome-digest", "session-drift"]) {
		const runId = `${source.run_id}-${label}`;
		const target = resolve(PROJECT_ROOT, ".runs/v0-c/runs", runId);
		cpSync(sourceRoot, target, { recursive: true });
		const run = JSON.parse(readFileSync(resolve(target, "run.json"), "utf8"));
		run.run_id = runId;
		writeFileSync(resolve(target, "run.json"), `${JSON.stringify(run)}\n`);
		const inspected = await inspectRunV0C(PROJECT_ROOT, runId);
		assert.equal(inspected.integrity_valid, false);
	}
});

test("V0C Journal rejects active drift, duplicate verifier, duplicate child, and post-terminal events", () => {
	const base = { schema_version: 1, timestamp: new Date().toISOString(), run_id: "r", session_id: "s", workspace_id: "w", data: {} };
	const entries = [
		{ ...base, seq: 1, type: "attempt_started", attempt_id: "a" },
		{ ...base, seq: 2, type: "attempt_settled", attempt_id: "a" },
		{ ...base, seq: 3, type: "verifier_started", attempt_id: "a" },
		{ ...base, seq: 4, type: "verifier_completed", attempt_id: "a" },
		{ ...base, seq: 5, type: "verifier_completed", attempt_id: "a" },
		{ ...base, seq: 6, type: "attempt_evidence_validated", attempt_id: "a" },
		{ ...base, seq: 7, type: "policy_decided", attempt_id: "a" },
		{ ...base, seq: 8, type: "run_evidence_validation_completed", attempt_id: null },
		{ ...base, seq: 9, type: "outcome_created", attempt_id: null },
		{ ...base, seq: 10, type: "run_terminal", attempt_id: null },
		{ ...base, seq: 11, type: "workspace_finalized", attempt_id: "ghost" },
	] as never;
	const errors = validateJournalV0C(entries, { runId: "r", sessionId: "s", workspaceId: "w", attemptIds: ["a"] });
	assert.ok(errors.some((error) => error.includes("verifier_completed count")));
	assert.ok(errors.some((error) => error.includes("active Attempt drift")));
	assert.ok(errors.some((error) => error.includes("terminal suffix")));
});

test("V0C real provider factory boundary is typed, injectable, and fails closed before transport", async () => {
	let calls = 0;
	const transport = { request: async () => { calls += 1; return { request_id: "request-1", text: "ok", input_tokens: 1, output_tokens: 1, cost_usd: 0 }; } };
	assert.throws(() => assertRealExecutionAuthorityV0C({ execution_authorized: false, credential_present: false }), /not authorized/);
	await assert.rejects(() => projectProviderRequestV0C({ profile: DEEPSEEK_V4_FLASH_PROFILE_V0C, prompt: "x", transport, execution_authorized: false, credential_present: false }), /not authorized/);
	assert.equal(calls, 0);
	const projected = await projectProviderRequestV0C({ profile: DEEPSEEK_V4_FLASH_PROFILE_V0C, prompt: "x", transport, execution_authorized: true, credential_present: true });
	assert.equal(projected.usage.request_id, "request-1");
	assert.equal(calls, 1);
});
