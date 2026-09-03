import assert from "node:assert/strict";
import test from "node:test";
import { AgentHarness, InMemorySessionRepo } from "@earendil-works/pi-agent-core";
import {
	createModels,
	getSupportedThinkingLevels,
	InMemoryCredentialStore,
	Type,
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

test("AgentHarness max preserves DeepSeek reasoning across one real tool round-trip", async () => {
	const { model, models } = await analysisModel();
	const session = await new InMemorySessionRepo().create({ id: "analysis-max-tool-continuity" });
	const payloads: unknown[] = [];
	const executions: Array<{ toolCallId: string; input: unknown }> = [];
	const lifecycle: string[] = [];
	const harness = new AgentHarness({
		models,
		session,
		model,
		thinkingLevel: ANALYSIS_THINKING_LEVEL,
		systemPrompt: "Use the deterministic probe once, then finish.",
		tools: [{
			name: "probe",
			label: "Probe",
			description: "Return a synthetic observation.",
			parameters: Type.Object({}, { additionalProperties: false }),
			async execute(toolCallId, input) {
				executions.push({ toolCallId, input });
				return { content: [{ type: "text", text: "synthetic-result" }], details: {} };
			},
		}],
		streamOptions: { maxRetries: 0, timeoutMs: 10_000 },
	});
	harness.on("before_provider_payload", (event) => { payloads.push(structuredClone(event.payload)); return undefined; });
	harness.on("tool_call", (event) => { lifecycle.push(`call:${event.toolCallId}`); return undefined; });
	harness.on("tool_result", (event) => { lifecycle.push(`result:${event.toolCallId}`); return undefined; });

	let providerRequests = 0;
	const originalFetch = globalThis.fetch;
	globalThis.fetch = (async () => {
		providerRequests++;
		if (providerRequests === 1) return sse([
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [{ index: 0, delta: { role: "assistant", reasoning_content: "synthetic-reasoning-marker", tool_calls: [{ index: 0, id: "call_probe", type: "function", function: { name: "probe", arguments: "{}" } }] }, finish_reason: null }] },
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [{ index: 0, delta: {}, finish_reason: "tool_calls" }] },
			{ id: "chatcmpl-analysis-1", object: "chat.completion.chunk", created: 1, model: model.id, choices: [], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } },
		]);
		if (providerRequests === 2) return sse([
			{ id: "chatcmpl-analysis-2", object: "chat.completion.chunk", created: 2, model: model.id, choices: [{ index: 0, delta: { role: "assistant", content: "synthetic-final" }, finish_reason: null }] },
			{ id: "chatcmpl-analysis-2", object: "chat.completion.chunk", created: 2, model: model.id, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] },
			{ id: "chatcmpl-analysis-2", object: "chat.completion.chunk", created: 2, model: model.id, choices: [], usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 } },
		]);
		throw new Error("unexpected third provider request");
	}) as typeof globalThis.fetch;
	try {
		const final = await harness.prompt("use probe");
		await harness.waitForIdle();
		assert.equal(final.content.some((part) => part.type === "text" && part.text === "synthetic-final"), true);
	} finally {
		globalThis.fetch = originalFetch;
		await harness.abort();
	}

	assert.equal(providerRequests, 2);
	assert.equal(payloads.length, 2);
	assert.deepEqual(executions, [{ toolCallId: "call_probe", input: {} }]);
	assert.deepEqual(lifecycle, ["call:call_probe", "result:call_probe"]);
	for (const payload of payloads) assert.deepEqual(
		{ thinking: (payload as { thinking?: unknown }).thinking, reasoning_effort: (payload as { reasoning_effort?: unknown }).reasoning_effort },
		{ thinking: { type: "enabled" }, reasoning_effort: "max" },
	);

	const messages = (payloads[1] as { messages: Array<Record<string, unknown>> }).messages;
	const assistantIndex = messages.findIndex((message) => message.role === "assistant");
	const toolIndex = messages.findIndex((message) => message.role === "tool");
	assert.equal(assistantIndex >= 0, true);
	assert.equal(toolIndex, assistantIndex + 1);
	assert.equal(toolIndex, messages.length - 1);
	assert.equal(messages[assistantIndex]!.reasoning_content, "synthetic-reasoning-marker");
	assert.deepEqual(messages[assistantIndex]!.tool_calls, [{ id: "call_probe", type: "function", function: { name: "probe", arguments: "{}" } }]);
	assert.equal(messages[toolIndex]!.tool_call_id, "call_probe");
	assert.equal(messages[toolIndex]!.content, "synthetic-result");
});

test("Analysis State does not persist model reasoning", () => {
	const state = emptyAnalysisState(["run-1"]);
	assert.equal(Object.hasOwn(state, "reasoning"), false);
	assert.equal(JSON.stringify(state).includes("synthetic-reasoning-marker"), false);
});
