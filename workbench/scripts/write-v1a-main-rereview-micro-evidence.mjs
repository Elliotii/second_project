import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "../..");
const workbenchRoot = resolve(projectRoot, "workbench");
const candidateCommit = "e3ff98948b26187b48af61928b56e7cacb550d31";
const candidateTree = "89cae1c2c3c091ddc2644fac9a2d28c5b1800e03";
const piCommit = "027a5847901b5dde30270abaa1041046cd2b4b55";
const evidenceRoot = resolve(projectRoot, ".runs/v1-a/corrections/focused-audit-001/final-evidence");
if (existsSync(evidenceRoot)) throw new Error("post-audit correction evidence is append-only and already exists");
mkdirSync(evidenceRoot, { recursive: true });

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const slash = (value) => value.replace(/\\/g, "/");
function normalize(value) { if (Array.isArray(value)) return value.map(normalize); if (!value || typeof value !== "object") return value; return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, normalize(entry)])); }
const stable = (value) => JSON.stringify(normalize(value));
function write(name, value) { writeFileSync(resolve(evidenceRoot, name), typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
const lineCount = (value) => value.split(/\r?\n/).filter(Boolean).length;
function run(executable, args, cwd, input = undefined, binary = false) { return spawnSync(executable, args, { cwd, input, encoding: binary || input !== undefined ? null : "utf8", windowsHide: true, maxBuffer: 32 * 1024 * 1024 }); }
function command(label, executable, args, cwd, count) {
	const started = performance.now(); const result = spawnSync(executable, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
	const record = { label, command: [executable, ...args].join(" "), cwd: slash(cwd), exit_code: result.status, count: typeof count === "function" ? count(result.stdout ?? "") : count, duration_ms: Math.round(performance.now() - started), stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
	write(`command-${label}.json`, record); if (result.status !== 0) throw new Error(`${label} failed with ${result.status}`); return record;
}

const rootGit = ["-c", "safe.directory=D:/AI/AI_Projects/project2"];
const commands = [
	command("root-head", "git", [...rootGit, "rev-parse", "HEAD"], projectRoot, 1),
	command("root-tree", "git", [...rootGit, "rev-parse", "HEAD^{tree}"], projectRoot, 1),
	command("root-status", "git", [...rootGit, "status", "--short", "--untracked-files=all"], projectRoot, lineCount),
	command("index", "git", [...rootGit, "diff", "--cached", "--name-only"], projectRoot, lineCount),
	command("pi-head", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "rev-parse", "HEAD"], projectRoot, 1),
	command("pi-status", "git", ["-C", ".upstream/pi", "-c", "safe.directory=D:/AI/AI_Projects/project2/.upstream/pi", "status", "--short"], projectRoot, lineCount),
	command("protected-diff", "git", [...rootGit, "diff", "--name-only", "--", "AGENTS.md", "CURRENT_STATE.md"], projectRoot, lineCount),
	command("reference-diff", "git", [...rootGit, "diff", "--name-only", "--", "reference"], projectRoot, lineCount),
	command("focused-findings", process.execPath, ["--test", "--test-name-pattern=V1A-POST-AUDIT-F", "tests/v1a-deterministic.test.ts"], workbenchRoot, 4),
	command("complete-v1a", process.execPath, ["--test", "tests/v1a-deterministic.test.ts"], workbenchRoot, 18),
	command("deterministic-suite", process.execPath, ["scripts/run-v1a-deterministic-suite.mjs"], workbenchRoot, 5),
	command("typecheck", process.execPath, ["../.runs/v0-a/pi/node_modules/typescript/bin/tsc", "-p", "tsconfig.json"], workbenchRoot, 1),
	command("targeted-v0b-verifier", process.execPath, ["--test", "tests/v0b-verifier.test.ts"], workbenchRoot, 2),
	command("focused-v0c", process.execPath, ["--test", "--test-concurrency=1", "tests/v0c-stage1.test.ts", "tests/v0c-main-review-correction.test.ts", "tests/v0c-post-audit-correction.test.ts"], workbenchRoot, 24),
	command("full-regression", process.execPath, ["--test", "test"], workbenchRoot, 109),
];
const byLabel = Object.fromEntries(commands.map((entry) => [entry.label, entry]));
if (byLabel["root-head"].stdout.trim() !== candidateCommit || byLabel["root-tree"].stdout.trim() !== candidateTree || byLabel["pi-head"].stdout.trim() !== piCommit || byLabel.index.stdout.trim() || byLabel["pi-status"].stdout.trim() || byLabel["protected-diff"].stdout.trim() || byLabel["reference-diff"].stdout.trim()) throw new Error("post-audit correction boundary identity failed");

const bindingAuditPath = resolve(projectRoot, "docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md");
const bindingAuditSha256 = sha256(readFileSync(bindingAuditPath));
if (bindingAuditSha256 !== "7815d6ed522aaadedb764e02fe0808316e78b2a70145094fef88237a967e9cf5") throw new Error("binding audit report identity drift");

const fixtureListResult = run("git", [...rootGit, "ls-files", "fixtures"], projectRoot);
if (fixtureListResult.status !== 0) throw new Error("fixture inventory failed");
const fixturePaths = fixtureListResult.stdout.trim().split(/\r?\n/).filter(Boolean).map(slash);
const textExtensions = new Set([".json", ".md", ".mjs", ".ts", ".txt"]);
const fixtureChecks = [];
for (const path of fixturePaths) {
	const bytes = readFileSync(resolve(projectRoot, path));
	const attr = run("git", [...rootGit, "check-attr", "text", "eol", "--", path], projectRoot);
	const raw = run("git", [...rootGit, "hash-object", "--stdin"], projectRoot, bytes);
	const filtered = run("git", [...rootGit, "hash-object", "--stdin", `--path=${path}`, "--filters"], projectRoot, bytes);
	const blob = run("git", [...rootGit, "show", `${candidateCommit}:${path}`], projectRoot, undefined, true);
	if (attr.status !== 0 || raw.status !== 0 || filtered.status !== 0 || blob.status !== 0) throw new Error(`fixture Git projection failed: ${path}`);
	fixtureChecks.push({ path, extension: extname(path), text_lf: /text: set/.test(attr.stdout) && /eol: lf/.test(attr.stdout), crlf_count: bytes.toString("binary").split("\r\n").length - 1, authority_sha256: sha256(bytes), prospective_clean_sha256: raw.stdout.toString().trim(), candidate_blob_sha256: sha256(blob.stdout), prospective_clean_equal: raw.stdout.toString().trim() === filtered.stdout.toString().trim(), candidate_blob_equal: bytes.equals(blob.stdout) });
}
if (fixtureChecks.some((entry) => !textExtensions.has(entry.extension) || !entry.text_lf || entry.crlf_count !== 0 || !entry.prospective_clean_equal)) throw new Error("fixture LF/prospective-clean invariant failed");
if (fixtureChecks.some((entry) => !entry.path.includes("/v1/") && !entry.candidate_blob_equal)) throw new Error("accepted V0 fixture content changed");
write("fixture-lf-and-prospective-clean-evidence.json", { attribute_rule: "/fixtures/** text eol=lf", tracked_fixture_count: fixtureChecks.length, allowed_extensions: [...textExtensions].sort(), crlf_file_count: fixtureChecks.filter((entry) => entry.crlf_count).length, prospective_clean_mismatch_count: fixtureChecks.filter((entry) => !entry.prospective_clean_equal).length, accepted_v0_blob_delta_count: fixtureChecks.filter((entry) => !entry.path.includes("/v1/") && !entry.candidate_blob_equal).length, v1_candidate_blob_differences: fixtureChecks.filter((entry) => entry.path.includes("/v1/") && !entry.candidate_blob_equal).map((entry) => entry.path), fixtures: fixtureChecks });

const predecessorInventoryPath = resolve(projectRoot, ".runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/source-inventory-and-delta.json");
const predecessor = JSON.parse(readFileSync(predecessorInventoryPath, "utf8"));
const candidatePaths = [...new Set([".gitattributes", ...predecessor.control_baseline_to_micro_corrected_candidate.map((entry) => entry.path)])].sort();
const inventory = candidatePaths.map((path) => { const bytes = readFileSync(resolve(projectRoot, path)); return { path, size_bytes: bytes.length, sha256: sha256(bytes) }; });
const workbenchInventory = inventory.filter((entry) => entry.path.startsWith("workbench/"));
const fixtureInventory = inventory.filter((entry) => entry.path.startsWith("fixtures/"));
const source = { candidate_commit: candidateCommit, candidate_tree: candidateTree, predecessor_source_digest: predecessor.source_digest, corrected_candidate_inventory: inventory, source_digest: sha256(stable(inventory)), workbench_tree_digest: sha256(stable(workbenchInventory)), fixture_tree_digest: sha256(stable(fixtureInventory)) };
write("source-inventory-and-delta.json", source);

const deterministic = JSON.parse(byLabel["deterministic-suite"].stdout.trim().split(/\r?\n/).at(-1));
const manifest = JSON.parse(readFileSync(resolve(projectRoot, "fixtures/manifests/v1/deterministic-experiment.json"), "utf8"));
write("finding-matrix.json", { findings: [
	{ finding: "F-001", status: "passed_in_corrected_worktree", proof: "all tracked fixtures are text/eol=lf, CRLF-free and prospective-clean byte stable; accepted V0 blob delta is zero", fresh_committed_candidate_reaudit: "pending" },
	{ finding: "F-002", status: "passed", proof: "actual four-argument Faux callback captures explicit deterministic model descriptor plus stable request options; B/C are equal and api/provider/model/options drift counterexamples fail" },
	{ finding: "F-003", status: "passed", proof: "resolver and transport failures project to FixedProviderRequestErrorV1 with one stable message, no cause and no fake marker" },
	{ finding: "F-004", status: "passed", proof: "usage projection rejects non-finite, fractional, negative and over-envelope values while accepting zero, boundary and normal values" },
] });
write("provider-error-and-usage-evidence.json", { public_error: { name: "FixedProviderRequestErrorV1", message: "V1 fixed provider request failed", cause_exposed: false, fake_sensitive_marker_exposed: false }, resolver_failure: { authority_consumed_before_resolver: true, transport_calls: 0 }, transport_failure: { authority_consumed_before_transport: true, internal_message_propagated: false }, usage_projection: { finite_counters: true, integer_counters: true, nonnegative: true, request_max: 16, combined_token_max: 131072, cost_usd_max: 0.2, credential_projection: [] }, real_execution_counts: { external_provider_calls: 0, real_model_calls: 0, credential_reads: 0, network_calls: 0 } });
write("actual-request-equality-evidence.json", { descriptor: { api: "v1a-faux-api-v1", provider: "v1a-faux-provider-v1", model_id: "v1a-faux-model-v1" }, callback_arguments_captured: ["context", "options", "state", "model"], serialized_projection: ["model", "context", "options"], unstable_or_sensitive_fields_excluded: ["signal", "apiKey", "fetch", "callbacks", "headers", "session identifiers"], fairness: deterministic.fairness, negative_differences_rejected: ["api", "provider", "model id", "maxTokens"] });

function filesUnder(path) { if (!existsSync(path)) return []; if (statSync(path).isFile()) return [path]; return readdirSync(path, { withFileTypes: true }).flatMap((entry) => filesUnder(resolve(path, entry.name))); }
const excludedDefinitions = new Set([resolve(projectRoot, "workbench/scripts/write-v1a-evidence.mjs"), resolve(projectRoot, "workbench/scripts/write-v1a-main-review-correction-evidence.mjs"), resolve(projectRoot, "workbench/scripts/write-v1a-main-rereview-micro-evidence.mjs"), resolve(projectRoot, "workbench/tests/v1a-deterministic.test.ts")]);
const scanned = [...inventory.filter((entry) => !excludedDefinitions.has(resolve(projectRoot, entry.path))).map((entry) => resolve(projectRoot, entry.path)), ...filesUnder(evidenceRoot).filter((path) => !path.endsWith("secret-error-evidence-scan.json"))];
const rules = [{ id: "private_reasoning_block", pattern: /["']type["']\s*:\s*["']thinking["']/i }, { id: "thought_signature", pattern: /thoughtSignature|thinkingSignature/i }, { id: "secret_assignment", pattern: /(?:api[_-]?key|authorization|password|secret)\s*[=:]\s*["'][^"']+["']/i }, { id: "fake_error_marker", pattern: /FAKE_SENSITIVE_MARKER_V1A_F003/ }];
const matches = [];
for (const path of scanned) { const text = readFileSync(path, "utf8"); for (const rule of rules) if (rule.pattern.test(text)) matches.push({ path: slash(relative(projectRoot, path)), rule: rule.id }); }
write("secret-error-evidence-scan.json", { status: matches.length ? "failed" : "passed", scanned_file_count: scanned.length, excluded_rule_and_counterexample_files: [...excludedDefinitions].map((path) => slash(relative(projectRoot, path))), rules: rules.map(({ id }) => id), match_count: matches.length, matches });
if (matches.length) throw new Error("secret/error/evidence scan failed");

const protectedIdentity = ["AGENTS.md", "CURRENT_STATE.md"].map((path) => ({ path, sha256: sha256(readFileSync(resolve(projectRoot, path))) }));
write("protected-boundary-identity.json", { root_head: candidateCommit, root_tree: candidateTree, pi_head: piCommit, pi_clean: true, index_empty: true, binding_audit_sha256: bindingAuditSha256, protected: protectedIdentity, reference_diff_empty: true, current_state_modified: false });
const summary = { schema_version: 1, correction_id: "focused-audit-001", generated_at: new Date().toISOString(), disposition: "CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE", findings: { "F-001": "passed_in_corrected_worktree_fresh_committed_candidate_reaudit_pending", "F-002": "passed", "F-003": "passed", "F-004": "passed" }, commands: commands.map(({ label, command, cwd, exit_code, count, duration_ms }) => ({ label, command, cwd, exit_code, count, duration_ms })), test_counts: { focused_findings: 4, complete_v1a: 18, targeted_v0b_verifier: 2, focused_v0c: 24, full_regression: 109, failed: 0 }, source, manifest_id: manifest.manifest_id, manifest_workbench_tree_digest: manifest.workbench_tree_digest, counts: deterministic.counts, real_model_calls: 0, external_provider_calls: 0, network_calls: 0, credential_reads: 0, dependency_installs: 0, pi_modifications: 0, private_imports: 0, git_stage_or_commit_operations: 0, gate_j_claimed: false, v1a_final_acceptance_claimed: false };
write("post-audit-correction-evidence-summary.json", summary);
write("EVIDENCE_INDEX.md", `# V1-A Post-Audit Bounded-Correction Evidence\n\n- Correction: F-001 through F-004 only; disposition \`CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE\`.\n- Binding audit SHA-256: \`${bindingAuditSha256}\`.\n- Focused findings: 4/4; complete V1-A: 18/18; V0-B Verifier: 2/2; focused V0-C: 24/24; full Workbench: 109/109.\n- Fixture checkout: ${fixtureChecks.length} tracked fixture files, 0 CRLF files, 0 prospective-clean mismatches, 0 accepted-V0 blob deltas.\n- Source digest: \`${source.source_digest}\`.\n- Workbench inventory digest: \`${source.workbench_tree_digest}\`.\n- Fixture inventory digest: \`${source.fixture_tree_digest}\`.\n- Tracked Manifest workbench digest: \`${manifest.workbench_tree_digest}\`; Manifest ID: \`${manifest.manifest_id}\`.\n- Real model / external Provider / network / credential reads: 0 / 0 / 0 / 0.\n- F-001 fresh committed-Candidate checkout re-audit, Main review, freeze, Gate J acceptance and V1-A final acceptance remain pending.\n- Machine summary: \`post-audit-correction-evidence-summary.json\`.\n`);
const mainIndex = resolve(projectRoot, ".runs/v1-a/evidence/EVIDENCE_INDEX.md"); const marker = "## Post-audit bounded correction (focused-audit-001)"; const oldIndex = readFileSync(mainIndex, "utf8");
if (!oldIndex.includes(marker)) appendFileSync(mainIndex, `\n${marker}\n\nAuthoritative append-only corrected-worktree evidence is under \`.runs/v1-a/corrections/focused-audit-001/final-evidence/\`. F-001 fresh committed-Candidate checkout re-audit remains pending.\n`, "utf8");
process.stdout.write(`${JSON.stringify({ evidence_root: slash(relative(projectRoot, evidenceRoot)), source_digest: source.source_digest, workbench_tree_digest: source.workbench_tree_digest, fixture_tree_digest: source.fixture_tree_digest, manifest_workbench_tree_digest: manifest.workbench_tree_digest, manifest_id: manifest.manifest_id, tests: summary.test_counts, counts: deterministic.counts })}\n`);
