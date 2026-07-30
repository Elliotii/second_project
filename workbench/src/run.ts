import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileSha256, stableJson, treeDigest, treeInventory, type FileIdentity } from "./hash.ts";
import { preflight, V0A_STRATEGY, WORKSPACE_DIGEST_EXCLUSIONS } from "./contracts/preflight.ts";
import { runPiSingleCycle, type PiSettlementResult } from "./pi/pi-adapter.ts";
import type { AttemptRecordV0A, FoundationAcceptance, RunRecordV0A } from "./types.ts";
import { createTemporaryWorkspace } from "./workspace/temp-copy.ts";
import { isPathInScope } from "./workspace/path-policy.ts";

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function changedPaths(initial: FileIdentity[], final: FileIdentity[]): string[] {
	const before = new Map(initial.map((entry) => [entry.path, `${entry.bytes}:${entry.sha256}`]));
	const after = new Map(final.map((entry) => [entry.path, `${entry.bytes}:${entry.sha256}`]));
	return [...new Set([...before.keys(), ...after.keys()])]
		.filter((path) => before.get(path) !== after.get(path))
		.sort();
}

export async function executeV0ARun(options: {
	projectRoot: string;
	taskPath: string;
	strategyId: string;
}): Promise<{
	run: RunRecordV0A;
	attempt: AttemptRecordV0A;
	settlement: PiSettlementResult;
	acceptance: FoundationAcceptance;
	run_root: string;
}> {
	const checked = await preflight({ ...options, dryRun: false });
	const runId = `run-${randomUUID()}`;
	const attemptId = `attempt-${randomUUID()}`;
	const sessionId = `session-${randomUUID()}`;
	const workspaceId = `workspace-${randomUUID()}`;
	const runsRoot = resolve(options.projectRoot, ".runs/v0-a/runs");
	const runRoot = resolve(runsRoot, runId);
	const workspaceRoot = resolve(runRoot, "workspace");
	if (existsSync(runRoot)) throw new Error(`generated run root already exists: ${runRoot}`);
	mkdirSync(runsRoot, { recursive: true });
	mkdirSync(runRoot, { recursive: false });

	const run: RunRecordV0A = {
		schema_version: 1,
		run_id: runId,
		task_id: checked.task.task_id,
		strategy_id: V0A_STRATEGY.strategy_id,
		config_digest: checked.plan.config_digest,
		workspace_id: workspaceId,
		attempt_ids: [attemptId],
		status: "planned",
	};
	const attempt: AttemptRecordV0A = {
		schema_version: 1,
		attempt_id: attemptId,
		run_id: runId,
		ordinal: 1,
		parent_attempt_id: null,
		strategy_id: V0A_STRATEGY.strategy_id,
		session_id: sessionId,
		workspace_id: workspaceId,
		status: "planned",
		terminal_reason: null,
	};
	writeJson(resolve(runRoot, "preflight-plan.json"), checked.plan);
	writeJson(resolve(runRoot, "task-spec.json"), checked.task);
	writeJson(resolve(runRoot, "strategy.json"), V0A_STRATEGY);
	writeJson(resolve(runRoot, "run.json"), run);
	writeJson(resolve(runRoot, "attempt.json"), attempt);

	try {
		const temporary = createTemporaryWorkspace({
			projectRoot: options.projectRoot,
			sourceRoot: checked.workspaceSourceRoot,
			targetRoot: workspaceRoot,
			workspaceId,
			task: checked.task,
		});
		writeJson(resolve(runRoot, "workspace-initial-inventory.json"), temporary.initialInventory);
		writeJson(resolve(runRoot, "workspace-ref.json"), temporary.ref);
		const protectedBefore = Object.fromEntries(
			checked.task.protected_paths.map((path) => [path, fileSha256(resolve(workspaceRoot, path))]),
		);
		run.status = "running";
		attempt.status = "running";
		writeJson(resolve(runRoot, "run.json"), run);
		writeJson(resolve(runRoot, "attempt.json"), attempt);

		const settlement = await runPiSingleCycle({ workspaceRoot, task: checked.task, sessionId, attemptId, workspaceId });
		const finalInventory = treeInventory(workspaceRoot);
		const changes = changedPaths(temporary.initialInventory, finalInventory);
		const protectedUnchanged = checked.task.protected_paths.every(
			(path) => protectedBefore[path] === fileSha256(resolve(workspaceRoot, path)),
		);
		const onlyAllowed = changes.every((path) => isPathInScope(path, checked.task.writable_paths));
		const testExecution = settlement.command_executions.find((entry) => entry.command_id === "test");
		const finalDigest = treeDigest(workspaceRoot);
		const acceptance: FoundationAcceptance = {
			status:
				testExecution?.exit_code === 0 &&
				!testExecution.timed_out &&
				protectedUnchanged &&
				onlyAllowed &&
				changes.includes("src/parse-duration.ts")
					? "passed"
					: "failed",
			public_test_exit_code: testExecution?.exit_code ?? null,
			public_test_timed_out: testExecution?.timed_out ?? false,
			protected_files_unchanged: protectedUnchanged,
			changed_paths: changes,
			only_allowed_paths_changed: onlyAllowed,
			final_tree_digest: finalDigest,
			formal_outcome: null,
		};
		temporary.ref.final_tree_digest = treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
		run.status = "settled";
		attempt.status = "settled";
		attempt.terminal_reason = settlement.terminal_reason;
		writeJson(resolve(runRoot, "run.json"), run);
		writeJson(resolve(runRoot, "attempt.json"), attempt);
		writeJson(resolve(runRoot, "workspace-ref.json"), temporary.ref);
		writeJson(resolve(runRoot, "workspace-final-inventory.json"), finalInventory);
		writeJson(resolve(runRoot, "session-projection.json"), {
			session_id: settlement.session_id,
			attempt_id: settlement.attempt_id,
			workspace_id: settlement.workspace_id,
			entry_count: settlement.session_entry_count,
		});
		writeJson(resolve(runRoot, "settlement.json"), {
			settled: settlement.settled,
			terminal_reason: settlement.terminal_reason,
			final_text: settlement.final_text,
			settled_event_observed: settlement.settled_event_observed,
			provider_response_events: settlement.provider_response_events,
		});
		writeJson(resolve(runRoot, "tool-audit.json"), settlement.tool_audit);
		writeJson(resolve(runRoot, "command-executions.json"), settlement.command_executions);
		writeJson(resolve(runRoot, "provider-boundary.json"), {
			provider_identity: settlement.provider_identity,
			faux_provider_calls: settlement.faux_provider_calls,
			external_provider_calls: settlement.external_provider_calls,
		});
		writeJson(resolve(runRoot, "foundation-acceptance.json"), acceptance);
		return {
			run,
			attempt,
			settlement,
			acceptance,
			run_root: relative(options.projectRoot, runRoot).split(sep).join("/"),
		};
	} catch (error) {
		run.status = "invalid";
		attempt.status = "error";
		attempt.terminal_reason = error instanceof Error ? error.message : String(error);
		writeJson(resolve(runRoot, "run.json"), run);
		writeJson(resolve(runRoot, "attempt.json"), attempt);
		throw error;
	}
}

export async function dryRunV0A(options: {
	projectRoot: string;
	taskPath: string;
	strategyId: string;
}): Promise<string> {
	const { plan } = await preflight({ ...options, dryRun: true });
	return stableJson(plan);
}
