import { appendFileSync, closeSync, openSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { stableJson } from "../hash.ts";
import {
	JOURNAL_EVENT_TYPES,
	type JournalEntryV0B,
	type JournalEventTypeV0B,
	type JsonValue,
	type OutcomeV0B,
} from "../contracts/v0b-types.ts";
import { validateTerminalJournalSuffixV0B } from "./terminal-policy.ts";

export interface JournalIdentityV0B {
	run_id: string;
	attempt_id: string;
	session_id: string;
	workspace_id: string;
}

const EVENT_TYPES = new Set<string>(JOURNAL_EVENT_TYPES);
const RESERVED_DATA_KEYS = new Set(["schema_version", "seq", "timestamp", "type", "run_id", "attempt_id", "session_id", "workspace_id"]);

export class JournalWriterV0B {
	private seq = 0;
	readonly path: string;
	private readonly identity: JournalIdentityV0B;
	readonly entries: JournalEntryV0B[] = [];

	constructor(path: string, identity: JournalIdentityV0B) {
		this.path = path;
		this.identity = identity;
		mkdirSync(dirname(path), { recursive: true });
		const handle = openSync(path, "wx");
		closeSync(handle);
	}

	append(type: JournalEventTypeV0B, data: Record<string, JsonValue> = {}): JournalEntryV0B {
		for (const key of Object.keys(data)) {
			if (RESERVED_DATA_KEYS.has(key)) throw new Error(`journal data cannot override ${key}`);
		}
		const entry: JournalEntryV0B = {
			schema_version: 1,
			seq: ++this.seq,
			timestamp: new Date().toISOString(),
			type,
			...this.identity,
			data,
		};
		appendFileSync(this.path, `${stableJson(entry)}\n`, "utf8");
		this.entries.push(entry);
		return entry;
	}

	lastSeq(): number {
		return this.seq;
	}

	injectIdentityFaultForTest(): void {
		const entry: JournalEntryV0B = {
			schema_version: 1,
			seq: ++this.seq,
			timestamp: new Date().toISOString(),
			type: "provider_response_observed",
			...this.identity,
			run_id: `${this.identity.run_id}-fault`,
			data: { fault_injection: "journal_identity" },
		};
		appendFileSync(this.path, `${stableJson(entry)}\n`, "utf8");
		this.entries.push(entry);
	}
}

export function readJournal(path: string): JournalEntryV0B[] {
	const text = readFileSync(path, "utf8");
	return text
		.split(/\r?\n/)
		.filter((line) => line.length > 0)
		.map((line) => JSON.parse(line) as JournalEntryV0B);
}

export function validateJournal(
	entries: JournalEntryV0B[],
	identity: JournalIdentityV0B,
	options: {
		requireValidationCompleted?: boolean;
		route?: "settled" | "error" | "abort";
		mode?: "preterminal" | "terminal";
		outcome?: OutcomeV0B;
	} = {},
): string[] {
	const errors: string[] = [];
	const seen = new Set<string>();
	const starts = new Set<string>();
	const completes = new Set<string>();
	for (const [index, entry] of entries.entries()) {
		if (entry.schema_version !== 1) errors.push(`journal schema mismatch at ${index + 1}`);
		if (entry.seq !== index + 1) errors.push(`journal seq gap at ${index + 1}`);
		if (!EVENT_TYPES.has(entry.type)) errors.push(`unknown journal event: ${String(entry.type)}`);
		for (const key of ["run_id", "attempt_id", "session_id", "workspace_id"] as const) {
			if (entry[key] !== identity[key]) errors.push(`journal ${key} mismatch at seq ${entry.seq}`);
		}
		if (!entry.data || typeof entry.data !== "object" || Array.isArray(entry.data)) errors.push(`journal data invalid at seq ${entry.seq}`);
		for (const key of Object.keys(entry.data ?? {})) {
			if (RESERVED_DATA_KEYS.has(key)) errors.push(`journal data shadows ${key} at seq ${entry.seq}`);
		}
		seen.add(entry.type);
		if (entry.type === "tool_call_started" && typeof entry.data.tool_call_id === "string") starts.add(entry.data.tool_call_id);
		if (
			(entry.type === "tool_call_completed" || entry.type === "tool_call_error" || entry.type === "tool_call_aborted") &&
			typeof entry.data.tool_call_id === "string"
		) {
			completes.add(entry.data.tool_call_id);
		}
	}
	const route = options.route ?? "settled";
	const commonEvents = ["run_started", "attempt_started", "workspace_materialized", "session_linked"] as const;
	const routeEvents =
		route === "settled"
			? (["attempt_settled", "workspace_finalized", "verifier_started", "verifier_completed"] as const)
			: route === "error"
				? (["attempt_error"] as const)
				: (["attempt_aborted"] as const);
	const requiredEvents: JournalEventTypeV0B[] = [...commonEvents, ...routeEvents];
	for (const required of requiredEvents) {
		if (!seen.has(required)) errors.push(`required journal event missing: ${required}`);
	}
	if (route !== "settled" && (seen.has("verifier_started") || seen.has("verifier_completed"))) {
		errors.push("Verifier events are forbidden on an incomplete error/abort route");
	}
	if (options.requireValidationCompleted === true && !seen.has("evidence_validation_completed")) {
		errors.push("required journal event missing: evidence_validation_completed");
	}
	if (options.mode === "preterminal" && (seen.has("outcome_created") || seen.has("run_terminal"))) {
		errors.push("terminal Journal events are forbidden during preterminal validation");
	}
	if (options.mode === "terminal") {
		if (!options.outcome) {
			errors.push("terminal Journal validation requires an Outcome");
		} else {
			errors.push(...validateTerminalJournalSuffixV0B(entries, options.outcome));
		}
	}
	for (const callId of starts) if (!completes.has(callId)) errors.push(`tool call has no terminal event: ${callId}`);
	for (const callId of completes) if (!starts.has(callId)) errors.push(`tool result has no start event: ${callId}`);
	const positions = [
		...commonEvents,
		...routeEvents,
		...(options.requireValidationCompleted === true ? (["evidence_validation_completed"] as const) : []),
	]
		.map((type) => entries.findIndex((entry) => entry.type === type))
		.filter((position) => position >= 0);
	for (let index = 1; index < positions.length; index += 1) {
		if ((positions[index] ?? 0) <= (positions[index - 1] ?? -1)) errors.push("journal lifecycle ordering is invalid");
	}
	return errors;
}
