import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
	buildSkillFromRuns,
	formatBuildSkillFromRunsResult,
	parseBuildSkillFromRunsArguments,
	type BuildSkillFromRunsOptions,
} from "../scripts/build-skill-from-runs.ts";
import type { SkillBuildArtifact, SkillBuildRequest, SkillBuildResult } from "../src/skill-build/contracts.ts";

const RUN_FIXTURE = resolve(import.meta.dirname, "fixtures", "coding-task-normalization", "complete-run");

function json(path: string, value: unknown): void {
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fixture(count = 2): { root: string; options: BuildSkillFromRunsOptions; runs: string[] } {
	const root = mkdtempSync(resolve(tmpdir(), "build-skill-from-runs-cli-"));
	const runs = Array.from({ length: count }, (_, index) => {
		const path = resolve(root, `run-${index + 1}`);
		cpSync(RUN_FIXTURE, path, { recursive: true });
		const manifestPath = resolve(path, "run-manifest.json");
		const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
		manifest.run_id = `fixture-run-${index + 1}`;
		json(manifestPath, manifest);
		return path;
	});
	return { root, runs, options: { taskFamily: "fixture-family", sourceRuns: runs, buildId: "fixture-build", output: resolve(root, "output"), json: true } };
}

function setOutcome(run: string, status: "passed" | "failed" | "not_run"): void {
	const verifierPath = resolve(run, "verifier", "result.json"); const verifier = JSON.parse(readFileSync(verifierPath, "utf8")) as Record<string, unknown>; verifier.status = status; json(verifierPath, verifier);
	const manifestPath = resolve(run, "run-manifest.json"); const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>; manifest.verification_status = status; json(manifestPath, manifest);
}

function writeBuild(request: SkillBuildRequest, status: SkillBuildResult["status"]): SkillBuildResult {
	const buildPath = resolve(request.outputDirectory, "build.json");
	const artifact: SkillBuildArtifact = {
		schema_version: 1, request, status, source_run_set_path: request.sourceRunSetPath, source_run_set_sha256: "a".repeat(64), source_run_ids: [],
		model: request.model, prompt_id: "bundle-procedure-induction-v2", request_count: 1, input_tokens: 1, output_tokens: 1, duration_ms: 1,
		induction_decision: status === "insufficient_evidence" ? "insufficient_evidence" : "build", rationale: "fixture", raw_response_text: "{}", parsed_candidate: null,
		candidate_spec_path: null, skill_path: null, skill_sha256: null, validation: { passed: status !== "invalid", issues: [] }, loader_preflight: "not_run", deterministic_replay_count: 0,
		error: status === "invalid" ? { code: "invalid_model_json", message: "fixture invalid" } : null,
	};
	if (status === "built") {
		const specPath = resolve(request.outputDirectory, "candidate-spec.json");
		const skillPath = resolve(request.outputDirectory, "skill", "SKILL.md");
		json(specPath, { schema_version: 1 });
		mkdirSync(resolve(skillPath, ".."), { recursive: true });
		writeFileSync(skillPath, "fixture skill\n", "utf8");
		artifact.candidate_spec_path = specPath;
		artifact.skill_path = skillPath;
		artifact.skill_sha256 = "b".repeat(64);
		artifact.loader_preflight = "passed";
		json(buildPath, artifact);
		return { status, buildPath, specPath, skillPath };
	}
	json(buildPath, artifact);
	return { status, buildPath, ...(artifact.error ? { error: artifact.error } : {}) };
}

test("arguments accept repeated Source Runs and expose help", () => {
	assert.deepEqual(parseBuildSkillFromRunsArguments(["--help"]), { help: true, json: false });
	const parsed = parseBuildSkillFromRunsArguments(["--task-family", "family", "--source-run", "one", "--source-run", "two", "--build-id", "build", "--output", "out", "--json"]);
	assert.ok(!("help" in parsed));
	assert.deepEqual(parsed.sourceRuns, ["one", "two"]);
});

test("an empty set or duplicate Source Run paths fail before induction", async () => {
	for (const kind of ["empty", "duplicate"] as const) {
		const value = fixture(2);
		let calls = 0;
		try {
			const sourceRuns = kind === "empty" ? [] : [value.runs[0]!, value.runs[0]!];
			await assert.rejects(buildSkillFromRuns({ ...value.options, sourceRuns }, { buildCandidate: async (request) => { calls++; return writeBuild(request, "built"); } }), kind === "empty" ? /at least one/ : /must be unique/);
			assert.equal(calls, 0);
			assert.equal(existsSync(value.options.output), false);
		} finally { rmSync(value.root, { recursive: true, force: true }); }
	}
});

test("not_run or structurally invalid Source Runs are rejected before induction", async () => {
	for (const kind of ["not_run", "missing-trace"] as const) {
		const value = fixture(2);
		let calls = 0;
		try {
			if (kind === "not_run") setOutcome(value.runs[1]!, "not_run");
			else rmSync(resolve(value.runs[1]!, "trace.json"));
			await assert.rejects(buildSkillFromRuns(value.options, { buildCandidate: async (request) => { calls++; return writeBuild(request, "built"); } }));
			assert.equal(calls, 0);
		} finally { rmSync(value.root, { recursive: true, force: true }); }
	}
});

test("mixed passed/failed Runs are normalized in order and produce the existing built result", async () => {
	const value = fixture(2);
	setOutcome(value.runs[1]!, "failed");
	let calls = 0;
	try {
		const result = await buildSkillFromRuns(value.options, { buildCandidate: async (request) => {
			calls++;
			const sourceSet = JSON.parse(readFileSync(request.sourceRunSetPath, "utf8")) as { sourceRuns: Array<{ sourceRunId: string; historicalVerifierStatus: string }> };
			assert.deepEqual(sourceSet.sourceRuns.map((entry) => entry.sourceRunId), ["fixture-run-1", "fixture-run-2"]);
			assert.deepEqual(sourceSet.sourceRuns.map((entry) => entry.historicalVerifierStatus), ["passed", "failed"]);
			return writeBuild(request, "built");
		}, preflightRuntime: () => {} });
		assert.equal(calls, 1);
		assert.equal(result.build_status, "built");
		assert.equal(result.source_run_count, 2);
		assert.equal(result.skill_sha256, "b".repeat(64));
		assert.equal(existsSync(result.source_run_set), true);
		assert.equal(existsSync(result.candidate_spec!), true);
		assert.equal(existsSync(result.skill!), true);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("one generic evidence-valid Run can reach induction", async () => {
	const value = fixture(1); let calls = 0;
	try {
		const result = await buildSkillFromRuns(value.options, { buildCandidate: async (request) => { calls++; return writeBuild(request, "insufficient_evidence"); }, preflightRuntime: () => {} });
		assert.equal(calls, 1); assert.equal(result.source_run_count, 1); assert.equal(result.build_status, "insufficient_evidence");
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("source-ab-v1 retains its local two-Run preflight", async () => {
	const value = fixture(1); let calls = 0;
	try {
		await assert.rejects(buildSkillFromRuns({ ...value.options, taskFamily: "source-ab-v1" }, { buildCandidate: async (request) => { calls++; return writeBuild(request, "built"); }, preflightRuntime: () => {} }), /source-ab-v1.*at least two/);
		assert.equal(calls, 0);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("insufficient_evidence is returned once without retry or invented Candidate paths", async () => {
	const value = fixture(2);
	let calls = 0;
	try {
		const result = await buildSkillFromRuns(value.options, { buildCandidate: async (request) => { calls++; return writeBuild(request, "insufficient_evidence"); }, preflightRuntime: () => {} });
		assert.equal(calls, 1);
		assert.equal(result.build_status, "insufficient_evidence");
		assert.equal(result.candidate_spec, undefined);
		assert.equal(result.skill, undefined);
		assert.equal(result.skill_sha256, undefined);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("JSON output is one parseable document", async () => {
	const value = fixture(2);
	try {
		const result = await buildSkillFromRuns(value.options, { buildCandidate: async (request) => writeBuild(request, "invalid"), preflightRuntime: () => {} });
		const parsed = JSON.parse(formatBuildSkillFromRunsResult(result, true)) as Record<string, unknown>;
		assert.equal(parsed.build_status, "invalid");
		assert.equal(parsed.candidate_spec, undefined);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("an operational build failure is a CLI error without retry", async () => {
	const value = fixture(2);
	let calls = 0;
	try {
		await assert.rejects(buildSkillFromRuns(value.options, { buildCandidate: async (request) => {
			calls++;
			const result = writeBuild(request, "invalid");
			const artifact = JSON.parse(readFileSync(result.buildPath, "utf8")) as SkillBuildArtifact;
			artifact.error = { code: "skill_build_invalid", message: "fixture IO failure" };
			json(result.buildPath, artifact);
			return { ...result, error: artifact.error };
		}, preflightRuntime: () => {} }), /Candidate build execution failed: fixture IO failure/);
		assert.equal(calls, 1);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("three Source Runs preserve order and do not introduce an exactly-two assumption", async () => {
	const value = fixture(3);
	try {
		const result = await buildSkillFromRuns(value.options, { buildCandidate: async (request) => writeBuild(request, "insufficient_evidence"), preflightRuntime: () => {} });
		assert.equal(result.source_run_count, 3);
		assert.deepEqual(result.source_run_ids, ["fixture-run-1", "fixture-run-2", "fixture-run-3"]);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});
