import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { buildSkillCandidate, replaySkillCandidate } from "../src/skill-build/build.ts";
import type { NormalizedCodingRun } from "../src/coding-task/normalization.ts";
import type { CandidateSpec, InductionModelRuntime } from "../src/skill-build/contracts.ts";
import { buildInductionUserPrompt, induceProcedureDetailed, INDUCTION_PROMPT_ID, INDUCTION_SYSTEM_PROMPT, parseInductionDecision } from "../src/skill-build/inducer.ts";
import { renderSkill } from "../src/skill-build/renderer.ts";
import { loadSourceRunSet } from "../src/skill-build/source-loader.ts";
import { validateCandidateSpec, validateSourceAbV1FixedLiterals } from "../src/skill-build/validator.ts";

const RUN_A = "coding-task-source-a";
const RUN_B = "coding-task-source-b";

function normalized(runId: string, action: string, verifier: "passed" | "failed" | "not_run" = "passed"): NormalizedCodingRun {
	return {
		runId,
		task: { taskId: `task-${action}`, prompt: `Add the repository action \`${action}\` and verify it with \`npm test\`.`, sourceRevision: "a".repeat(40), existingTreeDigest: null, writablePaths: ["src/**", "test/**"], protectedPaths: ["package.json"] },
		outcome: { executionStatus: "completed", verificationStatus: verifier, failureReason: null },
		operations: [
			{ tool: "workspace_read", target: "src/action-registry.ts", status: "success", source: { file: "trace.json", record: 1 } },
			{ tool: "workspace_edit", target: "src/action-registry.ts", status: "success", source: { file: "trace.json", record: 2 } },
			{ tool: "run_command", target: "npm_test", status: "success", source: { file: "trace.json", record: 3 } },
		],
		tests: [{ command: "npm_test", passed: true, source: { file: "trace.json", record: 3 } }],
		changes: { added: [`src/actions/${action}.ts`], modified: ["src/action-registry.ts", "test/actions.test.ts"], deleted: [], sourceFile: "run-manifest.json" },
		verifier: { status: verifier, sourceFile: "verifier/result.json" },
	};
}

function fixture(options: { duplicate?: boolean; verifier?: "passed" | "failed" | "not_run"; taskFamily?: string; single?: boolean } = {}): { root: string; setPath: string } {
	const root = mkdtempSync(resolve(tmpdir(), "commit2b-source-"));
	const taskFamily = options.taskFamily ?? "source-family-v1";
	const a = normalized(RUN_A, "action_one");
	const b = normalized(options.duplicate ? RUN_A : RUN_B, "action_two", options.verifier ?? "passed");
	writeFileSync(resolve(root, "a.json"), `${JSON.stringify(a, null, 2)}\n`);
	writeFileSync(resolve(root, "b.json"), `${JSON.stringify(b, null, 2)}\n`);
	const set = {
		taskFamily,
		sourceRuns: [
			{ sourceRunId: RUN_A, taskFamily, sourceRunPath: "unused-a", normalizedRunPath: "a.json", historicalVerifierStatus: "passed" },
			{ sourceRunId: options.duplicate ? RUN_A : RUN_B, taskFamily, sourceRunPath: "unused-b", normalizedRunPath: "b.json", historicalVerifierStatus: options.verifier ?? "passed" },
		].slice(0, options.single ? 1 : 2),
	};
	const setPath = resolve(root, "source-run-set.json");
	writeFileSync(setPath, `${JSON.stringify(set, null, 2)}\n`);
	return { root, setPath };
}

function candidate(supportRunIds = [RUN_A, RUN_B], taskFamily = "source-family-v1"): CandidateSpec {
	return {
		schema_version: 1,
		title: "Repository action extension procedure",
		task_family: taskFamily,
		when_to_use: ["Extending an existing repository action registry with a bounded state transition"],
		steps: [
			{ instruction: "Inspect the registry, dispatcher, contracts, neighboring actions, and tests to identify the established extension points and invariants.", support_run_ids: supportRunIds },
			{ instruction: "Implement the smallest conforming handler, register it through the existing extension point, and add success and rejection-path tests.", support_run_ids: supportRunIds },
			{ instruction: "Run the repository's registered complete test command and inspect the result before reporting completion.", support_run_ids: supportRunIds },
		],
		completion_checks: ["The new handler follows neighboring conventions and is reachable through the existing registry.", "Success and rejection behavior are covered by tests, and the registered suite passes."],
		do_not: ["Do not mutate unrelated entities or emit effects on rejected requests.", "Do not change protected project configuration to bypass the registered suite."],
	};
}

function decision(spec: CandidateSpec = candidate()): string {
	const { task_family: _deterministic, ...draft } = spec;
	return JSON.stringify({ decision: "build", rationale: "The supplied runs share a registry extension, guarded state transition, paired tests, and registered-suite verification procedure.", candidate: draft });
}

function runtime(outputs: string[]): InductionModelRuntime {
	let index = 0;
	return { async complete() { const text = outputs[index++]!; return { text, model: "deepseek/deepseek-v4-flash", input_tokens: 20, output_tokens: 10, duration_ms: 3 }; } };
}

test("loads an ordered valid SourceRunSet through normalizedRunPath", () => {
	const loaded = loadSourceRunSet(fixture().setPath);
	assert.deepEqual(loaded.sourceRunIds, [RUN_A, RUN_B]);
	assert.equal(loaded.runs[0]?.operations[0]?.source.record, 1);
	assert.equal(loaded.runs[1]?.verifier.status, "passed");
});

test("accepts evidence-valid failed outcomes and rejects not_run or duplicate identities", () => {
	assert.throws(() => loadSourceRunSet(fixture({ duplicate: true }).setPath), /unique/);
	assert.equal(loadSourceRunSet(fixture({ verifier: "failed" }).setPath).runs[1]?.outcome.verificationStatus, "failed");
	assert.throws(() => loadSourceRunSet(fixture({ verifier: "not_run" }).setPath), /not learning-eligible|not valid learning evidence/);
	assert.equal(loadSourceRunSet(fixture({ single: true }).setPath).runs.length, 1);
	assert.throws(() => loadSourceRunSet(fixture({ single: true, taskFamily: "source-ab-v1" }).setPath), /at least two/);
});

test("the model Draft omits task_family and the host fills it from SourceRunSet", async () => {
	let calls = 0;
	const response = decision();
	assert.doesNotMatch(response, /task_family/);
	assert.doesNotMatch(INDUCTION_SYSTEM_PROMPT, /candidate\.task_family|"task_family"/);
	const fake = runtime([response]);
	const wrapped: InductionModelRuntime = { async complete(system, user) { calls++; return fake.complete(system, user); } };
	const source = loadSourceRunSet(fixture().setPath);
	const result = await induceProcedureDetailed(source.runs, { buildId: "test-build", taskFamily: source.taskFamily }, wrapped);
	assert.equal(result.decision.decision, "build");
	assert.equal(result.decision.candidate?.task_family, source.taskFamily);
	assert.equal(result.usage.request_count, 1);
	assert.equal(calls, 1);
	const withModelFamily = JSON.parse(response) as Record<string, unknown>;
	(withModelFamily.candidate as Record<string, unknown>).task_family = "model-owned-family";
	assert.throws(() => parseInductionDecision(JSON.stringify(withModelFamily), source.taskFamily), /exact keys/);
});

test("the v2 Prompt calibrates repository-role abstraction without source answers", () => {
	assert.equal(INDUCTION_PROMPT_ID, "bundle-procedure-induction-v2");
	assert.match(INDUCTION_SYSTEM_PROMPT, /different concrete values occupy the same repository-level role/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /do not need to implement the same domain action/);
	for (const supportedStep of ["repository operation", "integration step", "extension point", "behavioral invariant", "test-and-verification step"]) {
		assert.match(INDUCTION_SYSTEM_PROMPT, new RegExp(supportedStep));
	}
	assert.match(INDUCTION_SYSTEM_PROMPT, /Generic coding practices such as reading code, editing a target file, adding tests, fixing failures, or running tests are not sufficient by themselves/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /Do not introduce a parameter schema, placeholder language, template variables/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /failed-task evidence may support.*failure-derived lesson/i);
	assert.match(INDUCTION_SYSTEM_PROMPT, /If Runs conflict, distinguish their outcomes and omit the disputed claim/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /Run-level outcome as context.*never as a blanket positive or negative label/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /Do not treat every behavior in a passed Run as correct/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /do not treat every behavior in a failed Run as incorrect/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /failed Run may support a positive local procedure/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /passed Run may support an avoidance or negative lesson/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /Never recommend a behavior merely because it appears in a passed Run/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /never reject a behavior merely because it appears in a failed Run/);
	assert.match(INDUCTION_SYSTEM_PROMPT, /If evidence conflicts or is insufficient for a claim, omit that claim or return insufficient_evidence rather than forcing synthesis/);
	assert.doesNotMatch(INDUCTION_SYSTEM_PROMPT, /both runs/i);
	for (const forbidden of ["pause_job", "disable_worker", "job.paused", "worker.disabled", "pause-job.ts", "disable-worker.ts", "action handler", "central registry", "no side effects", "one audit event", "unified action tests"]) {
		assert.doesNotMatch(INDUCTION_SYSTEM_PROMPT, new RegExp(forbidden.replace(".", "\\."), "i"));
	}
	const runs = [normalized(RUN_A, "action_one"), normalized(RUN_B, "action_two")];
	assert.deepEqual(JSON.parse(buildInductionUserPrompt(runs, { buildId: "prompt-test", taskFamily: "source-family-v1" })), {
		build_id: "prompt-test",
		task_family: "source-family-v1",
		normalized_runs: runs,
	});
});

test("the generic Validator accepts one real lineage while source-ab-v1 retains two-Run support", () => {
	const source = loadSourceRunSet(fixture().setPath);
	assert.equal(validateCandidateSpec(candidate([RUN_A]), source).passed, true);
	const specialized = loadSourceRunSet(fixture({ taskFamily: "source-ab-v1" }).setPath);
	assert.equal(validateCandidateSpec(candidate([RUN_A], "source-ab-v1"), specialized).passed, false);
	const ordinary = candidate();
	ordinary.steps[0]!.instruction += " Inspect README.md while handling running, paused, jobId, action_one, and trace.json conventions.";
	assert.equal(validateCandidateSpec(ordinary, source).passed, true);
});

test("the source-ab-v1 Smoke check is fixed, local, and diagnostic", () => {
	const spec = candidate([RUN_A, RUN_B], "source-ab-v1");
	spec.steps[2]!.instruction = "Run the suite after implementing pause_job.";
	const result = validateSourceAbV1FixedLiterals(spec);
	assert.equal(result.passed, false);
	assert.deepEqual(result.issues[0], { code: "source_specific_content", message: "Candidate contains a fixed source-ab-v1 Smoke literal", field: "steps[2].instruction", matched_value: "pause_job", rule: "source_ab_v1_fixed_literal" });
	assert.equal(result.issues.length, 1);
});

test("renderer is byte-deterministic and excludes support lineage", () => {
	const first = renderSkill(candidate());
	assert.equal(first, renderSkill(candidate()));
	assert.doesNotMatch(first, /coding-task-source|support_run_ids/);
	assert.match(first, /disable-model-invocation: true/);
});

test("built artifacts have a correct Skill SHA and pass the existing Loader preflight", async () => {
	const source = fixture();
	const output = resolve(source.root, "build");
	const result = await buildSkillCandidate({ buildId: "test-build", sourceRunSetPath: source.setPath, outputDirectory: output, model: "deepseek/deepseek-v4-flash" }, { runtime: runtime([decision()]) });
	assert.equal(result.status, "built", result.error?.message);
	const build = JSON.parse(readFileSync(result.buildPath, "utf8")) as Record<string, unknown>;
	assert.equal(build.loader_preflight, "passed");
	assert.equal(build.raw_response_text, decision());
	assert.equal((build.parsed_candidate as CandidateSpec).task_family, "source-family-v1");
	assert.equal(build.skill_sha256, (await import("../src/hash.ts")).fileSha256(result.skillPath!));
	assert.equal(existsSync(resolve(output, "skill", "manifest.json")), false);
});

test("mechanically invalid Candidate remains invalid rather than insufficient_evidence", async () => {
	const source = fixture();
	const result = await buildSkillCandidate({ buildId: "invalid-build", sourceRunSetPath: source.setPath, outputDirectory: resolve(source.root, "invalid-build"), model: "deepseek/deepseek-v4-flash" }, { runtime: runtime([decision(candidate(["unknown-run"]))]) });
	assert.equal(result.status, "invalid");
	assert.match(result.error?.message ?? "", /unknown_support_run/);
	const build = JSON.parse(readFileSync(result.buildPath, "utf8")) as { status: string; raw_response_text: string | null; parsed_candidate: CandidateSpec | null };
	assert.equal(build.status, "invalid");
	assert.ok(build.raw_response_text);
	assert.equal(build.parsed_candidate?.steps[0]?.support_run_ids.length, 1);
});

test("fixed-literal invalid preserves raw and parsed Candidate and replays without a model", async () => {
	const source = fixture({ taskFamily: "source-ab-v1" });
	const spec = candidate([RUN_A, RUN_B], "source-ab-v1");
	spec.steps[2]!.instruction = "Run pause_job through the suite.";
	let calls = 0;
	const fake = runtime([decision(spec)]);
	const request = { buildId: "diagnostic-invalid", sourceRunSetPath: source.setPath, outputDirectory: resolve(source.root, "diagnostic-invalid"), model: "deepseek/deepseek-v4-flash" };
	const first = await buildSkillCandidate(request, { runtime: { async complete(system, user) { calls++; return fake.complete(system, user); } } });
	assert.equal(first.status, "invalid");
	const saved = JSON.parse(readFileSync(first.buildPath, "utf8")) as { raw_response_text: string | null; parsed_candidate: CandidateSpec | null; validation: { issues: Array<Record<string, unknown>> }; deterministic_replay_count: number };
	assert.equal(saved.raw_response_text, decision(spec));
	assert.equal(saved.parsed_candidate?.task_family, "source-ab-v1");
	assert.equal(saved.validation.issues[0]?.matched_value, "pause_job");
	const replayed = await replaySkillCandidate(request);
	assert.equal(replayed.status, "invalid");
	assert.equal(calls, 1);
	const afterReplay = JSON.parse(readFileSync(first.buildPath, "utf8")) as { deterministic_replay_count: number; parsed_candidate: CandidateSpec };
	assert.equal(afterReplay.deterministic_replay_count, 1);
	assert.deepEqual(afterReplay.parsed_candidate, saved.parsed_candidate);
});

test("parser failure preserves the sole raw response and makes no second request", async () => {
	const source = fixture();
	let calls = 0;
	const request = { buildId: "parser-invalid", sourceRunSetPath: source.setPath, outputDirectory: resolve(source.root, "parser-invalid"), model: "deepseek/deepseek-v4-flash" };
	const result = await buildSkillCandidate(request, { runtime: { async complete() { calls++; return { text: "not-json", model: "deepseek/deepseek-v4-flash", input_tokens: 1, output_tokens: 1, duration_ms: 1 }; } } });
	assert.equal(result.status, "invalid");
	assert.equal(calls, 1);
	const build = JSON.parse(readFileSync(result.buildPath, "utf8")) as { raw_response_text: string | null; parsed_candidate: CandidateSpec | null; error: { code: string } };
	assert.equal(build.raw_response_text, "not-json");
	assert.equal(build.parsed_candidate, null);
	assert.equal(build.error.code, "invalid_model_json");
});
