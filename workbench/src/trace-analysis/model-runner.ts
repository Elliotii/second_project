import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentHarnessEvent } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { createModels, InMemoryCredentialStore, type AssistantMessage } from "@earendil-works/pi-ai";
import { deepseekProvider } from "@earendil-works/pi-ai/providers/deepseek";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { createAnalysisContext, resolveFindingLocators } from "./analysis.ts";
import type { AnalysisState, EvidenceLocator, RunDescriptor } from "./contracts.ts";
import { analysisStateWasSaved, createAnalysisTools, type AnalysisToolCall } from "./model-tools.ts";
import { loadAnalysisState, renderDevelopmentFinding } from "./state.ts";

export const ANALYSIS_SYSTEM_PROMPT = `You are a bounded development Trace analyst.
1. Treat the outcome, evaluable status, selection status, and reason returned by list_runs as authoritative for evaluation classification. Use the External Verifier artifact as the authority for task correctness, but do not override or recompute the evaluation classification.
2. Use only Artifact content actually read through the provided tools; do not assume unread content.
3. Keep Observation separate from Interpretation.
4. Before saving a Finding, include at least one support Locator that you actually read.
5. Before keeping a Finding, actively check another Run or another Evidence kind for counter-evidence or limitations.
6. Limit conclusions to the provided runs and their labels. You may report bounded differences between labeled conditions, but do not infer general causality, statistical reliability, or final adoption decisions. Save all progress through update_state.`;

export function emptyAnalysisState(runIds: string[]): AnalysisState {
	return { covered_runs: [...runIds], notes: [], open_questions: [], next_action: "", loaded_evidence: [], finding_drafts: [] };
}

export function freshAnalysisPrompt(): string {
	return `Start one bounded development analysis from the empty State. Call list_runs, choose an analyzable implementation difference or failure mechanism, search Trace data, and read supporting Evidence by Locator. Save one supported Finding with status=draft and counter_checked=false. Set a non-empty next_action that tells a later independent resume invocation which other Run or Evidence kind to inspect for counter-evidence or limitations. Call update_state once and stop.`;
}

export function resumeAnalysisPrompt(state: AnalysisState): string {
	const summary = {
		notes: state.notes,
		open_questions: state.open_questions,
		next_action: state.next_action,
		finding_drafts: state.finding_drafts,
		loaded_evidence: state.loaded_evidence,
	};
	return `Resume one bounded development analysis in a new Session. No prior chat or Evidence content is available. Follow the saved next_action, use the tools to inspect another Run or Evidence kind, actively check counter-evidence or limitations, then update the existing Finding to kept or dropped with counter_checked=true. Update limitation and open_questions, call update_state once, and stop.\n\nSaved State summary:\n${JSON.stringify(summary, null, 2)}`;
}

function locatorKey(locator: EvidenceLocator): string {
	return JSON.stringify(locator);
}

function assistantText(message: AssistantMessage): string {
	return message.content.flatMap((part) => part.type === "text" ? [part.text] : []).join("\n");
}

export interface AnalysisInvocationResult {
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

export async function runAnalysisInvocation(options: {
	mode: "fresh" | "resume";
	descriptors: RunDescriptor[];
	outputDirectory: string;
	credentialResolver: OpaqueCredentialResolverV1;
	timeoutMs?: number;
}): Promise<AnalysisInvocationResult> {
	if (!options.credentialResolver || typeof options.credentialResolver.resolve !== "function") throw new Error("opaque Credential resolver is required for Analysis Runner");
	const outputDirectory = resolve(options.outputDirectory);
	const statePath = resolve(outputDirectory, "analysis-state.json");
	mkdirSync(outputDirectory, { recursive: true });
	const analysis = createAnalysisContext(options.descriptors);
	const initialState = options.mode === "fresh"
		? emptyAnalysisState(analysis.coveredRuns)
		: loadAnalysisState(statePath);
	if (options.mode === "fresh" && analysisStateWasSaved(statePath)) throw new Error("fresh Analysis requires an output directory without analysis-state.json");
	const prompt = options.mode === "fresh" ? freshAnalysisPrompt() : resumeAnalysisPrompt(initialState);
	const profile = createAnalysisTools({ analysis, statePath, initialState });
	const expectedNames = ["list_runs", "search_trace", "read_evidence", "update_state"];
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
	const harness = new AgentHarness({ models, session, model, tools: profile.tools, toolContext: profile.context, systemPrompt: ANALYSIS_SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: options.timeoutMs ?? 120_000 } });
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
	const state = loadAnalysisState(statePath);
	const locators = state.finding_drafts.flatMap((finding) => [...finding.support, ...finding.counter]);
	const resolved = resolveFindingLocators(analysis, locators).map((entry) => ({ locator: entry.locator, characterCount: entry.characterCount }));
	const loadedKeys = new Set(state.loaded_evidence.map((entry) => locatorKey(entry.locator)));
	const allLoaded = locators.every((locator) => loadedKeys.has(locatorKey(locator)));
	if (!allLoaded) throw new Error("Finding uses a Locator absent from loaded_evidence");
	if (options.mode === "fresh") {
		if (!state.finding_drafts.some((finding) => finding.status === "draft" && finding.support.length > 0 && finding.counter_checked === false) || state.next_action.trim().length === 0) throw new Error("fresh Invocation did not persist the required supported Draft");
	} else if (!state.finding_drafts.some((finding) => finding.counter_checked === true)) throw new Error("resume Invocation did not persist a counter check");

	let resumeDirection: AnalysisInvocationResult["resume_direction"];
	if (options.mode === "resume") {
		const initialLocators = initialState.finding_drafts.flatMap((finding) => [...finding.support, ...finding.counter]);
		const initialRuns = new Set(initialLocators.map((locator) => locator.run_id));
		const initialArtifacts = new Set(initialLocators.map((locator) => locator.artifact));
		const inspected: Array<{ run_id: string; artifact: EvidenceLocator["artifact"] }> = profile.context.calls.flatMap((call) => {
			if (call.name === "search_trace" && typeof call.input.run_id === "string") return [{ run_id: call.input.run_id, artifact: "trace" as const }];
			if (call.name === "read_evidence" && call.evidence) return [{ run_id: call.evidence.locator.run_id, artifact: call.evidence.locator.artifact }];
			return [];
		});
		resumeDirection = { queried_different_run: inspected.some((entry) => !initialRuns.has(entry.run_id)), queried_different_artifact: inspected.some((entry) => !initialArtifacts.has(entry.artifact)) };
		if (!resumeDirection.queried_different_run && !resumeDirection.queried_different_artifact) throw new Error("resume Invocation did not inspect another Run or Evidence kind");
	}
	const result: AnalysisInvocationResult = {
		mode: options.mode, started_at: startedAt, finished_at: new Date().toISOString(), model: { provider: model.provider, id: model.id },
		usage: { provider_requests: providerRequests, input_tokens: inputTokens, output_tokens: outputTokens, cost_usd: costUsd, tool_calls: profile.context.calls.length, wall_time_ms: Date.now() - startedMs },
		session_id: sessionMetadata.id, session_path: sessionMetadata.path, state_path: statePath, loaded_state_path: options.mode === "resume" ? statePath : null,
		loaded_prior_session: false, tool_names: profile.tools.map((tool) => tool.name), tool_calls: structuredClone(profile.context.calls), prior_next_action: initialState.next_action,
		...(resumeDirection ? { resume_direction: resumeDirection } : {}), state, resolved_locators: resolved, all_finding_locators_were_loaded: allLoaded, assistant_text: finalText,
	};
	writeFileSync(resolve(outputDirectory, `${options.mode}-invocation.json`), `${JSON.stringify(result, null, 2)}\n`, "utf8");
	if (options.mode === "resume") writeFileSync(resolve(outputDirectory, "development-finding.md"), renderDevelopmentFinding(state, state.finding_drafts.find((finding) => finding.status === "kept")?.id ?? state.finding_drafts[0]!.id), "utf8");
	return result;
}
