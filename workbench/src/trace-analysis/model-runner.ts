import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentHarnessEvent } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { contentText, createModels, InMemoryCredentialStore, type AssistantMessage } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { createAnalysisContext, finalizeAnalysisHandoff, isAnalysisGloballyComplete, resolveFindingLocators } from "./analysis.ts";
import type { AnalysisState, EvidenceLocator, RunDescriptor } from "./contracts.ts";
import { analysisStateWasSaved, createAnalysisTools, type AnalysisToolCall } from "./model-tools.ts";
import { loadAnalysisState, renderDevelopmentFinding, saveAnalysisState } from "./state.ts";
import {
	buildControlledUnblindContext,
	completeControlledUnblindState,
	completeZeroFindingControlledUnblindState,
	CONTROLLED_UNBLIND_SYSTEM_PROMPT,
	controlledUnblindPrompt,
	parseControlledUnblindResult,
} from "./controlled-unblind.ts";

export const ANALYSIS_SYSTEM_PROMPT = `You are a bounded development Trace analyst.
1. Treat the outcome, evaluable status, selection status, and reason returned by list_runs as authoritative for evaluation classification. Use the External Verifier artifact as the authority for task correctness. Trace interpretation may report evidence-backed local process facts, but must not override, recompute, or reclassify the run-level Outcome.
2. Complete Global Matrix Triage by exposing the complete formal Matrix with list_runs before Deep Investigation, then create only a few high-value Agenda Items with explicit Claim Scope. Each trigger must preserve the actual observable anomaly or contrast in that Matrix that made the investigation worth starting, rather than a generic todo.
3. Use Required Runs and Open Runs implied by each Claim Scope to advance checked_runs. A run_observation requires only its anchor Run. A settle_condition must state the necessary inspection scope and what evidence state would permit retain, narrow, reject, or stop. Completing Required Runs records mechanical coverage; it does not establish that a claim is supported, semantically satisfy settle_condition, or automatically close an Item. The Agent must make that evidence-based semantic decision. Local Item closure is not Global Completion.
4. Keep Observation separate from Interpretation and Limitation. Use only Artifact content actually read through the provided tools; State records task progress while Artifacts record facts. Absence of an observed action or transition does not establish failure: report not observed, unclear, or insufficient evidence without filling missing facts. You may localize observable divergence, but localization does not establish root cause or causation, and a Finding need not supply a causal explanation.
5. If evidence is insufficient, narrow the final Finding wording and claim_scope, and state a specific Limitation when a real evidence boundary matters; deprioritize low-value Agenda Items with a reason. When closing an Item, use closure_reason to record what was checked, what was and was not supported, and why investigation can stop. A mixed, counter, or insufficient result may close without a kept Finding. Do not manufacture a Finding merely to fill the workflow.
6. Before saving a Finding, include at least one support Locator that you actually read. A kept Finding must link to its Agenda Item and fit that Item's checked_runs; counter_checked remains descriptive, not completion authority.
7. Limit every effect, causal, root-cause, condition, and cross-Case attribution claim to the Artifact Evidence actually read, the Finding's claim_scope, and current phase permissions. You may report bounded differences between labeled conditions in the provided runs, but do not infer general causality, statistical reliability, or final adoption decisions. Save all progress through update_state.`;

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

function locatorKey(locator: EvidenceLocator): string {
	return JSON.stringify(locator);
}

function assistantText(message: AssistantMessage): string {
	return message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
}

export interface BlindAnalysisInvocationResult {
	stage: "blind_analysis";
	mode: "fresh" | "resume";
	started_at: string;
	finished_at: string;
	model: { provider: string; id: string };
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
	const outputDirectory = resolve(options.outputDirectory);
	const statePath = resolve(outputDirectory, "analysis-state.json");
	mkdirSync(outputDirectory, { recursive: true });
	const analysis = createAnalysisContext(options.descriptors);
	const initialState = options.mode === "fresh"
		? emptyAnalysisState(analysis.coveredRuns)
		: loadAnalysisState(statePath, { requireExplicitPhase: true });
	if (options.mode === "fresh" && analysisStateWasSaved(statePath)) throw new Error("fresh Analysis requires an output directory without analysis-state.json");
	if (options.mode === "resume" && initialState.phase === "human_review_ready") throw new Error("human_review_ready State cannot run Analysis again");
	if (options.mode === "resume" && initialState.phase === "alignment_ready") {
		const startedMs = Date.now();
		const sealedFindings = initialState.finding_drafts.filter((finding) => finding.status === "kept" && finding.sealed);
		if (sealedFindings.length === 0) {
			const state = completeZeroFindingControlledUnblindState(initialState, options.descriptors);
			saveAnalysisState(outputDirectory, state);
			return { stage: "controlled_unblind", mode: "resume", model: null, usage: { provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, wall_time_ms: Date.now() - startedMs }, state_path: statePath, state, model_invoked: false, tool_names: [], assistant_text: "" };
		}
		if (!options.evaluationAuthority) throw new Error("Controlled unblind requires Batch Freeze and Thin Evaluation Mapping authority");
		const context = await buildControlledUnblindContext({ state: initialState, batchPath: options.evaluationAuthority.batchPath, mappingPath: options.evaluationAuthority.mappingPath });
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
			const message = await models.completeSimple(model, { systemPrompt, messages: [{ role: "user", content: userPrompt, timestamp: Date.now() }] }, { maxRetries: 0, timeoutMs: options.timeoutMs ?? 120_000 });
			if (message.stopReason === "error" || message.stopReason === "aborted") throw new Error(message.errorMessage ?? `controlled-unblind model stopped with ${message.stopReason}`);
			completion = { text: contentText(message.content), model: { provider: message.provider, id: message.model }, usage: { input_tokens: message.usage.input + message.usage.cacheRead + message.usage.cacheWrite, output_tokens: message.usage.output, cost_usd: message.usage.cost.total } };
		}
		const result = parseControlledUnblindResult(completion.text);
		const state = completeControlledUnblindState(initialState, options.descriptors, result, context.frozen_candidate_skill);
		saveAnalysisState(outputDirectory, state);
		return { stage: "controlled_unblind", mode: "resume", model: completion.model, usage: { provider_requests: 1, ...completion.usage, wall_time_ms: Date.now() - startedMs }, state_path: statePath, state, model_invoked: true, tool_names: [], assistant_text: completion.text };
	}
	if (options.mode === "resume" && initialState.phase !== "blind_analysis") throw new Error(`${initialState.phase} State cannot resume Blind Analysis`);
	const prompt = options.mode === "fresh" ? freshAnalysisPrompt() : resumeAnalysisPrompt(initialState);
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
	const session = await repo.create({ cwd: outputDirectory, id: sessionId, metadata: { mode: options.mode, state_path: statePath } });
	const sessionMetadata = await session.getMetadata();
	const harness = new AgentHarness({ models, session, model, tools: profile.tools, toolContext: profile.context, systemPrompt: ANALYSIS_SYSTEM_PROMPT, thinkingLevel: ANALYSIS_THINKING_LEVEL, streamOptions: { maxRetries: 0, timeoutMs: options.timeoutMs ?? 120_000 } });
	const startedMs = Date.now();
	const startedAt = new Date(startedMs).toISOString();
	let providerRequests = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	let costUsd = 0;
	let settled = 0;
	let finalText = "";
	const unsubscribe = harness.subscribe((event: AgentHarnessEvent) => {
		if (event.type === "settled") settled++;
		if (event.type === "message_end" && event.message.role === "assistant") {
			const message = event.message as AssistantMessage;
			providerRequests++;
			inputTokens += message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
			outputTokens += message.usage.output;
			costUsd += message.usage.cost.total;
			finalText = assistantText(message);
		}
	});
	try {
		await harness.prompt(prompt);
		await harness.waitForIdle();
	} finally {
		unsubscribe();
		await harness.abort();
	}
	if (settled !== 1) throw new Error(`Analysis Invocation must settle exactly once; observed ${settled}`);
	if (!analysisStateWasSaved(statePath)) throw new Error("Analysis model did not persist State through update_state");
	let state = loadAnalysisState(statePath);
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
		saveAnalysisState(outputDirectory, state);
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
		stage: "blind_analysis", mode: options.mode, started_at: startedAt, finished_at: new Date().toISOString(), model: { provider: model.provider, id: model.id },
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
