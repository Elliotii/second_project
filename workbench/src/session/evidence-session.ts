import {
	InMemorySessionStorage,
	JsonlSessionStorage,
	type SessionEntryCursorOptions,
	type SessionMetadata,
	type SessionStats,
	type SessionStorage,
	type SessionTreeEntry,
} from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { stableJson } from "../hash.ts";

const INLINE_TEXT_BYTES = 8_192;
const SECRET_KEY = /^(?:api[_-]?key|authorization|auth[_-]?token|access[_-]?token|password|secret)$/i;

export interface RuntimeSessionMetadataV0B extends SessionMetadata {
	attempt_id: string;
	workspace_id: string;
	strategy_id: string;
}

export interface SessionRedactionStatsV0B {
	reasoning_blocks: number;
	reasoning_characters: number;
	reasoning_utf8_bytes: number;
	removed_signatures: number;
	reasoning_content_types: Record<
		string,
		{
			blocks: number;
			characters: number;
			utf8_bytes: number;
		}
	>;
	truncated_entries: number;
}

export interface PersistedSessionEntryProjectionV0B {
	entry_id: string;
	parent_id: string | null;
	entry_type: string;
	tool_call_ids: string[];
	tool_result_ids: string[];
	truncated: boolean;
}

function boundedText(value: string): { text: string; truncated: boolean } {
	const bytes = Buffer.from(value, "utf8");
	if (bytes.length <= INLINE_TEXT_BYTES) return { text: value, truncated: false };
	const marker = "\n[output externalization required; inline projection truncated]";
	const budget = Math.max(0, INLINE_TEXT_BYTES - Buffer.byteLength(marker));
	return { text: `${bytes.subarray(0, budget).toString("utf8")}${marker}`, truncated: true };
}

function safeUnknown(value: unknown, stats: SessionRedactionStatsV0B, depth = 0): unknown {
	if (depth > 6) return "[nested value omitted]";
	if (Array.isArray(value)) return value.slice(0, 100).map((entry) => safeUnknown(entry, stats, depth + 1));
	if (!value || typeof value !== "object") {
		if (typeof value === "string") return boundedText(value).text;
		return value;
	}
	const projected: Record<string, unknown> = {};
	for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
		if (/(?:thought|thinking).*signature/i.test(key)) {
			if (typeof entry === "string") stats.removed_signatures += 1;
			continue;
		}
		if (SECRET_KEY.test(key)) continue;
		projected[key] = safeUnknown(entry, stats, depth + 1);
	}
	return projected;
}

function recordReasoningMetadata(body: unknown, stats: SessionRedactionStatsV0B): {
	contentType: string;
	characters: number;
	utf8Bytes: number;
} {
	const contentType = typeof body;
	const text = typeof body === "string" ? body : "";
	const characters = [...text].length;
	const utf8Bytes = Buffer.byteLength(text, "utf8");
	stats.reasoning_blocks += 1;
	stats.reasoning_characters += characters;
	stats.reasoning_utf8_bytes += utf8Bytes;
	const aggregate = stats.reasoning_content_types[contentType] ?? { blocks: 0, characters: 0, utf8_bytes: 0 };
	aggregate.blocks += 1;
	aggregate.characters += characters;
	aggregate.utf8_bytes += utf8Bytes;
	stats.reasoning_content_types[contentType] = aggregate;
	return { contentType, characters, utf8Bytes };
}

function sanitizeMessage(
	message: unknown,
	stats: SessionRedactionStatsV0B,
): { message: unknown; toolCallIds: string[]; toolResultIds: string[]; truncated: boolean } {
	const cloned = structuredClone(message) as Record<string, unknown>;
	const toolCallIds: string[] = [];
	const toolResultIds: string[] = [];
	let truncated = false;
	const role = cloned.role;
	if (role === "assistant" && Array.isArray(cloned.content)) {
		const safeContent: unknown[] = [];
		for (const part of cloned.content) {
			if (!part || typeof part !== "object") continue;
			const item = part as Record<string, unknown>;
			if (item.type === "thinking") {
				const metadata = recordReasoningMetadata(item.thinking, stats);
				if (typeof item.thinkingSignature === "string") stats.removed_signatures += 1;
				if (typeof item.thoughtSignature === "string") stats.removed_signatures += 1;
				safeContent.push({
					type: "text",
					text: `[private analysis omitted; content_type=${metadata.contentType}; ${metadata.characters} characters; ${metadata.utf8Bytes} UTF-8 bytes]`,
				});
				continue;
			}
			if (item.type === "text") {
				const bounded = boundedText(typeof item.text === "string" ? item.text : "");
				truncated ||= bounded.truncated;
				safeContent.push({ type: "text", text: bounded.text });
				continue;
			}
			if (item.type === "toolCall") {
				const id = typeof item.id === "string" ? item.id : "";
				if (id) toolCallIds.push(id);
				const safeToolCall: Record<string, unknown> = {
					type: "toolCall",
					id,
					name: typeof item.name === "string" ? item.name : "unknown",
					arguments: safeUnknown(item.arguments, stats),
				};
				if (typeof item.thinkingSignature === "string") stats.removed_signatures += 1;
				if (typeof item.thoughtSignature === "string") stats.removed_signatures += 1;
				if ("partialJson" in item && typeof item.partialJson === "string") {
					safeToolCall.partialJson = boundedText(item.partialJson).text;
				}
				safeContent.push(safeToolCall);
			}
		}
		cloned.content = safeContent;
		delete cloned.responseId;
	} else if (role === "toolResult") {
		const toolCallId = typeof cloned.toolCallId === "string" ? cloned.toolCallId : "";
		if (toolCallId) toolResultIds.push(toolCallId);
		if (Array.isArray(cloned.content)) {
			cloned.content = cloned.content.flatMap((part) => {
				if (!part || typeof part !== "object") return [];
				const item = part as Record<string, unknown>;
				if (item.type !== "text") return [{ type: "text", text: "[non-text tool output omitted]" }];
				const bounded = boundedText(typeof item.text === "string" ? item.text : "");
				truncated ||= bounded.truncated;
				return [{ type: "text", text: bounded.text }];
			});
		}
		delete cloned.details;
	} else if (role === "user") {
		if (typeof cloned.content === "string") {
			const bounded = boundedText(cloned.content);
			cloned.content = bounded.text;
			truncated ||= bounded.truncated;
		} else if (Array.isArray(cloned.content)) {
			cloned.content = cloned.content.flatMap((part) => {
				if (!part || typeof part !== "object") return [];
				const item = part as Record<string, unknown>;
				if (item.type !== "text") return [{ type: "text", text: "[non-text user content omitted]" }];
				const bounded = boundedText(typeof item.text === "string" ? item.text : "");
				truncated ||= bounded.truncated;
				return [{ type: "text", text: bounded.text }];
			});
		}
	}
	if (truncated) stats.truncated_entries += 1;
	return { message: cloned, toolCallIds, toolResultIds, truncated };
}

export function sanitizeSessionEntry(
	entry: SessionTreeEntry,
	stats: SessionRedactionStatsV0B,
): { entry: SessionTreeEntry; projection: PersistedSessionEntryProjectionV0B } {
	const cloned = structuredClone(entry) as SessionTreeEntry;
	let toolCallIds: string[] = [];
	let toolResultIds: string[] = [];
	let truncated = false;
	if (cloned.type === "message") {
		const sanitized = sanitizeMessage(cloned.message, stats);
		cloned.message = sanitized.message as typeof cloned.message;
		toolCallIds = sanitized.toolCallIds;
		toolResultIds = sanitized.toolResultIds;
		truncated = sanitized.truncated;
	} else if (cloned.type === "compaction") {
		const bounded = boundedText(cloned.summary);
		cloned.summary = bounded.text;
		cloned.details = safeUnknown(cloned.details, stats);
		truncated = bounded.truncated;
	} else if (cloned.type === "branch_summary") {
		const bounded = boundedText(cloned.summary);
		cloned.summary = bounded.text;
		cloned.details = safeUnknown(cloned.details, stats);
		truncated = bounded.truncated;
	} else if (cloned.type === "custom" || cloned.type === "custom_message") {
		if (cloned.type === "custom") cloned.data = safeUnknown(cloned.data, stats);
		if (cloned.type === "custom_message") {
			cloned.content = "[custom message content omitted]";
			cloned.details = safeUnknown(cloned.details, stats);
		}
	}
	return {
		entry: cloned,
		projection: {
			entry_id: cloned.id,
			parent_id: cloned.parentId,
			entry_type: cloned.type,
			tool_call_ids: toolCallIds,
			tool_result_ids: toolResultIds,
			truncated,
		},
	};
}

export class EvidenceMirrorSessionStorageV0B implements SessionStorage<RuntimeSessionMetadataV0B> {
	private readonly runtime: InMemorySessionStorage<RuntimeSessionMetadataV0B>;
	private readonly evidence: JsonlSessionStorage;
	readonly evidencePath: string;
	private readonly onPersist: (projection: PersistedSessionEntryProjectionV0B) => void;
	private readonly failEvidenceAppendAt: number | null;
	private appendCount = 0;
	readonly redaction: SessionRedactionStatsV0B = {
		reasoning_blocks: 0,
		reasoning_characters: 0,
		reasoning_utf8_bytes: 0,
		removed_signatures: 0,
		reasoning_content_types: {},
		truncated_entries: 0,
	};

	private constructor(
		runtime: InMemorySessionStorage<RuntimeSessionMetadataV0B>,
		evidence: JsonlSessionStorage,
		evidencePath: string,
		onPersist: (projection: PersistedSessionEntryProjectionV0B) => void,
		failEvidenceAppendAt: number | null,
	) {
		this.runtime = runtime;
		this.evidence = evidence;
		this.evidencePath = evidencePath;
		this.onPersist = onPersist;
		this.failEvidenceAppendAt = failEvidenceAppendAt;
	}

	static async create(options: {
		evidencePath: string;
		workspaceRoot: string;
		metadata: RuntimeSessionMetadataV0B;
		onPersist: (projection: PersistedSessionEntryProjectionV0B) => void;
		testFaultInjection?: {
			failEvidenceAppendAt: number;
		};
	}): Promise<EvidenceMirrorSessionStorageV0B> {
		const runtime = new InMemorySessionStorage<RuntimeSessionMetadataV0B>({ metadata: options.metadata });
		const env = new NodeExecutionEnv({ cwd: options.workspaceRoot });
		const evidence = await JsonlSessionStorage.create(env, options.evidencePath, {
			cwd: options.workspaceRoot,
			sessionId: options.metadata.id,
			metadata: {
				attempt_id: options.metadata.attempt_id,
				workspace_id: options.metadata.workspace_id,
				strategy_id: options.metadata.strategy_id,
				evidence_contract: "reasoning_safe_v0b",
			},
		});
		return new EvidenceMirrorSessionStorageV0B(
			runtime,
			evidence,
			options.evidencePath,
			options.onPersist,
			options.testFaultInjection?.failEvidenceAppendAt ?? null,
		);
	}

	async getMetadata(): Promise<RuntimeSessionMetadataV0B> {
		return await this.runtime.getMetadata();
	}
	async getLeafId(): Promise<string | null> {
		return await this.runtime.getLeafId();
	}
	async setLeafId(leafId: string | null): Promise<void> {
		await this.runtime.setLeafId(leafId);
		await this.evidence.setLeafId(leafId);
	}
	async createEntryId(): Promise<string> {
		return await this.runtime.createEntryId();
	}
	async appendEntry(entry: SessionTreeEntry): Promise<void> {
		await this.runtime.appendEntry(entry);
		const sanitized = sanitizeSessionEntry(entry, this.redaction);
		this.appendCount += 1;
		if (this.failEvidenceAppendAt === this.appendCount) {
			throw new EvidencePersistenceOperationErrorV0B(this.appendCount);
		}
		await this.evidence.appendEntry(sanitized.entry);
		this.onPersist(sanitized.projection);
	}
	async getEntry(id: string): Promise<SessionTreeEntry | undefined> {
		return await this.runtime.getEntry(id);
	}
	async findEntries<TType extends SessionTreeEntry["type"]>(
		type: TType,
	): Promise<Array<Extract<SessionTreeEntry, { type: TType }>>> {
		return await this.runtime.findEntries(type);
	}
	async getLabel(id: string): Promise<string | undefined> {
		return await this.runtime.getLabel(id);
	}
	async getSessionName(): Promise<string | undefined> {
		return await this.runtime.getSessionName();
	}
	async getSessionStats(): Promise<SessionStats> {
		return await this.runtime.getSessionStats();
	}
	async getPathToRootOrCompaction(leafId: string | null): Promise<SessionTreeEntry[]> {
		return await this.runtime.getPathToRootOrCompaction(leafId);
	}
	async getEntries(options?: SessionEntryCursorOptions): Promise<SessionTreeEntry[]> {
		return await this.runtime.getEntries(options);
	}
}

export class EvidencePersistenceOperationErrorV0B extends Error {
	readonly appendOrdinal: number;

	constructor(appendOrdinal: number) {
		super("reasoning-safe evidence mirror append failed");
		this.name = "EvidencePersistenceOperationErrorV0B";
		this.appendOrdinal = appendOrdinal;
	}
}

export async function reopenAndValidateEvidenceSession(options: {
	evidencePath: string;
	workspaceRoot: string;
	sessionId: string;
}): Promise<{ entryCount: number; toolCallIds: string[]; toolResultIds: string[]; errors: string[] }> {
	const env = new NodeExecutionEnv({ cwd: options.workspaceRoot });
	const storage = await JsonlSessionStorage.open(env, options.evidencePath);
	const metadata = await storage.getMetadata();
	const entries = await storage.getEntries();
	const errors: string[] = [];
	if (metadata.id !== options.sessionId) errors.push("evidence Session ID mismatch");
	const byId = new Set<string>();
	const toolCallIds: string[] = [];
	const toolResultIds: string[] = [];
	for (const entry of entries) {
		if (byId.has(entry.id)) errors.push(`duplicate Session entry ID: ${entry.id}`);
		if (entry.parentId !== null && !byId.has(entry.parentId)) errors.push(`invalid Session parent chain: ${entry.id}`);
		byId.add(entry.id);
		if (entry.type !== "message") continue;
		const message = entry.message as unknown as Record<string, unknown>;
		if (message.role === "assistant" && Array.isArray(message.content)) {
			for (const part of message.content) {
				if (part && typeof part === "object" && (part as Record<string, unknown>).type === "toolCall") {
					const id = (part as Record<string, unknown>).id;
					if (typeof id === "string") toolCallIds.push(id);
				}
			}
		}
		if (message.role === "toolResult" && typeof message.toolCallId === "string") toolResultIds.push(message.toolCallId);
	}
	for (const callId of toolCallIds) if (!toolResultIds.includes(callId)) errors.push(`Session tool result missing: ${callId}`);
	for (const callId of toolResultIds) if (!toolCallIds.includes(callId)) errors.push(`Session tool call missing: ${callId}`);
	const serialized = stableJson(entries);
	for (const pattern of [/"type":"thinking"/i, /thoughtsignature/i, /thinkingsignature/i, /authorization/i, /api[_-]?key/i]) {
		if (pattern.test(serialized)) errors.push(`forbidden persisted Session pattern: ${pattern.source}`);
	}
	return { entryCount: entries.length, toolCallIds, toolResultIds, errors };
}
