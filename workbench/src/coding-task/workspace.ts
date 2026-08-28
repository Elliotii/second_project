import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { digestObject, sha256 } from "../hash.ts";

export interface SnapshotFile {
	path: string;
	bytes: Buffer;
	sha256: string;
}

export interface WorkspaceSnapshot {
	files: Map<string, SnapshotFile>;
	tree_digest: string;
}

function portable(root: string, path: string): string {
	return relative(root, path).split(sep).join("/");
}

function visitOrdinaryFiles(root: string, operation: (absolute: string, path: string) => void): void {
	const canonicalRoot = resolve(root);
	const rootStats = lstatSync(canonicalRoot);
	if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) throw new Error(`tree root must be an ordinary directory: ${canonicalRoot}`);
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			if (entry.name === ".git") continue;
			const absolute = join(directory, entry.name);
			const stats = lstatSync(absolute);
			if (stats.isSymbolicLink()) throw new Error(`source contains a symlink or junction: ${portable(canonicalRoot, absolute)}`);
			if (stats.isDirectory()) visit(absolute);
			else if (stats.isFile()) operation(absolute, portable(canonicalRoot, absolute));
			else throw new Error(`source contains an unsupported file: ${portable(canonicalRoot, absolute)}`);
		}
	};
	visit(canonicalRoot);
}

export function snapshotWorkspace(root: string): WorkspaceSnapshot {
	const files = new Map<string, SnapshotFile>();
	visitOrdinaryFiles(root, (absolute, path) => {
		const bytes = readFileSync(absolute);
		files.set(path, { path, bytes, sha256: sha256(bytes) });
	});
	return {
		files,
		tree_digest: digestObject([...files.values()].map(({ path, bytes, sha256: digest }) => ({ path, bytes: bytes.length, sha256: digest }))),
	};
}

export function createIsolatedWorkspace(sourceRootValue: string, workspaceRootValue: string): { before: WorkspaceSnapshot; source_before: WorkspaceSnapshot } {
	const sourceRoot = resolve(sourceRootValue);
	const workspaceRoot = resolve(workspaceRootValue);
	if (existsSync(workspaceRoot)) throw new Error(`workspace target already exists: ${workspaceRoot}`);
	const sourceBefore = snapshotWorkspace(sourceRoot);
	mkdirSync(workspaceRoot, { recursive: true });
	visitOrdinaryFiles(sourceRoot, (absolute, path) => {
		const target = resolve(workspaceRoot, path.split("/").join(sep));
		mkdirSync(dirname(target), { recursive: true });
		copyFileSync(absolute, target);
	});
	const before = snapshotWorkspace(workspaceRoot);
	if (before.tree_digest !== sourceBefore.tree_digest) throw new Error("isolated Workspace snapshot differs from Source");
	return { before, source_before: sourceBefore };
}

function text(bytes: Buffer): string | null {
	if (bytes.includes(0)) return null;
	const value = bytes.toString("utf8");
	return value.includes("\uFFFD") ? null : value;
}

function bounded(value: string, maximum: number): { value: string; truncated: boolean } {
	const bytes = Buffer.from(value, "utf8");
	if (bytes.length <= maximum) return { value, truncated: false };
	return { value: `${bytes.subarray(0, maximum).toString("utf8")}\n[diff truncated]\n`, truncated: true };
}

export function createWorkspaceDiff(before: WorkspaceSnapshot, after: WorkspaceSnapshot, perFileLimit = 128 * 1024): {
	patch: string;
	changes: { added: string[]; modified: string[]; deleted: string[] };
	files: Array<Record<string, unknown>>;
} {
	const paths = [...new Set([...before.files.keys(), ...after.files.keys()])].sort();
	const added: string[] = [];
	const modified: string[] = [];
	const deleted: string[] = [];
	const patches: string[] = [];
	const files: Array<Record<string, unknown>> = [];
	for (const path of paths) {
		const left = before.files.get(path);
		const right = after.files.get(path);
		if (left?.sha256 === right?.sha256) continue;
		const status = !left ? "added" : !right ? "deleted" : "modified";
		(status === "added" ? added : status === "deleted" ? deleted : modified).push(path);
		const leftText = left ? text(left.bytes) : "";
		const rightText = right ? text(right.bytes) : "";
		if (leftText === null || rightText === null) {
			files.push({ path, status, binary: true, before_bytes: left?.bytes.length ?? 0, after_bytes: right?.bytes.length ?? 0, before_sha256: left?.sha256 ?? null, after_sha256: right?.sha256 ?? null });
			patches.push(`Binary files ${left ? `a/${path}` : "/dev/null"} and ${right ? `b/${path}` : "/dev/null"} differ\n`);
			continue;
		}
		const oldLines = leftText === "" ? [] : leftText.replace(/\n$/, "").split("\n");
		const newLines = rightText === "" ? [] : rightText.replace(/\n$/, "").split("\n");
		const raw = [`--- ${left ? `a/${path}` : "/dev/null"}`, `+++ ${right ? `b/${path}` : "/dev/null"}`, `@@ -1,${oldLines.length} +1,${newLines.length} @@`, ...oldLines.map((line) => `-${line}`), ...newLines.map((line) => `+${line}`), ""].join("\n");
		const projected = bounded(raw, perFileLimit);
		patches.push(projected.value);
		files.push({ path, status, binary: false, truncated: projected.truncated, before_bytes: left?.bytes.length ?? 0, after_bytes: right?.bytes.length ?? 0, before_sha256: left?.sha256 ?? null, after_sha256: right?.sha256 ?? null });
	}
	return { patch: patches.join("\n"), changes: { added, modified, deleted }, files };
}

export function assertSourceUnchanged(sourceRoot: string, before: WorkspaceSnapshot): void {
	if (snapshotWorkspace(sourceRoot).tree_digest !== before.tree_digest) throw new Error("Source repository changed during isolated execution");
}
