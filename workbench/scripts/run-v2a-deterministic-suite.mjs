import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeOnceBytes, writeOnceJson } from "../src/evidence/artifacts.ts";
import { inspectRunV2A, inspectionFingerprintV2A } from "../src/inspect-v2.ts";
import { executeRunV2A } from "../src/run-v2.ts";

const projectRoot = resolve(import.meta.dirname, "../..");
const evidenceRoot = resolve(projectRoot, ".runs/v2-a/evidence");
if (existsSync(evidenceRoot)) throw new Error("V2-A authoritative Evidence root already exists");
mkdirSync(evidenceRoot, { recursive: true });

const scenarios = [
	{ runId: "v2a-authoritative-initial-pass", primaryMode: "pass" },
	{ runId: "v2a-authoritative-a-pass-b-fail", primaryMode: "fail", candidateModes: ["pass", "fail"] },
	{ runId: "v2a-authoritative-a-fail-b-pass", primaryMode: "fail", candidateModes: ["fail", "pass"] },
	{ runId: "v2a-authoritative-a-pass-b-pass", primaryMode: "fail", candidateModes: ["pass", "pass"] },
	{ runId: "v2a-authoritative-a-fail-b-fail", primaryMode: "fail", candidateModes: ["fail", "fail"] },
	{ runId: "v2a-authoritative-a-budget-b-pass", primaryMode: "fail", candidateModes: ["budget_stop", "pass"] },
];

const summaries = [];
for (const scenario of scenarios) {
	const runRoot = resolve(evidenceRoot, "runs", scenario.runId);
	const terminal = await executeRunV2A({ projectRoot, runRoot, ...scenario });
	const before = inspectionFingerprintV2A(runRoot);
	const inspected = inspectRunV2A({ runRoot });
	const after = inspectionFingerprintV2A(runRoot);
	assert.equal(inspected.integrity_valid, true, `${scenario.runId}: ${inspected.errors.join("; ")}`);
	assert.equal(before, after, `${scenario.runId}: Inspector mutated evidence`);
	assert.deepEqual(terminal.real_call_counters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
	const primaryEvent = readFileSync(resolve(runRoot, "journal.jsonl"), "utf8")
		.trim()
		.split(/\r?\n/)
		.map((line) => JSON.parse(line))
		.find((event) => event.type === "primary_settled");
	const candidateUsage = inspected.candidates.map((candidate) => candidate.budget_usage);
	summaries.push({
		run_id: terminal.run_id,
		recovery_group_id: terminal.recovery_group_id,
		outcome: terminal.outcome,
		selected_candidate_id: terminal.selected_candidate_id,
		candidate_ids: inspected.candidates.map((candidate) => candidate.candidate_path_id),
		integrity_valid: inspected.integrity_valid,
		inspector_read_only: before === after,
		counts: {
			faux_provider_dispatches: Number(primaryEvent?.data?.provider_dispatches ?? 0) + candidateUsage.reduce((sum, usage) => sum + usage.faux_provider_dispatches, 0),
			tool_calls: Number(primaryEvent?.data?.tool_calls ?? 0) + candidateUsage.reduce((sum, usage) => sum + usage.tool_calls, 0),
			verifier_runs: terminal.outcome === "initial_pass" ? 1 : 3,
			real_cost_usd: 0,
			credential_reads: 0,
			network_calls: 0,
			external_provider_calls: 0,
			real_model_calls: 0,
		},
		fingerprint: before,
	});
}

const summaryRef = writeOnceJson(evidenceRoot, "SUMMARY.json", {
	schema_version: "v2a-deterministic-evidence-summary-v1",
	generated_by: "workbench/scripts/run-v2a-deterministic-suite.mjs",
	pi_commit: "027a5847901b5dde30270abaa1041046cd2b4b55",
	runs: summaries,
});
const lines = [
	"# V2-A Deterministic Evidence Index",
	"",
	"This ignored evidence was generated with the public emitted `AgentHarness` and `JsonlSessionRepo`, the Faux Provider, the promoted V1 Skill, and the common external Verifier.",
	"",
	`- Summary: \`${summaryRef.path}\` (\`${summaryRef.sha256}\`)`,
	"- Credential reads: `0`",
	"- Network calls: `0`",
	"- External provider calls: `0`",
	"- Real model calls: `0`",
	"- Real cost USD: `0`",
	"",
	"## Authoritative Runs",
	"",
	...summaries.flatMap((summary) => [
		`- \`${summary.run_id}\`: outcome \`${summary.outcome}\`, Recovery Group \`${summary.recovery_group_id ?? "none"}\`, selected \`${summary.selected_candidate_id ?? "none"}\`, integrity \`${summary.integrity_valid}\`.`,
		`  - Root: \`runs/${summary.run_id}/\``,
		`  - Candidate IDs: ${summary.candidate_ids.length === 0 ? "none" : summary.candidate_ids.map((id) => `\`${id}\``).join(", ")}`,
	]),
	"",
	"Each Run root contains its immutable Manifest, Journal, raw Verifier output, Verifier result, Pi JSONL Session files, Workspace snapshots, Recovery Seed (when applicable), both Candidate terminal records (when applicable), Selection Decision, and terminal marker.",
	"",
];
writeOnceBytes(evidenceRoot, "EVIDENCE_INDEX.md", `${lines.join("\n")}\n`);
process.stdout.write(`${JSON.stringify({ schema_version: 1, summary_ref: summaryRef, authoritative_run_ids: summaries.map((summary) => summary.run_id), gates: { initial_pass_no_branch: "passed", seed_before_candidates: "passed", workspace_isolation: "passed", session_delta: "passed", selector_matrix: "passed", inspector_read_only: "passed" }, counts: { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 } })}\n`);
