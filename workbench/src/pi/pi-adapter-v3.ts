import { AgentHarness, formatSkillInvocation, InMemorySessionStorage, Session } from "@earendil-works/pi-agent-core";
import { InMemoryCredentialStore, createModels, fauxAssistantMessage, fauxProvider, type AssistantMessage } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { DirectPiRuntimeEvidenceV3, Goal3CaseAuthorityV3, Goal3ProviderProfileV3 } from "../contracts/v3g3-types.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { assertKnownUsageV1B, createPublicPiRunCompositionV1B, type OneRunProviderAccessV1B, type OneRunProviderAuthorityV1B } from "../provider/fixed-provider-v1.ts";
import { projectActualInitialRequestV1, serializeInitialRequestV1, type ModelVisibleProjectionV1 } from "./pi-adapter-v1.ts";
import { GOAL3_BUDGET_PROFILE_V3, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, goal3ToolProfileDigestV3 } from "./runtime-profile-v3.ts";
import { createBoundedToolProfile } from "./tool-profile.ts";
import type { FrozenBindingResultV3 } from "../state/binding-v3.ts";

export interface Goal3RealAccessCountersV3 {
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
}

export interface Goal3ExecutionPortV3 {
	readonly profile: Goal3ProviderProfileV3;
	execute(options: BoundExecutionOptionsV3): Promise<DirectPiRuntimeEvidenceV3>;
	close(): Promise<void>;
}

interface BoundExecutionOptionsV3 {
	runRoot: string;
	runId: string;
	workspaceRoot: string;
	taskPrompt: string;
	taskPolicy: BoundedTaskPolicy;
	frozen: FrozenBindingResultV3;
	caseAuthority: Goal3CaseAuthorityV3;
}

interface RuntimeCountersV3 extends Goal3RealAccessCountersV3 {
	dispatch_attempts: number;
	provider_dispatches: number;
	provider_requests: number;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
}

function runtimeBody(runtime: DirectPiRuntimeEvidenceV3): Omit<DirectPiRuntimeEvidenceV3, "runtime_digest"> {
	const { runtime_digest: _digest, ...body } = runtime;
	return body;
}

function lastUserText(projection: ModelVisibleProjectionV1): string {
	const message = (projection.context.messages as Array<{ role?: string; content?: unknown }>).findLast((entry) => entry.role === "user");
	if (!message) throw new Error("Direct Pi user message missing");
	if (typeof message.content === "string") return message.content;
	if (!Array.isArray(message.content)) throw new Error("Direct Pi user content invalid");
	return message.content.flatMap((part) => part && typeof part === "object" && (part as { type?: string }).type === "text" ? [String((part as { text?: string }).text ?? "")] : []).join("");
}

function expectedInvocation(options: BoundExecutionOptionsV3): { runtimePath: DirectPiRuntimeEvidenceV3["runtime_path"]; wrapper: string | null; userText: string } {
	const wrapper = options.frozen.adaptiveSkill === null ? null : formatSkillInvocation(options.frozen.adaptiveSkill);
	return {
		runtimePath: options.frozen.adaptiveSkill !== null ? "adaptive_skill" : options.frozen.binding.bound_entries.some((entry) => entry.kind === "prompt_addendum") ? "prompt_addendum" : "unbound_prompt",
		wrapper,
		userText: wrapper === null ? options.taskPrompt : `${wrapper}\n\n${options.taskPrompt}`,
	};
}

async function runHarnessV3(options: BoundExecutionOptionsV3 & {
	profile: Goal3ProviderProfileV3;
	models: ReturnType<typeof createModels>;
	model: NonNullable<ReturnType<ReturnType<typeof createModels>["getModel"]>>;
	counters: RuntimeCountersV3;
	capturedProjection: () => ModelVisibleProjectionV1 | null;
	onRealDispatch?: () => void;
}): Promise<DirectPiRuntimeEvidenceV3> {
	if (stableJson(options.caseAuthority.provider_profile) !== stableJson(options.profile) || options.frozen.binding.case_authority_digest !== options.caseAuthority.authority_digest) throw new Error("Direct Pi execution port is not authorized by frozen Case Authority");
	const storage = new InMemorySessionStorage(); const session = new Session(storage);
	const profile = createBoundedToolProfile(options.workspaceRoot, options.taskPolicy);
	const skills = options.frozen.adaptiveSkill === null ? [] : [options.frozen.adaptiveSkill];
	const harness = new AgentHarness({ models: options.models, session, model: options.model, resources: { skills }, tools: profile.tools, toolContext: profile.context, systemPrompt: options.frozen.composedPrompt, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: GOAL3_BUDGET_PROFILE_V3.wall_time_ms_max } });
	let settled = 0; let payloadDigest = sha256("no-provider-payload"); let toolCalls = 0;
	let pendingBudget: { tokens: number; cost_usd: number } | null = null;
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "settled") settled++;
		if (event.type === "message_end" && event.message.role === "assistant") {
			const message = event.message as AssistantMessage;
			const known = assertKnownUsageV1B({ input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite, output_tokens: message.usage.output, cost_usd: message.usage.cost.total });
			if (!pendingBudget || known.tokens > pendingBudget.tokens || known.cost_usd > pendingBudget.cost_usd + Number.EPSILON) throw new Error("Goal 3 Provider usage exceeded its pre-dispatch reservation");
			options.counters.input_tokens += message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
			options.counters.output_tokens += message.usage.output;
			options.counters.cost_usd += known.cost_usd;
			pendingBudget = null;
		}
	});
	const offRequest = harness.on("before_provider_request", () => {
		if (pendingBudget) throw new Error("Goal 3 concurrent Provider reservation rejected");
		if (++options.counters.provider_requests > GOAL3_BUDGET_PROFILE_V3.provider_requests_max) throw new Error("Goal 3 provider request budget exceeded");
		const remainingTokens = GOAL3_BUDGET_PROFILE_V3.token_limit - options.counters.input_tokens - options.counters.output_tokens;
		const remainingCost = GOAL3_BUDGET_PROFILE_V3.cost_usd_max - options.counters.cost_usd;
		if (remainingTokens <= 0 || remainingCost <= 0) throw new Error("Goal 3 Provider token/cost reservation unavailable");
		pendingBudget = { tokens: remainingTokens, cost_usd: remainingCost };
		options.counters.provider_dispatches++;
		if (options.profile.provider_kind === "deepseek_real") {
			options.counters.network_calls++;
			options.counters.external_provider_calls++;
			options.counters.real_model_calls++;
			options.onRealDispatch?.();
		}
		return undefined;
	});
	const offPayload = harness.on("before_provider_payload", (event) => {
		payloadDigest = sha256(stableJson(event.payload));
		return { payload: event.payload };
	});
	const offTool = harness.on("tool_call", () => { if (++toolCalls > GOAL3_BUDGET_PROFILE_V3.tool_calls_max) throw new Error("Goal 3 Tool-call budget exceeded"); return undefined; });
	options.counters.dispatch_attempts++;
	try {
		if (options.frozen.adaptiveSkill) await harness.skill(options.frozen.adaptiveSkill.name, options.taskPrompt);
		else await harness.prompt(options.taskPrompt);
		await harness.waitForIdle();
	} finally {
		unsubscribe(); offRequest(); offPayload(); offTool(); await harness.abort();
	}
	if (settled !== 1 || pendingBudget !== null) throw new Error("Direct Pi run did not settle with reconciled usage exactly once");
	if (options.counters.input_tokens + options.counters.output_tokens > GOAL3_BUDGET_PROFILE_V3.token_limit || options.counters.cost_usd > GOAL3_BUDGET_PROFILE_V3.cost_usd_max || profile.auditEvents.filter((entry) => entry.type === "start").length > GOAL3_BUDGET_PROFILE_V3.tool_calls_max) throw new Error("Goal 3 fixed execution budget exceeded");
	const invocation = expectedInvocation(options);
	const captured = options.capturedProjection();
	if (captured && (captured.context.systemPrompt !== options.frozen.composedPrompt || lastUserText(captured) !== invocation.userText)) throw new Error("Direct Pi frozen treatment payload drift");
	const body: Omit<DirectPiRuntimeEvidenceV3, "runtime_digest"> = {
		schema_version: 1,
		run_id: options.runId,
		binding_digest: options.frozen.binding.binding_digest,
		case_authority_digest: options.caseAuthority.authority_digest,
		runtime_path: invocation.runtimePath,
		session_id: (await storage.getMetadata()).id,
		settled_events: settled,
		provider_kind: options.profile.provider_kind,
		provider_id: options.profile.provider_id,
		model_id: options.profile.model_id,
		provider_profile_digest: options.profile.profile_digest,
		dispatch_attempts: options.counters.dispatch_attempts,
		provider_dispatches: options.counters.provider_dispatches,
		credential_reads: options.counters.credential_reads,
		network_calls: options.counters.network_calls,
		external_provider_calls: options.counters.external_provider_calls,
		real_model_calls: options.counters.real_model_calls,
		provider_requests: options.counters.provider_requests,
		input_tokens: options.counters.input_tokens,
		output_tokens: options.counters.output_tokens,
		cost_usd: options.counters.cost_usd,
		tool_calls: profile.auditEvents.filter((entry) => entry.type === "start").length,
		tool_profile_digest: goal3ToolProfileDigestV3(options.taskPolicy),
		task_prompt_sha256: sha256(options.taskPrompt),
		observed_system_prompt_sha256: sha256(options.frozen.composedPrompt),
		observed_user_message_sha256: sha256(invocation.userText),
		observed_skill_wrapper_sha256: invocation.wrapper === null ? null : sha256(invocation.wrapper),
		model_payload_sha256: captured ? sha256(serializeInitialRequestV1(captured)) : payloadDigest,
	};
	const runtime = { ...body, runtime_digest: digestObject(body) };
	writeOnceJson(options.runRoot, "runtime.json", runtime);
	if (runtime.runtime_digest !== digestObject(runtimeBody(runtime))) throw new Error("runtime evidence identity failure");
	return runtime;
}

export function createGoal3FauxExecutionPortV3(): Goal3ExecutionPortV3 {
	return Object.freeze({
		profile: GOAL3_FAUX_PROVIDER_PROFILE_V3,
		async execute(options: BoundExecutionOptionsV3): Promise<DirectPiRuntimeEvidenceV3> {
			const models = createModels();
			const registration = fauxProvider({ api: GOAL3_FAUX_PROVIDER_PROFILE_V3.api, provider: GOAL3_FAUX_PROVIDER_PROFILE_V3.provider_id, models: [{ id: GOAL3_FAUX_PROVIDER_PROFILE_V3.model_id, name: "V3-G3 Frozen Faux Model", reasoning: false, input: ["text", "image"], cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128_000, maxTokens: 16_384 }] });
			models.setProvider(registration.provider);
			let captured: ModelVisibleProjectionV1 | null = null;
			registration.setResponses([(context, requestOptions, _state, model) => { captured = projectActualInitialRequestV1(context, requestOptions, model); return fauxAssistantMessage("V3-G3 deterministic run settled", { timestamp: 1 }); }]);
			const counters: RuntimeCountersV3 = { dispatch_attempts: 0, provider_dispatches: 0, credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 };
			const runtime = await runHarnessV3({ ...options, profile: GOAL3_FAUX_PROVIDER_PROFILE_V3, models, model: registration.getModel(), counters, capturedProjection: () => captured });
			if (registration.state.callCount !== 1 || registration.getPendingResponseCount() !== 0) throw new Error("Direct Pi Faux provider did not dispatch exactly once");
			return runtime;
		},
		async close(): Promise<void> {},
	});
}

export function createGoal3DeepSeekExecutionPortV3(options: { authority: OneRunProviderAuthorityV1B; counters: Goal3RealAccessCountersV3 }): Goal3ExecutionPortV3 {
	return createPublicPiRunCompositionV1B<Goal3ExecutionPortV3>({
		authority: options.authority,
		factory: { create: (access: OneRunProviderAccessV1B) => {
			let closed = false; let consumed = false;
			return Object.freeze({
				profile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3,
				async execute(input: BoundExecutionOptionsV3): Promise<DirectPiRuntimeEvidenceV3> {
					if (closed || consumed) throw new Error("Goal 3 real execution authority unavailable"); consumed = true;
					options.counters.credential_reads++; const credential = await access.resolveCredential();
					const credentials = new InMemoryCredentialStore(); await credentials.modify(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, async () => ({ type: "api_key", key: credential }));
					const models = createModels({ credentials }); models.setProvider(deepseekProvider());
					const model = models.getModel(GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_id, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id); if (!model) throw new Error("Goal 3 fixed DeepSeek model unavailable");
					const counters: RuntimeCountersV3 = { dispatch_attempts: 0, provider_dispatches: 0, provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, ...options.counters };
					const runtime = await runHarnessV3({ ...input, profile: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3, models, model, counters, capturedProjection: () => null, onRealDispatch: () => { options.counters.network_calls++; options.counters.external_provider_calls++; options.counters.real_model_calls++; } });
					return runtime;
				},
				async close(): Promise<void> { if (!closed) { closed = true; access.close(); } },
			});
		} },
	});
}

export async function executeBoundDirectPiV3(options: BoundExecutionOptionsV3 & { executionPort?: Goal3ExecutionPortV3 }): Promise<DirectPiRuntimeEvidenceV3> {
	const port = options.executionPort ?? createGoal3FauxExecutionPortV3();
	return await port.execute(options);
}
