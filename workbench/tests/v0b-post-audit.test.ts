import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type {
	ArtifactRefV0B,
	EvidenceIndexV0B,
	JournalEntryV0B,
	SecretScanResultV0B,
	TerminalRecordV0B,
} from "../src/contracts/v0b-types.ts";
import { fileSha256, sha256, stableJson } from "../src/hash.ts";
import { inspectRunV0B } from "../src/inspect-v0b.ts";
import { executeV0BRun } from "../src/run-v0b.ts";
import { scanPreterminalEvidenceV0B } from "../src/evidence/secret-scan.ts";
import {
	preterminalJournalBytesV0B,
	secretRelevantObjectProjectionV0B,
} from "../src/evidence/terminal-policy.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${stableJson(value)}\n`, "utf8");
}

function refFor(path: string, relativePath: string, mediaType: string): ArtifactRefV0B {
	const bytes = readFileSync(path);
	return {
		path: relativePath,
		sha256: sha256(bytes),
		size_bytes: bytes.length,
		media_type: mediaType,
		truncated: false,
	};
}

function rebindIndexAndTerminal(runRoot: string): void {
	const indexPath = resolve(runRoot, "evidence-index.json");
	const terminalPath = resolve(runRoot, "terminal.json");
	const terminal = readJson<TerminalRecordV0B>(terminalPath);
	terminal.evidence_index_sha256 = fileSha256(indexPath);
	writeJson(terminalPath, terminal);
}

function rebindScan(runRoot: string): void {
	const scanPath = resolve(runRoot, "evidence/secret-scan.json");
	const indexPath = resolve(runRoot, "evidence-index.json");
	const terminalPath = resolve(runRoot, "terminal.json");
	const scanRef = refFor(scanPath, "evidence/secret-scan.json", "application/json");
	const index = readJson<EvidenceIndexV0B>(indexPath);
	const scanItem = index.items.find((item) => item.path === scanRef.path);
	assert.ok(scanItem);
	Object.assign(scanItem, scanRef);
	writeJson(indexPath, index);
	const terminal = readJson<TerminalRecordV0B>(terminalPath);
	terminal.preterminal_scan.result_ref = scanRef;
	terminal.evidence_index_sha256 = fileSha256(indexPath);
	writeJson(terminalPath, terminal);
}

async function mutateScan(
	mutate: (scan: SecretScanResultV0B, terminal: TerminalRecordV0B, runRoot: string) => void,
): Promise<Awaited<ReturnType<typeof inspectRunV0B>>> {
	const run = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const runRoot = resolve(PROJECT_ROOT, run.run_root);
	const scanPath = resolve(runRoot, "evidence/secret-scan.json");
	const terminalPath = resolve(runRoot, "terminal.json");
	const scan = readJson<SecretScanResultV0B>(scanPath);
	const terminal = readJson<TerminalRecordV0B>(terminalPath);
	mutate(scan, terminal, runRoot);
	writeJson(scanPath, scan);
	writeJson(terminalPath, terminal);
	rebindScan(runRoot);
	return inspectRunV0B(PROJECT_ROOT, run.run_id);
}

function rebindJournalAndScan(runRoot: string, journal: JournalEntryV0B[]): void {
	const journalPath = resolve(runRoot, "journal/events.jsonl");
	const scanPath = resolve(runRoot, "evidence/secret-scan.json");
	const indexPath = resolve(runRoot, "evidence-index.json");
	writeFileSync(journalPath, journal.map((entry) => `${stableJson(entry)}\n`).join(""), "utf8");
	const scan = readJson<SecretScanResultV0B>(scanPath);
	const preterminal = Buffer.from(preterminalJournalBytesV0B(journal), "utf8");
	const pendingTerminal = stableJson(
		secretRelevantObjectProjectionV0B("pending_terminal_journal_events", journal.slice(-2)),
	);
	const preterminalScope = scan.scopes.find((scope) => scope.scope_label === "journal_preterminal");
	const pendingScope = scan.scopes.find((scope) => scope.scope_label === "pending_terminal_journal_events");
	assert.ok(preterminalScope);
	assert.ok(pendingScope);
	Object.assign(preterminalScope, { sha256: sha256(preterminal), size_bytes: preterminal.length });
	Object.assign(pendingScope, {
		sha256: sha256(pendingTerminal),
		size_bytes: Buffer.byteLength(pendingTerminal, "utf8"),
	});
	writeJson(scanPath, scan);
	const index = readJson<EvidenceIndexV0B>(indexPath);
	const journalItem = index.items.find((item) => item.path === "journal/events.jsonl");
	assert.ok(journalItem);
	Object.assign(journalItem, refFor(journalPath, "journal/events.jsonl", "application/x-ndjson"));
	writeJson(indexPath, index);
	rebindScan(runRoot);
}

test("scan policy rejects a removed required scope after all enclosing digests are rebound", async () => {
	const inspected = await mutateScan((scan) => {
		const label = "session_evidence";
		scan.scope_labels = scan.scope_labels.filter((value) => value !== label);
		scan.scopes = scan.scopes.filter((value) => value.scope_label !== label);
		scan.scanned_file_count -= 1;
	});
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /scope labels do not exactly match|scope missing/);
});

test("scan policy rejects forged file and object scope digests", async () => {
	for (const label of ["session_evidence", "pending_run_object"]) {
		const inspected = await mutateScan((scan) => {
			const scope = scan.scopes.find((value) => value.scope_label === label);
			assert.ok(scope);
			scope.sha256 = "0".repeat(64);
		});
		assert.equal(inspected.integrity_valid, false);
		assert.match(inspected.errors.join("\n"), /scope digest mismatch/);
	}
});

test("scan policy rejects duplicate scope and wrong scope kind", async () => {
	const duplicate = await mutateScan((scan) => {
		const scope = scan.scopes.find((value) => value.scope_label === "session_evidence");
		assert.ok(scope);
		scan.scopes.push({ ...scope });
	});
	assert.equal(duplicate.integrity_valid, false);
	assert.match(duplicate.errors.join("\n"), /duplicate scope/);

	const wrongKind = await mutateScan((scan) => {
		const scope = scan.scopes.find((value) => value.scope_label === "pending_run_object");
		assert.ok(scope);
		scope.kind = "file";
	});
	assert.equal(wrongKind.integrity_valid, false);
	assert.match(wrongKind.errors.join("\n"), /scope kind mismatch/);
});

test("scan policy rejects a terminal scope-label mismatch", async () => {
	const inspected = await mutateScan((_scan, terminal) => {
		terminal.preterminal_scan.scope_labels = terminal.preterminal_scan.scope_labels.slice(1);
	});
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /terminal preterminal scan scope does not match/);
});

test("Index policy rejects required omission even after Index and terminal digests are rebound", async () => {
	const run = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const runRoot = resolve(PROJECT_ROOT, run.run_root);
	const indexPath = resolve(runRoot, "evidence-index.json");
	const index = readJson<EvidenceIndexV0B>(indexPath);
	index.items = index.items.filter((item) => item.path !== "attempt.json");
	writeJson(indexPath, index);
	rebindIndexAndTerminal(runRoot);
	const inspected = await inspectRunV0B(PROJECT_ROOT, run.run_id);
	assert.equal(inspected.integrity_valid, false);
	assert.match(inspected.errors.join("\n"), /omits required V0-B terminal evidence: attempt\.json/);
});

test("Index policy rejects responsibility mismatch, unexpected entries, and missing declared Tool artifacts", async () => {
	const responsibilityRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const responsibilityRoot = resolve(PROJECT_ROOT, responsibilityRun.run_root);
	const responsibilityIndexPath = resolve(responsibilityRoot, "evidence-index.json");
	const responsibilityIndex = readJson<EvidenceIndexV0B>(responsibilityIndexPath);
	const attemptItem = responsibilityIndex.items.find((item) => item.path === "attempt.json");
	assert.ok(attemptItem);
	attemptItem.responsibility = "wrong responsibility";
	writeJson(responsibilityIndexPath, responsibilityIndex);
	rebindIndexAndTerminal(responsibilityRoot);
	const responsibilityResult = await inspectRunV0B(PROJECT_ROOT, responsibilityRun.run_id);
	assert.match(responsibilityResult.errors.join("\n"), /responsibility mismatch/);

	const toolRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const toolRoot = resolve(PROJECT_ROOT, toolRun.run_root);
	const toolIndexPath = resolve(toolRoot, "evidence-index.json");
	const toolIndex = readJson<EvidenceIndexV0B>(toolIndexPath);
	const toolPath = toolIndex.items.find((item) => item.path.startsWith("artifacts/tool-results/"))?.path;
	assert.ok(toolPath);
	toolIndex.items = toolIndex.items.filter((item) => item.path !== toolPath);
	writeJson(toolIndexPath, toolIndex);
	rebindIndexAndTerminal(toolRoot);
	const toolResult = await inspectRunV0B(PROJECT_ROOT, toolRun.run_id);
	assert.match(toolResult.errors.join("\n"), /omits required V0-B terminal evidence: artifacts\/tool-results/);
});

test("terminal Journal policy rejects swapped suffix and an event after run_terminal", async () => {
	const swappedRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const swappedRoot = resolve(PROJECT_ROOT, swappedRun.run_root);
	const swappedJournal = readFileSync(resolve(swappedRoot, "journal/events.jsonl"), "utf8")
		.trim()
		.split(/\r?\n/)
		.map((line) => JSON.parse(line) as JournalEntryV0B);
	const left = swappedJournal.at(-2);
	const right = swappedJournal.at(-1);
	assert.ok(left && right);
	swappedJournal.splice(-2, 2, { ...right, seq: left.seq }, { ...left, seq: right.seq });
	rebindJournalAndScan(swappedRoot, swappedJournal);
	const swapped = await inspectRunV0B(PROJECT_ROOT, swappedRun.run_id);
	assert.equal(swapped.integrity_valid, false);
	assert.match(swapped.errors.join("\n"), /terminal suffix|lifecycle ordering/);

	const afterRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const afterRoot = resolve(PROJECT_ROOT, afterRun.run_root);
	const afterJournal = readFileSync(resolve(afterRoot, "journal/events.jsonl"), "utf8")
		.trim()
		.split(/\r?\n/)
		.map((line) => JSON.parse(line) as JournalEntryV0B);
	const terminal = afterJournal.at(-1);
	assert.ok(terminal);
	afterJournal.push({ ...terminal, seq: terminal.seq + 1, type: "provider_response_observed", data: {} });
	rebindJournalAndScan(afterRoot, afterJournal);
	const after = await inspectRunV0B(PROJECT_ROOT, afterRun.run_id);
	assert.equal(after.integrity_valid, false);
	assert.match(after.errors.join("\n"), /terminal suffix/);
});

test("terminal Journal policy rejects duplicate terminal events and Outcome projection mismatch", async () => {
	const duplicateRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const duplicateRoot = resolve(PROJECT_ROOT, duplicateRun.run_root);
	const duplicateJournal = readFileSync(resolve(duplicateRoot, "journal/events.jsonl"), "utf8")
		.trim()
		.split(/\r?\n/)
		.map((line) => JSON.parse(line) as JournalEntryV0B);
	const terminal = duplicateJournal.at(-1);
	assert.ok(terminal);
	duplicateJournal.splice(-2, 0, { ...terminal });
	duplicateJournal.forEach((entry, index) => {
		entry.seq = index + 1;
	});
	rebindJournalAndScan(duplicateRoot, duplicateJournal);
	const duplicate = await inspectRunV0B(PROJECT_ROOT, duplicateRun.run_id);
	assert.equal(duplicate.integrity_valid, false);
	assert.match(duplicate.errors.join("\n"), /run_terminal count is not exactly one/);

	const mismatchRun = await executeV0BRun({ projectRoot: PROJECT_ROOT, scenario: "pass" });
	const mismatchRoot = resolve(PROJECT_ROOT, mismatchRun.run_root);
	const mismatchJournal = readFileSync(resolve(mismatchRoot, "journal/events.jsonl"), "utf8")
		.trim()
		.split(/\r?\n/)
		.map((line) => JSON.parse(line) as JournalEntryV0B);
	for (const entry of mismatchJournal.slice(-2)) {
		entry.data.status = "failed";
		entry.data.failure_class = "agent";
		entry.data.terminal_reason = "forged";
	}
	rebindJournalAndScan(mismatchRoot, mismatchJournal);
	const mismatch = await inspectRunV0B(PROJECT_ROOT, mismatchRun.run_id);
	assert.equal(mismatch.integrity_valid, false);
	assert.match(mismatch.errors.join("\n"), /projection disagrees with Outcome/);
});

test("wall-time crossing during scan and terminalization fails closed without a terminal marker", async () => {
	for (const clockValues of [
		[0, 10, 150],
		[0, 10, 20, 150],
	]) {
		let index = 0;
		const run = await executeV0BRun({
			projectRoot: PROJECT_ROOT,
			scenario: "pass",
			testOnlyWallTimeLimitMs: 100,
			testOnlyWallClock: () => clockValues[Math.min(index++, clockValues.length - 1)] ?? 150,
		});
		assert.equal(run.outcome, null);
		assert.equal(run.terminal_record, null);
		assert.equal(existsSync(resolve(PROJECT_ROOT, run.run_root, "terminal.json")), false);
		const inspected = await inspectRunV0B(PROJECT_ROOT, run.run_id);
		assert.equal(inspected.committed, false);
		assert.equal(inspected.integrity_valid, false);
	}
});

test("bounded scanner rejects audited JSON and Authorization variants without persisting matched values", () => {
	const fileCases = [
		String.raw`{"api\u005fkey":"V0B_SYNTHETIC_ESCAPED_VALUE"}`,
		"Authorization: Basic VjBCX1NZTlRIRVRJQ19CQVNJQw==",
	];
	for (const [index, content] of fileCases.entries()) {
		const path = resolve(PROJECT_ROOT, `.runs/v0-b/test-cases/scanner-post-audit-${index}.json`);
		writeFileSync(path, content, "utf8");
		const result = scanPreterminalEvidenceV0B({
			files: [{ scope_label: `file-${index}`, path }],
			objects: [],
		});
		assert.equal(result.status, "rejected");
		assert.doesNotMatch(JSON.stringify(result), /V0B_SYNTHETIC|VjBCX1NZ/);
	}
	for (const value of ["Bearer\tV0B_SYNTHETIC_TAB_VALUE", "Bearer\nV0B_SYNTHETIC_NEWLINE_VALUE"]) {
		const result = scanPreterminalEvidenceV0B({
			files: [],
			objects: [{ scope_label: "object", value: { authorization: value } }],
		});
		assert.equal(result.status, "rejected");
		assert.doesNotMatch(JSON.stringify(result), /V0B_SYNTHETIC/);
	}
	const existing = scanPreterminalEvidenceV0B({
		files: [],
		objects: [{ scope_label: "control", value: { api_key: "V0B_SYNTHETIC_EXISTING_CONTROL" } }],
	});
	assert.equal(existing.status, "rejected");
	const benign = scanPreterminalEvidenceV0B({
		files: [],
		objects: [{ scope_label: "benign", value: { authorization_required: false, api_key_count: 0 } }],
	});
	assert.equal(benign.status, "passed");
});

test("bounded scanner rejects flat and nested Basic Authorization objects with metadata-only evidence", () => {
	const cases = [
		{
			scope_label: "flat-basic-object",
			value: { authorization: "Basic VjBCX1NZTlRIRVRJQ19CQVNJQw==" },
		},
		{
			scope_label: "nested-basic-header-object",
			value: {
				request: {
					headers: {
						Authorization: "Basic VjBCX1NZTlRIRVRJQ19CQVNJQw==",
					},
				},
			},
		},
	];
	for (const entry of cases) {
		const result = scanPreterminalEvidenceV0B({ files: [], objects: [entry] });
		assert.equal(result.status, "rejected");
		assert.equal(result.match_count, 1);
		assert.deepEqual(result.matches, [{ scope_label: entry.scope_label, rule_id: "basic_authorization" }]);
		assert.doesNotMatch(JSON.stringify(result), /VjBCX1NZTlRIRVRJQ19CQVNJQw/);
	}
	const benign = scanPreterminalEvidenceV0B({
		files: [],
		objects: [
			{
				scope_label: "benign-basic-control",
				value: { authorization_required: false, authorization_scheme: "none" },
			},
		],
	});
	assert.equal(benign.status, "passed");
	assert.equal(benign.match_count, 0);
});
