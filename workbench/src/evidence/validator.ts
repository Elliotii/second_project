import type {
	ArtifactRefV0B,
	EvidenceValidationV0B,
	SessionRefV0B,
	VerifierResultV0B,
} from "../contracts/v0b-types.ts";
import { isArtifactRefV0B, resolveRunRelative, validateArtifactRef } from "./artifacts.ts";
import { readJournal, validateJournal, type JournalIdentityV0B } from "./journal.ts";
import { reopenAndValidateEvidenceSession } from "../session/evidence-session.ts";

export function validateJournalArtifactRefsV0B(
	runRoot: string,
	journal: ReturnType<typeof readJournal>,
): string[] {
	const errors: string[] = [];
	for (const entry of journal) {
		for (const [key, value] of Object.entries(entry.data)) {
			if (!key.endsWith("_ref")) continue;
			if (!isArtifactRefV0B(value)) {
				errors.push(`journal declared ArtifactRef is malformed at seq ${entry.seq}`);
				continue;
			}
			errors.push(...validateArtifactRef(runRoot, value));
		}
	}
	return errors;
}

export async function validatePreterminalEvidenceV0B(options: {
	runRoot: string;
	workspaceRoot: string;
	identity: JournalIdentityV0B;
	journalPath: string;
	sessionRef: SessionRefV0B;
	verifierResult: VerifierResultV0B;
	requiredRefs: ArtifactRefV0B[];
}): Promise<EvidenceValidationV0B> {
	const errors: string[] = [];
	const journal = readJournal(options.journalPath);
	errors.push(...validateJournal(journal, options.identity));
	errors.push(...validateJournalArtifactRefsV0B(options.runRoot, journal));
	let session = { entryCount: 0, toolCallIds: [] as string[], toolResultIds: [] as string[], errors: [] as string[] };
	try {
		if (!isArtifactRefV0B(options.sessionRef.storage_ref)) throw new Error("Session storage ArtifactRef is malformed");
		session = await reopenAndValidateEvidenceSession({
			evidencePath: resolveRunRelative(options.runRoot, options.sessionRef.storage_ref.path),
			workspaceRoot: options.workspaceRoot,
			sessionId: options.identity.session_id,
		});
		errors.push(...session.errors);
	} catch (error) {
		errors.push(`evidence Session public reopen failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	for (const ref of [...options.requiredRefs, options.sessionRef.storage_ref, options.verifierResult.full_output_ref]) {
		errors.push(...validateArtifactRef(options.runRoot, ref));
	}
	const journalStarts = journal
		.filter((entry) => entry.type === "tool_call_started")
		.flatMap((entry) => (typeof entry.data.tool_call_id === "string" ? [entry.data.tool_call_id] : []));
	const journalResults = journal
		.filter((entry) => entry.type === "tool_call_completed" || entry.type === "tool_call_error" || entry.type === "tool_call_aborted")
		.flatMap((entry) => (typeof entry.data.tool_call_id === "string" ? [entry.data.tool_call_id] : []));
	if (JSON.stringify([...journalStarts].sort()) !== JSON.stringify([...session.toolCallIds].sort())) {
		errors.push("Session and Journal Tool Call IDs differ");
	}
	if (JSON.stringify([...journalResults].sort()) !== JSON.stringify([...session.toolResultIds].sort())) {
		errors.push("Session and Journal Tool Result IDs differ");
	}
	return {
		schema_version: 1,
		run_id: options.identity.run_id,
		valid: errors.length === 0,
		errors,
		checked_artifact_count: options.requiredRefs.length + 2,
		tool_call_count: session.toolCallIds.length,
		tool_result_count: session.toolResultIds.length,
		journal_entry_count: journal.length,
	};
}
