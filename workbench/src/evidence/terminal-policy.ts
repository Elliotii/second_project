import type {
	ArtifactRefV0B,
	EvidenceIndexItemV0B,
	JournalEntryV0B,
	JsonValue,
	OutcomeV0B,
} from "../contracts/v0b-types.ts";
import { stableJson } from "../hash.ts";

export const TOOL_RESULT_RESPONSIBILITY_V0B = "externalized safe Tool Result projection";

export const TERMINAL_INDEX_RESPONSIBILITIES_V0B: Readonly<Record<string, string>> = Object.freeze({
	"config/task.json": "task contract snapshot",
	"config/strategy.json": "strategy contract snapshot",
	"config/verifier.mjs": "write-once executed external verifier source",
	"config/instruction.md": "task instruction snapshot",
	"run.json": "terminal Run record",
	"attempt.json": "single Attempt record",
	"evidence/workspace.json": "Workspace identity and final digest",
	"evidence/session-ref.json": "reasoning-safe Session reference",
	"session/evidence.jsonl": "public-openable reasoning-safe Session JSONL",
	"journal/events.jsonl": "append-only lifecycle Journal",
	"evidence/verifier-result.json": "external Verifier result and execution identity",
	"artifacts/verifier-output.txt": "external Verifier full output",
	"evidence/validation.json": "preterminal evidence validation",
	"evidence/abort.json": "bounded abort and terminal snapshot",
	"evidence/secret-scan.json": "integrated preterminal secret and reasoning scan",
	"outcome.json": "accepted-precedence terminal Outcome",
});

const TOOL_RESULT_PATH = /^artifacts\/tool-results\/[A-Za-z0-9._-]+\.json$/;

export interface TerminalScanFileScopeV0B {
	scope_label: string;
	path: string;
}

export const TERMINAL_SCAN_STATIC_FILE_SCOPES_V0B: readonly TerminalScanFileScopeV0B[] = Object.freeze([
	{ scope_label: "task_snapshot", path: "config/task.json" },
	{ scope_label: "strategy_snapshot", path: "config/strategy.json" },
	{ scope_label: "instruction_snapshot", path: "config/instruction.md" },
	{ scope_label: "verifier_snapshot", path: "config/verifier.mjs" },
	{ scope_label: "session_evidence", path: "session/evidence.jsonl" },
	{ scope_label: "journal_preterminal", path: "journal/events.jsonl" },
	{ scope_label: "verifier_output", path: "artifacts/verifier-output.txt" },
	{ scope_label: "validation_artifact", path: "evidence/validation.json" },
]);

export const TERMINAL_SCAN_OBJECT_SCOPES_V0B = Object.freeze({
	pending_run_object: "run.json",
	pending_attempt_object: "attempt.json",
	workspace_object: "evidence/workspace.json",
	session_ref_object: "evidence/session-ref.json",
	verifier_result_object: "evidence/verifier-result.json",
	abort_object: "evidence/abort.json",
	pending_outcome_serialization: "outcome.json",
	pending_terminal_journal_events: "journal/events.jsonl",
} as const);

function toolResultRefsFromJournal(entries: JournalEntryV0B[]): ArtifactRefV0B[] {
	const refs: ArtifactRefV0B[] = [];
	for (const entry of entries) {
		if (entry.type !== "tool_call_completed" && entry.type !== "tool_call_error" && entry.type !== "tool_call_aborted") {
			continue;
		}
		const value = entry.data.output_ref;
		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			typeof value.path === "string" &&
			TOOL_RESULT_PATH.test(value.path)
		) {
			refs.push(value as unknown as ArtifactRefV0B);
		}
	}
	return refs;
}

export function terminalIndexResponsibilityV0B(path: string): string | null {
	return TERMINAL_INDEX_RESPONSIBILITIES_V0B[path] ?? (TOOL_RESULT_PATH.test(path) ? TOOL_RESULT_RESPONSIBILITY_V0B : null);
}

export function terminalIndexItemV0B(ref: ArtifactRefV0B): EvidenceIndexItemV0B {
	const responsibility = terminalIndexResponsibilityV0B(ref.path);
	if (!responsibility) throw new Error(`path is not V0-B terminal evidence: ${ref.path}`);
	return { ...ref, responsibility };
}

export function validateTerminalIndexPolicyV0B(
	items: EvidenceIndexItemV0B[],
	journal: JournalEntryV0B[],
): string[] {
	const errors: string[] = [];
	const expected = new Map(Object.entries(TERMINAL_INDEX_RESPONSIBILITIES_V0B));
	for (const entry of journal) {
		if (entry.type !== "tool_call_completed" && entry.type !== "tool_call_error" && entry.type !== "tool_call_aborted") {
			continue;
		}
		const ref = entry.data.output_ref;
		if (
			!ref ||
			typeof ref !== "object" ||
			Array.isArray(ref) ||
			typeof ref.path !== "string" ||
			!TOOL_RESULT_PATH.test(ref.path)
		) {
			errors.push(`Journal Tool terminal event lacks a declared V0-B Tool artifact at seq ${entry.seq}`);
		}
	}
	for (const ref of toolResultRefsFromJournal(journal)) {
		expected.set(ref.path, TOOL_RESULT_RESPONSIBILITY_V0B);
	}
	const actual = new Map<string, EvidenceIndexItemV0B>();
	for (const item of items) {
		if (actual.has(item.path)) {
			errors.push(`Evidence Index contains a duplicate path: ${item.path}`);
			continue;
		}
		actual.set(item.path, item);
		if (item.path === "evidence-index.json" || item.path === "terminal.json") {
			errors.push(`Evidence Index contains an unexpected cycle entry: ${item.path}`);
		}
		const expectedResponsibility = expected.get(item.path);
		if (!expectedResponsibility) {
			errors.push(`Evidence Index contains unexpected V0-B terminal evidence: ${item.path}`);
		} else if (item.responsibility !== expectedResponsibility) {
			errors.push(`Evidence Index responsibility mismatch: ${item.path}`);
		}
	}
	for (const path of expected.keys()) {
		if (!actual.has(path)) errors.push(`Evidence Index omits required V0-B terminal evidence: ${path}`);
	}
	return errors;
}

export function terminalScanFileScopesV0B(toolRefs: ArtifactRefV0B[]): TerminalScanFileScopeV0B[] {
	return [
		...TERMINAL_SCAN_STATIC_FILE_SCOPES_V0B,
		...toolRefs.map((ref, index) => ({
			scope_label: `tool_result_artifact_${index + 1}`,
			path: ref.path,
		})),
	];
}

export function terminalScanFileScopesFromJournalV0B(entries: JournalEntryV0B[]): TerminalScanFileScopeV0B[] {
	return terminalScanFileScopesV0B(toolResultRefsFromJournal(entries));
}

function cloneJson(value: unknown): unknown {
	return JSON.parse(stableJson(value)) as unknown;
}

function normalizeWallTime(value: unknown): unknown {
	const projected = cloneJson(value);
	if (!projected || typeof projected !== "object" || Array.isArray(projected)) return projected;
	const record = projected as Record<string, unknown>;
	for (const key of ["budget", "budget_allocation", "budget_usage"]) {
		const candidate = record[key];
		if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
			(candidate as Record<string, unknown>).wall_time_usage_ms = 0;
		}
	}
	return projected;
}

export function terminalLifecycleDataV0B(outcome: OutcomeV0B): Record<string, JsonValue> {
	return {
		status: outcome.status,
		failure_class: outcome.failure_class,
		terminal_reason: outcome.terminal_reason,
	};
}

export function terminalJournalProjectionV0B(value: unknown): unknown {
	if (!Array.isArray(value)) return value;
	return value.map((entry) => {
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
		const record = entry as Record<string, unknown>;
		return {
			type: record.type,
			data: record.data,
		};
	});
}

export function secretRelevantObjectProjectionV0B(scopeLabel: string, value: unknown): unknown {
	if (scopeLabel === "pending_run_object" || scopeLabel === "pending_attempt_object") {
		return normalizeWallTime(value);
	}
	if (scopeLabel === "pending_terminal_journal_events") {
		return terminalJournalProjectionV0B(value);
	}
	return value;
}

export function preterminalJournalBytesV0B(entries: JournalEntryV0B[]): string {
	const suffixStarts = entries.length >= 2 && entries.at(-2)?.type === "outcome_created" && entries.at(-1)?.type === "run_terminal";
	const preterminal = suffixStarts ? entries.slice(0, -2) : entries;
	return preterminal.map((entry) => `${stableJson(entry)}\n`).join("");
}

export function validateTerminalJournalSuffixV0B(entries: JournalEntryV0B[], outcome: OutcomeV0B): string[] {
	const errors: string[] = [];
	const validationPositions = entries
		.map((entry, index) => (entry.type === "evidence_validation_completed" ? index : -1))
		.filter((index) => index >= 0);
	const outcomePositions = entries
		.map((entry, index) => (entry.type === "outcome_created" ? index : -1))
		.filter((index) => index >= 0);
	const terminalPositions = entries
		.map((entry, index) => (entry.type === "run_terminal" ? index : -1))
		.filter((index) => index >= 0);
	if (validationPositions.length !== 1) errors.push("Journal evidence_validation_completed count is not exactly one");
	if (outcomePositions.length !== 1) errors.push("Journal outcome_created count is not exactly one");
	if (terminalPositions.length !== 1) errors.push("Journal run_terminal count is not exactly one");
	if (
		validationPositions.length === 1 &&
		outcomePositions.length === 1 &&
		terminalPositions.length === 1 &&
		!(
			(validationPositions[0] ?? -1) < (outcomePositions[0] ?? -1) &&
			(outcomePositions[0] ?? -1) < (terminalPositions[0] ?? -1)
		)
	) {
		errors.push("Journal terminal lifecycle ordering is invalid");
	}
	if (entries.at(-2)?.type !== "outcome_created" || entries.at(-1)?.type !== "run_terminal") {
		errors.push("Journal terminal suffix is invalid");
	}
	const expectedData = stableJson(terminalLifecycleDataV0B(outcome));
	for (const entry of entries.slice(-2)) {
		if ((entry.type === "outcome_created" || entry.type === "run_terminal") && stableJson(entry.data) !== expectedData) {
			errors.push(`Journal ${entry.type} projection disagrees with Outcome`);
		}
	}
	return errors;
}
