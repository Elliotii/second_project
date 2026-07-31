import { randomUUID } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	FailurePacketAgentProjectionV0C,
	FailurePacketV0C,
	RunBudgetV0C,
	TaskSpecV0C,
} from "../contracts/v0c-types.ts";
import type { ArtifactRefV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";
import { artifactRef, validateArtifactRef, writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { scanPreterminalEvidenceV0B } from "../evidence/secret-scan.ts";
import { sha256, stableJson } from "../hash.ts";

export const FAILURE_PACKET_LIMITS_V0C = {
	projectionBytes: 8192,
	summaryCharacters: 2000,
	failedChecks: 32,
	failedCheckCharacters: 256,
} as const;

export function publicFailedChecksV0C(verifier: VerifierResultV0B): string[] {
	if (verifier.status !== "failed") return [];
	return (verifier.public_failed_checks ?? [verifier.summary]).map((entry) =>
		entry.slice(0, FAILURE_PACKET_LIMITS_V0C.failedCheckCharacters),
	);
}

export function buildFailurePacketV0C(options: {
	runRoot: string;
	runId: string;
	parentAttemptId: string;
	task: TaskSpecV0C;
	verifier: VerifierResultV0B;
	verifierResultRef: ArtifactRefV0B;
	workspaceDigest: string;
	budget: RunBudgetV0C;
	faultInjection?: "oversized" | "digest_mismatch" | "visibility_mismatch" | "shared_secret";
}): { packet: FailurePacketV0C; projection: FailurePacketAgentProjectionV0C } {
	if (options.task.acceptance_visibility !== "public_external" || !options.task.agent_feedback_schema) {
		throw new Error("automatic recovery requires public_external acceptance and an explicit feedback schema");
	}
	if (options.verifier.status !== "failed") throw new Error("Failure Packet requires a valid failed Verifier");
	const summary =
		options.faultInjection === "oversized"
			? "x".repeat(FAILURE_PACKET_LIMITS_V0C.summaryCharacters + 1)
			: options.faultInjection === "shared_secret"
				? "Bearer ABCDEFGH12345678"
			: options.verifier.summary.slice(0, FAILURE_PACKET_LIMITS_V0C.summaryCharacters);
	const checks = publicFailedChecksV0C(options.verifier);
	const projection: FailurePacketAgentProjectionV0C = {
		type: "verifier_failure",
		parent_attempt_id: options.parentAttemptId,
		verifier_id: options.verifier.verifier_id,
		failure_summary: summary,
		failed_checks: checks,
		instruction: "repair_the_task_then_finish",
	};
	validateFailureProjectionV0C(projection);
	const projectionBytes = `${stableJson(projection)}\n`;
	const projectionRef: ArtifactRefV0B = {
		path: "recovery/failure-packet-agent-projection.json",
		sha256: sha256(projectionBytes),
		size_bytes: Buffer.byteLength(projectionBytes),
		media_type: "application/json",
		truncated: false,
	};
	const packet: FailurePacketV0C = {
		schema_version: 1,
		failure_packet_id: `failure-packet-${randomUUID()}`,
		run_id: options.runId,
		parent_attempt_id: options.parentAttemptId,
		verifier_id: options.verifier.verifier_id,
		verifier_sha256: options.verifier.verifier_sha256,
		verifier_result_ref: options.verifierResultRef,
		verifier_result_sha256: options.verifierResultRef.sha256,
		failure_summary: summary,
		failed_checks: checks,
		workspace_digest: options.workspaceDigest,
		budget_remaining: {
			provider_requests: options.budget.provider_request_limit - options.budget.provider_request_usage,
			tool_calls: options.budget.tool_call_limit - options.budget.tool_call_usage,
			agent_wall_time_ms: 120000,
			verifier_runs: options.budget.verifier_limit - options.budget.verifier_usage,
			verifier_wall_time_ms: 30000,
			finalization_wall_time_ms: options.budget.finalization_wall_time_reserve_ms,
		},
		agent_projection_ref: projectionRef,
		agent_projection_sha256:
			options.faultInjection === "digest_mismatch" ? "0".repeat(64) : sha256(projectionBytes),
		created_at: new Date().toISOString(),
	};
	if (options.faultInjection === "visibility_mismatch") {
		throw new Error("Failure Packet visibility mismatch");
	}
	validateFailurePacketV0C(packet, projectionBytes);
	const projectionPath = writeOnceBytes(options.runRoot, projectionRef.path, projectionBytes);
	const persistedRef = artifactRef(options.runRoot, projectionPath, "application/json", false);
	if (stableJson(persistedRef) !== stableJson(projectionRef)) throw new Error("Failure Packet projection persistence mismatch");
	return { packet, projection };
}

export function scanFailurePacketForChildV0C(options: {
	runRoot: string;
	packet: FailurePacketV0C;
	packetRef: ArtifactRefV0B;
	projectionRef: ArtifactRefV0B;
	faultInjection?: "scanner_error" | "post_scan_mutation";
}): ArtifactRefV0B {
	const beforeErrors = [
		...validateArtifactRef(options.runRoot, options.packetRef),
		...validateArtifactRef(options.runRoot, options.projectionRef),
	];
	if (beforeErrors.length > 0) throw new Error(`Failure Packet pre-child ArtifactRef invalid: ${beforeErrors.join("; ")}`);
	validateFailurePacketV0C(
		options.packet,
		readFileSync(resolve(options.runRoot, options.projectionRef.path), "utf8"),
	);
	const scan = scanPreterminalEvidenceV0B({
		files: [
			{ scope_label: "failure_packet_prechild", path: resolve(options.runRoot, options.packetRef.path) },
			{ scope_label: "failure_packet_agent_projection_prechild", path: resolve(options.runRoot, options.projectionRef.path) },
		],
		objects: [],
		faultInjection: options.faultInjection === "scanner_error" ? "scanner_error" : undefined,
	});
	const scanRef = writeOnceJson(options.runRoot, "recovery/failure-packet-scan.json", scan);
	if (options.faultInjection === "post_scan_mutation") {
		appendFileSync(resolve(options.runRoot, options.projectionRef.path), "\n", "utf8");
	}
	const afterErrors = [
		...validateArtifactRef(options.runRoot, options.packetRef),
		...validateArtifactRef(options.runRoot, options.projectionRef),
		...validateArtifactRef(options.runRoot, scanRef),
	];
	if (afterErrors.length > 0) throw new Error(`Failure Packet post-scan ArtifactRef invalid: ${afterErrors.join("; ")}`);
	if (scan.status !== "passed" || scan.match_count !== 0) throw new Error("Failure Packet pre-child shared scan rejected");
	return scanRef;
}

export function validateFailureProjectionV0C(projection: FailurePacketAgentProjectionV0C): void {
	if ([...projection.failure_summary].length > FAILURE_PACKET_LIMITS_V0C.summaryCharacters) {
		throw new Error("Failure Packet summary exceeds character limit");
	}
	if (projection.failed_checks.length > FAILURE_PACKET_LIMITS_V0C.failedChecks) {
		throw new Error("Failure Packet has too many failed checks");
	}
	if (projection.failed_checks.some((entry) => [...entry].length > FAILURE_PACKET_LIMITS_V0C.failedCheckCharacters)) {
		throw new Error("Failure Packet failed check exceeds character limit");
	}
	if (Buffer.byteLength(stableJson(projection), "utf8") > FAILURE_PACKET_LIMITS_V0C.projectionBytes) {
		throw new Error("Failure Packet projection exceeds byte limit");
	}
	const serialized = stableJson(projection);
	if (/authorization|api[_-]?key|reasoning|thinkingSignature|thoughtSignature/i.test(serialized)) {
		throw new Error("Failure Packet projection contains protected material");
	}
}

export function validateFailurePacketV0C(packet: FailurePacketV0C, projectionBytes: string): void {
	if ("child_attempt_id" in (packet as unknown as Record<string, unknown>)) {
		throw new Error("Failure Packet cannot contain child_attempt_id");
	}
	if (packet.agent_projection_sha256 !== sha256(projectionBytes)) throw new Error("Failure Packet projection digest mismatch");
	if (packet.verifier_result_ref.sha256 !== packet.verifier_result_sha256) {
		throw new Error("Failure Packet Verifier digest mismatch");
	}
}
