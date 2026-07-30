import { resolve } from "node:path";
import { inspectRunV0B } from "./inspect-v0b.ts";
import { dryRunV0A, executeV0ARun } from "./run.ts";
import { dryRunV0B, executeV0BRun } from "./run-v0b.ts";

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
		if (argv.length !== 3 || argv[1] !== "--run" || !argv[2]) throw new Error("usage: cli.ts inspect --run <run-id>");
		return { command: "inspect", runId: argv[2] };
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
	const args = parseArguments(process.argv.slice(2));
	const projectRoot = resolve(import.meta.dirname, "../..");
	if (args.command === "inspect") {
		const result = await inspectRunV0B(projectRoot, args.runId);
		process.stdout.write(`${JSON.stringify(result)}\n`);
		if (!result.integrity_valid) process.exitCode = 1;
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
