import { closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { AgentHarness, JsonlSessionRepo, type JsonlSessionMetadata, type Session, type SessionTreeEntry } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { PersistentRunManifestV35, PersistentSessionCatalogEntryV35, PersistentSessionCatalogV35, SafeRunViewV35, SafeSessionMessageV35, SafeSessionViewV35 } from "../contracts/v35-types.ts";
import { readJsonArtifact, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { createBoundedToolProfile } from "../pi/tool-profile.ts";

const CATALOG_FILE = "catalog-v1.json";
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const RUNTIME_SYSTEM_PROMPT = "You are a deterministic V3.5 persistence proof agent. Use only the provided bounded tool.";

interface RuntimeMetadataV35 extends Record<string, unknown> {
	schema_version: 1;
	project_id: string;
	workspace_id: string;
	workspace_path_sha256: string;
}

export interface PersistentSessionServiceOptionsV35 {
	dataRoot: string;
	projectId: string;
	workspaceRoot: string;
	workspaceId: string;
}

export interface PersistentTurnResultV35 {
	manifest: PersistentRunManifestV35;
	view: SafeSessionViewV35;
	listed_before: string[];
}

function assertIdentifier(value: string, label: string): void {
	if (!IDENTIFIER.test(value)) throw new Error(`${label} is invalid`);
}

function portable(value: string): string {
	return value.split(sep).join("/");
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function canonicalDirectory(path: string, label: string, create = false): string {
	const target = resolve(path);
	if (create) mkdirSync(target, { recursive: true });
	const stats = lstatSync(target);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(target);
}

function assertLinkFreePath(root: string, target: string, allowMissingLeaf: boolean): void {
	if (!contained(root, target)) throw new Error("operational path escapes data root");
	const rel = relative(root, target);
	let cursor = root;
	for (const segment of rel === "" ? [] : rel.split(sep)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) {
			if (allowMissingLeaf) return;
			throw new Error("operational path is missing");
		}
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error("operational path contains a symlink or junction");
	}
}

function resolveOperationalRef(root: string, ref: string, allowMissingLeaf = false): string {
	if (typeof ref !== "string" || ref === "" || ref.includes("\0") || isAbsolute(ref) || /^[A-Za-z]:/.test(ref) || ref.replaceAll("\\", "/").split("/").includes("..")) {
		throw new Error("invalid operational relative path");
	}
	const target = resolve(root, ref);
	assertLinkFreePath(root, target, allowMissingLeaf);
	return target;
}

function workspacePathDigest(workspaceRoot: string): string {
	const normalized = process.platform === "win32" ? workspaceRoot.toLowerCase() : workspaceRoot;
	return sha256(normalized.replaceAll("\\", "/"));
}

function runtimeMetadata(value: unknown): RuntimeMetadataV35 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Pi Session metadata is missing");
	const metadata = value as Partial<RuntimeMetadataV35>;
	if (metadata.schema_version !== 1 || typeof metadata.project_id !== "string" || typeof metadata.workspace_id !== "string" || typeof metadata.workspace_path_sha256 !== "string" || !SHA256.test(metadata.workspace_path_sha256)) {
		throw new Error("Pi Session metadata is invalid");
	}
	return metadata as RuntimeMetadataV35;
}

function catalogEntryIdentity(entry: PersistentSessionCatalogEntryV35): string {
	return digestObject({
		schema_version: entry.schema_version,
		session_id: entry.session_id,
		project_id: entry.project_id,
		workspace_id: entry.workspace_id,
		workspace_path_sha256: entry.workspace_path_sha256,
		pi_session_ref: entry.pi_session_ref,
		parent_session_id: entry.parent_session_id,
	});
}

function parseCatalog(value: unknown): PersistentSessionCatalogV35 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Session catalog is invalid");
	const catalog = value as Partial<PersistentSessionCatalogV35>;
	if (catalog.schema_version !== 1 || typeof catalog.project_id !== "string" || !Array.isArray(catalog.sessions)) throw new Error("Session catalog schema is invalid");
	const seen = new Set<string>();
	const seenRuns = new Set<string>();
	for (const candidate of catalog.sessions) {
		if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) throw new Error("Session catalog entry is invalid");
		const entry = candidate as PersistentSessionCatalogEntryV35;
		if (entry.schema_version !== 1 || !IDENTIFIER.test(entry.session_id) || !IDENTIFIER.test(entry.project_id) || !IDENTIFIER.test(entry.workspace_id) || !SHA256.test(entry.workspace_path_sha256) || typeof entry.title !== "string" || typeof entry.created_at !== "string" || typeof entry.updated_at !== "string" || (entry.parent_session_id !== null && !IDENTIFIER.test(entry.parent_session_id)) || typeof entry.pi_session_ref !== "string" || !Array.isArray(entry.run_refs)) throw new Error("Session catalog entry schema is invalid");
		if (seen.has(entry.session_id)) throw new Error("Session catalog contains duplicate identity");
		seen.add(entry.session_id);
		for (const run of entry.run_refs) {
			if (!run || !IDENTIFIER.test(run.run_id) || typeof run.run_ref !== "string" || typeof run.created_at !== "string") throw new Error("Session catalog Run reference is invalid");
			if (seenRuns.has(run.run_id)) throw new Error("Session catalog contains duplicate Run identity");
			seenRuns.add(run.run_id);
		}
	}
	return catalog as PersistentSessionCatalogV35;
}

function readCatalog(root: string, expectedProjectId: string): PersistentSessionCatalogV35 {
	const path = resolveOperationalRef(root, CATALOG_FILE);
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error("Session catalog is missing or corrupt", { cause: error });
	}
	const catalog = parseCatalog(parsed);
	if (catalog.project_id !== expectedProjectId) throw new Error("cross-project Session catalog rejected");
	return catalog;
}

function writeCatalog(root: string, catalog: PersistentSessionCatalogV35): void {
	parseCatalog(catalog);
	const target = resolveOperationalRef(root, CATALOG_FILE, true);
	const temporary = resolveOperationalRef(root, `${CATALOG_FILE}.${process.pid}.${Date.now()}.tmp`, true);
	const handle = openSync(temporary, "wx");
	try {
		writeFileSync(handle, `${stableJson(catalog)}\n`);
	} finally {
		closeSync(handle);
	}
	try {
		renameSync(temporary, target);
	} catch (error) {
		if (existsSync(temporary)) unlinkSync(temporary);
		throw error;
	}
}

function safeText(value: string): string {
	const redacted = value
		.replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+/gi, "[credential omitted]")
		.replace(/\b(api[_-]?key|authorization|password|secret|access[_-]?token)\s*[:=]\s*[^\s,;]+/gi, "$1=[credential omitted]")
		.replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"']+/g, "[path omitted]")
		.replace(/(^|\s)\/(?:[^\s"']+\/)*[^\s"']*/g, "$1[path omitted]");
	const bytes = Buffer.from(redacted, "utf8");
	if (bytes.length <= 8_192) return redacted;
	return `${bytes.subarray(0, 8_128).toString("utf8")}\n[content truncated]`;
}

function messageText(content: unknown): string {
	if (typeof content === "string") return safeText(content);
	if (!Array.isArray(content)) return "";
	return content.flatMap((part) => part && typeof part === "object" && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string" ? [safeText((part as { text: string }).text)] : []).join("\n");
}

function projectSessionEntries(entries: readonly SessionTreeEntry[]): SafeSessionMessageV35[] {
	const projected: SafeSessionMessageV35[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message as unknown as Record<string, unknown>;
		if (message.role === "user") {
			projected.push({ entry_id: entry.id, role: "user", text: messageText(message.content), tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
		} else if (message.role === "assistant") {
			const content = Array.isArray(message.content) ? message.content : [];
			const text = messageText(content);
			if (text) projected.push({ entry_id: entry.id, role: "assistant", text, tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
			for (const part of content) {
				if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "toolCall") continue;
				const call = part as Record<string, unknown>;
				projected.push({ entry_id: entry.id, role: "tool", text: null, tool_call_id: typeof call.id === "string" ? call.id : null, tool_name: typeof call.name === "string" ? call.name : null, tool_arguments_sha256: digestObject(call.arguments ?? null), is_error: null });
			}
		} else if (message.role === "toolResult") {
			projected.push({ entry_id: entry.id, role: "tool", text: messageText(message.content), tool_call_id: typeof message.toolCallId === "string" ? message.toolCallId : null, tool_name: typeof message.toolName === "string" ? message.toolName : null, tool_arguments_sha256: null, is_error: typeof message.isError === "boolean" ? message.isError : null });
		}
	}
	return projected;
}

function parseRunManifest(value: unknown): PersistentRunManifestV35 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Run Manifest is invalid");
	const run = value as PersistentRunManifestV35;
	if (run.schema_version !== 1 || !IDENTIFIER.test(run.run_id) || !IDENTIFIER.test(run.project_id) || !IDENTIFIER.test(run.workspace_id) || !IDENTIFIER.test(run.session_id) || !SHA256.test(run.workspace_path_sha256) || !Number.isSafeInteger(run.session_entry_count_after_turn) || run.session_entry_count_after_turn < 1 || !SHA256.test(run.session_entries_sha256_after_turn) || !SHA256.test(run.catalog_session_identity_sha256) || !SHA256.test(run.prior_context_sha256) || !SHA256.test(run.provider_observed_prior_context_sha256) || !SHA256.test(run.prompt_sha256) || run.settled !== true || !Array.isArray(run.tool_call_ids) || !Array.isArray(run.tool_result_ids) || run.credential_reads !== 0 || run.network_calls !== 0 || run.external_provider_calls !== 0 || run.real_model_calls !== 0) throw new Error("Run Manifest schema is invalid");
	return run;
}

export class PersistentSessionServiceV35 {
	private readonly dataRoot: string;
	private readonly projectId: string;
	private readonly workspaceRoot: string;
	private readonly workspaceId: string;
	private readonly workspaceDigest: string;
	private readonly repo: JsonlSessionRepo;

	constructor(options: PersistentSessionServiceOptionsV35) {
		assertIdentifier(options.projectId, "project ID");
		assertIdentifier(options.workspaceId, "workspace ID");
		this.dataRoot = canonicalDirectory(options.dataRoot, "Session data root", true);
		this.workspaceRoot = canonicalDirectory(options.workspaceRoot, "Workspace root");
		this.projectId = options.projectId;
		this.workspaceId = options.workspaceId;
		this.workspaceDigest = workspacePathDigest(this.workspaceRoot);
		this.repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: this.dataRoot, shellEnv: {} }), sessionsRoot: resolve(this.dataRoot, "sessions") });
		if (!existsSync(resolve(this.dataRoot, CATALOG_FILE))) {
			if (readdirSync(this.dataRoot).length > 0) throw new Error("Session catalog is missing from a non-empty data root");
			writeCatalog(this.dataRoot, { schema_version: 1, project_id: this.projectId, sessions: [] });
		}
	}

	private catalog(): PersistentSessionCatalogV35 {
		return readCatalog(this.dataRoot, this.projectId);
	}

	private expectedEntry(catalog: PersistentSessionCatalogV35, sessionId: string): PersistentSessionCatalogEntryV35 {
		assertIdentifier(sessionId, "Session ID");
		const entry = catalog.sessions.find((candidate) => candidate.session_id === sessionId);
		if (!entry) throw new Error("Session is not recorded in the project catalog");
		if (entry.project_id !== this.projectId) throw new Error("cross-project Session rejected");
		if (entry.workspace_id !== this.workspaceId || entry.workspace_path_sha256 !== this.workspaceDigest) throw new Error("Session Workspace identity mismatch");
		resolveOperationalRef(this.dataRoot, entry.pi_session_ref);
		return entry;
	}

	private async openVerified(entry: PersistentSessionCatalogEntryV35): Promise<{ session: Session<JsonlSessionMetadata>; metadata: JsonlSessionMetadata }> {
		const listed = await this.repo.list();
		const metadata = listed.find((candidate) => candidate.id === entry.session_id);
		if (!metadata) throw new Error("Pi Session is missing or corrupt");
		const relativePath = portable(relative(this.dataRoot, resolve(metadata.path)));
		if (relativePath !== entry.pi_session_ref) throw new Error("catalog/Pi Session reference mismatch");
		const custom = runtimeMetadata(metadata.metadata);
		if (custom.project_id !== this.projectId || custom.workspace_id !== this.workspaceId || custom.workspace_path_sha256 !== this.workspaceDigest) throw new Error("Pi Session project/Workspace identity mismatch");
		if (realpathSync.native(metadata.cwd) !== this.workspaceRoot) throw new Error("Pi Session cwd/Workspace mismatch");
		if (entry.parent_session_id === null && metadata.parentSessionPath !== undefined) throw new Error("Pi Session parent identity mismatch");
		if (entry.parent_session_id !== null) {
			const catalog = this.catalog();
			const parent = this.expectedEntry(catalog, entry.parent_session_id);
			const expectedParent = resolveOperationalRef(this.dataRoot, parent.pi_session_ref);
			if (metadata.parentSessionPath === undefined || resolve(metadata.parentSessionPath) !== expectedParent) throw new Error("Pi Session parent identity mismatch");
		}
		return { session: await this.repo.open(metadata), metadata };
	}

	async create(options: { sessionId: string; title: string; parentSessionId?: string | null }): Promise<SafeSessionViewV35> {
		assertIdentifier(options.sessionId, "Session ID");
		const catalog = this.catalog();
		if (catalog.sessions.some((entry) => entry.session_id === options.sessionId)) throw new Error("Session ID already exists");
		const parentSessionId = options.parentSessionId ?? null;
		let parentSessionPath: string | undefined;
		if (parentSessionId !== null) {
			const parent = this.expectedEntry(catalog, parentSessionId);
			parentSessionPath = (await this.openVerified(parent)).metadata.path;
		}
		const session = await this.repo.create({ cwd: this.workspaceRoot, id: options.sessionId, ...(parentSessionPath ? { parentSessionPath } : {}), metadata: { schema_version: 1, project_id: this.projectId, workspace_id: this.workspaceId, workspace_path_sha256: this.workspaceDigest } satisfies RuntimeMetadataV35 });
		const metadata = await session.getMetadata();
		const now = metadata.createdAt;
		const entry: PersistentSessionCatalogEntryV35 = {
			schema_version: 1,
			session_id: metadata.id,
			project_id: this.projectId,
			workspace_id: this.workspaceId,
			workspace_path_sha256: this.workspaceDigest,
			title: safeText(options.title).slice(0, 120),
			created_at: now,
			updated_at: now,
			parent_session_id: parentSessionId,
			pi_session_ref: portable(relative(this.dataRoot, resolve(metadata.path))),
			run_refs: [],
		};
		catalog.sessions.push(entry);
		writeCatalog(this.dataRoot, catalog);
		return await this.inspect(options.sessionId);
	}

	list(): Array<Omit<PersistentSessionCatalogEntryV35, "pi_session_ref" | "run_refs" | "workspace_path_sha256"> & { run_ids: string[] }> {
		return this.catalog().sessions.map(({ pi_session_ref: _pi, run_refs, workspace_path_sha256: _workspace, ...entry }) => ({ ...entry, run_ids: run_refs.map((run) => run.run_id) }));
	}

	async executeTurn(options: { sessionId: string; runId: string; prompt: string }): Promise<PersistentTurnResultV35> {
		assertIdentifier(options.runId, "Run ID");
		const catalog = this.catalog();
		const entry = this.expectedEntry(catalog, options.sessionId);
		if (entry.run_refs.some((run) => run.run_id === options.runId) || existsSync(resolve(this.dataRoot, "runs", options.runId))) throw new Error("Run ID already exists");
		const listedBefore = (await this.repo.list()).map((metadata) => metadata.id);
		if (!listedBefore.includes(options.sessionId)) throw new Error("Session was not discoverable before open");
		const { session, metadata } = await this.openVerified(entry);
		const priorContext = await session.buildContext();
		const priorMessages = structuredClone(priorContext.messages);
		const priorDigest = digestObject(priorMessages);
		const models = createModels();
		const registration = fauxProvider({ provider: `v35-faux-${options.runId}` });
		models.setProvider(registration.provider);
		let providerObservedPriorDigest = "";
		const observePrior = (context: { messages: unknown[] }): void => {
			const observed = context.messages.slice(0, priorMessages.length);
			const digest = digestObject(observed);
			if (digest !== priorDigest) throw new Error("AgentHarness did not reconstruct the prior Session context");
			providerObservedPriorDigest = digest;
		};
		registration.setResponses([
			(context) => {
				observePrior(context);
				return fauxAssistantMessage(fauxToolCall("workspace_list", { path: ".", depth: 1 }, { id: `${options.runId}-tool-1` }), { stopReason: "toolUse", timestamp: 1 });
			},
			(context) => {
				observePrior(context);
				return fauxAssistantMessage(`deterministic settled turn ${options.runId}`, { timestamp: 2 });
			},
		]);
		const profile = createBoundedToolProfile(this.workspaceRoot, { writable_paths: [], protected_paths: [], command_descriptors: [] });
		const harness = new AgentHarness({ models, session, model: registration.getModel(), tools: profile.tools, toolContext: profile.context, systemPrompt: RUNTIME_SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: 10_000 } });
		let settled = 0;
		const unsubscribe = harness.subscribe((event) => { if (event.type === "settled") settled += 1; });
		try {
			await harness.prompt(options.prompt);
			await harness.waitForIdle();
		} finally {
			unsubscribe();
			await harness.abort();
		}
		if (settled !== 1 || registration.state.callCount !== 2 || registration.getPendingResponseCount() !== 0 || providerObservedPriorDigest !== priorDigest) throw new Error("deterministic persistent turn did not settle exactly once");
		const entries = await session.getEntries();
		const finalContext = await session.buildContext();
		const toolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
		const toolResultIds = entries.flatMap((sessionEntry) => sessionEntry.type === "message" && sessionEntry.message.role === "toolResult" ? [sessionEntry.message.toolCallId] : []);
		if (toolCallIds.length < 1 || stableJson(toolCallIds) !== stableJson(toolResultIds.slice(-toolCallIds.length))) throw new Error("persistent Session Tool lifecycle is incomplete");
		const createdAt = new Date().toISOString();
		const runRoot = resolve(this.dataRoot, "runs", options.runId);
		mkdirSync(resolve(this.dataRoot, "runs"), { recursive: true });
		mkdirSync(runRoot, { recursive: false });
		const sessionRef = portable(relative(this.dataRoot, resolve(metadata.path)));
		const manifest: PersistentRunManifestV35 = {
			schema_version: 1,
			run_id: options.runId,
			project_id: this.projectId,
			workspace_id: this.workspaceId,
			workspace_path_sha256: this.workspaceDigest,
			session_id: options.sessionId,
			session_ref: sessionRef,
			session_entry_count_after_turn: entries.length,
			session_entries_sha256_after_turn: digestObject(entries),
			catalog_session_identity_sha256: catalogEntryIdentity(entry),
			created_at: createdAt,
			settled: true,
			prior_context_message_count: priorMessages.length,
			prior_context_sha256: priorDigest,
			provider_observed_prior_context_sha256: providerObservedPriorDigest,
			final_context_message_count: finalContext.messages.length,
			prompt_sha256: sha256(options.prompt),
			provider_requests: registration.state.callCount,
			tool_call_ids: toolCallIds,
			tool_result_ids: toolResultIds.slice(-toolCallIds.length),
			credential_reads: 0,
			network_calls: 0,
			external_provider_calls: 0,
			real_model_calls: 0,
		};
		writeOnceJson(runRoot, "manifest.json", manifest);
		entry.run_refs.push({ run_id: options.runId, run_ref: portable(relative(this.dataRoot, resolve(runRoot, "manifest.json"))), created_at: createdAt });
		entry.updated_at = createdAt;
		writeCatalog(this.dataRoot, catalog);
		return { manifest, view: await this.inspect(options.sessionId), listed_before: listedBefore };
	}

	async inspect(sessionId: string): Promise<SafeSessionViewV35> {
		const catalog = this.catalog();
		const entry = this.expectedEntry(catalog, sessionId);
		const { session } = await this.openVerified(entry);
		const sessionEntries = await session.getEntries();
		const runs: SafeRunViewV35[] = entry.run_refs.map((reference) => {
			const manifestPath = resolveOperationalRef(this.dataRoot, reference.run_ref);
			const runRoot = resolve(manifestPath, "..");
			const manifest = parseRunManifest(readJsonArtifact<PersistentRunManifestV35>(runRoot, "manifest.json"));
			if (manifest.run_id !== reference.run_id || manifest.session_id !== entry.session_id || manifest.project_id !== this.projectId || manifest.workspace_id !== this.workspaceId || manifest.workspace_path_sha256 !== this.workspaceDigest || manifest.session_ref !== entry.pi_session_ref || manifest.catalog_session_identity_sha256 !== catalogEntryIdentity(entry)) throw new Error("catalog/Run authority identity mismatch");
			if (sessionEntries.length < manifest.session_entry_count_after_turn || digestObject(sessionEntries.slice(0, manifest.session_entry_count_after_turn)) !== manifest.session_entries_sha256_after_turn) throw new Error("Run/Session historical prefix identity mismatch");
			if (manifest.prior_context_sha256 !== manifest.provider_observed_prior_context_sha256) throw new Error("Run prior-context proof is invalid");
			return { run_id: manifest.run_id, created_at: manifest.created_at, settled: true, provider_requests: manifest.provider_requests, tool_call_count: manifest.tool_call_ids.length, context_reconstructed: manifest.prior_context_message_count === 0 || manifest.prior_context_sha256 === manifest.provider_observed_prior_context_sha256, source_ref: reference.run_ref };
		});
		return { schema_version: 1, session_id: entry.session_id, project_id: entry.project_id, workspace_id: entry.workspace_id, title: entry.title, created_at: entry.created_at, updated_at: entry.updated_at, parent_session_id: entry.parent_session_id, messages: projectSessionEntries(sessionEntries), runs, source_status: "available" };
	}
}
