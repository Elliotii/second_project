import { resolve } from "node:path";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";

function value(args: string[], flag: string): string | undefined {
	const index = args.indexOf(flag);
	return index >= 0 ? args[index + 1] : undefined;
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const action = args[0];
	const dataRoot = value(args, "--data-root");
	const projectId = value(args, "--project-id");
	const workspaceRoot = value(args, "--workspace-root");
	const workspaceId = value(args, "--workspace-id");
	if (!action || !dataRoot || !projectId || !workspaceRoot || !workspaceId) throw new Error("usage: v35-session-cli.ts <create|list|continue|inspect> --data-root <path> --project-id <id> --workspace-root <path> --workspace-id <id>");
	const service = new PersistentSessionServiceV35({ dataRoot: resolve(dataRoot), projectId, workspaceRoot: resolve(workspaceRoot), workspaceId });
	if (action === "list") {
		process.stdout.write(`${JSON.stringify(service.list())}\n`);
		return;
	}
	const sessionId = value(args, "--session-id");
	if (!sessionId) throw new Error("--session-id is required");
	if (action === "inspect") {
		process.stdout.write(`${JSON.stringify(await service.inspect(sessionId))}\n`);
		return;
	}
	const runId = value(args, "--run-id");
	const prompt = value(args, "--prompt");
	if (!runId || !prompt) throw new Error("--run-id and --prompt are required");
	if (action === "create") await service.create({ sessionId, title: value(args, "--title") ?? sessionId });
	else if (action !== "continue") throw new Error("unknown V3.5 Session action");
	const result = await service.executeTurn({ sessionId, runId, prompt });
	process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
	process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
	process.exitCode = 1;
});
