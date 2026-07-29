import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { canonical, sha256 } from "./runtime-utils.ts";

const SELECTED_SOURCE_PATHS = [
	"driver.ts",
	"tools.ts",
	"verifier.ts",
	"journal.ts",
	"observer.ts",
	"attribution.ts",
	"provenance.ts",
	"gates.test.ts",
	"acceptance/acceptance.test.ts",
	"fixtures/parse-duration/task.md",
	"fixtures/parse-duration/package.json",
	"fixtures/parse-duration/src/parse-duration.ts",
	"fixtures/parse-duration/test/public.test.ts",
] as const;

export type SourceIdentity = {
	root: string;
	fileCount: number;
	treeDigest: string;
	inventory: Array<{ path: string; size: number; sha256: string }>;
	selected: Record<string, string>;
};

export type ProjectGitIdentity = {
	head: string;
	trackedWorktreeCleanExceptReference: boolean;
	unexpectedStatus: string[];
	trackedG006Files: string[];
	sourceInventoryMatchesTrackedFiles: boolean;
};

function listSourceFiles(root: string, current = root): string[] {
	return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
		if (current === root && entry.name === "node_modules") return [];
		const path = resolve(current, entry.name);
		if (entry.isDirectory()) return listSourceFiles(root, path);
		if (!entry.isFile()) throw new Error(`unsupported G006 source entry: ${path}`);
		return [relative(root, path).replaceAll("\\", "/")];
	});
}

export function createSourceIdentity(sourceRoot: string): SourceIdentity {
	const inventory = listSourceFiles(sourceRoot)
		.sort()
		.map((path) => {
			const bytes = readFileSync(resolve(sourceRoot, path));
			return { path, size: bytes.length, sha256: sha256(bytes) };
		});
	const selected = Object.fromEntries(
		SELECTED_SOURCE_PATHS.map((relativePath) => {
			const path = resolve(sourceRoot, relativePath);
			if (!existsSync(path)) throw new Error(`required G006 source file missing: ${relativePath}`);
			return [relativePath, sha256(readFileSync(path))];
		}),
	);
	return {
		root: sourceRoot,
		fileCount: inventory.length,
		treeDigest: sha256(canonical(inventory)),
		inventory,
		selected,
	};
}

export function sourceIdentityMatches(left: SourceIdentity, right: SourceIdentity): boolean {
	return left.treeDigest === right.treeDigest && canonical(left.inventory) === canonical(right.inventory);
}

function runGit(projectRoot: string, args: string[]): string {
	return execFileSync(
		"git",
		["-c", `safe.directory=${projectRoot.replaceAll("\\", "/")}`, "-C", projectRoot, ...args],
		{ encoding: "utf8", windowsHide: true },
	).trim();
}

export function readProjectGitIdentity(projectRoot: string, sourceIdentity: SourceIdentity): ProjectGitIdentity {
	const status = runGit(projectRoot, ["status", "--porcelain=v1", "--untracked-files=all"])
		.split(/\r?\n/)
		.filter((line) => line.length > 0);
	const unexpectedStatus = status.filter((line) => {
		const path = line.slice(3).replaceAll("\\", "/");
		return path !== "reference" && !path.startsWith("reference/");
	});
	const trackedG006Files = runGit(projectRoot, ["ls-files", "--", "spikes/pi-runtime/g006"])
		.split(/\r?\n/)
		.filter((line) => line.length > 0)
		.map((path) => path.replaceAll("\\", "/"))
		.sort();
	const expectedTrackedFiles = sourceIdentity.inventory
		.map((entry) => `spikes/pi-runtime/g006/${entry.path}`)
		.sort();
	return {
		head: runGit(projectRoot, ["rev-parse", "HEAD"]),
		trackedWorktreeCleanExceptReference: unexpectedStatus.length === 0,
		unexpectedStatus,
		trackedG006Files,
		sourceInventoryMatchesTrackedFiles: canonical(trackedG006Files) === canonical(expectedTrackedFiles),
	};
}
