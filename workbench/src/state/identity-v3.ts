import type { HarnessStateVersionV3 } from "../contracts/v3g2-types.ts";
import type { HarnessStateEntryV3, StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { digestObject } from "../hash.ts";

export function semanticStateEntriesV3(entries: readonly HarnessStateEntryV3[]): unknown[] {
	return [...entries]
		.sort((left, right) => left.entry_id.localeCompare(right.entry_id))
		.map((entry) => entry.kind === "prompt_addendum"
			? { kind: entry.kind, entry_id: entry.entry_id, content: entry.content, applicability: entry.applicability }
			: { kind: entry.kind, entry_id: entry.entry_id, skill_name: entry.skill_name, description: entry.description, markdown_body: entry.markdown_body, applicability: entry.applicability });
}

export function stagedStateDigestV3(state: Omit<StagedHarnessStateV3, "state_digest"> | StagedHarnessStateV3): string {
	return digestObject({
		candidate_id: state.candidate_id,
		candidate_digest: state.candidate_digest,
		evidence_identity: state.evidence_identity,
		expected_base_state_digest: state.expected_base_state_digest,
		entries: semanticStateEntriesV3(state.entries),
	});
}

export function acceptedStateVersionDigestV3(state: Omit<HarnessStateVersionV3, "state_digest"> | HarnessStateVersionV3): string {
	return digestObject({
		schema_version: state.schema_version,
		status: state.status,
		project_id: state.project_id,
		state_version: state.state_version,
		parent_state_digest: state.parent_state_digest,
		source_candidate_id: state.source_candidate_id,
		source_candidate_digest: state.source_candidate_digest,
		source_staged_state_digest: state.source_staged_state_digest,
		entries: semanticStateEntriesV3(state.entries),
	});
}
