import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { VerifierResultV0B } from "../src/contracts/v0b-types.ts";
import { validateArtifactRef } from "../src/evidence/artifacts.ts";
import { readJournal } from "../src/evidence/journal.ts";
import { executeV0BRun, type V0BRunScenario } from "../src/run-v0b.ts";
import { PROJECT_ROOT } from "./helpers.ts";

test("Verifier evidence records the executed snapshot, cwd, argv, env keys, duration, and full ArtifactRef", async () => {
	const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	assert.ok(result.outcome);
	const runRoot = resolve(PROJECT_ROOT, result.run_root);
	const verifier = JSON.parse(
		readFileSync(resolve(runRoot, "evidence/verifier-result.json"), "utf8"),
	) as VerifierResultV0B;
	assert.equal(verifier.status, "passed");
	assert.ok(verifier.duration_ms >= 0);
	assert.equal(verifier.execution.executable, process.execPath);
	assert.deepEqual(verifier.execution.argv, [resolve(runRoot, "config/verifier.mjs")]);
	assert.equal(verifier.execution.cwd, PROJECT_ROOT);
	assert.equal(verifier.execution.cwd_identity, "project_root");
	assert.equal(verifier.execution.shell, false);
	assert.deepEqual(verifier.execution.environment_allowlist_keys, ["NO_COLOR", "V0B_WORKSPACE"]);
	assert.equal(verifier.execution.source_digest_verified, true);
	assert.equal(verifier.execution.source_sha256, verifier.verifier_sha256);
	assert.deepEqual(validateArtifactRef(runRoot, verifier.execution.source_snapshot_ref), []);
	assert.deepEqual(validateArtifactRef(runRoot, verifier.full_output_ref), []);
	const completed = readJournal(resolve(runRoot, "journal/events.jsonl")).find(
		(entry) => entry.type === "verifier_completed",
	);
	assert.ok(completed);
	assert.equal(typeof completed.data.full_output_ref, "object");
	assert.deepEqual(completed.data.full_output_ref, verifier.full_output_ref);
});

test("Verifier missing, spawn, parse, timeout, and output-cap paths remain invalid/verifier", async () => {
	const cases: Array<{
		scenario: V0BRunScenario;
		invalidReason: RegExp;
		timedOut?: boolean;
		truncated?: boolean;
	}> = [
		{ scenario: "verifier_invalid", invalidReason: /verifier_missing/ },
		{ scenario: "verifier_spawn_invalid", invalidReason: /spawn_error/ },
		{ scenario: "verifier_parse_invalid", invalidReason: /contract_parse_failure/ },
		{ scenario: "verifier_timeout_invalid", invalidReason: /timeout/, timedOut: true },
		{ scenario: "verifier_output_cap_invalid", invalidReason: /output_limit_exceeded/, truncated: true },
	];
	for (const expected of cases) {
		const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: expected.scenario });
		assert.ok(result.outcome);
		assert.equal(result.outcome.status, "invalid");
		assert.equal(result.outcome.failure_class, "verifier");
		const runRoot = resolve(PROJECT_ROOT, result.run_root);
		const verifier = JSON.parse(
			readFileSync(resolve(runRoot, "evidence/verifier-result.json"), "utf8"),
		) as VerifierResultV0B;
		assert.equal(verifier.status, "invalid");
		assert.match(verifier.invalid_reason ?? "", expected.invalidReason);
		assert.equal(verifier.execution.source_digest_verified, true);
		assert.ok(verifier.duration_ms >= 0);
		if (expected.timedOut !== undefined) assert.equal(verifier.timed_out, expected.timedOut);
		if (expected.truncated !== undefined) assert.equal(verifier.full_output_ref.truncated, expected.truncated);
	}
});
