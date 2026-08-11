import assert from "node:assert/strict";
import { cpSync, existsSync, linkSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { digestObject, sha256 } from "../src/hash.ts";
import {
	createChangeSetV36,
	performChangeHandoffV36,
	persistInitialInventoryV36,
	safeChangeSetV36,
	validateChangeSetV36,
	type ChangeSetHostContextV36,
} from "../src/workspace/change-set-v36.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function fixture(label: string): ChangeSetHostContextV36 {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g2/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "source");
	const session = resolve(root, "session");
	const workspace = resolve(session, "workspace");
	mkdirSync(resolve(source, "src"), { recursive: true });
	mkdirSync(resolve(source, "test"), { recursive: true });
	mkdirSync(session, { recursive: true });
	writeFileSync(resolve(source, "src/a.js"), "export const a = 1;\n");
	writeFileSync(resolve(source, "src/b.js"), "export const b = 1;\n");
	writeFileSync(resolve(source, "test/protected.js"), "protected\n");
	writeFileSync(resolve(source, "package.json"), "{}\n");
	cpSync(source, workspace, { recursive: true });
	const initial = persistInitialInventoryV36(session, workspace);
	return {
		project_id: "handoff-project",
		session_id: "handoff-session",
		run_id: "handoff-run",
		project_profile_digest: sha256("profile"),
		source_snapshot_identity: initial.inventory_digest,
		session_root: session,
		workspace_root: workspace,
		source_root: source,
		writable_paths: ["src/**"],
		protected_paths: ["test/**", "package.json"],
	};
}

test("immutable add/modify/delete ChangeSet projects a bounded Diff and Apply All uses exact blobs", () => {
	const context = fixture("apply");
	writeFileSync(resolve(context.workspace_root, "src/a.js"), "export const a = 2;\n");
	rmSync(resolve(context.workspace_root, "src/b.js"));
	writeFileSync(resolve(context.workspace_root, "src/c.js"), "export const c = 3;\n");
	const changeSet = createChangeSetV36(context);
	assert.deepEqual(changeSet.changes.map((entry) => [entry.path, entry.operation]), [["src/a.js", "modify"], ["src/b.js", "delete"], ["src/c.js", "add"]]);
	const safe = safeChangeSetV36(context, changeSet.change_set_digest);
	assert.equal(safe.status, "proposed");
	assert.match(safe.changes[0]!.diff, /before|after|a = 2/);
	assert.doesNotMatch(JSON.stringify(safe), /[A-Za-z]:[\\/]/);
	const receipt = performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: changeSet.change_set_digest, action: "apply_all" });
	assert.equal("status" in receipt && receipt.status, "applied");
	assert.equal(readFileSync(resolve(context.source_root, "src/a.js"), "utf8"), "export const a = 2;\n");
	assert.throws(() => readFileSync(resolve(context.source_root, "src/b.js")), /ENOENT/);
	assert.equal(readFileSync(resolve(context.source_root, "src/c.js"), "utf8"), "export const c = 3;\n");
	assert.throws(() => performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: changeSet.change_set_digest, action: "apply_all" }), /already terminal|already applied/);
});

test("stale preimage, add collision, hardlink and reparse substitution reject before mutation", () => {
	for (const variant of ["stale", "collision", "hardlink", "reparse"] as const) {
		const context = fixture(`preflight-${variant}`);
		writeFileSync(resolve(context.workspace_root, "src/a.js"), "export const a = 9;\n");
		if (variant === "collision") writeFileSync(resolve(context.workspace_root, "src/new.js"), "new\n");
		const changeSet = createChangeSetV36(context);
		const sourceBefore = readFileSync(resolve(context.source_root, "src/a.js"), "utf8");
		if (variant === "stale") writeFileSync(resolve(context.source_root, "src/a.js"), "concurrent source edit\n");
		if (variant === "collision") writeFileSync(resolve(context.source_root, "src/new.js"), "collision\n");
		if (variant === "hardlink") {
			rmSync(resolve(context.source_root, "src/a.js"));
			linkSync(resolve(context.source_root, "src/b.js"), resolve(context.source_root, "src/a.js"));
		}
		if (variant === "reparse") {
			const outside = resolve(context.session_root, "outside");
			mkdirSync(outside);
			writeFileSync(resolve(outside, "a.js"), sourceBefore);
			rmSync(resolve(context.source_root, "src"), { recursive: true });
			symlinkSync(outside, resolve(context.source_root, "src"), "junction");
		}
		assert.throws(() => performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: changeSet.change_set_digest, action: "apply_all" }), /stale|collision|identity|symlink|junction|reparse/i, variant);
		if (variant === "collision") assert.equal(readFileSync(resolve(context.source_root, "src/new.js"), "utf8"), "collision\n");
	}
});

test("an older persisted ChangeSet cannot be applied or discarded after a later managed Workspace head", () => {
	const context = fixture("stale-selection");
	writeFileSync(resolve(context.workspace_root, "src/a.js"), "export const a = 2;\n");
	const older = createChangeSetV36(context);
	writeFileSync(resolve(context.workspace_root, "src/a.js"), "export const a = 3;\n");
	const current = createChangeSetV36(context);
	assert.notEqual(older.change_set_digest, current.change_set_digest);
	const sourceBefore = readFileSync(resolve(context.source_root, "src/a.js"));
	assert.throws(() => performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: older.change_set_digest, action: "apply_all" }), /current managed Workspace head/);
	assert.throws(() => performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: older.change_set_digest, action: "discard" }), /current managed Workspace head/);
	assert.equal(existsSync(resolve(context.session_root, "handoff", older.change_set_digest)), false);
	assert.deepEqual(readFileSync(resolve(context.source_root, "src/a.js")), sourceBefore);
	const historicalExport = performChangeHandoffV36(context, { session_id: context.session_id, change_set_digest: older.change_set_digest, action: "export" });
	assert.equal("export_digest" in historicalExport, true);
});

test("protected/out-of-scope/traversal and tampered envelope or blob fail closed", () => {
	const protectedContext = fixture("protected");
	writeFileSync(resolve(protectedContext.workspace_root, "test/protected.js"), "changed\n");
	assert.throws(() => createChangeSetV36(protectedContext), /outside authorized writable scope/);

	const tamperContext = fixture("tamper");
	writeFileSync(resolve(tamperContext.workspace_root, "src/a.js"), "changed\n");
	const changeSet = createChangeSetV36(tamperContext);
	const root = resolve(tamperContext.session_root, "change-sets", changeSet.change_set_digest);
	const envelopePath = resolve(root, "change-set.json");
	const envelope = JSON.parse(readFileSync(envelopePath, "utf8")) as Record<string, unknown>;
	envelope.run_id = "tampered-run";
	writeFileSync(envelopePath, `${JSON.stringify(envelope)}\n`);
	assert.throws(() => validateChangeSetV36(tamperContext.session_root, changeSet.change_set_digest), /envelope|invalid/);

	const traversal = fixture("traversal");
	writeFileSync(resolve(traversal.workspace_root, "src/a.js"), "changed\n");
	const traversalSet = createChangeSetV36(traversal);
	const traversalRoot = resolve(traversal.session_root, "change-sets", traversalSet.change_set_digest);
	const invalid = { ...traversalSet, changes: [{ ...traversalSet.changes[0]!, path: "../outside" }] };
	const invalidBody = { ...invalid } as Record<string, unknown>;
	delete invalidBody.change_set_digest;
	invalid.change_set_digest = digestObject(invalidBody);
	writeFileSync(resolve(traversalRoot, "change-set.json"), `${JSON.stringify(invalid)}\n`);
	assert.throws(() => validateChangeSetV36(traversal.session_root, traversalSet.change_set_digest), /envelope|invalid/);
});

test("Discard and Export do not mutate Source, while injected failure records truthful recovery material", () => {
	const discarded = fixture("discard");
	writeFileSync(resolve(discarded.workspace_root, "src/a.js"), "discarded change\n");
	const discardSet = createChangeSetV36(discarded);
	const exported = performChangeHandoffV36(discarded, { session_id: discarded.session_id, change_set_digest: discardSet.change_set_digest, action: "export" });
	assert.equal("export_digest" in exported, true);
	assert.equal(readFileSync(resolve(discarded.source_root, "src/a.js"), "utf8"), "export const a = 1;\n");
	const discardReceipt = performChangeHandoffV36(discarded, { session_id: discarded.session_id, change_set_digest: discardSet.change_set_digest, action: "discard" });
	assert.equal("status" in discardReceipt && discardReceipt.status, "discarded");
	assert.equal(readFileSync(resolve(discarded.source_root, "src/a.js"), "utf8"), "export const a = 1;\n");

	const partial = fixture("partial");
	writeFileSync(resolve(partial.workspace_root, "src/a.js"), "export const a = 2;\n");
	writeFileSync(resolve(partial.workspace_root, "src/b.js"), "export const b = 2;\n");
	const partialSet = createChangeSetV36(partial);
	const receipt = performChangeHandoffV36(partial, { session_id: partial.session_id, change_set_digest: partialSet.change_set_digest, action: "apply_all" }, { injectFailureAfterWrites: 1 });
	assert.equal("status" in receipt && receipt.status, "partial_apply_error");
	if (!("journal" in receipt)) throw new Error("receipt missing journal");
	assert.deepEqual(receipt.journal.map((entry) => entry.state), ["applied", "not_applied"]);
	assert.ok(receipt.journal.every((entry) => entry.recovery_blob_ref !== null));
	assert.equal(readFileSync(resolve(partial.source_root, "src/a.js"), "utf8"), "export const a = 2;\n");
	assert.equal(readFileSync(resolve(partial.source_root, "src/b.js"), "utf8"), "export const b = 1;\n");
});

test("safe ChangeSet projection validates receipt integrity and initial before-blob content", () => {
	const receiptContext = fixture("receipt-integrity");
	writeFileSync(resolve(receiptContext.workspace_root, "src/a.js"), "export const a = 2;\n");
	const receiptSet = createChangeSetV36(receiptContext);
	performChangeHandoffV36(receiptContext, { session_id: receiptContext.session_id, change_set_digest: receiptSet.change_set_digest, action: "apply_all" });
	const receiptPath = resolve(receiptContext.session_root, "handoff", receiptSet.change_set_digest, "apply-receipt.json");
	const receipt = JSON.parse(readFileSync(receiptPath, "utf8")) as Record<string, unknown>;
	receipt.status = "discarded";
	writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
	assert.throws(() => safeChangeSetV36(receiptContext, receiptSet.change_set_digest), /receipt/);

	const blobContext = fixture("before-blob-integrity");
	writeFileSync(resolve(blobContext.workspace_root, "src/a.js"), "export const a = 2;\n");
	const blobSet = createChangeSetV36(blobContext);
	const beforeDigest = blobSet.changes[0]!.before_sha256!;
	writeFileSync(resolve(blobContext.session_root, "initial-blobs", `${beforeDigest}.bin`), "tampered\n");
	assert.throws(() => safeChangeSetV36(blobContext, blobSet.change_set_digest), /before blob/);
});
