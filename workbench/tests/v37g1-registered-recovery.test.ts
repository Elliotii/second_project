import assert from "node:assert/strict";
import { cpSync, existsSync, linkSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import type { BoundedProposalPortV3 } from "../src/refinement/producer-v3.ts";
import type { ImprovementOpportunityV3 } from "../src/contracts/v3-types.ts";
import { digestObject, stableJson } from "../src/hash.ts";
import { inspectRegisteredRecoveryAdmissionV37 } from "../src/inspect-v37g1.ts";
import { initializeStateStoreV3 } from "../src/state/store-v3.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { projectImprovementOpportunityV3 } from "../src/refinement/evidence-v3.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { producePromptCandidateV37, validateFrozenPrimaryCandidateContentV37 } from "../src/v37/candidate-v37.ts";
import { loadRegisteredCaseFromHostRegistryV37 } from "../src/v37/host-registry-v37.ts";
import { admitRegisteredRecoveryV37, deriveRegisteredRecoveryPackageV37, persistRegisteredRecoveryPackageV37 } from "../src/v37/registered-recovery-v37.ts";
import { bindPrimaryRunV37, createWorkflowRegistrationV37, loadPrimaryRunBindingV37, loadWorkflowRegistrationV37 } from "../src/v37/workflow-registration-v37.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const ROOT = resolve(PROJECT_ROOT, ".runs/v37/g1-tests");
const DATA_ROOT = ".runs/v37/g1-tests/data";
const STATE_ROOT = resolve(PROJECT_ROOT, ".runs/v37/g1-tests/state-store");
const RUN_ROOT = resolve(ROOT, "v2-valid");
const CASE_ID = "v37-g1-det-recovery";
const WORKFLOW_ID = "v37-g1-workflow-a";
const CONFIRMED_AT = "2026-08-18T01:00:00.000Z";
const REQUESTED_AT = "2026-08-18T01:00:01.000Z";

function rel(path: string): string { return relative(PROJECT_ROOT, path).split(sep).join("/"); }
function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, "utf8")) as T; }
function writeJson(path: string, value: unknown): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${stableJson(value)}\n`, "utf8"); }
function cloneHost(label: string): string {
	const root = resolve(ROOT, "host-copies", label);
	mkdirSync(resolve(root, "workbench/config/v37/registered-cases"), { recursive: true });
	cpSync(resolve(PROJECT_ROOT, "workbench/config/v37/registered-cases"), resolve(root, "workbench/config/v37/registered-cases"), { recursive: true });
	return root;
}

function proposal(opportunity: ImprovementOpportunityV3, baseDigest: string, kind: "prompt_addendum" | "adaptive_skill" = "prompt_addendum", content = "Run the frozen task check before claiming completion."): unknown {
	const applicability = { task_kinds: ["typescript-maintenance"], failure_families: ["verifier-failure"] };
	return {
		schema_version: 1,
		proposal_id: `v37-test-${kind}`,
		evidence_digest: opportunity.evidence_identity.evidence_digest,
		expected_base_state_digest: baseDigest,
		diagnosis: { pattern_id: opportunity.trigger, statement: "The Primary attempt failed its registered verifier before bounded recovery succeeded.", evidence_refs: structuredClone(opportunity.evidence_refs) },
		lesson: { statement: "Verify through the registered check before reporting completion.", expected_outcome: "The failure pattern is avoided without changing evaluation authority.", applicability },
		edits: kind === "prompt_addendum"
			? [{ kind, entry_id: "v37-verify-before-finish", content, applicability }]
			: [{ kind, entry_id: "v37-adaptive-skill", skill_name: "v37-adaptive-skill", description: "Forbidden Goal 1 adaptive Skill.", markdown_body: "Run the frozen check.", applicability }],
	};
}

function port(build: (opportunity: ImprovementOpportunityV3, baseDigest: string) => unknown): BoundedProposalPortV3 {
	return { propose: async (input) => build(input.opportunity, input.expected_base_state_digest) };
}

const common = { projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runRoot: RUN_ROOT, confirmedAt: CONFIRMED_AT, requestedAt: REQUESTED_AT };

test.before(async () => {
	rmSync(ROOT, { recursive: true, force: true });
	mkdirSync(resolve(ROOT, "agent-workspace"), { recursive: true });
	mkdirSync(resolve(ROOT, "accepted-base"), { recursive: true });
	await initializeStateStoreV3({ stateRoot: STATE_ROOT, projectId: "v37-g1-project", agentWorkspaceRoot: resolve(ROOT, "agent-workspace"), acceptedBaseRoots: [resolve(ROOT, "accepted-base")], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	createWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId: WORKFLOW_ID, createdAt: "2026-08-18T00:30:00.000Z" });
	bindPrimaryRunV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runId: "v37-g1-v2-primary", runRoot: RUN_ROOT, boundAt: "2026-08-18T00:45:00.000Z" });
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: RUN_ROOT, runId: "v37-g1-v2-primary", primaryMode: "fail", candidateModes: ["pass", "pass"] });
	persistRegisteredRecoveryPackageV37(common);
	admitRegisteredRecoveryV37(common);
});

test("fixed Host registry recomputes exact inventory and rejects unregistered or caller-selected authority", () => {
	const loaded = loadRegisteredCaseFromHostRegistryV37({ projectRoot: PROJECT_ROOT, caseId: CASE_ID });
	assert.equal(loaded.registry.configuration_baseline_id, "v37-g1-host-registry-v1");
	assert.equal(loaded.registry.loader_contract_id, "v37-host-registry-loader-v1");
	assert.equal(loaded.manifest.manifest_body_digest, loaded.registry.entries[0]!.manifest_body_digest);
	assert.equal(loaded.current_envelope.registration_digest, loaded.registry.entries[0]!.current_registration_digest);
	assert.match(loaded.registry_trust_root_digest, /^[a-f0-9]{64}$/);
	assert.match(loaded.loader_contract_fingerprint, /^[a-f0-9]{64}$/);
	assert.deepEqual(loaded.manifest.follow_up_task_spec.body, {
		task_id: "v37-g1-det-follow-up-clamp-retries",
		task_kind: "typescript-maintenance",
		failure_family: "verifier-failure",
		task_body: "Update `src/policy.mjs` so `clampRetries` returns `0` for negative integer inputs and preserves non-negative integer inputs. Do not modify verifier files.",
		task_body_sha256: "4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8",
	});
	assert.equal((loaded.manifest.follow_up_source_baseline_spec.body as { source_sha256: string }).source_sha256, "77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11");
	assert.equal((loaded.manifest.follow_up_verifier_spec.body as { verifier_sha256: string }).verifier_sha256, "2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87");
	assert.equal((loaded.manifest.follow_up_verifier_spec.body as { verifier_command_sha256: string }).verifier_command_sha256, "4b54db2265af6b195de93467a95970bdac4a1d7f2a5a3af85a628e9f84305033");
	assert.throws(() => loadRegisteredCaseFromHostRegistryV37({ projectRoot: PROJECT_ROOT, caseId: "unknown-case" }), /not present/);
	assert.throws(() => loadRegisteredCaseFromHostRegistryV37({ projectRoot: PROJECT_ROOT, caseId: CASE_ID, registryLocation: "caller.json", digest: "0".repeat(64) } as never), /override rejected/);
});

test("loader-owned registry rejects malformed registry, Manifest, Envelope and hardlink bytes", async () => {
	for (const variant of ["registry-key", "manifest", "envelope", "hardlink"] as const) {
		const root = cloneHost(variant);
		cpSync(resolve(PROJECT_ROOT, "workbench/src"), resolve(root, "workbench/src"), { recursive: true });
		const registryPath = resolve(root, "workbench/config/v37/registered-cases/registry-v1.json");
		const manifestPath = resolve(root, "workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json");
		const envelopePath = resolve(root, "workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json");
		if (variant === "registry-key") { const value = readJson<Record<string, unknown>>(registryPath); value.caller_approval = true; writeJson(registryPath, value); }
		if (variant === "manifest") { const value = readJson<Record<string, unknown>>(manifestPath); value.project_id = "forged-project"; writeJson(manifestPath, value); }
		if (variant === "envelope") { const value = readJson<Record<string, unknown>>(envelopePath); value.approval_policy_id = "manual-approval"; writeJson(envelopePath, value); }
		if (variant === "hardlink") linkSync(manifestPath, resolve(dirname(manifestPath), "manifest-copy.json"));
		const clonedRegistry = await import(pathToFileURL(resolve(root, "workbench/src/v37/host-registry-v37.ts")).href);
		assert.throws(() => clonedRegistry.loadRegisteredCaseFromHostRegistryV37({ projectRoot: root, caseId: CASE_ID }), /exact-key|digest|identity|mismatch|ordinary singly linked|approval/i, variant);
	}
});

test("caller projectRoot cannot select an identical alternate registry or reproduce its Authority", () => {
	const root = cloneHost("identical-alternate");
	assert.throws(() => loadRegisteredCaseFromHostRegistryV37({ projectRoot: root, caseId: CASE_ID }), /alternate Host registry baseline/);
});

test("workflow and fixed task identities are Host-derived, immutable, multi-instance and cross-workflow safe", () => {
	const first = loadWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID });
	const second = createWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId: "v37-g1-workflow-b", createdAt: "2026-08-18T00:31:00.000Z" });
	assert.notEqual(first.workflow.workflow_registration_digest, second.workflow.workflow_registration_digest);
	assert.notEqual(first.primary.task_instance_digest, second.primary.task_instance_digest);
	assert.equal(first.primary.role, "primary");
	assert.equal(first.follow_up.role, "follow_up");
	const copied = resolve(ROOT, "workflow-tamper"); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), copied, { recursive: true });
	const path = resolve(copied, "workflows", WORKFLOW_ID, "registration.json"); const value = readJson<any>(path); value.workflow_id = "v37-g1-workflow-b"; writeJson(path, value);
	assert.throws(() => loadWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: rel(copied), workflowId: WORKFLOW_ID }), /path\/identity|digest|recomputation/);
});

test("Primary Run binding is pre-execution, persistent and rejects missing, changed or cross-workflow identity/root", () => {
	const binding = loadPrimaryRunBindingV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runRoot: RUN_ROOT });
	assert.equal(binding.primary_run_id, "v37-g1-v2-primary");
	assert.equal(binding.primary_task_instance_digest, loadWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID }).primary.task_instance_digest);
	assert.throws(() => loadPrimaryRunBindingV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runRoot: resolve(ROOT, "changed-root") }), /root mismatch/);
	assert.throws(() => bindPrimaryRunV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runId: "v37-g1-v2-primary-changed", runRoot: RUN_ROOT, boundAt: "2026-08-18T00:46:00.000Z" }), /already bound|incomplete/);
	assert.throws(() => deriveRegisteredRecoveryPackageV37({ ...common, workflowId: "v37-g1-workflow-b" }), /Primary Run binding|missing|ENOENT/);
	assert.throws(() => bindPrimaryRunV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: "v37-g1-workflow-b", runId: "v37-g1-v2-primary", runRoot: RUN_ROOT, boundAt: "2026-08-18T00:46:00.000Z" }), /already bound to another workflow/);
});

test("valid V2 truth produces a Candidate-Path-preserving Comparison, separate request and admitted Opportunity", () => {
	const packageValue = deriveRegisteredRecoveryPackageV37(common);
	assert.equal(packageValue.comparison.decision_result, "selected");
	assert.equal(packageValue.comparison.arms.length, 2);
	assert.equal(packageValue.comparison.arms.some((arm) => arm.candidate_path_id === packageValue.comparison.primary_run_id), false);
	assert.equal(Object.hasOwn(packageValue.comparison, "recovery_a_run_id"), false);
	assert.notEqual(packageValue.evidence.evidence_body_digest, packageValue.request.submission_request_digest);
	assert.equal(packageValue.request.evidence_body_digest, packageValue.evidence.evidence_body_digest);
	const inspected = inspectRegisteredRecoveryAdmissionV37(common);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.admission!.result, "admitted");
	assert.equal(inspected.admission!.opportunity!.trigger, "hard_failure");
	assert.equal(inspected.admission!.opportunity!.observations.selected_candidate_path_id, packageValue.comparison.selected_candidate_path_id);
});

test("both failed Recovery arms are terminal and learning-ineligible", async () => {
	const workflowId = "v37-g1-workflow-both-fail";
	createWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId, createdAt: "2026-08-18T00:32:00.000Z" });
	const runRoot = resolve(ROOT, "v2-both-fail");
	bindPrimaryRunV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId, runId: "v37-g1-v2-both-fail", runRoot, boundAt: "2026-08-18T00:47:00.000Z" });
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot, runId: "v37-g1-v2-both-fail", primaryMode: "fail", candidateModes: ["fail", "fail"] });
	const options = { ...common, workflowId, runRoot };
	const packageValue = persistRegisteredRecoveryPackageV37(options);
	assert.equal(packageValue.comparison.decision_result, "no_valid_recovery");
	assert.equal(packageValue.comparison.selected_candidate_path_id, null);
	const admission = admitRegisteredRecoveryV37(options);
	assert.equal(admission.result, "rejected");
	assert.deepEqual(admission.reasons, ["no_valid_recovery"]);
	assert.equal(admission.opportunity, null);
	const inspected = inspectRegisteredRecoveryAdmissionV37(options);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.admission!.result, "rejected");
});

test("package tamper, confirmation replay and source mutation fail independent reopen", () => {
	for (const [variant, file, mutate] of [
		["comparison", "comparison.json", (value: any) => { value.selected_candidate_path_id = "foreign-path"; }],
		["evidence", "evidence.json", (value: any) => { value.workflow_id = "foreign-workflow"; }],
		["confirmation", "confirmation.json", (value: any) => { value.evidence_body_digest = "0".repeat(64); }],
		["request", "request.json", (value: any) => { value.confirmation_receipt_id = "foreign-confirmation"; }],
	] as const) {
		const copy = resolve(ROOT, "tamper", variant); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), copy, { recursive: true });
		const path = resolve(copy, "workflows", WORKFLOW_ID, "recovery", file); const value = readJson<any>(path); mutate(value); writeJson(path, value);
		const inspected = inspectRegisteredRecoveryAdmissionV37({ ...common, dataRoot: rel(copy) });
		assert.equal(inspected.integrity_valid, false, variant);
		assert.match(inspected.errors.join("; "), /recomputation|digest|lineage|mismatch/i);
	}
	const sourceRun = resolve(ROOT, "source-tamper-run"); cpSync(RUN_ROOT, sourceRun, { recursive: true });
	const sourceData = resolve(ROOT, "source-tamper-data"); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), sourceData, { recursive: true });
	const verifierPath = resolve(sourceRun, "candidates/a/verifier-result.json"); const verifier = readJson<any>(verifierPath); verifier.status = "failed"; writeJson(verifierPath, verifier);
	const sourceInspected = inspectRegisteredRecoveryAdmissionV37({ ...common, dataRoot: rel(sourceData), runRoot: sourceRun });
	assert.equal(sourceInspected.integrity_valid, false);
	assert.match(sourceInspected.errors.join("; "), /source|artifact|digest|recovery|integrity|recomputation|binding/i);
});

test("admission reopen rejects cross-workflow substitution, hardlinks and intermediate junctions", () => {
	const cross = resolve(ROOT, "cross-workflow-data"); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), cross, { recursive: true });
	cpSync(resolve(cross, "workflows", WORKFLOW_ID, "recovery"), resolve(cross, "workflows", "v37-g1-workflow-b", "recovery"), { recursive: true });
	const crossInspected = inspectRegisteredRecoveryAdmissionV37({ ...common, dataRoot: rel(cross), workflowId: "v37-g1-workflow-b" });
	assert.equal(crossInspected.integrity_valid, false);
	const hard = resolve(ROOT, "hardlink-data"); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), hard, { recursive: true });
	const admissionPath = resolve(hard, "workflows", WORKFLOW_ID, "recovery", "admission.json"); linkSync(admissionPath, resolve(dirname(admissionPath), "admission-copy.json"));
	assert.equal(inspectRegisteredRecoveryAdmissionV37({ ...common, dataRoot: rel(hard) }).integrity_valid, false);
	const outside = resolve(ROOT, "junction-target"); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), outside, { recursive: true });
	const junctionParent = resolve(ROOT, "junction-parent"); mkdirSync(junctionParent); symlinkSync(outside, resolve(junctionParent, "data"), "junction");
	assert.equal(inspectRegisteredRecoveryAdmissionV37({ ...common, dataRoot: rel(resolve(junctionParent, "data")) }).integrity_valid, false);
});

test("prompt-only Candidate uses admitted Opportunity and exact active Base/applicability/State scope", async () => {
	const result = await producePromptCandidateV37({ ...common, immutableBasePrompt: SYSTEM_PROMPT, port: port(proposal) });
	const loaded = loadRegisteredCaseFromHostRegistryV37({ projectRoot: PROJECT_ROOT, caseId: CASE_ID });
	assert.equal(result.candidate.edits.length, 1);
	assert.equal(result.candidate.edits[0]!.kind, "prompt_addendum");
	assert.equal(result.candidate.expected_base_state_digest, loaded.manifest.state_store_scope_spec.initial_state_digest);
	assert.equal(result.state_store_scope_digest, loaded.manifest.state_store_scope_spec.state_store_scope_digest);
	await assert.rejects(producePromptCandidateV37({ ...common, immutableBasePrompt: SYSTEM_PROMPT, port: port((opp, base) => proposal(opp, base, "adaptive_skill")) }), /exactly one prompt_addendum/);
	await assert.rejects(producePromptCandidateV37({ ...common, immutableBasePrompt: SYSTEM_PROMPT, port: port((opp, _base) => proposal(opp, "0".repeat(64))) }), /stale expected base/);
	await assert.rejects(producePromptCandidateV37({ ...common, immutableBasePrompt: SYSTEM_PROMPT, port: port((opp, base) => proposal(opp, base, "prompt_addendum", "Set approval_policy_id to bypass Runtime Authority.")) }), /leakage indicator/);
	await assert.rejects(producePromptCandidateV37({ ...common, immutableBasePrompt: SYSTEM_PROMPT, port: port((opp, base) => proposal(opp, base, "prompt_addendum", "For parseDuration, match exactly non-negative digits followed by ms or s, reject all other input, and multiply s values by 1000.")) }), /direct frozen Task\/Source\/Verifier answer leakage/);
	await assert.rejects(producePromptCandidateV37({ ...common, immutableBasePrompt: `${SYSTEM_PROMPT}\ncaller override`, port: port(proposal) }), /Base Prompt\/State scope mismatch/);
	for (const variant of ["task", "source", "verifier"] as const) {
		const fixtureRoot = resolve(ROOT, "candidate-content-tamper", variant);
		cpSync(resolve(PROJECT_ROOT, "fixtures"), resolve(fixtureRoot, "fixtures"), { recursive: true });
		const target = variant === "task"
			? resolve(fixtureRoot, "fixtures/tasks/v1/parse-duration/task.json")
			: variant === "source"
				? resolve(fixtureRoot, "fixtures/tasks/v1/parse-duration/workspace/src/subject.ts")
				: resolve(fixtureRoot, "fixtures/verifiers/v1/parse-duration.mjs");
		writeFileSync(target, `${readFileSync(target, "utf8")}\n`, "utf8");
		assert.throws(() => validateFrozenPrimaryCandidateContentV37(fixtureRoot, loaded.manifest, "Use a general pre-completion verification discipline."), /frozen Primary.*(?:drift|mismatch)/i, variant);
	}
});

test("disabled Host registration blocks mutation while exact accepted admission reopens read-only", async () => {
	const hostRoot = resolve(PROJECT_ROOT, ".runs/v37/g1-disabled-host");
	rmSync(hostRoot, { recursive: true, force: true });
	cpSync(resolve(PROJECT_ROOT, "workbench/src"), resolve(hostRoot, "workbench/src"), { recursive: true });
	cpSync(resolve(PROJECT_ROOT, "workbench/config/v37"), resolve(hostRoot, "workbench/config/v37"), { recursive: true });
	cpSync(resolve(PROJECT_ROOT, "fixtures"), resolve(hostRoot, "fixtures"), { recursive: true });
	const clonedRunRoot = resolve(hostRoot, rel(RUN_ROOT));
	const registryModule = await import(pathToFileURL(resolve(hostRoot, "workbench/src/v37/host-registry-v37.ts")).href);
	const workflowModule = await import(pathToFileURL(resolve(hostRoot, "workbench/src/v37/workflow-registration-v37.ts")).href);
	const recoveryModule = await import(pathToFileURL(resolve(hostRoot, "workbench/src/v37/registered-recovery-v37.ts")).href);
	const inspectModule = await import(pathToFileURL(resolve(hostRoot, "workbench/src/inspect-v37g1.ts")).href);
	const runModule = await import(pathToFileURL(resolve(hostRoot, "workbench/src/run-v2.ts")).href);
	workflowModule.createWorkflowRegistrationV37({ projectRoot: hostRoot, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId: WORKFLOW_ID, createdAt: "2026-08-18T00:30:00.000Z" });
	workflowModule.bindPrimaryRunV37({ projectRoot: hostRoot, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runId: "v37-g1-v2-primary", runRoot: clonedRunRoot, boundAt: "2026-08-18T00:45:00.000Z" });
	await runModule.executeRunV2A({ projectRoot: hostRoot, runRoot: clonedRunRoot, runId: "v37-g1-v2-primary", primaryMode: "fail", candidateModes: ["pass", "pass"] });
	const clonedOptions = { ...common, projectRoot: hostRoot, runRoot: clonedRunRoot };
	recoveryModule.persistRegisteredRecoveryPackageV37(clonedOptions);
	const acceptedAdmission = recoveryModule.admitRegisteredRecoveryV37(clonedOptions);
	const registryPath = resolve(hostRoot, "workbench/config/v37/registered-cases/registry-v1.json");
	const registry = readJson<any>(registryPath);
	const first = readJson<any>(resolve(hostRoot, registry.entries[0].envelope_locations[0]));
	const secondBody = { ...first, registration_revision: 2, previous_registration_digest: first.registration_digest, registration_status: "disabled", disabled_at: "2026-08-18T02:00:00.000Z" };
	delete secondBody.registration_digest;
	const second = { ...secondBody, registration_digest: digestObject(secondBody) };
	const secondLocation = ".runs/v37/g1-disabled-host-envelope-r2.json";
	writeJson(resolve(hostRoot, secondLocation), second);
	registry.entries[0].envelope_locations.push(secondLocation);
	registry.entries[0].envelope_digests.push(second.registration_digest);
	registry.entries[0].current_registration_digest = second.registration_digest;
	delete registry.registry_index_digest;
	registry.registry_index_digest = digestObject(registry);
	writeJson(registryPath, registry);
	assert.throws(() => registryModule.loadRegisteredCaseFromHostRegistryV37({ projectRoot: hostRoot, caseId: CASE_ID }), /disabled/);
	assert.equal(registryModule.loadRegisteredCaseFromHostRegistryV37({ projectRoot: hostRoot, caseId: CASE_ID, allowDisabledHistorical: true }).historical_read_only, true);
	assert.throws(() => workflowModule.createWorkflowRegistrationV37({ projectRoot: hostRoot, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId: "v37-disabled-new", createdAt: "2026-08-18T02:01:00.000Z" }), /disabled/);
	assert.throws(() => recoveryModule.deriveRegisteredRecoveryPackageV37(clonedOptions), /disabled/);
	assert.throws(() => recoveryModule.admitRegisteredRecoveryV37(clonedOptions), /disabled/);
	const historical = inspectModule.inspectRegisteredRecoveryAdmissionV37(clonedOptions);
	assert.equal(historical.integrity_valid, true, historical.errors.join("; "));
	assert.equal(historical.admission.admission_digest, acceptedAdmission.admission_digest);
});

test("old passed evidence without a genuine peer comparison remains no-opportunity", () => {
	const evidenceBody = {
		schema_version: 1 as const,
		evidence_id: "evidence-v37-old-v2-guard",
		source_run_ids: ["v2-old-source-run"],
		validity: { integrity_valid: true, terminal_valid: true, lineage_closed: true, attribution: "none" as const },
		outcome: { status: "passed" as const, verifier_status: "passed" as const },
		task_context: { task_kind: "typescript-maintenance", failure_family: "recovery-comparison" },
		evidence_refs: [deriveRegisteredRecoveryPackageV37(common).evidence.source_artifact_refs[0]!],
	};
	const evidence = { ...evidenceBody, evidence_digest: digestObject(evidenceBody) };
	assert.equal(projectImprovementOpportunityV3(RUN_ROOT, evidence), null);
});

test("rejected Schema 2 paths remain absent", () => {
	for (const path of ["workbench/src/contracts/final-capstone-g3-types.ts", "workbench/src/pi/final-capstone-g3-v36-port.ts", "workbench/src/final-capstone-g3.ts", "workbench/src/inspect-final-capstone-g3.ts", "workbench/tests/final-capstone-g3-closed-loop.test.ts"]) assert.equal(existsSync(resolve(PROJECT_ROOT, path)), false, path);
});
