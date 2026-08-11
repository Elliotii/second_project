import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentMessage, type JsonlSessionMetadata, type SessionTreeEntry } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall, type AssistantMessage } from "@earendil-works/pi-ai";
import type { SafeRunViewV35, SafeSessionMessageV35, SafeSessionViewV35 } from "../contracts/v35-types.ts";
import { readJsonArtifact, writeOnceJson } from "../evidence/artifacts.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { createBoundedToolProfile, type BoundedCommandExecutor } from "../pi/tool-profile.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import { managedWorkspaceIdentityV36 } from "../workspace/managed-copy-v36.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const READ_ONLY_TOOLS = ["workspace_read", "workspace_list"] as const;
const SYSTEM_PROMPT = "You are a deterministic V3.6 Goal 1 persistence agent. Inspect only the managed Workspace using the available read-only tools. Project commands and writes are unavailable.";

interface RuntimeMetadataV36 extends Record<string, unknown> {
	schema_version: 1;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
}

interface RuntimeManifestV36 {
	schema_version: 1;
	mode: "v36_interactive_deterministic_faux";
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	created_at: string;
	settled: true;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	prompt_sha256: string;
	provider_requests: 2;
	active_tool_names: ["workspace_read", "workspace_list"];
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: 0;
	network_calls: 0;
	external_provider_calls: 0;
	real_model_calls: 0;
	project_command_executions: 0;
	docker_project_command_executions: 0;
	manifest_digest: string;
}

export interface RuntimeManifestG2V36 {
	schema_version: 2;
	mode: "v36_interactive_bounded_edit";
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	created_at: string;
	settled: true;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	prompt_sha256: string;
	provider_requests: number;
	active_tool_names: string[];
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	project_command_executions: number;
	docker_project_command_executions: number;
	backend_terminal_digests: string[];
	workspace_identity_after: string;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	manifest_digest: string;
}

export interface InteractiveDispatchManifestV36 {
	mode: "v36_interactive_deterministic_faux" | "v36_interactive_bounded_edit";
	run_id: string;
	session_id: string;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	project_command_executions: number;
	docker_project_command_executions: number;
}

export interface PersistentInteractiveTurnResultV36 {
	manifest: InteractiveDispatchManifestV36;
	view: SafeSessionViewV35;
}

export interface PersistentInteractiveBoundedTurnResultV36 extends PersistentInteractiveTurnResultV36 {
	manifest: RuntimeManifestG2V36;
}

function identifier(value: string, label: string): void {
	if (!ID.test(value)) throw new Error(`${label} is invalid`);
}

function ordinaryDirectory(pathValue: string, label: string, create = false): string {
	const path = resolve(pathValue);
	if (create) mkdirSync(path, { recursive: true });
	const stats = lstatSync(path);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(path);
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function runRoot(runtimeRoot: string, runId: string, create = false): string {
	identifier(runId, "Run ID");
	const parent = ordinaryDirectory(resolve(runtimeRoot, "runs"), "interactive Runtime Runs root", true);
	const target = resolve(parent, runId);
	if (!contained(runtimeRoot, target)) throw new Error("interactive Runtime Run path escaped");
	if (create) mkdirSync(target, { recursive: false });
	return target;
}

function safeText(value: string): string {
	const redacted = value
		.replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+/gi, "[credential omitted]")
		.replace(/\b(api[_-]?key|authorization|password|secret|access[_-]?token)\s*[:=]\s*[^\s,;]+/gi, "$1=[credential omitted]")
		.replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"']+/g, "[path omitted]")
		.replace(/(^|\s)\/(?:[^\s"']+\/)*[^\s"']*/g, "$1[path omitted]");
	const bytes = Buffer.from(redacted, "utf8");
	return bytes.length <= 8_192 ? redacted : `${bytes.subarray(0, 8_128).toString("utf8")}\n[content truncated]`;
}

function messageText(content: unknown): string {
	if (typeof content === "string") return safeText(content);
	if (!Array.isArray(content)) return "";
	return content.flatMap((part) => part && typeof part === "object" && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string" ? [safeText((part as { text: string }).text)] : []).join("\n");
}

function projectMessages(entries: readonly SessionTreeEntry[]): SafeSessionMessageV35[] {
	const result: SafeSessionMessageV35[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message as unknown as Record<string, unknown>;
		if (message.role === "user") result.push({ entry_id: entry.id, role: "user", text: messageText(message.content), tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
		if (message.role === "assistant") {
			const content = Array.isArray(message.content) ? message.content : [];
			const text = messageText(content);
			if (text) result.push({ entry_id: entry.id, role: "assistant", text, tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
			for (const part of content) if (part && typeof part === "object" && (part as { type?: unknown }).type === "toolCall") {
				const call = part as Record<string, unknown>;
				result.push({ entry_id: entry.id, role: "tool", text: null, tool_call_id: typeof call.id === "string" ? call.id : null, tool_name: typeof call.name === "string" ? call.name : null, tool_arguments_sha256: digestObject(call.arguments ?? null), is_error: null });
			}
		}
		if (message.role === "toolResult") result.push({ entry_id: entry.id, role: "tool", text: messageText(message.content), tool_call_id: typeof message.toolCallId === "string" ? message.toolCallId : null, tool_name: typeof message.toolName === "string" ? message.toolName : null, tool_arguments_sha256: null, is_error: typeof message.isError === "boolean" ? message.isError : null });
	}
	return result;
}

function parseMetadata(value: unknown, expected: { projectId: string; workspaceId: string; pinDigest: string }): RuntimeMetadataV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Pi Session metadata is invalid");
	const record = value as Partial<RuntimeMetadataV36>;
	if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(["schema_version", "project_id", "workspace_id", "session_pin_digest"].sort()) || record.schema_version !== 1 || record.project_id !== expected.projectId || record.workspace_id !== expected.workspaceId || record.session_pin_digest !== expected.pinDigest) throw new Error("V3.6 Pi Session metadata identity mismatch");
	return record as RuntimeMetadataV36;
}

function parseManifest(value: unknown): RuntimeManifestV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Runtime Manifest is invalid");
	const manifest = value as RuntimeManifestV36;
	const { manifest_digest: _digest, ...body } = manifest;
	if (manifest.schema_version !== 1 || manifest.mode !== "v36_interactive_deterministic_faux" || !ID.test(manifest.run_id) || !ID.test(manifest.session_id) || !ID.test(manifest.project_id) || !ID.test(manifest.workspace_id) || !SHA256.test(manifest.session_pin_digest) || manifest.settled !== true || !SHA256.test(manifest.prior_context_sha256) || manifest.prior_context_sha256 !== manifest.provider_observed_prior_context_sha256 || !SHA256.test(manifest.session_entries_sha256_after_turn) || !SHA256.test(manifest.prompt_sha256) || manifest.provider_requests !== 2 || stableJson(manifest.active_tool_names) !== stableJson(READ_ONLY_TOOLS) || !Array.isArray(manifest.tool_call_ids) || stableJson(manifest.tool_call_ids) !== stableJson(manifest.tool_result_ids) || manifest.credential_reads !== 0 || manifest.network_calls !== 0 || manifest.external_provider_calls !== 0 || manifest.real_model_calls !== 0 || manifest.project_command_executions !== 0 || manifest.docker_project_command_executions !== 0 || !SHA256.test(manifest.manifest_digest) || digestObject(body) !== manifest.manifest_digest) throw new Error("V3.6 Runtime Manifest is invalid");
	return manifest;
}

function parseManifestG2(value: unknown): RuntimeManifestG2V36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Goal 2 Runtime Manifest is invalid");
	const manifest = value as RuntimeManifestG2V36;
	const { manifest_digest: _digest, ...body } = manifest;
	if (manifest.schema_version !== 2 || manifest.mode !== "v36_interactive_bounded_edit" || !ID.test(manifest.run_id) || !ID.test(manifest.session_id) || !ID.test(manifest.project_id) || !ID.test(manifest.workspace_id) || !SHA256.test(manifest.session_pin_digest) || manifest.settled !== true || !SHA256.test(manifest.prior_context_sha256) || manifest.prior_context_sha256 !== manifest.provider_observed_prior_context_sha256 || !SHA256.test(manifest.session_entries_sha256_after_turn) || !SHA256.test(manifest.prompt_sha256) || !Number.isSafeInteger(manifest.provider_requests) || manifest.provider_requests < 1 || manifest.provider_requests > 16 || !Array.isArray(manifest.active_tool_names) || stableJson(manifest.active_tool_names) !== stableJson(["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"]) || !Array.isArray(manifest.tool_call_ids) || stableJson(manifest.tool_call_ids) !== stableJson(manifest.tool_result_ids) || ![manifest.credential_reads, manifest.network_calls, manifest.external_provider_calls, manifest.real_model_calls, manifest.project_command_executions, manifest.docker_project_command_executions, manifest.input_tokens, manifest.output_tokens].every((entry) => Number.isSafeInteger(entry) && entry >= 0) || manifest.project_command_executions < 1 || manifest.project_command_executions !== manifest.docker_project_command_executions || !Array.isArray(manifest.backend_terminal_digests) || manifest.backend_terminal_digests.length !== manifest.project_command_executions || manifest.backend_terminal_digests.some((entry) => !SHA256.test(entry)) || !SHA256.test(manifest.workspace_identity_after) || !Number.isFinite(manifest.cost_usd) || manifest.cost_usd < 0 || !SHA256.test(manifest.manifest_digest) || digestObject(body) !== manifest.manifest_digest) throw new Error("V3.6 Goal 2 Runtime Manifest is invalid");
	return manifest;
}

export class PersistentInteractiveSessionServiceV36 {
	private readonly runtimeRoot: string;
	private readonly workspaceRoot: string;
	private readonly projectId: string;
	private readonly workspaceId: string;
	private readonly sessionId: string;
	private readonly title: string;
	private readonly pinDigest: string;
	private readonly repo: JsonlSessionRepo;

	constructor(options: { runtimeRoot: string; workspaceRoot: string; projectId: string; workspaceId: string; sessionId: string; title: string; sessionPinDigest: string }) {
		identifier(options.projectId, "project ID");
		identifier(options.workspaceId, "Workspace ID");
		identifier(options.sessionId, "Session ID");
		if (!SHA256.test(options.sessionPinDigest)) throw new Error("Session pin digest is invalid");
		this.runtimeRoot = ordinaryDirectory(options.runtimeRoot, "V3.6 Session Runtime root", true);
		this.workspaceRoot = ordinaryDirectory(options.workspaceRoot, "managed Workspace root");
		this.projectId = options.projectId;
		this.workspaceId = options.workspaceId;
		this.sessionId = options.sessionId;
		this.title = safeText(options.title).slice(0, 120);
		this.pinDigest = options.sessionPinDigest;
		mkdirSync(resolve(this.runtimeRoot, "sessions"), { recursive: true });
		mkdirSync(resolve(this.runtimeRoot, "runs"), { recursive: true });
		this.repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: this.runtimeRoot, shellEnv: {} }), sessionsRoot: resolve(this.runtimeRoot, "sessions") });
	}

	async create(): Promise<void> {
		if ((await this.repo.list()).length !== 0) throw new Error("V3.6 Session Runtime is not empty");
		await this.repo.create({ cwd: this.workspaceRoot, id: this.sessionId, metadata: { schema_version: 1, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest } satisfies RuntimeMetadataV36 });
	}

	private async open() {
		const listed = await this.repo.list();
		if (listed.length !== 1 || listed[0]!.id !== this.sessionId) throw new Error("V3.6 Pi Session identity is missing or ambiguous");
		const metadata = listed[0]!;
		parseMetadata(metadata.metadata, { projectId: this.projectId, workspaceId: this.workspaceId, pinDigest: this.pinDigest });
		if (realpathSync.native(metadata.cwd) !== this.workspaceRoot) throw new Error("V3.6 Pi Session managed Workspace identity mismatch");
		return await this.repo.open(metadata);
	}

	async executeTurn(options: { sessionId: string; runId: string; prompt: string }): Promise<PersistentInteractiveTurnResultV36> {
		if (options.sessionId !== this.sessionId) throw new Error("V3.6 Session identity mismatch");
		identifier(options.runId, "Run ID");
		if (Buffer.byteLength(options.prompt, "utf8") === 0 || Buffer.byteLength(options.prompt, "utf8") > 16_384) throw new Error("V3.6 task text is invalid");
		const root = runRoot(this.runtimeRoot, options.runId, true);
		const session = await this.open();
		const priorContext = await session.buildContext();
		const priorMessages = structuredClone(priorContext.messages) as AgentMessage[];
		const priorDigest = digestObject(priorMessages);
		const models = createModels();
		const registration = fauxProvider({ provider: `v36-faux-${options.runId}` });
		models.setProvider(registration.provider);
		let observedPrior = "";
		const observe = (messages: readonly AgentMessage[]): void => {
			observedPrior = digestObject(messages.slice(0, priorMessages.length));
			if (observedPrior !== priorDigest) throw new Error("V3.6 AgentHarness prior Session context mismatch");
		};
		registration.setResponses([
			(context) => { observe(context.messages); return fauxAssistantMessage(fauxToolCall("workspace_list", { path: ".", depth: 2 }, { id: `${options.runId}-tool-1` }), { stopReason: "toolUse", timestamp: 1 }); },
			(context) => { observe(context.messages); return fauxAssistantMessage(`deterministic settled interactive turn ${options.runId}`, { timestamp: 2 }); },
		]);
		const profile = createBoundedToolProfile(this.workspaceRoot, { writable_paths: [], protected_paths: [], command_descriptors: [] }, { allowed_tool_names: READ_ONLY_TOOLS, allow_repository_commands: false });
		if (stableJson(profile.tools.map((tool) => tool.name)) !== stableJson(READ_ONLY_TOOLS)) throw new Error("V3.6 inspect-only tool surface drifted");
		const harness = new AgentHarness({ models, session, model: registration.getModel(), tools: profile.tools, toolContext: profile.context, systemPrompt: SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: 10_000 } });
		let settled = 0;
		const unsubscribe = harness.subscribe((event) => { if (event.type === "settled") settled += 1; });
		try { await harness.prompt(options.prompt); await harness.waitForIdle(); } finally { unsubscribe(); await harness.abort(); }
		if (settled !== 1 || registration.state.callCount !== 2 || registration.getPendingResponseCount() !== 0 || observedPrior !== priorDigest || profile.commandExecutions.length !== 0 || profile.pendingSideEffects() !== 0) throw new Error("V3.6 deterministic interactive turn did not settle safely");
		const entries = await session.getEntries();
		const toolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
		const toolResultIds = entries.flatMap((entry) => entry.type === "message" && entry.message.role === "toolResult" ? [entry.message.toolCallId] : []);
		const body: Omit<RuntimeManifestV36, "manifest_digest"> = {
			schema_version: 1, mode: "v36_interactive_deterministic_faux", run_id: options.runId, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest, created_at: new Date().toISOString(), settled: true,
			prior_context_message_count: priorMessages.length, prior_context_sha256: priorDigest, provider_observed_prior_context_sha256: observedPrior, session_entry_count_after_turn: entries.length, session_entries_sha256_after_turn: digestObject(entries), prompt_sha256: sha256(options.prompt), provider_requests: 2, active_tool_names: [...READ_ONLY_TOOLS], tool_call_ids: toolCallIds, tool_result_ids: toolResultIds.slice(-toolCallIds.length), credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, project_command_executions: 0, docker_project_command_executions: 0,
		};
		const manifest: RuntimeManifestV36 = { ...body, manifest_digest: digestObject(body) };
		writeOnceJson(root, "manifest.json", manifest);
		return { manifest, view: await this.inspect() };
	}

	async executeBoundedTurn(options: {
		sessionId: string;
		runId: string;
		prompt: string;
		taskPolicy: BoundedTaskPolicy;
		commandExecutor: BoundedCommandExecutor;
		models: ReturnType<typeof createModels>;
		model: NonNullable<ReturnType<ReturnType<typeof createModels>["getModel"]>>;
		systemPrompt: string;
		credentialReads?: number;
		externalModel?: boolean;
		testOnlyFinalAssistantUsageFloor?: { combined_tokens?: number; cost_usd?: number };
	}): Promise<PersistentInteractiveBoundedTurnResultV36> {
		if (options.sessionId !== this.sessionId) throw new Error("V3.6 Session identity mismatch");
		identifier(options.runId, "Run ID");
		if (Buffer.byteLength(options.prompt, "utf8") < 1 || Buffer.byteLength(options.prompt, "utf8") > 16_384 || Buffer.byteLength(options.systemPrompt, "utf8") < 1 || Buffer.byteLength(options.systemPrompt, "utf8") > 16_384) throw new Error("V3.6 bounded Turn prompt is invalid");
		const root = runRoot(this.runtimeRoot, options.runId, true);
		const session = await this.open();
		const priorContext = await session.buildContext();
		const priorMessages = structuredClone(priorContext.messages) as AgentMessage[];
		const priorDigest = digestObject(priorMessages);
		let observedPrior = "";
		let settled = 0;
		let providerRequests = 0;
		let toolCalls = 0;
		let inputTokens = 0;
		let outputTokens = 0;
		let costUsd = 0;
		let usageBudgetError: Error | null = null;
		const assertTurnUsageBudget = (): void => {
			if (inputTokens + outputTokens > 131_072 || costUsd > 0.2) usageBudgetError ??= new Error("V3.6 Goal 2 per-Turn token/cost budget exceeded");
			if (usageBudgetError) throw usageBudgetError;
		};
		const profile = createBoundedToolProfile(this.workspaceRoot, options.taskPolicy, { allowed_tool_names: ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"], allow_repository_commands: false, expose_task_command_ids: true, command_executor: options.commandExecutor });
		const expectedTools = ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"];
		if (stableJson(profile.tools.map((tool) => tool.name)) !== stableJson(expectedTools)) throw new Error("V3.6 Goal 2 tool surface drifted");
		const harness = new AgentHarness({ models: options.models, session, model: options.model, tools: profile.tools, toolContext: profile.context, systemPrompt: options.systemPrompt, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: 900_000 } });
		const unsubscribe = harness.subscribe((event) => {
			if (event.type === "settled") settled += 1;
			if (event.type === "message_end" && event.message.role === "assistant") {
				const message = event.message as AssistantMessage;
				const usage = message.usage;
				const currentInput = usage.input + usage.cacheRead + usage.cacheWrite;
				const floor = message.stopReason === "stop" ? options.testOnlyFinalAssistantUsageFloor : undefined;
				const currentOutput = floor?.combined_tokens === undefined ? usage.output : Math.max(usage.output, floor.combined_tokens - currentInput);
				const currentCost = floor?.cost_usd === undefined ? usage.cost.total : Math.max(usage.cost.total, floor.cost_usd);
				if (![currentInput, currentOutput, currentCost, floor?.combined_tokens ?? 0, floor?.cost_usd ?? 0].every((entry) => Number.isFinite(entry) && entry >= 0)) {
					usageBudgetError ??= new Error("V3.6 Goal 2 model usage is invalid");
					void harness.abort();
					return;
				}
				inputTokens += currentInput;
				outputTokens += currentOutput;
				costUsd += currentCost;
				try { assertTurnUsageBudget(); } catch { void harness.abort(); }
			}
		});
		const offContext = harness.on("context", (event) => {
			observedPrior = digestObject(event.messages.slice(0, priorMessages.length));
			if (observedPrior !== priorDigest) throw new Error("V3.6 Goal 2 prior Session context mismatch");
			return { messages: event.messages };
		});
		const offRequest = harness.on("before_provider_request", () => {
			providerRequests += 1;
			if (providerRequests > 16) throw new Error("V3.6 Goal 2 per-Turn Provider-request budget exceeded");
			assertTurnUsageBudget();
			return undefined;
		});
		const offTool = harness.on("tool_call", () => {
			toolCalls += 1;
			if (toolCalls > 24) throw new Error("V3.6 Goal 2 Tool budget exceeded");
			return undefined;
		});
		try { await harness.prompt(options.prompt); await harness.waitForIdle(); } finally { unsubscribe(); offContext(); offRequest(); offTool(); await harness.abort(); }
		assertTurnUsageBudget();
		if (settled !== 1 || observedPrior !== priorDigest || profile.pendingSideEffects() !== 0 || profile.commandExecutions.length < 1 || profile.commandExecutions.some((entry) => entry.cleanup_complete !== true || !SHA256.test(entry.terminal_digest ?? "") || entry.backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest)) throw new Error("V3.6 Goal 2 bounded Turn did not settle with exact frozen terminal Docker evidence");
		const entries = await session.getEntries();
		const toolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
		const toolResultIds = entries.flatMap((entry) => entry.type === "message" && entry.message.role === "toolResult" ? [entry.message.toolCallId] : []).slice(-toolCallIds.length);
		if (stableJson(toolCallIds) !== stableJson(toolResultIds)) throw new Error("V3.6 Goal 2 Tool lifecycle is incomplete");
		const external = options.externalModel === true;
		assertTurnUsageBudget();
		const body: Omit<RuntimeManifestG2V36, "manifest_digest"> = {
			schema_version: 2, mode: "v36_interactive_bounded_edit", run_id: options.runId, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest, created_at: new Date().toISOString(), settled: true,
			prior_context_message_count: priorMessages.length, prior_context_sha256: priorDigest, provider_observed_prior_context_sha256: observedPrior, session_entry_count_after_turn: entries.length, session_entries_sha256_after_turn: digestObject(entries), prompt_sha256: sha256(options.prompt), provider_requests: providerRequests, active_tool_names: expectedTools, tool_call_ids: toolCallIds, tool_result_ids: toolResultIds, credential_reads: options.credentialReads ?? 0, network_calls: external ? providerRequests : 0, external_provider_calls: external ? providerRequests : 0, real_model_calls: external ? providerRequests : 0, project_command_executions: profile.commandExecutions.length, docker_project_command_executions: profile.commandExecutions.length, backend_terminal_digests: profile.commandExecutions.map((entry) => entry.terminal_digest!), workspace_identity_after: managedWorkspaceIdentityV36(this.workspaceRoot), input_tokens: inputTokens, output_tokens: outputTokens, cost_usd: costUsd,
		};
		const manifest: RuntimeManifestG2V36 = { ...body, manifest_digest: digestObject(body) };
		writeOnceJson(root, "manifest.json", manifest);
		return { manifest, view: await this.inspect() };
	}

	async inspect(): Promise<SafeSessionViewV35> {
		const session = await this.open();
		const entries = await session.getEntries();
		const manifests: Array<RuntimeManifestV36 | RuntimeManifestG2V36> = [];
		for (const entry of readdirSync(resolve(this.runtimeRoot, "runs"), { withFileTypes: true })) {
			if (!entry.isDirectory() || !ID.test(entry.name)) throw new Error("V3.6 Runtime Run directory is invalid");
			const root = runRoot(this.runtimeRoot, entry.name);
			if (!existsSync(resolve(root, "manifest.json"))) throw new Error("V3.6 Runtime Manifest is missing");
			const rawManifest = readJsonArtifact<{ schema_version?: unknown }>(root, "manifest.json");
			const manifest = rawManifest.schema_version === 2 ? parseManifestG2(rawManifest) : parseManifest(rawManifest);
			if (manifest.run_id !== entry.name || manifest.session_id !== this.sessionId || manifest.project_id !== this.projectId || manifest.workspace_id !== this.workspaceId || manifest.session_pin_digest !== this.pinDigest || entries.length < manifest.session_entry_count_after_turn || digestObject(entries.slice(0, manifest.session_entry_count_after_turn)) !== manifest.session_entries_sha256_after_turn) throw new Error("V3.6 Runtime/Session historical identity mismatch");
			manifests.push(manifest);
		}
		manifests.sort((left, right) => left.created_at.localeCompare(right.created_at));
		const runs: SafeRunViewV35[] = manifests.map((manifest) => ({ run_id: manifest.run_id, created_at: manifest.created_at, settled: true, provider_requests: manifest.provider_requests, tool_call_count: manifest.tool_call_ids.length, context_reconstructed: manifest.prior_context_message_count === 0 || manifest.prior_context_sha256 === manifest.provider_observed_prior_context_sha256, mode: manifest.schema_version === 2 && manifest.real_model_calls > 0 ? "real_product_smoke" : "deterministic_faux", prior_run_id: null, input_tokens: manifest.schema_version === 2 ? manifest.input_tokens : "not_recorded", output_tokens: manifest.schema_version === 2 ? manifest.output_tokens : "not_recorded", cost_usd: manifest.schema_version === 2 ? manifest.cost_usd : "not_recorded", verifier_id: "not_recorded", verifier_status: "not_recorded", outcome: "not_recorded", binding_status: "not_recorded", source_ref: `runtime/runs/${manifest.run_id}/manifest.json` }));
		const createdAt = manifests[0]?.created_at ?? (await session.getMetadata()).createdAt;
		return { schema_version: 1, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, title: this.title, created_at: createdAt, updated_at: manifests.at(-1)?.created_at ?? createdAt, parent_session_id: null, messages: projectMessages(entries), runs, source_status: "available" };
	}
}
