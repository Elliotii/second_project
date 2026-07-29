import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
	InMemorySessionStorage,
	type SessionMetadata,
	type SessionTreeEntry,
} from "@earendil-works/pi-agent-core";

export type ReasoningRecord = {
	entryId: string;
	contentIndex: number;
	type: "thinking" | "thought_signature";
	present: true;
	characterLength: number;
	utf8Bytes: number;
};

function redactEntry(entry: SessionTreeEntry): { persisted: SessionTreeEntry; reasoning: ReasoningRecord[] } {
	const persisted = structuredClone(entry);
	const reasoning: ReasoningRecord[] = [];
	if (persisted.type !== "message" || persisted.message.role !== "assistant") return { persisted, reasoning };
	const content = persisted.message.content.flatMap((block, contentIndex) => {
		if (block.type === "thinking") {
			reasoning.push({
				entryId: persisted.id,
				contentIndex,
				type: "thinking",
				present: true,
				characterLength: block.thinking.length,
				utf8Bytes: Buffer.byteLength(block.thinking, "utf8"),
			});
			return [];
		}
		if (block.type === "toolCall" && block.thoughtSignature) {
			reasoning.push({
				entryId: persisted.id,
				contentIndex,
				type: "thought_signature",
				present: true,
				characterLength: block.thoughtSignature.length,
				utf8Bytes: Buffer.byteLength(block.thoughtSignature, "utf8"),
			});
			const redacted = { ...block };
			delete redacted.thoughtSignature;
			return [redacted];
		}
		return [block];
	});
	persisted.message.content = content;
	return { persisted, reasoning };
}

export class RedactingJsonlSessionStorage extends InMemorySessionStorage<SessionMetadata> {
	readonly filePath: string;
	private readonly onReasoning: (record: ReasoningRecord) => void;

	private constructor(options: {
		filePath: string;
		metadata: SessionMetadata;
		onReasoning: (record: ReasoningRecord) => void;
	}) {
		super({ metadata: options.metadata });
		this.filePath = options.filePath;
		this.onReasoning = options.onReasoning;
	}

	static create(options: {
		filePath: string;
		id: string;
		cwd: string;
		metadata: Record<string, unknown>;
		onReasoning: (record: ReasoningRecord) => void;
	}): RedactingJsonlSessionStorage {
		const createdAt = new Date().toISOString();
		mkdirSync(dirname(options.filePath), { recursive: true });
		writeFileSync(
			options.filePath,
			`${JSON.stringify({
				type: "session",
				version: 3,
				id: options.id,
				timestamp: createdAt,
				cwd: options.cwd,
				metadata: options.metadata,
			})}\n`,
			{ encoding: "utf8", flag: "wx" },
		);
		return new RedactingJsonlSessionStorage({
			filePath: options.filePath,
			metadata: { id: options.id, createdAt },
			onReasoning: options.onReasoning,
		});
	}

	override async appendEntry(entry: SessionTreeEntry): Promise<void> {
		await super.appendEntry(entry);
		const { persisted, reasoning } = redactEntry(entry);
		for (const record of reasoning) this.onReasoning(record);
		appendFileSync(this.filePath, `${JSON.stringify(persisted)}\n`, "utf8");
	}

	override async setLeafId(leafId: string | null): Promise<void> {
		const before = (await this.getEntries()).length;
		await super.setLeafId(leafId);
		const entry = (await this.getEntries({ afterEntrySeq: before, limit: 1 }))[0];
		if (entry) appendFileSync(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
	}
}
