import {
	AgentHarness,
	formatSkillInvocation,
	type Session,
	type SessionMetadata,
} from "@earendil-works/pi-agent-core";
import {
	createModels,
	fauxProvider,
	InMemoryCredentialStore,
	type AssistantMessage,
	type FauxResponseStep,
} from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { Goal25ProviderReservationV35, Goal25RuntimeEvidenceV35 } from "../contracts/v35g25-types.ts";
import type { Goal3CaseAuthorityV3, Goal3ProviderProfileV3 } from "../contracts/v3g3-types.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson, treeDigest } from "../hash.ts";
import {
	assertKnownUsageV1B,
	createPublicPiRunCompositionV1B,
	type OneRunProviderAccessV1B,
	type OneRunProviderAuthorityV1B,
} from "../provider/fixed-provider-v1.ts";
import type { FrozenBindingResultV3 } from "../state/binding-v3.ts";
import {
	GOAL3_BUDGET_PROFILE_V3,
	GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3,
	GOAL3_FAUX_PROVIDER_PROFILE_V3,
} from "./runtime-profile-v3.ts";
import { createBoundedToolProfile, readProtectedBytes, type BoundedToolRestrictions } from "./tool-profile.ts";
import { projectActualInitialRequestV1 } from "./pi-adapter-v1.ts";

export const GOAL25_REQUEST_BUDGET_TERMINAL_CODE = "V35_G2_5_PROVIDER_REQUEST_BUDGET_EXHAUSTED";
export const GOAL25_POST_SUCCESS_PROVIDER_REQUEST_CODE = "V35_G2_5_PROVIDER_REQUEST_AFTER_SUCCESSFUL_PUBLIC_TEST";

export class Goal25RequestBudgetTerminal extends Error {
	readonly code = GOAL25_REQUEST_BUDGET_TERMINAL_CODE;
	readonly requestAttempt: number;

	constructor(requestAttempt: number) {
		super(`${GOAL25_REQUEST_BUDGET_TERMINAL_CODE}: request attempt ${requestAttempt} refused before dispatch`);
		this.name = "Goal25RequestBudgetTerminal";
		this.requestAttempt = requestAttempt;
	}
}

export class Goal25PostSuccessProviderRequest extends Error {
	readonly code = GOAL25_POST_SUCCESS_PROVIDER_REQUEST_CODE;
	readonly requestAttempt: number;

	constructor(requestAttempt: number) {
		super(`${GOAL25_POST_SUCCESS_PROVIDER_REQUEST_CODE}: request attempt ${requestAttempt} refused before dispatch`);
		this.name = "Goal25PostSuccessProviderRequest";
		this.requestAttempt = requestAttempt;
	}
}

export interface Goal25AccessCountersV35 {
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
}

export interface Goal25ExecutionOptionsV35 {
	runRoot: string;
	runId: string;
	workspaceRoot: string;
	taskPrompt: string;
	taskPolicy: BoundedTaskPolicy;
	frozen: FrozenBindingResultV3;
	caseAuthority: Goal3CaseAuthorityV3;
	executionSession: Session<SessionMetadata>;
	toolRestrictions: BoundedToolRestrictions;
	beforeProviderPayload?: (payload: unknown) => void;
}

export interface Goal25ExecutionPortV35 {
	readonly profile: Goal3ProviderProfileV3;
	readonly accessCounters: Goal25AccessCountersV35;
	execute(options: Goal25ExecutionOptionsV35): Promise<Goal25RuntimeEvidenceV35>;
	close(): Promise<void>;
}

interface RuntimeStateV35 extends Goal25AccessCountersV35 {
	requestAttempts: number;
	providerDispatches: number;
	providerResponses: number;
	inputTokens: number;
	outputTokens: number;
	costUsd: number;
	pendingToolCalls: number;
	toolCallAttempts: number;
	terminatingPublicTestResults: number;
	providerRequestAfterSuccessfulPublicTest: boolean;
	rawSettledEvents: number;
	localBudgetStop: boolean;
	secondaryAccountingErrors: string[];
	reservations: Goal25ProviderReservationV35[];
	toolInterfaceSha256: string | null;
}

function runtimeBody(runtime: Goal25RuntimeEvidenceV35): Omit<Goal25RuntimeEvidenceV35, "runtime_digest"> {
	const { runtime_digest: _digest, ...body } = runtime;
	return body;
}

function expectedUserText(options: Goal25ExecutionOptionsV35): string {
	if (options.frozen.adaptiveSkill === null) return options.taskPrompt;
	return `${formatSkillInvocation(options.frozen.adaptiveSkill)}\n\n${options.taskPrompt}`;
}

function isSyntheticBudgetStop(message: AssistantMessage, state: RuntimeStateV35): boolean {
	return state.localBudgetStop && message.stopReason === "error" && message.errorMessage?.includes(GOAL25_REQUEST_BUDGET_TERMINAL_CODE) === true;
}

function isPostSuccessProviderGuard(message: AssistantMessage, state: RuntimeStateV35): boolean {
	return state.providerRequestAfterSuccessfulPublicTest && message.stopReason === "error" && message.errorMessage?.includes(GOAL25_POST_SUCCESS_PROVIDER_REQUEST_CODE) === true;
}

async function runTerminationSafeHarness(options: Goal25ExecutionOptionsV35 & {
	profile: Goal3ProviderProfileV3;
	models: ReturnType<typeof createModels>;
	model: NonNullable<ReturnType<ReturnType<typeof createModels>["getModel"]>>;
	state: RuntimeStateV35;
	onRealDispatch?: () => void;
}): Promise<Goal25RuntimeEvidenceV35> {
	if (
		stableJson(options.caseAuthority.provider_profile) !== stableJson(options.profile) ||
		options.frozen.binding.case_authority_digest !== options.caseAuthority.authority_digest
	) throw new Error("Goal 2.5 execution port is not authorized by frozen Case Authority");
	const profile = createBoundedToolProfile(options.workspaceRoot, options.taskPolicy, options.toolRestrictions);
	const session = options.executionSession;
	const harness = new AgentHarness({
		models: options.models,
		session,
		model: options.model,
		resources: { skills: options.frozen.adaptiveSkill === null ? [] : [options.frozen.adaptiveSkill] },
		tools: profile.tools,
		toolContext: profile.context,
		systemPrompt: options.frozen.composedPrompt,
		thinkingLevel: "off",
		streamOptions: { maxRetries: 0, timeoutMs: GOAL3_BUDGET_PROFILE_V3.wall_time_ms_max },
	});
	let pendingReservation: Goal25ProviderReservationV35 | null = null;
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "settled") options.state.rawSettledEvents++;
		if (event.type === "tool_execution_start") options.state.pendingToolCalls++;
		if (event.type === "tool_execution_end") {
			options.state.pendingToolCalls--;
			if (event.toolName === "run_command" && event.result && typeof event.result === "object" && (event.result as { terminate?: unknown }).terminate === true) options.state.terminatingPublicTestResults++;
		}
		if (event.type !== "message_end" || event.message.role !== "assistant") return;
		const message = event.message as AssistantMessage;
		if (isSyntheticBudgetStop(message, options.state) || isPostSuccessProviderGuard(message, options.state)) return;
		if (pendingReservation === null) {
			options.state.secondaryAccountingErrors.push("assistant Provider response had no active reservation");
			return;
		}
		try {
			const known = assertKnownUsageV1B({
				input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite,
				output_tokens: message.usage.output,
				cost_usd: message.usage.cost.total,
			});
			const reservedTokens = GOAL3_BUDGET_PROFILE_V3.token_limit - options.state.inputTokens - options.state.outputTokens;
			const reservedCost = GOAL3_BUDGET_PROFILE_V3.cost_usd_max - options.state.costUsd;
			if (known.tokens > reservedTokens || known.cost_usd > reservedCost + Number.EPSILON) throw new Error("Provider usage exceeded its pre-dispatch reservation");
			pendingReservation.state = "responded";
			pendingReservation.input_tokens = message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
			pendingReservation.output_tokens = message.usage.output;
			pendingReservation.cost_usd = known.cost_usd;
			options.state.inputTokens += pendingReservation.input_tokens;
			options.state.outputTokens += pendingReservation.output_tokens;
			options.state.costUsd += known.cost_usd;
			options.state.providerResponses++;
		} catch (error) {
			options.state.secondaryAccountingErrors.push(error instanceof Error ? error.message : String(error));
		} finally {
			pendingReservation = null;
		}
	});
	const offRequest = harness.on("before_provider_request", () => {
		options.state.requestAttempts++;
		if (pendingReservation !== null) throw new Error("Goal 2.5 concurrent Provider reservation rejected");
		if (options.state.terminatingPublicTestResults > 0) {
			options.state.providerRequestAfterSuccessfulPublicTest = true;
			throw new Goal25PostSuccessProviderRequest(options.state.requestAttempts);
		}
		if (options.state.requestAttempts > GOAL3_BUDGET_PROFILE_V3.provider_requests_max) {
			options.state.localBudgetStop = true;
			throw new Goal25RequestBudgetTerminal(options.state.requestAttempts);
		}
		if (
			GOAL3_BUDGET_PROFILE_V3.token_limit - options.state.inputTokens - options.state.outputTokens <= 0 ||
			GOAL3_BUDGET_PROFILE_V3.cost_usd_max - options.state.costUsd <= 0
		) throw new Error("Goal 2.5 Provider token/cost reservation unavailable");
		options.state.providerDispatches++;
		pendingReservation = {
			request_attempt: options.state.requestAttempts,
			dispatch_ordinal: options.state.providerDispatches,
			state: "reserved",
			input_tokens: null,
			output_tokens: null,
			cost_usd: null,
		};
		options.state.reservations.push(pendingReservation);
		options.onRealDispatch?.();
		return undefined;
	});
	const offPayload = harness.on("before_provider_payload", (event) => {
		if (options.state.toolInterfaceSha256 === null) {
			const payload = event.payload as { tools?: unknown };
			options.state.toolInterfaceSha256 = digestObject(payload.tools ?? null);
		}
		options.beforeProviderPayload?.(event.payload);
		return { payload: event.payload };
	});
	const offTool = harness.on("tool_call", () => {
		if (++options.state.toolCallAttempts > GOAL3_BUDGET_PROFILE_V3.tool_calls_max) throw new Error("Goal 2.5 Tool-call budget exceeded");
		return undefined;
	});
	try {
		if (options.frozen.adaptiveSkill) await harness.skill(options.frozen.adaptiveSkill.name, options.taskPrompt);
		else await harness.prompt(options.taskPrompt);
		await harness.waitForIdle();
	} finally {
		unsubscribe();
		offRequest();
		offPayload();
		offTool();
		await harness.abort();
	}
	const publicTest = profile.commandExecutions.findLast((execution) => execution.command_id === "public_test");
	const publicTestSucceeded = publicTest?.exit_code === 0 && publicTest.timed_out === false;
	const publicTestTerminated = publicTestSucceeded && options.state.terminatingPublicTestResults === 1 && !options.state.providerRequestAfterSuccessfulPublicTest;
	const trajectory = options.state.providerRequestAfterSuccessfulPublicTest ? "invalid" : options.state.localBudgetStop ? "pre_dispatch_budget_terminal" : publicTestTerminated ? "settled" : "invalid";
	const pendingProviderReservations = options.state.reservations.filter((reservation) => reservation.state !== "responded").length;
	if (options.state.secondaryAccountingErrors.length > 0) throw new Error(`Goal 2.5 usage accounting invalid: ${options.state.secondaryAccountingErrors.join("; ")}`);
	if (options.state.pendingToolCalls !== 0 || profile.pendingSideEffects() !== 0) throw new Error("Goal 2.5 Tool or side-effect state is not quiescent");
	if (trajectory === "pre_dispatch_budget_terminal" && (options.state.requestAttempts !== 17 || options.state.providerDispatches !== 16 || pendingProviderReservations !== 0)) throw new Error("Goal 2.5 pre-dispatch budget terminal counters invalid");
	if (trajectory === "settled" && (options.state.rawSettledEvents !== 1 || !publicTestSucceeded)) throw new Error("Goal 2.5 successful check did not settle exactly once");
	if (options.state.toolInterfaceSha256 === null) throw new Error("Goal 2.5 actual Tool interface projection was not captured");
	const metadata = await session.getMetadata();
	const body: Omit<Goal25RuntimeEvidenceV35, "runtime_digest"> = {
		schema_version: 1,
		run_id: options.runId,
		session_id: metadata.id,
		trajectory_outcome: trajectory,
		task_outcome: null,
		terminal_reason: trajectory === "settled" ? "successful_public_test" : trajectory === "pre_dispatch_budget_terminal" ? "provider_request_budget_exhausted" : "invalid",
		request_attempts: options.state.requestAttempts,
		provider_dispatches: options.state.providerDispatches,
		provider_responses: options.state.providerResponses,
		pending_provider_reservations: pendingProviderReservations,
		pending_tool_calls: options.state.pendingToolCalls,
		pending_side_effects: profile.pendingSideEffects(),
		raw_harness_settled_events: options.state.rawSettledEvents,
		public_test_succeeded: publicTestSucceeded,
		public_test_terminated: publicTestTerminated,
		provider_request_after_successful_public_test: options.state.providerRequestAfterSuccessfulPublicTest,
		usage_known: options.state.reservations.every((reservation) => reservation.state === "responded" && reservation.input_tokens !== null && reservation.output_tokens !== null && reservation.cost_usd !== null),
		workspace_tree_sha256_at_terminal: treeDigest(options.workspaceRoot),
		protected_bytes_sha256_at_terminal: digestObject(readProtectedBytes(options.workspaceRoot, options.taskPolicy)),
		input_tokens: options.state.inputTokens,
		output_tokens: options.state.outputTokens,
		cost_usd: options.state.costUsd,
		tool_calls: profile.auditEvents.filter((event) => event.type === "start").length,
		credential_reads: options.state.credential_reads,
		network_calls: options.state.network_calls,
		external_provider_calls: options.state.external_provider_calls,
		real_model_calls: options.state.real_model_calls,
		tool_interface_sha256: options.state.toolInterfaceSha256,
		reservations: structuredClone(options.state.reservations),
	};
	const runtime = { ...body, runtime_digest: digestObject(body) };
	writeOnceJson(options.runRoot, "runtime-v35g25.json", runtime);
	if (runtime.runtime_digest !== digestObject(runtimeBody(runtime))) throw new Error("Goal 2.5 runtime evidence identity failure");
	if (sha256(expectedUserText(options)).length !== 64) throw new Error("Goal 2.5 expected user text identity failure");
	return runtime;
}

export function createGoal25FauxExecutionPortV35(responses: readonly FauxResponseStep[]): Goal25ExecutionPortV35 {
	const accessCounters: Goal25AccessCountersV35 = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	return Object.freeze({
		profile: GOAL3_FAUX_PROVIDER_PROFILE_V3,
		accessCounters,
		async execute(options: Goal25ExecutionOptionsV35): Promise<Goal25RuntimeEvidenceV35> {
			const models = createModels();
			const registration = fauxProvider({
				api: GOAL3_FAUX_PROVIDER_PROFILE_V3.api,
				provider: GOAL3_FAUX_PROVIDER_PROFILE_V3.provider_id,
				models: [{
					id: GOAL3_FAUX_PROVIDER_PROFILE_V3.model_id,
					name: "V3.5-G2.5 Frozen Faux Model",
					reasoning: false,
					input: ["text", "image"],
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
					contextWindow: 128_000,
					maxTokens: 16_384,
				}],
			});
			models.setProvider(registration.provider);
			registration.setResponses(responses.map((response) => async (context, requestOptions, providerState, model) => {
				const projection = projectActualInitialRequestV1(context, requestOptions, model);
				const payload = {
					model: projection.model.id,
					messages: [
						...(projection.context.systemPrompt ? [{ role: "system", content: projection.context.systemPrompt }] : []),
						...projection.context.messages,
					],
					tools: projection.context.tools,
					stream: true,
				};
				await requestOptions?.onPayload?.(payload, model);
				return typeof response === "function" ? await response(context, requestOptions, providerState, model) : response;
			}));
			const state: RuntimeStateV35 = {
				...accessCounters,
				requestAttempts: 0,
				providerDispatches: 0,
				providerResponses: 0,
				inputTokens: 0,
				outputTokens: 0,
				costUsd: 0,
				pendingToolCalls: 0,
				toolCallAttempts: 0,
				terminatingPublicTestResults: 0,
				providerRequestAfterSuccessfulPublicTest: false,
				rawSettledEvents: 0,
				localBudgetStop: false,
				secondaryAccountingErrors: [],
				reservations: [],
				toolInterfaceSha256: null,
			};
			const runtime = await runTerminationSafeHarness({ ...options, profile: GOAL3_FAUX_PROVIDER_PROFILE_V3, models, model: registration.getModel(), state });
			if (registration.state.callCount !== runtime.provider_dispatches) throw new Error("Goal 2.5 Faux dispatch count mismatch");
			return runtime;
		},
		async close(): Promise<void> {},
	});
}

export function createGoal25DeepSeekExecutionPortV35(options: {
	authority: OneRunProviderAuthorityV1B;
	accessCounters: Goal25AccessCountersV35;
}): Goal25ExecutionPortV35 {
	return createPublicPiRunCompositionV1B<Goal25ExecutionPortV35>({
		authority: options.authority,
		factory: {
			create: (access: OneRunProviderAccessV1B) => {
				let closed = false;
				let consumed = false;
				return Object.freeze({
					profile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3,
					accessCounters: options.accessCounters,
					async execute(input: Goal25ExecutionOptionsV35): Promise<Goal25RuntimeEvidenceV35> {
						if (closed || consumed) throw new Error("Goal 2.5 real execution authority unavailable");
						if (
							stableJson(input.caseAuthority.provider_profile) !== stableJson(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3) ||
							input.frozen.binding.case_authority_digest !== input.caseAuthority.authority_digest
						) throw new Error("Goal 2.5 real execution input is not authorized by frozen Case Authority");
						consumed = true;
						options.accessCounters.credential_reads++;
						const credential = await access.resolveCredential();
						const credentials = new InMemoryCredentialStore();
						await credentials.modify(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, async () => ({ type: "api_key", key: credential }));
						const models = createModels({ credentials });
						models.setProvider(deepseekProvider());
						const model = models.getModel(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id);
						if (!model) throw new Error("Goal 2.5 fixed DeepSeek model unavailable");
						const state: RuntimeStateV35 = {
							...options.accessCounters,
							requestAttempts: 0,
							providerDispatches: 0,
							providerResponses: 0,
							inputTokens: 0,
							outputTokens: 0,
							costUsd: 0,
							pendingToolCalls: 0,
							toolCallAttempts: 0,
							terminatingPublicTestResults: 0,
							providerRequestAfterSuccessfulPublicTest: false,
							rawSettledEvents: 0,
							localBudgetStop: false,
							secondaryAccountingErrors: [],
							reservations: [],
							toolInterfaceSha256: null,
						};
						return await runTerminationSafeHarness({
							...input,
							profile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3,
							models,
							model,
							state,
							onRealDispatch: () => {
								state.network_calls++;
								state.external_provider_calls++;
								state.real_model_calls++;
								options.accessCounters.network_calls++;
								options.accessCounters.external_provider_calls++;
								options.accessCounters.real_model_calls++;
							},
						});
					},
					async close(): Promise<void> {
						if (!closed) {
							closed = true;
							access.close();
						}
					},
				});
			},
		},
	});
}
