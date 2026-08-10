import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { writeOnceJson } from "../src/evidence/artifacts.ts";
import { digestObject, sha256, treeInventory } from "../src/hash.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";

if (process.argv.length !== 3) throw new Error("usage: v36g1-evidence.ts <new-evidence-root>");
const projectRoot = resolve(import.meta.dirname, "../..");
const evidenceRoot = resolve(process.argv[2]!);
if (existsSync(evidenceRoot)) throw new Error("V3.6 Goal 1 evidence root already exists");
mkdirSync(evidenceRoot, { recursive: true });

const registry = () => new ProjectProfileRegistryV36([{
	project_id: "v36-g1-evidence-project",
	display_name: "V3.6 Goal 1 evidence project",
	source_root: resolve(projectRoot, "fixtures/tasks/v0-a-parse-duration"),
	writable_paths: ["src/**", "test/**"],
	protected_paths: ["package.json"],
	supported_modes: ["inspect_only"],
	risk_notice: "Deterministic evidence uses a managed copy with no project commands.",
	execution_backend_profile_id: "docker-goal2-planned",
	provider_model_policy_id: "host-faux-zero-access",
	pi_native_skills: [{ id: "pi-native-evidence", name: "Pi native Skill metadata", description: "Read-only descriptive projection.", source: "pi_native", read_only: true }],
	harness_adaptations: [{ id: "harness-adaptation-evidence", kind: "prompt_addendum", name: "Harness binding metadata", status: "not_bound", read_only: true }],
	current_state: () => ({ state_digest: sha256("v36-g1-evidence-state") }),
}]);
const dataRoot = resolve(evidenceRoot, "runtime");
const processA = new InteractiveControlPlaneV36({ dataRoot, registry: registry() });
const first = await processA.submit({ project_id: "v36-g1-evidence-project", requested_mode: "inspect_only", task_text: "Inspect the managed project and identify its public test surface.", title: "V3.6 Goal 1 evidence Session" });
const processB = new InteractiveControlPlaneV36({ dataRoot, registry: registry() });
const second = await processB.submit({ project_id: "v36-g1-evidence-project", requested_mode: "inspect_only", task_text: "Continue the same Session and retain the pinned authority context.", session_id: first.session_id });
writeOnceJson(evidenceRoot, "verification-summary.json", {
	schema_version: 1,
	goal_id: "V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE",
	session_id: second.session_id,
	run_ids: second.runs.map((run) => run.run_id),
	session_pin_digest: second.pins.session_pin_digest,
	code_identity: second.pins.code_identity,
	harness_state_digest: second.pins.harness_state_digest,
	two_turns_settled: second.runs.length === 2 && second.runs.every((run) => run.settled),
	public_pi_context_reconstructed: second.persistent_session.runs.every((run) => run.context_reconstructed),
	verification_mode: second.verification.mode,
	formal_outcome: second.verification.formal_outcome,
	comparison_eligible: second.verification.comparison_eligible,
	adaptation_eligible: second.verification.adaptation_eligible,
	promotion_eligible: second.verification.promotion_eligible,
	credential_reads: 0,
	external_network_requests: 0,
	external_provider_calls: 0,
	real_model_calls: 0,
	docker_project_command_executions: 0,
	project_command_executions: 0,
	pi_core_patches: 0,
});
const inventory = treeInventory(evidenceRoot);
const indexRef = writeOnceJson(evidenceRoot, "evidence-index.json", {
	schema_version: 1,
	goal_id: "V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE",
	evidence_root: ".runs/v3-6/g1/final-evidence",
	file_count_before_index: inventory.length,
	inventory_digest: digestObject(inventory),
	files: inventory,
	important_artifacts: ["verification-summary.json", ...second.runs.flatMap((run) => [`runtime/interactive-evidence/runs/${run.run_id}/authority.json`, `runtime/interactive-evidence/runs/${run.run_id}/result.json`])],
});
process.stdout.write(`${JSON.stringify({ session_id: second.session_id, run_ids: second.runs.map((run) => run.run_id), evidence_index: indexRef })}\n`);
