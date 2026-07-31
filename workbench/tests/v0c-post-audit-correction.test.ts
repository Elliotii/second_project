import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { readJournalV0C } from "../src/evidence/journal-v0c.ts";
import { inspectRunV0C } from "../src/inspect-v0c.ts";
import { createPiRunHandleV0C, type PiRunHandleV0C } from "../src/pi/pi-adapter-v0c.ts";
import {
	createRealExecutionAuthorityV0C,
	STAGE2_MAXIMUM_BUDGET_V0C,
	type RealExecutionDependenciesV0C,
} from "../src/pi/real-provider-route-v0c.ts";
import {
	executeV0CRun,
	type V0CPostAuditFault,
} from "../src/run-v0c.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const TASK = "fixtures/manifests/v0-c-parse-duration-public.json";
const RECOVER = "fixtures/manifests/v0-c-recover-once-faux.json";
const REAL = "fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json";

function runIds(): string[] {
	const root = resolve(PROJECT_ROOT, ".runs/v0-c/runs");
	return existsSync(root) ? readdirSync(root).sort() : [];
}

interface HandleCounters {
	created: number;
	debugIdentity: number;
	runAttempt: number;
	close: number;
	provider: number;
	realModel: number;
	network: number;
	credentialReads: number;
}

function throwingHandleDependencies(
	counters: HandleCounters,
	throwFromDebugIdentity: boolean,
): RealExecutionDependenciesV0C {
	return {
		authority: createRealExecutionAuthorityV0C("deterministic_injected_test"),
		resolveCredential: async () => ({
			credential_handle: Object.freeze({ kind: "non-secret-test-handle" }),
			real_credential_reads: counters.credentialReads,
		}),
		createHandle: (options): PiRunHandleV0C => {
			counters.created += 1;
			const inner = createPiRunHandleV0C(options);
			return {
				sessionId: inner.sessionId,
				workspaceId: inner.workspaceId,
				async runAttempt(input) {
					counters.runAttempt += 1;
					return await inner.runAttempt(input);
				},
				async abort() {
					return await inner.abort();
				},
				async close() {
					counters.close += 1;
					await inner.close();
				},
				debugIdentity() {
					counters.debugIdentity += 1;
					if (throwFromDebugIdentity) throw new Error("fixed debugIdentity post-audit injection");
					return inner.debugIdentity();
				},
			};
		},
		budget: structuredClone(STAGE2_MAXIMUM_BUDGET_V0C),
	};
}

function freshCounters(): HandleCounters {
	return {
		created: 0,
		debugIdentity: 0,
		runAttempt: 0,
		close: 0,
		provider: 0,
		realModel: 0,
		network: 0,
		credentialReads: 0,
	};
}

test("V0C-AUD-001 closes exactly once when handle_created lifecycle probe throws", async () => {
	const before = new Set(runIds());
	const counters = freshCounters();
	await assert.rejects(
		() =>
			executeV0CRun({
				projectRoot: PROJECT_ROOT,
				taskPath: TASK,
				strategyPath: REAL,
				scenario: "recover_once_pass",
				realExecution: throwingHandleDependencies(counters, false),
				lifecycleProbe: (event) => {
					if (event === "handle_created") throw new Error("fixed handle_created post-audit injection");
				},
			}),
		/fixed handle_created post-audit injection/,
	);
	const created = runIds().filter((id) => !before.has(id));
	assert.equal(created.length, 1);
	const runRoot = resolve(PROJECT_ROOT, ".runs/v0-c/runs", created[0]!);
	assert.equal(counters.created, 1);
	assert.equal(counters.debugIdentity, 0);
	assert.equal(counters.runAttempt, 0);
	assert.equal(counters.close, 1);
	assert.deepEqual(
		[counters.provider, counters.realModel, counters.network, counters.credentialReads],
		[0, 0, 0, 0],
	);
	assert.equal(existsSync(resolve(runRoot, "terminal.json")), false);
	assert.equal(existsSync(resolve(runRoot, "outcome.json")), false);
	assert.equal(existsSync(resolve(runRoot, "evidence-index.json")), false);
	assert.equal(readJournalV0C(resolve(runRoot, "journal/events.jsonl")).some((entry) => entry.type === "attempt_started"), false);
});

test("V0C-AUD-001 closes exactly once when debugIdentity throws", async () => {
	const before = new Set(runIds());
	const counters = freshCounters();
	await assert.rejects(
		() =>
			executeV0CRun({
				projectRoot: PROJECT_ROOT,
				taskPath: TASK,
				strategyPath: REAL,
				scenario: "recover_once_pass",
				realExecution: throwingHandleDependencies(counters, true),
			}),
		/fixed debugIdentity post-audit injection/,
	);
	const created = runIds().filter((id) => !before.has(id));
	assert.equal(created.length, 1);
	const runRoot = resolve(PROJECT_ROOT, ".runs/v0-c/runs", created[0]!);
	assert.equal(counters.created, 1);
	assert.equal(counters.debugIdentity, 1);
	assert.equal(counters.runAttempt, 0);
	assert.equal(counters.close, 1);
	assert.deepEqual(
		[counters.provider, counters.realModel, counters.network, counters.credentialReads],
		[0, 0, 0, 0],
	);
	assert.equal(existsSync(resolve(runRoot, "terminal.json")), false);
	assert.equal(existsSync(resolve(runRoot, "outcome.json")), false);
	assert.equal(existsSync(resolve(runRoot, "evidence-index.json")), false);
	assert.equal(readJournalV0C(resolve(runRoot, "journal/events.jsonl")).some((entry) => entry.type === "attempt_started"), false);
});

async function assertWriterRejects(fault: V0CPostAuditFault): Promise<void> {
	const run = await executeV0CRun({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: RECOVER,
		scenario: "recovery_initial_pass",
		postAuditFault: fault,
	});
	const runRoot = resolve(PROJECT_ROOT, run.run_root);
	assert.equal(run.outcome, null, fault);
	assert.equal(run.terminal_record, null, fault);
	assert.equal(existsSync(resolve(runRoot, "terminal.json")), false, fault);
	assert.equal(existsSync(resolve(runRoot, "evidence/run-validation.json")), true, fault);
	const journal = readJournalV0C(resolve(runRoot, "journal/events.jsonl"));
	assert.equal(
		journal.filter((entry) => entry.type === "run_evidence_validation_completed").length,
		1,
		fault,
	);
	const inspected = await inspectRunV0C(PROJECT_ROOT, run.run_id);
	assert.equal(inspected.committed, false, fault);
	assert.equal(inspected.integrity_valid, false, fault);
}

test("V0C-AUD-002 writer rejects actual Verifier relation and frozen identity mismatches", async () => {
	await assertWriterRejects("verifier_attempt_relation");
	await assertWriterRejects("verifier_identity");
});

test("V0C-AUD-002 writer rejects missing or duplicate Verifier evidence", async () => {
	await assertWriterRejects("verifier_evidence_missing");
	await assertWriterRejects("verifier_evidence_duplicate");
});

test("V0C-AUD-002 writer rejects Verifier ArtifactRef path, digest, and size mismatches", async () => {
	await assertWriterRejects("verifier_ref_path");
	await assertWriterRejects("verifier_ref_digest");
	await assertWriterRejects("verifier_ref_size");
});

test("V0C-AUD-002 writer rejects realized Index omission, unexpected path, and wrong responsibility", async () => {
	await assertWriterRejects("index_omission");
	await assertWriterRejects("index_unexpected");
	await assertWriterRejects("index_responsibility");
});

test("V0C-AUD-002 Inspector explicitly rejects a loaded Verifier-to-Attempt mismatch", async () => {
	const run = await executeV0CRun({
		projectRoot: PROJECT_ROOT,
		taskPath: TASK,
		strategyPath: RECOVER,
		scenario: "recovery_initial_pass",
	});
	const verifierPath = resolve(
		PROJECT_ROOT,
		run.run_root,
		`attempts/01-${run.attempt_ids[0]}/verifier-result.json`,
	);
	const verifier = JSON.parse(readFileSync(verifierPath, "utf8")) as Record<string, unknown>;
	verifier.attempt_id = "mutated-inspector-attempt";
	writeFileSync(verifierPath, `${JSON.stringify(verifier)}\n`);
	const inspected = await inspectRunV0C(PROJECT_ROOT, run.run_id);
	assert.equal(inspected.integrity_valid, false);
	assert.ok(
		inspected.errors.some((error) => error.includes("Verifier 1 Attempt relationship mismatch")),
		inspected.errors.join("; "),
	);
});

test("V0C-AUD-002 normal one-Attempt and two-Attempt writer paths remain committed and inspect-valid", async () => {
	for (const scenario of ["recovery_initial_pass", "recover_once_pass"] as const) {
		const run = await executeV0CRun({
			projectRoot: PROJECT_ROOT,
			taskPath: TASK,
			strategyPath: RECOVER,
			scenario,
		});
		assert.ok(run.outcome);
		assert.ok(run.terminal_record);
		const inspected = await inspectRunV0C(PROJECT_ROOT, run.run_id);
		assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	}
});
