import assert from "node:assert/strict";
import test from "node:test";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SessionTreeEntry } from "@earendil-works/pi-agent-core";
import { G005_TOOL_NAMES, createG005Tools } from "./tools.ts";
import { DEEPSEEK_MODEL } from "./model.ts";
import { RedactingJsonlSessionStorage } from "./session-storage.ts";
import { verifyWorkspace } from "./verifier.ts";

const projectRoot = resolve(import.meta.dirname, "../../..");
const offlineRoot = resolve(projectRoot, ".runs/g005/offline-gates");

test("G005 offline descriptor and restricted-tool shape are frozen", () => {
	assert.equal(DEEPSEEK_MODEL.id, "deepseek-v4-flash");
	assert.equal(DEEPSEEK_MODEL.maxTokens, 8_192);
	assert.equal(DEEPSEEK_MODEL.thinkingLevelMap?.high, "high");
	assert.equal(DEEPSEEK_MODEL.compat?.requiresReasoningContentOnAssistantMessages, true);
	const tools = createG005Tools();
	assert.deepEqual(tools.map((tool) => tool.name), [...G005_TOOL_NAMES]);
	for (const tool of tools) {
		const keys = Object.keys((tool.parameters as { properties?: object }).properties ?? {});
		assert.equal(keys.includes("path"), false);
		assert.equal(keys.includes("command"), false);
	}
});

test("G005 redacting storage keeps reasoning in memory but never writes its text", async () => {
	mkdirSync(offlineRoot, { recursive: true });
	const marker = "G005_PRIVATE_REASONING_MARKER_DO_NOT_PERSIST";
	const path = resolve(offlineRoot, "redaction-session.jsonl");
	const records: unknown[] = [];
	const storage = RedactingJsonlSessionStorage.create({
		filePath: path,
		id: "g005-redaction-test",
		cwd: offlineRoot,
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
			content: [{ type: "thinking", thinking: marker, thinkingSignature: "reasoning_content" }, { type: "text", text: "visible" }],
			usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
			stopReason: "stop",
			timestamp: Date.now(),
		},
	} as SessionTreeEntry;
	await storage.appendEntry(entry);
	assert.equal(JSON.stringify(await storage.getEntries()).includes(marker), true);
	assert.equal(readFileSync(path, "utf8").includes(marker), false);
	assert.equal(records.length, 1);
});

test("G005 fixed fixture starts public-pass/hidden-fail and verifier detects a complete repair", async () => {
	const fixture = resolve(projectRoot, "spikes/pi-runtime/g005/fixtures/parse-duration");
	const initial = resolve(offlineRoot, "initial");
	const repaired = resolve(offlineRoot, "repaired");
	cpSync(fixture, initial, { recursive: true, errorOnExist: true, force: false });
	cpSync(fixture, repaired, { recursive: true, errorOnExist: true, force: false });
	const initialResult = await verifyWorkspace({ projectRoot, workspace: initial, evidencePath: resolve(offlineRoot, "initial-verifier.json") });
	assert.equal(initialResult.status, "failed");
	writeFileSync(
		resolve(repaired, "src/parse-duration.ts"),
		`export function parseDuration(input: string): number {\n\tconst match = input.trim().match(/^(\\d+)(ms|s|m)$/);\n\tif (!match) throw new Error("invalid duration");\n\tconst value = Number(match[1]);\n\tconst multiplier = match[2] === "ms" ? 1 : match[2] === "s" ? 1000 : 60000;\n\tconst result = value * multiplier;\n\tif (!Number.isSafeInteger(value) || !Number.isSafeInteger(result)) throw new Error("unsafe duration");\n\treturn result;\n}\n`,
		"utf8",
	);
	const repairedResult = await verifyWorkspace({ projectRoot, workspace: repaired, evidencePath: resolve(offlineRoot, "repaired-verifier.json") });
	assert.equal(repairedResult.status, "passed");
});
