import { AgentHarness, InMemorySessionStorage, Session, type Skill } from "@earendil-works/pi-agent-core";
import { createModels, fauxAssistantMessage, fauxProvider, type Context } from "@earendil-works/pi-ai";
import type { StrategyIdV1, TaskSpecV1, VerifierStatusV1 } from "../contracts/v1-types.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import { decideV1Intervention } from "../completion/controller-v1.ts";
import { createBoundedToolProfile } from "./tool-profile.ts";
import { runMeasurementVerifierV1 } from "../experiment/task-pack-v1.ts";

export const INITIAL_BUDGET_V1 = Object.freeze({ provider_request_limit: 16, tool_call_limit: 24, token_limit: 131_072, wall_time_limit_ms: 900_000, verifier_limit: 1, cost_limit_usd: 0.20 });
export interface ModelVisibleProjectionV1 { systemPrompt: string | null; messages: unknown[]; tools: unknown[]; }
export interface TreatmentProbeV1 {
	strategy_id: StrategyIdV1; initial_provider_requests: 1; initial_turns: 1; preload_turns: 0; child_attempts: 0 | 1; verifier_runs: 1 | 2;
	session_id: string; initial_model_projection: ModelVisibleProjectionV1; initial_model_payload: string; initial_model_payload_sha256: string;
	host_identity_leak: false; external_provider_calls: 0; faux_provider_calls: number; cost_usd: 0; measurement_verifier_id: "v1_measurement_verifier";
	initial_verifier_status: VerifierStatusV1; final_verifier_status: VerifierStatusV1; event_order: string[];
}

function reasoningSafe(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(reasoningSafe);
	if (!value || typeof value !== "object") return value;
	const entries: Array<[string, unknown]> = [];
	for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
		if (["thinking", "reasoning", "signature", "usage", "timestamp"].includes(key) || typeof child === "function" || child === undefined) continue;
		entries.push([key, reasoningSafe(child)]);
	}
	return Object.fromEntries(entries);
}
export function projectActualModelContextV1(context: Context): ModelVisibleProjectionV1 {
	return { systemPrompt: context.systemPrompt ?? null, messages: reasoningSafe(context.messages) as unknown[], tools: reasoningSafe(context.tools ?? []) as unknown[] };
}
function lastUserText(projection: ModelVisibleProjectionV1): string {
	const messages = projection.messages as Array<{ role?: string; content?: unknown }>; const message = messages.findLast((entry) => entry.role === "user");
	if (!message) throw new Error("model-visible user message absent"); if (typeof message.content === "string") return message.content;
	if (!Array.isArray(message.content)) throw new Error("unexpected model-visible user content");
	return message.content.flatMap((part) => part && typeof part === "object" && (part as { type?: string }).type === "text" ? [String((part as { text?: string }).text ?? "")] : []).join("");
}
function normalizedInitial(probe: TreatmentProbeV1, expectedText: string): string {
	const cloned = structuredClone(probe.initial_model_projection); const messages = cloned.messages as Array<{ role?: string; content?: unknown }>;
	const user = messages.findLast((entry) => entry.role === "user"); if (!user || lastUserText(cloned) !== expectedText) throw new Error("actual model-visible treatment text mismatch");
	if (typeof user.content === "string") user.content = "<V1_TREATMENT_TEXT>";
	else user.content = (user.content as Array<Record<string, unknown>>).map((part) => part.type === "text" ? { ...part, text: "<V1_TREATMENT_TEXT>" } : part);
	return stableJson(cloned);
}

export async function runTreatmentProbeV1(options: { projectRoot: string; workspaceRoot: string; strategyId: StrategyIdV1; taskPrompt: string; taskSpec: TaskSpecV1; skill: Skill; evidenceValid?: boolean; budgetAvailable?: boolean }): Promise<TreatmentProbeV1> {
	const models = createModels(); const registration = fauxProvider({ provider: `v1a-faux-${options.strategyId}-${Date.now()}-${Math.random()}` }); models.setProvider(registration.provider);
	const captured: ModelVisibleProjectionV1[] = []; const eventOrder: string[] = []; let phase: "initial" | "child" = "initial"; const settled = { count: 0 };
	registration.setResponses([(context) => { captured.push(projectActualModelContextV1(context)); return fauxAssistantMessage("initial settled", { timestamp: 1 }); }]);
	const storage = new InMemorySessionStorage(); const session = new Session(storage); const profile = createBoundedToolProfile(options.workspaceRoot, options.taskSpec);
	const harness = new AgentHarness({ models, session, model: registration.getModel(), resources: { skills: [options.skill] }, tools: profile.tools, toolContext: profile.context, systemPrompt: SYSTEM_PROMPT, thinkingLevel: "off" });
	const unsubscribe = harness.subscribe((event) => { if (event.type === "settled") { settled.count++; eventOrder.push(phase === "initial" ? "initial_attempt_settled" : "child_attempt_settled"); } });
	const settledCount = (): number => settled.count; const providerCallCount = (): number => registration.state.callCount;
	try {
		if (options.strategyId === "baseline") await harness.prompt(options.taskPrompt); else await harness.skill(options.skill.name, options.taskPrompt);
		await harness.waitForIdle(); if (settledCount() !== 1 || captured.length !== 1 || providerCallCount() !== 1) throw new Error("initial invocation must settle with exactly one actual Faux request");
		eventOrder.push("measurement_verifier_1_started"); const initial = await runMeasurementVerifierV1({ projectRoot: options.projectRoot, workspaceRoot: options.workspaceRoot, task: options.taskSpec, attemptId: `${options.strategyId}-initial` }); eventOrder.push("measurement_verifier_1_completed");
		let finalStatus = initial.status as VerifierStatusV1; let verifierRuns: 1 | 2 = 1; let childAttempts: 0 | 1 = 0;
		const decision = decideV1Intervention({ strategy_id: options.strategyId, verifier_status: initial.status as VerifierStatusV1, evidence_valid: options.evidenceValid ?? true, budget_available: options.budgetAvailable ?? true, is_child: false, child_attempt_count: 0 });
		if (decision.decision === "create_child") {
			phase = "child"; registration.setResponses([(context) => { captured.push(projectActualModelContextV1(context)); return fauxAssistantMessage("child settled", { timestamp: 2 }); }]);
			await harness.prompt("External verifier failed. Repair the same task, run its public check, then finish."); await harness.waitForIdle();
			if (settledCount() !== 2 || providerCallCount() !== 2) throw new Error("C child did not settle exactly once in the same Session");
			eventOrder.push("measurement_verifier_2_started"); const child = await runMeasurementVerifierV1({ projectRoot: options.projectRoot, workspaceRoot: options.workspaceRoot, task: options.taskSpec, attemptId: `${options.strategyId}-child` }); eventOrder.push("measurement_verifier_2_completed"); finalStatus = child.status as VerifierStatusV1; verifierRuns = 2; childAttempts = 1;
		}
		if (registration.getPendingResponseCount() !== 0) throw new Error("Faux response queue did not drain");
		const initialProjection = captured[0]!; const initialPayload = stableJson(initialProjection); const forbidden = /(?:strategy_id|experiment_id|manifest_id|recovery_budget|policy_id|verifier_source|verifier_host)/i;
		if (forbidden.test(initialPayload)) throw new Error("hidden host/verifier identity leaked into actual model context");
		return { strategy_id: options.strategyId, initial_provider_requests: 1, initial_turns: 1, preload_turns: 0, child_attempts: childAttempts, verifier_runs: verifierRuns,
			session_id: (await storage.getMetadata()).id, initial_model_projection: initialProjection, initial_model_payload: initialPayload, initial_model_payload_sha256: sha256(initialPayload), host_identity_leak: false,
			external_provider_calls: 0, faux_provider_calls: registration.state.callCount, cost_usd: 0, measurement_verifier_id: "v1_measurement_verifier", initial_verifier_status: initial.status as VerifierStatusV1, final_verifier_status: finalStatus, event_order: eventOrder };
	} finally { unsubscribe(); }
}

export function payloadDeltaProofV1(baseline: TreatmentProbeV1, skillOnly: TreatmentProbeV1, runtime: TreatmentProbeV1, skillWrapper: string, task: string): { bc_byte_equal: boolean; ab_delta_only_wrapper: boolean; common_context_equal: boolean; actual_payloads: true } {
	const baselineText = task; const skillText = `${skillWrapper}\n\n${task}`;
	const normalized = [normalizedInitial(baseline, baselineText), normalizedInitial(skillOnly, skillText), normalizedInitial(runtime, skillText)];
	return { bc_byte_equal: skillOnly.initial_model_payload === runtime.initial_model_payload, ab_delta_only_wrapper: normalized[0] === normalized[1] && lastUserText(baseline.initial_model_projection) === baselineText && lastUserText(skillOnly.initial_model_projection) === skillText,
		common_context_equal: normalized[0] === normalized[1] && normalized[1] === normalized[2] && digestObject(INITIAL_BUDGET_V1) === digestObject(INITIAL_BUDGET_V1), actual_payloads: true };
}
