import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ExecutionManifestV1B, ReplacementSequenceAuthorityV1B, ReplacementSequenceRuntimeStateV1B } from "./contracts/v1-types.ts";
import { validateExecutionManifestV1B, validateReplacementSequenceAuthorityV1B, validateReplacementSequenceStateV1B } from "./experiment/v1.ts";
import { aggregatePilotV1B, inspectV1RunCell } from "./inspect-v1.ts";
import { initializePilotV1B, loadPilotStateV1B, runNextPilotCellV1B } from "./pilot-v1.ts";
import type { ExecutionCellV1B } from "./contracts/v1-types.ts";
import { createOneRunProviderAuthorityV1B, FixedProviderBoundaryErrorV1B, type OpaqueCredentialResolverV1, type OneRunProviderAuthorityV1B } from "./provider/fixed-provider-v1.ts";
import { sha256, stableJson } from "./hash.ts";

export const V1B_STAGE1_MANIFEST_PATH = "fixtures/manifests/v1/v1b-stage1-execution.json";

export interface Stage2ExecutionAuthorityInputV1B {
	authority_id: "v1b-public-pi-one-run";
	credential_profile_name: "DEEPSEEK_API_KEY";
	authorized: boolean;
	resolver?: OpaqueCredentialResolverV1;
}

function loadManifest(projectRoot: string, manifestPath = V1B_STAGE1_MANIFEST_PATH): ExecutionManifestV1B {
	const manifest = JSON.parse(readFileSync(resolve(projectRoot, manifestPath), "utf8")) as ExecutionManifestV1B;
	validateExecutionManifestV1B(manifest, projectRoot);
	return manifest;
}

type ReplacementSequenceEventV1B =
	| { schema_version: 1; seq: number; type: "replacement_pilot_claimed"; sequence_id: string; replacement_manifest_id: string; pilot_root_sha256: string }
	| { schema_version: 1; seq: number; type: "initial_run_started"; sequence_id: string; run_id: string }
	| { schema_version: 1; seq: number; type: "child_attempt_started"; sequence_id: string; run_id: string; attempt_id: string };

export interface ReplacementSequenceCoordinatorV1B {
	assertCurrent(): void;
	beforeInitialStart(runId: string): void;
	beforeChildStart(runId: string, attemptId: string): void;
}

function loadReplacementSequenceAuthority(path: string, manifest: ExecutionManifestV1B): ReplacementSequenceAuthorityV1B {
	const authority = JSON.parse(readFileSync(path, "utf8")) as ReplacementSequenceAuthorityV1B;
	validateReplacementSequenceAuthorityV1B(manifest, authority);
	return authority;
}

function sequenceRuntimeState(authority: ReplacementSequenceAuthorityV1B, events: readonly ReplacementSequenceEventV1B[], pilotRootSha256: string): ReplacementSequenceRuntimeStateV1B {
	if (events.length === 0 || events[0]?.type !== "replacement_pilot_claimed" || events.filter((event) => event.type === "replacement_pilot_claimed").length !== 1) throw new Error("V1-B replacement sequence claim missing/duplicated/reordered");
	if (events.some((event, index) => event.seq !== index + 1 || event.schema_version !== 1 || event.sequence_id !== authority.sequence_id || event.type === "replacement_pilot_claimed" && (event.replacement_manifest_id !== authority.replacement_manifest_id || event.pilot_root_sha256 !== pilotRootSha256))) throw new Error("V1-B replacement sequence journal identity/order drift");
	const starts = events.filter((event): event is Extract<ReplacementSequenceEventV1B, { type: "initial_run_started" }> => event.type === "initial_run_started").map((event) => event.run_id);
	const children = events.filter((event): event is Extract<ReplacementSequenceEventV1B, { type: "child_attempt_started" }> => event.type === "child_attempt_started");
	if (new Set(children.map((event) => event.attempt_id)).size !== children.length || children.some((event) => !starts.includes(event.run_id))) throw new Error("V1-B replacement sequence child identity drift");
	return { predecessor_manifest_id: authority.predecessor_manifest_id, predecessor_started_run_ids: authority.predecessor_started_run_ids, replacement_started_run_ids: starts, replacement_child_attempts: children.length, retry_same_run: authority.retry_same_run, fallback: authority.fallback, automatic_replacement: authority.automatic_replacement };
}

export function createReplacementSequenceCoordinatorV1B(options: { projectRoot: string; pilotRoot: string; manifest: ExecutionManifestV1B; authorityPath: string; claimIfMissing: boolean }): ReplacementSequenceCoordinatorV1B {
	const authority = loadReplacementSequenceAuthority(options.authorityPath, options.manifest);
	const claimRoot = resolve(options.projectRoot, ".runs/v1-b/replacement-sequence-claims");
	const claimPath = resolve(claimRoot, `${options.manifest.manifest_id}.jsonl`);
	const pilotRootSha256 = sha256(resolve(options.pilotRoot));
	if (!existsSync(claimPath)) {
		if (!options.claimIfMissing) return { assertCurrent: () => validateReplacementSequenceStateV1B(options.manifest, { predecessor_manifest_id: authority.predecessor_manifest_id, predecessor_started_run_ids: authority.predecessor_started_run_ids, replacement_started_run_ids: [], replacement_child_attempts: 0, retry_same_run: false, fallback: false, automatic_replacement: false }), beforeInitialStart: () => { throw new Error("V1-B replacement sequence is not claimed"); }, beforeChildStart: () => { throw new Error("V1-B replacement sequence is not claimed"); } };
		mkdirSync(claimRoot, { recursive: true });
		const first: ReplacementSequenceEventV1B = { schema_version: 1, seq: 1, type: "replacement_pilot_claimed", sequence_id: authority.sequence_id, replacement_manifest_id: authority.replacement_manifest_id, pilot_root_sha256: pilotRootSha256 };
		try { const handle = openSync(claimPath, "wx"); writeFileSync(handle, `${stableJson(first)}\n`, "utf8"); closeSync(handle); } catch { /* A concurrent claimant is validated below and fails closed if different. */ }
	}
	const readEvents = (): ReplacementSequenceEventV1B[] => readFileSync(claimPath, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as ReplacementSequenceEventV1B);
	const validate = (): ReplacementSequenceEventV1B[] => { const events = readEvents(); validateReplacementSequenceStateV1B(options.manifest, sequenceRuntimeState(authority, events, pilotRootSha256)); return events; };
	type AppendSequenceEventV1B = { type: "initial_run_started"; run_id: string } | { type: "child_attempt_started"; run_id: string; attempt_id: string };
	const append = (event: AppendSequenceEventV1B): void => {
		const events = validate();
		const next = { schema_version: 1, seq: events.length + 1, sequence_id: authority.sequence_id, ...event } as ReplacementSequenceEventV1B;
		const predicted = [...events, next];
		validateReplacementSequenceStateV1B(options.manifest, sequenceRuntimeState(authority, predicted, pilotRootSha256));
		appendFileSync(claimPath, `${stableJson(next)}\n`, "utf8");
	};
	return {
		assertCurrent: () => { validate(); },
		beforeInitialStart: (runId) => append({ type: "initial_run_started", run_id: runId }),
		beforeChildStart: (runId, attemptId) => append({ type: "child_attempt_started", run_id: runId, attempt_id: attemptId }),
	};
}

function replacementSequenceFor(options: { projectRoot: string; pilotRoot: string; manifest: ExecutionManifestV1B; replacementSequenceStatePath?: string }, claimIfMissing: boolean): ReplacementSequenceCoordinatorV1B | undefined {
	if (options.manifest.experiment_revision !== 2) {
		if (options.replacementSequenceStatePath) throw new Error("V1-B revision 1 rejects replacement sequence authority");
		return undefined;
	}
	if (!options.replacementSequenceStatePath) throw new Error("V1-B replacement sequence authority is required");
	return createReplacementSequenceCoordinatorV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, manifest: options.manifest, authorityPath: options.replacementSequenceStatePath, claimIfMissing });
}

export function preflightV1B(options: { projectRoot: string; manifestPath?: string; pilotRoot: string; replacementSequenceStatePath?: string }): {
	status: "ready";
	manifest_id: string;
	next_cell_id: string | null;
	real_call_counters: { credential_reads: 0; network_calls: 0; provider_calls: 0; model_calls: 0 };
} {
	const manifest = loadManifest(options.projectRoot, options.manifestPath);
	replacementSequenceFor({ ...options, manifest }, false)?.assertCurrent();
	const next = existsSync(options.pilotRoot) ? loadPilotStateV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot }).next_cell : manifest.cells[0]!;
	return { status: "ready", manifest_id: manifest.manifest_id, next_cell_id: next?.cell_id ?? null, real_call_counters: { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 } };
}

export function createTrackedRealCompositionV1B(input: Stage2ExecutionAuthorityInputV1B): { createAuthority(cell: ExecutionCellV1B): OneRunProviderAuthorityV1B } {
	return {
		createAuthority: () => createOneRunProviderAuthorityV1B({ authorized: input.authorized, ...(input.resolver ? { resolver: input.resolver } : {}) }),
	};
}

export async function runNextV1B(options: { projectRoot: string; manifestPath?: string; pilotRoot: string; replacementSequenceStatePath?: string; stage2ExecutionAuthority?: Stage2ExecutionAuthorityInputV1B }) {
	const existing = existsSync(options.pilotRoot) ? loadPilotStateV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot }) : null;
	const manifest = existing?.manifest ?? loadManifest(options.projectRoot, options.manifestPath);
	replacementSequenceFor({ ...options, manifest }, false)?.assertCurrent();
	if (manifest.execution_mode === "stage1_zero_call" && options.stage2ExecutionAuthority) throw new FixedProviderBoundaryErrorV1B();
	if (manifest.execution_mode === "stage2_real" && !options.stage2ExecutionAuthority) throw new FixedProviderBoundaryErrorV1B();
	const input = options.stage2ExecutionAuthority;
	if (input && (input.authority_id !== "v1b-public-pi-one-run" || input.credential_profile_name !== manifest.credential_profile_name || manifest.schema_version === "v1c-execution-manifest-v1" && (input.authorized !== true || !input.resolver))) throw new FixedProviderBoundaryErrorV1B();
	const replacementSequence = replacementSequenceFor({ ...options, manifest }, true);
	replacementSequence?.assertCurrent();
	if (!existing) initializePilotV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, manifest });
	return await runNextPilotCellV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, ...(replacementSequence ? { replacementSequence } : {}), ...(input ? { realExecution: createTrackedRealCompositionV1B(input) } : {}) });
}

export function inspectV1B(options: { projectRoot: string; pilotRoot: string; plannedRunId: string }) {
	return inspectV1RunCell(options);
}

export function aggregateV1B(options: { projectRoot: string; pilotRoot: string }) {
	return aggregatePilotV1B(options);
}
