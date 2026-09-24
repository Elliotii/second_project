import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { CodingTaskModelRuntime } from "../src/coding-task/contracts.ts";
import { runCodingTask } from "../src/coding-task/runner.ts";
import type { AnalysisState } from "../src/trace-analysis/contracts.ts";
import { completeZeroFindingControlledUnblindState } from "../src/trace-analysis/controlled-unblind.ts";
import { runEvaluationAnalysis } from "../src/trace-analysis/evaluation.ts";
import type { AnalysisInvocationResult } from "../src/trace-analysis/model-runner.ts";
import { resolveAnalysisRequestTimeoutMs } from "../src/trace-analysis/runtime-config.ts";
import { saveAnalysisState } from "../src/trace-analysis/state.ts";
import { evaluateEvaluation, parseEvaluateArguments } from "./evaluate-evaluation.ts";
import { reviewEvaluation } from "./review-evaluation.ts";

function fauxRuntime(source: string): CodingTaskModelRuntime {
	const models = createModels();
	const registration = fauxProvider({ provider: "evaluation-service-faux" });
	models.setProvider(registration.provider);
	registration.setResponses([
		fauxAssistantMessage(fauxToolCall("workspace_read", { path: "src/subject.ts" }, { id: "read" }), { stopReason: "toolUse" }),
		fauxAssistantMessage(fauxToolCall("workspace_edit", { path: "src/subject.ts", old_text: source, new_text: "export function answer(): number { return 42; }\n" }, { id: "edit" }), { stopReason: "toolUse" }),
		fauxAssistantMessage(fauxToolCall("run_command", { command_id: "public_test" }, { id: "test" }), { stopReason: "toolUse" }),
		fauxAssistantMessage("Implemented answer and the declared public test passed."),
	]);
	return { models, model: registration.getModel(), async close(): Promise<void> {} };
}

async function fauxAnalysis(options: Parameters<typeof runEvaluationAnalysis>[0]): Promise<AnalysisInvocationResult> {
	return runEvaluationAnalysis({
		...options,
		invoke: async (invocation) => {
			const requestTimeoutMs = resolveAnalysisRequestTimeoutMs(invocation.timeoutMs);
			const statePath = resolve(invocation.outputDirectory, "analysis-state.json");
			if (invocation.mode === "fresh") {
				const state: AnalysisState = {
					phase: "alignment_ready",
					covered_runs: invocation.descriptors.map((descriptor) => descriptor.runId),
					matrix_triage_complete: true,
					investigation_agenda: [],
					notes: ["Deterministic/Faux service-adapter check; no semantic model analysis was performed."],
					open_questions: [],
					next_action: "",
					loaded_evidence: [],
					finding_drafts: [],
				};
				saveAnalysisState(invocation.outputDirectory, state);
				const timestamp = new Date().toISOString();
				return {
					stage: "blind_analysis", mode: "fresh", started_at: timestamp, finished_at: timestamp,
					model: { provider: "faux", id: "evaluation-service-analysis-fixture" },
					request_timeout_ms: requestTimeoutMs,
					usage: { provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, tool_calls: 0, wall_time_ms: 0 },
					session_id: "faux-analysis-no-session", session_path: statePath, state_path: statePath, loaded_state_path: null,
					loaded_prior_session: false, tool_names: [], tool_calls: [], prior_next_action: "", state,
					resolved_locators: [], all_finding_locators_were_loaded: true, assistant_text: "",
				};
			}
			const current = JSON.parse(readFileSync(statePath, "utf8")) as AnalysisState;
			const state = completeZeroFindingControlledUnblindState(current, invocation.descriptors);
			saveAnalysisState(invocation.outputDirectory, state);
			return {
				stage: "controlled_unblind", mode: "resume", model: null, request_timeout_ms: requestTimeoutMs,
				usage: { provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, wall_time_ms: 0 },
				state_path: statePath, state, model_invoked: false, tool_names: [], assistant_text: "",
			};
		},
	});
}

async function main(): Promise<void> {
	const parsed = parseEvaluateArguments([...process.argv.slice(2), "--credential-file", resolve(".faux-evaluation-no-credential")]);
	if ("help" in parsed) throw new Error("Faux Evaluation service runner does not expose help mode");
	const result = await evaluateEvaluation(parsed, {
		credentialResolverFactory: () => ({ async resolve(): Promise<string> { throw new Error("Faux Evaluation attempted to resolve a Credential"); } }),
		runTask: async ({ plan, task }) => runCodingTask({ task, runtime: fauxRuntime(readFileSync(resolve(task.source_root, "src/subject.ts"), "utf8")), runId: `${plan.plan_id}-faux-run` }),
		review: (options) => reviewEvaluation(options, {
			credentialResolverFactory: () => ({ async resolve(): Promise<string> { throw new Error("Faux Analysis attempted to resolve a Credential"); } }),
			invoke: fauxAnalysis,
		}),
	});
	const metadataPath = resolve(parsed.output, "faux-execution-metadata.json");
	writeFileSync(metadataPath, `${JSON.stringify({ schema_version: 1, provider_kind: "public_emitted_faux", credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
	process.stdout.write(`${JSON.stringify({ ...result, faux_execution_metadata: metadataPath })}\n`);
}

main().catch((error) => {
	process.stdout.write(`${JSON.stringify({ status: "error", stage: "faux_formal", message: error instanceof Error ? error.message : String(error) })}\n`);
	process.exitCode = 1;
});
