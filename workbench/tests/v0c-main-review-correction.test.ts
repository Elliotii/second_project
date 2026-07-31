import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { RunEvidenceValidationV0C } from "../src/contracts/v0c-types.ts";
import { readJournalV0C } from "../src/evidence/journal-v0c.ts";
import { inspectRunV0C } from "../src/inspect-v0c.ts";
import { createPiRunHandleV0C } from "../src/pi/pi-adapter-v0c.ts";
import {
	createRealExecutionAuthorityV0C,
	STAGE2_MAXIMUM_BUDGET_V0C,
	type RealExecutionDependenciesV0C,
} from "../src/pi/real-provider-route-v0c.ts";
import { runV0CProductSurface } from "../src/product-surface-v0c.ts";
import { executeV0CRun } from "../src/run-v0c.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const TASK = "fixtures/manifests/v0-c-parse-duration-public.json";
const RECOVER = "fixtures/manifests/v0-c-recover-once-faux.json";
const REAL = "fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json";

function runIds(): string[] {
	const root = resolve(PROJECT_ROOT, ".runs/v0-c/runs");
	return existsSync(root) ? readdirSync(root).sort() : [];
}

function fakeRealDependencies(): RealExecutionDependenciesV0C {
	return {
		authority: createRealExecutionAuthorityV0C("deterministic_injected_test"),
		resolveCredential: async () => ({ credential_handle: Object.freeze({ kind: "non-secret-test-handle" }), real_credential_reads: 0 }),
		createHandle: (options) => createPiRunHandleV0C(options),
		budget: structuredClone(STAGE2_MAXIMUM_BUDGET_V0C),
	};
}

test("V0C-MR-001 closes the one handle after terminal commit and on failure cleanup", async () => {
	const successEvents: string[] = [];
	const success = await executeV0CRun({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: RECOVER,
		scenario: "recover_once_pass",
		lifecycleProbe: (event) => successEvents.push(event),
	});
	assert.ok(success.terminal_record);
	assert.deepEqual(successEvents, ["handle_created", "terminal_committed", "handle_closed"]);
	const failureEvents: string[] = [];
	const failure = await executeV0CRun({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: RECOVER,
		scenario: "packet_scanner_error",
		lifecycleProbe: (event) => failureEvents.push(event),
	});
	assert.equal(failure.terminal_record, null);
	assert.deepEqual(failureEvents, ["handle_created", "handle_closed"]);
});

test("V0C-MR-002 scans persisted Packet/projection before child allocation and fails closed", async () => {
	const valid = await executeV0CRun({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: RECOVER,
		scenario: "recover_once_pass",
	});
	const validRoot = resolve(PROJECT_ROOT, valid.run_root);
	assert.equal(existsSync(resolve(validRoot, "recovery/failure-packet-scan.json")), true);
	const journal = readJournalV0C(resolve(validRoot, "journal/events.jsonl"));
	const packet = journal.findIndex((entry) => entry.type === "failure_packet_created");
	const child = journal.findIndex((entry) => entry.type === "attempt_started" && entry.data.ordinal === 2);
	assert.ok(packet >= 0 && packet < child);
	assert.equal(typeof journal[packet]?.data.scan_ref, "object");
	for (const scenario of ["packet_shared_secret", "packet_scanner_error", "packet_post_scan_mutation"] as const) {
		const rejected = await executeV0CRun({ projectRoot: PROJECT_ROOT, taskPath: TASK, strategyPath: RECOVER, scenario });
		assert.equal(rejected.outcome, null);
		assert.equal(rejected.attempt_ids.length, 1);
		assert.equal(rejected.child_attempts, 0);
		assert.match(rejected.incomplete_reason ?? "", /^invalid\/evidence:failure_packet_prechild_rejected:/);
		const rejectedJournal = readJournalV0C(resolve(PROJECT_ROOT, rejected.run_root, "journal/events.jsonl"));
		assert.equal(rejectedJournal.some((entry) => entry.type === "attempt_started" && entry.data.ordinal === 2), false);
	}
});

test("V0C-MR-003 freezes Attempt relations, cumulative budget, and dynamic terminal plan", async () => {
	for (const [fault, expected] of [
		["attempt_validation_relation", "Attempt-validation relation mismatch"],
		["cumulative_budget", "cumulative Run budget does not equal Attempt usage"],
		["dynamic_plan", "dynamic terminal plan mismatch"],
	] as const) {
		const run = await executeV0CRun({
			projectRoot: PROJECT_ROOT,
			taskPath: TASK,
			strategyPath: RECOVER,
			scenario: "recovery_initial_pass",
			runValidationFault: fault,
		});
		assert.equal(run.outcome, null);
		assert.equal(run.terminal_record, null);
		assert.equal(existsSync(resolve(PROJECT_ROOT, run.run_root, "terminal.json")), false);
		const validation = JSON.parse(
			readFileSync(resolve(PROJECT_ROOT, run.run_root, "evidence/run-validation.json"), "utf8"),
		) as RunEvidenceValidationV0C;
		assert.equal(validation.valid, false);
		assert.ok(validation.errors.some((error) => error.includes(expected)), validation.errors.join("; "));
		const inspected = await inspectRunV0C(PROJECT_ROOT, run.run_id);
		assert.equal(inspected.integrity_valid, false);
	}
});

test("V0C-MR-004 default real execution fails before formal side effects", async () => {
	const before = runIds();
	await assert.rejects(
		() => runV0CProductSurface({
			projectRoot: PROJECT_ROOT,
			taskPath: TASK,
			strategyPath: REAL,
			dryRun: false,
			scenario: "recover_once_pass",
		}),
		/real Provider execution is not authorized/,
	);
	assert.deepEqual(runIds(), before);
});

test("V0C-MR-004 authorized injected fake reaches the formal Run orchestration with zero real calls", async () => {
	const events: string[] = [];
	const dependencies = fakeRealDependencies();
	const product = await runV0CProductSurface({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: REAL,
		dryRun: false,
		scenario: "recover_once_pass",
		realExecution: dependencies,
		lifecycleProbe: (event) => events.push(event),
	});
	assert.equal(product.mode, "execution");
	if (product.mode !== "execution") return;
	assert.equal(product.result.outcome?.status, "passed");
	assert.equal(product.result.attempt_ids.length, 2);
	assert.equal(product.result.external_provider_calls, 0);
	assert.equal(product.result.real_model_calls, 0);
	assert.equal(product.result.credential_reads, 0);
	assert.equal(product.result.network_calls, 0);
	assert.deepEqual(events, ["handle_created", "terminal_committed", "handle_closed"]);
	const run = JSON.parse(readFileSync(resolve(PROJECT_ROOT, product.result.run_root, "run.json"), "utf8"));
	assert.equal(run.provider_identity.kind, "deepseek_v4_flash_real");
	assert.equal(run.provider_identity.external, true);
	assert.equal(run.provider_identity.credentials_used, false);
	const inspected = await inspectRunV0C(PROJECT_ROOT, product.result.run_id);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	const beforeReuse = runIds();
	await assert.rejects(
		() => runV0CProductSurface({
			projectRoot: PROJECT_ROOT,
			taskPath: TASK,
			strategyPath: REAL,
			dryRun: false,
			scenario: "recover_once_pass",
			realExecution: dependencies,
		}),
		/already consumed/,
	);
	assert.deepEqual(runIds(), beforeReuse);
});
