import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ExecutionManifestV1B } from "./contracts/v1-types.ts";
import { validateExecutionManifestV1B } from "./experiment/v1.ts";
import { aggregatePilotV1B, inspectV1RunCell } from "./inspect-v1.ts";
import { initializePilotV1B, loadPilotStateV1B, runNextPilotCellV1B } from "./pilot-v1.ts";
import type { ExecutionCellV1B } from "./contracts/v1-types.ts";
import type { OneRunProviderAuthorityV1B } from "./provider/fixed-provider-v1.ts";

export const V1B_STAGE1_MANIFEST_PATH = "fixtures/manifests/v1/v1b-stage1-execution.json";

function loadManifest(projectRoot: string, manifestPath = V1B_STAGE1_MANIFEST_PATH): ExecutionManifestV1B {
	const manifest = JSON.parse(readFileSync(resolve(projectRoot, manifestPath), "utf8")) as ExecutionManifestV1B;
	validateExecutionManifestV1B(manifest, projectRoot);
	return manifest;
}

export function preflightV1B(options: { projectRoot: string; manifestPath?: string; pilotRoot: string }): {
	status: "ready";
	manifest_id: string;
	next_cell_id: string | null;
	real_call_counters: { credential_reads: 0; network_calls: 0; provider_calls: 0; model_calls: 0 };
} {
	const manifest = loadManifest(options.projectRoot, options.manifestPath);
	const next = existsSync(options.pilotRoot) ? loadPilotStateV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot }).next_cell : manifest.cells[0]!;
	return { status: "ready", manifest_id: manifest.manifest_id, next_cell_id: next?.cell_id ?? null, real_call_counters: { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 } };
}

export async function runNextV1B(options: { projectRoot: string; manifestPath?: string; pilotRoot: string; realExecution?: { createAuthority(cell: ExecutionCellV1B): OneRunProviderAuthorityV1B } }) {
	if (!existsSync(options.pilotRoot)) initializePilotV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, manifest: loadManifest(options.projectRoot, options.manifestPath) });
	return await runNextPilotCellV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, ...(options.realExecution ? { realExecution: options.realExecution } : {}) });
}

export function inspectV1B(options: { projectRoot: string; pilotRoot: string; plannedRunId: string }) {
	return inspectV1RunCell(options);
}

export function aggregateV1B(options: { projectRoot: string; pilotRoot: string }) {
	return aggregatePilotV1B(options);
}
