import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createIsolatedWorkspace, createWorkspaceDiff, snapshotWorkspace } from "../src/coding-task/workspace.ts";

test("isolated Workspace excludes Git metadata and leaves Source unchanged", () => {
	const root = mkdtempSync(resolve(tmpdir(), "coding-task-workspace-"));
	const source = resolve(root, "source");
	mkdirSync(resolve(source, ".git"), { recursive: true });
	mkdirSync(resolve(source, "src"), { recursive: true });
	writeFileSync(resolve(source, ".git/config"), "secret remote\n");
	writeFileSync(resolve(source, "src/subject.ts"), "export const value = 1;\n");
	const sourceBytes = readFileSync(resolve(source, "src/subject.ts"));
	const workspace = resolve(root, "run/workspace");
	const isolated = createIsolatedWorkspace(source, workspace);
	assert.equal(existsSync(resolve(workspace, ".git")), false);
	writeFileSync(resolve(workspace, "src/subject.ts"), "export const value = 2;\n");
	assert.deepEqual(readFileSync(resolve(source, "src/subject.ts")), sourceBytes);
	assert.equal(snapshotWorkspace(source).tree_digest, isolated.source_before.tree_digest);
});

test("bounded content Diff reports only the changed file", () => {
	const root = mkdtempSync(resolve(tmpdir(), "coding-task-diff-"));
	mkdirSync(resolve(root, "src"), { recursive: true });
	writeFileSync(resolve(root, "src/a.ts"), "export const a = 1;\n");
	writeFileSync(resolve(root, "src/b.ts"), "export const b = 1;\n");
	const before = snapshotWorkspace(root);
	writeFileSync(resolve(root, "src/a.ts"), "export const a = 2;\n");
	const diff = createWorkspaceDiff(before, snapshotWorkspace(root));
	assert.deepEqual(diff.changes, { added: [], modified: ["src/a.ts"], deleted: [] });
	assert.match(diff.patch, /--- a\/src\/a\.ts/);
	assert.match(diff.patch, /-export const a = 1;/);
	assert.match(diff.patch, /\+export const a = 2;/);
	assert.doesNotMatch(diff.patch, /src\/b\.ts/);
});
