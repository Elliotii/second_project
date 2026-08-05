import { randomUUID } from "node:crypto";
import {
	AgentHarness,
	InMemorySessionStorage,
	Session,
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
import type {
	BudgetCapsV1B,
	BudgetReservationEvidenceV1B,
	BudgetUsageV1B,
	InitialDispatchEvidenceV1B,
	PausePhaseV1B,
	PauseSnapshotV1B,
	ProviderRequestReservationEventV1B,
	TaskSpecV1,
} from "../contracts/v1-types.ts";
import { sha256, stableJson } from "../hash.ts";
import { projectActualInitialRequestV1 } from "./pi-adapter-v1.ts";
import { createBoundedToolProfile } from "./tool-profile.ts";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import {
	DEEPSEEK_FIXED_PROFILE_V1,
	FixedProviderBoundaryErrorV1B,
	V1BPauseBoundaryError,
	assertKnownUsageV1B,
	type OneRunProviderAccessV1B,
	type PublicPiRunHandleV1B,
} from "../provider/fixed-provider-v1.ts";

export type FakeAttemptModeV1B = "pass" | "fail";

export interface PiAttemptSettlementV1B {
	settled: true;
	attempt_id: string;
	final_text: string;
	provider_requests: number;
	tool_calls: number;
	tokens: number;
	cost_usd: number;
	wall_time_ms: number;
	session_entry_count: number;
	initial_dispatch: InitialDispatchEvidenceV1B;
	reservations: BudgetReservationEvidenceV1B[];
}

export interface PiRunHandleV1 extends PublicPiRunHandleV1B {
	readonly sessionId: string;
	readonly workspaceId: string;
	runAttempt(input: {
		attemptId: string;
		prompt: string;
		invocation: "prompt" | "skill";
		fakeMode?: FakeAttemptModeV1B;
		fakePatch?: string;
	}): Promise<PiAttemptSettlementV1B>;
	reserveVerifier(): void;
	reserveChild(): void;
	takeReservations(): BudgetReservationEvidenceV1B[];
	createPauseSnapshot(phase: PausePhaseV1B): PauseSnapshotV1B;
	usage(): { run: BudgetUsageV1B; pilot: BudgetUsageV1B };
	debugIdentity(): { harness_instance_id: string | null; session_id: string; workspace_id: string; closed: boolean };
}

export interface PiRunHandleOptionsV1 {
	mode: "stage1_fake" | "stage2_real";
	workspaceRoot: string;
	task: TaskSpecV1;
	skill: Skill;
	access: OneRunProviderAccessV1B;
	attemptCaps: BudgetCapsV1B;
	runCaps: BudgetCapsV1B;
	pilotCaps: BudgetCapsV1B;
	pilotUsage: BudgetUsageV1B;
	realCallCounters: { credential_reads: number; network_calls: number; provider_calls: number; model_calls: number };
	onProviderRequestReserved?: (event: ProviderRequestReservationEventV1B) => void;
	deterministicPausePhase?: PausePhaseV1B;
	sessionId?: string;
	workspaceId: string;
}

export function emptyBudgetUsageV1B(): BudgetUsageV1B {
	return { provider_requests: 0, tool_calls: 0, tokens: 0, active_execution_time_ms: 0, cost_usd: 0, verifier_runs: 0, child_attempts: 0 };
}

function cloneUsage(value: BudgetUsageV1B): BudgetUsageV1B {
	return structuredClone(value);
}

function assertCaps(usage: BudgetUsageV1B, caps: BudgetCapsV1B, label: string): void {
	for (const key of ["provider_requests", "tool_calls", "tokens", "active_execution_time_ms", "verifier_runs", "child_attempts"] as const) {
		const capKey = key === "active_execution_time_ms" ? "wall_time_ms" : key;
		if (!Number.isSafeInteger(usage[key]) || usage[key] < 0 || usage[key] > caps[capKey]) throw new Error(`${label} ${key} budget exceeded`);
	}
	if (!Number.isFinite(usage.cost_usd) || usage.cost_usd < 0 || usage.cost_usd > caps.cost_usd + Number.EPSILON) throw new Error(`${label} cost budget exceeded`);
}

class ThreeLevelBudgetV1B {
	private attempt = emptyBudgetUsageV1B();
	private readonly run = emptyBudgetUsageV1B();
	private readonly reservations: BudgetReservationEvidenceV1B[] = [];
	private pendingProvider: { records: BudgetReservationEvidenceV1B[] } | null = null;
	private attemptId = "attempt-unset";
	private reservationSeq = 0;
	private readonly attemptCaps: BudgetCapsV1B;
	private readonly runCaps: BudgetCapsV1B;
	private readonly pilotCaps: BudgetCapsV1B;
	private readonly pilot: BudgetUsageV1B;

	constructor(
		attemptCaps: BudgetCapsV1B,
		runCaps: BudgetCapsV1B,
		pilotCaps: BudgetCapsV1B,
		pilot: BudgetUsageV1B,
	) {
		this.attemptCaps = attemptCaps;
		this.runCaps = runCaps;
		this.pilotCaps = pilotCaps;
		this.pilot = pilot;
	}

	beginAttempt(attemptId: string): void {
		if (this.pendingProvider) throw new Error("provider reservation remained pending");
		this.attempt = emptyBudgetUsageV1B();
		this.attemptId = attemptId;
	}

	private propose(level: BudgetReservationEvidenceV1B["level"], kind: BudgetReservationEvidenceV1B["kind"], current: BudgetUsageV1B, caps: BudgetCapsV1B, reserved: BudgetUsageV1B, actual: BudgetUsageV1B, scopeId: string, reservationId: string): BudgetReservationEvidenceV1B {
		const before = cloneUsage(current);
		const ceiling = cloneUsage(before);
		const after = cloneUsage(before);
		for (const key of Object.keys(before) as Array<keyof BudgetUsageV1B>) {
			const reservedValue = reserved[key]; const actualValue = actual[key];
			if (!Number.isFinite(reservedValue) || reservedValue < 0 || !Number.isFinite(actualValue) || actualValue < 0 || actualValue > reservedValue + Number.EPSILON) throw new Error(`${kind} reservation usage invalid`);
			ceiling[key] += reservedValue; after[key] += actualValue;
		}
		assertCaps(ceiling, caps, `${level} reserved ceiling`);
		assertCaps(after, caps, `${level} committed actual`);
		return { reservation_id: reservationId, scope_id: scopeId, level, kind, before, reserved: cloneUsage(reserved), actual: cloneUsage(actual), after, cap: structuredClone(caps) };
	}

	private commit(records: BudgetReservationEvidenceV1B[]): void {
		for (const record of records) {
			const target = record.level === "attempt" ? this.attempt : record.level === "run" ? this.run : this.pilot;
			Object.assign(target, record.after);
			this.reservations.push(record);
		}
	}

	private reserveAll(kind: BudgetReservationEvidenceV1B["kind"], reserved: BudgetUsageV1B, actual: BudgetUsageV1B): BudgetReservationEvidenceV1B[] {
		const id = `reservation-${String(++this.reservationSeq).padStart(4, "0")}`;
		const records = [
			this.propose("attempt", kind, this.attempt, this.attemptCaps, reserved, actual, this.attemptId, id),
			this.propose("run", kind, this.run, this.runCaps, reserved, actual, "run", id),
			this.propose("pilot", kind, this.pilot, this.pilotCaps, reserved, actual, "pilot", id),
		];
		this.commit(records);
		return records;
	}

	reserveProvider(): BudgetReservationEvidenceV1B {
		if (this.pendingProvider) throw new Error("concurrent provider reservation rejected");
		const tokens = Math.min(this.attemptCaps.tokens - this.attempt.tokens, this.runCaps.tokens - this.run.tokens, this.pilotCaps.tokens - this.pilot.tokens);
		const cost = Math.min(this.attemptCaps.cost_usd - this.attempt.cost_usd, this.runCaps.cost_usd - this.run.cost_usd, this.pilotCaps.cost_usd - this.pilot.cost_usd);
		if (tokens < 0 || cost < 0) throw new Error("provider token/cost reserve unavailable");
		const reserved = emptyBudgetUsageV1B(); reserved.provider_requests = 1; reserved.tokens = tokens; reserved.cost_usd = cost;
		const actual = emptyBudgetUsageV1B(); actual.provider_requests = 1;
		this.pendingProvider = { records: this.reserveAll("provider_request", reserved, actual) };
		return structuredClone(this.pendingProvider.records.find((record) => record.level === "run")!);
	}

	createPauseSnapshot(phase: PausePhaseV1B, identity: { attempt_id: string; session_id: string; workspace_id: string; request_ordinal: number | null }, counters: PiRunHandleOptionsV1["realCallCounters"]): PauseSnapshotV1B {
		const pendingRun = this.pendingProvider?.records.find((record) => record.level === "run") ?? null;
		const accumulatedKnown = pendingRun ? cloneUsage(pendingRun.before) : this.runUsage();
		const conservativeCharge = emptyBudgetUsageV1B();
		if (this.pendingProvider) {
			const proposals = this.pendingProvider.records.map((record) => this.propose(record.level, record.kind, record.before, record.cap, record.reserved, record.reserved, record.scope_id, record.reservation_id));
			for (const proposal of proposals) {
				const target = proposal.level === "attempt" ? this.attempt : proposal.level === "run" ? this.run : this.pilot;
				Object.assign(target, proposal.after);
				const index = this.reservations.findIndex((record) => record.reservation_id === proposal.reservation_id && record.level === proposal.level);
				this.reservations[index] = proposal;
			}
			Object.assign(conservativeCharge, pendingRun!.reserved);
			this.pendingProvider = null;
		}
		return {
			phase, ...identity, counter_snapshot: structuredClone(counters), accumulated_known_usage: accumulatedKnown,
			pending_provider_reservation: pendingRun ? { reservation_id: pendingRun.reservation_id, provider_requests: pendingRun.reserved.provider_requests, tokens: pendingRun.reserved.tokens, cost_usd: pendingRun.reserved.cost_usd } : null,
			conservative_usage_charge: conservativeCharge, budget_usage_after_conservative_charge: this.runUsage(),
		};
	}

	commitProvider(message: AssistantMessage): void {
		if (!this.pendingProvider) throw new Error("provider usage arrived without reservation");
		const usage = assertKnownUsageV1B({ input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite, output_tokens: message.usage.output, cost_usd: message.usage.cost.total });
		const proposals = this.pendingProvider.records.map((record) => {
			if (usage.tokens > record.reserved.tokens || usage.cost_usd > record.reserved.cost_usd + Number.EPSILON) throw new Error("provider actual usage exceeded reservation");
			const actual = cloneUsage(record.actual); actual.tokens = usage.tokens; actual.cost_usd = usage.cost_usd;
			return this.propose(record.level, record.kind, record.before, record.cap, record.reserved, actual, record.scope_id, record.reservation_id);
		});
		for (const proposal of proposals) {
			const target = proposal.level === "attempt" ? this.attempt : proposal.level === "run" ? this.run : this.pilot;
			Object.assign(target, proposal.after);
			const index = this.reservations.findIndex((record) => record.reservation_id === proposal.reservation_id && record.level === proposal.level);
			this.reservations[index] = proposal;
		}
		this.pendingProvider = null;
	}

	reserveTool(): void {
		const delta = emptyBudgetUsageV1B(); delta.tool_calls = 1; this.reserveAll("tool_call", delta, delta);
	}

	reserveVerifier(): void {
		const delta = emptyBudgetUsageV1B(); delta.verifier_runs = 1; this.reserveAll("verifier", delta, delta);
	}

	reserveChild(): void {
		const child = emptyBudgetUsageV1B();
		child.provider_requests = this.attemptCaps.provider_requests; child.tool_calls = this.attemptCaps.tool_calls;
		child.tokens = this.attemptCaps.tokens; child.active_execution_time_ms = this.attemptCaps.wall_time_ms;
		child.cost_usd = this.attemptCaps.cost_usd; child.verifier_runs = this.attemptCaps.verifier_runs;
		const id = `reservation-${String(++this.reservationSeq).padStart(4, "0")}`;
		const attemptRecord = this.propose("attempt", "child", emptyBudgetUsageV1B(), this.attemptCaps, child, emptyBudgetUsageV1B(), `${this.attemptId}:child-reserve`, id);
		const aggregateReserve = cloneUsage(child); aggregateReserve.child_attempts = 1;
		const actual = emptyBudgetUsageV1B(); actual.child_attempts = 1;
		const records = [attemptRecord,
			this.propose("run", "child", this.run, this.runCaps, aggregateReserve, actual, "run", id),
			this.propose("pilot", "child", this.pilot, this.pilotCaps, aggregateReserve, actual, "pilot", id),
		];
		this.commit(records);
	}

	finishAttempt(durationMs: number): void {
		if (this.pendingProvider) throw new Error("provider usage unknown at Attempt settlement");
		if (!Number.isSafeInteger(durationMs) || durationMs < 0) throw new Error("Attempt duration invalid");
		const delta = emptyBudgetUsageV1B(); delta.active_execution_time_ms = durationMs; this.reserveAll("attempt_time", delta, delta);
	}

	attemptUsage(): BudgetUsageV1B { return cloneUsage(this.attempt); }
	runUsage(): BudgetUsageV1B { return cloneUsage(this.run); }
	pilotUsage(): BudgetUsageV1B { return cloneUsage(this.pilot); }
	hasPendingProvider(): boolean { return this.pendingProvider !== null; }
	takeReservations(): BudgetReservationEvidenceV1B[] { const result = structuredClone(this.reservations); this.reservations.length = 0; return result; }
}

function fakeResponses(mode: FakeAttemptModeV1B, attemptId: string, patch: string | undefined) {
	if (mode === "fail") return [fauxAssistantMessage("I stopped without changing the bounded task.")];
	if (typeof patch !== "string") throw new Error("passing Faux plan requires a frozen patch");
	return [
		fauxAssistantMessage(fauxToolCall("workspace_write", { path: "src/subject.ts", content: patch }, { id: `${attemptId}-write` }), { stopReason: "toolUse" }),
		fauxAssistantMessage(fauxToolCall("run_command", { command_id: "public_test" }, { id: `${attemptId}-test` }), { stopReason: "toolUse" }),
		fauxAssistantMessage("The bounded task is complete."),
	];
}

function assistantText(message: AssistantMessage): string {
	return message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
}

const FORBIDDEN_EVIDENCE_KEY_V1B = /^(?:authorization|proxyauthorization|reasoning|reasoningcontent|thinking|thoughtsignature|signature)$/i;
const FORBIDDEN_EVIDENCE_VALUE_V1B = /(?:bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i;

export function projectSafeEvidenceV1B(value: unknown): unknown {
	if (value === null || typeof value === "boolean" || typeof value === "number") return value;
	if (typeof value === "string") {
		if (FORBIDDEN_EVIDENCE_VALUE_V1B.test(value)) throw new Error("secret/reasoning evidence value rejected");
		return value;
	}
	if (Array.isArray(value)) return value.map(projectSafeEvidenceV1B);
	if (!value || typeof value !== "object") throw new Error("non-JSON evidence value rejected");
	const entries: Array<[string, unknown]> = [];
	for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
		const normalized = key.replace(/[_-]/g, "");
		if (FORBIDDEN_EVIDENCE_KEY_V1B.test(normalized)) continue;
		if (typeof child === "function" || child === undefined) continue;
		entries.push([key, projectSafeEvidenceV1B(child)]);
	}
	return Object.fromEntries(entries);
}

export function createPiRunHandleV1(options: PiRunHandleOptionsV1): PiRunHandleV1 {
	options.access.assertOpen();
	const budget = new ThreeLevelBudgetV1B(options.attemptCaps, options.runCaps, options.pilotCaps, options.pilotUsage);
	const sessionId = options.sessionId ?? `v1b-session-${randomUUID()}`;
	const storage = new InMemorySessionStorage({ metadata: { id: sessionId, createdAt: new Date().toISOString() } });
	const session = new Session(storage);
	const profile = createBoundedToolProfile(options.workspaceRoot, options.task);
	let harness: AgentHarness<any, Skill, any, any> | undefined;
	let registration: ReturnType<typeof fauxProvider> | undefined;
	let harnessInstanceId: string | null = null;
	let closed = false;
	let running = false;
	let initialDispatch: InitialDispatchEvidenceV1B | null = null;
	let currentProviderRequests = 0;
	let currentToolCalls = 0;
	let settledObserved = false;
	let unsubscribe: (() => void) | undefined;
	let offProvider: (() => void) | undefined;
	let offPayload: (() => void) | undefined;
	let offTool: (() => void) | undefined;
	let pendingRequestModel: unknown;
	let pendingRequestOptions: unknown;
	let activeAttemptId = "attempt-unset";
	let pendingPauseSnapshot: PauseSnapshotV1B | null = null;
	const pause = (phase: PausePhaseV1B): V1BPauseBoundaryError => {
		if (pendingPauseSnapshot) return new V1BPauseBoundaryError(pendingPauseSnapshot);
		pendingPauseSnapshot = budget.createPauseSnapshot(phase, { attempt_id: activeAttemptId, session_id: sessionId, workspace_id: options.workspaceId, request_ordinal: currentProviderRequests === 0 ? null : currentProviderRequests }, options.realCallCounters);
		return new V1BPauseBoundaryError(pendingPauseSnapshot);
	};

	const attach = (value: AgentHarness<any, Skill, any, any>): void => {
		harness = value;
		harnessInstanceId = `v1b-harness-${randomUUID()}`;
		offProvider = value.on("before_provider_request", (event) => {
			const before = { ...options.realCallCounters };
			const reservation = budget.reserveProvider(); currentProviderRequests++;
			const externalDelta = options.mode === "stage2_real" ? 1 : 0;
			options.onProviderRequestReserved?.({
				schema_version: 1, attempt_id: activeAttemptId, session_id: sessionId, workspace_id: options.workspaceId, request_ordinal: currentProviderRequests,
				phase: "provider_request_reserved_before_dispatch",
				counter_transition: {
					provider_requests: { before: currentProviderRequests - 1, after: currentProviderRequests },
					network_calls: { before: before.network_calls, after: before.network_calls + externalDelta },
					provider_calls: { before: before.provider_calls, after: before.provider_calls + externalDelta },
					model_calls: { before: before.model_calls, after: before.model_calls + externalDelta },
				},
				reservation: { reservation_id: reservation.reservation_id, token_cap: reservation.reserved.tokens, cost_usd_cap: reservation.reserved.cost_usd },
			});
			if (options.deterministicPausePhase === "after_provider_request_reservation_usage_unavailable") throw pause(options.deterministicPausePhase);
			if (options.mode === "stage2_real") { options.realCallCounters.network_calls++; options.realCallCounters.provider_calls++; options.realCallCounters.model_calls++; }
			pendingRequestModel = projectSafeEvidenceV1B(event.model);
			pendingRequestOptions = projectSafeEvidenceV1B(event.streamOptions);
			return undefined;
		});
		offPayload = value.on("before_provider_payload", (event) => {
			if (!initialDispatch) {
				const providerPayload = projectSafeEvidenceV1B(event.payload) as Record<string, unknown>;
				const context = {
					systemPrompt: typeof providerPayload.system === "string" ? providerPayload.system : null,
					messages: Array.isArray(providerPayload.messages) ? providerPayload.messages : [],
					tools: Array.isArray(providerPayload.tools) ? providerPayload.tools : [],
				};
				const projection = { model: pendingRequestModel, context, options: pendingRequestOptions, provider_payload: providerPayload };
				initialDispatch = { ...projection, payload_sha256: sha256(stableJson(projection)) };
			}
			return { payload: event.payload };
		});
		offTool = value.on("tool_call", () => { budget.reserveTool(); currentToolCalls++; return undefined; });
		unsubscribe = value.subscribe((event) => {
			if (event.type === "message_end" && event.message.role === "assistant") {
				if (options.deterministicPausePhase === "invalid_or_unknown_usage_after_provider_response") throw pause(options.deterministicPausePhase);
				try { budget.commitProvider(event.message); } catch { throw pause("invalid_or_unknown_usage_after_provider_response"); }
			}
			if (event.type === "settled") settledObserved = true;
		});
	};

	const createFakeHarness = (): void => {
		const models = createModels();
		const descriptorProvider = deepseekProvider();
		const descriptor = descriptorProvider.getModels().find((model) => model.id === DEEPSEEK_FIXED_PROFILE_V1.model);
		if (!descriptor) throw new Error("fixed DeepSeek descriptor missing");
		registration = fauxProvider({
			api: descriptor.api,
			provider: DEEPSEEK_FIXED_PROFILE_V1.provider,
			models: [{ id: descriptor.id, name: descriptor.name, reasoning: descriptor.reasoning, input: [...descriptor.input], cost: { ...descriptor.cost }, contextWindow: descriptor.contextWindow, maxTokens: descriptor.maxTokens }],
		});
		models.setProvider(registration.provider);
		attach(new AgentHarness({ models, session, model: registration.getModel(), resources: { skills: [options.skill] }, tools: profile.tools, toolContext: profile.context, systemPrompt: SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: options.attemptCaps.wall_time_ms } }));
	};

	const createRealHarness = async (): Promise<void> => {
		if (options.deterministicPausePhase === "before_credential_resolution") throw pause(options.deterministicPausePhase);
		let credential: string;
		try { credential = await options.access.resolveCredential(); } catch { throw pause("credential_resolution_failure_before_dispatch"); }
		options.realCallCounters.credential_reads++;
		try {
			const credentials = new InMemoryCredentialStore();
			await credentials.modify(DEEPSEEK_FIXED_PROFILE_V1.provider, async () => ({ type: "api_key", key: credential }));
			const models = createModels({ credentials });
			const provider = deepseekProvider();
			models.setProvider(provider);
			const model = models.getModel(DEEPSEEK_FIXED_PROFILE_V1.provider, DEEPSEEK_FIXED_PROFILE_V1.model);
			if (!model) throw new Error("fixed DeepSeek model missing");
			attach(new AgentHarness({ models, session, model, resources: { skills: [options.skill] }, tools: profile.tools, toolContext: profile.context, systemPrompt: SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: options.attemptCaps.wall_time_ms } }));
			if (options.deterministicPausePhase === "after_credential_before_provider_request_reservation") throw pause(options.deterministicPausePhase);
		} catch (error) {
			if (error instanceof V1BPauseBoundaryError) throw error;
			throw pause("after_credential_before_provider_request_reservation");
		}
	};

	if (options.mode === "stage1_fake") createFakeHarness();

	return {
		sessionId,
		workspaceId: options.workspaceId,
		async runAttempt(input) {
			if (closed || running) throw new FixedProviderBoundaryErrorV1B();
			running = true; activeAttemptId = input.attemptId; budget.beginAttempt(input.attemptId); currentProviderRequests = 0; currentToolCalls = 0; settledObserved = false; initialDispatch = null; pendingPauseSnapshot = null;
			const started = Date.now();
			try {
				if (!harness) await createRealHarness();
				if (options.deterministicPausePhase === "other_bounded_runtime_failure") throw pause(options.deterministicPausePhase);
				if (options.mode === "stage1_fake") {
					const responses = fakeResponses(input.fakeMode ?? "fail", input.attemptId, input.fakePatch);
					registration!.setResponses(responses.map((response) => (context, requestOptions, _state, requestModel) => {
						if (!initialDispatch) {
							const projection = projectSafeEvidenceV1B(projectActualInitialRequestV1(context, requestOptions, requestModel)) as ReturnType<typeof projectActualInitialRequestV1>;
							const complete = { ...projection, provider_payload: null };
							initialDispatch = { ...complete, payload_sha256: sha256(stableJson(complete)) };
						}
						return response;
					}));
				}
				const response = input.invocation === "skill" ? await harness!.skill(options.skill.name, input.prompt) : await harness!.prompt(input.prompt);
				await harness!.waitForIdle();
				if (!settledObserved || !initialDispatch) throw new Error("Attempt did not produce settled initial dispatch evidence");
				if (registration?.getPendingResponseCount() !== 0) throw new Error("Faux response queue did not drain");
				const duration = Math.max(0, Date.now() - started); budget.finishAttempt(duration);
				const usage = budget.attemptUsage();
				return { settled: true, attempt_id: input.attemptId, final_text: assistantText(response), provider_requests: currentProviderRequests, tool_calls: currentToolCalls, tokens: usage.tokens, cost_usd: usage.cost_usd, wall_time_ms: duration, session_entry_count: (await session.getEntries()).length, initial_dispatch: initialDispatch, reservations: budget.takeReservations() };
			} catch (error) {
				if (error instanceof V1BPauseBoundaryError) throw error;
				if (pendingPauseSnapshot) throw new V1BPauseBoundaryError(pendingPauseSnapshot);
				throw pause(budget.hasPendingProvider() ? "after_provider_request_reservation_usage_unavailable" : "other_bounded_runtime_failure");
			} finally {
				running = false;
			}
		},
		reserveVerifier: () => budget.reserveVerifier(),
		reserveChild: () => budget.reserveChild(),
		takeReservations: () => budget.takeReservations(),
		createPauseSnapshot: (phase) => budget.createPauseSnapshot(phase, { attempt_id: activeAttemptId, session_id: sessionId, workspace_id: options.workspaceId, request_ordinal: currentProviderRequests === 0 ? null : currentProviderRequests }, options.realCallCounters),
		usage: () => ({ run: budget.runUsage(), pilot: budget.pilotUsage() }),
		async close() {
			if (running) throw new FixedProviderBoundaryErrorV1B();
			if (!closed) {
				if (harness) await harness.abort();
				unsubscribe?.(); offProvider?.(); offPayload?.(); offTool?.(); options.access.close(); closed = true;
			}
		},
		debugIdentity: () => ({ harness_instance_id: harnessInstanceId, session_id: sessionId, workspace_id: options.workspaceId, closed }),
	};
}
