import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { writeOnceBytes, writeOnceJson } from "../src/evidence/artifacts.ts";
import { inspectRunV2A, inspectionFingerprintV2A } from "../src/inspect-v2.ts";
import { executeRunV2A } from "../src/run-v2.ts";

const projectRoot = resolve(import.meta.dirname, "../..");
const evidenceRoot = resolve(projectRoot, ".runs/v2-a/evidence");
const validationRoot = resolve(evidenceRoot, "final-source-validation");
if (!existsSync(resolve(evidenceRoot, "EVIDENCE_INDEX.md"))) throw new Error("base V2-A Evidence Index is missing");
if (existsSync(validationRoot)) throw new Error("V2-A final-source validation already exists");
mkdirSync(validationRoot, { recursive: true });

const runId = "v2a-authoritative-final-source-a-pass-b-fail";
const runRoot = resolve(validationRoot, "runs", runId);
const terminal = await executeRunV2A({ projectRoot, runRoot, runId, primaryMode: "fail", candidateModes: ["pass", "fail"] });
const before = inspectionFingerprintV2A(runRoot);
const inspected = inspectRunV2A({ runRoot });
const after = inspectionFingerprintV2A(runRoot);
assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
assert.equal(before, after, "final-source Inspector mutated evidence");
assert.equal(terminal.selected_candidate_id, inspected.candidates[0]?.candidate_path_id);
assert.ok(inspected.candidates.every((candidate) => candidate.hard_gates.protected_secret_path_valid));
assert.deepEqual(terminal.real_call_counters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });

const summaryRef = writeOnceJson(evidenceRoot, "FINAL_SOURCE_VALIDATION.json", {
	schema_version: "v2a-final-source-validation-v1",
	run_id: runId,
	recovery_group_id: terminal.recovery_group_id,
	selected_candidate_id: terminal.selected_candidate_id,
	protected_secret_path_gates: inspected.candidates.map((candidate) => ({ candidate_path_id: candidate.candidate_path_id, passed: candidate.hard_gates.protected_secret_path_valid })),
	integrity_valid: inspected.integrity_valid,
	inspector_read_only: before === after,
	fingerprint: before,
	real_call_counters: terminal.real_call_counters,
});
writeOnceBytes(evidenceRoot, "EVIDENCE_INDEX_SUPPLEMENT.md", `# V2-A Final-source Evidence Supplement\n\n- Final-source Run: \`${runId}\`\n- Recovery Group: \`${terminal.recovery_group_id}\`\n- Selected: \`${terminal.selected_candidate_id}\`\n- Summary: \`${summaryRef.path}\` (\`${summaryRef.sha256}\`)\n- Inspector integrity: \`true\` and read-only\n- Candidate protected/secret/path Hard Gates: \`true\`, \`true\`\n- Credential/network/external Provider/real model calls: \`0/0/0/0\`\n\nArtifacts are under \`final-source-validation/runs/${runId}/\`. This supplement appends evidence without overwriting the original write-once index or Runs.\n`);
process.stdout.write(`${JSON.stringify({ run_id: runId, recovery_group_id: terminal.recovery_group_id, selected_candidate_id: terminal.selected_candidate_id, summary_ref: summaryRef, integrity_valid: true, inspector_read_only: true, real_call_counters: terminal.real_call_counters })}\n`);
