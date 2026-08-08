import type { Goal2ArmV35, Goal2FirstProviderPayloadEvidenceV35 } from "../contracts/v35g2-types.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { GOAL2_CASE_ID_V35, GOAL2_PROJECT_ID_V35 } from "./case-v35g2.ts";

export const GOAL2_PAYLOAD_TREATMENT_MARKER_V35 = "<V35_G2_FIRST_PROVIDER_TREATMENT_TEXT>";

interface PayloadMessageV35 {
	role?: unknown;
	content?: unknown;
	[key: string]: unknown;
}

function canonicalClone(value: unknown): Record<string, unknown> {
	const serialized = stableJson(value);
	const parsed: unknown = JSON.parse(serialized);
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Goal 2 first Provider payload must be a JSON object");
	return parsed as Record<string, unknown>;
}

function evidenceBody(evidence: Goal2FirstProviderPayloadEvidenceV35): Omit<Goal2FirstProviderPayloadEvidenceV35, "evidence_digest"> {
	const { evidence_digest: _digest, ...body } = evidence;
	return body;
}

function exactUserText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content) || content.length !== 1) throw new Error("Goal 2 first Provider payload user text shape invalid");
	const part = content[0];
	if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "text" || typeof (part as { text?: unknown }).text !== "string") throw new Error("Goal 2 first Provider payload user text shape invalid");
	return (part as { text: string }).text;
}

export function validateGoal2FirstPayloadEvidenceV35(evidence: Goal2FirstProviderPayloadEvidenceV35): boolean {
	return evidence.evidence_digest === digestObject(evidenceBody(evidence));
}

export function createGoal2FirstProviderPayloadCaptureV35(options: {
	arm: Goal2ArmV35;
	runId: string;
	taskPrompt: string;
	expectedLastUserText: string;
	skillWrapperSha256: string | null;
}): { observe(payload: unknown): void; requireEvidence(): Goal2FirstProviderPayloadEvidenceV35 } {
	let captured: Goal2FirstProviderPayloadEvidenceV35 | null = null;
	return {
		observe(payload: unknown): void {
			if (captured !== null) return;
			const canonical = canonicalClone(payload);
			if (!Array.isArray(canonical.messages) || canonical.messages.length === 0) throw new Error("Goal 2 first Provider payload messages missing");
			const messages = canonical.messages as PayloadMessageV35[];
			const lastUserMessageIndex = messages.findLastIndex((message) => message && typeof message === "object" && message.role === "user");
			if (lastUserMessageIndex < 0) throw new Error("Goal 2 first Provider payload user message missing");
			const lastUser = messages[lastUserMessageIndex];
			if (!lastUser || typeof lastUser !== "object") throw new Error("Goal 2 first Provider payload user text shape invalid");
			const actualLastUserText = exactUserText(lastUser.content);
			if (actualLastUserText !== options.expectedLastUserText) throw new Error("Goal 2 first Provider payload treatment text mismatch");
			const normalized = structuredClone(canonical);
			const normalizedMessages = normalized.messages as PayloadMessageV35[];
			const normalizedLastUser = normalizedMessages[lastUserMessageIndex]!;
			normalizedMessages[lastUserMessageIndex] = { ...normalizedLastUser, content: typeof normalizedLastUser.content === "string" ? GOAL2_PAYLOAD_TREATMENT_MARKER_V35 : [{ ...(normalizedLastUser.content as Record<string, unknown>[])[0], text: GOAL2_PAYLOAD_TREATMENT_MARKER_V35 }] };
			const requestFields = { ...normalized };
			delete requestFields.messages;
			delete requestFields.tools;
			delete requestFields.model;
			const body: Omit<Goal2FirstProviderPayloadEvidenceV35, "evidence_digest"> = {
				schema_version: 1,
				project_id: GOAL2_PROJECT_ID_V35,
				case_id: GOAL2_CASE_ID_V35,
				arm: options.arm,
				run_id: options.runId,
				capture_ordinal: 1,
				message_count: messages.length,
				last_user_message_index: lastUserMessageIndex,
				treatment_kind: options.skillWrapperSha256 === null ? "task_prompt" : "skill_wrapper_plus_task_prompt",
				task_prompt_sha256: sha256(options.taskPrompt),
				skill_wrapper_sha256: options.skillWrapperSha256,
				expected_last_user_text_sha256: sha256(options.expectedLastUserText),
				actual_last_user_text_sha256: sha256(actualLastUserText),
				treatment_marker_sha256: sha256(GOAL2_PAYLOAD_TREATMENT_MARKER_V35),
				payload_sha256: digestObject(canonical),
				normalized_payload_sha256: digestObject(normalized),
				normalized_messages_sha256: digestObject(normalizedMessages),
				system_messages_sha256: digestObject(messages.filter((message) => message.role === "system" || message.role === "developer")),
				tools_sha256: digestObject(canonical.tools ?? null),
				model_sha256: digestObject(canonical.model ?? null),
				request_fields_sha256: digestObject(requestFields),
				payload_top_level_keys_sha256: digestObject(Object.keys(canonical).sort()),
			};
			captured = { ...body, evidence_digest: digestObject(body) };
		},
		requireEvidence(): Goal2FirstProviderPayloadEvidenceV35 {
			if (captured === null) throw new Error("Goal 2 first Provider payload was not captured");
			return structuredClone(captured);
		},
	};
}

export function goal2PayloadFairnessDigestV35(base: Goal2FirstProviderPayloadEvidenceV35, candidate: Goal2FirstProviderPayloadEvidenceV35): string {
	return digestObject({
		base_evidence_digest: base.evidence_digest,
		candidate_evidence_digest: candidate.evidence_digest,
		normalized_payload_sha256: base.normalized_payload_sha256,
		treatment_marker_sha256: base.treatment_marker_sha256,
	});
}
