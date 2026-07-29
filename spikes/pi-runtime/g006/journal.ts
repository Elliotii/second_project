import { appendJsonl } from "./runtime-utils.ts";

export const G006_JOURNAL_SCHEMA_VERSION = 2 as const;

export type Cycle = "initial" | "verification_recovery";

export type JournalEventType =
	| "run_started"
	| "session_linked"
	| "agent_cycle_started"
	| "provider_request_start"
	| "provider_payload_shape"
	| "provider_response"
	| "assistant_message"
	| "reasoning_metadata"
	| "tool_execution_start"
	| "tool_execution_end"
	| "tool_side_effect"
	| "agent_settled"
	| "verifier_started"
	| "verifier_completed"
	| "policy_decision"
	| "continuation_queued"
	| "run_completed";

export type JournalEntry = {
	schemaVersion: typeof G006_JOURNAL_SCHEMA_VERSION;
	seq: number;
	timestamp: string;
	type: JournalEventType;
	runId: string;
	sessionId: string;
	cycle: Cycle;
	data: Record<string, unknown>;
};

export function createJournalEntry(options: {
	seq: number;
	timestamp: string;
	type: JournalEventType;
	runId: string;
	sessionId: string;
	cycle: Cycle;
	data?: Record<string, unknown>;
}): JournalEntry {
	return {
		schemaVersion: G006_JOURNAL_SCHEMA_VERSION,
		seq: options.seq,
		timestamp: options.timestamp,
		type: options.type,
		runId: options.runId,
		sessionId: options.sessionId,
		cycle: options.cycle,
		data: options.data ?? {},
	};
}

export function createJournalWriter(options: {
	path: string;
	runId: string;
	sessionId: string;
	getCycle: () => Cycle;
}): (type: JournalEventType, data?: Record<string, unknown>) => JournalEntry {
	let seq = 0;
	return (type, data = {}) => {
		const entry = createJournalEntry({
			seq: ++seq,
			timestamp: new Date().toISOString(),
			type,
			runId: options.runId,
			sessionId: options.sessionId,
			cycle: options.getCycle(),
			data,
		});
		appendJsonl(options.path, entry);
		return entry;
	};
}
