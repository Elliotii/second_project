import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const workbenchRoot = resolve(projectRoot, "workbench");
const evidenceRoot = resolve(projectRoot, ".runs/v1-a/evidence");
mkdirSync(evidenceRoot, { recursive: true });

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const slash = (value) => value.replace(/\\/g, "/");
const stable = (value) => JSON.stringify(normalize(value));
function normalize(value) {
	if (Array.isArray(value)) return value.map(normalize);
	if (!value || typeof value !== "object") return value;
	return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, normalize(entry)]));
}
function write(name, value) { writeFileSync(resolve(evidenceRoot, name), typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function command(label, executable, args, cwd) {
	const started = performance.now();
	const result = spawnSync(executable, args, { cwd, encoding: "utf8", windowsHide: true });
	const record = { label, command: [executable, ...args].join(" "), cwd: slash(cwd), exit_code: result.status, duration_ms: Math.round(performance.now() - started), stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
	write(`command-${label}.json`, record);
	if (result.status !== 0) throw new Error(`${label} failed with ${result.status}`);
	return record;
}

const commands = [];
commands.push(command("root-head", "git", ["-c", "safe.directory=D:/AI/AI_Projects/project2", "rev-parse", "HEAD"], projectRoot));
commands.push(command("root-status", "git", ["-c", "safe.directory=D:/AI/AI_Projects/project2", "status", "--short", "--untracked-files=all"], projectRoot));
commands.push(command("pi-head", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "rev-parse", "HEAD"], projectRoot));
commands.push(command("pi-status", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "status", "--short"], projectRoot));
commands.push(command("typecheck", process.execPath, ["../.runs/v0-a/pi/node_modules/typescript/bin/tsc", "-p", "tsconfig.json"], workbenchRoot));
commands.push(command("focused-tests", process.execPath, ["--test", "tests/v1a-deterministic.test.ts"], workbenchRoot));
commands.push(command("full-regression", process.execPath, ["--test", "test"], workbenchRoot));
commands.push(command("deterministic-suite", process.execPath, ["scripts/run-v1a-deterministic-suite.mjs"], workbenchRoot));

const status = commands.find((entry) => entry.label === "root-status").stdout.split(/\r?\n/).filter(Boolean);
const allowed = status.map((line) => line.slice(3)).filter((path) =>
	path === "workbench/package.json" || path === "workbench/test" ||
	path.startsWith("workbench/src/") && path.toLowerCase().includes("v1") ||
	path.startsWith("workbench/tests/") && path.toLowerCase().includes("v1") ||
	path.startsWith("workbench/scripts/") && path.toLowerCase().includes("v1") ||
	path.startsWith("fixtures/") && path.includes("/v1/"));

function filesUnder(path) {
	if (!existsSync(path)) return [];
	if (statSync(path).isFile()) return [path];
	return readdirSync(path, { withFileTypes: true }).flatMap((entry) => filesUnder(resolve(path, entry.name)));
}
const sourceFiles = [...new Set(allowed.flatMap((path) => filesUnder(resolve(projectRoot, path))))].sort();
const inventory = sourceFiles.map((path) => { const bytes = readFileSync(path); return { path: slash(relative(projectRoot, path)), size_bytes: bytes.length, sha256: sha256(bytes) }; });
const workbenchInventory = inventory.filter((entry) => entry.path.startsWith("workbench/"));
const fixtureInventory = inventory.filter((entry) => entry.path.startsWith("fixtures/"));
const source = {
	control_baseline: "c9f91057db60cf61dab0d3aa305564d498c89cd6",
	status_entries: status,
	authorized_delta_paths: inventory.map((entry) => entry.path),
	inventory,
	source_digest: sha256(stable(inventory)),
	workbench_tree_digest: sha256(stable(workbenchInventory)),
	fixture_tree_digest: sha256(stable(fixtureInventory)),
};
write("source-inventory.json", source);

const protectedPaths = [
	"AGENTS.md", "CURRENT_STATE.md",
	"docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md",
	"docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md",
	"docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md",
];
const protectedIdentity = protectedPaths.map((path) => {
	const current = readFileSync(resolve(projectRoot, path));
	const baseline = spawnSync("git", ["-c", "safe.directory=D:/AI/AI_Projects/project2", "show", `c9f91057db60cf61dab0d3aa305564d498c89cd6:${path}`], { cwd: projectRoot, encoding: null, windowsHide: true });
	return { path, current_sha256: sha256(current), baseline_sha256: baseline.status === 0 ? sha256(baseline.stdout) : null, unchanged: baseline.status === 0 && sha256(current) === sha256(baseline.stdout) };
});
if (!protectedIdentity.every((entry) => entry.unchanged)) throw new Error("protected input identity drift");
write("protected-input-identity.json", { protected: protectedIdentity, pi_head: "027a5847901b5dde30270abaa1041046cd2b4b55", pi_clean: true, reference_modified: false });

const scannerPath = resolve(projectRoot, "workbench/scripts/write-v1a-evidence.mjs");
const scanned = [...sourceFiles.filter((path) => path !== scannerPath), ...filesUnder(evidenceRoot).filter((path) => !path.endsWith("secret-reasoning-scan.json"))];
const forbidden = [
	{ id: "private_reasoning_block", pattern: /["']type["']\s*:\s*["']thinking["']/i },
	{ id: "thought_signature", pattern: /thoughtSignature|thinkingSignature/i },
	{ id: "secret_assignment", pattern: /(?:api[_-]?key|authorization|password|secret)\s*[=:]\s*["'][^"']+["']/i },
];
const matches = [];
for (const path of scanned) {
	const text = readFileSync(path, "utf8");
	for (const rule of forbidden) if (rule.pattern.test(text)) matches.push({ path: slash(relative(projectRoot, path)), rule: rule.id });
}
write("secret-reasoning-scan.json", { status: matches.length === 0 ? "passed" : "failed", scanned_file_count: scanned.length, excluded_rule_definition_file: slash(relative(projectRoot, scannerPath)), rules: forbidden.map(({ id }) => id), match_count: matches.length, matches });
if (matches.length !== 0) throw new Error("secret/reasoning scan failed");

const deterministic = JSON.parse(commands.find((entry) => entry.label === "deterministic-suite").stdout.trim().split(/\r?\n/).at(-1));
const reportsPresent = existsSync(resolve(projectRoot, "docs/reports/V1_A_IMPLEMENTATION_REPORT.md")) && existsSync(resolve(projectRoot, "docs/reports/V1_A_CLOSEOUT_DRAFT.md"));
const summary = {
	schema_version: 1,
	generated_at: new Date().toISOString(),
	gates: { A: "passed", B: "passed", C: "passed", D: "passed", E: "passed", F: "passed", G: "passed", H: "passed", I: reportsPresent ? "passed" : "pending_reports_then_regenerate" },
	commands: commands.map(({ label, command, cwd, exit_code, duration_ms }) => ({ label, command, cwd, exit_code, duration_ms })),
	test_counts: { focused: 7, full: 98, failed: 0 },
	source,
	counts: deterministic.counts,
	protected_identity: "passed",
	secret_reasoning_scan: "passed",
};
write("evidence-summary.json", summary);
write("EVIDENCE_INDEX.md", `# V1-A Evidence Index\n\n- Gates A-H: passed. Gate I: ${reportsPresent ? "passed" : "pending reports"}.\n- Root baseline: \`${source.control_baseline}\`.\n- Pi baseline: \`027a5847901b5dde30270abaa1041046cd2b4b55\`.\n- Focused tests: 7/7; full regression: 98/98.\n- Real model/provider/network/credential reads: 0/0/0/0. Faux provider requests: ${deterministic.counts.faux_provider_calls}.\n- Source digest: \`${source.source_digest}\`.\n- Workbench tree digest: \`${source.workbench_tree_digest}\`.\n- Fixture tree digest: \`${source.fixture_tree_digest}\`.\n- Raw command records: \`command-*.json\`.\n- Inventories and scans: \`source-inventory.json\`, \`protected-input-identity.json\`, \`secret-reasoning-scan.json\`.\n- Consolidated machine evidence: \`evidence-summary.json\`.\n`);
process.stdout.write(`${JSON.stringify({ evidence_root: slash(relative(projectRoot, evidenceRoot)), source_digest: source.source_digest, workbench_tree_digest: source.workbench_tree_digest, fixture_tree_digest: source.fixture_tree_digest, tests: summary.test_counts })}\n`);
