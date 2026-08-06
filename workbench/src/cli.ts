import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { inspectRunV0B } from "./inspect-v0b.ts";
import { inspectRunV0C } from "./inspect-v0c.ts";
import { dryRunV0A, executeV0ARun } from "./run.ts";
import { dryRunV0B, executeV0BRun } from "./run-v0b.ts";
import { runV0CProductSurface } from "./product-surface-v0c.ts";
import { aggregateV1B, inspectV1B, preflightV1B, runNextV1B, V1B_STAGE1_MANIFEST_PATH } from "./product-surface-v1.ts";
import { FixedProviderBoundaryErrorV1B } from "./provider/fixed-provider-v1.ts";
import { inspectV2A, runV2A, V2A_SCENARIOS } from "./product-surface-v2.ts";
import {
	V0C_OBSERVE_STRATEGY_PATH,
	V0C_REAL_STRATEGY_PATH,
	V0C_RECOVERY_STRATEGY_PATH,
} from "./contracts/preflight-v0c.ts";

interface RunArguments {
	command: "run";
	taskPath: string;
	strategyId: string;
	dryRun: boolean;
}

interface InspectArguments {
	command: "inspect";
	runId: string;
}

type CliArguments = RunArguments | InspectArguments;

function parseArguments(argv: string[]): CliArguments {
	if (argv[0] === "inspect") {
		const runId = argv.length === 2 ? argv[1] : argv.length === 3 && argv[1] === "--run" ? argv[2] : undefined;
		if (!runId) throw new Error("usage: cli.ts inspect <run-id>");
		return { command: "inspect", runId };
	}
	if (argv[0] !== "run") {
		throw new Error("usage: cli.ts run --task <path> --strategy <id> [--dry-run] | cli.ts inspect --run <run-id>");
	}
	let taskPath: string | undefined;
	let strategyId: string | undefined;
	let dryRun = false;
	for (let index = 1; index < argv.length; index += 1) {
		const value = argv[index];
		if (value === "--task") taskPath = argv[++index];
		else if (value === "--strategy") strategyId = argv[++index];
		else if (value === "--dry-run") dryRun = true;
		else throw new Error(`unknown argument: ${value}`);
	}
	if (!taskPath || !strategyId) throw new Error("--task and --strategy are required");
	return { command: "run", taskPath, strategyId, dryRun };
}

async function main(): Promise<void> {
	const projectRoot = resolve(import.meta.dirname, "../..");
	const raw = process.argv.slice(2);
	if (raw[0] === "v2a") {
		const action = raw[1];
		const value = (flag: string): string | undefined => { const index = raw.indexOf(flag); return index >= 0 ? raw[index + 1] : undefined; };
		const runRootValue = value("--run-root");
		if (!runRootValue) throw new Error("v2a requires --run-root <path>");
		const runRoot = resolve(projectRoot, runRootValue);
		if (action === "run") {
			const runId = value("--run-id");
			const scenario = value("--scenario");
			if (!runId || !scenario || !(scenario in V2A_SCENARIOS)) throw new Error("v2a run requires --run-id <id> --scenario <known-scenario>");
			const result = await runV2A({ projectRoot, runRoot, runId, scenario });
			process.stdout.write(`${JSON.stringify({ run_id: result.run_id, outcome: result.outcome, selected_candidate_id: result.selected_candidate_id, run_root: runRoot, real_call_counters: result.real_call_counters })}\n`);
		} else if (action === "inspect") {
			const result = inspectV2A({ runRoot });
			process.stdout.write(`${JSON.stringify(result)}\n`);
			if (!result.integrity_valid) process.exitCode = 1;
		} else {
			throw new Error("usage: cli.ts v2a <run|inspect> --run-root <path> [--run-id <id> --scenario <scenario>]");
		}
		return;
	}
	if (raw[0] === "v1b") {
		const action = raw[1];
		const value = (flag: string): string | undefined => { const index = raw.indexOf(flag); return index >= 0 ? raw[index + 1] : undefined; };
		const pilotRoot = resolve(projectRoot, value("--pilot-root") ?? ".runs/v1-b/stage1/pilot-cli");
		const manifestPath = value("--manifest") ?? V1B_STAGE1_MANIFEST_PATH;
		const replacementSequenceStatePath = value("--replacement-sequence-state");
		if (action === "preflight") process.stdout.write(`${JSON.stringify(preflightV1B({ projectRoot, manifestPath, pilotRoot, ...(replacementSequenceStatePath ? { replacementSequenceStatePath } : {}) }))}\n`);
		else if (action === "run-next") {
			const stage2AuthorityRequested = raw.includes("--stage2-real-authority");
			const stage2ExecutionAuthority = stage2AuthorityRequested ? {
				authority_id: "v1b-public-pi-one-run" as const,
				credential_profile_name: "DEEPSEEK_API_KEY" as const,
				authorized: true,
				resolver: { resolve: async (): Promise<string> => {
					const credential = process.env["DEEPSEEK_API_KEY"];
					if (typeof credential !== "string" || credential === "") throw new FixedProviderBoundaryErrorV1B();
					return credential;
				} },
			} : undefined;
			const result = await runNextV1B({ projectRoot, manifestPath, pilotRoot, ...(replacementSequenceStatePath ? { replacementSequenceStatePath } : {}), ...(stage2ExecutionAuthority ? { stage2ExecutionAuthority } : {}) });
			process.stdout.write(`${JSON.stringify(result ? { run_id: result.run_result.run_id, verifier_status: result.run_result.verifier_status, run_root: result.run_root, real_call_counters: result.real_call_counters } : { status: "complete" })}\n`);
		} else if (action === "inspect") {
			const plannedRunId = value("--run"); if (!plannedRunId) throw new Error("v1b inspect requires --run <planned-run-id>");
			const result = inspectV1B({ projectRoot, pilotRoot, plannedRunId }); process.stdout.write(`${JSON.stringify(result)}\n`); if (!result.integrity_valid) process.exitCode = 1;
		} else if (action === "aggregate") process.stdout.write(`${JSON.stringify(aggregateV1B({ projectRoot, pilotRoot }))}\n`);
		else throw new Error("usage: cli.ts v1b <preflight|run-next|inspect|aggregate> [--manifest <path>] [--pilot-root <path>] [--replacement-sequence-state <path>] [--run <planned-run-id>] [--stage2-real-authority]");
		return;
	}
	const args = parseArguments(raw);
	if (args.command === "inspect") {
		const result = existsSync(resolve(projectRoot, ".runs/v0-c/runs", args.runId))
			? await inspectRunV0C(projectRoot, args.runId)
			: await inspectRunV0B(projectRoot, args.runId);
		process.stdout.write(`${JSON.stringify(result)}\n`);
		if (!result.integrity_valid) process.exitCode = 1;
		return;
	}
	const v0cStrategies: Readonly<Record<string, string>> = {
		v0_c_observe_only_faux: V0C_OBSERVE_STRATEGY_PATH,
		v0_c_recover_once_same_session_faux: V0C_RECOVERY_STRATEGY_PATH,
		v0_c_recover_once_same_session_deepseek_v4_flash: V0C_REAL_STRATEGY_PATH,
	};
	const v0cStrategyPath = v0cStrategies[args.strategyId];
	if (v0cStrategyPath) {
		if (args.dryRun) {
			const product = await runV0CProductSurface({
				projectRoot,
				taskPath: args.taskPath,
				strategyPath: v0cStrategyPath,
				dryRun: true,
				scenario: v0cStrategyPath === V0C_OBSERVE_STRATEGY_PATH ? "observe_pass" : "recover_once_pass",
			});
			if (product.mode !== "dry_run") throw new Error("V0-C Product Surface mode mismatch");
			process.stdout.write(`${product.plan_json}\n`);
			return;
		}
		const product = await runV0CProductSurface({
			projectRoot,
			taskPath: args.taskPath,
			strategyPath: v0cStrategyPath,
			dryRun: false,
			scenario: v0cStrategyPath === V0C_OBSERVE_STRATEGY_PATH ? "observe_pass" : "recover_once_pass",
		});
		if (product.mode !== "execution") throw new Error("V0-C Product Surface mode mismatch");
		const result = product.result;
		process.stdout.write(`${JSON.stringify({
			run_id: result.run_id,
			status: result.outcome?.status ?? "incomplete",
			failure_class: result.outcome?.failure_class ?? null,
			terminal_reason: result.outcome?.terminal_reason ?? result.incomplete_reason,
			attempt_ids: result.attempt_ids,
			session_id: result.session_id,
			workspace_id: result.workspace_id,
			external_provider_calls: result.external_provider_calls,
			recovery_attempts: result.recovery_attempts,
			run_root: result.run_root,
		})}\n`);
		if (!result.outcome || result.outcome.status !== "passed") process.exitCode = 1;
		return;
	}
	if (args.strategyId === "v0_observe_only_faux") {
		if (args.dryRun) {
			process.stdout.write(`${dryRunV0B({ projectRoot, taskPath: args.taskPath })}\n`);
			return;
		}
		const result = await executeV0BRun({ projectRoot, taskPath: args.taskPath, scenario: "pass" });
		if (!result.outcome) {
			process.stdout.write(
				`${JSON.stringify({
					run_id: result.run_id,
					status: "incomplete",
					incomplete_reason: result.incomplete_reason,
					run_root: result.run_root,
				})}\n`,
			);
			process.exitCode = 1;
			return;
		}
		process.stdout.write(
			`${JSON.stringify({
				run_id: result.run_id,
				status: result.outcome.status,
				failure_class: result.outcome.failure_class,
				terminal_reason: result.outcome.terminal_reason,
				external_provider_calls: result.external_provider_calls,
				recovery_attempts: result.recovery_attempts,
				child_attempts: result.child_attempts,
				run_root: result.run_root,
			})}\n`,
		);
		if (result.outcome.status !== "passed") process.exitCode = 1;
		return;
	}
	if (args.dryRun) {
		process.stdout.write(`${await dryRunV0A({ projectRoot, taskPath: args.taskPath, strategyId: args.strategyId })}\n`);
		return;
	}
	const result = await executeV0ARun({ projectRoot, taskPath: args.taskPath, strategyId: args.strategyId });
	process.stdout.write(
		`${JSON.stringify({
			run_id: result.run.run_id,
			attempt_id: result.attempt.attempt_id,
			session_id: result.attempt.session_id,
			workspace_id: result.run.workspace_id,
			status: result.run.status,
			foundation_acceptance: result.acceptance.status,
			formal_outcome: null,
			external_provider_calls: result.settlement.external_provider_calls,
			run_root: result.run_root,
		})}\n`,
	);
	if (result.acceptance.status !== "passed") process.exitCode = 1;
}

main().catch((error) => {
	process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
	process.exitCode = 1;
});
