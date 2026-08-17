import { resolve } from "node:path";
import type { BoundedProposalPortV3 } from "../refinement/producer-v3.ts";
import type { CandidateResultV37 } from "../contracts/v37-types.ts";
import { sha256, stableJson } from "../hash.ts";
import { inspectRegisteredRecoveryAdmissionV37 } from "../inspect-v37g1.ts";
import { createBoundedModelBackedProducerV3 } from "../refinement/producer-v3.ts";
import { inspectStateStoreV3 } from "../state/store-v3.ts";
import { loadWorkflowRegistrationV37 } from "./workflow-registration-v37.ts";

export async function producePromptCandidateV37(options: {
	projectRoot: string;
	dataRoot: string;
	workflowId: string;
	runRoot: string;
	confirmedAt: string;
	requestedAt: string;
	immutableBasePrompt: string;
	port: BoundedProposalPortV3;
}): Promise<CandidateResultV37> {
	const inspectedAdmission = inspectRegisteredRecoveryAdmissionV37(options);
	if (!inspectedAdmission.integrity_valid || !inspectedAdmission.admission || inspectedAdmission.admission.result !== "admitted" || !inspectedAdmission.admission.opportunity) throw new Error(`V3.7 admission rejected: ${inspectedAdmission.errors.join("; ")}`);
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const manifest = registered.loadedCase.manifest;
	if (inspectedAdmission.admission.workflow_id !== registered.workflow.workflow_id || inspectedAdmission.admission.workflow_registration_digest !== registered.workflow.workflow_registration_digest || inspectedAdmission.admission.evidence_body_digest !== inspectedAdmission.admission.opportunity.evidence_identity.evidence_digest) throw new Error("Candidate admission/workflow/evidence lineage mismatch");
	const runtimeBody = manifest.runtime_base_prompt_spec.body;
	if (runtimeBody.prompt !== options.immutableBasePrompt || sha256(options.immutableBasePrompt) !== manifest.state_store_scope_spec.runtime_base_prompt_digest) throw new Error("Candidate runtime Base Prompt/State scope mismatch");
	const stateRoot = resolve(options.projectRoot, manifest.state_store_scope_spec.configured_location);
	const state = await inspectStateStoreV3({ stateRoot, expectedProjectId: manifest.project_id, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest });
	if (!state.integrity_valid || !state.active) throw new Error(`Candidate State Store inspection failed: ${state.errors.join("; ")}`);
	if (state.versions.find((version) => version.state_version === 0)?.state_digest !== manifest.state_store_scope_spec.initial_state_digest) throw new Error("Candidate State Store initial lineage scope mismatch");
	const producer = createBoundedModelBackedProducerV3({ port: options.port });
	const candidate = await producer(inspectedAdmission.admission.opportunity, state.active.state_digest);
	const policy = manifest.candidate_policy_spec.body;
	if (candidate.expected_base_state_digest !== state.active.state_digest) throw new Error("Candidate expected Base is stale");
	if (candidate.edits.length !== 1 || candidate.edits[0]?.kind !== "prompt_addendum") throw new Error("V3.7 Candidate must contain exactly one prompt_addendum");
	if (stableJson(candidate.lesson.applicability) !== stableJson(manifest.state_applicability) || stableJson(candidate.edits[0].applicability) !== stableJson(manifest.state_applicability)) throw new Error("Candidate applicability differs from registered State scope applicability");
	if (Buffer.byteLength(candidate.edits[0].content, "utf8") > policy.max_prompt_bytes) throw new Error("Candidate prompt exceeds registered content bound");
	const normalized = stableJson(candidate).toLowerCase();
	for (const indicator of policy.leakage_indicators) if (normalized.includes(indicator.toLowerCase())) throw new Error(`Candidate task-answer/authority leakage indicator rejected: ${indicator}`);
	return { candidate, workflow_id: registered.workflow.workflow_id, state_store_scope_digest: manifest.state_store_scope_spec.state_store_scope_digest, active_state_digest: state.active.state_digest };
}
