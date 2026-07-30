import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { inspectRunV0B } from "../src/inspect-v0b.ts";
import { executeV0BRun, type V0BRunScenario } from "../src/run-v0b.ts";
import { treeInventory } from "../src/hash.ts";
import { PROJECT_ROOT } from "./helpers.ts";

test("V0-B deterministic routes distinguish pass, Agent failure, Verifier invalid, and evidence invalid", async () => {
	const cases: Array<{
		scenario: V0BRunScenario;
		status: string;
		failureClass: string | null;
		inspectValid: boolean;
	}> = [
		{ scenario: "pass", status: "passed", failureClass: null, inspectValid: true },
		{ scenario: "agent_failure", status: "failed", failureClass: "agent", inspectValid: true },
		{ scenario: "verifier_invalid", status: "invalid", failureClass: "verifier", inspectValid: true },
		{ scenario: "evidence_invalid", status: "invalid", failureClass: "evidence", inspectValid: false },
	];
	for (const expected of cases) {
		const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: expected.scenario });
		const outcome = result.outcome;
		assert.ok(outcome);
		assert.equal(outcome.status, expected.status);
		assert.equal(outcome.failure_class, expected.failureClass);
		assert.equal(result.external_provider_calls, 0);
		assert.equal(result.recovery_attempts, 0);
		assert.equal(result.child_attempts, 0);
		assert.equal(outcome.attempt_count, 1);
		assert.ok(result.terminal_record);
		assert.equal(result.terminal_record.preterminal_scan.completed, true);
		assert.equal(result.terminal_record.preterminal_scan.match_count, 0);
		const inspected = await inspectRunV0B(PROJECT_ROOT, result.run_id);
		assert.equal(inspected.committed, true);
		assert.equal(inspected.integrity_valid, expected.inspectValid);
		assert.equal(inspected.status, expected.status);
		assert.equal(inspected.failure_class, expected.failureClass);
		assert.equal(inspected.budget?.external_provider_calls, 0);
		assert.ok((inspected.budget?.wall_time_usage_ms ?? Number.POSITIVE_INFINITY) <= (inspected.budget?.wall_time_limit_ms ?? 0));
		assert.ok((inspected.budget?.provider_request_usage ?? Number.POSITIVE_INFINITY) <= (inspected.budget?.provider_request_limit ?? 0));
		assert.ok((inspected.budget?.tool_call_usage ?? Number.POSITIVE_INFINITY) <= (inspected.budget?.tool_call_limit ?? 0));
		assert.equal(inspected.session?.resume_capability, "not_claimed");
		if (expected.scenario === "evidence_invalid") {
			assert.match(inspected.errors.join("\n"), /evidence Session public reopen failed|artifact digest mismatch/);
		}
	}
});

test("actual Session evidence append failure stops before Verifier and remains incomplete", async () => {
	const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "persistence_failure" });
	assert.equal(result.outcome, null);
	assert.equal(result.terminal_record, null);
	assert.equal(result.incomplete_reason, "evidence_persistence_operation_failed");
	const runRoot = resolve(PROJECT_ROOT, result.run_root);
	assert.equal(existsSync(resolve(runRoot, "terminal.json")), false);
	assert.equal(existsSync(resolve(runRoot, "evidence/verifier-result.json")), false);
	const journal = readFileSync(resolve(runRoot, "journal/events.jsonl"), "utf8");
	assert.match(journal, /"type":"attempt_error"/);
	assert.match(journal, /"type":"attempt_aborted"/);
	assert.doesNotMatch(journal, /"type":"verifier_started"/);
	const inspected = await inspectRunV0B(PROJECT_ROOT, result.run_id);
	assert.equal(inspected.committed, false);
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /required evidence missing or unreadable: terminal\.json/);
});

test("preterminal secret rejection and scanner failure never create terminal evidence", async () => {
	for (const scenario of ["secret_scan_rejection", "scan_failure"] as const) {
		const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario });
		assert.equal(result.outcome, null);
		assert.equal(result.terminal_record, null);
		const runRoot = resolve(PROJECT_ROOT, result.run_root);
		assert.equal(existsSync(resolve(runRoot, "terminal.json")), false);
		const allPersisted = treeInventory(runRoot)
			.map((item) => readFileSync(resolve(runRoot, item.path), "utf8"))
			.join("\n");
		assert.doesNotMatch(allPersisted, /V0B_SYNTHETIC_SECRET_VALUE/);
		const inspected = await inspectRunV0B(PROJECT_ROOT, result.run_id);
		assert.equal(inspected.committed, false);
		assert.equal(inspected.integrity_valid, false);
	}
});

test("inspect rejects traversal-shaped IDs and incomplete Run evidence without repair", async () => {
	const traversal = await inspectRunV0B(PROJECT_ROOT, "../outside");
	assert.equal(traversal.integrity_valid, false);
	assert.match(traversal.errors.join("\n"), /run ID is invalid/);
	const runId = "run-00000000-0000-0000-0000-000000000000";
	mkdirSync(resolve(PROJECT_ROOT, ".runs/v0-b/runs", runId), { recursive: true });
	const incomplete = await inspectRunV0B(PROJECT_ROOT, runId);
	assert.equal(incomplete.committed, false);
	assert.equal(incomplete.integrity_valid, false);
	assert.match(incomplete.errors.join("\n"), /required evidence missing/);
});

test("inspect rejects a linked Run root before reading evidence", async () => {
	const runId = `run-${randomUUID()}`;
	const target = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases", `linked-run-target-${randomUUID()}`);
	const linkedRoot = resolve(PROJECT_ROOT, ".runs/v0-b/runs", runId);
	mkdirSync(target, { recursive: true });
	symlinkSync(target, linkedRoot, "junction");
	const inspected = await inspectRunV0B(PROJECT_ROOT, runId);
	assert.equal(inspected.committed, false);
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /Run root is a symlink or junction/);
});

test("inspect does not treat a terminal digest mismatch as committed evidence", async () => {
	const result = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const terminalPath = resolve(PROJECT_ROOT, result.run_root, "terminal.json");
	const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as Record<string, unknown>;
	terminal.outcome_sha256 = "0".repeat(64);
	writeFileSync(terminalPath, `${JSON.stringify(terminal)}\n`, "utf8");
	const inspected = await inspectRunV0B(PROJECT_ROOT, result.run_id);
	assert.equal(inspected.committed, false);
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /terminal Outcome digest mismatch/);
});
