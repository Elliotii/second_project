import { accessSync, constants, existsSync, lstatSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createDeferredCredentialFileResolverV35 } from "../src/session/real-smoke-turn-v35.ts";
import { createAnalysisContext } from "../src/trace-analysis/analysis.ts";
import { generateAnalysisReports, type GeneratedAnalysisReportPaths } from "../src/trace-analysis/analysis-report-generate.ts";
import { loadFrozenSkillEvidenceFromEvaluation } from "../src/trace-analysis/controlled-unblind.ts";
import { prepareEvaluationAnalysis, runEvaluationAnalysis } from "../src/trace-analysis/evaluation.ts";
import type { AnalysisInvocationResult } from "../src/trace-analysis/model-runner.ts";
import { createBlindSensitivePathProjection } from "../src/trace-analysis/model-tools.ts";
import { buildProcessView } from "../src/trace-analysis/process-view.ts";

const PROCESS_VIEW_BYTES_PER_BASE_INVOCATION = 75_000;
const SUPPORTED_CONDITIONS = new Set(["no_skill", "with_skill"]);

export interface ReviewCliOptions {
	plan: string;
	mapping: string;
	credentialFile: string;
	output: string;
	dryRun: boolean;
	json: boolean;
}

export interface AnalysisWorkload {
	total_process_view_bytes: number;
	base_a_invocations: number;
	max_a_invocations: number;
}

export interface ReviewResult {
	status: "ready" | "human_review_ready";
	evaluation_id: string;
	output: string;
	provider_requests?: 0;
	analysis_state?: string;
	report_markdown?: string;
	report_html?: string;
	report_pdf?: string;
	total_process_view_bytes: number;
	base_a_invocations: number;
	max_a_invocations: number;
	a_invocations?: number;
}

type PreparedEvaluation = ReturnType<typeof prepareEvaluationAnalysis>;
type CredentialResolver = ReturnType<typeof createDeferredCredentialFileResolverV35>;
type EvaluationInvocation = (options: Parameters<typeof runEvaluationAnalysis>[0]) => Promise<AnalysisInvocationResult>;

export const REVIEW_HELP = `Purpose:
  Review an existing completed Skill Evaluation.

  This command does not execute Coding Agent runs.

Required:
  --plan <path>
  --mapping <path>
  --credential-file <path>
  --output <path>

Optional:
  --dry-run
  --json
  --help

Output:
  Analysis State and Markdown/HTML/PDF reports; --dry-run performs preflight without Analysis model execution.
`;

export function parseReviewArguments(argv: string[]): ReviewCliOptions | { help: true; json: boolean } {
	const values = new Map<string, string>();
	const flags = new Set<string>();
	const valueNames = new Set(["--plan", "--mapping", "--credential-file", "--output"]);
	const flagNames = new Set(["--dry-run", "--json", "--help"]);
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index]!;
		if (valueNames.has(argument)) {
			if (values.has(argument)) throw new Error(`duplicate argument ${argument}`);
			const value = argv[++index];
			if (value === undefined || value.length === 0) throw new Error(`${argument} requires a value`);
			values.set(argument, value);
			continue;
		}
		if (flagNames.has(argument)) {
			if (flags.has(argument)) throw new Error(`duplicate argument ${argument}`);
			flags.add(argument);
			continue;
		}
		throw new Error(`unknown argument ${argument}`);
	}
	if (flags.has("--help")) return { help: true, json: flags.has("--json") };
	const missing = [...valueNames].filter((name) => !values.has(name));
	if (missing.length > 0) throw new Error(`missing required argument${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
	return {
		plan: values.get("--plan")!, mapping: values.get("--mapping")!, credentialFile: values.get("--credential-file")!, output: values.get("--output")!,
		dryRun: flags.has("--dry-run"), json: flags.has("--json"),
	};
}

function validateOutputRoot(pathValue: string): string {
	const output = resolve(pathValue);
	if (existsSync(output)) {
		const stats = lstatSync(output);
		if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("output root must be an ordinary directory");
		if (readdirSync(output).length !== 0) throw new Error("output root must be empty");
		accessSync(output, constants.W_OK);
		return output;
	}
	const parent = dirname(output);
	if (!existsSync(parent)) throw new Error("output root parent does not exist");
	const parentStats = lstatSync(parent);
	if (!parentStats.isDirectory() || parentStats.isSymbolicLink()) throw new Error("output root parent must be an ordinary directory");
	accessSync(parent, constants.W_OK);
	return output;
}

function validateConditionCompatibility(prepared: PreparedEvaluation): void {
	const unsupported = [...new Set(prepared.evaluatedRuns
		.filter((run) => run.includedForEvaluation)
		.map((run) => run.plan.condition)
		.filter((condition) => !SUPPORTED_CONDITIONS.has(condition)))];
	if (unsupported.length > 0) throw new Error(`current review/report does not support condition${unsupported.length === 1 ? "" : "s"}: ${unsupported.join(", ")}`);
}

export function measureAnalysisWorkload(prepared: PreparedEvaluation): AnalysisWorkload {
	const descriptors = prepared.descriptors.filter((descriptor) => descriptor.evaluation?.includedForEvaluation === true && descriptor.evaluation.evaluable === true);
	const context = createAnalysisContext(descriptors);
	const projection = createBlindSensitivePathProjection(context);
	let totalProcessViewBytes = 0;
	for (const loaded of context.runs.values()) {
		const projected = projection.project(buildProcessView(loaded));
		totalProcessViewBytes += Buffer.byteLength(JSON.stringify(projected), "utf8");
	}
	const baseAInvocations = Math.ceil(totalProcessViewBytes / PROCESS_VIEW_BYTES_PER_BASE_INVOCATION);
	return {
		total_process_view_bytes: totalProcessViewBytes,
		base_a_invocations: baseAInvocations,
		max_a_invocations: baseAInvocations + 1,
	};
}

export async function runBoundedAnalysis(options: {
	plan: string;
	mapping: string;
	output: string;
	credentialResolver: CredentialResolver;
	maxAInvocations: number;
	invoke?: EvaluationInvocation;
}): Promise<{ result: AnalysisInvocationResult; aInvocations: number }> {
	if (!Number.isSafeInteger(options.maxAInvocations) || options.maxAInvocations < 1) throw new Error("max A invocations must be a positive safe integer");
	const invoke = options.invoke ?? runEvaluationAnalysis;
	const common = {
		batchPath: options.plan,
		mappingPath: options.mapping,
		outputDirectory: options.output,
		credentialResolver: options.credentialResolver,
	};
	let result = await invoke({ mode: "fresh", ...common });
	let aInvocations = 1;
	while (result.state.phase === "blind_analysis" && aInvocations < options.maxAInvocations) {
		result = await invoke({ mode: "resume", ...common });
		aInvocations++;
	}
	if (result.state.phase === "blind_analysis") {
		throw new Error(`A invocation bound exhausted at ${aInvocations}/${options.maxAInvocations}; persisted State remains blind_analysis`);
	}
	if (result.state.phase !== "alignment_ready") throw new Error(`A lifecycle reached unexpected phase ${result.state.phase}`);
	result = await invoke({ mode: "resume", ...common });
	if (result.stage !== "controlled_unblind" || result.state.phase !== "human_review_ready") throw new Error("controlled-unblind lifecycle did not reach human_review_ready");
	return { result, aInvocations };
}

export async function reviewEvaluation(options: ReviewCliOptions, dependencies: {
	credentialResolverFactory?: (path: string) => CredentialResolver;
	invoke?: EvaluationInvocation;
	generateReports?: typeof generateAnalysisReports;
	onStage?: (stage: "preflight" | "analysis" | "report") => void;
} = {}): Promise<ReviewResult> {
	dependencies.onStage?.("preflight");
	const plan = resolve(options.plan);
	const mapping = resolve(options.mapping);
	const prepared = prepareEvaluationAnalysis({ batchPath: plan, mappingPath: mapping });
	if (!prepared.comparison.has_analyzable_group) throw new Error("Evaluation has no complete evaluable comparison group");
	await loadFrozenSkillEvidenceFromEvaluation(plan);
	validateConditionCompatibility(prepared);
	const credentialResolver = (dependencies.credentialResolverFactory ?? createDeferredCredentialFileResolverV35)(resolve(options.credentialFile));
	const output = validateOutputRoot(options.output);
	const workload = measureAnalysisWorkload(prepared);
	if (options.dryRun) {
		return { status: "ready", evaluation_id: prepared.batch.evaluation_id, output, provider_requests: 0, ...workload };
	}
	dependencies.onStage?.("analysis");
	const analysis = await runBoundedAnalysis({ plan, mapping, output, credentialResolver, maxAInvocations: workload.max_a_invocations, ...(dependencies.invoke ? { invoke: dependencies.invoke } : {}) });
	dependencies.onStage?.("report");
	const generateReports = dependencies.generateReports ?? generateAnalysisReports;
	const reports: GeneratedAnalysisReportPaths = await generateReports({ batchPath: plan, mappingPath: mapping, statePath: analysis.result.state_path });
	return {
		status: "human_review_ready", evaluation_id: prepared.batch.evaluation_id, output,
		analysis_state: analysis.result.state_path, report_markdown: reports.markdown, report_html: reports.html, report_pdf: reports.pdfBrief,
		...workload, a_invocations: analysis.aInvocations,
	};
}

export function formatHumanResult(result: ReviewResult): string {
	if (result.status === "ready") return `Evaluation review preflight ready\n\nEvaluation: ${result.evaluation_id}\nStatus: ready\nOutput:\n${result.output}\n`;
	return `Evaluation review complete\n\nEvaluation: ${result.evaluation_id}\nStatus: human_review_ready\n\nAnalysis State:\n${result.analysis_state}\n\nMarkdown:\n${result.report_markdown}\n\nHTML:\n${result.report_html}\n\nPDF:\n${result.report_pdf}\n`;
}

async function main(): Promise<void> {
	const jsonMode = process.argv.slice(2).includes("--json");
	let stage = "arguments";
	try {
		const parsed = parseReviewArguments(process.argv.slice(2));
		if ("help" in parsed) {
			process.stdout.write(REVIEW_HELP);
			return;
		}
		const result = await reviewEvaluation(parsed, { onStage: (nextStage) => { stage = nextStage; } });
		process.stdout.write(parsed.json ? `${JSON.stringify(result)}\n` : formatHumanResult(result));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (jsonMode) process.stdout.write(`${JSON.stringify({ status: "error", stage, message })}\n`);
		process.stderr.write(`Evaluation review failed (${stage}): ${message}\n`);
		process.exitCode = 1;
	}
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) await main();
