import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expectedSkillIdentityV1, loadExactOneSkillV1 } from "../src/skill/runtime-v1.ts";
import { runTreatmentProbeV1, payloadDeltaProofV1 } from "../src/pi/pi-adapter-v1.ts";
import { calibrateTaskPackV1, loadCandidateTaskPackV1 } from "../src/experiment/task-pack-v1.ts";
import { dryRunFixedProviderV1 } from "../src/provider/fixed-provider-v1.ts";
import { buildDeterministicManifestV1 } from "../src/experiment/v1.ts";

const projectRoot = resolve(import.meta.dirname, "../.."); const taskSpec = loadCandidateTaskPackV1(projectRoot)[0];
const taskPrompt = readFileSync(resolve(projectRoot, taskSpec.instruction_ref), "utf8"); const workspaceRoot = resolve(projectRoot, taskSpec.workspace_source_ref);
const loaded = await loadExactOneSkillV1({ projectRoot, skillRoot: "fixtures/skills/v1", expected: expectedSkillIdentityV1(projectRoot) });
const probes = [];
for (const strategyId of ["baseline", "skill_only", "skill_plus_runtime_control"]) probes.push(await runTreatmentProbeV1({ projectRoot, workspaceRoot, strategyId, taskPrompt, taskSpec, skill: loaded.skill }));
const [a, b, c] = probes; const fairness = payloadDeltaProofV1(a, b, c, loaded.wrapper, taskPrompt);
assert.deepEqual(fairness, { bc_byte_equal: true, ab_delta_only_wrapper: true, common_context_equal: true, actual_payloads: true });
const calibration = await calibrateTaskPackV1(projectRoot); const provider = dryRunFixedProviderV1(); const manifest = buildDeterministicManifestV1(projectRoot);
assert.deepEqual([provider.credential_reads, provider.network_calls, provider.provider_calls, provider.formal_runtime_identities], [0, 0, 0, 0]);
process.stdout.write(`${JSON.stringify({ schema_version: 1, gates: { manifest_aggregation: "passed", actual_provider_payload: "passed", executable_task_pack: "passed", fixed_provider_boundary: "passed", exact_skill_identity: "passed" },
	manifest_id: manifest.manifest_id, skill_ref: loaded.ref, fairness, probes: probes.map(({ initial_model_payload, initial_model_projection, ...probe }) => probe), calibration,
	counts: { faux_provider_calls: probes.reduce((sum, probe) => sum + probe.faux_provider_calls, 0), external_verifier_calls: probes.reduce((sum, probe) => sum + probe.verifier_runs, 0) + calibration.length * 3,
		external_provider_calls: 0, real_model_calls: 0, credential_reads: 0, network_calls: 0, cost_usd: 0 } })}\n`);
