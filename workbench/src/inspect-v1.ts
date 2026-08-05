import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { formatSkillInvocation } from "@earendil-works/pi-agent-core";
import type { ArtifactRefV0B, VerifierResultV0B } from "./contracts/v0b-types.ts";
import type {
	BudgetCapsV1B,
	BudgetReservationEvidenceV1B,
	BudgetUsageV1B,
	ExecutionManifestV1B,
	PauseEvidenceV1B,
	RunResultV1,
	TerminalCellEvidenceV1B,
	WorkspaceTreeRefV1B,
} from "./contracts/v1-types.ts";
import { V1B_PAUSE_PHASES } from "./contracts/v1-types.ts";
import { validateArtifactRef } from "./evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson } from "./hash.ts";
import { deriveManifestBindingsV1, validateExecutionManifestV1B } from "./experiment/v1.ts";
import { loadCandidateTaskPackV1 } from "./experiment/task-pack-v1.ts";
import { readPilotLedgerV1B, validatePilotLedgerV1B } from "./pilot-v1.ts";
import { expectedSkillIdentityV1 } from "./skill/runtime-v1.ts";
import { scanFinalWorkspaceTreeV1B } from "./run-v1.ts";

export interface InspectRunResultV1B {
	integrity_valid: boolean;
	errors: string[];
	run_result: RunResultV1 | null;
	terminal: TerminalCellEvidenceV1B | null;
	pause_evidence: PauseEvidenceV1B | null;
	pause_integrity_valid: boolean;
	terminal_valid: boolean;
	comparable: boolean;
}

interface TerminalMarkerV1B {
	schema_version: 1;
	manifest_id: string;
	cell_id: string;
	planned_run_id: string;
	disposition: "terminal" | "invalid";
	failure_class: string;
	cause_id: string | null;
	run_result_ref: ArtifactRefV0B;
	terminal_evidence_ref: ArtifactRefV0B;
	final_workspace_digest: string;
	final_workspace_ref: WorkspaceTreeRefV1B;
}

interface JournalEventV1B {
	schema_version: number;
	seq: number;
	type: string;
	data: Record<string, any>;
}

const FORBIDDEN_PERSISTED_EVIDENCE_V1B = /(?:"(?:authorization|proxy[_-]?authorization|reasoning(?:_content)?|thinking|thoughtsignature|signature)"\s*:|bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i;
const USAGE_KEYS = ["provider_requests", "tool_calls", "tokens", "active_execution_time_ms", "cost_usd", "verifier_runs", "child_attempts"] as const;

function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, "utf8")) as T; }
function refEnvelope(value: { path: string; sha256: string; size_bytes: number }): ArtifactRefV0B { return { ...value, media_type: "application/octet-stream", truncated: false }; }
function zeroUsage(): BudgetUsageV1B { return { provider_requests: 0, tool_calls: 0, tokens: 0, active_execution_time_ms: 0, cost_usd: 0, verifier_runs: 0, child_attempts: 0 }; }
function addUsage(left: BudgetUsageV1B, right: BudgetUsageV1B): BudgetUsageV1B { const result = structuredClone(left); for (const key of USAGE_KEYS) result[key] += right[key]; return result; }
function usageEqual(left: BudgetUsageV1B, right: BudgetUsageV1B): boolean { return USAGE_KEYS.every((key) => Math.abs(left[key] - right[key]) <= Number.EPSILON); }
function capValue(caps: BudgetCapsV1B, key: keyof BudgetUsageV1B): number { return key === "active_execution_time_ms" ? caps.wall_time_ms : caps[key]; }
function verifierStatusAllowed(value: string): boolean { return ["passed", "failed", "invalid", "infrastructure_error", "cancelled"].includes(value); }

function validateJournalEnvelopes(events: readonly JournalEventV1B[], label: string, errors: string[]): void {
	if (events.some((event, index) => event.schema_version !== 1 || event.seq !== index + 1)) errors.push(`${label} journal envelope schema/sequence drift`);
}

function validateTerminalJournalStructure(events: readonly JournalEventV1B[], terminal: TerminalCellEvidenceV1B, errors: string[]): void {
	const starts = events.filter((event) => event.type === "attempt_started");
	if (starts.length !== terminal.attempts.length || new Set(starts.map((event) => event.data.attempt_id)).size !== starts.length) errors.push("terminal attempt_started missing/duplicate");
	for (const [index, attempt] of terminal.attempts.entries()) {
		const started = starts.filter((event) => event.data.attempt_id === attempt.attempt_id);
		const settled = events.filter((event) => event.type === "attempt_settled" && event.data.attempt_id === attempt.attempt_id);
		const verified = events.filter((event) => event.type === "verifier_completed" && event.data.attempt_id === attempt.attempt_id);
		if (started.length !== 1 || settled.length !== 1 || verified.length !== 1) { errors.push(`terminal critical Attempt events missing/duplicated: ${attempt.attempt_id}`); continue; }
		const startIndex = events.indexOf(started[0]!); const settledIndex = events.indexOf(settled[0]!); const verifierIndex = events.indexOf(verified[0]!);
		const nextStartIndex = index + 1 < starts.length ? events.indexOf(starts[index + 1]!) : Number.POSITIVE_INFINITY;
		if (startIndex < 0 || settledIndex <= startIndex || verifierIndex <= settledIndex || verifierIndex >= nextStartIndex || started[0]!.data.ordinal !== attempt.ordinal || started[0]!.data.parent_attempt_id !== attempt.parent_attempt_id) errors.push(`terminal Attempt critical-event order/identity drift: ${attempt.attempt_id}`);
		for (const event of events.filter((candidate) => ["provider_request_reserved", "provider_usage_committed", "local_budget_stop_recorded", "local_budget_stop_consumed"].includes(candidate.type) && candidate.data.attempt_id === attempt.attempt_id)) if (events.indexOf(event) <= startIndex || events.indexOf(event) >= settledIndex) errors.push(`terminal Attempt provider/stop event order drift: ${attempt.attempt_id}`);
	}
	const dispositionType = terminal.disposition === "terminal" ? "run_terminal" : "run_invalid";
	const dispositions = events.filter((event) => event.type === "run_terminal" || event.type === "run_invalid");
	if (dispositions.length !== 1 || dispositions[0]?.type !== dispositionType || events.at(-1) !== dispositions[0]) errors.push("terminal Run disposition event missing/duplicated/reordered");
}

function inspectPausedRunV1B(input: { pilotRoot: string; manifest: ExecutionManifestV1B; cell: ExecutionManifestV1B["cells"][number]; transitions: ReturnType<typeof readPilotLedgerV1B>; errors: string[] }): PauseEvidenceV1B | null {
	const { pilotRoot, manifest, cell, transitions, errors } = input;
	if (transitions.length !== 3 || transitions[0]?.state !== "planned" || transitions[1]?.state !== "started" || transitions[2]?.state !== "paused") throw new Error("Inspector paused ledger transition is not planned->started->paused");
	const paused = transitions[2]!;
	if (!paused.pause_evidence_ref || !paused.journal_sha256 || paused.run_result_ref !== null) throw new Error("Inspector paused ledger evidence relation missing");
	const runRoot = resolve(pilotRoot, "runs", cell.planned_run_id);
	for (const forbidden of ["terminal.json", "terminal-evidence.json", "run-result.json"]) if (existsSync(resolve(runRoot, forbidden))) errors.push(`paused Run contains forbidden terminal evidence: ${forbidden}`);
	errors.push(...validateArtifactRef(runRoot, refEnvelope(paused.pause_evidence_ref)).map((error) => `pause evidence: ${error}`));
	const pausePath = resolve(runRoot, paused.pause_evidence_ref.path);
	const journalPath = resolve(runRoot, "journal.jsonl");
	const pause = readJson<PauseEvidenceV1B>(pausePath);
	const journalBytes = readFileSync(journalPath);
	assertActualBytesSafe("pause-evidence.json", readFileSync(pausePath));
	assertActualBytesSafe("paused journal.jsonl", journalBytes);
	assertActualBytesSafe("paused ledger entry", Buffer.from(stableJson(paused)));
	if (fileSha256(journalPath) !== paused.journal_sha256) errors.push("paused ledger journal digest drift");
	if (pause.schema_version !== 1 || pause.manifest_id !== manifest.manifest_id || pause.cell_id !== cell.cell_id || pause.planned_run_id !== cell.planned_run_id || pause.run_id !== cell.planned_run_id) errors.push("pause evidence Manifest/cell/Run identity drift");
	if (!V1B_PAUSE_PHASES.includes(pause.phase)) errors.push("pause evidence phase enum invalid");
	if (paused.cause_id !== `pause_${pause.phase}`) errors.push("pause evidence typed cause relation drift");
	const raw = journalBytes.toString("utf8");
	const lines = raw.split(/\r?\n/).filter(Boolean);
	const events = lines.map((line) => JSON.parse(line) as JournalEventV1B);
	validateJournalEnvelopes(events, "paused", errors);
	const pauseEvents = events.filter((event) => event.type === "attempt_paused");
	if (pauseEvents.length !== 1 || events.at(-1)?.type !== "attempt_paused") errors.push("attempt_paused journal event missing/duplicated/reordered");
	const prefix = `${lines.slice(0, -1).join("\n")}${lines.length > 1 ? "\n" : ""}`;
	if (sha256(prefix) !== pause.journal_prefix_sha256) errors.push("pause evidence journal-prefix digest drift");
	const last = pauseEvents[0]?.data;
	if (!last || last.manifest_id !== manifest.manifest_id || last.cell_id !== cell.cell_id || last.planned_run_id !== cell.planned_run_id || last.run_id !== cell.planned_run_id || last.attempt_id !== pause.attempt_id || last.phase !== pause.phase || stableJson(last.pause_evidence_ref) !== stableJson(paused.pause_evidence_ref) || last.journal_prefix_sha256 !== pause.journal_prefix_sha256) errors.push("attempt_paused identity/digest relation drift");
	const attemptStarts = events.filter((event) => event.type === "attempt_started");
	const attemptIds = new Set(attemptStarts.map((event) => event.data.attempt_id));
	if (attemptStarts.length < 1 || attemptStarts.length > 2 || attemptIds.size !== attemptStarts.length || attemptStarts.some((event, index) => event.data.ordinal !== index + 1 || event.data.parent_attempt_id !== (index === 0 ? null : attemptStarts[index - 1]!.data.attempt_id))) errors.push("paused Attempt start identity/lineage drift");
	const activeAttempt = attemptStarts.at(-1);
	if (!activeAttempt || activeAttempt.data.attempt_id !== pause.attempt_id) errors.push("pause evidence active Attempt identity drift");
	const v1c = manifest.schema_version === "v1c-execution-manifest-v1";
	const reservations = events.filter((event) => event.type === "provider_request_reserved");
	if (!v1c && reservations.length > 1) errors.push("paused Run violates single-request authority");
	const reservationsByAttempt = new Map<string, JournalEventV1B[]>();
	const reservationIds = new Set<string>();
	for (const event of reservations) {
		if (event.data.phase !== "provider_request_reserved_before_dispatch") errors.push("provider reservation phase invalid");
		const attempt = attemptStarts.find((candidate) => candidate.data.attempt_id === event.data.attempt_id);
		const attemptIndex = attempt ? events.indexOf(attempt) : -1;
		const reservationIndex = events.indexOf(event);
		const pauseIndex = events.findIndex((candidate) => candidate.type === "attempt_paused");
		const attemptReservations = reservationsByAttempt.get(event.data.attempt_id) ?? [];
		attemptReservations.push(event); reservationsByAttempt.set(event.data.attempt_id, attemptReservations);
		const reservationId = event.data.reservation?.reservation_id;
		if (attemptIndex < 0 || reservationIndex <= attemptIndex || pauseIndex <= reservationIndex || event.data.session_id !== pause.session_id || event.data.workspace_id !== pause.workspace_id || v1c && event.data.run_id !== pause.run_id || typeof reservationId !== "string" || reservationIds.has(reservationId)) errors.push("provider reservation write-before-dispatch identity/order drift");
		if (typeof reservationId === "string") reservationIds.add(reservationId);
		const expectedOrdinal = attemptReservations.length;
		if (event.data.request_ordinal !== expectedOrdinal) errors.push("paused Provider request ordinal sequence drift");
		for (const key of ["provider_requests", "network_calls", "provider_calls", "model_calls"] as const) {
			const transition = event.data.counter_transition?.[key];
			if (!transition || !Number.isSafeInteger(transition.before) || !Number.isSafeInteger(transition.after) || transition.before < 0 || transition.after < transition.before || transition.after - transition.before > 1) errors.push(`provider reservation ${key} counter transition invalid`);
		}
		const providerTransition = event.data.counter_transition?.provider_requests;
		if (!providerTransition || providerTransition.before !== expectedOrdinal - 1 || providerTransition.after !== expectedOrdinal) errors.push("provider reservation Attempt-scoped request transition drift");
		const externalBefore = manifest.execution_mode === "stage2_real" ? reservations.indexOf(event) : 0;
		const externalAfter = manifest.execution_mode === "stage2_real" ? externalBefore + 1 : 0;
		for (const key of ["network_calls", "provider_calls", "model_calls"] as const) if (event.data.counter_transition?.[key]?.before !== externalBefore || event.data.counter_transition?.[key]?.after !== externalAfter) errors.push(`provider reservation Run-wide ${key} transition drift`);
	}
	const finalReservation = reservations.at(-1);
	if (reservations.length > 0 && (pause.request_ordinal !== finalReservation?.data.request_ordinal || finalReservation?.data.attempt_id !== pause.attempt_id)) errors.push("pause request ordinal/active-Attempt reservation relation drift");
	for (const [index, attempt] of attemptStarts.entries()) {
		const attemptId = attempt.data.attempt_id;
		const attemptIndex = events.indexOf(attempt);
		const nextStartIndex = index + 1 < attemptStarts.length ? events.indexOf(attemptStarts[index + 1]!) : Number.POSITIVE_INFINITY;
		const settled = events.filter((event) => event.type === "attempt_settled" && event.data.attempt_id === attemptId);
		const verified = events.filter((event) => event.type === "verifier_completed" && event.data.attempt_id === attemptId);
		if (attemptId !== pause.attempt_id) {
			if (settled.length !== 1 || verified.length !== 1 || events.indexOf(settled[0]!) <= events.indexOf(attempt) || events.indexOf(verified[0]!) <= events.indexOf(settled[0]!) || events.indexOf(verified[0]!) >= nextStartIndex) errors.push(`paused prior Attempt completion/order drift: ${attemptId}`);
		} else if (pause.pending_provider_reservation && (settled.length !== 0 || verified.length !== 0)) errors.push("paused active Attempt contains settled/Verifier event after pending reservation");
		const providerBoundary = attemptId === pause.attempt_id ? pauseEvents[0] : settled[0];
		const providerBoundaryIndex = providerBoundary ? events.indexOf(providerBoundary) : -1;
		const providerEvents = events.filter((event) => ["provider_request_reserved", "provider_usage_committed", "local_budget_stop_recorded", "local_budget_stop_consumed"].includes(event.type) && event.data.attempt_id === attemptId);
		if (providerBoundaryIndex < 0 || providerEvents.some((event) => events.indexOf(event) <= attemptIndex || events.indexOf(event) >= providerBoundaryIndex)) errors.push(`paused Attempt Provider-event boundary drift: ${attemptId}`);
	}
	for (const [key, value] of Object.entries(pause.counter_snapshot)) if (!Number.isSafeInteger(value) || value < 0 || value > (v1c && key !== "credential_reads" ? Math.max(1, reservations.length) : 1)) errors.push("pause counter snapshot invalid");
	const stage2 = manifest.execution_mode === "stage2_real";
	const zeroCounters = { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 };
	const credentialOnly = { credential_reads: 1, network_calls: 0, provider_calls: 0, model_calls: 0 };
	const possibleDispatch = { credential_reads: 1, network_calls: 1, provider_calls: 1, model_calls: 1 };
	const phase = pause.phase;
	if (!stage2 && ["before_credential_resolution", "credential_resolution_failure_before_dispatch", "after_credential_before_provider_request_reservation"].includes(phase)) errors.push("Stage 1 deterministic seam masquerades as Stage 2 credential phase");
	if (["before_credential_resolution", "credential_resolution_failure_before_dispatch"].includes(phase) && stableJson(pause.counter_snapshot) !== stableJson(zeroCounters)) errors.push("pre-credential pause counter matrix drift");
	if (phase === "after_credential_before_provider_request_reservation" && (!stage2 || stableJson(pause.counter_snapshot) !== stableJson(credentialOnly))) errors.push("post-credential pause counter matrix drift");
	if (phase === "other_bounded_runtime_failure" && stableJson(pause.counter_snapshot) !== stableJson(stage2 ? credentialOnly : zeroCounters)) errors.push("other bounded pause counter matrix drift");
	if (["after_provider_request_reservation_usage_unavailable", "invalid_or_unknown_usage_after_provider_response"].includes(phase)) {
		const priorDispatchCount = Math.max(0, reservations.length - 1);
		const beforeCurrentDispatch = { credential_reads: 1, network_calls: priorDispatchCount, provider_calls: priorDispatchCount, model_calls: priorDispatchCount };
		const afterCurrentDispatch = { credential_reads: 1, network_calls: reservations.length, provider_calls: reservations.length, model_calls: reservations.length };
		const validPostReservationSnapshot = stage2
			? (v1c ? [beforeCurrentDispatch, afterCurrentDispatch] : [credentialOnly, possibleDispatch]).some((expected) => stableJson(pause.counter_snapshot) === stableJson(expected))
			: stableJson(pause.counter_snapshot) === stableJson(zeroCounters);
		if (!validPostReservationSnapshot) errors.push("post-reservation pause counter snapshot/mode drift");
		const transition = reservations.at(-1)?.data.counter_transition;
		const activeReservations = reservationsByAttempt.get(pause.attempt_id) ?? [];
		const expectedBefore = activeReservations.length - 1;
		if (!transition || transition.provider_requests.before !== expectedBefore || transition.provider_requests.after !== activeReservations.length) errors.push("post-reservation provider request transition is not exact Attempt ordinal transition");
		for (const key of ["network_calls", "provider_calls", "model_calls"] as const) {
			const expectedAfter = stage2 ? reservations.length : 0;
			const expectedExternalBefore = stage2 ? reservations.length - 1 : 0;
			if (!transition || transition[key].before !== expectedExternalBefore || transition[key].after !== expectedAfter) errors.push(`post-reservation ${key} transition/mode drift`);
		}
	}
	if (!["after_provider_request_reservation_usage_unavailable", "invalid_or_unknown_usage_after_provider_response"].includes(phase) && reservations.length !== 0) errors.push("pre-reservation phase carries reservation event");
	if (pause.pending_provider_reservation) {
		if (reservations.length === 0 || pause.pending_provider_reservation.reservation_id !== finalReservation?.data.reservation?.reservation_id) errors.push("pending reservation/journal relation drift");
		const pending = pause.pending_provider_reservation;
		if (pending.tokens !== finalReservation?.data.reservation?.token_cap || Math.abs(pending.cost_usd - (finalReservation?.data.reservation?.cost_usd_cap ?? Number.NaN)) > Number.EPSILON || pending.provider_requests !== 1) errors.push("pending reservation cap/ordinal relation drift");
		if (pause.conservative_usage_charge.provider_requests !== pending.provider_requests || pause.conservative_usage_charge.tokens !== pending.tokens || Math.abs(pause.conservative_usage_charge.cost_usd - pending.cost_usd) > Number.EPSILON) errors.push("conservative charge does not equal pending reservation");
	} else if (!usageEqual(pause.conservative_usage_charge, zeroUsage()) || reservations.length !== 0) errors.push("pre-reservation pause carries dispatch/reservation charge");
	const commits = events.filter((event) => event.type === "provider_usage_committed");
	if (v1c) {
		if (commits.length !== Math.max(0, reservations.length - (pause.pending_provider_reservation ? 1 : 0))) errors.push("V1-C paused Provider commit count drift");
		for (const [index, commit] of commits.entries()) {
			const matches = reservations.filter((reservation) => reservation.data.attempt_id === commit.data.attempt_id && reservation.data.request_ordinal === commit.data.request_ordinal && reservation.data.reservation?.reservation_id === commit.data.reservation_id);
			const reservation = matches[0];
			const nextAttemptIndex = attemptStarts.findIndex((attempt) => events.indexOf(attempt) > events.indexOf(commit));
			const boundary = nextAttemptIndex >= 0 ? events.indexOf(attemptStarts[nextAttemptIndex]!) : events.findIndex((event) => event.type === "attempt_paused");
			const transition = commit.data.transition;
			const priorTransition = commits[index - 1]?.data.transition;
			if (matches.length !== 1 || !reservation || commit.data.schema_version !== "v1c-provider-usage-committed-v1" || commit.data.protocol_id !== "v1c_typed_predispatch_budget_stop_v1" || commit.data.run_id !== pause.run_id || !attemptIds.has(commit.data.attempt_id) || commit.data.session_id !== pause.session_id || commit.data.workspace_id !== pause.workspace_id || events.indexOf(commit) <= events.indexOf(reservation) || events.indexOf(commit) >= boundary || transition?.provider_requests?.before !== index || transition?.provider_requests?.after !== index + 1 || transition?.tokens?.before !== (priorTransition?.tokens?.after ?? 0) || transition?.cost_usd?.before !== (priorTransition?.cost_usd?.after ?? 0) || !Number.isSafeInteger(transition?.tokens?.after) || transition.tokens.after < transition.tokens.before || !Number.isFinite(transition?.cost_usd?.after) || transition.cost_usd.after < transition.cost_usd.before) errors.push("V1-C paused Provider commit identity/accounting/order drift");
		}
		for (const reservation of reservations) {
			const matching = commits.filter((commit) => commit.data.attempt_id === reservation.data.attempt_id && commit.data.request_ordinal === reservation.data.request_ordinal && commit.data.reservation_id === reservation.data.reservation?.reservation_id);
			if (reservation === finalReservation && pause.pending_provider_reservation ? matching.length !== 0 : matching.length !== 1) errors.push("V1-C paused reservation/commit one-to-one relation drift");
		}
		const lastCommit = commits.at(-1)?.data.transition;
		if (pause.accumulated_known_usage.provider_requests !== commits.length || pause.accumulated_known_usage.tokens !== (lastCommit?.tokens?.after ?? 0) || Math.abs(pause.accumulated_known_usage.cost_usd - (lastCommit?.cost_usd?.after ?? 0)) > Number.EPSILON) errors.push("V1-C paused accumulated known usage/commit chain drift");
	} else if (commits.length !== 0) errors.push("V1-B historical protocol rejects V1-C Provider commit events");
	if (!usageEqual(pause.budget_usage_after_conservative_charge, addUsage(pause.accumulated_known_usage, pause.conservative_usage_charge))) errors.push("pause conservative accounting chain invalid");
	if (["before_credential_resolution", "credential_resolution_failure_before_dispatch", "after_credential_before_provider_request_reservation"].includes(pause.phase) && pause.pending_provider_reservation !== null) errors.push("pre-reservation pause phase carries pending reservation");
	if (["after_provider_request_reservation_usage_unavailable", "invalid_or_unknown_usage_after_provider_response"].includes(pause.phase) && pause.pending_provider_reservation === null) errors.push("post-reservation pause phase lacks pending reservation");
	return pause;
}

function assertActualBytesSafe(label: string, bytes: Buffer): void {
	if (FORBIDDEN_PERSISTED_EVIDENCE_V1B.test(bytes.toString("utf8"))) throw new Error(`Inspector secret/reasoning byte scan rejected ${label}`);
}

function readFrozenSkillWrapper(projectRoot: string, expectedDigest: string): { wrapper: string; sourceSize: number } {
	const identity = expectedSkillIdentityV1(projectRoot);
	const source = readFileSync(resolve(projectRoot, identity.source_ref), "utf8");
	if (sha256(source) !== expectedDigest || sha256(source) !== identity.source_sha256 || Buffer.byteLength(source) !== identity.source_size_bytes) throw new Error("Inspector frozen Skill source binding drift");
	const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/.exec(source);
	if (!match) throw new Error("Inspector frozen Skill frontmatter invalid");
	const wrapper = formatSkillInvocation({ name: identity.name, description: identity.description, content: match[1]!.trim(), filePath: identity.canonical_source_path, disableModelInvocation: true });
	if (sha256(wrapper) !== identity.wrapper_sha256 || Buffer.byteLength(wrapper) !== identity.wrapper_size_bytes) throw new Error("Inspector public Skill wrapper binding drift");
	return { wrapper, sourceSize: Buffer.byteLength(source) };
}

function lastUserText(dispatch: TerminalCellEvidenceV1B["initial_dispatch"]): string {
	const messages = dispatch.context.messages as Array<{ role?: string; content?: unknown }>;
	const user = messages.findLast((entry) => entry.role === "user");
	if (!user) throw new Error("fairness dispatch lacks user message");
	if (typeof user.content === "string") return user.content;
	if (!Array.isArray(user.content)) throw new Error("fairness user content shape invalid");
	return user.content.flatMap((part) => part && typeof part === "object" && (part as { type?: string }).type === "text" ? [String((part as { text?: unknown }).text ?? "")] : []).join("");
}

function normalizedExactDispatch(terminal: TerminalCellEvidenceV1B, expectedText: string): string {
	if (lastUserText(terminal.initial_dispatch) !== expectedText) throw new Error("initial Skill treatment text is not the frozen expected value");
	const value = structuredClone(terminal.initial_dispatch);
	const messages = value.context.messages as Array<{ role?: string; content?: unknown }>;
	const user = messages.findLast((entry) => entry.role === "user")!;
	if (typeof user.content === "string") user.content = "<V1B_EXACT_TREATMENT_TEXT>";
	else user.content = (user.content as Array<Record<string, unknown>>).map((part) => part.type === "text" ? { ...part, text: "<V1B_EXACT_TREATMENT_TEXT>" } : part);
	value.payload_sha256 = "<DIGEST>";
	return stableJson(value);
}

function expectedVerifierDigest(manifest: ExecutionManifestV1B, taskId: string): string {
	const id = Object.keys(manifest.bindings.verifier_digests).find((value) => value.includes(taskId.replace(/^v1-/, "")));
	if (!id) throw new Error("Inspector task Verifier binding absent");
	return manifest.bindings.verifier_digests[id]!;
}

function validateReservationRecord(record: BudgetReservationEvidenceV1B, expectedCap: BudgetCapsV1B, errors: string[]): void {
	if (stableJson(record.cap) !== stableJson(expectedCap)) errors.push(`${record.level} reservation cap drift`);
	let expectedAfter = structuredClone(record.before);
	for (const key of USAGE_KEYS) {
		const values = [record.before[key], record.reserved[key], record.actual[key], record.after[key]];
		if (values.some((value) => !Number.isFinite(value) || value < 0)) errors.push(`${record.level} ${record.kind} reservation contains unknown/negative usage`);
		if (key !== "cost_usd" && values.some((value) => !Number.isSafeInteger(value))) errors.push(`${record.level} ${record.kind} reservation contains fractional usage`);
		if (record.actual[key] > record.reserved[key] + Number.EPSILON) errors.push(`${record.level} ${record.kind} actual exceeds reserved ${key}`);
		if (record.before[key] + record.reserved[key] > capValue(expectedCap, key) + Number.EPSILON) errors.push(`${record.level} ${record.kind} reserved ceiling exceeds cap ${key}`);
		expectedAfter[key] += record.actual[key];
	}
	if (!usageEqual(record.after, expectedAfter)) errors.push(`${record.level} ${record.kind} before/actual/after mismatch`);
}

function validateReservations(terminal: TerminalCellEvidenceV1B, manifest: ExecutionManifestV1B, errors: string[]): void {
	const runCap = terminal.cell.arm === "C" ? manifest.budgets.arm_c_run : manifest.budgets.arm_a_or_b_run;
	for (const record of terminal.reservations) validateReservationRecord(record, record.level === "attempt" ? manifest.budgets.initial_attempt : record.level === "run" ? runCap : manifest.budgets.pilot, errors);
	for (const level of ["run", "pilot"] as const) {
		const records = terminal.reservations.filter((entry) => entry.level === level);
		for (let index = 1; index < records.length; index++) if (!usageEqual(records[index]!.before, records[index - 1]!.after)) errors.push(`${level} reservation chain is discontinuous`);
	}
	const attemptScopes = new Map<string, BudgetReservationEvidenceV1B[]>();
	for (const record of terminal.reservations.filter((entry) => entry.level === "attempt")) { const list = attemptScopes.get(record.scope_id) ?? []; list.push(record); attemptScopes.set(record.scope_id, list); }
	for (const [scope, records] of attemptScopes) for (let index = 1; index < records.length; index++) if (!usageEqual(records[index]!.before, records[index - 1]!.after)) errors.push(`attempt reservation chain is discontinuous for ${scope}`);
	const runRecords = terminal.reservations.filter((entry) => entry.level === "run");
	if (runRecords.length === 0 || !usageEqual(runRecords[0]!.before, zeroUsage()) || !usageEqual(runRecords.at(-1)!.after, terminal.budget_usage)) errors.push("Run reservation chain does not recompute terminal usage");
	for (const attempt of terminal.attempts) {
		const records = attemptScopes.get(attempt.attempt_id) ?? [];
		const actual = records.reduce((sum, record) => addUsage(sum, record.actual), zeroUsage());
		if (actual.provider_requests !== attempt.provider_requests || actual.tool_calls !== attempt.tool_calls || actual.tokens !== attempt.tokens || Math.abs(actual.cost_usd - attempt.cost_usd) > Number.EPSILON || actual.active_execution_time_ms !== attempt.active_execution_time_ms || actual.verifier_runs !== 1) errors.push(`Attempt reservation actual usage mismatch: ${attempt.attempt_id}`);
	}
	const childRecords = terminal.reservations.filter((entry) => entry.kind === "child");
	if (childRecords.length !== terminal.budget_usage.child_attempts * 3) errors.push("child three-level reservation count mismatch");
	for (const record of childRecords) {
		if (record.reserved.provider_requests !== manifest.budgets.initial_attempt.provider_requests || record.reserved.tool_calls !== manifest.budgets.initial_attempt.tool_calls || record.reserved.tokens !== manifest.budgets.initial_attempt.tokens || record.reserved.active_execution_time_ms !== manifest.budgets.initial_attempt.wall_time_ms || record.reserved.verifier_runs !== manifest.budgets.initial_attempt.verifier_runs || Math.abs(record.reserved.cost_usd - manifest.budgets.initial_attempt.cost_usd) > Number.EPSILON) errors.push("complete child reserve is incomplete");
	}
	for (const [kind, count] of [["provider_request", terminal.budget_usage.provider_requests], ["tool_call", terminal.budget_usage.tool_calls], ["verifier", terminal.budget_usage.verifier_runs], ["attempt_time", terminal.attempts.length], ["child", terminal.budget_usage.child_attempts]] as const) {
		for (const level of ["attempt", "run", "pilot"] as const) if (terminal.reservations.filter((entry) => entry.kind === kind && entry.level === level).length !== count) errors.push(`${kind} ${level} reservation count mismatch`);
	}
}

function validateTaxonomy(terminal: TerminalCellEvidenceV1B, runResult: RunResultV1, ledgerState: string, errors: string[]): void {
	const table = {
		task_pass: { disposition: "terminal", status: "passed", attribution: "none", excluded: false },
		task_fail: { disposition: "terminal", status: "failed", attribution: "none", excluded: false },
		treatment_guardrail_failure: { disposition: "invalid", status: "invalid", attribution: "treatment", excluded: false },
		infrastructure_invalid: { disposition: "invalid", status: "infrastructure_error", attribution: "infrastructure", excluded: true },
		evidence_invalid: { disposition: "invalid", status: "invalid", attribution: "evidence", excluded: true },
	} as const;
	const expected = table[terminal.failure_class as keyof typeof table];
	if (!expected || terminal.disposition !== expected.disposition || terminal.final_verifier_status !== expected.status || terminal.invalid_attribution !== expected.attribution || terminal.exclusion_preauthorized !== expected.excluded) errors.push("terminal Failure Taxonomy combination invalid");
	if (ledgerState !== terminal.disposition) errors.push("ledger/terminal disposition mismatch");
	if (terminal.disposition === "invalid" ? !terminal.cause_id : terminal.cause_id !== null) errors.push("terminal typed cause relation invalid");
	if (runResult.evidence.invalid_attribution !== terminal.invalid_attribution || runResult.evidence.exclusion_preauthorized !== terminal.exclusion_preauthorized) errors.push("RunResult taxonomy relation drift");
}

function validateRuntimeDiagnosticsV1C(runRoot: string, manifest: ExecutionManifestV1B, terminal: TerminalCellEvidenceV1B, runResult: RunResultV1, errors: string[]): void {
	const events = readFileSync(resolve(runRoot, "journal.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JournalEventV1B);
	validateTerminalJournalStructure(events, terminal, errors);
	const recorded = events.filter((event) => event.type === "local_budget_stop_recorded");
	const consumed = events.filter((event) => event.type === "local_budget_stop_consumed");
	const commits = events.filter((event) => event.type === "provider_usage_committed");
	const reservations = events.filter((event) => event.type === "provider_request_reserved");
	const terminalDiagnostics = terminal.runtime_diagnostics ?? [];
	const runDiagnostics = runResult.evidence.runtime_diagnostics ?? [];
	const attemptDiagnostics = terminal.attempts.flatMap((attempt) => attempt.runtime_diagnostics ?? []);
	if (manifest.schema_version !== "v1c-execution-manifest-v1") {
		if (recorded.length !== 0 || consumed.length !== 0 || commits.length !== 0 || terminalDiagnostics.length !== 0 || runDiagnostics.length !== 0 || attemptDiagnostics.length !== 0) errors.push("V1-B historical protocol rejects V1-C runtime diagnostics");
		return;
	}
	if (stableJson(terminalDiagnostics) !== stableJson(runDiagnostics) || stableJson(terminalDiagnostics) !== stableJson(attemptDiagnostics)) errors.push("V1-C runtime diagnostic evidence relation drift");
	if (recorded.length !== terminalDiagnostics.length || consumed.length !== terminalDiagnostics.length) errors.push("V1-C typed local stop record/consumption count drift");
	for (const signal of terminalDiagnostics) {
		const attempt = terminal.attempts.find((value) => value.attempt_id === signal.attempt_id);
		if (signal.schema_version !== "v1c-local-budget-stop-v1" || signal.protocol_id !== "v1c_typed_predispatch_budget_stop_v1" || signal.run_id !== terminal.run_id || signal.session_id !== terminal.session_id || signal.workspace_id !== terminal.workspace_id || !attempt || signal.request_ordinal !== attempt.provider_requests + 1 || signal.phase !== "provider_request_reservation_rejected_before_dispatch" || signal.reason !== "provider_request_cap" || signal.reservation_transition.provider_requests_before !== attempt.provider_requests || signal.reservation_transition.provider_requests_requested_after !== signal.request_ordinal || signal.reservation_transition.pending_before !== false || signal.reservation_transition.pending_after !== false) errors.push("V1-C typed local stop identity/ordinal/transition drift");
		const matchingRecorded = recorded.filter((event) => stableJson(event.data) === stableJson(signal));
		const matchingConsumed = consumed.filter((event) => stableJson(event.data) === stableJson(signal));
		if (matchingRecorded.length !== 1 || matchingConsumed.length !== 1) { errors.push("V1-C typed local stop missing/duplicate/forged"); continue; }
		const recordedIndex = events.indexOf(matchingRecorded[0]!);
		const consumedIndex = events.indexOf(matchingConsumed[0]!);
		const settledIndex = events.findIndex((event) => event.type === "attempt_settled" && event.data.attempt_id === signal.attempt_id);
		const verifierIndex = events.findIndex((event) => event.type === "verifier_completed" && event.data.attempt_id === signal.attempt_id);
		if (recordedIndex < 0 || consumedIndex <= recordedIndex || settledIndex <= consumedIndex || verifierIndex <= settledIndex) errors.push("V1-C local stop/settled/Verifier order drift");
		const attemptReservations = reservations.filter((event) => event.data.attempt_id === signal.attempt_id);
		if (attemptReservations.length !== attempt?.provider_requests || attemptReservations.some((event, index) => event.data.request_ordinal !== index + 1) || attemptReservations.some((event) => event.data.request_ordinal === signal.request_ordinal)) errors.push("V1-C local stop reservation ordinal relation drift");
	}
	if (commits.length !== terminal.attempts.reduce((sum, attempt) => sum + attempt.provider_requests, 0)) errors.push("V1-C terminal Provider commit count drift");
	for (const commit of commits) {
		const reservation = reservations.find((event) => event.data.attempt_id === commit.data.attempt_id && event.data.request_ordinal === commit.data.request_ordinal);
		const runRecord = terminal.reservations.find((record) => record.level === "run" && record.kind === "provider_request" && record.reservation_id === commit.data.reservation_id);
		if (!reservation || !runRecord || commit.data.schema_version !== "v1c-provider-usage-committed-v1" || commit.data.protocol_id !== "v1c_typed_predispatch_budget_stop_v1" || commit.data.run_id !== terminal.run_id || commit.data.session_id !== terminal.session_id || commit.data.workspace_id !== terminal.workspace_id || commit.data.reservation_id !== reservation.data.reservation?.reservation_id || events.indexOf(commit) <= events.indexOf(reservation) || stableJson(commit.data.transition) !== stableJson({ provider_requests: { before: runRecord.before.provider_requests, after: runRecord.after.provider_requests }, tokens: { before: runRecord.before.tokens, after: runRecord.after.tokens }, cost_usd: { before: runRecord.before.cost_usd, after: runRecord.after.cost_usd } })) errors.push("V1-C terminal Provider commit identity/accounting/order drift");
	}
}

export function inspectV1RunCell(options: { projectRoot: string; pilotRoot: string; plannedRunId: string }): InspectRunResultV1B {
	const errors: string[] = [];
	let runResult: RunResultV1 | null = null;
	let terminal: TerminalCellEvidenceV1B | null = null;
	let pauseEvidence: PauseEvidenceV1B | null = null;
	try {
		const manifest = readJson<ExecutionManifestV1B>(resolve(options.pilotRoot, "manifest.json")); validateExecutionManifestV1B(manifest, options.projectRoot);
		const bindings = deriveManifestBindingsV1(options.projectRoot);
		const ledger = readPilotLedgerV1B(options.pilotRoot); validatePilotLedgerV1B(manifest, ledger);
		const cell = manifest.cells.find((value) => value.planned_run_id === options.plannedRunId); if (!cell) throw new Error("Inspector Run is not a Manifest member");
		const transitions = ledger.filter((entry) => entry.cell_id === cell.cell_id);
		if (transitions.at(-1)?.state === "paused" && transitions.some((entry) => entry.state === "started")) {
			pauseEvidence = inspectPausedRunV1B({ pilotRoot: options.pilotRoot, manifest, cell, transitions, errors });
			return { integrity_valid: errors.length === 0, errors, run_result: null, terminal: null, pause_evidence: errors.length === 0 ? pauseEvidence : null, pause_integrity_valid: errors.length === 0, terminal_valid: false, comparable: false };
		}
		if (transitions.length !== 3 || transitions[0]?.state !== "planned" || transitions[1]?.state !== "started" || !["terminal", "invalid"].includes(transitions[2]?.state ?? "")) throw new Error("Inspector ledger transition is not planned->started->terminal|invalid");
		if (transitions[2]!.run_result_ref !== `runs/${cell.planned_run_id}/run-result.json`) throw new Error("Inspector ledger RunResult relation drift");
		const runRoot = resolve(options.pilotRoot, "runs", cell.planned_run_id);
		const terminalJournalEvents = readFileSync(resolve(runRoot, "journal.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as JournalEventV1B);
		validateJournalEnvelopes(terminalJournalEvents, "terminal", errors);
		const marker = readJson<TerminalMarkerV1B>(resolve(runRoot, "terminal.json"));
		if (marker.manifest_id !== manifest.manifest_id || marker.cell_id !== cell.cell_id || marker.planned_run_id !== cell.planned_run_id) errors.push("Inspector terminal marker identity drift");
		for (const [label, ref] of [["run result", marker.run_result_ref], ["terminal evidence", marker.terminal_evidence_ref]] as const) errors.push(...validateArtifactRef(runRoot, ref).map((error) => `${label}: ${error}`));
		runResult = readJson<RunResultV1>(resolve(runRoot, marker.run_result_ref.path)); terminal = readJson<TerminalCellEvidenceV1B>(resolve(runRoot, marker.terminal_evidence_ref.path));
		assertActualBytesSafe("terminal.json", readFileSync(resolve(runRoot, "terminal.json"))); assertActualBytesSafe("terminal-evidence.json", readFileSync(resolve(runRoot, marker.terminal_evidence_ref.path)));
		if (stableJson(terminal.cell) !== stableJson(cell) || terminal.manifest_id !== manifest.manifest_id || terminal.run_id !== cell.planned_run_id) errors.push("terminal evidence membership drift");
		if (marker.disposition !== terminal.disposition || marker.failure_class !== terminal.failure_class || marker.cause_id !== terminal.cause_id || transitions[2]!.cause_id !== terminal.cause_id) errors.push("terminal marker taxonomy relation drift");
		if (!terminal.protected_paths_unchanged || !terminal.secret_scan.passed || terminal.secret_scan.match_count !== 0 || terminal.secret_scan.reasoning_payloads !== 0) errors.push("terminal evidence guardrail invalid");
		if (manifest.execution_mode === "stage1_zero_call" && Object.values(terminal.real_call_counters).some((count) => count !== 0)) errors.push("Stage 1 real-call counter is nonzero");
		const task = loadCandidateTaskPackV1(options.projectRoot).find((value) => value.task_id === cell.task_id); if (!task) throw new Error("Inspector task binding absent");
		const skill = readFrozenSkillWrapper(options.projectRoot, manifest.bindings.skill_digest);
		const configCell = readJson(resolve(runRoot, "config/cell.json")); if (stableJson(configCell) !== stableJson(cell)) errors.push("config cell binding drift");
		const manifestRef = readJson<{ manifest_id: string; workbench_source_digest: string; pi_commit: string }>(resolve(runRoot, "config/manifest-ref.json"));
		if (stableJson(manifestRef) !== stableJson({ manifest_id: manifest.manifest_id, workbench_source_digest: manifest.workbench_source_digest, pi_commit: manifest.pi_commit })) errors.push("config Manifest/source/Pi binding drift");
		const instruction = readFileSync(resolve(options.projectRoot, task.instruction_ref)); if (!instruction.equals(readFileSync(resolve(runRoot, "config/instruction.md"))) || sha256(instruction) !== task.instruction_sha256) errors.push("task instruction binding drift");
		const verifier = readFileSync(resolve(options.projectRoot, task.external_verifier_ref)); if (!verifier.equals(readFileSync(resolve(runRoot, "config/verifier.mjs"))) || sha256(verifier) !== task.external_verifier_sha256) errors.push("Verifier source binding drift");
		const workspaceTreeRef = scanFinalWorkspaceTreeV1B(resolve(runRoot, "workspace"));
		if (marker.final_workspace_digest !== workspaceTreeRef.sha256 || stableJson(marker.final_workspace_ref) !== stableJson(workspaceTreeRef) || stableJson(terminal.workspace_tree_ref) !== stableJson(workspaceTreeRef)) errors.push("final Workspace tree reference drift");
		const expectedSemantic = {
			task_digest: digestObject(task), workspace_source_digest: task.workspace_source_digest, prompt_digest: bindings.base_prompt_digest,
			skill_digest: cell.arm === "A" ? null : bindings.skill_digest, strategy_digest: bindings.strategy_digests[cell.strategy_id], tool_digest: bindings.tool_profile_digest,
			verifier_digest: expectedVerifierDigest(manifest, task.task_id), model_profile_digest: bindings.model_profile_digest, workbench_digest: manifest.workbench_source_digest, pi_digest: manifest.pi_commit,
		};
		for (const [key, expected] of Object.entries(expectedSemantic)) if ((runResult.evidence as unknown as Record<string, unknown>)[key] !== expected) errors.push(`RunResult semantic binding drift: ${key}`);
		if (runResult.evidence.skill_wrapper_bytes !== (cell.arm === "A" ? 0 : Buffer.byteLength(skill.wrapper)) || runResult.evidence.skill_body_bytes !== (cell.arm === "A" ? 0 : skill.sourceSize)) errors.push("RunResult Skill wrapper/body size drift");
		const dispatch = { model: terminal.initial_dispatch.model, context: terminal.initial_dispatch.context, options: terminal.initial_dispatch.options, provider_payload: terminal.initial_dispatch.provider_payload };
		if (terminal.initial_dispatch.payload_sha256 !== sha256(stableJson(dispatch))) errors.push("initial dispatch digest mismatch");
		if (/(?:strategy_id|experiment_id|manifest_id|recovery_budget|policy_id|verifier_source|verifier_host)/i.test(stableJson(dispatch))) errors.push("host-only identity leaked into initial dispatch");
		const seen = new Map<string, number>();
		for (const ref of terminal.artifact_refs) {
			seen.set(ref.path, (seen.get(ref.path) ?? 0) + 1); errors.push(...validateArtifactRef(runRoot, refEnvelope(ref)).map((error) => `${ref.path}: ${error}`));
			assertActualBytesSafe(ref.path, readFileSync(resolve(runRoot, ref.path)));
		}
		for (const [path, count] of seen) if (count !== 1) errors.push(`duplicate terminal ArtifactRef: ${path}`);
		const required = ["config/cell.json", "config/manifest-ref.json", "config/instruction.md", "config/verifier.mjs", "journal.jsonl", "run-result.json", "secret-scan.json"];
		for (const attempt of terminal.attempts) required.push(`attempts/0${attempt.ordinal}-${attempt.attempt_id}/verifier-result.json`, `attempts/0${attempt.ordinal}-${attempt.attempt_id}/verifier-output.txt`);
		if (terminal.recovery_started) required.push("recovery/failure-packet.json");
		for (const path of required) if (seen.get(path) !== 1) errors.push(`terminal evidence missing/duplicate required artifact: ${path}`);
		if (terminal.artifact_refs.length !== required.length) errors.push("terminal evidence contains undeclared extra/missing ArtifactRefs");
		if (!verifierStatusAllowed(terminal.initial_verifier_status) || !verifierStatusAllowed(terminal.final_verifier_status)) errors.push("terminal Verifier status invalid");
		if (terminal.attempts.length < 1 || terminal.attempts.length > 2 || terminal.attempts[0]?.ordinal !== 1 || terminal.attempts[0]?.parent_attempt_id !== null) errors.push("terminal Attempt lineage invalid");
		for (const attempt of terminal.attempts) {
			const expectedAttemptId = `${cell.planned_run_id}-a${attempt.ordinal}`; if (attempt.attempt_id !== expectedAttemptId || attempt.session_id !== terminal.session_id || attempt.workspace_id !== terminal.workspace_id || !attempt.settled) errors.push(`Attempt identity/session/workspace drift: ${attempt.attempt_id}`);
			const prefix = `attempts/0${attempt.ordinal}-${attempt.attempt_id}`; const result = readJson<VerifierResultV0B>(resolve(runRoot, `${prefix}/verifier-result.json`));
			if (result.attempt_id !== attempt.attempt_id || result.status !== attempt.verifier_status || result.verifier_id !== task.external_verifier_id || result.verifier_sha256 !== task.external_verifier_sha256 || result.execution.source_sha256 !== task.external_verifier_sha256 || result.full_output_ref.path !== `${prefix}/verifier-output.txt` || result.full_output_ref.sha256 !== fileSha256(resolve(runRoot, result.full_output_ref.path))) errors.push(`Verifier result/output binding drift: ${attempt.attempt_id}`);
		}
		if (terminal.initial_verifier_status !== terminal.attempts[0]!.verifier_status || terminal.final_verifier_status !== terminal.attempts.at(-1)!.verifier_status) errors.push("Verifier checkpoint/Attempt relation drift");
		if (terminal.attempts.length === 2 && (cell.arm !== "C" || terminal.attempts[1]?.parent_attempt_id !== terminal.attempts[0]?.attempt_id || terminal.initial_verifier_status !== "failed" || !terminal.recovery_started)) errors.push("terminal child topology invalid");
		if (terminal.attempts.length === 1 && terminal.recovery_started) errors.push("terminal recovery flag invalid");
		if (cell.arm !== "C" && (terminal.recovery_eligible || terminal.recovery_started || terminal.attempts.length !== 1)) errors.push("non-C child/recovery rejected");
		if (terminal.recovery_started && (!terminal.recovery_eligible || terminal.initial_verifier_status !== "failed")) errors.push("ineligible C recovery");
		if (runResult.run_id !== cell.planned_run_id || runResult.manifest_id !== manifest.manifest_id || runResult.task_id !== cell.task_id || runResult.strategy_id !== cell.strategy_id || runResult.order_slot !== cell.order_slot || runResult.repetition !== cell.repetition) errors.push("RunResult membership drift");
		if (runResult.attempt_count !== terminal.attempts.length || runResult.child_attempt_count !== terminal.attempts.length - 1 || runResult.verifier_status !== terminal.final_verifier_status) errors.push("RunResult terminal relation drift");
		if (stableJson(runResult.evidence.attempts) !== stableJson(terminal.attempts.map((attempt) => ({ attempt_id: attempt.attempt_id, ordinal: attempt.ordinal, parent_attempt_id: attempt.parent_attempt_id }))) || runResult.evidence.session_id !== terminal.session_id || runResult.evidence.workspace_id !== terminal.workspace_id || runResult.evidence.initial_payload_digest !== terminal.initial_dispatch.payload_sha256) errors.push("RunResult Attempt/session/workspace/dispatch relation drift");
		if (runResult.evidence.provider_requests !== terminal.budget_usage.provider_requests || runResult.evidence.tool_calls !== terminal.budget_usage.tool_calls || runResult.evidence.tokens !== terminal.budget_usage.tokens || runResult.evidence.wall_time_ms !== terminal.budget_usage.active_execution_time_ms || runResult.evidence.cost_usd !== terminal.budget_usage.cost_usd) errors.push("RunResult budget relation drift");
		validateTaxonomy(terminal, runResult, transitions[2]!.state, errors); validateReservations(terminal, manifest, errors); validateRuntimeDiagnosticsV1C(runRoot, manifest, terminal, runResult, errors);
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, run_result: errors.length === 0 ? runResult : null, terminal: errors.length === 0 ? terminal : null, pause_evidence: null, pause_integrity_valid: false, terminal_valid: errors.length === 0, comparable: errors.length === 0 && terminal?.exclusion_preauthorized !== true };
}

export function aggregatePilotV1B(options: { projectRoot: string; pilotRoot: string }) {
	const manifest = readJson<ExecutionManifestV1B>(resolve(options.pilotRoot, "manifest.json")); validateExecutionManifestV1B(manifest, options.projectRoot);
	const ledger = readPilotLedgerV1B(options.pilotRoot); validatePilotLedgerV1B(manifest, ledger); const beforeManifest = stableJson(manifest); const beforeLedger = stableJson(ledger);
	const terminals = new Map<string, TerminalCellEvidenceV1B>();
	const by_arm = Object.fromEntries(["A", "B", "C"].map((arm) => [arm, { planned: 0, started: 0, terminal: 0, invalid: 0, comparable: 0, excluded: 0, treatment_invalid: 0, passed: 0, failed: 0 }])) as Record<"A" | "B" | "C", { planned: number; started: number; terminal: number; invalid: number; comparable: number; excluded: number; treatment_invalid: number; passed: number; failed: number }>;
	const totals = { provider_requests: 0, tool_calls: 0, tokens: 0, active_execution_time_ms: 0, cost_usd: 0 };
	let terminalRuns = 0, invalidRuns = 0, comparable = 0, excluded = 0, treatmentInvalid = 0, passed = 0, recoveryEligible = 0, recoveryStarted = 0, recoverySucceeded = 0;
	let pilotUsage = zeroUsage();
	for (const cell of manifest.cells) {
		by_arm[cell.arm].planned++; const transitions = ledger.filter((entry) => entry.cell_id === cell.cell_id); if (transitions.some((entry) => entry.state === "started")) by_arm[cell.arm].started++;
		const final = transitions.at(-1)?.state;
		if (final === "paused" && transitions.some((entry) => entry.state === "started")) {
			const inspected = inspectV1RunCell({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, plannedRunId: cell.planned_run_id });
			if (!inspected.integrity_valid || !inspected.pause_integrity_valid || inspected.terminal_valid || inspected.comparable || !inspected.pause_evidence) throw new Error(`Pilot aggregate rejected paused ${cell.cell_id}: ${inspected.errors.join("; ")}`);
			for (const key of Object.keys(totals) as Array<keyof typeof totals>) totals[key] += inspected.pause_evidence.budget_usage_after_conservative_charge[key];
			pilotUsage = addUsage(pilotUsage, inspected.pause_evidence.budget_usage_after_conservative_charge);
			continue;
		}
		if (final !== "terminal" && final !== "invalid") continue;
		const inspected = inspectV1RunCell({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot, plannedRunId: cell.planned_run_id }); if (!inspected.integrity_valid || !inspected.terminal) throw new Error(`Pilot aggregate rejected ${cell.cell_id}: ${inspected.errors.join("; ")}`);
		const terminal = inspected.terminal; terminals.set(cell.cell_id, terminal);
		const pilotRecords = terminal.reservations.filter((entry) => entry.level === "pilot"); if (!usageEqual(pilotRecords[0]!.before, pilotUsage)) throw new Error(`Pilot reservation chain drift before ${cell.cell_id}`); pilotUsage = pilotRecords.at(-1)!.after;
		if (final === "terminal") { terminalRuns++; by_arm[cell.arm].terminal++; } else { invalidRuns++; by_arm[cell.arm].invalid++; }
		if (terminal.invalid_attribution === "infrastructure" || terminal.invalid_attribution === "evidence") { excluded++; by_arm[cell.arm].excluded++; }
		else { comparable++; by_arm[cell.arm].comparable++; if (terminal.invalid_attribution === "treatment") { treatmentInvalid++; by_arm[cell.arm].treatment_invalid++; } }
		if (terminal.final_verifier_status === "passed") { passed++; by_arm[cell.arm].passed++; } else by_arm[cell.arm].failed++;
		if (terminal.recovery_eligible) recoveryEligible++; if (terminal.recovery_started) recoveryStarted++; if (terminal.recovery_started && terminal.final_verifier_status === "passed") recoverySucceeded++;
		for (const key of Object.keys(totals) as Array<keyof typeof totals>) totals[key] += terminal.budget_usage[key];
	}
	let blocksChecked = 0; const skill = readFrozenSkillWrapper(options.projectRoot, manifest.bindings.skill_digest).wrapper; const tasks = loadCandidateTaskPackV1(options.projectRoot);
	for (let block = 1; block <= 8; block++) {
		const cells = manifest.cells.filter((cell) => cell.block === block); const a = terminals.get(cells.find((cell) => cell.arm === "A")!.cell_id); const b = terminals.get(cells.find((cell) => cell.arm === "B")!.cell_id); const c = terminals.get(cells.find((cell) => cell.arm === "C")!.cell_id); if (!a || !b || !c) continue;
		if (stableJson(b.initial_dispatch) !== stableJson(c.initial_dispatch)) throw new Error(`B/C complete initial dispatch drift in block ${block}`);
		const task = tasks.find((value) => value.task_id === cells[0]!.task_id)!; const instruction = readFileSync(resolve(options.projectRoot, task.instruction_ref), "utf8");
		if (normalizedExactDispatch(a, instruction) !== normalizedExactDispatch(b, `${skill}\n\n${instruction}`)) throw new Error(`A/B delta is not exactly the frozen Skill treatment in block ${block}`); blocksChecked++;
	}
	for (const key of ["provider_requests", "tool_calls", "tokens", "active_execution_time_ms", "cost_usd"] as const) if (Math.abs(pilotUsage[key] - totals[key]) > Number.EPSILON) throw new Error(`Pilot final budget mismatch: ${key}`);
	if (pilotUsage.provider_requests > manifest.budgets.pilot.provider_requests || pilotUsage.tool_calls > manifest.budgets.pilot.tool_calls || pilotUsage.tokens > manifest.budgets.pilot.tokens || pilotUsage.active_execution_time_ms > manifest.budgets.pilot.wall_time_ms || pilotUsage.cost_usd > manifest.budgets.pilot.cost_usd + Number.EPSILON || pilotUsage.verifier_runs > manifest.budgets.pilot.verifier_runs || pilotUsage.child_attempts > manifest.budgets.pilot.child_attempts) throw new Error("Pilot budget cap exceeded");
	if (stableJson(manifest) !== beforeManifest || stableJson(ledger) !== beforeLedger) throw new Error("read-only aggregate mutated source evidence");
	return { manifest_id: manifest.manifest_id, planned_runs: manifest.cells.length, started_runs: ledger.filter((entry) => entry.state === "started").length, terminal_runs: terminalRuns, invalid_runs: invalidRuns, paused_runs: ledger.filter((entry) => entry.state === "paused").length, comparable_runs: comparable, excluded_runs: excluded, treatment_invalid_runs: treatmentInvalid, passed_runs: passed, failed_runs: terminalRuns + invalidRuns - passed, recovery_eligible: recoveryEligible, recovery_started: recoveryStarted, recovery_succeeded: recoverySucceeded, totals, by_arm, fairness: { blocks_checked: blocksChecked, bc_initial_byte_equal: true, ab_only_skill_delta: true } };
}
