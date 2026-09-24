import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentHarnessEvent } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { contentText, createModels, InMemoryCredentialStore, type AssistantMessage } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { createAnalysisContext, finalizeAnalysisHandoff, isAnalysisGloballyComplete, resolveFindingLocators, validateAnalysisWorkflow } from "./analysis.ts";
import type { AnalysisState, EvidenceLocator, RunDescriptor } from "./contracts.ts";
import { analysisStateWasSaved, createAnalysisTools, type AnalysisStateUpdateFailure, type AnalysisToolCall } from "./model-tools.ts";
import { resolveAnalysisRequestTimeoutMs } from "./runtime-config.ts";
import { loadAnalysisState, renderDevelopmentFinding, saveAnalysisState } from "./state.ts";
import {
	buildControlledUnblindContext,
	completeControlledUnblindState,
	completeZeroFindingControlledUnblindState,
	CONTROLLED_UNBLIND_SYSTEM_PROMPT,
	controlledUnblindPrompt,
	loadFrozenSkillEvidenceFromEvaluation,
	parseControlledUnblindResult,
	validateControlledUnblindResult,
} from "./controlled-unblind.ts";

export const ANALYSIS_SYSTEM_PROMPT = `You are a bounded development Trace analyst.
1. Treat the outcome, evaluable status, selection status, and reason returned by list_runs as authoritative for evaluation classification. Use the External Verifier artifact as the authority for task correctness. Trace interpretation may report evidence-backed local process facts, but must not override, recompute, or reclassify the run-level Outcome.
2. Complete Global Matrix Triage by exposing the complete formal Matrix with list_runs before Deep Investigation, then create only a few high-value Agenda Items with explicit Claim Scope. Each trigger must preserve the actual observable anomaly or contrast in that Matrix that made the investigation worth starting, rather than a generic todo.
3. Use Required Runs and Open Runs implied by each Claim Scope to advance checked_runs. A run_observation requires only its anchor Run. A settle_condition must state the necessary inspection scope and what evidence state would permit retain, narrow, reject, or stop. Completing Required Runs records mechanical coverage; it does not establish that a claim is supported, semantically satisfy settle_condition, or automatically close an Item. The Agent must make that evidence-based semantic decision. Local Item closure is not Global Completion.
4. Keep Observation separate from Interpretation and Limitation. Use only Artifact content actually read through the provided tools; State records task progress while Artifacts record facts. Absence of an observed action or transition does not establish failure: report not observed, unclear, or insufficient evidence without filling missing facts. You may localize observable divergence, but localization does not establish root cause or causation, and a Finding need not supply a causal explanation.
5. If evidence is insufficient, narrow the final Finding wording and claim_scope, and state a specific Limitation when a real evidence boundary matters; deprioritize low-value Agenda Items with a reason. When closing an Item, use closure_reason to record what was checked, what was and was not supported, and why investigation can stop. A mixed, counter, or insufficient result may close without a kept Finding. Do not manufacture a Finding merely to fill the workflow.
6. Before saving a Finding, include at least one support Locator that you actually read. A kept Finding must link to its Agenda Item and fit that Item's checked_runs; counter_checked remains descriptive, not completion authority.
7. Limit every effect, causal, root-cause, condition, and cross-Case attribution claim to the Artifact Evidence actually read, the Finding's claim_scope, and current phase permissions. You may report bounded differences between labeled conditions in the provided runs, but do not infer general causality, statistical reliability, or final adoption decisions. Save all progress through update_state.
8. Outcome-neutral is not process-irrelevant. Once an observable, task-relevant process difference is identified, the fact that associated Runs all PASS may limit benefit, outcome, efficiency, and causal claims, but may not by itself justify deprioritizing or closing the process question. Before closure, use available natural replication such as same-case sibling trials, condition counterparts, or other directly comparable Runs to determine whether the signal is isolated, mixed, or repeated; do not default to scanning the full Matrix when the bounded question needs less.
9. Recurrence may be directionally consistent or semantically equivalent rather than literally identical in tool name, error, text, or operation count. Group process proxies only when observable evidence, task relevance, defensible scope, directional comparability, and a counter or contrast basis support the grouping. A repeated process difference remains only a Behavior Difference: it does not establish Benefit, Efficiency Improvement, or Causation.
10. Keep expansion hypothesis-bound. State the Agenda Item, investigation question, claim scope, and settle condition served by each expansion; inspect natural sibling or counter evidence, expand further only when remaining ambiguity materially affects that claim, preserve counters and limitations, and stop when the active question is sufficiently resolved as isolated, mixed, or repeated. Do not perform a hypothesis-free exhaustive audit, and do not stop merely to save Tool calls or tokens before reasonable evidence resolution.
11. Describe terminal evidence as observed state, not inferred intent. Analysis-side settled status, absence of timeout or further Tool calls, empty final assistant text, or another observed terminal state does not alone prove a deliberate decision, intentional stop, choice not to implement, or the reason the Coding Agent stopped.

Write all model-generated human-readable analytical prose stored in Analysis State in Simplified Chinese (zh-CN). Keep canonical enum values, JSON field names, IDs, Run IDs, Case and Finding IDs, SHA values, paths, artifact locators, tool and function names, code, commands, raw errors, verifier messages, source quotations, and other technical or evidence literals exactly as required or observed; do not translate or localize them. Do not rewrite or translate previously persisted prose solely for language normalization; apply this language rule to newly generated or substantively updated analytical prose.`;

export const ANALYSIS_THINKING_LEVEL = "max" as const;

export function emptyAnalysisState(runIds: string[]): AnalysisState {
	return { phase: "blind_analysis", covered_runs: [...runIds], matrix_triage_complete: false, investigation_agenda: [], notes: [], open_questions: [], next_action: "", loaded_evidence: [], finding_drafts: [] };
}

const BLIND_ANALYSIS_PHASE_INSTRUCTIONS = `This Invocation is Blind Behavior Investigation. Analyze what happened, whether an observed signal is repeated and potentially task-relevant, bounded contrasts and counters, mixed or unstable evidence, and the supported scope boundary. Do not seek or infer real condition identities, Candidate Skill content, metadata, path, intended mechanism, or expected improvement. Do not analyze Skill-behavior correspondence, Skill effect, Skill benefit, or Skill causation. If you judge a process signal to be repeated and potentially task-relevant, set process_investigation_required=true. Such an Item may not be settled or deprioritized until process_investigation_resolution records one bounded resolution: bounded_contrast, evidence_backed_irrelevance, explicit_confound, or not_repeated_after_check. When a kept Finding explicitly claims a repeated pattern, record the independent supporting Run identities in repeated_support_run_ids; use an empty array for a non-repeated or single-Run Finding. The Harness does not infer recurrence. The Harness enforces only mechanical obligations; you remain responsible for semantic judgment.`;

export function freshAnalysisPrompt(): string {
	return `${BLIND_ANALYSIS_PHASE_INSTRUCTIONS}\n\nStart one bounded development analysis from the empty State. Call list_runs and perform Global Matrix Triage before Deep Investigation. Save matrix_triage_complete=true and a small structured Investigation Agenda whose triggers preserve the observable Matrix anomalies or contrasts that made each Item worth starting; the Agenda may be empty when no investigation is warranted. You may continue naturally into the first high-value Item. Derive its Required and Open Runs from claim_scope, record only explicitly completed checks in checked_runs, and write a settle_condition that states both the necessary checks and the evidence state permitting retain, narrow, reject, or stop. Do not manufacture a Finding. If Global Completion is still false, save a non-empty next_action. Call update_state once and stop.`;
}

export function resumeAnalysisPrompt(state: AnalysisState): string {
	const summary = {
		notes: state.notes,
		open_questions: state.open_questions,
		next_action: state.next_action,
		matrix_triage_complete: state.matrix_triage_complete,
		investigation_agenda: state.investigation_agenda,
		finding_drafts: state.finding_drafts,
		loaded_evidence: state.loaded_evidence,
	};
	return `${BLIND_ANALYSIS_PHASE_INSTRUCTIONS}\n\nResume one bounded development analysis in a new Session. No prior chat or Evidence content is available. Follow the saved next_action and current Agenda. Use Required and Open Runs for the current Item and persist explicit checked_runs progress. Required Runs completion is mechanical coverage, not proof of the claim, semantic satisfaction of settle_condition, or automatic closure. Settle or deprioritize only after judging the actual evidence against settle_condition, with a closure_reason that records what was checked, what was and was not supported, and why investigation can stop; closing without a kept Finding is valid. Narrow a final Finding claim_scope when evidence supports less than the initial scope. Local completion does not imply Global Completion; retain an open Agenda or next_action while work remains. Call update_state once and stop.\n\nSaved State summary:\n${JSON.stringify(summary, null, 2)}`;
}

export function blindAnalysisModelContext(mode: "fresh" | "resume", state: AnalysisState): { systemPrompt: string; userPrompt: string } {
	return { systemPrompt: ANALYSIS_SYSTEM_PROMPT, userPrompt: mode === "fresh" ? freshAnalysisPrompt() : resumeAnalysisPrompt(state) };
}

function locatorKey(locator: EvidenceLocator): string {
	return JSON.stringify(locator);
}

function assistantText(message: AssistantMessage): string {
	return message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
}

export type AnalysisInvocationErrorCode =
	| "analysis_provider_error"
	| "analysis_runtime_error"
	| "analysis_aborted"
	| "analysis_lifecycle_error"
	| "analysis_update_state_not_called"
	| "analysis_state_validation_failed"
	| "analysis_state_persistence_failed";

export class AnalysisInvocationError extends Error {
	readonly code: AnalysisInvocationErrorCode;
	readonly analysisStage = "blind_analysis" as const;
	readonly mode: "fresh" | "resume";

	constructor(code: AnalysisInvocationErrorCode, mode: "fresh" | "resume", message: string, cause?: unknown) {
		super(message, cause === undefined ? undefined : { cause });
		this.name = "AnalysisInvocationError";
		this.code = code;
		this.mode = mode;
	}
}

export function analysisInvocationErrorCode(error: unknown): AnalysisInvocationErrorCode | undefined {
	return error instanceof AnalysisInvocationError ? error.code : undefined;
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export function assertBlindAnalysisTerminal(options: {
	mode: "fresh" | "resume";
	settled: number;
	finalAssistantMessage: Pick<AssistantMessage, "stopReason" | "errorMessage"> | null;
	stateSaved: boolean;
	updateStateAttempts: number;
	lastUpdateStateFailure: AnalysisStateUpdateFailure | null;
}): void {
	const { finalAssistantMessage: message } = options;
	if (message?.stopReason === "error") {
		throw new AnalysisInvocationError("analysis_provider_error", options.mode, `Blind Analysis ${options.mode} Provider error before accepted State: ${message.errorMessage ?? "Provider returned stopReason=error"}`);
	}
	if (message?.stopReason === "aborted") {
		throw new AnalysisInvocationError("analysis_aborted", options.mode, `Blind Analysis ${options.mode} was aborted before accepted State: ${message.errorMessage ?? "Assistant stopped with stopReason=aborted"}`);
	}
	if (options.settled !== 1) {
		throw new AnalysisInvocationError("analysis_lifecycle_error", options.mode, `Blind Analysis Invocation must settle exactly once; observed ${options.settled}`);
	}
	if (!message) {
		throw new AnalysisInvocationError("analysis_runtime_error", options.mode, "Blind Analysis settled without an Assistant terminal message");
	}
	if (options.stateSaved) return;
	if (options.lastUpdateStateFailure?.kind === "validation") {
		throw new AnalysisInvocationError("analysis_state_validation_failed", options.mode, `Blind Analysis update_state validation failed: ${options.lastUpdateStateFailure.message}`);
	}
	if (options.lastUpdateStateFailure?.kind === "persistence") {
		throw new AnalysisInvocationError("analysis_state_persistence_failed", options.mode, `Blind Analysis update_state persistence failed: ${options.lastUpdateStateFailure.message}`);
	}
	if (options.updateStateAttempts > 0) {
		throw new AnalysisInvocationError("analysis_state_persistence_failed", options.mode, "Blind Analysis attempted update_state but no accepted State was persisted");
	}
	throw new AnalysisInvocationError("analysis_update_state_not_called", options.mode, "Blind Analysis ended normally without calling update_state");
}

export interface BlindAnalysisInvocationResult {
	stage: "blind_analysis";
	mode: "fresh" | "resume";
	started_at: string;
	finished_at: string;
	model: { provider: string; id: string };
	request_timeout_ms: number;
	usage: { provider_requests: number; input_tokens: number; output_tokens: number; cost_usd: number; tool_calls: number; wall_time_ms: number };
	session_id: string;
	session_path: string;
	state_path: string;
	loaded_state_path: string | null;
	loaded_prior_session: false;
	tool_names: string[];
	tool_calls: AnalysisToolCall[];
	prior_next_action: string;
	resume_direction?: { queried_different_run: boolean; queried_different_artifact: boolean };
	state: AnalysisState;
	resolved_locators: Array<{ locator: EvidenceLocator; characterCount: number }>;
	all_finding_locators_were_loaded: boolean;
	assistant_text: string;
}

export interface ControlledUnblindInvocationResult {
	stage: "controlled_unblind";
	mode: "resume";
	model: { provider: string; id: string } | null;
	request_timeout_ms: number;
	usage: { provider_requests: number; input_tokens: number; output_tokens: number; cost_usd: number; wall_time_ms: number };
	state_path: string;
	state: AnalysisState;
	model_invoked: boolean;
	tool_names: [];
	assistant_text: string;
}

export type AnalysisInvocationResult = BlindAnalysisInvocationResult | ControlledUnblindInvocationResult;

export interface AlignmentCompletionResult {
	text: string;
	model: { provider: string; id: string };
	usage: { input_tokens: number; output_tokens: number; cost_usd: number };
}

export async function runAnalysisInvocation(options: {
	mode: "fresh" | "resume";
	descriptors: RunDescriptor[];
	outputDirectory: string;
	credentialResolver: OpaqueCredentialResolverV1;
	timeoutMs?: number;
	evaluationAuthority?: { batchPath: string; mappingPath: string };
	alignmentCompletion?: (input: { systemPrompt: string; userPrompt: string }) => Promise<AlignmentCompletionResult>;
}): Promise<AnalysisInvocationResult> {
	if (!options.credentialResolver || typeof options.credentialResolver.resolve !== "function") throw new Error("opaque Credential resolver is required for Analysis Runner");
	const requestTimeoutMs = resolveAnalysisRequestTimeoutMs(options.timeoutMs);
	const outputDirectory = resolve(options.outputDirectory);
	const statePath = resolve(outputDirectory, "analysis-state.json");
	mkdirSync(outputDirectory, { recursive: true });
	const analysis = createAnalysisContext(options.descriptors);
	const initialState = options.mode === "fresh"
		? emptyAnalysisState(analysis.coveredRuns)
		: loadAnalysisState(statePath, { requireExplicitPhase: true });
	if (options.mode === "fresh" && analysisStateWasSaved(statePath)) throw new Error("fresh Analysis requires an output directory without analysis-state.json");
	if (options.mode === "resume" && initialState.phase === "human_review_ready") {
		validateAnalysisWorkflow(initialState, options.descriptors);
		if (!options.evaluationAuthority) throw new Error("human_review_ready eligibility requires Batch Freeze authority");
		const frozenSkill = await loadFrozenSkillEvidenceFromEvaluation(options.evaluationAuthority.batchPath);
		validateControlledUnblindResult(initialState, initialState.controlled_unblind_result, frozenSkill);
		throw new Error("human_review_ready State cannot run Analysis again");
	}
	if (options.mode === "resume" && initialState.phase === "alignment_ready") {
		const startedMs = Date.now();
		const invocationPath = resolve(outputDirectory, "controlled-unblind-invocation.json");
		if (existsSync(invocationPath)) throw new Error("controlled-unblind invocation evidence already exists; use a new Review output root for another attempt");
		const sealedFindings = initialState.finding_drafts.filter((finding) => finding.status === "kept" && finding.sealed);
		if (sealedFindings.length === 0) {
			const state = completeZeroFindingControlledUnblindState(initialState, options.descriptors);
			saveAnalysisState(outputDirectory, state);
			return { stage: "controlled_unblind", mode: "resume", model: null, request_timeout_ms: requestTimeoutMs, usage: { provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, wall_time_ms: Date.now() - startedMs }, state_path: statePath, state, model_invoked: false, tool_names: [], assistant_text: "" };
		}
		if (!options.evaluationAuthority) throw new Error("Controlled unblind requires Batch Freeze and Thin Evaluation Mapping authority");
		const context = await buildControlledUnblindContext({ state: initialState, descriptors: options.descriptors, batchPath: options.evaluationAuthority.batchPath, mappingPath: options.evaluationAuthority.mappingPath });
		const systemPrompt = CONTROLLED_UNBLIND_SYSTEM_PROMPT;
		const userPrompt = controlledUnblindPrompt(context);
		let completion: AlignmentCompletionResult;
		if (options.alignmentCompletion) completion = await options.alignmentCompletion({ systemPrompt, userPrompt });
		else {
			const credential = await options.credentialResolver.resolve();
			if (typeof credential !== "string" || credential.length === 0) throw new Error("opaque Analysis Credential resolution failed");
			const credentials = new InMemoryCredentialStore();
			await credentials.modify("deepseek", async () => ({ type: "api_key", key: credential }));
			const models = createModels({ credentials });
			models.setProvider(deepseekProvider());
			const model = models.getModel("deepseek", "deepseek-v4-flash");
			if (!model) throw new Error("fixed DeepSeek Analysis model is unavailable");
			const message = await models.completeSimple(model, { systemPrompt, messages: [{ role: "user", content: userPrompt, timestamp: Date.now() }] }, { maxRetries: 0, timeoutMs: requestTimeoutMs });
			if (message.stopReason === "error" || message.stopReason === "aborted") throw new Error(message.errorMessage ?? `controlled-unblind model stopped with ${message.stopReason}`);
			completion = { text: contentText(message.content), model: { provider: message.provider, id: message.model }, usage: { input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite, output_tokens: message.usage.output, cost_usd: message.usage.cost.total } };
		}
		const finishedAt = new Date().toISOString();
		const usage = { provider_requests: 1, ...completion.usage, wall_time_ms: Date.now() - startedMs };
		writeFileSync(invocationPath, `${JSON.stringify({
			schema_version: 1,
			stage: "controlled_unblind",
			started_at: new Date(startedMs).toISOString(),
			finished_at: finishedAt,
			model: completion.model,
			request_timeout_ms: requestTimeoutMs,
			usage,
			assistant_text: completion.text,
		}, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
		const result = parseControlledUnblindResult(completion.text);
		const state = completeControlledUnblindState(initialState, options.descriptors, result, context.frozen_candidate_skill);
		saveAnalysisState(outputDirectory, state);
		return { stage: "controlled_unblind", mode: "resume", model: completion.model, request_timeout_ms: requestTimeoutMs, usage, state_path: statePath, state, model_invoked: true, tool_names: [], assistant_text: completion.text };
	}
	if (options.mode === "resume" && initialState.phase !== "blind_analysis") throw new Error(`${initialState.phase} State cannot resume Blind Analysis`);
	const modelContext = blindAnalysisModelContext(options.mode, initialState);
	const profile = createAnalysisTools({ analysis, statePath, initialState });
	const expectedNames = ["list_runs", "process_view", "search_trace", "read_evidence", "update_state"];
	if (JSON.stringify(profile.tools.map((tool) => tool.name)) !== JSON.stringify(expectedNames)) throw new Error("Analysis Tool allowlist drifted");

	const credential = await options.credentialResolver.resolve();
	if (typeof credential !== "string" || credential.length === 0) throw new Error("opaque Analysis Credential resolution failed");
	const credentials = new InMemoryCredentialStore();
	await credentials.modify("deepseek", async () => ({ type: "api_key", key: credential }));
	const models = createModels({ credentials });
	models.setProvider(deepseekProvider());
	const model = models.getModel("deepseek", "deepseek-v4-flash");
	if (!model) throw new Error("fixed DeepSeek Analysis model is unavailable");
	const sessionId = `trace-analysis-${options.mode}-${randomUUID()}`;
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: outputDirectory, shellEnv: {} }), sessionsRoot: resolve(outputDirectory, "sessions", options.mode) });
	const session = await repo.create({ cwd: outputDirectory, id: sessionId, metadata: { mode: options.mode, state_path: statePath, request_timeout_ms: requestTimeoutMs } });
	const sessionMetadata = await session.getMetadata();
	const harness = new AgentHarness({ models, session, model, tools: profile.tools, toolContext: profile.context, systemPrompt: modelContext.systemPrompt, thinkingLevel: ANALYSIS_THINKING_LEVEL, streamOptions: { maxRetries: 0, timeoutMs: requestTimeoutMs } });
	const startedMs = Date.now();
	const startedAt = new Date(startedMs).toISOString();
	let providerRequests = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	let costUsd = 0;
	let settled = 0;
	let finalText = "";
	let finalAssistantMessage: AssistantMessage | null = null;
	let observedUpdateStateAttempts = 0;
	let observedUpdateStateFailure: AnalysisStateUpdateFailure | null = null;
	const unsubscribe = harness.subscribe((event: AgentHarnessEvent) => {
		if (event.type === "settled") settled++;
		if (event.type === "tool_execution_start" && event.toolName === "update_state") observedUpdateStateAttempts++;
		if (event.type === "tool_execution_end" && event.toolName === "update_state" && event.isError && profile.context.lastUpdateStateFailure === null) {
			observedUpdateStateFailure = { kind: "validation", message: "update_state tool arguments were rejected before State persistence" };
		}
		if (event.type === "message_end" && event.message.role === "assistant") {
			const message = event.message as AssistantMessage;
			finalAssistantMessage = message;
			providerRequests++;
			inputTokens += message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
			outputTokens += message.usage.output;
			costUsd += message.usage.cost.total;
			finalText = assistantText(message);
		}
	});
	let runtimeFailure: unknown;
	try {
		await harness.prompt(modelContext.userPrompt);
		await harness.waitForIdle();
	} catch (error) {
		runtimeFailure = error;
	} finally {
		unsubscribe();
		try {
			await harness.abort();
		} catch (error) {
			runtimeFailure ??= error;
		}
	}
	if (runtimeFailure !== undefined) throw new AnalysisInvocationError("analysis_runtime_error", options.mode, `Blind Analysis ${options.mode} runtime failed before accepted State: ${errorMessage(runtimeFailure)}`, runtimeFailure);
	assertBlindAnalysisTerminal({
		mode: options.mode,
		settled,
		finalAssistantMessage,
		stateSaved: analysisStateWasSaved(statePath),
		updateStateAttempts: Math.max(observedUpdateStateAttempts, profile.context.updateStateAttempts),
		lastUpdateStateFailure: profile.context.lastUpdateStateFailure ?? observedUpdateStateFailure,
	});
	let state: AnalysisState;
	try {
		state = loadAnalysisState(statePath);
	} catch (error) {
		throw new AnalysisInvocationError("analysis_state_validation_failed", options.mode, `Persisted Blind Analysis State could not be loaded or validated: ${errorMessage(error)}`, error);
	}
	const globalComplete = isAnalysisGloballyComplete(state, options.descriptors);
	const locators = state.finding_drafts.flatMap((finding) => [...finding.support, ...finding.counter]);
	const resolved = resolveFindingLocators(analysis, locators).map((entry) => ({ locator: entry.locator, characterCount: entry.characterCount }));
	const loadedKeys = new Set(state.loaded_evidence.map((entry) => locatorKey(entry.locator)));
	const allLoaded = locators.every((locator) => loadedKeys.has(locatorKey(locator)));
	if (!allLoaded) throw new Error("Finding uses a Locator absent from loaded_evidence");
	if (options.mode === "fresh" && !state.matrix_triage_complete) throw new Error("fresh Invocation did not complete Global Matrix Triage");
	if (!globalComplete && state.next_action.trim().length === 0) throw new Error("globally incomplete Analysis State requires next_action");
	if (globalComplete) {
		state = finalizeAnalysisHandoff(state, options.descriptors);
		try {
			saveAnalysisState(outputDirectory, state);
		} catch (error) {
			throw new AnalysisInvocationError("analysis_state_persistence_failed", options.mode, `Final Blind Analysis State persistence failed: ${errorMessage(error)}`, error);
		}
	}

	let resumeDirection: BlindAnalysisInvocationResult["resume_direction"];
	if (options.mode === "resume") {
		const initialLocators = initialState.finding_drafts.flatMap((finding) => [...finding.support, ...finding.counter]);
		const initialRuns = new Set(initialLocators.map((locator) => locator.run_id));
		const initialArtifacts = new Set(initialLocators.map((locator) => locator.artifact));
		const inspected: Array<{ run_id: string; artifact: EvidenceLocator["artifact"] }> = profile.context.calls.flatMap((call) => {
			if ((call.name === "process_view" || call.name === "search_trace") && typeof call.input.run_id === "string") return [{ run_id: call.input.run_id, artifact: "trace" as const }];
			if (call.name === "read_evidence" && call.evidence) return [{ run_id: call.evidence.locator.run_id, artifact: call.evidence.locator.artifact }];
			return [];
		});
		resumeDirection = { queried_different_run: inspected.some((entry) => !initialRuns.has(entry.run_id)), queried_different_artifact: inspected.some((entry) => !initialArtifacts.has(entry.artifact)) };
		if (!resumeDirection.queried_different_run && !resumeDirection.queried_different_artifact) throw new Error("resume Invocation did not inspect another Run or Evidence kind");
	}
	const result: BlindAnalysisInvocationResult = {
		stage: "blind_analysis", mode: options.mode, started_at: startedAt, finished_at: new Date().toISOString(), model: { provider: model.provider, id: model.id }, request_timeout_ms: requestTimeoutMs,
		usage: { provider_requests: providerRequests, input_tokens: inputTokens, output_tokens: outputTokens, cost_usd: costUsd, tool_calls: profile.context.calls.length, wall_time_ms: Date.now() - startedMs },
		session_id: sessionMetadata.id, session_path: sessionMetadata.path, state_path: statePath, loaded_state_path: options.mode === "resume" ? statePath : null,
		loaded_prior_session: false, tool_names: profile.tools.map((tool) => tool.name), tool_calls: structuredClone(profile.context.calls), prior_next_action: initialState.next_action,
		...(resumeDirection ? { resume_direction: resumeDirection } : {}), state, resolved_locators: resolved, all_finding_locators_were_loaded: allLoaded, assistant_text: finalText,
	};
	writeFileSync(resolve(outputDirectory, `${options.mode}-invocation.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8");
	if (options.mode === "resume" && state.finding_drafts.length > 0) {
		writeFileSync(resolve(outputDirectory, "development-finding.md"), renderDevelopmentFinding(state, state.finding_drafts.find((finding) => finding.status === "kept")?.id ?? state.finding_drafts[0]!.id), "utf8");
	}
	return result;
}
