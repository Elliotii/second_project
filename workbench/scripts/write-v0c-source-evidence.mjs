import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const baseline = "47d36f25563012e1d411576eca387a778ba6a3e7";
const outputRoot = resolve(projectRoot, ".runs/v0-c/evidence");
const sourcePrefixes = [
	"workbench/",
	"fixtures/manifests/v0-c-",
	"fixtures/verifiers/v0-c-",
	"fixtures/tasks/v0-c-",
];

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}

function git(args) {
	return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8" });
}

const status = git(["status", "--porcelain=v1", "--untracked-files=all"])
	.split(/\r?\n/)
	.filter(Boolean)
	.map((line) => ({ status: line.slice(0, 2), path: line.slice(3).replaceAll("\\", "/") }))
	.filter((entry) => sourcePrefixes.some((prefix) => entry.path.startsWith(prefix)));

const items = status.map((entry) => {
	const absolute = resolve(projectRoot, entry.path);
	const bytes = readFileSync(absolute);
	let baselineSha256 = null;
	try {
		baselineSha256 = sha256(execFileSync("git", ["show", `${baseline}:${entry.path}`], {
			cwd: projectRoot,
			stdio: ["ignore", "pipe", "ignore"],
		}));
	} catch {
		baselineSha256 = null;
	}
	return {
		path: entry.path,
		git_status: entry.status,
		size_bytes: statSync(absolute).size,
		sha256: sha256(bytes),
		baseline_sha256: baselineSha256,
	};
}).sort((left, right) => left.path.localeCompare(right.path));

const inventory = {
	schema_version: 1,
	control_baseline_commit: baseline,
	scope: sourcePrefixes,
	item_count: items.length,
	items: items.map(({ path, size_bytes, sha256: digest }) => ({ path, size_bytes, sha256: digest })),
};
const delta = {
	schema_version: 1,
	control_baseline_commit: baseline,
	candidate_kind: "uncommitted_stage_1_working_tree",
	item_count: items.length,
	items,
};
mkdirSync(outputRoot, { recursive: true });
for (const [name, value] of [["source-inventory.json", inventory], ["source-delta.json", delta]]) {
	const path = resolve(outputRoot, name);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { flag: "w" });
}
process.stdout.write(`${JSON.stringify({ source_inventory_items: items.length, output_root: ".runs/v0-c/evidence" })}\n`);
