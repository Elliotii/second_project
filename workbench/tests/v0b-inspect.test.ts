import assert from "node:assert/strict";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileSha256 } from "../src/hash.ts";
import { inspectRunV0B } from "../src/inspect-v0b.ts";
import { executeV0BRun } from "../src/run-v0b.ts";
import { PROJECT_ROOT } from "./helpers.ts";

test("inspect returns structured invalid output for malformed Journal JSONL", async () => {
	const run = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const journalPath = resolve(PROJECT_ROOT, run.run_root, "journal/events.jsonl");
	writeFileSync(journalPath, "{malformed-jsonl\n", "utf8");
	const inspected = await inspectRunV0B(PROJECT_ROOT, run.run_id);
	assert.equal(inspected.integrity_valid, false);
	assert.ok(inspected.errors.length > 0);
});

test("inspect returns structured invalid output for malformed and invalid-shape Evidence Index", async () => {
	const malformed = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	writeFileSync(resolve(PROJECT_ROOT, malformed.run_root, "evidence-index.json"), "{malformed-index\n", "utf8");
	const malformedResult = await inspectRunV0B(PROJECT_ROOT, malformed.run_id);
	assert.equal(malformedResult.integrity_valid, false);
	assert.ok(malformedResult.errors.length > 0);

	const invalidShape = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const runRoot = resolve(PROJECT_ROOT, invalidShape.run_root);
	const indexPath = resolve(runRoot, "evidence-index.json");
	const terminalPath = resolve(runRoot, "terminal.json");
	writeFileSync(
		indexPath,
		`${JSON.stringify({ schema_version: 1, run_id: invalidShape.run_id, items: {} })}\n`,
		"utf8",
	);
	const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as Record<string, unknown>;
	terminal.evidence_index_sha256 = fileSha256(indexPath);
	writeFileSync(terminalPath, `${JSON.stringify(terminal)}\n`, "utf8");
	const invalidShapeResult = await inspectRunV0B(PROJECT_ROOT, invalidShape.run_id);
	assert.equal(invalidShapeResult.committed, true);
	assert.equal(invalidShapeResult.integrity_valid, false);
	assert.match(invalidShapeResult.errors.join("\n"), /Evidence Index items are invalid/);
});

test("inspect rejects Evidence Index digest mismatch, missing artifacts, and directory masquerading", async () => {
	const digestMismatch = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const mismatchTerminalPath = resolve(PROJECT_ROOT, digestMismatch.run_root, "terminal.json");
	const mismatchTerminal = JSON.parse(readFileSync(mismatchTerminalPath, "utf8")) as Record<string, unknown>;
	mismatchTerminal.evidence_index_sha256 = "0".repeat(64);
	writeFileSync(mismatchTerminalPath, `${JSON.stringify(mismatchTerminal)}\n`, "utf8");
	const mismatchResult = await inspectRunV0B(PROJECT_ROOT, digestMismatch.run_id);
	assert.equal(mismatchResult.committed, false);
	assert.equal(mismatchResult.integrity_valid, false);
	assert.match(mismatchResult.errors.join("\n"), /terminal Evidence Index digest mismatch/);

	const missing = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const missingOutput = resolve(PROJECT_ROOT, missing.run_root, "artifacts/verifier-output.txt");
	unlinkSync(missingOutput);
	const missingResult = await inspectRunV0B(PROJECT_ROOT, missing.run_id);
	assert.equal(missingResult.integrity_valid, false);
	assert.match(missingResult.errors.join("\n"), /artifact is missing/);

	const directory = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const directoryOutput = resolve(PROJECT_ROOT, directory.run_root, "artifacts/verifier-output.txt");
	unlinkSync(directoryOutput);
	mkdirSync(directoryOutput);
	const directoryResult = await inspectRunV0B(PROJECT_ROOT, directory.run_id);
	assert.equal(directoryResult.integrity_valid, false);
	assert.match(directoryResult.errors.join("\n"), /not an ordinary file/);
});
