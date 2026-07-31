import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
	ArtifactRefV0B,
	EvidenceIndexItemV0B,
	SecretScanResultV0B,
	SessionRefV0B,
	VerifierResultV0B,
	WorkspaceRefV0B,
} from "./contracts/v0b-types.ts";
import type {
	AttemptEvidenceValidationV0C,
	AttemptRecordV0C,
	CompletionDecisionV0C,
	EvidenceIndexV0C,
	OutcomeV0C,
	RunEvidenceValidationV0C,
	RunRecordV0C,
	TaskSpecV0C,
	TerminalRecordV0C,
} from "./contracts/v0c-types.ts";
import {
	isArtifactRefV0B,
	readJsonArtifact,
	resolveRunRelative,
	validateArtifactRef,
	validateRunRootBoundary,
} from "./evidence/artifacts.ts";
import {
	readJournalV0C,
	validateJournalV0C,
} from "./evidence/journal-v0c.ts";
import { secretRelevantObjectProjectionV0B } from "./evidence/terminal-policy.ts";
import {
	attemptDirectoryV0C,
	expectedTerminalResponsibilitiesV0C,
	terminalScanFileScopesV0C,
	terminalScanObjectScopesV0C,
	validateTerminalIndexPolicyV0C,
} from "./evidence/terminal-policy-v0c.ts";
import { digestObject, fileSha256, sha256, stableJson } from "./hash.ts";
import { reopenAndValidateEvidenceSession } from "./session/evidence-session.ts";

export interface InspectResultV0C {
	schema_version: 1;
	run_id: string;
	committed: boolean;
	integrity_valid: boolean;
	status: OutcomeV0C["status"] | null;
	failure_class: OutcomeV0C["failure_class"] | null;
	terminal_reason: string | null;
	attempts: Array<{
		attempt_id: string;
		ordinal: 1 | 2;
		parent_attempt_id: string | null;
		session_id: string;
		workspace_id: string;
		verifier_status: VerifierResultV0B["status"] | null;
		decision: CompletionDecisionV0C["decision"] | null;
	}>;
	recovery: { triggered: boolean; slots_consumed: 0 | 1 } | null;
	budget: RunRecordV0C["budget"] | null;
	artifact_count: number;
	errors: string[];
}

function empty(runId: string, errors: string[]): InspectResultV0C {
	return {
		schema_version: 1,
		run_id: runId,
		committed: false,
		integrity_valid: false,
		status: null,
		failure_class: null,
		terminal_reason: null,
		attempts: [],
		recovery: null,
		budget: null,
		artifact_count: 0,
		errors,
	};
}

function record(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}

function safeJson(runRoot: string, path: string, label: string, errors: string[]): unknown {
	try {
		return readJsonArtifact(runRoot, path);
	} catch {
		errors.push(`${label} is malformed or unreadable`);
		return null;
	}
}

async function inspectCore(projectRoot: string, runId: string): Promise<InspectResultV0C> {
	if (!/^run-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(runId)) {
		return empty(runId, ["run ID is invalid"]);
	}
	const runRoot = resolve(projectRoot, ".runs/v0-c/runs", runId);
	try {
		lstatSync(runRoot);
	} catch {
		return empty(runId, ["run does not exist"]);
	}
	const rootErrors = validateRunRootBoundary(runRoot);
	if (rootErrors.length > 0) return empty(runId, rootErrors);
	for (const path of ["terminal.json", "outcome.json", "evidence-index.json", "run.json", "journal/events.jsonl"]) {
		try {
			const stats = lstatSync(resolveRunRelative(runRoot, path));
			if (!stats.isFile() || stats.isSymbolicLink()) return empty(runId, [`required evidence is not an ordinary file: ${path}`]);
		} catch {
			return empty(runId, [`required evidence missing or unreadable: ${path}`]);
		}
	}
	const errors: string[] = [];
	const terminal = safeJson(runRoot, "terminal.json", "terminal record", errors) as TerminalRecordV0C | null;
	const outcome = safeJson(runRoot, "outcome.json", "Outcome", errors) as OutcomeV0C | null;
	const index = safeJson(runRoot, "evidence-index.json", "Evidence Index", errors) as EvidenceIndexV0C | null;
	const run = safeJson(runRoot, "run.json", "Run record", errors) as RunRecordV0C | null;
	const task = safeJson(runRoot, "config/task.json", "Task", errors) as TaskSpecV0C | null;
	const workspace = safeJson(runRoot, "evidence/workspace.json", "WorkspaceRef", errors) as WorkspaceRefV0B | null;
	const sessionRef = safeJson(runRoot, "evidence/session-ref.json", "SessionRef", errors) as SessionRefV0B | null;
	const runValidation = safeJson(
		runRoot,
		"evidence/run-validation.json",
		"Run validation",
		errors,
	) as RunEvidenceValidationV0C | null;
	for (const [label, value] of [
		["terminal record", terminal],
		["Outcome", outcome],
		["Evidence Index", index],
		["Run", run],
		["Task", task],
		["WorkspaceRef", workspace],
		["SessionRef", sessionRef],
		["Run validation", runValidation],
	] as const) {
		if (!record(value)) errors.push(`${label} envelope is invalid`);
	}
	let journal;
	try {
		journal = readJournalV0C(resolveRunRelative(runRoot, "journal/events.jsonl"));
	} catch {
		return empty(runId, ["Journal JSONL is malformed or unreadable"]);
	}
	const attemptIds = Array.isArray(run?.attempt_ids) ? run.attempt_ids.filter((value): value is string => typeof value === "string") : [];
	if (attemptIds.length < 1 || attemptIds.length > 2) errors.push("Run attempt_ids length is not 1 or 2");
	const attempts: AttemptRecordV0C[] = [];
	const verifiers: VerifierResultV0B[] = [];
	const attemptValidations: AttemptEvidenceValidationV0C[] = [];
	const decisions: CompletionDecisionV0C[] = [];
	for (const [indexValue, attemptId] of attemptIds.entries()) {
		const ordinal = (indexValue + 1) as 1 | 2;
		const root = `attempts/0${ordinal}-${attemptId}`;
		const attempt = safeJson(runRoot, `${root}/attempt.json`, `Attempt ${ordinal}`, errors) as AttemptRecordV0C | null;
		const verifier = safeJson(runRoot, `${root}/verifier-result.json`, `Verifier ${ordinal}`, errors) as VerifierResultV0B | null;
		const validation = safeJson(
			runRoot,
			`${root}/validation.json`,
			`Attempt validation ${ordinal}`,
			errors,
		) as AttemptEvidenceValidationV0C | null;
		const decision = safeJson(runRoot, `${root}/policy-decision.json`, `Decision ${ordinal}`, errors) as CompletionDecisionV0C | null;
		if (record(attempt)) attempts.push(attempt);
		if (record(verifier)) verifiers.push(verifier);
		if (record(validation)) attemptValidations.push(validation);
		if (record(decision)) decisions.push(decision);
	}
	if (
		attempts.length !== attemptIds.length ||
		verifiers.length !== attemptIds.length ||
		attemptValidations.length !== attemptIds.length ||
		decisions.length !== attemptIds.length
	) {
		errors.push("Attempt/Verifier/validation/Decision evidence count mismatch");
	}
	for (const [indexValue, attempt] of attempts.entries()) {
		const ordinal = (indexValue + 1) as 1 | 2;
		const verifier = verifiers[indexValue];
		const validation = attemptValidations[indexValue];
		const attemptRoot = attemptDirectoryV0C(attempt);
		if (attempt.attempt_id !== attemptIds[indexValue] || attempt.ordinal !== ordinal || attempt.run_id !== runId) {
			errors.push(`Attempt ${ordinal} identity or ordinal mismatch`);
		}
		if (attempt.session_id !== sessionRef?.session_id || attempt.workspace_id !== workspace?.workspace_id) {
			errors.push(`Attempt ${ordinal} Session/Workspace drift`);
		}
		if (ordinal === 1 && (attempt.parent_attempt_id !== null || attempt.failure_packet_id !== null)) {
			errors.push("initial Attempt lineage is invalid");
		}
		if (
			ordinal === 2 &&
			(attempt.parent_attempt_id !== attemptIds[0] || !attempt.failure_packet_id || attempt.trigger !== "verifier_failure")
		) {
			errors.push("child Attempt lineage is invalid");
		}
		if (!verifier || verifier.attempt_id !== attempt.attempt_id) {
			errors.push(`Verifier ${ordinal} Attempt relationship mismatch`);
		} else {
			if (verifier.verifier_id !== task?.verifier_id || verifier.verifier_sha256 !== task?.verifier_sha256) {
				errors.push(`Verifier ${ordinal} frozen identity/digest mismatch`);
			}
			const expectedOutputPath = `${attemptRoot}/verifier-output.txt`;
			if (verifier.full_output_ref.path !== expectedOutputPath) {
				errors.push(`Verifier ${ordinal} output ArtifactRef path mismatch`);
			}
			errors.push(...validateArtifactRef(runRoot, verifier.full_output_ref));
		}
		if (!validation || validation.run_id !== runId || validation.attempt_id !== attempt.attempt_id) {
			errors.push(`Attempt validation ${ordinal} identity mismatch`);
		}
	}
	if (outcome?.final_attempt_id !== attemptIds.at(-1)) errors.push("Outcome final Attempt mismatch");
	if (outcome?.attempt_count !== attemptIds.length) errors.push("Outcome attempt_count mismatch");
	if (outcome?.recovery_triggered !== (attemptIds.length === 2)) errors.push("Outcome recovery_triggered mismatch");
	if (
		run?.recovery_slots.consumed !== (attemptIds.length === 2 ? 1 : 0) &&
		!(attemptIds.length === 1 && run?.recovery_slots.consumed === 1 && runValidation?.valid === false)
	) errors.push("Run recovery slot mismatch");
	if (outcome?.recovery_slots_consumed !== run?.recovery_slots.consumed) errors.push("Outcome recovery slot mismatch");
	if (
		runValidation?.attempt_count !== attemptIds.length ||
		runValidation?.attempt_validation_count !== attemptIds.length ||
		runValidation?.verifier_count !== attemptIds.length
	) {
		errors.push("Run validation counts mismatch");
	}
	if (terminal?.run_id !== runId || outcome?.run_id !== runId || index?.run_id !== runId || run?.run_id !== runId) {
		errors.push("Run identity mismatch");
	}
	let outcomeDigestMatches = false;
	let indexDigestMatches = false;
	if (terminal && /^[a-f0-9]{64}$/.test(terminal.outcome_sha256)) {
		outcomeDigestMatches = terminal.outcome_sha256 === fileSha256(resolveRunRelative(runRoot, "outcome.json"));
		if (!outcomeDigestMatches) errors.push("terminal Outcome digest mismatch");
	} else errors.push("terminal Outcome digest invalid");
	if (terminal && /^[a-f0-9]{64}$/.test(terminal.evidence_index_sha256)) {
		indexDigestMatches = terminal.evidence_index_sha256 === fileSha256(resolveRunRelative(runRoot, "evidence-index.json"));
		if (!indexDigestMatches) errors.push("terminal Evidence Index digest mismatch");
	} else errors.push("terminal Evidence Index digest invalid");
	if (outcome?.evidence_index_ref !== "evidence-index.json") errors.push("Outcome Evidence Index reference mismatch");

	const items: EvidenceIndexItemV0B[] = [];
	for (const item of Array.isArray(index?.items) ? index.items : []) {
		if (!record(item) || !isArtifactRefV0B(item) || typeof item.responsibility !== "string") {
			errors.push("Evidence Index contains invalid item");
			continue;
		}
		items.push(item as EvidenceIndexItemV0B);
		errors.push(...validateArtifactRef(runRoot, item));
	}
	const itemByPath = new Map(items.map((item) => [item.path, item]));
	for (const [indexValue, attempt] of attempts.entries()) {
		const verifier = verifiers[indexValue];
		if (!verifier) continue;
		const outputPath = `${attemptDirectoryV0C(attempt)}/verifier-output.txt`;
		const outputItem = itemByPath.get(outputPath);
		if (
			!outputItem ||
			stableJson({
				path: outputItem.path,
				sha256: outputItem.sha256,
				size_bytes: outputItem.size_bytes,
				media_type: outputItem.media_type,
				truncated: outputItem.truncated,
			}) !== stableJson(verifier.full_output_ref)
		) {
			errors.push(`Verifier ${indexValue + 1} output ArtifactRef/Index mismatch`);
		}
	}
	const toolRefs: ArtifactRefV0B[] = journal.flatMap((entry) => {
		if (entry.type !== "tool_call_completed" && entry.type !== "tool_call_error" && entry.type !== "tool_call_aborted") return [];
		return isArtifactRefV0B(entry.data.output_ref) ? [entry.data.output_ref] : [];
	});
	const hasFailurePacket = items.some((item) => item.path === "recovery/failure-packet.json");
	const hasFailurePacketScan = items.some((item) => item.path === "recovery/failure-packet-scan.json");
	const expected = expectedTerminalResponsibilitiesV0C({
		attempts,
		toolRefs,
		hasFailurePacket,
		hasFailurePacketScan,
	});
	errors.push(...validateTerminalIndexPolicyV0C(items, expected));
	if (runValidation) {
		const planned = [...expected.keys()].sort();
		if (stableJson(runValidation.attempt_ids) !== stableJson(attemptIds)) errors.push("Run validation Attempt identities mismatch");
		if (stableJson(runValidation.attempt_validation_ids) !== stableJson(attemptIds)) errors.push("Run validation Attempt relation mismatch");
		if (stableJson(runValidation.verifier_attempt_ids) !== stableJson(attemptIds)) errors.push("Run validation Verifier relation mismatch");
		if (stableJson(runValidation.expected_evidence_paths) !== stableJson(planned)) errors.push("Run validation dynamic plan mismatch");
		const summed = {
			provider_requests: attempts.reduce((sum, attempt) => sum + attempt.budget_usage.provider_request_usage, 0),
			tool_calls: attempts.reduce((sum, attempt) => sum + attempt.budget_usage.tool_call_usage, 0),
			verifier_runs: attempts.reduce((sum, attempt) => sum + attempt.budget_usage.verifier_runs_usage, 0),
			external_provider_calls: attempts.reduce((sum, attempt) => sum + attempt.budget_usage.external_provider_calls, 0),
			cost_usd: attempts.reduce((sum, attempt) => sum + attempt.budget_usage.cost_usage_usd, 0),
		};
		if (stableJson(runValidation.cumulative_budget) !== stableJson(summed)) errors.push("Run validation cumulative budget mismatch");
		const planDigest = digestObject({
			expected_evidence_paths: planned,
			terminal_suffix: ["outcome_created", "run_terminal"],
			attempt_ids: attemptIds,
			recovery_slots_consumed: runValidation.recovery_slots_consumed,
		});
		if (runValidation.terminal_plan_digest !== planDigest) errors.push("Run validation terminal plan digest mismatch");
	}
	errors.push(...validateJournalV0C(journal, {
		runId,
		sessionId: sessionRef?.session_id ?? "",
		workspaceId: workspace?.workspace_id ?? "",
		attemptIds,
		outcome: outcome ?? undefined,
	}));
	for (const entry of journal) {
		for (const [key, value] of Object.entries(entry.data)) {
			if (!key.endsWith("_ref")) continue;
			if (!isArtifactRefV0B(value)) errors.push(`Journal ArtifactRef malformed at seq ${entry.seq}`);
			else errors.push(...validateArtifactRef(runRoot, value));
		}
	}
	const storageRef = sessionRef?.storage_ref;
	if (!isArtifactRefV0B(storageRef)) errors.push("Session storage ArtifactRef invalid");
	else {
		errors.push(...validateArtifactRef(runRoot, storageRef));
		try {
			if (!sessionRef) throw new Error("session-ref unavailable");
			const reopened = await reopenAndValidateEvidenceSession({
				evidencePath: resolveRunRelative(runRoot, storageRef.path),
				workspaceRoot: resolveRunRelative(runRoot, "workspace"),
				sessionId: sessionRef.session_id,
			});
			errors.push(...reopened.errors);
			const journalCalls = journal
				.filter((entry) => entry.type === "tool_call_started")
				.map((entry) => String(entry.data.tool_call_id))
				.sort();
			const journalResults = journal
				.filter((entry) => entry.type === "tool_call_completed" || entry.type === "tool_call_error" || entry.type === "tool_call_aborted")
				.map((entry) => String(entry.data.tool_call_id))
				.sort();
			if (stableJson(journalCalls) !== stableJson([...reopened.toolCallIds].sort())) errors.push("Session/Journal Tool Call mismatch");
			if (stableJson(journalResults) !== stableJson([...reopened.toolResultIds].sort())) errors.push("Session/Journal Tool Result mismatch");
		} catch {
			errors.push("evidence Session public reopen failed");
		}
	}

	const scanEnvelope = record(terminal?.preterminal_scan) ? terminal.preterminal_scan : null;
	const scanRef = scanEnvelope && isArtifactRefV0B(scanEnvelope.result_ref) ? scanEnvelope.result_ref : null;
	if (!scanEnvelope || scanEnvelope.completed !== true || scanEnvelope.match_count !== 0 || !scanRef) {
		errors.push("terminal preterminal scan proof invalid");
	} else {
		errors.push(...validateArtifactRef(runRoot, scanRef));
		const scan = safeJson(runRoot, scanRef.path, "secret scan", errors) as SecretScanResultV0B | null;
		if (!record(scan) || scan.status !== "passed" || scan.match_count !== 0 || !Array.isArray(scan.scopes)) {
			errors.push("preterminal secret scan did not prove zero matches");
		} else {
			const fileScopes = terminalScanFileScopesV0C({ attempts, toolRefs, hasFailurePacket, hasFailurePacketScan });
			const objectScopes = terminalScanObjectScopesV0C({
				run,
				attempts,
				workspace,
				session: sessionRef,
				verifiers,
				decisions,
				runValidation,
				abort: safeJson(runRoot, "evidence/abort.json", "abort evidence", errors),
				outcome: outcome!,
				terminalJournalProjection: journal.slice(-2).map((entry) => ({ type: entry.type, data: entry.data })),
			});
			const expectedLabels = [...fileScopes.map((scope) => scope.scope_label), ...objectScopes.map((scope) => scope.scope_label)];
			if (stableJson(scan.scope_labels) !== stableJson(expectedLabels)) errors.push("preterminal scan scope labels mismatch");
			if (scan.scanned_file_count !== fileScopes.length || scan.scanned_object_count !== objectScopes.length) {
				errors.push("preterminal scan scope counts mismatch");
			}
			const byLabel = new Map<string, SecretScanResultV0B["scopes"][number]>();
			for (const scope of scan.scopes) {
				if (byLabel.has(scope.scope_label)) errors.push(`preterminal scan duplicate scope: ${scope.scope_label}`);
				byLabel.set(scope.scope_label, scope);
				if (!expectedLabels.includes(scope.scope_label)) errors.push(`preterminal scan unknown scope: ${scope.scope_label}`);
			}
			for (const scope of fileScopes) {
				const observed = byLabel.get(scope.scope_label);
				if (!observed || observed.kind !== "file") {
					errors.push(`preterminal scan file scope missing/kind mismatch: ${scope.scope_label}`);
					continue;
				}
				const bytes =
					scope.scope_label === "journal_preterminal"
						? Buffer.from(
								journal
									.slice(0, -2)
									.map((entry) => `${stableJson(entry)}\n`)
									.join(""),
								"utf8",
							)
						: readFileSync(resolveRunRelative(runRoot, scope.path));
				if (observed.sha256 !== sha256(bytes) || observed.size_bytes !== bytes.length) {
					errors.push(`preterminal scan file scope digest mismatch: ${scope.scope_label}`);
				}
			}
			for (const scope of objectScopes) {
				const observed = byLabel.get(scope.scope_label);
				if (!observed || observed.kind !== "object") {
					errors.push(`preterminal scan object scope missing/kind mismatch: ${scope.scope_label}`);
					continue;
				}
				const serialized = stableJson(secretRelevantObjectProjectionV0B(scope.scope_label, scope.value));
				if (observed.sha256 !== sha256(serialized) || observed.size_bytes !== Buffer.byteLength(serialized, "utf8")) {
					errors.push(`preterminal scan object scope digest mismatch: ${scope.scope_label}`);
				}
			}
		}
	}
	const committed =
		terminal?.schema_version === 1 &&
		terminal.run_id === runId &&
		outcomeDigestMatches &&
		indexDigestMatches &&
		outcome?.evidence_index_ref === "evidence-index.json";
	return {
		schema_version: 1,
		run_id: runId,
		committed,
		integrity_valid: committed && errors.length === 0,
		status: outcome?.status ?? null,
		failure_class: outcome?.failure_class ?? null,
		terminal_reason: outcome?.terminal_reason ?? null,
		attempts: attempts.map((attempt, indexValue) => ({
			attempt_id: attempt.attempt_id,
			ordinal: attempt.ordinal,
			parent_attempt_id: attempt.parent_attempt_id,
			session_id: attempt.session_id,
			workspace_id: attempt.workspace_id,
			verifier_status: verifiers[indexValue]?.status ?? null,
			decision: decisions[indexValue]?.decision ?? null,
		})),
		recovery: outcome
			? { triggered: outcome.recovery_triggered, slots_consumed: outcome.recovery_slots_consumed }
			: null,
		budget: run?.budget ?? null,
		artifact_count: items.length,
		errors,
	};
}

export async function inspectRunV0C(projectRoot: string, runId: string): Promise<InspectResultV0C> {
	try {
		return await inspectCore(projectRoot, runId);
	} catch {
		return empty(runId, ["inspect rejected untrusted or malformed V0-C evidence safely"]);
	}
}
