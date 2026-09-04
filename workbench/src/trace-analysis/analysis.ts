import { existsSync, lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CodingTaskRunManifest, ExecutionStatus, VerificationStatus } from "../coding-task/contracts.ts";
import { resolveRunRelative, validateRunRootBoundary } from "../evidence/artifacts.ts";
import type {
	AnalysisContext,
	AnalysisState,
	ClaimScope,
	EvidenceLocator,
	EvidenceRead,
	FindingDraft,
	LoadedRun,
	OutcomeResult,
	RunDescriptor,
	InvestigationAgendaItem,
	TraceArtifact,
	TraceEvent,
	TraceQuery,
	TraceSearchResult,
} from "./contracts.ts";

type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function readRequiredText(runRoot: string, relativePath: string, label: string): { path: string; text: string } {
	let path: string;
	try {
		path = resolveRunRelative(runRoot, relativePath);
	} catch (error) {
		throw new Error(`${label}: ${error instanceof Error ? error.message : "invalid artifact path"}`);
	}
	if (!existsSync(path)) throw new Error(`${label} is missing`);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`${label} is not an ordinary file`);
	return { path, text: readFileSync(path, "utf8") };
}

function readEvaluationText(runRoot: string, relativePath: string, label: string, allowMissing: boolean): { path: string; text: string; available: boolean } {
	try {
		return { ...readRequiredText(runRoot, relativePath, label), available: true };
	} catch (error) {
		if (!allowMissing) throw error;
		return { path: resolveRunRelative(runRoot, relativePath), text: "", available: false };
	}
}

function artifactPath(manifest: CodingTaskRunManifest, key: keyof CodingTaskRunManifest["artifacts"]): string {
	const value = manifest.artifacts[key];
	if (typeof value !== "string" || value.length === 0) throw new Error(`run-manifest.json.artifacts.${key} is invalid`);
	return value;
}

function parseTrace(text: string): TraceArtifact {
	const raw = object(JSON.parse(text), "trace.json");
	if (!Array.isArray(raw.events)) throw new Error("trace.json.events must be an array");
	const events = raw.events.map((entry, index) => {
		const event = object(entry, `trace.json.events[${index}]`);
		if (!Number.isSafeInteger(event.sequence)) throw new Error(`trace.json.events[${index}].sequence must be a safe integer`);
		if (typeof event.type !== "string" || event.type.length === 0) throw new Error(`trace.json.events[${index}].type must be a non-empty string`);
		return event as TraceEvent;
	});
	return { ...raw, events } as TraceArtifact;
}

export function determineOutcome(input: {
	executionStatus: ExecutionStatus;
	manifestVerificationStatus: VerificationStatus;
	verifierStatus: unknown;
}): OutcomeResult {
	if (input.executionStatus === "completed" && input.manifestVerificationStatus === "passed" && input.verifierStatus === "passed") {
		return { outcome: "PASS", evaluable: true };
	}
	if (input.executionStatus === "completed" && input.manifestVerificationStatus === "failed" && input.verifierStatus === "failed") {
		return { outcome: "TASK_FAILURE", evaluable: true };
	}
	return { outcome: "INFRA_FAILURE", evaluable: false };
}

export function readRunArtifacts(descriptor: RunDescriptor): LoadedRun {
	const runRoot = resolve(descriptor.root);
	const boundaryErrors = validateRunRootBoundary(runRoot);
	if (boundaryErrors.length > 0) throw new Error(`Run ${descriptor.runId} root is invalid: ${boundaryErrors.join("; ")}`);
	const manifestRead = readRequiredText(runRoot, "run-manifest.json", "run-manifest.json");
	const manifest = JSON.parse(manifestRead.text) as CodingTaskRunManifest;
	if (manifest.run_id !== descriptor.runId) {
		throw new Error(`RunDescriptor runId ${descriptor.runId} does not match manifest run_id ${String(manifest.run_id)}`);
	}
	const allowMissing = descriptor.evaluation?.outcome === "INFRA_FAILURE" || descriptor.evaluation?.outcome === "INVALID_TRIAL";
	const allowMissingEvaluationSupplement = descriptor.evaluation !== undefined;
	const traceRead = readEvaluationText(runRoot, artifactPath(manifest, "trace"), "trace artifact", allowMissing);
	const diffRelative = existsSync(resolveRunRelative(runRoot, "diff.json")) ? "diff.json" : artifactPath(manifest, "diff");
	const diffRead = readEvaluationText(runRoot, diffRelative, "diff artifact", allowMissing);
	const verifierResultRead = readEvaluationText(runRoot, artifactPath(manifest, "verifier_result"), "verifier result", allowMissing);
	const verifierOutputRead = readEvaluationText(runRoot, "verifier/output.txt", "verifier output", allowMissing || allowMissingEvaluationSupplement);
	const reportRead = readEvaluationText(runRoot, artifactPath(manifest, "report"), "report", allowMissing || allowMissingEvaluationSupplement);
	const unavailableArtifacts = [
		...(!traceRead.available ? ["trace" as const] : []), ...(!diffRead.available ? ["diff" as const] : []),
		...(!verifierResultRead.available ? ["verifierResult" as const] : []), ...(!verifierOutputRead.available ? ["verifierOutput" as const] : []),
		...(!reportRead.available ? ["report" as const] : []),
	];
	return {
		descriptor: { ...descriptor, root: runRoot, labels: { ...descriptor.labels } },
		manifest,
		trace: traceRead.available ? parseTrace(traceRead.text) : { events: [] },
		verifierResult: verifierResultRead.available ? object(JSON.parse(verifierResultRead.text), "verifier/result.json") : { status: "not_run" },
		manifestText: manifestRead.text,
		traceText: traceRead.text,
		diffText: diffRead.text,
		diffArtifact: diffRelative === "diff.json" ? "diff.json" : "diff.patch",
		verifierResultText: verifierResultRead.text,
		verifierOutputText: verifierOutputRead.text,
		reportText: reportRead.text,
		paths: {
			manifest: manifestRead.path,
			trace: traceRead.path,
			diff: diffRead.path,
			verifierResult: verifierResultRead.path,
			verifierOutput: verifierOutputRead.path,
			report: reportRead.path,
		},
		unavailableArtifacts,
	};
}

export function createAnalysisContext(descriptors: RunDescriptor[]): AnalysisContext {
	const runs = new Map<string, LoadedRun>();
	for (const descriptor of descriptors) {
		if (runs.has(descriptor.runId)) throw new Error(`duplicate RunDescriptor runId ${descriptor.runId}`);
		runs.set(descriptor.runId, readRunArtifacts(descriptor));
	}
	return { runs, coveredRuns: [...runs.keys()], loadedEvidence: [] };
}

function run(context: AnalysisContext, runId: string): LoadedRun {
	const value = context.runs.get(runId);
	if (!value) throw new Error(`Run ${runId} is not loaded`);
	return value;
}

export function listRuns(context: AnalysisContext): Array<Record<string, unknown>> {
	return [...context.runs.values()].map((loaded) => {
		const baseResult = determineOutcome({
			executionStatus: loaded.manifest.execution_status,
			manifestVerificationStatus: loaded.manifest.verification_status,
			verifierStatus: loaded.verifierResult.status,
		});
		const result = loaded.descriptor.evaluation ?? baseResult;
		const changedFilesCount = loaded.manifest.changes.added.length + loaded.manifest.changes.modified.length + loaded.manifest.changes.deleted.length;
		return {
			runId: loaded.manifest.run_id,
			taskId: loaded.manifest.task_id,
			...result,
			diff_empty: changedFilesCount === 0,
			changed_files_count: changedFilesCount,
			verifier_status: loaded.verifierResult.status,
			verifier_code: loaded.verifierResult.exit_code ?? null,
			...(loaded.descriptor.evaluation ? {
				attempt: loaded.descriptor.evaluation.attempt,
				includedForEvaluation: loaded.descriptor.evaluation.includedForEvaluation,
				reason: loaded.descriptor.evaluation.reason,
			} : {}),
			model: { ...loaded.manifest.model },
			skill: loaded.manifest.skill == null ? null : { ...loaded.manifest.skill },
			usage: { ...loaded.manifest.usage },
			artifacts: { ...loaded.paths },
			labels: { ...loaded.descriptor.labels },
		};
	});
}

function formalDescriptors(descriptors: RunDescriptor[]): RunDescriptor[] {
	return descriptors.filter((descriptor) => descriptor.evaluation === undefined || descriptor.evaluation.includedForEvaluation);
}

function label(descriptor: RunDescriptor, key: "case_id" | "condition"): string {
	const value = descriptor.labels[key];
	if (typeof value !== "string" || value.length === 0) throw new Error(`formal Run ${descriptor.runId} has no valid ${key}`);
	return value;
}

export function deriveRequiredRuns(
	claimScope: ClaimScope,
	anchorRunIds: string[],
	relevantCaseIds: string[],
	descriptors: RunDescriptor[],
): string[] {
	const formal = formalDescriptors(descriptors);
	const byId = new Map(formal.map((descriptor) => [descriptor.runId, descriptor]));
	if (anchorRunIds.length === 0) throw new Error("claim scope requires at least one anchor Run");
	const anchors = anchorRunIds.map((runId) => {
		const descriptor = byId.get(runId);
		if (!descriptor) throw new Error(`anchor Run ${runId} is not in the formal Evaluation`);
		return descriptor;
	});
	if (claimScope === "run_observation") return [...new Set(anchorRunIds)];
	if (claimScope === "cell_pattern") {
		const caseId = label(anchors[0]!, "case_id");
		const condition = label(anchors[0]!, "condition");
		if (anchors.some((entry) => label(entry, "case_id") !== caseId || label(entry, "condition") !== condition)) throw new Error("cell_pattern anchors must identify one case and condition");
		return formal.filter((entry) => label(entry, "case_id") === caseId && label(entry, "condition") === condition).map((entry) => entry.runId);
	}
	if (claimScope === "condition_comparison") {
		const caseId = label(anchors[0]!, "case_id");
		if (anchors.some((entry) => label(entry, "case_id") !== caseId)) throw new Error("condition_comparison anchors must identify one case");
		const selected = formal.filter((entry) => label(entry, "case_id") === caseId);
		if (new Set(selected.map((entry) => label(entry, "condition"))).size < 2) throw new Error(`case ${caseId} does not contain both formal conditions`);
		return selected.map((entry) => entry.runId);
	}
	const caseIds = [...new Set(relevantCaseIds)];
	if (caseIds.length < 2) throw new Error("cross_case requires at least two explicit relevant_case_ids");
	const availableCases = new Set(formal.map((entry) => label(entry, "case_id")));
	for (const caseId of caseIds) if (!availableCases.has(caseId)) throw new Error(`relevant Case ${caseId} is not in the formal Evaluation`);
	if (anchors.some((entry) => !caseIds.includes(label(entry, "case_id")))) throw new Error("cross_case anchor Run must belong to a relevant Case");
	return formal.filter((entry) => caseIds.includes(label(entry, "case_id"))).map((entry) => entry.runId);
}

export function deriveOpenRuns(item: InvestigationAgendaItem, descriptors: RunDescriptor[]): string[] {
	const checked = new Set(item.checked_runs);
	return deriveRequiredRuns(item.claim_scope, item.anchor_run_ids, item.relevant_case_ids, descriptors).filter((runId) => !checked.has(runId));
}

export function validateAnalysisWorkflow(state: AnalysisState, descriptors: RunDescriptor[]): void {
	if (state.phase !== "blind_analysis" && state.phase !== "alignment_ready" && state.phase !== "human_review_ready") throw new Error("Analysis phase is invalid");
	const formalIds = new Set(formalDescriptors(descriptors).map((entry) => entry.runId));
	const processResolutions = new Set(["bounded_contrast", "evidence_backed_irrelevance", "explicit_confound", "not_repeated_after_check"]);
	const agenda = new Map<string, InvestigationAgendaItem>();
	for (const item of state.investigation_agenda) {
		if (item.id.length === 0 || agenda.has(item.id)) throw new Error(`Agenda Item ID is empty or duplicate: ${item.id}`);
		if (!["run_observation", "cell_pattern", "condition_comparison", "cross_case"].includes(item.claim_scope)) throw new Error(`Agenda Item ${item.id} claim_scope is invalid`);
		if (!["open", "settled", "deprioritized"].includes(item.status)) throw new Error(`Agenda Item ${item.id} status is invalid`);
		agenda.set(item.id, item);
		for (const runId of item.checked_runs) if (!formalIds.has(runId)) throw new Error(`checked Run ${runId} is not in the formal Evaluation`);
		if (typeof item.process_investigation_required !== "boolean") throw new Error(`Agenda Item ${item.id} process_investigation_required is invalid`);
		if (item.process_investigation_resolution !== null && !processResolutions.has(item.process_investigation_resolution)) throw new Error(`Agenda Item ${item.id} process_investigation_resolution is invalid`);
		if (!item.process_investigation_required && item.process_investigation_resolution !== null) throw new Error(`Agenda Item ${item.id} has a process investigation resolution without an active obligation`);
		if ((item.status === "settled" || item.status === "deprioritized") && item.closure_reason.trim().length === 0) throw new Error(`Agenda Item ${item.id} closure_reason is required`);
		if ((item.status === "settled" || item.status === "deprioritized") && item.process_investigation_required && item.process_investigation_resolution === null) throw new Error(`Agenda Item ${item.id} cannot close with an unresolved process investigation obligation`);
		if (item.status === "settled" && deriveOpenRuns(item, descriptors).length > 0) throw new Error(`Agenda Item ${item.id} is settled before all required Runs were checked`);
	}
	for (const finding of state.finding_drafts) {
		if (!Array.isArray(finding.repeated_support_run_ids)) throw new Error(`Finding ${finding.id} repeated_support_run_ids is invalid`);
		if (new Set(finding.repeated_support_run_ids).size !== finding.repeated_support_run_ids.length) throw new Error(`Finding ${finding.id} has duplicate repeated-support Run IDs`);
		const applicable = new Set(finding.applicable_runs);
		const supported = new Set(finding.support.map((locator) => locator.run_id));
		for (const runId of finding.repeated_support_run_ids) {
			if (!formalIds.has(runId)) throw new Error(`Finding ${finding.id} repeated-support Run ${runId} is not in the formal Evaluation`);
			if (!applicable.has(runId)) throw new Error(`Finding ${finding.id} repeated-support Run ${runId} is not an applicable Run`);
			if (!supported.has(runId)) throw new Error(`Finding ${finding.id} repeated-support Run ${runId} has no supporting Evidence Locator`);
		}
		if (finding.sealed && finding.status !== "kept") throw new Error(`Finding ${finding.id} cannot seal a non-kept disposition`);
		if (state.phase === "blind_analysis" && finding.sealed) throw new Error(`Finding ${finding.id} cannot be sealed during blind_analysis`);
		if ((state.phase === "alignment_ready" || state.phase === "human_review_ready") && finding.status === "kept" && !finding.sealed) throw new Error(`Finding ${finding.id} must be sealed after blind_analysis`);
		if (finding.claim_scope === undefined && finding.agenda_item_id === undefined) continue;
		if (finding.claim_scope === undefined || !finding.agenda_item_id) throw new Error(`Finding ${finding.id} must provide claim_scope and agenda_item_id together`);
		const item = agenda.get(finding.agenda_item_id);
		if (!item) throw new Error(`Finding ${finding.id} refers to unknown Agenda Item ${finding.agenda_item_id}`);
		if (finding.status === "kept") {
			const required = deriveRequiredRuns(finding.claim_scope, finding.applicable_runs, item.relevant_case_ids, descriptors);
			const checked = new Set(item.checked_runs);
			if (required.some((runId) => !checked.has(runId))) throw new Error(`kept Finding ${finding.id} exceeds its Agenda Item checked Runs`);
		}
	}
	if ((state.phase === "alignment_ready" || state.phase === "human_review_ready") && (!state.matrix_triage_complete || state.investigation_agenda.some((item) => item.status === "open"))) throw new Error(`${state.phase} requires Global Completion`);
	if (state.phase === "human_review_ready" && state.controlled_unblind_result === undefined) throw new Error("human_review_ready requires a completed controlled-unblind result");
}

export function isAnalysisGloballyComplete(state: AnalysisState, descriptors: RunDescriptor[]): boolean {
	validateAnalysisWorkflow(state, descriptors);
	return state.matrix_triage_complete && state.investigation_agenda.every((item) => item.status === "settled" || item.status === "deprioritized");
}

const sealedPayload = (finding: FindingDraft): unknown => ({
	id: finding.id,
	agenda_item_id: finding.agenda_item_id,
	claim_scope: finding.claim_scope,
	applicable_runs: finding.applicable_runs,
	observation: finding.observation,
	interpretation: finding.interpretation,
	limitation: finding.limitation,
	repeated_support_run_ids: finding.repeated_support_run_ids,
	support: finding.support,
	counter: finding.counter,
	counter_checked: finding.counter_checked,
	status: finding.status,
});

export function validateSealedHandoffImmutability(previous: AnalysisState, next: AnalysisState): void {
	if (previous.phase === "alignment_ready" && next.phase === "blind_analysis") throw new Error("Analysis phase cannot regress from alignment_ready");
	if (previous.phase === "human_review_ready" && next.phase !== "human_review_ready") throw new Error("Analysis phase cannot regress from human_review_ready");
	const nextById = new Map(next.finding_drafts.map((finding) => [finding.id, finding]));
	for (const finding of previous.finding_drafts.filter((candidate) => candidate.sealed)) {
		const candidate = nextById.get(finding.id);
		if (!candidate) throw new Error(`sealed Finding ${finding.id} cannot be deleted or have its ID replaced`);
		if (!candidate.sealed || JSON.stringify(sealedPayload(candidate)) !== JSON.stringify(sealedPayload(finding))) throw new Error(`sealed Finding ${finding.id} A-owned payload is immutable`);
	}
}

export function finalizeAnalysisHandoff(state: AnalysisState, descriptors: RunDescriptor[]): AnalysisState {
	if (state.phase === "alignment_ready") {
		validateAnalysisWorkflow(state, descriptors);
		return structuredClone(state);
	}
	if (!isAnalysisGloballyComplete(state, descriptors)) throw new Error("Analysis cannot seal before Global Completion");
	const next: AnalysisState = {
		...structuredClone(state),
		phase: "alignment_ready",
		finding_drafts: state.finding_drafts.map((finding) => ({ ...structuredClone(finding), sealed: finding.status === "kept" })),
	};
	validateSealedHandoffImmutability(state, next);
	validateAnalysisWorkflow(next, descriptors);
	return next;
}

function visibleFields(event: TraceEvent): Record<string, string | number | boolean> {
	const output: Record<string, string | number | boolean> = { sequence: event.sequence };
	for (const key of ["phase", "tool_name", "tool_call_id", "path", "command_id", "status", "exit_code", "timed_out"] as const) {
		const value = event[key];
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") output[key] = value;
	}
	return output;
}

function summary(event: TraceEvent): string {
	const compact = JSON.stringify(event);
	return compact.length <= 240 ? compact : `${compact.slice(0, 237)}...`;
}

export function searchTrace(context: AnalysisContext, runId: string, query: TraceQuery): TraceSearchResult[] {
	const loaded = run(context, runId);
	if (loaded.unavailableArtifacts.includes("trace")) throw new Error(`Trace artifact is unavailable for Run ${runId}`);
	const limit = query.limit === undefined ? 20 : query.limit;
	if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("TraceQuery.limit must be an integer from 1 to 100");
	const keyword = query.keyword?.toLocaleLowerCase();
	return loaded.trace.events
		.filter((event) => query.eventType === undefined || event.type === query.eventType)
		.filter((event) => query.toolName === undefined || event.tool_name === query.toolName)
		.filter((event) => keyword === undefined || JSON.stringify(event).toLocaleLowerCase().includes(keyword))
		.slice(0, limit)
		.map((event) => ({
			locator: { artifact: "trace", run_id: runId, sequence: event.sequence },
			eventType: event.type,
			summary: summary(event),
			fields: visibleFields(event),
		}));
}

function verifierContent(loaded: LoadedRun): string {
	const sourceRef = loaded.verifierResult.execution && typeof loaded.verifierResult.execution === "object"
		? (loaded.verifierResult.execution as JsonObject).source_snapshot_ref
		: undefined;
	let source: { path: string; content: string } | null = null;
	if (sourceRef && typeof sourceRef === "object" && typeof (sourceRef as JsonObject).path === "string") {
		const sourceRead = readRequiredText(loaded.descriptor.root, (sourceRef as JsonObject).path as string, "verifier source snapshot");
		source = { path: (sourceRef as JsonObject).path as string, content: sourceRead.text };
	}
	return JSON.stringify({ result: loaded.verifierResult, output: loaded.verifierOutputText, source_snapshot: source }, null, 2);
}

export function readEvidence(context: AnalysisContext, locator: EvidenceLocator): EvidenceRead {
	const loaded = run(context, locator.run_id);
	const unavailable = locator.artifact === "trace" ? ["trace" as const] : locator.artifact === "diff" ? ["diff" as const] : locator.artifact === "verifier" ? ["verifierResult" as const, "verifierOutput" as const] : [];
	if (unavailable.some((artifact) => loaded.unavailableArtifacts.includes(artifact))) throw new Error(`${locator.artifact} artifact is unavailable for Run ${locator.run_id}`);
	let content: string;
	if (locator.artifact === "trace") {
		const event = loaded.trace.events.find((candidate) => candidate.sequence === locator.sequence);
		if (!event) throw new Error(`Trace sequence ${locator.sequence} does not exist in Run ${locator.run_id}`);
		content = JSON.stringify(event, null, 2);
	} else if (locator.artifact === "diff") content = loaded.diffText;
	else if (locator.artifact === "verifier") content = verifierContent(loaded);
	else content = loaded.manifestText;
	const record = { artifact: locator.artifact, locator: structuredClone(locator), characterCount: content.length };
	context.loadedEvidence.push(record);
	return { ...record, content };
}

export function resolveFindingLocators(context: AnalysisContext, locators: EvidenceLocator[]): EvidenceRead[] {
	return locators.map((locator) => readEvidence(context, locator));
}
