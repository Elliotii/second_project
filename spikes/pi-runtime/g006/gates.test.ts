import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
	createModels,
	fauxAssistantMessage,
	fauxProvider,
	fauxToolCall,
	Type,
} from "@earendil-works/pi-ai";
import {
	AgentHarness,
	InMemorySessionStorage,
	Session,
	type AgentHarnessTool,
	type SessionTreeEntry,
} from "@earendil-works/pi-agent-core";
import {
	assessCycleCounters,
	classifyErrorMessage,
	classifyVerifierStatus,
	dispositionForClassification,
} from "./attribution.ts";
import { createJournalEntry, G006_JOURNAL_SCHEMA_VERSION } from "./journal.ts";
import { DEEPSEEK_MODEL } from "./model.ts";
import { createCycleCounters, observeSubscribedEvent } from "./observer.ts";
import { createSourceIdentity, sourceIdentityMatches } from "./provenance.ts";
import { RedactingJsonlSessionStorage } from "./session-storage.ts";
import { G006_TOOL_NAMES, createG006Tools } from "./tools.ts";
import { verifyWorkspace } from "./verifier.ts";

const projectRoot = resolve(import.meta.dirname, "../../..");
const g006Root = resolve(projectRoot, "spikes/pi-runtime/g006");
const NO_PARAMETERS = Type.Object({}, { additionalProperties: false });

async function withTempRoot<T>(run: (root: string) => Promise<T> | T): Promise<T> {
	const root = mkdtempSync(resolve(tmpdir(), "g006-gate0-"));
	try {
		return await run(root);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
}

test("G006 preserves the frozen descriptor and restricted-tool shape", () => {
	assert.equal(DEEPSEEK_MODEL.id, "deepseek-v4-flash");
	assert.equal(DEEPSEEK_MODEL.maxTokens, 8_192);
	assert.equal(DEEPSEEK_MODEL.thinkingLevelMap?.high, "high");
	assert.equal(DEEPSEEK_MODEL.compat?.requiresReasoningContentOnAssistantMessages, true);
	const tools = createG006Tools();
	assert.deepEqual(tools.map((tool) => tool.name), [...G006_TOOL_NAMES]);
	for (const tool of tools) {
		const keys = Object.keys((tool.parameters as { properties?: object }).properties ?? {});
		assert.equal(keys.includes("path"), false);
		assert.equal(keys.includes("command"), false);
	}
});

test("G006 observes every Faux provider response through the public subscriber stream", async () => {
	const models = createModels();
	const faux = fauxProvider({
		api: "g006-faux",
		provider: "g006-faux",
		models: [{ id: "g006-faux-model", name: "G006 Faux", reasoning: false }],
	});
	models.setProvider(faux.provider);
	faux.setResponses([
		fauxAssistantMessage(fauxToolCall("fixed_tool", {}, { id: "g006-tool-1" }), {
			stopReason: "toolUse",
			responseId: "g006-response-1",
		}),
		fauxAssistantMessage("done", { responseId: "g006-response-2" }),
	]);
	const tool: AgentHarnessTool<undefined, typeof NO_PARAMETERS, { fixed: true }> = {
		name: "fixed_tool",
		label: "Fixed tool",
		description: "Return one fixed deterministic result.",
		parameters: NO_PARAMETERS,
		executionMode: "sequential",
		execute: async () => ({ content: [{ type: "text", text: "fixed" }], details: { fixed: true } }),
	};
	const harness = new AgentHarness({
		models,
		session: new Session(new InMemorySessionStorage()),
		model: faux.getModel(),
		thinkingLevel: "off",
		tools: [tool],
		activeToolNames: [tool.name],
	});
	const counters = createCycleCounters();
	const observedTypes: string[] = [];
	harness.on("before_provider_request", () => {
		counters.providerRequests += 1;
		return undefined;
	});
	harness.subscribe((event) => {
		const observed = observeSubscribedEvent(event, counters);
		if (observed) observedTypes.push(observed.type);
	});

	await harness.prompt("run the fixed tool");

	assert.equal(faux.state.callCount, 2);
	assert.equal(counters.providerRequests, 2);
	assert.equal(counters.providerResponses, 2);
	assert.equal(counters.assistantMessages, 2);
	assert.equal(counters.successfulAssistantMessages, 2);
	assert.equal(counters.responseIdsPresent, 2);
	assert.equal(counters.toolStarts, 1);
	assert.equal(counters.toolEnds, 1);
	assert.equal(counters.settled, 1);
	assert.equal(observedTypes.filter((type) => type === "provider_response").length, 2);
	assert.deepEqual(assessCycleCounters(counters, true), { ok: true });
});

test("G006 Journal v2 keeps domain type inside data without envelope collision", () => {
	const reasoning = createJournalEntry({
		seq: 1,
		timestamp: "2026-07-29T00:00:00.000Z",
		type: "reasoning_metadata",
		runId: "g006-baseline",
		sessionId: "g006-baseline-session",
		cycle: "initial",
		data: { reasoning: { type: "thinking", present: true } },
	});
	const sideEffect = createJournalEntry({
		seq: 2,
		timestamp: "2026-07-29T00:00:01.000Z",
		type: "tool_side_effect",
		runId: "g006-baseline",
		sessionId: "g006-baseline-session",
		cycle: "initial",
		data: { sideEffect: { type: "source_write", toolCallId: "call-1" } },
	});
	const parsedReasoning = JSON.parse(JSON.stringify(reasoning)) as typeof reasoning;
	const parsedSideEffect = JSON.parse(JSON.stringify(sideEffect)) as typeof sideEffect;
	assert.equal(parsedReasoning.schemaVersion, G006_JOURNAL_SCHEMA_VERSION);
	assert.equal(parsedReasoning.type, "reasoning_metadata");
	assert.equal((parsedReasoning.data.reasoning as { type: string }).type, "thinking");
	assert.equal(parsedSideEffect.type, "tool_side_effect");
	assert.equal((parsedSideEffect.data.sideEffect as { type: string }).type, "source_write");
	assert.equal(parsedSideEffect.runId, "g006-baseline");
	assert.equal(parsedSideEffect.seq, 2);
});

test("G006 error attribution separates evidence, external service, route and task outcome", () => {
	const mismatch = createCycleCounters();
	mismatch.providerRequests = 2;
	mismatch.providerResponses = 1;
	mismatch.assistantMessages = 2;
	mismatch.successfulAssistantMessages = 2;
	mismatch.responseIdsPresent = 2;
	mismatch.toolStarts = 1;
	mismatch.toolEnds = 1;
	mismatch.settled = 1;
	assert.deepEqual(assessCycleCounters(mismatch, true), {
		ok: false,
		classification: "instrumentation_evidence",
		message: "subscriber provider-response count does not equal provider-request count",
	});
	assert.equal(dispositionForClassification("instrumentation_evidence"), "INVALID_G006_EVIDENCE");
	assert.equal(dispositionForClassification("fairness_provenance"), "INVALID_G006_EVIDENCE");
	assert.equal(classifyErrorMessage("429 quota exceeded"), "external_service");
	assert.equal(dispositionForClassification("external_service"), "BLOCKED_G006_SETUP_OR_EXTERNAL_SERVICE");
	assert.equal(classifyErrorMessage("public harness route invariant failed"), "route");
	assert.equal(dispositionForClassification("route"), "FAIL_REAL_MODEL_ROUTE");
	assert.equal(classifyVerifierStatus("failed"), "task_outcome");
	assert.equal(dispositionForClassification("task_outcome"), "PASS_REAL_MODEL_FEASIBILITY");
});

test("G006 complete source identity is deterministic and includes critical files", () => {
	const first = createSourceIdentity(g006Root);
	const second = createSourceIdentity(g006Root);
	assert.equal(first.fileCount >= 20, true);
	assert.equal(first.selected["driver.ts"]?.length, 64);
	assert.equal(first.selected["journal.ts"]?.length, 64);
	assert.equal(first.selected["acceptance/acceptance.test.ts"]?.length, 64);
	assert.equal(sourceIdentityMatches(first, second), true);
});

test("G006 task, fixture and acceptance bytes equal G005 before the attempt", () => {
	for (const relativePath of [
		"acceptance/acceptance.test.ts",
		"fixtures/parse-duration/task.md",
		"fixtures/parse-duration/package.json",
		"fixtures/parse-duration/src/parse-duration.ts",
		"fixtures/parse-duration/test/public.test.ts",
	]) {
		assert.deepEqual(
			readFileSync(resolve(projectRoot, "spikes/pi-runtime/g006", relativePath)),
			readFileSync(resolve(projectRoot, "spikes/pi-runtime/g005", relativePath)),
			relativePath,
		);
	}
});

test("G006 redacting storage keeps reasoning in memory but never writes its text", async () => {
	await withTempRoot(async (root) => {
		const marker = "G006_PRIVATE_REASONING_MARKER_DO_NOT_PERSIST";
		const path = resolve(root, "redaction-session.jsonl");
		const records: unknown[] = [];
		const storage = RedactingJsonlSessionStorage.create({
			filePath: path,
			id: "g006-redaction-test",
			cwd: root,
			metadata: { test: true },
			onReasoning: (record) => records.push(record),
		});
		const entry = {
			type: "message",
			id: "entry-1",
			parentId: null,
			timestamp: new Date().toISOString(),
			message: {
				role: "assistant",
				api: "openai-completions",
				provider: "deepseek",
				model: "deepseek-v4-flash",
				content: [
					{ type: "thinking", thinking: marker, thinkingSignature: "reasoning_content" },
					{ type: "text", text: "visible" },
				],
				usage: {
					input: 1,
					output: 1,
					cacheRead: 0,
					cacheWrite: 0,
					totalTokens: 2,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
				},
				stopReason: "stop",
				timestamp: Date.now(),
			},
		} as SessionTreeEntry;
		await storage.appendEntry(entry);
		assert.equal(JSON.stringify(await storage.getEntries()).includes(marker), true);
		assert.equal(readFileSync(path, "utf8").includes(marker), false);
		assert.equal(records.length, 1);
	});
});

test("G006 fixed fixture starts public-pass/external-fail and known repair passes", async () => {
	await withTempRoot(async (root) => {
		const fixture = resolve(projectRoot, "spikes/pi-runtime/g006/fixtures/parse-duration");
		const initial = resolve(root, "initial");
		const repaired = resolve(root, "repaired");
		cpSync(fixture, initial, { recursive: true, errorOnExist: true, force: false });
		cpSync(fixture, repaired, { recursive: true, errorOnExist: true, force: false });
		const initialResult = await verifyWorkspace({
			projectRoot,
			workspace: initial,
			evidencePath: resolve(root, "initial-verifier.json"),
		});
		assert.equal(initialResult.status, "failed");
		writeFileSync(
			resolve(repaired, "src/parse-duration.ts"),
			`export function parseDuration(input: string): number {\n\tconst match = input.trim().match(/^(\\d+)(ms|s|m)$/);\n\tif (!match) throw new Error("invalid duration");\n\tconst value = Number(match[1]);\n\tconst multiplier = match[2] === "ms" ? 1 : match[2] === "s" ? 1000 : 60000;\n\tconst result = value * multiplier;\n\tif (!Number.isSafeInteger(value) || !Number.isSafeInteger(result)) throw new Error("unsafe duration");\n\treturn result;\n}\n`,
			"utf8",
		);
		const repairedResult = await verifyWorkspace({
			projectRoot,
			workspace: repaired,
			evidencePath: resolve(root, "repaired-verifier.json"),
		});
		assert.equal(repairedResult.status, "passed");
	});
});
