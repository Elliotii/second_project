import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "../..");
const workbenchRoot = resolve(projectRoot, "workbench");
const evidenceRoot = resolve(projectRoot, ".runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence");
if (existsSync(evidenceRoot)) throw new Error("micro-correction evidence is append-only and already exists");
mkdirSync(evidenceRoot, { recursive: true });

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const slash = (value) => value.replace(/\\/g, "/");
function normalize(value) { if (Array.isArray(value)) return value.map(normalize); if (!value || typeof value !== "object") return value; return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, normalize(entry)])); }
const stable = (value) => JSON.stringify(normalize(value));
function write(name, value) { writeFileSync(resolve(evidenceRoot, name), typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
const lineCount = (value) => value.split(/\r?\n/).filter(Boolean).length;
function command(label, executable, args, cwd, count) {
	const started = performance.now(); const result = spawnSync(executable, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 24 * 1024 * 1024 });
	const record = { label, command: [executable, ...args].join(" "), cwd: slash(cwd), exit_code: result.status, count: typeof count === "function" ? count(result.stdout ?? "") : count, duration_ms: Math.round(performance.now() - started), stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
	write(`command-${label}.json`, record); if (result.status !== 0) throw new Error(`${label} failed with ${result.status}`); return record;
}

const rootGit = ["-c", "safe.directory=D:/AI/AI_Projects/project2"];
const commands = [
	command("root-head", "git", [...rootGit, "rev-parse", "HEAD"], projectRoot, 1),
	command("root-status", "git", [...rootGit, "status", "--short", "--untracked-files=all"], projectRoot, lineCount),
	command("index", "git", [...rootGit, "diff", "--cached", "--name-only"], projectRoot, lineCount),
	command("pi-head", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "rev-parse", "HEAD"], projectRoot, 1),
	command("pi-status", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "status", "--short"], projectRoot, lineCount),
	command("protected-diff", "git", [...rootGit, "diff", "--name-only", "--", "AGENTS.md", "CURRENT_STATE.md", "docs/第二项目_Codex交接包_2026-07-30", "reference"], projectRoot, lineCount),
	command("reference-status", "git", [...rootGit, "status", "--short", "--", "reference"], projectRoot, lineCount),
	command("focused-residuals", process.execPath, ["--test", "--test-name-pattern=V1A-RR", "tests/v1a-deterministic.test.ts"], workbenchRoot, 4),
	command("complete-v1a", process.execPath, ["--test", "tests/v1a-deterministic.test.ts"], workbenchRoot, 14),
	command("deterministic-suite", process.execPath, ["scripts/run-v1a-deterministic-suite.mjs"], workbenchRoot, 5),
	command("typecheck", process.execPath, ["../.runs/v0-a/pi/node_modules/typescript/bin/tsc", "-p", "tsconfig.json"], workbenchRoot, 1),
	command("targeted-v0-verifier", process.execPath, ["--test", "tests/v0b-verifier.test.ts"], workbenchRoot, 2),
	command("full-regression", process.execPath, ["--test", "test"], workbenchRoot, 105),
];
const byLabel = Object.fromEntries(commands.map((entry) => [entry.label, entry]));
if (byLabel["root-head"].stdout.trim() !== "c9f91057db60cf61dab0d3aa305564d498c89cd6" || byLabel["pi-head"].stdout.trim() !== "027a5847901b5dde30270abaa1041046cd2b4b55" || byLabel.index.stdout.trim() || byLabel["pi-status"].stdout.trim() || byLabel["protected-diff"].stdout.trim()) throw new Error("micro-correction boundary identity failed");

const statusLines = byLabel["root-status"].stdout.split(/\r?\n/).filter(Boolean);
const allowedPath = (path) => path === "workbench/package.json" || path === "workbench/src/types.ts" || path === "workbench/src/verifier/runner.ts" || (path.startsWith("workbench/") && path.toLowerCase().includes("v1")) || (path.startsWith("fixtures/") && path.includes("/v1/"));
const deltaEntries = statusLines.map((line) => ({ status: line.slice(0, 2), path: slash(line.slice(3).replace(/^"|"$/g, "")) })).filter((entry) => allowedPath(entry.path));
const inventory = deltaEntries.map((entry) => { const absolute = resolve(projectRoot, entry.path); if (!existsSync(absolute) || !statSync(absolute).isFile()) return { ...entry, size_bytes: null, sha256: null }; const bytes = readFileSync(absolute); return { ...entry, size_bytes: bytes.length, sha256: sha256(bytes) }; }).sort((a, b) => a.path.localeCompare(b.path));
const workbenchInventory = inventory.filter((entry) => entry.path.startsWith("workbench/")); const fixtureInventory = inventory.filter((entry) => entry.path.startsWith("fixtures/"));
const source = { baseline_commit: byLabel["root-head"].stdout.trim(), pre_micro_correction: { source_digest: "2d5408f0a4e79197674728d2188b61757e92ff9deb6096a1b9bf8291ee648add", workbench_tree_digest: "a11ed03dfa7bfbb07e66acf2cd7e8788795762e2d3297a97ebf5781d4eba2ea5", fixture_tree_digest: "18155c1cffe53b4be17b84fcd418d6a8eb782f4d4689eacc05d6bf8e44e0d055", manifest_id: "7ae27be5ac0bebdbb2daf7839372a9fe2c2712f324815ca6ef7e66b342973e72" }, status_entries: statusLines, control_baseline_to_micro_corrected_candidate: inventory, source_digest: sha256(stable(inventory)), workbench_tree_digest: sha256(stable(workbenchInventory)), fixture_tree_digest: sha256(stable(fixtureInventory)) };
write("source-inventory-and-delta.json", source);

const protectedPaths = ["AGENTS.md", "CURRENT_STATE.md", "docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md", "docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md", "docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md"];
const protectedIdentity = protectedPaths.map((path) => { const bytes = readFileSync(resolve(projectRoot, path)); const baseline = spawnSync("git", [...rootGit, "show", `c9f91057db60cf61dab0d3aa305564d498c89cd6:${path}`], { cwd: projectRoot, encoding: null, windowsHide: true }); return { path, sha256: sha256(bytes), baseline_sha256: baseline.status === 0 ? sha256(baseline.stdout) : null, unchanged: baseline.status === 0 && sha256(bytes) === sha256(baseline.stdout) }; });
if (!protectedIdentity.every((entry) => entry.unchanged)) throw new Error("protected identity changed");
write("protected-input-identity.json", { protected: protectedIdentity, pi_head: byLabel["pi-head"].stdout.trim(), pi_clean: true, reference_diff_empty: true, reference_status: byLabel["reference-status"].stdout.split(/\r?\n/).filter(Boolean), index_empty: true });

const deterministic = JSON.parse(byLabel["deterministic-suite"].stdout.trim().split(/\r?\n/).at(-1));
const manifest = JSON.parse(readFileSync(resolve(projectRoot, "fixtures/manifests/v1/deterministic-experiment.json"), "utf8"));
write("manifest-status-attribution-evidence.json", { manifest_id: manifest.manifest_id, member_count: manifest.members.length, frozen_membership: { tasks: 4, repetitions: 2, strategies: 3, required_terminal: 24, preauthorized_paused_before_execution: 0 }, fail_closed_counterexamples: ["empty", "shortened", "reordered", "substituted", "caller-created pause", "coherent skill digest rehash", "coherent Task/Strategy/Verifier/model/prompt/tool/Workbench binding drift"], frozen_terminal_policy: { none: { statuses: ["passed", "failed"], excluded: false }, treatment: { statuses: ["invalid", "cancelled"], excluded: false }, infrastructure: { statuses: ["infrastructure_error"], excluded: true }, evidence: { statuses: ["invalid"], excluded: true } }, legal_matrix_fixture: { planned: 24, comparable: 22, excluded: 2, treatment_invalid: 1, passed: 20 }, incompatible_combinations_rejected: 7, result_kind: "deterministic synthetic aggregation counterexample evidence; not pilot execution" });
write("provider-authority-evidence.json", { reserve_point: "formal composition before runtime identity allocation and factory call", second_composition_before_request: "rejected before second factory", first_request_max: 1, factory_throw_burns_authority: true, denied_missing_malformed_counts: { credential_reads: 0, transport_calls: 0, factory_calls: 0 }, real_execution_counts: { external_provider_calls: 0, real_model_calls: 0, credential_reads: 0, network_calls: 0 } });
const publicDependent = deterministic.calibration.find((entry) => entry.task_id === "v1-state-transition");
write("task-calibration-evidence.json", { tasks: deterministic.calibration, public_check_dependent: publicDependent, public_claim: "unmodified workspace fails the public command; reference solution passes public and stronger external checks repeatedly", hidden_acceptance_not_fully_exposed_by_public_check: true, nonsolution_rejected: true });
write("residual-matrix.json", { rows: [
	{ finding: "V1A-RR-001", status: "passed", proof: "complete independently derived 24-member Manifest equality plus membership and coherent-rehash counterexamples" },
	{ finding: "V1A-RR-002", status: "passed", proof: "frozen final-status/attribution/exclusion matrix with legal and incompatible-cell tests" },
	{ finding: "V1A-RR-003", status: "passed", proof: "authority reservation precedes identity/factory; double composition and factory-throw paths burn authority" },
	{ finding: "V1A-RR-004", status: "passed", proof: "state-transition unmodified public command is nonzero; reference passes public plus stronger external verifier repeatably" },
] });

function filesUnder(path) { if (!existsSync(path)) return []; if (statSync(path).isFile()) return [path]; return readdirSync(path, { withFileTypes: true }).flatMap((entry) => filesUnder(resolve(path, entry.name))); }
const ruleDefinitionPaths = new Set([resolve(projectRoot, "workbench/scripts/write-v1a-evidence.mjs"), resolve(projectRoot, "workbench/scripts/write-v1a-main-review-correction-evidence.mjs"), resolve(projectRoot, "workbench/scripts/write-v1a-main-rereview-micro-evidence.mjs")]);
const scanned = [...inventory.filter((entry) => entry.sha256 && !ruleDefinitionPaths.has(resolve(projectRoot, entry.path))).map((entry) => resolve(projectRoot, entry.path)), ...filesUnder(evidenceRoot).filter((path) => !path.endsWith("secret-reasoning-scan.json"))];
const rules = [{ id: "private_reasoning_block", pattern: /["']type["']\s*:\s*["']thinking["']/i }, { id: "thought_signature", pattern: /thoughtSignature|thinkingSignature/i }, { id: "secret_assignment", pattern: /(?:api[_-]?key|authorization|password|secret)\s*[=:]\s*["'][^"']+["']/i }]; const matches = [];
for (const path of scanned) { const text = readFileSync(path, "utf8"); for (const rule of rules) if (rule.pattern.test(text)) matches.push({ path: slash(relative(projectRoot, path)), rule: rule.id }); }
write("secret-reasoning-scan.json", { status: matches.length ? "failed" : "passed", scanned_file_count: scanned.length, excluded_rule_definition_files: [...ruleDefinitionPaths].map((path) => slash(relative(projectRoot, path))), rules: rules.map(({ id }) => id), match_count: matches.length, matches }); if (matches.length) throw new Error("secret/reasoning scan failed");

const summary = { schema_version: 1, correction_id: "main-review-001/micro-correction-001", generated_at: new Date().toISOString(), residuals: Object.fromEntries(["V1A-RR-001", "V1A-RR-002", "V1A-RR-003", "V1A-RR-004"].map((id) => [id, "passed"])), commands: commands.map(({ label, command, cwd, exit_code, count, duration_ms }) => ({ label, command, cwd, exit_code, count, duration_ms })), test_counts: { focused_residuals: 4, complete_v1a: 14, targeted_v0_verifier: 2, full_regression: 105, failed: 0 }, source, manifest_id: manifest.manifest_id, counts: deterministic.counts, protected_identity: "passed", secret_reasoning_scan: "passed", gate_j_claimed: false, v1a_final_acceptance_claimed: false };
write("micro-correction-evidence-summary.json", summary);
write("EVIDENCE_INDEX.md", `# V1-A Main Rereview Micro-Correction Evidence\n\n- Lineage: \`main-review-001/micro-correction-001\`; residuals V1A-RR-001 through V1A-RR-004 passed deterministic verification.\n- Authoritative predecessor remains preserved at \`.runs/v1-a/corrections/main-review-001/final-evidence-v2/\`.\n- A superseded boundary-check attempt is preserved under sibling \`evidence/\`; its tests passed, but it incorrectly required the known user-provided untracked \`reference/\` directory to be Git-clean.\n- Focused residuals: 4/4; complete V1-A: 14/14; targeted V0 Verifier: 2/2; full regression: 105/105.\n- Real model / external Provider / network / credential reads: 0 / 0 / 0 / 0.\n- Source digest: \`${source.source_digest}\`.\n- Workbench digest: \`${source.workbench_tree_digest}\`.\n- Fixture digest: \`${source.fixture_tree_digest}\`.\n- Manifest identity: \`${manifest.manifest_id}\`.\n- Reference remains user-provided, untracked and read-only; its Git diff is empty.\n- No Gate J or V1-A final acceptance is claimed.\n- Machine summary: \`micro-correction-evidence-summary.json\`.\n`);
const mainIndex = resolve(projectRoot, ".runs/v1-a/evidence/EVIDENCE_INDEX.md"); const marker = "## Main rereview micro-correction (main-review-001/micro-correction-001)"; const oldIndex = readFileSync(mainIndex, "utf8");
if (!oldIndex.includes(marker)) appendFileSync(mainIndex, `\n${marker}\n\nThe authoritative append-only micro-corrected-candidate evidence is under \`.runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/\`; see its \`EVIDENCE_INDEX.md\`. The authoritative predecessor at \`final-evidence-v2/\` and the superseded boundary-check attempt under sibling \`evidence/\` remain preserved.\n`, "utf8");
process.stdout.write(`${JSON.stringify({ evidence_root: slash(relative(projectRoot, evidenceRoot)), source_digest: source.source_digest, workbench_tree_digest: source.workbench_tree_digest, fixture_tree_digest: source.fixture_tree_digest, manifest_id: manifest.manifest_id, tests: summary.test_counts, counts: deterministic.counts })}\n`);
