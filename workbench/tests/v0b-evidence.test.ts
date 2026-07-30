import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdirSync, renameSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
	resolveRunRelative,
	validateArtifactRef,
	validateRunRootBoundary,
	writeOnceJson,
} from "../src/evidence/artifacts.ts";
import { JournalWriterV0B, readJournal, validateJournal } from "../src/evidence/journal.ts";
import { validateJournalArtifactRefsV0B } from "../src/evidence/validator.ts";
import { PROJECT_ROOT } from "./helpers.ts";

test("write-once ArtifactRefs reject collisions, traversal, and post-write tampering", () => {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases", `artifact-${randomUUID()}`);
	mkdirSync(root, { recursive: true });
	const ref = writeOnceJson(root, "outcome.json", { status: "passed" });
	assert.deepEqual(validateArtifactRef(root, ref), []);
	assert.throws(() => writeOnceJson(root, "outcome.json", { status: "failed" }), /EEXIST/);
	assert.throws(() => resolveRunRelative(root, "../outside.json"), /invalid run-relative path/);
	writeFileSync(resolve(root, "outcome.json"), '{"status":"tampered"}\n', "utf8");
	assert.match(validateArtifactRef(root, ref).join("\n"), /mismatch/);
});

test("ArtifactRef rejects intermediate, dangling, final links and directory masquerading", () => {
	const base = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases", `artifact-links-${randomUUID()}`);
	const runRoot = resolve(base, "run-root");
	const external = resolve(base, "external");
	mkdirSync(runRoot, { recursive: true });
	mkdirSync(external, { recursive: true });
	writeFileSync(resolve(external, "secret.txt"), "outside\n", "utf8");
	const ref = (path: string) => ({
		path,
		sha256: "0".repeat(64),
		size_bytes: 8,
		media_type: "text/plain",
		truncated: false,
	});

	const intermediate = resolve(runRoot, "intermediate");
	symlinkSync(external, intermediate, "junction");
	assert.match(validateArtifactRef(runRoot, ref("intermediate/secret.txt")).join("\n"), /symlink or junction/);

	const danglingTarget = resolve(base, "dangling-target");
	const movedTarget = resolve(base, "dangling-target-moved");
	mkdirSync(danglingTarget);
	const dangling = resolve(runRoot, "dangling");
	symlinkSync(danglingTarget, dangling, "junction");
	renameSync(danglingTarget, movedTarget);
	assert.match(validateArtifactRef(runRoot, ref("dangling/secret.txt")).join("\n"), /symlink or junction/);

	const directory = resolve(runRoot, "directory-artifact");
	mkdirSync(directory);
	assert.match(validateArtifactRef(runRoot, ref("directory-artifact")).join("\n"), /not an ordinary file/);

	const finalLink = resolve(runRoot, "final-link");
	try {
		symlinkSync(resolve(external, "secret.txt"), finalLink, "file");
	} catch {
		symlinkSync(external, finalLink, "junction");
	}
	assert.match(validateArtifactRef(runRoot, ref("final-link")).join("\n"), /symlink or junction/);

	const linkedRunRoot = resolve(base, "linked-run-root");
	symlinkSync(runRoot, linkedRunRoot, "junction");
	assert.match(validateRunRootBoundary(linkedRunRoot).join("\n"), /Run root is a symlink or junction/);
});

test("Journal ArtifactRef declarations fail closed when their envelope is malformed", () => {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases", `journal-ref-${randomUUID()}`);
	mkdirSync(root, { recursive: true });
	const identity = {
		run_id: "run-journal-ref",
		attempt_id: "attempt-journal-ref",
		session_id: "session-journal-ref",
		workspace_id: "workspace-journal-ref",
	};
	const writer = new JournalWriterV0B(resolve(root, "events.jsonl"), identity);
	writer.append("verifier_completed", { full_output_ref: "artifacts/output.txt" });
	const errors = validateJournalArtifactRefsV0B(root, readJournal(writer.path));
	assert.match(errors.join("\n"), /declared ArtifactRef is malformed/);
});

test("closed Journal validates contiguous sequence, identities, ordering, and Tool pairing", () => {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/test-cases", `journal-${randomUUID()}`);
	mkdirSync(root, { recursive: true });
	const identity = {
		run_id: "run-journal",
		attempt_id: "attempt-journal",
		session_id: "session-journal",
		workspace_id: "workspace-journal",
	};
	const writer = new JournalWriterV0B(resolve(root, "events.jsonl"), identity);
	writer.append("run_started");
	writer.append("attempt_started");
	writer.append("workspace_materialized");
	writer.append("session_linked");
	writer.append("tool_call_started", { tool_call_id: "call-1" });
	writer.append("tool_call_completed", { tool_call_id: "call-1" });
	writer.append("attempt_settled");
	writer.append("workspace_finalized");
	writer.append("verifier_started");
	writer.append("verifier_completed");
	writer.append("evidence_validation_completed");
	writer.append("outcome_created");
	writer.append("run_terminal");
	const entries = readJournal(writer.path);
	assert.deepEqual(validateJournal(entries, identity, { requireValidationCompleted: true }), []);
	assert.deepEqual(
		entries.map((entry) => entry.seq),
		Array.from({ length: entries.length }, (_, index) => index + 1),
	);
});
