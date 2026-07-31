import type {
	AttemptEvidenceValidationV0C,
	AttemptRecordV0C,
	RunBudgetV0C,
	RunEvidenceValidationV0C,
} from "../contracts/v0c-types.ts";
import type { ArtifactRefV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";
import { readJsonArtifact, validateArtifactRef } from "./artifacts.ts";
import { attemptDirectoryV0C } from "./terminal-policy-v0c.ts";
import { digestObject, stableJson } from "../hash.ts";

export interface AttemptValidationEvidenceV0C {
	validation: AttemptEvidenceValidationV0C;
	validationRef: ArtifactRefV0B;
}

export interface VerifierEvidenceV0C {
	verifier: VerifierResultV0B;
	resultRef: ArtifactRefV0B;
	outputRef: ArtifactRefV0B;
}

export interface RunValidationInputV0C {
	runRoot: string;
	runId: string;
	sessionId: string;
	workspaceId: string;
	attempts: AttemptRecordV0C[];
	attemptValidations: AttemptValidationEvidenceV0C[];
	verifiers: VerifierEvidenceV0C[];
	verifierId: string;
	verifierSha256: string;
	runBudget: RunBudgetV0C;
	recoverySlotsConsumed: 0 | 1;
	failurePacketId: string | null;
	packetFailure: string | null;
	expectedEvidencePaths: string[];
	terminalSuffix?: ["outcome_created", "run_terminal"];
	faultInjection?: "attempt_validation_relation" | "cumulative_budget" | "dynamic_plan";
	baseErrors?: string[];
}

function readbackMatches(
	runRoot: string,
	ref: ArtifactRefV0B,
	expected: unknown,
	label: string,
	errors: string[],
): void {
	errors.push(...validateArtifactRef(runRoot, ref).map((error) => `${label}: ${error}`));
	try {
		const readback = readJsonArtifact<unknown>(runRoot, ref.path);
		if (stableJson(readback) !== stableJson(expected)) errors.push(`${label} readback mismatch`);
	} catch {
		errors.push(`${label} readback is malformed or unreadable`);
	}
}

export function validateRunEvidenceV0C(input: RunValidationInputV0C): RunEvidenceValidationV0C {
	const errors: string[] = [...(input.baseErrors ?? [])];
	const attemptIds = input.attempts.map((attempt) => attempt.attempt_id);
	const validationIds = input.attemptValidations.map((evidence) => evidence.validation.attempt_id);
	const verifierAttemptIds = input.verifiers.map((evidence) => evidence.verifier.attempt_id);
	if (input.faultInjection === "attempt_validation_relation" && validationIds.length > 0) validationIds[0] = "mutated-attempt";
	if (input.attempts.length < 1 || input.attempts.length > 2 || new Set(attemptIds).size !== attemptIds.length) {
		errors.push("started Attempt count/identity is invalid");
	}
	if (input.attemptValidations.length !== input.attempts.length) {
		errors.push("Attempt-validation evidence count mismatch");
	}
	if (input.verifiers.length !== input.attempts.length) errors.push("Verifier evidence count mismatch");
	if (stableJson(validationIds) !== stableJson(attemptIds)) errors.push("Attempt-validation relation mismatch");
	if (stableJson(verifierAttemptIds) !== stableJson(attemptIds)) errors.push("Verifier/Attempt relation mismatch");
	for (const [index, attempt] of input.attempts.entries()) {
		if (
			attempt.run_id !== input.runId ||
			attempt.session_id !== input.sessionId ||
			attempt.workspace_id !== input.workspaceId ||
			attempt.ordinal !== index + 1
		) errors.push(`Attempt identity/ordinal mismatch at ${attempt.attempt_id}`);
		if (index === 0 && (attempt.parent_attempt_id !== null || attempt.failure_packet_id !== null)) {
			errors.push("initial Attempt lineage is invalid");
		}
		if (index === 1) {
			const parent = input.attempts[0];
			if (!parent || attempt.parent_attempt_id !== parent.attempt_id || attempt.failure_packet_id !== input.failurePacketId) {
				errors.push("child Attempt/Packet lineage is invalid");
			}
		}
		const attemptRoot = attemptDirectoryV0C(attempt);
		const validationEvidence = input.attemptValidations[index];
		if (validationEvidence) {
			const expectedPath = `${attemptRoot}/validation.json`;
			if (validationEvidence.validationRef.path !== expectedPath) {
				errors.push(`Attempt validation ArtifactRef path mismatch at ${attempt.attempt_id}`);
			}
			if (
				validationEvidence.validation.run_id !== input.runId ||
				validationEvidence.validation.attempt_id !== attempt.attempt_id
			) {
				errors.push(`Attempt validation identity mismatch at ${attempt.attempt_id}`);
			}
			readbackMatches(
				input.runRoot,
				validationEvidence.validationRef,
				validationEvidence.validation,
				`Attempt validation ${attempt.attempt_id}`,
				errors,
			);
		}
		const verifierEvidence = input.verifiers[index];
		if (verifierEvidence) {
			const expectedResultPath = `${attemptRoot}/verifier-result.json`;
			const expectedOutputPath = `${attemptRoot}/verifier-output.txt`;
			if (verifierEvidence.resultRef.path !== expectedResultPath) {
				errors.push(`Verifier result ArtifactRef path mismatch at ${attempt.attempt_id}`);
			}
			if (
				verifierEvidence.outputRef.path !== expectedOutputPath ||
				verifierEvidence.verifier.full_output_ref.path !== expectedOutputPath
			) {
				errors.push(`Verifier output ArtifactRef path mismatch at ${attempt.attempt_id}`);
			}
			if (stableJson(verifierEvidence.outputRef) !== stableJson(verifierEvidence.verifier.full_output_ref)) {
				errors.push(`Verifier output ArtifactRef relationship mismatch at ${attempt.attempt_id}`);
			}
			if (verifierEvidence.verifier.attempt_id !== attempt.attempt_id) {
				errors.push(`Verifier Attempt relationship mismatch at ${attempt.attempt_id}`);
			}
			if (
				verifierEvidence.verifier.verifier_id !== input.verifierId ||
				verifierEvidence.verifier.verifier_sha256 !== input.verifierSha256
			) {
				errors.push(`Verifier frozen identity/digest mismatch at ${attempt.attempt_id}`);
			}
			readbackMatches(
				input.runRoot,
				verifierEvidence.resultRef,
				verifierEvidence.verifier,
				`Verifier result ${attempt.attempt_id}`,
				errors,
			);
			errors.push(
				...validateArtifactRef(input.runRoot, verifierEvidence.outputRef)
					.map((error) => `Verifier output ${attempt.attempt_id}: ${error}`),
			);
		}
	}
	const summed = {
		provider_requests: input.attempts.reduce((sum, attempt) => sum + attempt.budget_usage.provider_request_usage, 0),
		tool_calls: input.attempts.reduce((sum, attempt) => sum + attempt.budget_usage.tool_call_usage, 0),
		verifier_runs: input.attempts.reduce((sum, attempt) => sum + attempt.budget_usage.verifier_runs_usage, 0),
		external_provider_calls: input.attempts.reduce((sum, attempt) => sum + attempt.budget_usage.external_provider_calls, 0),
		cost_usd: input.attempts.reduce((sum, attempt) => sum + attempt.budget_usage.cost_usage_usd, 0),
	};
	if (input.faultInjection === "cumulative_budget") summed.tool_calls += 1;
	if (
		summed.provider_requests !== input.runBudget.provider_request_usage ||
		summed.tool_calls !== input.runBudget.tool_call_usage ||
		summed.verifier_runs !== input.runBudget.verifier_usage
		|| summed.external_provider_calls !== input.runBudget.external_provider_calls
		|| summed.cost_usd !== input.runBudget.cost_usage_usd
	) errors.push("cumulative Run budget does not equal Attempt usage");
	if (input.recoverySlotsConsumed === 0 && input.attempts.length === 2) errors.push("child Attempt exists without a consumed Recovery slot");
	if (input.recoverySlotsConsumed === 1 && input.attempts.length === 1 && !input.packetFailure) {
		errors.push("Recovery slot consumed without child or bounded Packet failure");
	}
	const expectedEvidencePaths = [...input.expectedEvidencePaths].sort();
	if (new Set(expectedEvidencePaths).size !== expectedEvidencePaths.length) errors.push("dynamic terminal plan contains duplicate path");
	if (input.faultInjection === "dynamic_plan") {
		expectedEvidencePaths.push("unexpected/mutated-plan.json");
		errors.push("dynamic terminal plan mismatch");
	}
	const terminalSuffix = input.terminalSuffix ?? ["outcome_created", "run_terminal"];
	if (stableJson(terminalSuffix) !== stableJson(["outcome_created", "run_terminal"])) errors.push("terminal suffix plan is invalid");
	if (input.packetFailure) errors.push(`Failure Packet invalid: ${input.packetFailure}`);
	const terminalPlanDigest = digestObject({
		expected_evidence_paths: expectedEvidencePaths,
		terminal_suffix: terminalSuffix,
		attempt_ids: attemptIds,
		recovery_slots_consumed: input.recoverySlotsConsumed,
	});
	return {
		schema_version: 1,
		run_id: input.runId,
		valid: errors.length === 0,
		errors,
		attempt_count: input.attempts.length as 1 | 2,
		attempt_validation_count: input.attemptValidations.length as 1 | 2,
		verifier_count: verifierAttemptIds.length as 1 | 2,
		recovery_slots_consumed: input.recoverySlotsConsumed,
		attempt_ids: attemptIds,
		attempt_validation_ids: validationIds,
		verifier_attempt_ids: verifierAttemptIds,
		cumulative_budget: summed,
		expected_evidence_paths: expectedEvidencePaths,
		terminal_suffix: terminalSuffix,
		terminal_plan_digest: terminalPlanDigest,
	};
}
