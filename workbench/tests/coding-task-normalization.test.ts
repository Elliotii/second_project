import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { normalizeCodingRun, resolveSourceLocation } from "../src/coding-task/normalization.ts";
import { prepareSourceRunSet } from "../src/coding-task/source-run-set.ts";

const FIXTURE = resolve(import.meta.dirname, "fixtures/coding-task-normalization/complete-run");

function temp(label: string): string {
	return mkdtempSync(resolve(tmpdir(), `coding-task-normalization-${label}-`));
}

function copiedRun(label: string): string {
	const root = temp(label);
	cpSync(FIXTURE, root, { recursive: true });
	return root;
}

function json(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

test("a complete raw Run fixture produces the minimal NormalizedCodingRun", () => {
	const output = temp("complete-output");
	const normalized = normalizeCodingRun({ sourceRunPath: FIXTURE }, output);
	assert.equal(normalized.runId, "fixture-run-001");
	assert.deepEqual(normalized.task, {
		taskId: "fixture-task",
		prompt: "Update the subject and run the declared test.",
		sourceRevision: null,
		existingTreeDigest: "fixture-tree-digest",
		writablePaths: ["src/**"],
		protectedPaths: ["test/**"],
	});
	assert.deepEqual(normalized.operations.map(({ tool, target, status, source }) => ({ tool, target, status, source })), [
		{ tool: "workspace_read", target: "src/subject.ts", status: "success", source: { file: "trace.json", record: 10 } },
		{ tool: "run_command", target: "public_test", status: "success", source: { file: "trace.json", record: 20 } },
		{ tool: "workspace_edit", target: "src/subject.ts", status: "failure", source: { file: "trace.json", record: 30 } },
	]);
	assert.deepEqual(normalized.tests, [{ command: "public_test", passed: true, source: { file: "trace.json", record: 20 } }]);
	assert.deepEqual(normalized.changes, { added: ["src/new.ts"], modified: ["src/subject.ts"], deleted: ["src/old.ts"], sourceFile: "run-manifest.json" });
	assert.deepEqual(normalized.verifier, { status: "passed", sourceFile: "verifier/result.json" });
	assert.deepEqual(json(resolve(output, "fixture-run-001.json")), normalized);
	assert.equal("repository" in normalized, false);
});

test("Source Locations resolve to the original stable Trace records", () => {
	const normalized = normalizeCodingRun({ sourceRunPath: FIXTURE }, temp("source-location"));
	for (const entry of [...normalized.operations, ...normalized.tests]) {
		assert.equal(resolveSourceLocation(FIXTURE, entry.source), resolve(FIXTURE, "trace.json"));
	}
	assert.throws(() => resolveSourceLocation(FIXTURE, { file: "trace.json", record: 999 }), /record is missing/);
});

test("Manifest changes take priority and do not require a Diff artifact", () => {
	const run = copiedRun("manifest-changes");
	assert.equal(existsSync(resolve(run, "diff.patch")), false);
	const normalized = normalizeCodingRun({ sourceRunPath: run }, temp("manifest-changes-output"));
	assert.equal(normalized.changes.sourceFile, "run-manifest.json");
});

test("changed files fall back to diff.json and then deterministically to diff.patch", () => {
	const diffJsonRun = copiedRun("diff-json");
	const diffJsonManifest = json(resolve(diffJsonRun, "run-manifest.json"));
	delete diffJsonManifest.changes;
	writeFileSync(resolve(diffJsonRun, "run-manifest.json"), `${JSON.stringify(diffJsonManifest)}\n`);
	writeFileSync(resolve(diffJsonRun, "diff.json"), `${JSON.stringify({ changes: { added: [], modified: ["src/from-diff-json.ts"], deleted: [] } })}\n`);
	const fromJson = normalizeCodingRun({ sourceRunPath: diffJsonRun }, temp("diff-json-output"));
	assert.deepEqual(fromJson.changes, { added: [], modified: ["src/from-diff-json.ts"], deleted: [], sourceFile: "diff.json" });

	const patchRun = copiedRun("diff-patch");
	const patchManifest = json(resolve(patchRun, "run-manifest.json"));
	delete patchManifest.changes;
	writeFileSync(resolve(patchRun, "run-manifest.json"), `${JSON.stringify(patchManifest)}\n`);
	writeFileSync(resolve(patchRun, "diff.patch"), "diff --git a/src/new.ts b/src/new.ts\n--- /dev/null\n+++ b/src/new.ts\ndiff --git a/src/subject.ts b/src/subject.ts\n--- a/src/subject.ts\n+++ b/src/subject.ts\ndiff --git a/src/old.ts b/src/old.ts\n--- a/src/old.ts\n+++ /dev/null\n");
	const fromPatch = normalizeCodingRun({ sourceRunPath: patchRun }, temp("diff-patch-output"));
	assert.deepEqual(fromPatch.changes, { added: ["src/new.ts"], modified: ["src/subject.ts"], deleted: ["src/old.ts"], sourceFile: "diff.patch" });
});

test("missing Manifest, Trace, or referenced Verifier result fails explicitly", () => {
	const missingManifest = temp("missing-manifest");
	assert.throws(() => normalizeCodingRun({ sourceRunPath: missingManifest }, temp("missing-manifest-output")));

	const missingTrace = copiedRun("missing-trace");
	rmSync(resolve(missingTrace, "trace.json"));
	assert.throws(() => normalizeCodingRun({ sourceRunPath: missingTrace }, temp("missing-trace-output")));

	const missingVerifier = copiedRun("missing-verifier");
	rmSync(resolve(missingVerifier, "verifier", "result.json"));
	assert.throws(() => normalizeCodingRun({ sourceRunPath: missingVerifier }, temp("missing-verifier-output")));
});

test("SourceRunSet accepts passed Runs and rejects a non-passed historical Verifier", () => {
	const sourceSetOutput = temp("source-set");
	const sourceSet = prepareSourceRunSet({ taskFamily: "fixture-family", runs: [{ sourceRunPath: FIXTURE }] }, sourceSetOutput);
	assert.deepEqual(sourceSet, {
		taskFamily: "fixture-family",
		sourceRuns: [{
			sourceRunId: "fixture-run-001",
			taskFamily: "fixture-family",
			sourceRunPath: FIXTURE,
			normalizedRunPath: "normalized-runs/fixture-run-001.json",
			historicalVerifierStatus: "passed",
		}],
	});
	assert.equal(existsSync(resolve(sourceSetOutput, "source-runs.json")), true);

	const failedRun = copiedRun("failed-verifier");
	const verifier = json(resolve(failedRun, "verifier", "result.json"));
	verifier.status = "failed";
	writeFileSync(resolve(failedRun, "verifier", "result.json"), `${JSON.stringify(verifier)}\n`);
	const failedOutput = temp("failed-source-set");
	assert.throws(() => prepareSourceRunSet({ taskFamily: "fixture-family", runs: [{ sourceRunPath: failedRun }] }, failedOutput), /not passed/);
	assert.equal(existsSync(resolve(failedOutput, "source-runs.json")), false);
	assert.equal(existsSync(resolve(failedOutput, "normalized-runs", "fixture-run-001.json")), true);
});

test("the single-Run normalizer preserves failed and explicit not_run Verifier states", () => {
	for (const status of ["failed", "not_run"] as const) {
		const run = copiedRun(status);
		const verifier = json(resolve(run, "verifier", "result.json"));
		verifier.status = status;
		writeFileSync(resolve(run, "verifier", "result.json"), `${JSON.stringify(verifier)}\n`);
		assert.equal(normalizeCodingRun({ sourceRunPath: run }, temp(`${status}-output`)).verifier.status, status);
	}
});
