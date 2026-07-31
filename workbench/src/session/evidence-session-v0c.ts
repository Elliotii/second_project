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
import {
	sanitizeSessionEntry,
	type PersistedSessionEntryProjectionV0B,
	type SessionRedactionStatsV0B,
} from "./evidence-session.ts";

export interface RuntimeSessionMetadataV0C extends SessionMetadata {
	run_id: string;
	workspace_id: string;
	strategy_id: string;
}

export class EvidenceMirrorSessionStorageV0C implements SessionStorage<RuntimeSessionMetadataV0C> {
	private readonly runtime: InMemorySessionStorage<RuntimeSessionMetadataV0C>;
	private readonly evidence: JsonlSessionStorage;
	readonly evidencePath: string;
	private readonly onPersist: (projection: PersistedSessionEntryProjectionV0B) => void;
	readonly redaction: SessionRedactionStatsV0B = {
		reasoning_blocks: 0,
		reasoning_characters: 0,
		reasoning_utf8_bytes: 0,
		removed_signatures: 0,
		reasoning_content_types: {},
		truncated_entries: 0,
	};

	private constructor(
		runtime: InMemorySessionStorage<RuntimeSessionMetadataV0C>,
		evidence: JsonlSessionStorage,
		evidencePath: string,
		onPersist: (projection: PersistedSessionEntryProjectionV0B) => void,
	) {
		this.runtime = runtime;
		this.evidence = evidence;
		this.evidencePath = evidencePath;
		this.onPersist = onPersist;
	}

	static async create(options: {
		evidencePath: string;
		workspaceRoot: string;
		metadata: RuntimeSessionMetadataV0C;
		onPersist: (projection: PersistedSessionEntryProjectionV0B) => void;
	}): Promise<EvidenceMirrorSessionStorageV0C> {
		const runtime = new InMemorySessionStorage<RuntimeSessionMetadataV0C>({ metadata: options.metadata });
		const env = new NodeExecutionEnv({ cwd: options.workspaceRoot });
		const evidence = await JsonlSessionStorage.create(env, options.evidencePath, {
			cwd: options.workspaceRoot,
			sessionId: options.metadata.id,
			metadata: {
				run_id: options.metadata.run_id,
				workspace_id: options.metadata.workspace_id,
				strategy_id: options.metadata.strategy_id,
				evidence_contract: "reasoning_safe_v0c",
			},
		});
		return new EvidenceMirrorSessionStorageV0C(runtime, evidence, options.evidencePath, options.onPersist);
	}

	async getMetadata(): Promise<RuntimeSessionMetadataV0C> {
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

