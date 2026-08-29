import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileSha256 } from "../hash.ts";
import { loadAdaptiveSkillV3 } from "../skill/adapter-v3.ts";
import type { CandidateSpec, InductionModelRuntime, InductionUsage, LoadedSourceRunSet, SkillBuildArtifact, SkillBuildRequest, SkillBuildResult, SkillInductionDecision, ValidationResult } from "./contracts.ts";
import { induceProcedureDetailed, InductionFailure, INDUCTION_PROMPT_ID, parseInductionDecision } from "./inducer.ts";
import { GENERATED_SKILL_NAME, renderSkill } from "./renderer.ts";
import { loadSourceRunSet } from "./source-loader.ts";
import { validateCandidateSpec, validateSourceAbV1FixedLiterals } from "./validator.ts";

const SUPPORTED_MODEL = "deepseek/deepseek-v4-flash";

function nonEmpty(value: string, label: string): void { if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`); }

export class OutputDirectoryNotEmptyError extends Error {
	constructor(path: string) { super(`output directory already exists and is non-empty: ${path}`); this.name = "OutputDirectoryNotEmptyError"; }
}

function prepareOutput(path: string): string {
	const root = resolve(path);
	if (existsSync(root) && readdirSync(root).length > 0) throw new OutputDirectoryNotEmptyError(root);
	mkdirSync(root, { recursive: true });
	return root;
}

function emptyUsage(model: string): InductionUsage { return { prompt_id: INDUCTION_PROMPT_ID, model, request_count: 0, input_tokens: null, output_tokens: null, duration_ms: null }; }
function failedValidation(): ValidationResult { return { passed: false, issues: [] }; }

function writeBuild(path: string, artifact: SkillBuildArtifact): void {
	writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
}

function writeDeterministicFile(path: string, bytes: string): void {
	mkdirSync(dirname(path), { recursive: true });
	if (existsSync(path)) {
		if (readFileSync(path, "utf8") !== bytes) throw new Error(`deterministic replay would change existing artifact: ${path}`);
		return;
	}
	writeFileSync(path, bytes, { encoding: "utf8", flag: "wx" });
}

function initialArtifact(request: SkillBuildRequest, sourcePath: string, replayCount = 0): SkillBuildArtifact {
	const usage = emptyUsage(request.model);
	return {
		schema_version: 1,
		request,
		status: "invalid",
		source_run_set_path: sourcePath,
		source_run_set_sha256: null,
		source_run_ids: [],
		model: usage.model,
		prompt_id: usage.prompt_id,
		request_count: usage.request_count,
		input_tokens: usage.input_tokens,
		output_tokens: usage.output_tokens,
		duration_ms: usage.duration_ms,
		induction_decision: null,
		rationale: null,
		raw_response_text: null,
		parsed_candidate: null,
		candidate_spec_path: null,
		skill_path: null,
		skill_sha256: null,
		validation: failedValidation(),
		loader_preflight: "not_run",
		deterministic_replay_count: replayCount,
		error: null,
	};
}

function applyUsage(artifact: SkillBuildArtifact, usage: InductionUsage): void {
	artifact.model = usage.model;
	artifact.prompt_id = usage.prompt_id;
	artifact.request_count = usage.request_count;
	artifact.input_tokens = usage.input_tokens;
	artifact.output_tokens = usage.output_tokens;
	artifact.duration_ms = usage.duration_ms;
}

function candidateFailure(artifact: SkillBuildArtifact, buildPath: string, validation: ValidationResult): SkillBuildResult {
	artifact.status = "invalid";
	artifact.validation = validation;
	artifact.loader_preflight = "not_run";
	artifact.candidate_spec_path = null;
	artifact.skill_path = null;
	artifact.skill_sha256 = null;
	artifact.error = { code: "skill_build_invalid", message: validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("; ") };
	writeBuild(buildPath, artifact);
	return { status: "invalid", buildPath, error: artifact.error };
}

async function settleDecision(options: { request: SkillBuildRequest; output: string; buildPath: string; source: LoadedSourceRunSet; artifact: SkillBuildArtifact; decision: SkillInductionDecision }): Promise<SkillBuildResult> {
	const { request, output, buildPath, source, artifact, decision } = options;
	artifact.induction_decision = decision.decision;
	artifact.rationale = decision.rationale;
	artifact.parsed_candidate = decision.candidate;
	artifact.error = null;
	writeBuild(buildPath, artifact);
	if (decision.decision === "insufficient_evidence") {
		artifact.status = "insufficient_evidence";
		artifact.validation = { passed: true, issues: [] };
		writeBuild(buildPath, artifact);
		return { status: "insufficient_evidence", buildPath };
	}
	const candidate = decision.candidate!;
	let validation = validateCandidateSpec(candidate, source);
	if (validation.passed && source.taskFamily === "source-ab-v1") validation = validateSourceAbV1FixedLiterals(candidate);
	if (!validation.passed) return candidateFailure(artifact, buildPath, validation);
	const skill = renderSkill(candidate);
	if (source.taskFamily === "source-ab-v1") {
		const skillValidation = validateSourceAbV1FixedLiterals(candidate, skill);
		if (!skillValidation.passed) return candidateFailure(artifact, buildPath, skillValidation);
	}
	const specPath = resolve(output, "candidate-spec.json");
	const skillDirectory = resolve(output, "skill");
	const skillPath = resolve(skillDirectory, "SKILL.md");
	writeDeterministicFile(specPath, `${JSON.stringify(candidate, null, 2)}\n`);
	writeDeterministicFile(skillPath, skill);
	const skillSha256 = fileSha256(skillPath);
	await loadAdaptiveSkillV3({ skillRoot: skillDirectory, expectedName: GENERATED_SKILL_NAME, expectedSourceSha256: skillSha256 });
	artifact.status = "built";
	artifact.candidate_spec_path = specPath;
	artifact.skill_path = skillPath;
	artifact.skill_sha256 = skillSha256;
	artifact.validation = validation;
	artifact.loader_preflight = "passed";
	artifact.error = null;
	writeBuild(buildPath, artifact);
	return { status: "built", specPath, skillPath, buildPath };
}

export async function buildSkillCandidate(request: SkillBuildRequest, dependencies: { runtime?: InductionModelRuntime } = {}): Promise<SkillBuildResult> {
	for (const [label, value] of [["buildId", request.buildId], ["sourceRunSetPath", request.sourceRunSetPath], ["outputDirectory", request.outputDirectory], ["model", request.model]] as const) nonEmpty(value, label);
	const output = prepareOutput(request.outputDirectory);
	const buildPath = resolve(output, "build.json");
	const artifact = initialArtifact(request, resolve(request.sourceRunSetPath));
	try {
		if (request.model !== SUPPORTED_MODEL) throw new Error(`unsupported model: ${request.model}`);
		const source = loadSourceRunSet(request.sourceRunSetPath);
		artifact.source_run_set_path = source.path;
		artifact.source_run_set_sha256 = fileSha256(source.path);
		artifact.source_run_ids = source.sourceRunIds;
		const execution = await induceProcedureDetailed(source.runs, { buildId: request.buildId, taskFamily: source.taskFamily }, dependencies.runtime, {
			onRawResponse(response, usage) {
				artifact.raw_response_text = response.text;
				applyUsage(artifact, usage);
				artifact.error = { code: "response_saved_pending_parse", message: "model response saved; parsing not yet complete" };
				writeBuild(buildPath, artifact);
			},
			onParsedDecision(decision, usage) {
				applyUsage(artifact, usage);
				artifact.induction_decision = decision.decision;
				artifact.rationale = decision.rationale;
				artifact.parsed_candidate = decision.candidate;
				artifact.error = { code: "candidate_saved_pending_validation", message: "parsed Candidate saved; validation not yet complete" };
				writeBuild(buildPath, artifact);
			},
		});
		applyUsage(artifact, execution.usage);
		return await settleDecision({ request, output, buildPath, source, artifact, decision: execution.decision });
	} catch (error) {
		if (error instanceof InductionFailure) applyUsage(artifact, error.usage);
		artifact.status = "invalid";
		artifact.error = { code: error instanceof InductionFailure ? error.code : "skill_build_invalid", message: error instanceof Error ? error.message : String(error) };
		writeBuild(buildPath, artifact);
		return { status: "invalid", buildPath, error: artifact.error };
	}
}

export async function replaySkillCandidate(request: SkillBuildRequest): Promise<SkillBuildResult> {
	const output = resolve(request.outputDirectory);
	const buildPath = resolve(output, "build.json");
	if (!existsSync(buildPath)) throw new Error(`replay build.json is missing: ${buildPath}`);
	const prior = JSON.parse(readFileSync(buildPath, "utf8")) as SkillBuildArtifact;
	if (JSON.stringify(prior.request) !== JSON.stringify(request)) throw new Error("replay request does not match saved Build Request");
	if (prior.raw_response_text === null) throw new Error("replay requires saved raw_response_text");
	const source = loadSourceRunSet(request.sourceRunSetPath);
	if (prior.source_run_set_sha256 !== fileSha256(source.path) || JSON.stringify(prior.source_run_ids) !== JSON.stringify(source.sourceRunIds)) throw new Error("replay SourceRunSet identity mismatch");
	const decision = parseInductionDecision(prior.raw_response_text, source.taskFamily);
	if (prior.parsed_candidate !== null && JSON.stringify(prior.parsed_candidate) !== JSON.stringify(decision.candidate)) throw new Error("replay would change saved Candidate content");
	const artifact = { ...prior, deterministic_replay_count: prior.deterministic_replay_count + 1, parsed_candidate: decision.candidate };
	return settleDecision({ request, output, buildPath, source, artifact, decision });
}
