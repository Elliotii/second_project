import assert from "node:assert/strict";
import { cpSync, linkSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { Skill } from "@earendil-works/pi-agent-core";
import { decideV1Intervention } from "../src/completion/controller-v1.ts";
import type { ExperimentManifestV1, RunResultV1, StrategySpecV1, TaskSpecV1, VerifierStatusV1 } from "../src/contracts/v1-types.ts";
import { validateStrategySpecV1 } from "../src/contracts/v1-types.ts";
import { aggregateExperimentV1, buildDeterministicManifestV1, manifestIdentityV1, validateExperimentManifestV1, V1_MANIFEST_DIGEST_DOMAINS } from "../src/experiment/v1.ts";
import { assertTaskWorkspaceBoundaryV1, calibrateTaskPackV1, loadCandidateTaskPackV1, verifierRejectsNonsolutionV1 } from "../src/experiment/task-pack-v1.ts";
import { payloadDeltaProofV1, runTreatmentProbeV1 } from "../src/pi/pi-adapter-v1.ts";
import { DEEPSEEK_FIXED_PROFILE_V1, FIXED_PROVIDER_ENVELOPE_V1, createOneUseProviderAuthorityV1, createPublicPiCompositionSeamV1, dryRunFixedProviderV1, projectFixedProviderUsageV1 } from "../src/provider/fixed-provider-v1.ts";
import { assertNoSkillCollisionV1, expectedSkillIdentityV1, loadExactOneSkillV1 } from "../src/skill/runtime-v1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const SKILL_ROOT = "fixtures/skills/v1";
function caseRoot(label: string): string { const root = resolve(PROJECT_ROOT, ".runs/v1-a/test-cases", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`); mkdirSync(root, { recursive: true }); return root; }
function cloneSkillProject(label: string): string { const root = caseRoot(label); cpSync(resolve(PROJECT_ROOT, "fixtures/skills/v1"), resolve(root, "fixtures/skills/v1"), { recursive: true }); return root; }
function loadExpected(root = PROJECT_ROOT, skillRoot = SKILL_ROOT) { return loadExactOneSkillV1({ projectRoot: root, skillRoot, expected: expectedSkillIdentityV1(root) }); }
function verifierDigest(manifest: ExperimentManifestV1, taskId: string): string { const token = taskId.replace(/^v1-/, ""); return manifest.verifier_digests[Object.keys(manifest.verifier_digests).find((id) => id.includes(token))!]!; }

function runFor(manifest: ExperimentManifestV1, member: ExperimentManifestV1["members"][number]): RunResultV1 {
	const child = member.strategy_id === "skill_plus_runtime_control"; const a1 = `${member.run_id}-a1`; const a2 = `${member.run_id}-a2`;
	return { ...member, experiment_id: manifest.experiment_id, manifest_id: manifest.manifest_id, terminal: true, verifier_status: "passed", attempt_count: child ? 2 : 1, child_attempt_count: child ? 1 : 0,
		evidence: { task_digest: manifest.task_digests[member.task_id]!, workspace_source_digest: manifest.workspace_digests[member.task_id]!, prompt_digest: manifest.base_prompt_digest,
			skill_digest: member.strategy_id === "baseline" ? null : manifest.skill_digest, strategy_digest: manifest.strategy_digests[member.strategy_id], tool_digest: manifest.tool_profile_digest,
			verifier_digest: verifierDigest(manifest, member.task_id), model_profile_digest: manifest.model_profile_digest, workbench_digest: manifest.workbench_tree_digest, pi_digest: manifest.pi_commit,
			initial_payload_digest: "a".repeat(64), skill_wrapper_bytes: member.strategy_id === "baseline" ? 0 : 100, skill_body_bytes: member.strategy_id === "baseline" ? 0 : 537,
			attempts: child ? [{ attempt_id: a1, ordinal: 1, parent_attempt_id: null }, { attempt_id: a2, ordinal: 2, parent_attempt_id: a1 }] : [{ attempt_id: a1, ordinal: 1, parent_attempt_id: null }],
			session_id: `${member.run_id}-session`, workspace_id: `${member.run_id}-workspace`, initial_verifier_status: child ? "failed" : "passed", final_verifier_status: "passed",
			recovery_eligible: child, recovery_budget_available: child, recovery_started: child, provider_requests: child ? 2 : 1, tool_calls: 0, tokens: "unknown", wall_time_ms: 1, cost_usd: 0,
			invalid_attribution: "none", exclusion_preauthorized: false, terminal_refs: [`${member.run_id}/terminal.json`] } };
}
function aggregateAtRoot(manifest: ExperimentManifestV1, runs: readonly RunResultV1[]) { return aggregateExperimentV1(manifest, runs, PROJECT_ROOT); }
function validateAtRoot(manifest: ExperimentManifestV1) { return validateExperimentManifestV1(manifest, PROJECT_ROOT); }

test("V1-A frozen emitted Skill identity and public skill route are exact", async () => {
	const loaded = await loadExpected(); const frozen = expectedSkillIdentityV1(PROJECT_ROOT); assert.equal(loaded.ref.name, "reliability-completion"); assert.equal(loaded.ref.parent_ref, SKILL_ROOT); assert.equal(loaded.ref.source_sha256, "d41a123a4fa7c5aece7c1efece8fcc3be2040b272a5ab76f14622d3b17fc80af"); assert.equal(loaded.ref.source_size_bytes, 537); assert.equal(loaded.ref.wrapper_sha256, frozen.wrapper_sha256); assert.equal(loaded.ref.wrapper_size_bytes, frozen.wrapper_size_bytes);
	assert.match(loaded.wrapper, /^<skill name="reliability-completion" location=/); const alias = await loadExpected(PROJECT_ROOT, "fixtures\\skills\\v1"); assert.equal(alias.wrapper, loaded.wrapper); assert.deepEqual(alias.ref, loaded.ref);
});

test("V1-A Skill preflight rejects drift, duplicates, root/descendant links, hardlinks, escapes and relative resources", async () => {
	const drift = cloneSkillProject("skill-name-drift"); const skillPath = resolve(drift, "fixtures/skills/v1/reliability-completion/SKILL.md"); writeFileSync(skillPath, readFileSync(skillPath, "utf8").replace("name: reliability-completion", "name: other")); await assert.rejects(() => loadExpected(drift), /source drift/);
	const missingDescription = cloneSkillProject("skill-description"); const descPath = resolve(missingDescription, "fixtures/skills/v1/reliability-completion/SKILL.md"); writeFileSync(descPath, readFileSync(descPath, "utf8").replace(/^description:.*\r?\n/m, "")); await assert.rejects(() => loadExpected(missingDescription), /source drift/);
	const duplicate = cloneSkillProject("skill-duplicate"); cpSync(resolve(duplicate, "fixtures/skills/v1/reliability-completion"), resolve(duplicate, "fixtures/skills/v1/duplicate"), { recursive: true }); await assert.rejects(() => loadExpected(duplicate), /Exactly one Skill|diagnostics fail closed/);
	const relativeResource = cloneSkillProject("skill-resource"); const relPath = resolve(relativeResource, "fixtures/skills/v1/reliability-completion/SKILL.md"); writeFileSync(relPath, `${readFileSync(relPath, "utf8")}\nRead ./notes.md\n`); await assert.rejects(() => loadExpected(relativeResource), /source drift/);
	const hard = cloneSkillProject("skill-hardlink"); linkSync(resolve(hard, "fixtures/skills/v1/reliability-completion/SKILL.md"), resolve(hard, "fixtures/skills/v1/reliability-completion/copy.md")); await assert.rejects(() => loadExpected(hard), /hardlink/);
	const linked = cloneSkillProject("skill-child-link"); symlinkSync(resolve(linked, "fixtures/skills/v1/reliability-completion"), resolve(linked, "fixtures/skills/v1/reliability-completion/alias"), "junction"); await assert.rejects(() => loadExpected(linked), /link\/reparse/);
	const rootLink = caseRoot("skill-root-link"); mkdirSync(resolve(rootLink, "fixtures/skills"), { recursive: true }); symlinkSync(resolve(PROJECT_ROOT, "fixtures/skills/v1"), resolve(rootLink, "fixtures/skills/v1"), "junction"); await assert.rejects(() => loadExactOneSkillV1({ projectRoot: rootLink, skillRoot: SKILL_ROOT, expected: expectedSkillIdentityV1(rootLink) }), /root link\/reparse/);
	await assert.rejects(() => loadExactOneSkillV1({ projectRoot: PROJECT_ROOT, skillRoot: "../project2-reference", expected: expectedSkillIdentityV1(PROJECT_ROOT) }), /escapes root|parent\/root/);
	const base: Skill = { name: "x", description: "x", content: "x", filePath: "C:/tmp/CON/SKILL.md" }; assert.throws(() => assertNoSkillCollisionV1([base]), /alias/);
});

test("V1-A four-role executable Task pack calibrates by public command and external behavior", async () => {
	const tasks = loadCandidateTaskPackV1(PROJECT_ROOT); assert.deepEqual(tasks.map((task) => task.family), ["normal", "hidden_stronger", "public_check_dependent", "scope_guardrail"]);
	const calibration = await calibrateTaskPackV1(PROJECT_ROOT); assert.equal(calibration.length, 4); assert.ok(calibration.every((entry) => entry.unmodified_status === "failed" && entry.reference_public_exit === 0 && entry.reference_status === "passed" && entry.repeatable));
	for (const task of tasks) assert.equal(await verifierRejectsNonsolutionV1(PROJECT_ROOT, task), true);
	const scope = tasks[3]!; const root = caseRoot("protected-bypass"); cpSync(resolve(PROJECT_ROOT, scope.workspace_source_ref), root, { recursive: true }); const before = Object.fromEntries(scope.protected_paths.map((path) => [path, readFileSync(resolve(root, path), "utf8")])); writeFileSync(resolve(root, "package.json"), "{}"); assert.throws(() => assertTaskWorkspaceBoundaryV1(scope, before, root), /protected Task file changed/);
});

test("V1-A actual Faux provider payload proves A/B treatment delta and B/C equality", async () => {
	const { skill, wrapper } = await loadExpected(); const task = loadCandidateTaskPackV1(PROJECT_ROOT)[0]!; const prompt = readFileSync(resolve(PROJECT_ROOT, task.instruction_ref), "utf8"); const workspace = resolve(PROJECT_ROOT, task.workspace_source_ref);
	const [a, b, c] = await Promise.all(["baseline", "skill_only", "skill_plus_runtime_control"].map((strategyId) => runTreatmentProbeV1({ projectRoot: PROJECT_ROOT, workspaceRoot: workspace, strategyId: strategyId as "baseline" | "skill_only" | "skill_plus_runtime_control", taskPrompt: prompt, taskSpec: task, skill })));
	assert.deepEqual(payloadDeltaProofV1(a!, b!, c!, wrapper, prompt), { bc_byte_equal: true, ab_delta_only_wrapper: true, common_context_equal: true, actual_payloads: true });
	assert.deepEqual([a!.child_attempts, b!.child_attempts, c!.child_attempts], [0, 0, 1]); assert.deepEqual([a!.verifier_runs, b!.verifier_runs, c!.verifier_runs], [1, 1, 2]);
	assert.deepEqual(c!.event_order, ["initial_attempt_settled", "measurement_verifier_1_started", "measurement_verifier_1_completed", "child_attempt_settled", "measurement_verifier_2_started", "measurement_verifier_2_completed"]);
	assert.ok([a, b, c].every((probe) => probe!.initial_verifier_status === "failed" && probe!.external_provider_calls === 0 && !probe!.host_identity_leak));
});

test("V1-A recovery controller rejects every non-C or ineligible child counterexample", () => {
	const base = { strategy_id: "skill_plus_runtime_control" as const, verifier_status: "failed" as const, evidence_valid: true, budget_available: true, is_child: false, child_attempt_count: 0 };
	assert.equal(decideV1Intervention(base).decision, "create_child");
	for (const change of [{ strategy_id: "baseline" as const }, { strategy_id: "skill_only" as const }, { verifier_status: "passed" as const }, { verifier_status: "invalid" as const }, { verifier_status: "infrastructure_error" as const }, { verifier_status: "cancelled" as const }, { evidence_valid: false }, { budget_available: false }, { is_child: true }, { child_attempt_count: 1 }]) assert.equal(decideV1Intervention({ ...base, ...change }).decision, "stop");
});

test("V1-A immutable Manifest binds real digest domains and rejects placeholder, duplicate, missing and mixed-revision cells", () => {
	const generated = buildDeterministicManifestV1(PROJECT_ROOT); const tracked = JSON.parse(readFileSync(resolve(PROJECT_ROOT, "fixtures/manifests/v1/deterministic-experiment.json"), "utf8")) as ExperimentManifestV1;
	assert.deepEqual(tracked, generated); validateAtRoot(tracked); assert.equal(Object.keys(V1_MANIFEST_DIGEST_DOMAINS).length, 10);
	const runs = generated.members.map((member) => runFor(generated, member)); const treatment = runs[0]!; treatment.verifier_status = "invalid"; treatment.evidence.final_verifier_status = "invalid"; treatment.evidence.invalid_attribution = "treatment";
	const infrastructure = runs[1]!; infrastructure.verifier_status = "infrastructure_error"; infrastructure.evidence.final_verifier_status = "infrastructure_error"; infrastructure.evidence.invalid_attribution = "infrastructure"; infrastructure.evidence.exclusion_preauthorized = true;
	const before = JSON.stringify(runs); const result = aggregateAtRoot(generated, runs); assert.equal(JSON.stringify(runs), before);
	assert.deepEqual({ comparable: result.comparable_runs, excluded: result.excluded_infrastructure_runs, treatment: result.treatment_invalid_runs, passed: result.passed_runs }, { comparable: 23, excluded: 1, treatment: 1, passed: 22 });
	assert.throws(() => aggregateAtRoot(generated, runs.slice(1)), /Missing required Run/); assert.throws(() => aggregateAtRoot(generated, [...runs, runs[0]!]), /Duplicate Run/); assert.throws(() => aggregateAtRoot(generated, [{ ...runs[0]!, run_id: "undeclared" }, ...runs.slice(1)]), /not in immutable Manifest/);
	const placeholder = { ...generated, task_pack_digest: "0".repeat(64) }; placeholder.manifest_id = manifestIdentityV1(placeholder); assert.throws(() => validateAtRoot(placeholder), /placeholder/);
	const duplicate = structuredClone(generated); duplicate.members[1] = { ...duplicate.members[0]!, run_id: "other" }; duplicate.manifest_id = manifestIdentityV1(duplicate); assert.throws(() => validateAtRoot(duplicate), /Duplicate experiment cell|order slot/);
	const mixed = structuredClone(runs); mixed[0]!.manifest_id = "b".repeat(64); assert.throws(() => aggregateAtRoot(generated, mixed), /revision drift/);
});

test("V1-A aggregation keeps treatment invalid comparable, rejects caller-created pauses, and is read-only", () => {
	const manifest = buildDeterministicManifestV1(PROJECT_ROOT); const runs = manifest.members.map((member) => runFor(manifest, member)); const snapshot = structuredClone(runs); aggregateAtRoot(manifest, runs); assert.deepEqual(runs, snapshot);
	const paused = structuredClone(manifest); paused.members[0] = { ...paused.members[0]!, disposition: "preauthorized_paused_before_execution", pause_reason: "operator_declared_before_execution" }; paused.manifest_id = manifestIdentityV1(paused);
	assert.throws(() => validateAtRoot(paused), /Complete frozen Manifest/); assert.throws(() => aggregateAtRoot(paused, paused.members.slice(1).map((member) => runFor(paused, member))), /Complete frozen Manifest/);
	const untyped = structuredClone(paused) as ExperimentManifestV1; untyped.members[0]!.pause_reason = null; untyped.manifest_id = manifestIdentityV1(untyped); assert.throws(() => validateAtRoot(untyped), /not pre-authorized/);
	/* Typed pause support remains reachable only when it is part of the independently derived frozen Manifest. */
});

test("V1-A aggregation rejects illegal C lineage/status/budget and all non-C children", () => {
	const manifest = buildDeterministicManifestV1(PROJECT_ROOT); const baseRuns = manifest.members.map((member) => runFor(manifest, member)); const cIndex = baseRuns.findIndex((run) => run.strategy_id === "skill_plus_runtime_control"); const nonCIndex = baseRuns.findIndex((run) => run.strategy_id === "baseline");
	for (const mutate of [
		(run: RunResultV1) => { run.evidence.initial_verifier_status = "passed"; },
		(run: RunResultV1) => { run.evidence.initial_verifier_status = "invalid"; },
		(run: RunResultV1) => { run.evidence.initial_verifier_status = "cancelled"; },
		(run: RunResultV1) => { run.evidence.initial_verifier_status = "infrastructure_error"; },
		(run: RunResultV1) => { run.evidence.recovery_budget_available = false; },
		(run: RunResultV1) => { run.evidence.attempts[1]!.parent_attempt_id = "wrong"; },
	]) { const runs = structuredClone(baseRuns); mutate(runs[cIndex]!); assert.throws(() => aggregateAtRoot(manifest, runs), /Illegal child|Ineligible/); }
	const nonC = structuredClone(baseRuns); nonC[nonCIndex] = structuredClone(nonC[cIndex]!); Object.assign(nonC[nonCIndex]!, { ...manifest.members[nonCIndex], experiment_id: manifest.experiment_id, manifest_id: manifest.manifest_id }); assert.throws(() => aggregateAtRoot(manifest, nonC), /Non-C|bounded identity|Illegal child/);
	const missingChild = structuredClone(baseRuns); const c = missingChild[cIndex]!; c.attempt_count = 1; c.child_attempt_count = 0; c.evidence.attempts = [c.evidence.attempts[0]!]; c.evidence.recovery_started = false; assert.throws(() => aggregateAtRoot(manifest, missingChild), /Eligible C recovery missing/);
	const retry = structuredClone(baseRuns); (retry[cIndex] as unknown as { attempt_count: number }).attempt_count = 3; assert.throws(() => aggregateAtRoot(manifest, retry), /lineage/);
});

test("V1-A fixed provider gate rejects denied/missing/malformed/consumed authority before factory or runtime identity", async () => {
	assert.equal(DEEPSEEK_FIXED_PROFILE_V1.model, "deepseek-v4-flash"); assert.equal(DEEPSEEK_FIXED_PROFILE_V1.requires_v1b_preflight_revalidation, true); assert.deepEqual(FIXED_PROVIDER_ENVELOPE_V1, { provider_requests_max: 16, tool_calls_max: 24, token_limit: 131072, wall_time_ms_max: 900000, cost_usd_max: 0.2 });
	assert.deepEqual(dryRunFixedProviderV1(), { credential_reads: 0, network_calls: 0, provider_calls: 0, formal_runtime_identities: 0, profile: DEEPSEEK_FIXED_PROFILE_V1 }); let reads = 0, calls = 0, factories = 0;
	const resolver = { resolve: async () => { reads++; return "opaque-secret"; } }; const transport = { request: async ({ credential }: { credential: string }) => { calls++; assert.equal(credential, "opaque-secret"); return { text: "ok" }; } };
	const factory = { create: ({ request, runtime_identity }: { request: (prompt: string) => Promise<string>; runtime_identity: string }) => { factories++; assert.match(runtime_identity, /^v1-fixed-provider-runtime-/); return { prompt: request, close: async () => undefined }; } };
	for (const authority of [createOneUseProviderAuthorityV1({ authorized: false, resolver, transport }), createOneUseProviderAuthorityV1({ authorized: true, resolver }), createOneUseProviderAuthorityV1({ authorized: true, transport })]) assert.throws(() => createPublicPiCompositionSeamV1({ authority, factory }), /not authorized|dependencies missing/);
	assert.throws(() => createPublicPiCompositionSeamV1({ authority: {} as never, factory }), /Malformed/); assert.deepEqual([reads, calls, factories], [0, 0, 0]);
	const allowed = createOneUseProviderAuthorityV1({ authorized: true, resolver, transport }); const handle = createPublicPiCompositionSeamV1({ authority: allowed, factory }); assert.equal(await handle.prompt("x"), "ok"); await handle.close(); assert.throws(() => createPublicPiCompositionSeamV1({ authority: allowed, factory }), /reserved|consumed/); assert.deepEqual([reads, calls, factories], [1, 1, 1]);
	assert.deepEqual(projectFixedProviderUsageV1({ request_count: 1, input_tokens: 2, output_tokens: 3, cost_usd: 0.01 }).credential, []);
});

test("V1A-RR-001 complete frozen Manifest rejects membership and coherently rehashed binding drift", () => {
	const expected = buildDeterministicManifestV1(PROJECT_ROOT); const reject = (candidate: ExperimentManifestV1) => { candidate.manifest_id = manifestIdentityV1(candidate); assert.throws(() => validateAtRoot(candidate), /Manifest|membership|order slot/); };
	const empty = structuredClone(expected); empty.members = []; reject(empty);
	const short = structuredClone(expected); short.members.pop(); reject(short);
	const reordered = structuredClone(expected); reordered.members.reverse(); reject(reordered);
	const substituted = structuredClone(expected); substituted.members[0]!.run_id = "v1-substituted-run"; reject(substituted);
	const paused = structuredClone(expected); paused.members[0] = { ...paused.members[0]!, disposition: "preauthorized_paused_before_execution", pause_reason: "operator_declared_before_execution" }; reject(paused);
	for (const mutate of [
		(value: ExperimentManifestV1) => { value.skill_digest = "1".repeat(64); },
		(value: ExperimentManifestV1) => { value.model_profile_digest = "2".repeat(64); },
		(value: ExperimentManifestV1) => { value.base_prompt_digest = "3".repeat(64); },
		(value: ExperimentManifestV1) => { value.tool_profile_digest = "4".repeat(64); },
		(value: ExperimentManifestV1) => { value.workbench_tree_digest = "5".repeat(64); },
		(value: ExperimentManifestV1) => { value.task_digests["v1-parse-duration"] = "6".repeat(64); },
		(value: ExperimentManifestV1) => { value.strategy_digests.baseline = "7".repeat(64); },
		(value: ExperimentManifestV1) => { value.verifier_digests[Object.keys(value.verifier_digests)[0]!] = "8".repeat(64); },
	]) { const candidate = structuredClone(expected); mutate(candidate); reject(candidate); }
	const coherentlyRehashed = structuredClone(expected); coherentlyRehashed.skill_digest = "9".repeat(64); coherentlyRehashed.manifest_id = manifestIdentityV1(coherentlyRehashed);
	assert.throws(() => aggregateAtRoot(coherentlyRehashed, coherentlyRehashed.members.map((member) => runFor(coherentlyRehashed, member))), /Complete frozen Manifest/);
});

test("V1A-RR-002 frozen terminal status and attribution matrix accepts only protocol-authorized cells", () => {
	const manifest = buildDeterministicManifestV1(PROJECT_ROOT); const legal = manifest.members.map((member) => runFor(manifest, member));
	Object.assign(legal[0]!, { verifier_status: "failed" }); legal[0]!.evidence.final_verifier_status = "failed";
	Object.assign(legal[1]!, { verifier_status: "invalid" }); Object.assign(legal[1]!.evidence, { final_verifier_status: "invalid", invalid_attribution: "treatment" });
	Object.assign(legal[3]!, { verifier_status: "infrastructure_error" }); Object.assign(legal[3]!.evidence, { final_verifier_status: "infrastructure_error", invalid_attribution: "infrastructure", exclusion_preauthorized: true });
	Object.assign(legal[4]!, { verifier_status: "invalid" }); Object.assign(legal[4]!.evidence, { final_verifier_status: "invalid", invalid_attribution: "evidence", exclusion_preauthorized: true });
	const accepted = aggregateAtRoot(manifest, legal); assert.deepEqual({ comparable: accepted.comparable_runs, excluded: accepted.excluded_infrastructure_runs, treatment: accepted.treatment_invalid_runs, passed: accepted.passed_runs }, { comparable: 22, excluded: 2, treatment: 1, passed: 20 });
	for (const mutate of [
		(run: RunResultV1) => { run.verifier_status = "passed"; run.evidence.final_verifier_status = "passed"; run.evidence.invalid_attribution = "treatment"; },
		(run: RunResultV1) => { run.verifier_status = "passed"; run.evidence.final_verifier_status = "failed"; },
		(run: RunResultV1) => { run.verifier_status = "invalid"; run.evidence.final_verifier_status = "invalid"; run.evidence.invalid_attribution = "none"; },
		(run: RunResultV1) => { run.verifier_status = "infrastructure_error"; run.evidence.final_verifier_status = "infrastructure_error"; run.evidence.invalid_attribution = "infrastructure"; },
		(run: RunResultV1) => { run.verifier_status = "failed"; run.evidence.final_verifier_status = "failed"; run.evidence.invalid_attribution = "infrastructure"; run.evidence.exclusion_preauthorized = true; },
		(run: RunResultV1) => { run.verifier_status = "infrastructure_error"; run.evidence.final_verifier_status = "infrastructure_error"; run.evidence.invalid_attribution = "evidence"; run.evidence.exclusion_preauthorized = true; },
		(run: RunResultV1) => { run.verifier_status = "invalid"; run.evidence.final_verifier_status = "invalid"; run.evidence.invalid_attribution = "treatment"; run.evidence.exclusion_preauthorized = true; },
	]) { const runs = manifest.members.map((member) => runFor(manifest, member)); mutate(runs[0]!); assert.throws(() => aggregateAtRoot(manifest, runs), /status|attribution|exclusion/); }
});

test("V1A-RR-003 provider authority is atomically reserved before runtime factory composition", async () => {
	let reads = 0, calls = 0, factories = 0; const resolver = { resolve: async () => { reads++; return "opaque"; } }; const transport = { request: async () => { calls++; return { text: "ok" }; } };
	const factory = { create: ({ request }: { request: (prompt: string) => Promise<string> }) => { factories++; return { prompt: request, close: async () => undefined }; } };
	const authority = createOneUseProviderAuthorityV1({ authorized: true, resolver, transport }); const first = createPublicPiCompositionSeamV1({ authority, factory });
	assert.throws(() => createPublicPiCompositionSeamV1({ authority, factory }), /reserved|consumed/); assert.deepEqual([reads, calls, factories], [0, 0, 1]);
	assert.equal(await first.prompt("one"), "ok"); await assert.rejects(() => first.prompt("two"), /consumed/); assert.deepEqual([reads, calls, factories], [1, 1, 1]);
	let throwingFactories = 0; const throwingFactory = { create: () => { throwingFactories++; throw new Error("factory boom"); } }; const burned = createOneUseProviderAuthorityV1({ authorized: true, resolver, transport });
	assert.throws(() => createPublicPiCompositionSeamV1({ authority: burned, factory: throwingFactory }), /factory boom/); assert.throws(() => createPublicPiCompositionSeamV1({ authority: burned, factory: throwingFactory }), /reserved|consumed/); assert.equal(throwingFactories, 1); assert.deepEqual([reads, calls], [1, 1]);
});

test("V1A-RR-004 public-check-dependent task fails unmodified publicly while retaining stronger external acceptance", async () => {
	const task = loadCandidateTaskPackV1(PROJECT_ROOT).find((entry) => entry.family === "public_check_dependent")!; const calibration = (await calibrateTaskPackV1(PROJECT_ROOT)).find((entry) => entry.task_id === task.task_id)!;
	assert.notEqual(calibration.unmodified_public_exit, 0); assert.deepEqual({ reference_public_exit: calibration.reference_public_exit, reference_status: calibration.reference_status, repeatable: calibration.repeatable }, { reference_public_exit: 0, reference_status: "passed", repeatable: true });
	const publicCheck = readFileSync(resolve(PROJECT_ROOT, task.workspace_source_ref, "test/public.test.mjs"), "utf8"); assert.doesNotMatch(publicCheck, /cancelled|planned|V1_WORKSPACE/); assert.equal(await verifierRejectsNonsolutionV1(PROJECT_ROOT, task), true);
});

test("V1-A three frozen Strategy specs remain valid", () => {
	for (const path of ["baseline", "skill-only", "skill-runtime-control"]) { const value = JSON.parse(readFileSync(resolve(PROJECT_ROOT, `fixtures/strategies/v1/${path}.json`), "utf8")) as StrategySpecV1; assert.doesNotThrow(() => validateStrategySpecV1(value)); }
});
