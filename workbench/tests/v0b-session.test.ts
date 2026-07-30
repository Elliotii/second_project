import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { Session, type AgentMessage } from "@earendil-works/pi-agent-core";
import {
	EvidenceMirrorSessionStorageV0B,
	EvidencePersistenceOperationErrorV0B,
	reopenAndValidateEvidenceSession,
} from "../src/session/evidence-session.ts";
import { PROJECT_ROOT } from "./helpers.ts";

test("reasoning-safe Session mirror strips synthetic private analysis and signature while public JSONL reopens", async () => {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases/session-redaction");
	mkdirSync(root, { recursive: true });
	const path = resolve(root, `session-${Date.now()}.jsonl`);
	const persisted: string[] = [];
	const storage = await EvidenceMirrorSessionStorageV0B.create({
		evidencePath: path,
		workspaceRoot: root,
		metadata: {
			id: "session-redaction",
			createdAt: new Date().toISOString(),
			attempt_id: "attempt-redaction",
			workspace_id: "workspace-redaction",
			strategy_id: "v0_observe_only_faux",
		},
		onPersist: (entry) => persisted.push(entry.entry_id),
	});
	const session = new Session(storage);
	const privateBody = "V0B_PRIVATE_ANALYSIS_SENTINEL-私密🚫";
	const privateSignature = "V0B_PRIVATE_SIGNATURE_SENTINEL";
	const assistant = {
		role: "assistant",
		content: [
			{ type: "thinking", thinking: privateBody, thinkingSignature: privateSignature },
			{
				type: "toolCall",
				id: "tool-redaction",
				name: "workspace_read",
				arguments: { path: "task.md", authorization: "V0B_AUTH_SENTINEL" },
				thoughtSignature: privateSignature,
			},
		],
		api: "faux",
		provider: "faux",
		model: "faux",
		usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
		stopReason: "toolUse",
		timestamp: Date.now(),
	} as unknown as AgentMessage;
	const toolResult = {
		role: "toolResult",
		toolCallId: "tool-redaction",
		toolName: "workspace_read",
		content: [{ type: "text", text: "safe bounded result" }],
		isError: false,
		timestamp: Date.now(),
	} as unknown as AgentMessage;
	await session.appendMessage(assistant);
	await session.appendMessage(toolResult);
	const bytes = readFileSync(path, "utf8");
	assert.doesNotMatch(bytes, new RegExp(privateBody));
	assert.doesNotMatch(bytes, new RegExp(privateSignature));
	assert.doesNotMatch(bytes, /V0B_AUTH_SENTINEL/);
	assert.match(bytes, /private analysis omitted/);
	assert.equal(storage.redaction.reasoning_blocks, 1);
	assert.equal(storage.redaction.reasoning_characters, [...privateBody].length);
	assert.equal(storage.redaction.reasoning_utf8_bytes, Buffer.byteLength(privateBody, "utf8"));
	assert.notEqual(storage.redaction.reasoning_characters, storage.redaction.reasoning_utf8_bytes);
	assert.equal(storage.redaction.removed_signatures, 2);
	assert.deepEqual(storage.redaction.reasoning_content_types, {
		string: {
			blocks: 1,
			characters: [...privateBody].length,
			utf8_bytes: Buffer.byteLength(privateBody, "utf8"),
		},
	});
	assert.equal(persisted.length, 2);
	const reopened = await reopenAndValidateEvidenceSession({
		evidencePath: path,
		workspaceRoot: root,
		sessionId: "session-redaction",
	});
	assert.deepEqual(reopened.errors, []);
	assert.deepEqual(reopened.toolCallIds, ["tool-redaction"]);
	assert.deepEqual(reopened.toolResultIds, ["tool-redaction"]);
});

test("evidence mirror exposes an actual append-operation failure without misreporting persistence", async () => {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases/session-persistence-operation");
	mkdirSync(root, { recursive: true });
	const path = resolve(root, `session-${Date.now()}.jsonl`);
	const storage = await EvidenceMirrorSessionStorageV0B.create({
		evidencePath: path,
		workspaceRoot: root,
		metadata: {
			id: "session-persistence-operation",
			createdAt: new Date().toISOString(),
			attempt_id: "attempt-persistence-operation",
			workspace_id: "workspace-persistence-operation",
			strategy_id: "v0_observe_only_faux",
		},
		onPersist: () => {
			throw new Error("onPersist must not run after failed evidence append");
		},
		testFaultInjection: { failEvidenceAppendAt: 1 },
	});
	const session = new Session(storage);
	await assert.rejects(
		async () =>
			await session.appendMessage({
				role: "user",
				content: "safe persistence probe",
				timestamp: Date.now(),
			} as AgentMessage),
		(error: unknown) => error instanceof EvidencePersistenceOperationErrorV0B,
	);
	assert.equal((readFileSync(path, "utf8").match(/\n/g) ?? []).length, 1, "only the JSONL header may persist");
});
