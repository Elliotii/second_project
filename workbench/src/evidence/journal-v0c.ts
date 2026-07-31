import { appendFileSync, closeSync, mkdirSync, openSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import {
	JOURNAL_EVENT_TYPES_V0C,
	type JournalEntryV0C,
	type JournalEventTypeV0C,
	type OutcomeV0C,
} from "../contracts/v0c-types.ts";
import type { JsonValue } from "../contracts/v0b-types.ts";
import { stableJson } from "../hash.ts";

const TYPES = new Set<string>(JOURNAL_EVENT_TYPES_V0C);
const RESERVED = new Set(["schema_version", "seq", "timestamp", "type", "run_id", "attempt_id", "session_id", "workspace_id"]);

export class JournalWriterV0C {
	private seq = 0;
	private activeAttemptId: string | null = null;
	private terminal = false;
	readonly entries: JournalEntryV0C[] = [];
	readonly path: string;
	private readonly identity: { run_id: string; session_id: string; workspace_id: string };

	constructor(
		path: string,
		identity: { run_id: string; session_id: string; workspace_id: string },
	) {
		this.path = path;
		this.identity = identity;
		mkdirSync(dirname(path), { recursive: true });
		closeSync(openSync(path, "wx"));
	}

	setActiveAttempt(attemptId: string | null): void {
		if (this.terminal) throw new Error("cannot change active Attempt after run_terminal");
		this.activeAttemptId = attemptId;
	}

	getActiveAttempt(): string | null {
		return this.activeAttemptId;
	}

	append(type: JournalEventTypeV0C, data: Record<string, JsonValue> = {}, attemptId = this.activeAttemptId): JournalEntryV0C {
		if (this.terminal) throw new Error("Journal rejects events after run_terminal");
		if (type === "attempt_started" && attemptId === null) throw new Error("attempt_started requires an allocated Attempt");
		for (const key of Object.keys(data)) if (RESERVED.has(key)) throw new Error(`journal data cannot override ${key}`);
		const entry: JournalEntryV0C = {
			schema_version: 1,
			seq: ++this.seq,
			timestamp: new Date().toISOString(),
			type,
			...this.identity,
			attempt_id: attemptId,
			data,
		};
		appendFileSync(this.path, `${stableJson(entry)}\n`, "utf8");
		this.entries.push(entry);
		if (type === "run_terminal") this.terminal = true;
		return entry;
	}

	lastSeq(): number {
		return this.seq;
	}
}

export function readJournalV0C(path: string): JournalEntryV0C[] {
	return readFileSync(path, "utf8")
		.split(/\r?\n/)
		.filter(Boolean)
		.map((line) => JSON.parse(line) as JournalEntryV0C);
}

export function terminalLifecycleDataV0C(outcome: OutcomeV0C): Record<string, JsonValue> {
	return { status: outcome.status, failure_class: outcome.failure_class, terminal_reason: outcome.terminal_reason };
}

export function validateJournalV0C(
	entries: JournalEntryV0C[],
	options: {
		runId: string;
		sessionId: string;
		workspaceId: string;
		attemptIds: string[];
		outcome?: OutcomeV0C;
	},
): string[] {
	const errors: string[] = [];
	for (const [index, entry] of entries.entries()) {
		if (entry.seq !== index + 1) errors.push(`Journal seq gap at ${index + 1}`);
		if (!TYPES.has(entry.type)) errors.push(`unknown Journal event: ${String(entry.type)}`);
		if (entry.run_id !== options.runId || entry.session_id !== options.sessionId || entry.workspace_id !== options.workspaceId) {
			errors.push(`Journal identity mismatch at seq ${entry.seq}`);
		}
		if (entry.attempt_id !== null && !options.attemptIds.includes(entry.attempt_id)) {
			errors.push(`Journal active Attempt drift at seq ${entry.seq}`);
		}
	}
	for (const attemptId of options.attemptIds) {
		const forAttempt = entries.filter((entry) => entry.attempt_id === attemptId);
		for (const type of ["attempt_started", "attempt_settled", "verifier_started", "verifier_completed", "attempt_evidence_validated", "policy_decided"] as const) {
			if (forAttempt.filter((entry) => entry.type === type).length !== 1) {
				errors.push(`${type} count is not exactly one for ${attemptId}`);
			}
		}
	}
	if (entries.filter((entry) => entry.type === "run_evidence_validation_completed").length !== 1) {
		errors.push("run_evidence_validation_completed count is not exactly one");
	}
	if (entries.filter((entry) => entry.type === "outcome_created").length !== 1) errors.push("outcome_created count is not exactly one");
	if (entries.filter((entry) => entry.type === "run_terminal").length !== 1) errors.push("run_terminal count is not exactly one");
	if (entries.at(-2)?.type !== "outcome_created" || entries.at(-1)?.type !== "run_terminal") {
		errors.push("Journal terminal suffix is invalid");
	}
	if (options.outcome) {
		const expected = stableJson(terminalLifecycleDataV0C(options.outcome));
		for (const entry of entries.slice(-2)) if (stableJson(entry.data) !== expected) errors.push(`${entry.type} projection disagrees with Outcome`);
	}
	const started = entries.filter((entry) => entry.type === "attempt_started").map((entry) => entry.attempt_id);
	if (stableJson(started) !== stableJson(options.attemptIds)) errors.push("Run Attempt lineage disagrees with attempt_started events");
	if (options.attemptIds.length === 2) {
		const reserved = entries.findIndex((entry) => entry.type === "recovery_slot_reserved");
		const packet = entries.findIndex((entry) => entry.type === "failure_packet_created");
		const child = entries.findIndex((entry) => entry.type === "attempt_started" && entry.attempt_id === options.attemptIds[1]);
		if (!(reserved >= 0 && reserved < packet && packet < child)) errors.push("Recovery/Packet/child ordering is invalid");
	}
	return errors;
}
