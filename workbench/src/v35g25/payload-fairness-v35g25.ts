import type { Goal2FirstProviderPayloadEvidenceV35 } from "../contracts/v35g2-types.ts";
import { digestObject } from "../hash.ts";

export interface Goal25PayloadFairnessV35 {
	schema_version: 1;
	base_normalized_payload_sha256: string;
	candidate_normalized_payload_sha256: string;
	base_tool_interface_sha256: string;
	candidate_tool_interface_sha256: string;
	tool_interface_sha256: string;
	equal_outside_frozen_skill_treatment: boolean;
	fairness_digest: string;
}

export function compareGoal25FirstProviderPayloadsV35(
	base: Goal2FirstProviderPayloadEvidenceV35,
	candidate: Goal2FirstProviderPayloadEvidenceV35,
): Goal25PayloadFairnessV35 {
	const equal =
		base.normalized_payload_sha256 === candidate.normalized_payload_sha256 &&
		base.tools_sha256 === candidate.tools_sha256 &&
		base.system_messages_sha256 === candidate.system_messages_sha256 &&
		base.model_sha256 === candidate.model_sha256 &&
		base.request_fields_sha256 === candidate.request_fields_sha256 &&
		base.payload_top_level_keys_sha256 === candidate.payload_top_level_keys_sha256;
	const body: Omit<Goal25PayloadFairnessV35, "fairness_digest"> = {
		schema_version: 1,
		base_normalized_payload_sha256: base.normalized_payload_sha256,
		candidate_normalized_payload_sha256: candidate.normalized_payload_sha256,
		base_tool_interface_sha256: base.tools_sha256,
		candidate_tool_interface_sha256: candidate.tools_sha256,
		tool_interface_sha256: base.tools_sha256,
		equal_outside_frozen_skill_treatment: equal,
	};
	if (!equal) throw new Error("Goal 2.5 Base/Candidate first Provider payload fairness failed");
	return { ...body, fairness_digest: digestObject(body) };
}
