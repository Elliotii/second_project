import {
	AgentHarness,
	type JsonlSessionMetadata,
	type Session,
	type Skill,
} from "@earendil-works/pi-agent-core";
import {
	InMemoryCredentialStore,
	createModels,
	fauxAssistantMessage,
	fauxProvider,
	fauxToolCall,
	type AssistantMessage,
} from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import {
	V2B_ATTEMPT_CAPS,
	V2B_SKILL_ID,
	V2B_TOOL_PROFILE_ID,
	type AttemptRoleV2B,
	type AttemptRuntimeEvidenceV2B,
	type CaseIdV2B,
	type ProviderReservationV2B,
	type RealCallCountersV2B,
	type RuntimeTerminalReasonV2B,
	type UsageV2B,
} from "../contracts/v2b-types.ts";
import { sha256, stableJson } from "../hash.ts";
import { createBoundedToolProfile } from "./tool-profile.ts";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import {
	DEEPSEEK_FIXED_PROFILE_V1,
	createPublicPiRunCompositionV1B,
	assertKnownUsageV1B,
	type OneRunProviderAccessV1B,
	type OneRunProviderAuthorityV1B,
} from "../provider/fixed-provider-v1.ts";
import type {
	ExecutionAttemptRequestV2,
	ExecutionPortV2,
	HarnessResultV2A,
} from "../run-v2.ts";

const AUTHORITY_BRAND_V2B = Symbol("v2b-stage1-execution-authority");

export class Stage1ExecutionAuthorityV2B {
	readonly [AUTHORITY_BRAND_V2B] = true;
	readonly runId: string;
	readonly caseId: CaseIdV2B;
	private readonly authorized: boolean;
	private readonly consumedAttemptIds = new Set<string>();

	constructor(options: { runId: string; caseId: CaseIdV2B; authorized: boolean }) {
		this.runId = options.runId;
		this.caseId = options.caseId;
		this.authorized = options.authorized;
	}

	consume(attemptId: string): void {
		if (!this.authorized || !attemptId.startsWith(`${this.runId}-`) || this.consumedAttemptIds.has(attemptId)) {
			throw new V2BExecutionBoundaryError("authority_rejected");
		}
		if (this.consumedAttemptIds.size >= 3) throw new V2BExecutionBoundaryError("attempt_count_exceeded");
		this.consumedAttemptIds.add(attemptId);
	}
}

export class V2BExecutionBoundaryError extends Error {
	readonly code: "authority_rejected" | "attempt_count_exceeded" | "shape_invalid";

	constructor(code: V2BExecutionBoundaryError["code"]) {
		super("V2-B Stage 1 execution boundary rejected");
		this.name = "V2BExecutionBoundaryError";
		this.code = code;
	}
}

class V2BBudgetStopError extends Error {
	constructor() {
		super("V2-B pre-dispatch budget stop");
		this.name = "V2BBudgetStopError";
	}
}

class V2BUsageBoundaryError extends Error {
	constructor() {
		super("V2-B unknown or invalid usage boundary");
		this.name = "V2BUsageBoundaryError";
	}
}

function emptyCounters(): RealCallCountersV2B {
	return { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
}

function emptyUsage(): UsageV2B {
	return {
		provider_requests: 0,
		tool_calls: 0,
		input_tokens: 0,
		output_tokens: 0,
		cache_read_tokens: 0,
		cache_write_tokens: 0,
		conservative_charged_tokens: 0,
		tokens: 0,
		active_execution_time_ms: 0,
		verifier_runs: 0,
		real_cost_usd: 0,
		conservative_charged_cost_usd: 0,
	};
}

function roleFor(attemptId: string): AttemptRoleV2B {
	if (attemptId.includes("candidate-a")) return "continue_failed_session";
	if (attemptId.includes("candidate-b")) return "fresh_session_from_failure_seed";
	return "primary";
}

function deterministicResponses(input: ExecutionAttemptRequestV2, forceToolCap: boolean): AssistantMessage[] {
	if (input.mode === "primary_fail" || input.mode === "fail" || input.mode === "invalid") {
		return [fauxAssistantMessage("The bounded real-shaped stub settled without a valid repair.")];
	}
	if (input.mode === "budget_stop") {
		return Array.from({ length: 9 }, (_, index) =>
			fauxAssistantMessage(
				fauxToolCall("run_command", { command_id: "public_test" }, { id: `${input.attemptId}-budget-${index + 1}` }),
				{ stopReason: "toolUse" },
			),
		);
	}
	if (forceToolCap) return [fauxAssistantMessage(Array.from({ length: 17 }, (_, index) => fauxToolCall("run_command", { command_id: "public_test" }, { id: `${input.attemptId}-tool-cap-${index + 1}` })), { stopReason: "toolUse" })];
	return [
		fauxAssistantMessage(
			fauxToolCall("workspace_write", { path: "src/subject.ts", content: input.patch }, { id: `${input.attemptId}-write` }),
			{ stopReason: "toolUse" },
		),
		fauxAssistantMessage(
			fauxToolCall("run_command", { command_id: "public_test" }, { id: `${input.attemptId}-test` }),
			{ stopReason: "toolUse" },
		),
		fauxAssistantMessage("The bounded real-shaped stub is complete."),
	];
}

function assertSessionShape(metadata: JsonlSessionMetadata, input: ExecutionAttemptRequestV2): void {
	if (
		typeof metadata.id !== "string" || metadata.id.length === 0 ||
		typeof metadata.path !== "string" || metadata.path.length === 0 ||
		metadata.cwd !== input.workspaceRoot
	) throw new V2BExecutionBoundaryError("shape_invalid");
}

const REDACTED_PROVIDER_KEYS_V2B = new Set([
	"authorization", "proxyauthorization", "apikey", "credential", "credentials", "secret",
	"token", "accesstoken", "refreshtoken", "idtoken", "reasoning", "reasoningcontent",
	"thoughtsignature", "signature",
]);

export function safeProviderProjectionV2B(value: unknown): unknown {
	if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
	if (Array.isArray(value)) return value.map(safeProviderProjectionV2B);
	if (typeof value !== "object") return null;
	const result: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
		const normalized = key.replace(/[_-]/g, "").toLowerCase();
		if (REDACTED_PROVIDER_KEYS_V2B.has(normalized)) continue;
		if (typeof child !== "function" && child !== undefined) result[key] = safeProviderProjectionV2B(child);
	}
	return result;
}

export function providerPayloadIdentityV2B(value: unknown): string {
	return sha256(stableJson(safeProviderProjectionV2B(value)));
}

interface RuntimePortOptionsV2B {
	mode: "stage1_stub" | "stage2_real";
	runId: string;
	onAttemptEvidence: (evidence: AttemptRuntimeEvidenceV2B) => void;
	stage1Authority?: Stage1ExecutionAuthorityV2B;
	realAccess?: OneRunProviderAccessV1B;
	realCounters?: RealCallCountersV2B;
	usageInvalidRole?: AttemptRoleV2B;
	usageOverflow?: { role: AttemptRoleV2B; kind: "tokens" | "cost" };
	toolCapRole?: AttemptRoleV2B;
	onAttemptStarted?: (input: { attemptId: string; role: AttemptRoleV2B }) => void;
}

type ClosableExecutionPortV2B = ExecutionPortV2 & { close(): Promise<void> };

export class RunCredentialLeaseV2B {
	private cached: string | null = null;
	private readonly access: OneRunProviderAccessV1B;
	private readonly counters: RealCallCountersV2B;
	constructor(access: OneRunProviderAccessV1B, counters: RealCallCountersV2B) { this.access = access; this.counters = counters; }
	async resolve(): Promise<string> {
		if (this.cached !== null) return this.cached;
		try {
			this.cached = await this.access.resolveCredential();
		} catch {
			throw new V2BExecutionBoundaryError("authority_rejected");
		}
		this.counters.credential_reads++;
		return this.cached;
	}
	clear(): void { this.cached = null; }
}

export function createStage1ExecutionAuthorityV2B(options: {
	runId: string;
	caseId: CaseIdV2B;
	authorized: boolean;
}): Stage1ExecutionAuthorityV2B {
	return new Stage1ExecutionAuthorityV2B(options);
}

export function createStage1RealShapedExecutionPortV2B(options: {
	authority: Stage1ExecutionAuthorityV2B;
	onAttemptEvidence: (evidence: AttemptRuntimeEvidenceV2B) => void;
	usageInvalidRole?: AttemptRoleV2B;
	usageOverflow?: { role: AttemptRoleV2B; kind: "tokens" | "cost" };
	toolCapRole?: AttemptRoleV2B;
	onAttemptStarted?: (input: { attemptId: string; role: AttemptRoleV2B }) => void;
}): ExecutionPortV2 {
	if (!(options.authority instanceof Stage1ExecutionAuthorityV2B)) throw new V2BExecutionBoundaryError("authority_rejected");
	return createRuntimeExecutionPortV2B({
		mode: "stage1_stub",
		runId: options.authority.runId,
		stage1Authority: options.authority,
		onAttemptEvidence: options.onAttemptEvidence,
		...(options.usageInvalidRole ? { usageInvalidRole: options.usageInvalidRole } : {}),
		...(options.usageOverflow ? { usageOverflow: options.usageOverflow } : {}),
		...(options.toolCapRole ? { toolCapRole: options.toolCapRole } : {}),
		...(options.onAttemptStarted ? { onAttemptStarted: options.onAttemptStarted } : {}),
	});
}

function createRuntimeExecutionPortV2B(options: RuntimePortOptionsV2B): ClosableExecutionPortV2B {
	const consumedRealAttemptIds = new Set<string>();
	let closed = false;
	let cachedRealCredential: string | null = null;
	let cachedRealModels: ReturnType<typeof createModels> | null = null;
	let cachedRealModel: ReturnType<ReturnType<typeof createModels>["getModel"]> = undefined;
	const credentialLease = options.realAccess && options.realCounters ? new RunCredentialLeaseV2B(options.realAccess, options.realCounters) : null;

	const getRealComposition = async () => {
		if (cachedRealModels && cachedRealModel) return { models: cachedRealModels, model: cachedRealModel };
		if (!options.realAccess || !options.realCounters || !credentialLease) throw new V2BExecutionBoundaryError("authority_rejected");
		cachedRealCredential = await credentialLease.resolve();
		const credentials = new InMemoryCredentialStore();
		await credentials.modify(DEEPSEEK_FIXED_PROFILE_V1.provider, async () => ({ type: "api_key", key: cachedRealCredential! }));
		const models = createModels({ credentials });
		models.setProvider(deepseekProvider());
		const model = models.getModel(DEEPSEEK_FIXED_PROFILE_V1.provider, DEEPSEEK_FIXED_PROFILE_V1.model);
		if (!model) throw new V2BExecutionBoundaryError("shape_invalid");
		cachedRealModels = models;
		cachedRealModel = model;
		return { models, model };
	};

	return Object.freeze({
		async execute(input: ExecutionAttemptRequestV2): Promise<HarnessResultV2A> {
			if (closed) throw new V2BExecutionBoundaryError("authority_rejected");
			if (options.mode === "stage1_stub") {
				if (!options.stage1Authority) throw new V2BExecutionBoundaryError("authority_rejected");
				options.stage1Authority.consume(input.attemptId);
			} else {
				if (!options.realAccess || !options.realCounters || !input.attemptId.startsWith(`${options.runId}-`) || consumedRealAttemptIds.has(input.attemptId)) {
					throw new V2BExecutionBoundaryError("authority_rejected");
				}
				if (consumedRealAttemptIds.size >= 3) throw new V2BExecutionBoundaryError("attempt_count_exceeded");
				consumedRealAttemptIds.add(input.attemptId);
			}
			const metadata = await input.session.getMetadata();
			assertSessionShape(metadata, input);
			const role = roleFor(input.attemptId);
			options.onAttemptStarted?.({ attemptId: input.attemptId, role });
			const countersBefore = structuredClone(options.realCounters ?? emptyCounters());
			const usage = emptyUsage();
			const reservations: ProviderReservationV2B[] = [];
			const profile = createBoundedToolProfile(input.workspaceRoot, input.task);
			if (input.task.tool_profile_id !== V2B_TOOL_PROFILE_ID || input.skill.name !== "reliability-completion") {
				throw new V2BExecutionBoundaryError("shape_invalid");
			}
			const realComposition = options.mode === "stage2_real" ? await getRealComposition() : null;
			const models = realComposition?.models ?? createModels();
			const registration = options.mode === "stage1_stub" ? fauxProvider({
				api: "openai-completions",
				provider: DEEPSEEK_FIXED_PROFILE_V1.provider,
				models: [{ id: DEEPSEEK_FIXED_PROFILE_V1.model, name: "DeepSeek V4 Flash", reasoning: true, input: ["text"], cost: { input: 0.14, output: 0.28, cacheRead: 0.0028, cacheWrite: 0 }, contextWindow: 1_000_000, maxTokens: 384_000 }],
			}) : null;
			if (registration) models.setProvider(registration.provider);
			const model = realComposition?.model ?? models.getModel(DEEPSEEK_FIXED_PROFILE_V1.provider, DEEPSEEK_FIXED_PROFILE_V1.model);
			if (!model || model.provider !== DEEPSEEK_FIXED_PROFILE_V1.provider || model.id !== DEEPSEEK_FIXED_PROFILE_V1.model) {
				throw new V2BExecutionBoundaryError("shape_invalid");
			}
			let contextMessageCount = -1;
			const toolNames = profile.tools.map((tool) => tool.name).sort();
			let providerPayloadSha256 = "";
			registration?.setResponses(deterministicResponses(input, options.toolCapRole === role).map((response) => (context, _requestOptions, _state, requestModel) => {
				if (contextMessageCount < 0) contextMessageCount = context.messages.length;
				if (requestModel.provider !== DEEPSEEK_FIXED_PROFILE_V1.provider || requestModel.id !== DEEPSEEK_FIXED_PROFILE_V1.model) {
					throw new V2BExecutionBoundaryError("shape_invalid");
				}
				return response;
			}));
			let pending: ProviderReservationV2B | null = null;
			let settled = false;
			let budgetStopped = false;
			let usageInvalid = false;
			let usageOverflow = false;
			let invalidObservedTokens = 0;
			let invalidObservedSettled = false;
			let invalidObservedToolCalls = 0;
			let rawObservedToolCalls = 0;
			let rawObservedProviderResponses = 0;
			const harness = new AgentHarness({
				models,
				session: input.session,
				model,
				resources: { skills: [input.skill] },
				tools: profile.tools,
				toolContext: profile.context,
				systemPrompt: SYSTEM_PROMPT,
				thinkingLevel: "off",
				streamOptions: { maxRetries: 0, timeoutMs: V2B_ATTEMPT_CAPS.active_execution_time_ms },
			});
			const offProvider = harness.on("before_provider_request", () => {
				if (pending) throw new V2BUsageBoundaryError();
				if (usage.provider_requests + 1 > V2B_ATTEMPT_CAPS.provider_requests) {
					budgetStopped = true;
					throw new V2BBudgetStopError();
				}
				const requestOrdinal = usage.provider_requests + 1;
				pending = {
					reservation_id: `${input.attemptId}-provider-${String(requestOrdinal).padStart(2, "0")}`,
					attempt_id: input.attemptId,
					request_ordinal: requestOrdinal,
					phase: "reserved_before_dispatch",
					provider_requests_before: usage.provider_requests,
					provider_requests_after: requestOrdinal,
					reserved_tokens: V2B_ATTEMPT_CAPS.tokens - usage.tokens,
					reserved_cost_usd: V2B_ATTEMPT_CAPS.real_cost_usd - usage.real_cost_usd,
					actual_tokens: "unknown",
					actual_cost_usd: "unknown",
				};
				usage.provider_requests = requestOrdinal;
				reservations.push(structuredClone(pending));
				if (options.mode === "stage2_real") {
					options.realCounters!.network_calls++;
					options.realCounters!.external_provider_calls++;
					options.realCounters!.real_model_calls++;
				}
				return undefined;
			});
			const offPayload = harness.on("before_provider_payload", (event) => {
				if (providerPayloadSha256 === "") providerPayloadSha256 = providerPayloadIdentityV2B(event.payload);
				return { payload: event.payload };
			});
			const offTool = harness.on("tool_call", () => {
				if (usage.tool_calls + 1 > V2B_ATTEMPT_CAPS.tool_calls) {
					budgetStopped = true;
					throw new V2BBudgetStopError();
				}
				usage.tool_calls++;
				return undefined;
			});
			const unsubscribe = harness.subscribe((event) => {
				if (event.type === "message_end" && event.message.role === "assistant" && pending) {
					if (event.message.stopReason !== "error") rawObservedProviderResponses++;
					rawObservedToolCalls += event.message.content.filter((block) => block.type === "toolCall").length;
					const overflow = options.usageOverflow?.role === role && usage.provider_requests === 1 ? options.usageOverflow.kind : null;
					if (options.usageInvalidRole === role && usage.provider_requests === 1) {
						usageInvalid = true;
						invalidObservedTokens = event.message.usage.input + event.message.usage.output + event.message.usage.cacheRead + event.message.usage.cacheWrite;
						invalidObservedSettled = event.message.stopReason === "stop";
						invalidObservedToolCalls = event.message.content.filter((block) => block.type === "toolCall").length;
						usage.conservative_charged_tokens += pending.reserved_tokens;
						usage.conservative_charged_cost_usd += pending.reserved_cost_usd;
						usage.tokens += pending.reserved_tokens;
						usage.real_cost_usd += pending.reserved_cost_usd;
						pending.phase = "conservative_unknown_usage_charge";
						reservations[reservations.length - 1] = structuredClone(pending);
						pending = null;
						throw new V2BUsageBoundaryError();
					}
					const known = assertKnownUsageV1B({
						input_tokens: event.message.usage.input + event.message.usage.cacheRead + event.message.usage.cacheWrite,
						output_tokens: event.message.usage.output,
						cost_usd: event.message.usage.cost.total,
					});
					const actualTokens = overflow === "tokens" ? pending.reserved_tokens + 1 : known.tokens;
					const actualCost = overflow === "cost" ? pending.reserved_cost_usd + 0.01 : known.cost_usd;
					pending.actual_tokens = actualTokens;
					pending.actual_cost_usd = actualCost;
					if (actualTokens > pending.reserved_tokens || actualCost > pending.reserved_cost_usd + Number.EPSILON) {
						usageOverflow = true;
						invalidObservedTokens = event.message.usage.input + event.message.usage.output + event.message.usage.cacheRead + event.message.usage.cacheWrite;
						invalidObservedSettled = event.message.stopReason === "stop";
						invalidObservedToolCalls = event.message.content.filter((block) => block.type === "toolCall").length;
						usage.conservative_charged_tokens += pending.reserved_tokens;
						usage.conservative_charged_cost_usd += pending.reserved_cost_usd;
						usage.tokens += pending.reserved_tokens;
						usage.real_cost_usd += pending.reserved_cost_usd;
						pending.phase = "conservative_overflow_charge";
						reservations[reservations.length - 1] = structuredClone(pending);
						pending = null;
						throw new V2BUsageBoundaryError();
					}
					usage.input_tokens += event.message.usage.input;
					usage.output_tokens += event.message.usage.output;
					usage.cache_read_tokens += event.message.usage.cacheRead;
					usage.cache_write_tokens += event.message.usage.cacheWrite;
					usage.tokens += known.tokens;
					usage.real_cost_usd += known.cost_usd;
					pending.phase = "known_usage_committed";
					reservations[reservations.length - 1] = structuredClone(pending);
					pending = null;
				}
				if (event.type === "settled") settled = true;
			});
			const started = Date.now();
			let terminalReason: RuntimeTerminalReasonV2B = "runtime_invalid";
			try {
				await harness.skill(input.skill.name, input.prompt);
				await harness.waitForIdle();
				const hostCapReached = input.mode === "budget_stop" && usage.provider_requests === V2B_ATTEMPT_CAPS.provider_requests && (registration?.getPendingResponseCount() ?? 0) > 0;
				if (hostCapReached) budgetStopped = true;
				terminalReason = usageOverflow ? "usage_overflow" : usageInvalid ? "usage_invalid" : budgetStopped ? "budget_stopped" : settled ? "settled" : "runtime_invalid";
			} catch (error) {
				terminalReason = usageOverflow ? "usage_overflow" : usageInvalid || error instanceof V2BUsageBoundaryError ? "usage_invalid" : budgetStopped || error instanceof V2BBudgetStopError ? "budget_stopped" : "runtime_invalid";
			} finally {
				usage.active_execution_time_ms = Math.max(0, Date.now() - started);
				unsubscribe();
				offProvider();
				offPayload();
				offTool();
				await harness.abort();
			}
			if (providerPayloadSha256 === "") providerPayloadSha256 = sha256("no-provider-payload");
			const evidence: AttemptRuntimeEvidenceV2B = {
				schema_version: "v2b-attempt-runtime-evidence-v1",
				attempt_id: input.attemptId,
				role,
				terminal_reason: terminalReason,
				settled: terminalReason === "settled",
				composition: {
					provider: "deepseek",
					model_id: "deepseek-v4-flash",
					api: "openai-completions",
					endpoint: "https://api.deepseek.com/chat/completions",
					thinking_level: "off",
					retry: false,
					fallback: false,
					session_id: metadata.id,
					session_path: metadata.path,
					session_cwd: metadata.cwd,
					parent_session_path: metadata.parentSessionPath ?? null,
					task_id: input.task.task_id,
					skill_id: V2B_SKILL_ID,
					tool_profile_id: V2B_TOOL_PROFILE_ID,
					system_prompt_sha256: sha256(SYSTEM_PROMPT),
					prompt_sha256: sha256(input.prompt),
					provider_payload_sha256: providerPayloadSha256,
					context_message_count: contextMessageCount,
					tool_names: toolNames,
					common_input_sha256: sha256(stableJson({
						task_id: input.task.task_id,
						prompt_sha256: sha256(input.prompt),
						skill_id: V2B_SKILL_ID,
						system_prompt_sha256: sha256(SYSTEM_PROMPT),
						provider: DEEPSEEK_FIXED_PROFILE_V1.provider,
						model: DEEPSEEK_FIXED_PROFILE_V1.model,
						thinking_level: "off",
						tool_profile_id: V2B_TOOL_PROFILE_ID,
						tool_names: toolNames,
						attempt_caps: V2B_ATTEMPT_CAPS,
					})),
				},
				usage: structuredClone(usage),
				reservations: structuredClone(reservations),
				counters_before: countersBefore,
				counters_after: structuredClone(options.realCounters ?? emptyCounters()),
				no_retry_fallback: true,
			};
			options.onAttemptEvidence(structuredClone(evidence));
			return {
				settled: usageInvalid || usageOverflow ? invalidObservedSettled : evidence.settled,
				terminalReason: terminalReason === "settled" ? "settled" : terminalReason === "budget_stopped" ? "budget_stopped" : "runtime_invalid",
				providerDispatches: rawObservedProviderResponses,
				toolCalls: usageInvalid || usageOverflow ? invalidObservedToolCalls : budgetStopped ? rawObservedToolCalls : usage.tool_calls,
				tokens: usageInvalid || usageOverflow ? invalidObservedTokens : usage.tokens,
				activeExecutionTimeMs: usage.active_execution_time_ms,
				contextMessageCount,
			};
		},
		async close(): Promise<void> {
			if (closed) return;
			closed = true;
			cachedRealCredential = null;
			credentialLease?.clear();
			cachedRealModels = null;
			cachedRealModel = undefined;
			options.realAccess?.close();
		},
	});
}

export function createRealExecutionPortV2B(options: {
	runId: string;
	authority: OneRunProviderAuthorityV1B;
	realCounters: RealCallCountersV2B;
	onAttemptEvidence: (evidence: AttemptRuntimeEvidenceV2B) => void;
	onAttemptStarted?: (input: { attemptId: string; role: AttemptRoleV2B }) => void;
}): ExecutionPortV2 {
	return createPublicPiRunCompositionV1B<ClosableExecutionPortV2B>({
		authority: options.authority,
		factory: {
			create: (access) => createRuntimeExecutionPortV2B({
				mode: "stage2_real",
				runId: options.runId,
				realAccess: access,
				realCounters: options.realCounters,
				onAttemptEvidence: options.onAttemptEvidence,
				...(options.onAttemptStarted ? { onAttemptStarted: options.onAttemptStarted } : {}),
			}),
		},
	});
}

export function assertZeroRealAccessV2B(counters: RealCallCountersV2B): void {
	if (stableJson(counters) !== stableJson(emptyCounters())) throw new V2BExecutionBoundaryError("shape_invalid");
}

export type PublicSessionV2B = Session<JsonlSessionMetadata>;
export type PublicSkillV2B = Skill;
