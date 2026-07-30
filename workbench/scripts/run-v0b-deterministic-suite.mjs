import assert from "node:assert/strict";
import { resolve } from "node:path";
import { inspectRunV0B } from "../src/inspect-v0b.ts";
import { executeV0BRun } from "../src/run-v0b.ts";

const projectRoot = resolve(import.meta.dirname, "../..");
const cases = [
	{ scenario: "pass", status: "passed", failureClass: null, integrityValid: true },
	{ scenario: "agent_failure", status: "failed", failureClass: "agent", integrityValid: true },
	{ scenario: "verifier_invalid", status: "invalid", failureClass: "verifier", integrityValid: true },
	{ scenario: "evidence_invalid", status: "invalid", failureClass: "evidence", integrityValid: false },
];
const results = [];
for (const expected of cases) {
	const run = await executeV0BRun({ projectRoot, scenario: expected.scenario });
	assert.ok(run.outcome);
	assert.ok(run.terminal_record);
	const inspected = await inspectRunV0B(projectRoot, run.run_id);
	assert.equal(run.outcome.status, expected.status);
	assert.equal(run.outcome.failure_class, expected.failureClass);
	assert.equal(run.external_provider_calls, 0);
	assert.equal(run.recovery_attempts, 0);
	assert.equal(run.child_attempts, 0);
	assert.equal(run.terminal_record.preterminal_scan.completed, true);
	assert.equal(run.terminal_record.preterminal_scan.match_count, 0);
	assert.equal(inspected.integrity_valid, expected.integrityValid);
	results.push({
		scenario: expected.scenario,
		run_id: run.run_id,
		status: run.outcome.status,
		failure_class: run.outcome.failure_class,
		integrity_valid: inspected.integrity_valid,
		run_root: run.run_root,
	});
}
for (const scenario of ["persistence_failure", "secret_scan_rejection"]) {
	const run = await executeV0BRun({ projectRoot, scenario });
	const inspected = await inspectRunV0B(projectRoot, run.run_id);
	assert.equal(run.outcome, null);
	assert.equal(run.terminal_record, null);
	assert.equal(run.external_provider_calls, 0);
	assert.equal(run.recovery_attempts, 0);
	assert.equal(run.child_attempts, 0);
	assert.equal(inspected.committed, false);
	assert.equal(inspected.integrity_valid, false);
	results.push({
		scenario,
		run_id: run.run_id,
		status: "incomplete",
		failure_class: scenario === "persistence_failure" ? "evidence" : "secret_scan",
		integrity_valid: false,
		run_root: run.run_root,
	});
}
process.stdout.write(
	`${JSON.stringify({ schema_version: 1, external_provider_calls: 0, recovery_attempts: 0, child_attempts: 0, results })}\n`,
);
