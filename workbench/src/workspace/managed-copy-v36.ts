import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { SafeWorkspaceTextPreviewV36, SafeWorkspaceTreeV36, WorkspaceTreeEntryV36 } from "../contracts/v36-types.ts";
import type { WorkspaceInventoryV36 } from "../contracts/v36g2-types.ts";
import { digestObject, sha256 } from "../hash.ts";
import { resolveWorkspacePath } from "./path-policy.ts";

export const V36_WORKSPACE_LIMITS = Object.freeze({ max_files: 2_048, max_total_bytes: 32 * 1024 * 1024, max_preview_bytes: 128 * 1024 });

interface InventoryFileV36 { path: string; bytes: number; sha256: string }

function portable(value: string): string { return value.split(sep).join("/"); }

function ordinaryRoot(pathValue: string, label: string): string {
	const path = resolve(pathValue);
	const stats = lstatSync(path);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(path);
}

function visitFiles(root: string, allowRootGitOmission: boolean): InventoryFileV36[] {
	const files: InventoryFileV36[] = [];
	let total = 0;
	const visit = (directory: string, topLevel: boolean): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			if (topLevel && entry.name === ".git") {
				if (allowRootGitOmission) continue;
				throw new Error("managed Workspace must not contain .git");
			}
			const path = resolve(directory, entry.name);
			const stats = lstatSync(path);
			const rel = portable(relative(root, path));
			if (stats.isSymbolicLink()) throw new Error(`managed Source contains a symlink or junction: ${rel}`);
			if (stats.isDirectory()) { visit(path, false); continue; }
			if (!stats.isFile()) throw new Error(`managed Source contains an unsupported file: ${rel}`);
			if (stats.nlink !== 1) throw new Error(`managed Source contains a hardlinked file: ${rel}`);
			if (files.length >= V36_WORKSPACE_LIMITS.max_files) throw new Error("managed Source file-count limit exceeded");
			total += stats.size;
			if (total > V36_WORKSPACE_LIMITS.max_total_bytes) throw new Error("managed Source byte limit exceeded");
			files.push({ path: rel, bytes: stats.size, sha256: sha256(readFileSync(path)) });
		}
	};
	visit(root, true);
	return files;
}

export function managedWorkspaceIdentityV36(rootValue: string): string {
	return digestObject(visitFiles(ordinaryRoot(rootValue, "managed Workspace root"), false));
}

export function managedWorkspaceInventoryV36(rootValue: string): WorkspaceInventoryV36 {
	const files = visitFiles(ordinaryRoot(rootValue, "managed Workspace root"), false);
	return { schema_version: 1, files, inventory_digest: digestObject(files) };
}

export function registeredSourceInventoryV36(rootValue: string): WorkspaceInventoryV36 {
	const files = visitFiles(ordinaryRoot(rootValue, "registered Source root"), true);
	return { schema_version: 1, files, inventory_digest: digestObject(files) };
}

export function createManagedSessionCopyV36(options: { sourceRoot: string; targetRoot: string }): { source_snapshot_identity: string; code_identity: string; file_count: number; total_bytes: number } {
	const source = ordinaryRoot(options.sourceRoot, "registered Source root");
	const target = resolve(options.targetRoot);
	if (existsSync(target)) throw new Error("managed Workspace target already exists");
	const inventory = visitFiles(source, true);
	const sourceDigest = digestObject(inventory);
	mkdirSync(target, { recursive: false });
	for (const file of inventory) {
		const sourcePath = resolve(source, file.path.split("/").join(sep));
		const targetPath = resolve(target, file.path.split("/").join(sep));
		const rel = relative(target, targetPath);
		if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("managed Workspace copy path escaped");
		mkdirSync(resolve(targetPath, ".."), { recursive: true });
		copyFileSync(sourcePath, targetPath);
	}
	const codeIdentity = managedWorkspaceIdentityV36(target);
	if (codeIdentity !== sourceDigest) throw new Error("managed Workspace copy identity mismatch");
	return { source_snapshot_identity: sourceDigest, code_identity: codeIdentity, file_count: inventory.length, total_bytes: inventory.reduce((total, file) => total + file.bytes, 0) };
}

function assertPreviewPath(pathValue: string): void {
	if (typeof pathValue !== "string" || pathValue === "" || pathValue.includes("\0") || isAbsolute(pathValue) || pathValue.includes(":") || pathValue.replaceAll("\\", "/").split("/").includes("..")) throw new Error("Workspace preview path is invalid");
}

export function workspaceTreePreviewV36(options: { workspaceRoot: string; sessionId: string; workspaceId: string }): SafeWorkspaceTreeV36 {
	const root = ordinaryRoot(options.workspaceRoot, "managed Workspace root");
	const entries: WorkspaceTreeEntryV36[] = [];
	let files = 0;
	let totalBytes = 0;
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
			const path = resolve(directory, entry.name);
			const stats = lstatSync(path);
			const rel = portable(relative(root, path));
			if (directory === root && entry.name === ".git") throw new Error("Workspace preview rejects .git in the managed copy");
			if (stats.isSymbolicLink()) throw new Error("Workspace preview encountered a symlink or junction");
			if (stats.isDirectory()) { entries.push({ path: rel, kind: "directory", bytes: null }); visit(path); continue; }
			if (!stats.isFile() || stats.nlink !== 1) throw new Error("Workspace preview encountered an unsupported file");
			files += 1;
			totalBytes += stats.size;
			if (files > V36_WORKSPACE_LIMITS.max_files || totalBytes > V36_WORKSPACE_LIMITS.max_total_bytes) throw new Error("Workspace preview limits exceeded");
			entries.push({ path: rel, kind: "file", bytes: stats.size });
		}
	};
	visit(root);
	return { schema_version: 1, session_id: options.sessionId, workspace_id: options.workspaceId, managed_copy: true, read_only_preview: true, entries, limits: { max_files: V36_WORKSPACE_LIMITS.max_files, max_total_bytes: V36_WORKSPACE_LIMITS.max_total_bytes, truncated: false } };
}

export function workspaceTextPreviewV36(options: { workspaceRoot: string; sessionId: string; workspaceId: string; path: string }): SafeWorkspaceTextPreviewV36 {
	assertPreviewPath(options.path);
	const target = resolveWorkspacePath({ workspaceRoot: options.workspaceRoot, path: options.path, operation: "read", writablePaths: [], protectedPaths: [] });
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Workspace preview target is not an ordinary file");
	if (stats.size > V36_WORKSPACE_LIMITS.max_preview_bytes) throw new Error("Workspace preview file is oversized");
	const bytes = readFileSync(target);
	if (bytes.includes(0)) throw new Error("Workspace preview rejects binary data");
	const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	return { schema_version: 1, session_id: options.sessionId, workspace_id: options.workspaceId, path: portable(relative(ordinaryRoot(options.workspaceRoot, "managed Workspace root"), target)), media_type: "text/plain; charset=utf-8", bytes: bytes.length, text, truncated: false, read_only: true };
}
