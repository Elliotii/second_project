import {
	closeSync,
	existsSync,
	lstatSync,
	mkdirSync,
	openSync,
	readFileSync,
	realpathSync,
	writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileSha256, stableJson } from "../hash.ts";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";

function portable(value: string): string {
	return value.split(sep).join("/");
}

function isContained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function assertRunRoot(runRoot: string): string {
	const root = resolve(runRoot);
	let stats;
	try {
		stats = lstatSync(root);
	} catch {
		throw new Error("Run root is missing or unreadable");
	}
	if (stats.isSymbolicLink()) throw new Error("Run root is a symlink or junction");
	if (!stats.isDirectory()) throw new Error("Run root is not a directory");
	let realRoot: string;
	try {
		realRoot = realpathSync.native(root);
	} catch {
		throw new Error("Run root real path is unavailable");
	}
	return realRoot;
}

function assertLinkFreeExistingSegments(runRoot: string, target: string): void {
	const root = resolve(runRoot);
	const realRoot = assertRunRoot(root);
	const rel = relative(root, target);
	if (!isContained(root, target)) throw new Error("artifact path escapes Run root");
	const segments = rel === "" ? [] : rel.split(sep);
	let current = root;
	for (const [index, segment] of segments.entries()) {
		current = resolve(current, segment);
		let stats;
		try {
			stats = lstatSync(current);
		} catch {
			break;
		}
		if (stats.isSymbolicLink()) throw new Error("artifact path contains a symlink or junction");
		if (index < segments.length - 1 && !stats.isDirectory()) {
			throw new Error("artifact path ancestor is not a directory");
		}
	}
	if (!existsSync(target)) return;
	let realTarget: string;
	try {
		realTarget = realpathSync.native(target);
	} catch {
		throw new Error("artifact real path is unavailable");
	}
	if (!isContained(realRoot, realTarget)) throw new Error("artifact real path escapes Run root");
}

function assertRelativePath(runRelativePath: string): void {
	if (
		typeof runRelativePath !== "string" ||
		runRelativePath.length === 0 ||
		runRelativePath.includes("\0") ||
		isAbsolute(runRelativePath) ||
		runRelativePath.replaceAll("\\", "/").split("/").includes("..") ||
		/^[A-Za-z]:/.test(runRelativePath) ||
		/^[A-Za-z][A-Za-z0-9+.-]*:/.test(runRelativePath)
	) {
		throw new Error("invalid run-relative path");
	}
}

export function validateRunRootBoundary(runRoot: string): string[] {
	try {
		assertRunRoot(runRoot);
		return [];
	} catch (error) {
		return [error instanceof Error ? error.message : "Run root validation failed"];
	}
}

export function resolveRunRelative(runRoot: string, runRelativePath: string): string {
	assertRelativePath(runRelativePath);
	const root = resolve(runRoot);
	const target = resolve(root, runRelativePath);
	if (!isContained(root, target)) throw new Error("artifact path escapes Run root");
	assertLinkFreeExistingSegments(root, target);
	return target;
}

export function writeOnceBytes(runRoot: string, runRelativePath: string, value: string | Uint8Array): string {
	const target = resolveRunRelative(runRoot, runRelativePath);
	mkdirSync(dirname(target), { recursive: true });
	assertLinkFreeExistingSegments(runRoot, target);
	const handle = openSync(target, "wx");
	try {
		writeFileSync(handle, value);
	} finally {
		closeSync(handle);
	}
	assertLinkFreeExistingSegments(runRoot, target);
	return target;
}

export function writeOnceJson(runRoot: string, runRelativePath: string, value: unknown): ArtifactRefV0B {
	const target = writeOnceBytes(runRoot, runRelativePath, `${stableJson(value)}\n`);
	return artifactRef(runRoot, target, "application/json", false);
}

export function isArtifactRefV0B(value: unknown): value is ArtifactRefV0B {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.path === "string" &&
		/^[a-f0-9]{64}$/.test(String(candidate.sha256)) &&
		Number.isSafeInteger(candidate.size_bytes) &&
		(candidate.size_bytes as number) >= 0 &&
		typeof candidate.media_type === "string" &&
		candidate.media_type.length > 0 &&
		typeof candidate.truncated === "boolean"
	);
}

export function artifactRef(
	runRoot: string,
	absoluteOrRelativePath: string,
	mediaType: string,
	truncated: boolean,
): ArtifactRefV0B {
	const root = resolve(runRoot);
	const lexicalTarget = isAbsolute(absoluteOrRelativePath)
		? resolve(absoluteOrRelativePath)
		: resolveRunRelative(root, absoluteOrRelativePath);
	if (!isContained(root, lexicalTarget)) throw new Error("artifact is outside Run root");
	const rel = portable(relative(root, lexicalTarget));
	const target = resolveRunRelative(root, rel);
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("artifact must be an ordinary file");
	return {
		path: rel,
		sha256: fileSha256(target),
		size_bytes: stats.size,
		media_type: mediaType,
		truncated,
	};
}

export function validateArtifactRef(runRoot: string, ref: unknown): string[] {
	if (!isArtifactRefV0B(ref)) return ["declared ArtifactRef has an invalid envelope"];
	try {
		const target = resolveRunRelative(runRoot, ref.path);
		if (!existsSync(target)) return ["artifact is missing"];
		const stats = lstatSync(target);
		if (!stats.isFile() || stats.isSymbolicLink()) return ["artifact is not an ordinary file"];
		const errors: string[] = [];
		if (stats.size !== ref.size_bytes) errors.push("artifact size mismatch");
		if (fileSha256(target) !== ref.sha256) errors.push("artifact digest mismatch");
		return errors;
	} catch (error) {
		return [error instanceof Error ? error.message : "artifact validation failed"];
	}
}

export function readJsonArtifact<T>(runRoot: string, runRelativePath: string): T {
	const path = resolveRunRelative(runRoot, runRelativePath);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error("JSON artifact is not an ordinary file");
	return JSON.parse(readFileSync(path, "utf8")) as T;
}
