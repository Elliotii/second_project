import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { treeDigest, treeInventory } from "../hash.ts";
import type { TaskSpecV0A, WorkspaceRefV0A } from "../types.ts";
import { WORKSPACE_DIGEST_EXCLUSIONS } from "../contracts/preflight.ts";

function copyTreeWithoutLinks(source: string, target: string): void {
	mkdirSync(target, { recursive: false });
	for (const entry of readdirSync(source, { withFileTypes: true })) {
		const sourcePath = join(source, entry.name);
		const targetPath = join(target, entry.name);
		const stats = lstatSync(sourcePath);
		if (stats.isSymbolicLink()) throw new Error(`source contains symlink or junction: ${sourcePath}`);
		if (stats.isDirectory()) {
			copyTreeWithoutLinks(sourcePath, targetPath);
		} else if (stats.isFile()) {
			copyFileSync(sourcePath, targetPath);
		} else {
			throw new Error(`source contains unsupported file kind: ${sourcePath}`);
		}
	}
}

export function createTemporaryWorkspace(options: {
	projectRoot: string;
	sourceRoot: string;
	targetRoot: string;
	workspaceId: string;
	task: TaskSpecV0A;
}): { ref: WorkspaceRefV0A; initialInventory: ReturnType<typeof treeInventory> } {
	const sourceRoot = resolve(options.sourceRoot);
	const targetRoot = resolve(options.targetRoot);
	if (existsSync(targetRoot)) throw new Error(`workspace target already exists: ${targetRoot}`);
	const sourceDigest = treeDigest(sourceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
	if (sourceDigest !== options.task.workspace_source_digest) throw new Error("source digest changed after preflight");
	copyTreeWithoutLinks(sourceRoot, targetRoot);
	const initialDigest = treeDigest(targetRoot, WORKSPACE_DIGEST_EXCLUSIONS);
	if (initialDigest !== sourceDigest) throw new Error("temporary-copy digest mismatch");
	const initialInventory = treeInventory(targetRoot);
	return {
		ref: {
			workspace_id: options.workspaceId,
			provider: "temporary_copy",
			root: relative(options.projectRoot, targetRoot).split(sep).join("/"),
			source_digest: sourceDigest,
			initial_tree_digest: initialDigest,
			final_tree_digest: null,
			writable_paths: [...options.task.writable_paths],
			protected_paths: [...options.task.protected_paths],
			file_count: initialInventory.length,
			hardlink_pairs: 0,
		},
		initialInventory,
	};
}
