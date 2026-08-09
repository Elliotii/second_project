import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall, type AssistantMessage } from "@earendil-works/pi-ai";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { createPostV35RealSmokeTurnExecutor, loadPostV35RealSmokeAuthority, type PostV35RealModelFactory } from "../src/session/real-smoke-turn-v35.ts";

function argumentsFrom(argv: readonly string[]): Record<string, string> {
	if (argv.length % 2 !== 0) throw new Error("test driver arguments are invalid");
	const result: Record<string, string> = {};
	for (let index = 0; index < argv.length; index += 2) {
		const key = argv[index]; const value = argv[index + 1];
		if (!key?.startsWith("--") || value === undefined || result[key] !== undefined) throw new Error("test driver arguments are invalid");
		result[key] = value;
	}
	return result;
}

function withUsage(message: AssistantMessage): AssistantMessage {
	return { ...message, usage: { input: 11, output: 7, cacheRead: 0, cacheWrite: 0, totalTokens: 18, cost: { input: 0.000001, output: 0.000001, cacheRead: 0, cacheWrite: 0, total: 0.000002 } } };
}

const args = argumentsFrom(process.argv.slice(2));
const required = ["--action", "--data-root", "--workspace-root", "--authority", "--session-id", "--run-id", "--prompt"];
if (required.some((key) => args[key] === undefined)) throw new Error("test driver arguments are incomplete");
const authority = loadPostV35RealSmokeAuthority(args["--authority"]!);
const modelFactory: PostV35RealModelFactory = {
	create() {
		const models = createModels();
		const registration = fauxProvider({ provider: `post-v35-faux-real-${args["--run-id"]}` });
		models.setProvider(registration.provider);
		const content = args["--action"] === "create" ? "turn-one\n" : "turn-two\n";
		registration.setResponses([
			withUsage(fauxAssistantMessage(fauxToolCall("workspace_write", { path: "src/result.txt", content }, { id: `${args["--run-id"]}-write` }), { stopReason: "toolUse" })),
			withUsage(fauxAssistantMessage(fauxToolCall("run_command", { command_id: "public_test" }, { id: `${args["--run-id"]}-test` }), { stopReason: "toolUse" })),
		]);
		return { models, model: registration.getModel(), async close(): Promise<void> {} };
	},
};
mkdirSync(resolve(args["--data-root"]!), { recursive: true });
const executor = createPostV35RealSmokeTurnExecutor({ authorized: true, authority, credentialResolver: { async resolve(): Promise<string> { return "IN_MEMORY_TEST_CREDENTIAL"; } }, modelFactory });
const service = new PersistentSessionServiceV35({ dataRoot: args["--data-root"]!, projectId: authority.project_id, workspaceRoot: args["--workspace-root"]!, workspaceId: authority.workspace_id, turnExecutor: executor });
if (args["--action"] === "create") await service.create({ sessionId: args["--session-id"]!, title: "Post-V3.5 real path proof" });
else if (args["--action"] !== "continue") throw new Error("test driver action is invalid");
const result = await service.executeTurn({ sessionId: args["--session-id"]!, runId: args["--run-id"]!, prompt: args["--prompt"]! });
process.stdout.write(`${JSON.stringify(result)}\n`);
