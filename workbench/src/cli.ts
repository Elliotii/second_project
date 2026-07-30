import { resolve } from "node:path";
import { dryRunV0A, executeV0ARun } from "./run.ts";

interface CliArguments {
	command: "run";
	taskPath: string;
	strategyId: string;
	dryRun: boolean;
}

function parseArguments(argv: string[]): CliArguments {
	if (argv[0] !== "run") throw new Error("usage: cli.ts run --task <path> --strategy <id> [--dry-run]");
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
