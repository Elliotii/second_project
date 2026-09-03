import assert from "node:assert/strict";
import test from "node:test";
import {
	createModels,
	getSupportedThinkingLevels,
	InMemoryCredentialStore,
	Type,
	type Context,
	type ToolResultMessage,
} from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import { ANALYSIS_THINKING_LEVEL, emptyAnalysisState } from "../src/trace-analysis/model-runner.ts";

async function analysisModel() {
	const credentials = new InMemoryCredentialStore();
	await credentials.modify("deepseek", async () => ({ type: "api_key", key: "synthetic-not-a-real-credential" }));
	const models = createModels({ credentials });
	models.setProvider(deepseekProvider());
	const model = models.getModel("deepseek", "deepseek-v4-flash");
	if (!model) throw new Error("fixed DeepSeek Analysis model is unavailable");
	return { model, models };
}

function sse(chunks: unknown[]): Response {
	return new Response(`${chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("")}data: [DONE]\n\n`, {
		status: 200,
		headers: { "content-type": "text/event-stream" },
	});
}

test("Analysis max serializes to provider-effective DeepSeek max", async () => {
	const { model, models } = await analysisModel();
	assert.equal(ANALYSIS_THINKING_LEVEL, "max");
	assert.deepEqual(getSupportedThinkingLevels(model), ["off", "high", "max"]);
	let payload: unknown;
	await models.streamSimple(model, {
		messages: [{ role: "user", content: "inspect", timestamp: Date.now() }],
	}, {
		reasoning: ANALYSIS_THINKING_LEVEL,
		onPayload: (request) => {
			payload = request;
			throw new Error("payload captured before dispatch");
		},
	}).result();
	assert.deepEqual(
		{ thinking: (payload as { thinking?: unknown }).thinking, reasoning_effort: (payload as { reasoning_effort?: unknown }).reasoning_effort },
		{ thinking: { type: "enabled" }, reasoning_effort: "max" },
	);
});

test("DeepSeek reasoning and tool call survive into the next provider request", async () => {
	const { model, models } = await analysisModel();
	const tool = { name: "probe", description: "Return a synthetic observation.", parameters: Type.Object({}, { additionalProperties: false }) };
	const requestOne: Context = {
		messages: [{ role: "user", content: "use probe", timestamp: Date.now() }],
		tools: [tool],
	};
	const first = await models.streamSimple(model, requestOne, {
		reasoning: ANALYSIS_THINKING_LEVEL,
		fetch: async () => sse([
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [{ index: 0, delta: { role: "assistant", reasoning_content: "synthetic-reasoning-marker", tool_calls: [{ index: 0, id: "call_probe", type: "function", function: { name: "probe", arguments: "{}" } }] }, finish_reason: null }] },
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }] },
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } },
		]),
	}).result();
	assert.deepEqual(first.content[0], { type: "thinking", thinking: "synthetic-reasoning-marker", thinkingSignature: "reasoning_content" });
	assert.deepEqual(first.content[1], { type: "toolCall", id: "call_probe", name: "probe", arguments: {} });

	const toolResult: ToolResultMessage = { role: "toolResult", toolCallId: "call_probe", toolName: "probe", content: [{ type: "text", text: "synthetic-result" }], isError: false, timestamp: Date.now() };
	let payload: unknown;
	await models.streamSimple(model, { messages: [...requestOne.messages, first, toolResult], tools: [tool] }, {
		reasoning: ANALYSIS_THINKING_LEVEL,
		onPayload: (request) => {
			payload = request;
			throw new Error("payload captured before dispatch");
		},
	}).result();
	const messages = (payload as { messages: Array<Record<string, unknown>> }).messages;
	assert.deepEqual(messages.map((message) => message.role), ["user", "assistant", "tool"]);
	assert.equal(messages[1]!.reasoning_content, "synthetic-reasoning-marker");
	assert.deepEqual(messages[1]!.tool_calls, [{ id: "call_probe", type: "function", function: { name: "probe", arguments: "{}" } }]);
	assert.equal(messages[2]!.tool_call_id, "call_probe");
	assert.equal(messages[2]!.content, "synthetic-result");
	assert.deepEqual(
		{ thinking: (payload as { thinking?: unknown }).thinking, reasoning_effort: (payload as { reasoning_effort?: unknown }).reasoning_effort },
		{ thinking: { type: "enabled" }, reasoning_effort: "max" },
	);
});

test("Analysis State does not persist model reasoning", () => {
	const state = emptyAnalysisState(["run-1"]);
	assert.equal(Object.hasOwn(state, "reasoning"), false);
	assert.equal(JSON.stringify(state).includes("synthetic-reasoning-marker"), false);
});
