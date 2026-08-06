import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import type { ExecutionManifestV2B } from "./contracts/v2b-types.ts";
import { inspectSequenceV2B, inspectStage1RunV2B } from "./inspect-v2b.ts";
import { createRealExecutionPortV2B } from "./pi/pi-run-handle-v2b.ts";
import { createOneRunProviderAuthorityV1B, type OpaqueCredentialResolverV1 } from "./provider/fixed-provider-v1.ts";
import { buildExecutionManifestV2B, executeStage1RunV2B, preflightExecutionManifestV2B, runNextSequenceV2B, V2B_STAGE1_SCENARIOS, type ObservedStage2IdentityV2B } from "./run-v2b.ts";

export async function runStage1V2B(options: {
	projectRoot: string;
	runRoot: string;
	runId: string;
	scenario: string;
}) {
	const scenario = V2B_STAGE1_SCENARIOS[options.scenario];
	if (!scenario) throw new Error(`unknown V2-B Stage 1 scenario: ${options.scenario}`);
	return await executeStage1RunV2B({
		projectRoot: resolve(options.projectRoot),
		runRoot: resolve(options.runRoot),
		runId: options.runId,
		scenario,
	});
}

export function inspectStage1V2B(options: { projectRoot: string; runRoot: string }) {
	return inspectStage1RunV2B({ projectRoot: resolve(options.projectRoot), runRoot: resolve(options.runRoot) });
}

export function readExecutionManifestV2B(path: string): ExecutionManifestV2B {
	return JSON.parse(readFileSync(resolve(path), "utf8")) as ExecutionManifestV2B;
}

export function buildStage2ManifestV2B(options: { projectRoot: string; sequenceId: string; executionBaselineCommit: string; executionBaselineTree: string }) {
	return buildExecutionManifestV2B({ ...options, projectRoot: resolve(options.projectRoot), stage: "stage2_real" });
}

export function preflightStage2V2B(options: { projectRoot: string; manifest: ExecutionManifestV2B; observedIdentity?: ObservedStage2IdentityV2B }) {
	return preflightExecutionManifestV2B({ projectRoot: resolve(options.projectRoot), manifest: options.manifest, ...(options.observedIdentity ? { observedIdentity: options.observedIdentity } : {}) });
}

export async function runNextStage2V2B(options: {
	projectRoot: string;
	sequenceRoot: string;
	manifest: ExecutionManifestV2B;
	credentialResolver: OpaqueCredentialResolverV1;
}) {
	return await runNextSequenceV2B({
		projectRoot: resolve(options.projectRoot), sequenceRoot: resolve(options.sequenceRoot), manifest: options.manifest,
		portFactory: {
			create: ({ runId, realCounters, onAttemptEvidence, onAttemptStarted }) => createRealExecutionPortV2B({
				runId,
				authority: createOneRunProviderAuthorityV1B({ authorized: true, resolver: options.credentialResolver }),
				realCounters,
				onAttemptEvidence,
				onAttemptStarted,
			}),
		},
	});
}

export function inspectStage2SequenceV2B(options: { projectRoot: string; sequenceRoot: string }) {
	return inspectSequenceV2B({ projectRoot: resolve(options.projectRoot), sequenceRoot: resolve(options.sequenceRoot) });
}
