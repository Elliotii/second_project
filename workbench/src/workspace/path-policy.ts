import { lstatSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { matchesWorkspaceScope } from "./path-identity.ts";

export type PathOperation = "read" | "list" | "search" | "edit" | "write";

function portablePath(path: string): string {
	return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isOutside(root: string, candidate: string): boolean {
	const rel = relative(root, candidate);
	return rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel);
}

function errorCode(error: unknown): string | undefined {
	return error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : undefined;
}

function assertOrdinaryWorkspaceRoot(root: string): string {
	const resolvedRoot = resolve(root);
	const stats = lstatSync(resolvedRoot);
	if (stats.isSymbolicLink()) throw new Error("workspace root cannot be a symlink or junction");
	if (!stats.isDirectory()) throw new Error("workspace root must be a directory");
	return realpathSync.native(resolvedRoot);
}

function assertNoReparsePath(root: string, target: string, allowMissingPath: boolean): string {
	const rel = relative(root, target);
	const segments = rel === "" ? [] : rel.split(sep);
	let cursor = root;
	let canonicalCursor = root;
	for (const segment of segments) {
		cursor = resolve(cursor, segment);
		let stats;
		try {
			stats = lstatSync(cursor);
		} catch (error) {
			if (errorCode(error) !== "ENOENT") throw error;
			if (allowMissingPath) {
				if (isOutside(root, canonicalCursor)) throw new Error("nearest existing parent escapes workspace");
				return portablePath(relative(root, target));
			}
			throw new Error(`path does not exist: ${rel}`);
		}
		if (stats.isSymbolicLink()) throw new Error(`symlink or junction is forbidden: ${portablePath(rel)}`);
		const real = realpathSync.native(cursor);
		if (isOutside(root, real)) throw new Error(`real path escapes workspace: ${portablePath(rel)}`);
		canonicalCursor = real;
	}
	return portablePath(relative(root, canonicalCursor));
}

export function resolveWorkspacePath(options: {
	workspaceRoot: string;
	path: string;
	operation: PathOperation;
	writablePaths: readonly string[];
	protectedPaths: readonly string[];
}): string {
	const { workspaceRoot, path, operation, writablePaths, protectedPaths } = options;
	if (typeof path !== "string" || path.length === 0 || path.includes("\0")) throw new Error("path must be non-empty and NUL-free");
	const portable = portablePath(path);
	if (
		isAbsolute(path) ||
		portable.startsWith("/") ||
		portable.startsWith("//") ||
		portable.includes(":") ||
		/^[A-Za-z]:/.test(portable) ||
		/^[A-Za-z][A-Za-z0-9+.-]*:/.test(portable) ||
		portable.split("/").includes("..")
	) {
		throw new Error(`unbounded path is forbidden: ${path}`);
	}
	const canonicalRoot = assertOrdinaryWorkspaceRoot(workspaceRoot);
	const target = resolve(canonicalRoot, portable.split("/").join(sep));
	if (isOutside(canonicalRoot, target)) throw new Error(`path escapes workspace: ${path}`);
	const mutation = operation === "edit" || operation === "write";
	const scopeIdentity = assertNoReparsePath(canonicalRoot, target, mutation);
	if (mutation && protectedPaths.some((pattern) => matchesWorkspaceScope(scopeIdentity, pattern))) {
		throw new Error(`protected path is not writable: ${scopeIdentity}`);
	}
	if (mutation && !writablePaths.some((pattern) => matchesWorkspaceScope(scopeIdentity, pattern))) {
		throw new Error(`path is outside writable scope: ${scopeIdentity}`);
	}
	return target;
}

export function isPathInScope(path: string, patterns: readonly string[]): boolean {
	return patterns.some((pattern) => matchesWorkspaceScope(path, pattern));
}
