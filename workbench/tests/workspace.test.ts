import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { INITIAL_PARSE_DURATION_SOURCE } from "../src/pi/faux-sequence.ts";
import { createTemporaryWorkspace } from "../src/workspace/temp-copy.ts";
import { isPathInScope, resolveWorkspacePath } from "../src/workspace/path-policy.ts";
import { FORMAL_SOURCE_ROOT, PROJECT_ROOT, copyFormalWorkspace, loadFormalTask, testCaseRoot } from "./helpers.ts";

test("temporary-copy workspace is independent and records no hardlinks", () => {
	const { workspaceRoot } = copyFormalWorkspace("temp-copy");
	const sourceFile = resolve(FORMAL_SOURCE_ROOT, "src/parse-duration.ts");
	const copiedFile = resolve(workspaceRoot, "src/parse-duration.ts");
	assert.equal(readFileSync(copiedFile, "utf8"), INITIAL_PARSE_DURATION_SOURCE);
	assert.notEqual(statSync(sourceFile).ino, statSync(copiedFile).ino);
	writeFileSync(copiedFile, `${INITIAL_PARSE_DURATION_SOURCE}\n`, "utf8");
	assert.equal(readFileSync(sourceFile, "utf8"), INITIAL_PARSE_DURATION_SOURCE);
});

test("path policy allows bounded reads and declared writes", () => {
	const { workspaceRoot, task } = copyFormalWorkspace("path-allow");
	assert.equal(
		resolveWorkspacePath({
			workspaceRoot,
			path: "task.md",
			operation: "read",
			writablePaths: task.writable_paths,
			protectedPaths: task.protected_paths,
		}),
		resolve(workspaceRoot, "task.md"),
	);
	assert.equal(
		resolveWorkspacePath({
			workspaceRoot,
			path: "src/parse-duration.ts",
			operation: "edit",
			writablePaths: task.writable_paths,
			protectedPaths: task.protected_paths,
		}),
		resolve(workspaceRoot, "src/parse-duration.ts"),
	);
	const broaderTask = { ...task, writable_paths: ["src/**"] };
	assert.equal(
		resolveWorkspacePath({
			workspaceRoot,
			path: "src/new/nested.ts",
			operation: "write",
			writablePaths: broaderTask.writable_paths,
			protectedPaths: broaderTask.protected_paths,
		}),
		resolve(workspaceRoot, "src/new/nested.ts"),
	);
});

test("path policy rejects traversal, absolute, UNC/drive, URI, NUL, protected, and external evidence paths", () => {
	const { workspaceRoot, task } = copyFormalWorkspace("path-deny");
	const rejected = [
		"../outside.txt",
		"..\\outside.txt",
		"C:\\Windows\\win.ini",
		"\\\\server\\share\\file",
		"file:///C:/Windows/win.ini",
		"http://example.invalid/file",
		"src/parse-duration.ts:alternate-stream",
		"src/\0escape.ts",
		"../../evidence/gate.json",
	];
	for (const path of rejected) {
		assert.throws(() =>
			resolveWorkspacePath({
				workspaceRoot,
				path,
				operation: "read",
				writablePaths: task.writable_paths,
				protectedPaths: task.protected_paths,
			}),
		);
	}
	for (const path of task.protected_paths) {
		const before = readFileSync(resolve(workspaceRoot, path));
		assert.throws(() =>
			resolveWorkspacePath({
				workspaceRoot,
				path,
				operation: "write",
				writablePaths: task.writable_paths,
				protectedPaths: task.protected_paths,
			}),
		);
		assert.deepEqual(readFileSync(resolve(workspaceRoot, path)), before);
	}
});

test("path policy rejects a junction/reparse escape on every operation", () => {
	const { testRoot, workspaceRoot, task } = copyFormalWorkspace("junction-deny");
	const external = resolve(testRoot, "external");
	mkdirSync(external);
	writeFileSync(resolve(external, "secret.txt"), "outside\n", "utf8");
	const link = resolve(workspaceRoot, "escape-link");
	symlinkSync(external, link, "junction");
	assert.equal(lstatSync(link).isSymbolicLink(), true);
	for (const operation of ["read", "list", "search", "edit", "write"] as const) {
		assert.throws(
			() =>
				resolveWorkspacePath({
					workspaceRoot,
					path: "escape-link/secret.txt",
					operation,
					writablePaths: operation === "edit" || operation === "write" ? ["escape-link/**"] : task.writable_paths,
					protectedPaths: task.protected_paths,
				}),
			/symlink or junction/,
		);
	}
});

test("path policy rejects a dangling junction ancestor for a write with no side effect", () => {
	const { testRoot, workspaceRoot, task } = copyFormalWorkspace("dangling-junction-deny");
	const external = resolve(testRoot, "external");
	const movedExternal = resolve(testRoot, "external-moved");
	mkdirSync(external);
	const link = resolve(workspaceRoot, "escape");
	symlinkSync(external, link, "junction");
	renameSync(external, movedExternal);
	assert.equal(existsSync(link), false);
	assert.equal(lstatSync(link).isSymbolicLink(), true);
	assert.throws(
		() =>
			resolveWorkspacePath({
				workspaceRoot,
				path: "escape/new.txt",
				operation: "write",
				writablePaths: ["escape/**"],
				protectedPaths: task.protected_paths,
			}),
		/symlink or junction/,
	);
	assert.equal(existsSync(resolve(movedExternal, "new.txt")), false);
});

test("scope identity follows host filesystem case semantics", () => {
	assert.equal(isPathInScope("TASK.MD", ["task.md"]), process.platform === "win32");
});

test(
	"Windows protected paths reject case-only aliases",
	{ skip: process.platform !== "win32" },
	() => {
		const { workspaceRoot } = copyFormalWorkspace("case-alias-deny");
		const protectedPath = resolve(workspaceRoot, "task.md");
		const before = readFileSync(protectedPath);
		assert.throws(
			() =>
				resolveWorkspacePath({
					workspaceRoot,
					path: "TASK.MD",
					operation: "write",
					writablePaths: ["TASK.MD"],
					protectedPaths: ["task.md"],
				}),
			/protected path/,
		);
		assert.deepEqual(readFileSync(protectedPath), before);
	},
);

test("temporary-copy rejects a linked source root before creating its target", () => {
	const task = loadFormalTask();
	const testRoot = testCaseRoot("linked-source-root");
	const linkedSource = resolve(testRoot, "linked-source");
	const targetRoot = resolve(testRoot, "workspace");
	symlinkSync(FORMAL_SOURCE_ROOT, linkedSource, "junction");
	assert.equal(lstatSync(linkedSource).isSymbolicLink(), true);
	assert.throws(
		() =>
			createTemporaryWorkspace({
				projectRoot: PROJECT_ROOT,
				sourceRoot: linkedSource,
				targetRoot,
				workspaceId: "linked-source-root-rejection",
				task,
			}),
		/tree root is a symlink or junction/,
	);
	assert.equal(existsSync(targetRoot), false);
});

test("formal source root and entries contain no symlink or junction", () => {
	assert.equal(lstatSync(FORMAL_SOURCE_ROOT).isSymbolicLink(), false, "formal source root must not be a link");
	const task = loadFormalTask();
	for (const path of ["task.md", "task.json", "package.json", "src", "test"]) {
		assert.equal(lstatSync(resolve(FORMAL_SOURCE_ROOT, path)).isSymbolicLink(), false, `${path} must not be a link`);
	}
	assert.deepEqual(task.writable_paths, ["src/parse-duration.ts"]);
});
