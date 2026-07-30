import { lstatSync } from "node:fs";
import { resolve } from "node:path";
import type {
	ArtifactRefV0B,
	AttemptRecordV0B,
	EvidenceIndexV0B,
	JournalEntryV0B,
	OutcomeV0B,
	RunRecordV0B,
	SecretScanResultV0B,
	SessionRefV0B,
	TerminalRecordV0B,
	VerifierResultV0B,
	WorkspaceRefV0B,
} from "./contracts/v0b-types.ts";
import { fileSha256 } from "./hash.ts";
import {
	isArtifactRefV0B,
	readJsonArtifact,
	resolveRunRelative,
	validateArtifactRef,
	validateRunRootBoundary,
} from "./evidence/artifacts.ts";
import { readJournal, validateJournal } from "./evidence/journal.ts";
import { reopenAndValidateEvidenceSession } from "./session/evidence-session.ts";

export interface InspectResultV0B {
	schema_version: 1;
	run_id: string;
	committed: boolean;
	integrity_valid: boolean;
	status: OutcomeV0B["status"] | null;
	failure_class: OutcomeV0B["failure_class"] | null;
	terminal_reason: string | null;
	identity: {
		attempt_id: string | null;
		session_id: string | null;
		workspace_id: string | null;
	};
	budget: RunRecordV0B["budget"] | null;
	verifier: {
		id: string;
		status: VerifierResultV0B["status"];
		summary: string;
	} | null;
	session: {
		storage_path: string;
		resume_capability: "not_claimed";
		reasoning_persistence: "metadata_only";
		redaction: SessionRefV0B["redaction"];
		truncation: SessionRefV0B["truncation"];
	} | null;
	workspace: {
		provider: "temporary_copy";
		initial_tree_digest: string;
		final_tree_digest: string | null;
	} | null;
	artifact_count: number;
	errors: string[];
}

function emptyResult(runId: string, errors: string[]): InspectResultV0B {
	return {
		schema_version: 1,
		run_id: runId,
		committed: false,
		integrity_valid: false,
		status: null,
		failure_class: null,
		terminal_reason: null,
		identity: { attempt_id: null, session_id: null, workspace_id: null },
		budget: null,
		verifier: null,
		session: null,
		workspace: null,
		artifact_count: 0,
		errors,
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function hasString(value: Record<string, unknown>, key: string): boolean {
	return typeof value[key] === "string";
}

function asArtifactRef(value: unknown): ArtifactRefV0B | null {
	return isArtifactRefV0B(value) ? value : null;
}

function safeJson(runRoot: string, path: string, label: string, errors: string[]): unknown {
	try {
		return readJsonArtifact(runRoot, path);
	} catch {
		errors.push(`${label} is malformed or unreadable`);
		return null;
	}
}

async function inspectCore(projectRoot: string, runId: string): Promise<InspectResultV0B> {
	if (!/^run-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(runId)) {
		return emptyResult(runId, ["run ID is invalid"]);
	}
	const runRoot = resolve(projectRoot, ".runs/v0-b/runs", runId);
	try {
		lstatSync(runRoot);
	} catch {
		return emptyResult(runId, ["run does not exist"]);
	}
	const rootErrors = validateRunRootBoundary(runRoot);
	if (rootErrors.length > 0) return emptyResult(runId, rootErrors);

	const requiredPaths = [
		"terminal.json",
		"outcome.json",
		"evidence-index.json",
		"run.json",
		"attempt.json",
		"evidence/workspace.json",
		"evidence/session-ref.json",
		"evidence/verifier-result.json",
		"journal/events.jsonl",
	];
	for (const path of requiredPaths) {
		try {
			const target = resolveRunRelative(runRoot, path);
			const stats = lstatSync(target);
			if (!stats.isFile() || stats.isSymbolicLink()) {
				return emptyResult(runId, [`required evidence is not an ordinary file: ${path}`]);
			}
		} catch (error) {
			return emptyResult(runId, [
				error instanceof Error && /symlink|junction|escapes/.test(error.message)
					? error.message
					: `required evidence missing or unreadable: ${path}`,
			]);
		}
	}

	const errors: string[] = [];
	const terminalValue = safeJson(runRoot, "terminal.json", "terminal record", errors);
	const outcomeValue = safeJson(runRoot, "outcome.json", "Outcome", errors);
	const indexValue = safeJson(runRoot, "evidence-index.json", "Evidence Index", errors);
	const runValue = safeJson(runRoot, "run.json", "Run record", errors);
	const attemptValue = safeJson(runRoot, "attempt.json", "Attempt record", errors);
	const sessionValue = safeJson(runRoot, "evidence/session-ref.json", "SessionRef", errors);
	const verifierValue = safeJson(runRoot, "evidence/verifier-result.json", "VerifierResult", errors);
	const workspaceValue = safeJson(runRoot, "evidence/workspace.json", "WorkspaceRef", errors);

	const terminal = isRecord(terminalValue) ? terminalValue : null;
	const outcome = isRecord(outcomeValue) ? outcomeValue : null;
	const index = isRecord(indexValue) ? indexValue : null;
	const run = isRecord(runValue) ? runValue : null;
	const attempt = isRecord(attemptValue) ? attemptValue : null;
	const sessionRef = isRecord(sessionValue) ? sessionValue : null;
	const verifier = isRecord(verifierValue) ? verifierValue : null;
	const workspace = isRecord(workspaceValue) ? workspaceValue : null;
	for (const [label, value] of [
		["terminal record", terminal],
		["Outcome", outcome],
		["Evidence Index", index],
		["Run record", run],
		["Attempt record", attempt],
		["SessionRef", sessionRef],
		["VerifierResult", verifier],
		["WorkspaceRef", workspace],
	] as const) {
		if (!value) errors.push(`${label} envelope is invalid`);
	}

	let outcomeDigestMatches = false;
	let indexDigestMatches = false;
	if (terminal && /^[a-f0-9]{64}$/.test(String(terminal.outcome_sha256))) {
		outcomeDigestMatches = terminal.outcome_sha256 === fileSha256(resolveRunRelative(runRoot, "outcome.json"));
		if (!outcomeDigestMatches) errors.push("terminal Outcome digest mismatch");
	} else {
		errors.push("terminal Outcome digest is invalid");
	}
	if (terminal && /^[a-f0-9]{64}$/.test(String(terminal.evidence_index_sha256))) {
		indexDigestMatches =
			terminal.evidence_index_sha256 === fileSha256(resolveRunRelative(runRoot, "evidence-index.json"));
		if (!indexDigestMatches) errors.push("terminal Evidence Index digest mismatch");
	} else {
		errors.push("terminal Evidence Index digest is invalid");
	}

	if (outcome?.evidence_index_ref !== "evidence-index.json") errors.push("Outcome Evidence Index reference mismatch");
	for (const value of [terminal?.run_id, outcome?.run_id, index?.run_id, run?.run_id, attempt?.run_id]) {
		if (value !== runId) errors.push("Run identity mismatch");
	}
	if (!Array.isArray(index?.items)) errors.push("Evidence Index items are invalid");
	const items = Array.isArray(index?.items) ? index.items : [];
	const seenPaths = new Set<string>();
	for (const item of items) {
		if (!isArtifactRefV0B(item) || !isRecord(item) || typeof item.responsibility !== "string") {
			errors.push("Evidence Index contains an invalid item");
			continue;
		}
		if (seenPaths.has(item.path)) errors.push("Evidence Index contains a duplicate path");
		seenPaths.add(item.path);
		errors.push(...validateArtifactRef(runRoot, item));
	}
	if (!seenPaths.has("outcome.json")) errors.push("Evidence Index omits Outcome");
	if (seenPaths.has("evidence-index.json") || seenPaths.has("terminal.json")) {
		errors.push("Evidence Index contains a digest cycle");
	}

	const scanEnvelope = terminal && isRecord(terminal.preterminal_scan) ? terminal.preterminal_scan : null;
	const scanRef = scanEnvelope ? asArtifactRef(scanEnvelope.result_ref) : null;
	if (
		!scanEnvelope ||
		scanEnvelope.completed !== true ||
		scanEnvelope.match_count !== 0 ||
		!Array.isArray(scanEnvelope.scope_labels) ||
		!scanRef
	) {
		errors.push("terminal preterminal scan proof is invalid");
	} else {
		errors.push(...validateArtifactRef(runRoot, scanRef));
		if (!seenPaths.has(scanRef.path)) errors.push("Evidence Index omits preterminal scan result");
		const scanValue = safeJson(runRoot, scanRef.path, "secret scan result", errors);
		const scan = isRecord(scanValue) ? (scanValue as unknown as SecretScanResultV0B) : null;
		if (
			!scan ||
			scan.completed !== true ||
			scan.status !== "passed" ||
			scan.match_count !== 0 ||
			!Array.isArray(scan.scope_labels) ||
			!Array.isArray(scan.scopes)
		) {
			errors.push("preterminal secret scan did not prove a zero-match completion");
		} else {
			if (JSON.stringify(scan.scope_labels) !== JSON.stringify(scanEnvelope.scope_labels)) {
				errors.push("terminal preterminal scan scope does not match scan evidence");
			}
			const mandatoryScopes = [
				"session_evidence",
				"journal_preterminal",
				"pending_run_object",
				"pending_attempt_object",
				"workspace_object",
				"session_ref_object",
				"verifier_result_object",
				"verifier_output",
				"pending_outcome_serialization",
			];
			for (const scope of mandatoryScopes) {
				if (!scan.scope_labels.includes(scope)) errors.push(`preterminal scan scope missing: ${scope}`);
			}
		}
	}

	const attemptIds = Array.isArray(run?.attempt_ids) ? run.attempt_ids : [];
	if (!hasString(attempt ?? {}, "attempt_id") || attemptIds.length !== 1 || attemptIds[0] !== attempt?.attempt_id) {
		errors.push("Run must link exactly one Attempt");
	}
	if (attempt?.parent_attempt_id !== null || attempt?.ordinal !== 1) errors.push("Attempt lineage is not V0-B initial-only");
	if (outcome?.final_attempt_id !== attempt?.attempt_id) errors.push("Outcome Attempt identity mismatch");
	if (attempt?.session_id !== sessionRef?.session_id) errors.push("Attempt/Session identity mismatch");
	if (attempt?.workspace_id !== workspace?.workspace_id) errors.push("Attempt/Workspace identity mismatch");
	if (sessionRef?.resume_capability !== "not_claimed") errors.push("Session resume claim is invalid");
	if (
		!isRecord(run?.budget) ||
		run.budget.external_provider_calls !== 0 ||
		!isRecord(run?.provider_identity) ||
		run.provider_identity.external !== false
	) {
		errors.push("external Provider identity is invalid");
	}
	if (
		!verifier ||
		typeof verifier.verifier_id !== "string" ||
		(verifier.status !== "passed" && verifier.status !== "failed" && verifier.status !== "invalid") ||
		typeof verifier.summary !== "string" ||
		!Number.isFinite(verifier.duration_ms) ||
		!isRecord(verifier.execution) ||
		verifier.execution.shell !== false ||
		!Array.isArray(verifier.execution.environment_allowlist_keys) ||
		!asArtifactRef(verifier.full_output_ref)
	) {
		errors.push("Verifier execution evidence is invalid");
	}

	let journal: JournalEntryV0B[] = [];
	try {
		journal = readJournal(resolveRunRelative(runRoot, "journal/events.jsonl"));
	} catch {
		errors.push("Journal JSONL is malformed or unreadable");
	}
	const identity = {
		run_id: runId,
		attempt_id: typeof attempt?.attempt_id === "string" ? attempt.attempt_id : "",
		session_id: typeof attempt?.session_id === "string" ? attempt.session_id : "",
		workspace_id: typeof attempt?.workspace_id === "string" ? attempt.workspace_id : "",
	};
	if (journal.length > 0) {
		errors.push(...validateJournal(journal, identity, { requireValidationCompleted: true, route: "settled" }));
		for (const entry of journal) {
			for (const [key, value] of Object.entries(entry.data)) {
				if (!key.endsWith("_ref")) continue;
				if (!isArtifactRefV0B(value)) {
					errors.push("Journal contains a malformed declared ArtifactRef");
					continue;
				}
				errors.push(...validateArtifactRef(runRoot, value));
			}
		}
		for (const type of ["evidence_validation_completed", "outcome_created", "run_terminal"] as const) {
			if (journal.filter((entry) => entry.type === type).length !== 1) {
				errors.push(`Journal terminal event count invalid: ${type}`);
			}
		}
	}

	let reopened = {
		entryCount: 0,
		toolCallIds: [] as string[],
		toolResultIds: [] as string[],
		errors: [] as string[],
	};
	const storageRef = sessionRef ? asArtifactRef(sessionRef.storage_ref) : null;
	if (!storageRef) {
		errors.push("Session storage ArtifactRef is invalid");
	} else if (validateArtifactRef(runRoot, storageRef).length === 0) {
		try {
			const workspaceRoot = resolveRunRelative(runRoot, "workspace");
			reopened = await reopenAndValidateEvidenceSession({
				evidencePath: resolveRunRelative(runRoot, storageRef.path),
				workspaceRoot,
				sessionId: String(sessionRef?.session_id ?? ""),
			});
			errors.push(...reopened.errors);
		} catch {
			errors.push("evidence Session public reopen failed");
		}
	}
	const journalStarts = journal
		.filter((entry) => entry.type === "tool_call_started")
		.flatMap((entry) => (typeof entry.data.tool_call_id === "string" ? [entry.data.tool_call_id] : []))
		.sort();
	const journalResults = journal
		.filter(
			(entry) =>
				entry.type === "tool_call_completed" ||
				entry.type === "tool_call_error" ||
				entry.type === "tool_call_aborted",
		)
		.flatMap((entry) => (typeof entry.data.tool_call_id === "string" ? [entry.data.tool_call_id] : []))
		.sort();
	if (JSON.stringify(journalStarts) !== JSON.stringify([...reopened.toolCallIds].sort())) {
		errors.push("inspect found Session/Journal Tool Call mismatch");
	}
	if (JSON.stringify(journalResults) !== JSON.stringify([...reopened.toolResultIds].sort())) {
		errors.push("inspect found Session/Journal Tool Result mismatch");
	}

	const committed =
		terminal?.schema_version === 1 &&
		terminal.run_id === runId &&
		outcomeDigestMatches &&
		indexDigestMatches &&
		outcome?.evidence_index_ref === "evidence-index.json";
	const status =
		outcome?.status === "passed" ||
		outcome?.status === "failed" ||
		outcome?.status === "invalid" ||
		outcome?.status === "cancelled"
			? outcome.status
			: null;
	const failureClass =
		outcome?.failure_class === null ||
		outcome?.failure_class === "agent" ||
		outcome?.failure_class === "verifier" ||
		outcome?.failure_class === "infrastructure" ||
		outcome?.failure_class === "evidence" ||
		outcome?.failure_class === "budget" ||
		outcome?.failure_class === "user"
			? outcome.failure_class
			: null;
	const typedSession =
		sessionRef &&
		storageRef &&
		sessionRef.resume_capability === "not_claimed" &&
		sessionRef.reasoning_persistence === "metadata_only" &&
		isRecord(sessionRef.redaction) &&
		isRecord(sessionRef.truncation)
			? (sessionRef as unknown as SessionRefV0B)
			: null;
	const typedWorkspace =
		workspace &&
		workspace.provider === "temporary_copy" &&
		typeof workspace.initial_tree_digest === "string" &&
		(workspace.final_tree_digest === null || typeof workspace.final_tree_digest === "string")
			? (workspace as unknown as WorkspaceRefV0B)
			: null;
	const typedVerifier =
		verifier &&
		typeof verifier.verifier_id === "string" &&
		(verifier.status === "passed" || verifier.status === "failed" || verifier.status === "invalid") &&
		typeof verifier.summary === "string"
			? (verifier as unknown as VerifierResultV0B)
			: null;
	return {
		schema_version: 1,
		run_id: runId,
		committed,
		integrity_valid: committed && errors.length === 0,
		status,
		failure_class: failureClass,
		terminal_reason: typeof outcome?.terminal_reason === "string" ? outcome.terminal_reason : null,
		identity: {
			attempt_id: typeof attempt?.attempt_id === "string" ? attempt.attempt_id : null,
			session_id: typeof attempt?.session_id === "string" ? attempt.session_id : null,
			workspace_id: typeof attempt?.workspace_id === "string" ? attempt.workspace_id : null,
		},
		budget: isRecord(run?.budget) ? (run.budget as unknown as RunRecordV0B["budget"]) : null,
		verifier: typedVerifier
			? { id: typedVerifier.verifier_id, status: typedVerifier.status, summary: typedVerifier.summary }
			: null,
		session: typedSession
			? {
					storage_path: typedSession.storage_ref.path,
					resume_capability: typedSession.resume_capability,
					reasoning_persistence: typedSession.reasoning_persistence,
					redaction: typedSession.redaction,
					truncation: typedSession.truncation,
				}
			: null,
		workspace: typedWorkspace
			? {
					provider: typedWorkspace.provider,
					initial_tree_digest: typedWorkspace.initial_tree_digest,
					final_tree_digest: typedWorkspace.final_tree_digest,
				}
			: null,
		artifact_count: items.length,
		errors,
	};
}

export async function inspectRunV0B(projectRoot: string, runId: string): Promise<InspectResultV0B> {
	try {
		return await inspectCore(projectRoot, runId);
	} catch {
		return emptyResult(runId, ["inspect rejected untrusted or malformed evidence safely"]);
	}
}
