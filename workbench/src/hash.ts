import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export interface FileIdentity {
	path: string;
	bytes: number;
	sha256: string;
}

export function sha256(value: string | Uint8Array): string {
	return createHash("sha256").update(value).digest("hex");
}

export function fileSha256(path: string): string {
	return sha256(readFileSync(path));
}

function normalizeJson(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(normalizeJson);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>)
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([key, entry]) => [key, normalizeJson(entry)]),
	);
}

export function stableJson(value: unknown): string {
	return JSON.stringify(normalizeJson(value));
}

export function digestObject(value: unknown): string {
	return sha256(stableJson(value));
}

export function treeInventory(root: string, excludedRelativePaths: ReadonlySet<string> = new Set()): FileIdentity[] {
	const canonicalRoot = resolve(root);
	const rootStats = lstatSync(canonicalRoot);
	if (rootStats.isSymbolicLink()) throw new Error(`tree root is a symlink or junction: ${canonicalRoot}`);
	if (!rootStats.isDirectory()) throw new Error(`tree root is not a directory: ${canonicalRoot}`);
	const files: FileIdentity[] = [];
	const visit = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const absolute = resolve(directory, entry.name);
			const relativePath = relative(canonicalRoot, absolute).split(sep).join("/");
			if (excludedRelativePaths.has(relativePath)) continue;
			const stats = lstatSync(absolute);
			if (stats.isSymbolicLink()) throw new Error(`tree contains symlink or junction: ${relativePath}`);
			if (stats.isDirectory()) {
				visit(absolute);
				continue;
			}
			if (!stats.isFile()) throw new Error(`tree contains unsupported file kind: ${relativePath}`);
			const bytes = readFileSync(absolute);
			files.push({ path: relativePath, bytes: bytes.length, sha256: sha256(bytes) });
		}
	};
	visit(canonicalRoot);
	return files;
}

export function treeDigest(root: string, excludedRelativePaths: ReadonlySet<string> = new Set()): string {
	return digestObject(treeInventory(root, excludedRelativePaths));
}
