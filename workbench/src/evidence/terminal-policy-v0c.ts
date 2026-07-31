import type {
	AttemptRecordV0C,
	JournalEntryV0C,
	OutcomeV0C,
} from "../contracts/v0c-types.ts";
import type { ArtifactRefV0B, EvidenceIndexItemV0B } from "../contracts/v0b-types.ts";

const STATIC_RESPONSIBILITIES: Readonly<Record<string, string>> = Object.freeze({
	"config/task.json": "task contract snapshot",
	"config/strategy.json": "strategy contract snapshot",
	"config/verifier.mjs": "write-once executed external verifier source",
	"config/instruction.md": "task instruction snapshot",
	"run.json": "terminal Run record",
	"evidence/workspace.json": "Workspace identity and final digest",
	"evidence/session-ref.json": "reasoning-safe Session reference",
	"session/evidence.jsonl": "public-openable reasoning-safe Session JSONL",
	"journal/events.jsonl": "append-only multi-Attempt lifecycle Journal",
	"evidence/run-validation.json": "single Run-level evidence validation",
	"evidence/abort.json": "bounded abort and terminal snapshot",
	"evidence/secret-scan.json": "integrated preterminal secret and reasoning scan",
	"outcome.json": "accepted-precedence terminal Outcome",
});

const TOOL_RESULT = /^attempts\/0[12]-[A-Za-z0-9._-]+\/tool-results\/[A-Za-z0-9._-]+\.json$/;

export function attemptDirectoryV0C(attempt: AttemptRecordV0C): string {
	return `attempts/0${attempt.ordinal}-${attempt.attempt_id}`;
}

export function expectedTerminalResponsibilitiesV0C(options: {
	attempts: AttemptRecordV0C[];
	toolRefs: ArtifactRefV0B[];
	hasFailurePacket: boolean;
	hasFailurePacketScan?: boolean;
}): Map<string, string> {
	const expected = new Map(Object.entries(STATIC_RESPONSIBILITIES));
	for (const attempt of options.attempts) {
		const root = attemptDirectoryV0C(attempt);
		expected.set(`${root}/attempt.json`, `Attempt ${attempt.ordinal} record`);
		expected.set(`${root}/workspace-state.json`, `Attempt ${attempt.ordinal} Workspace snapshot`);
		expected.set(`${root}/verifier-result.json`, `Attempt ${attempt.ordinal} external Verifier result`);
		expected.set(`${root}/verifier-output.txt`, `Attempt ${attempt.ordinal} external Verifier output`);
		expected.set(`${root}/validation.json`, `Attempt ${attempt.ordinal} evidence validation`);
		expected.set(`${root}/policy-decision.json`, `Attempt ${attempt.ordinal} Completion decision`);
	}
	for (const ref of options.toolRefs) {
		if (!TOOL_RESULT.test(ref.path)) throw new Error(`Tool artifact path is outside V0-C closed set: ${ref.path}`);
		expected.set(ref.path, "attempt-scoped safe Tool Result projection");
	}
	if (options.hasFailurePacket) {
		expected.set("recovery/failure-packet.json", "validated public Failure Packet");
		expected.set("recovery/failure-packet-agent-projection.json", "bounded Agent-visible Failure Packet projection");
	}
	if (options.hasFailurePacketScan) {
		expected.set("recovery/failure-packet-scan.json", "pre-child shared-rule Failure Packet scan");
	}
	return expected;
}

export function terminalIndexItemV0C(ref: ArtifactRefV0B, expected: ReadonlyMap<string, string>): EvidenceIndexItemV0B {
	const responsibility = expected.get(ref.path);
	if (!responsibility) throw new Error(`path is not V0-C terminal evidence: ${ref.path}`);
	return { ...ref, responsibility };
}

export function validateTerminalIndexPolicyV0C(
	items: EvidenceIndexItemV0B[],
	expected: ReadonlyMap<string, string>,
): string[] {
	const errors: string[] = [];
	const actual = new Map<string, EvidenceIndexItemV0B>();
	for (const item of items) {
		if (actual.has(item.path)) {
			errors.push(`Evidence Index contains duplicate path: ${item.path}`);
			continue;
		}
		actual.set(item.path, item);
		if (item.path === "evidence-index.json" || item.path === "terminal.json") {
			errors.push(`Evidence Index contains cycle entry: ${item.path}`);
		}
		const responsibility = expected.get(item.path);
		if (!responsibility) errors.push(`Evidence Index contains unexpected V0-C terminal evidence: ${item.path}`);
		else if (item.responsibility !== responsibility) errors.push(`Evidence Index responsibility mismatch: ${item.path}`);
	}
	for (const path of expected.keys()) if (!actual.has(path)) errors.push(`Evidence Index omits required V0-C terminal evidence: ${path}`);
	return errors;
}

export function terminalScanFileScopesV0C(options: {
	attempts: AttemptRecordV0C[];
	toolRefs: ArtifactRefV0B[];
	hasFailurePacket: boolean;
	hasFailurePacketScan?: boolean;
}): Array<{ scope_label: string; path: string }> {
	const scopes = [
		{ scope_label: "task_snapshot", path: "config/task.json" },
		{ scope_label: "strategy_snapshot", path: "config/strategy.json" },
		{ scope_label: "instruction_snapshot", path: "config/instruction.md" },
		{ scope_label: "verifier_snapshot", path: "config/verifier.mjs" },
		{ scope_label: "session_evidence", path: "session/evidence.jsonl" },
		{ scope_label: "journal_preterminal", path: "journal/events.jsonl" },
		...options.attempts.flatMap((attempt) => {
			const root = attemptDirectoryV0C(attempt);
			return [
				{ scope_label: `attempt_${attempt.ordinal}_verifier_output`, path: `${root}/verifier-output.txt` },
				{ scope_label: `attempt_${attempt.ordinal}_validation`, path: `${root}/validation.json` },
			];
		}),
		...options.toolRefs.map((ref, index) => ({ scope_label: `tool_result_${index + 1}`, path: ref.path })),
	];
	if (options.hasFailurePacket) {
		scopes.push(
			{ scope_label: "failure_packet", path: "recovery/failure-packet.json" },
			{ scope_label: "failure_packet_agent_projection", path: "recovery/failure-packet-agent-projection.json" },
		);
	}
	if (options.hasFailurePacketScan) {
		scopes.push({ scope_label: "failure_packet_prechild_scan", path: "recovery/failure-packet-scan.json" });
	}
	return scopes;
}

export function terminalScanObjectScopesV0C(options: {
	run: unknown;
	attempts: AttemptRecordV0C[];
	workspace: unknown;
	session: unknown;
	verifiers: unknown[];
	decisions: unknown[];
	runValidation: unknown;
	abort: unknown;
	outcome: OutcomeV0C;
	terminalJournalProjection: unknown;
}): Array<{ scope_label: string; value: unknown }> {
	return [
		{ scope_label: "pending_run_object", value: options.run },
		...options.attempts.map((attempt) => ({ scope_label: `pending_attempt_${attempt.ordinal}_object`, value: attempt })),
		{ scope_label: "workspace_object", value: options.workspace },
		{ scope_label: "session_ref_object", value: options.session },
		...options.verifiers.map((verifier, index) => ({ scope_label: `verifier_result_${index + 1}_object`, value: verifier })),
		...options.decisions.map((decision, index) => ({ scope_label: `policy_decision_${index + 1}_object`, value: decision })),
		{ scope_label: "run_validation_object", value: options.runValidation },
		{ scope_label: "abort_object", value: options.abort },
		{ scope_label: "pending_outcome_serialization", value: options.outcome },
		{ scope_label: "pending_terminal_journal_events", value: options.terminalJournalProjection },
	];
}

export function preterminalJournalBytesV0C(entries: JournalEntryV0C[]): string {
	return entries
		.filter((entry) => entry.type !== "outcome_created" && entry.type !== "run_terminal")
		.map((entry) => `${JSON.stringify(entry)}\n`)
		.join("");
}
