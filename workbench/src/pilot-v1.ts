import { appendFileSync, existsSync, mkdirSync, openSync, closeSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BudgetUsageV1B, ExecutionCellV1B, ExecutionManifestV1B, LedgerEntryV1B, LedgerStateV1B, PauseEvidenceV1B, PausePhaseV1B, TerminalCellEvidenceV1B } from "./contracts/v1-types.ts";
import { writeOnceJson } from "./evidence/artifacts.ts";
import { fileSha256, stableJson } from "./hash.ts";
import { validateExecutionManifestV1B } from "./experiment/v1.ts";
import { emptyBudgetUsageV1B } from "./pi/pi-run-handle-v1.ts";
import { executeV1RunCell, V1BTypedPauseError, type ExecuteV1RunCellOptions, type ExecuteV1RunCellResult } from "./run-v1.ts";
import { FixedProviderBoundaryErrorV1B, type OneRunProviderAuthorityV1B } from "./provider/fixed-provider-v1.ts";

export interface PilotStateV1B {
	manifest: ExecutionManifestV1B;
	ledger: LedgerEntryV1B[];
	next_cell: ExecutionCellV1B | null;
	pilot_usage: BudgetUsageV1B;
}

function ledgerPath(pilotRoot: string): string { return resolve(pilotRoot, "ledger.jsonl"); }

export function readPilotLedgerV1B(pilotRoot: string): LedgerEntryV1B[] {
	return readFileSync(ledgerPath(pilotRoot), "utf8").split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as LedgerEntryV1B);
}

function appendLedger(pilotRoot: string, manifest: ExecutionManifestV1B, cell: ExecutionCellV1B, state: LedgerStateV1B, causeId: string | null, runResultRef: string | null, pause?: { ref: NonNullable<LedgerEntryV1B["pause_evidence_ref"]>; journalSha256: string }): LedgerEntryV1B {
	const entries = readPilotLedgerV1B(pilotRoot);
	validatePilotLedgerV1B(manifest, entries);
	const entry: LedgerEntryV1B = { schema_version: 1, seq: entries.length + 1, timestamp: new Date().toISOString(), manifest_id: manifest.manifest_id, cell_id: cell.cell_id, planned_run_id: cell.planned_run_id, state, cause_id: causeId, run_result_ref: runResultRef, ...(pause ? { pause_evidence_ref: pause.ref, journal_sha256: pause.journalSha256 } : {}) };
	appendFileSync(ledgerPath(pilotRoot), `${stableJson(entry)}\n`, "utf8");
	return entry;
}

export function validatePilotLedgerV1B(manifest: ExecutionManifestV1B, entries: LedgerEntryV1B[]): void {
	const members = new Map(manifest.cells.map((cell) => [cell.cell_id, cell]));
	const states = new Map<string, LedgerStateV1B[]>();
	for (const [index, entry] of entries.entries()) {
		if (entry.seq !== index + 1 || entry.schema_version !== 1 || entry.manifest_id !== manifest.manifest_id) throw new Error("Pilot ledger sequence/revision drift");
		const cell = members.get(entry.cell_id);
		if (!cell || entry.planned_run_id !== cell.planned_run_id) throw new Error("Pilot ledger contains non-Manifest cell");
		const prior = states.get(entry.cell_id) ?? [];
		const valid = prior.length === 0
			? entry.state === "planned"
			: prior.length === 1
				? entry.state === "started" || entry.state === "paused"
				: prior.length === 2 && prior[1] === "started"
					? ["terminal", "invalid", "paused"].includes(entry.state)
					: false;
		if (!valid) throw new Error("Pilot ledger transition invalid");
		if (prior.length === 0 && (entry.cause_id !== null || entry.run_result_ref !== null)) throw new Error("planned ledger entry carries runtime disposition");
		if (prior.length === 1 && entry.state === "started" && (entry.cause_id !== null || entry.run_result_ref !== null)) throw new Error("started ledger entry carries terminal disposition");
		if (["terminal", "invalid"].includes(entry.state) && !entry.run_result_ref) throw new Error("terminal ledger transition lacks RunResult ref");
		if (entry.state === "terminal" && entry.cause_id !== null) throw new Error("valid terminal ledger transition carries invalid cause");
		if (entry.state === "invalid" && !entry.cause_id) throw new Error("invalid ledger transition lacks typed cause");
		if (entry.state === "paused" && !entry.cause_id) throw new Error("paused ledger transition lacks cause");
		if (entry.state !== "paused" && (entry.pause_evidence_ref || entry.journal_sha256)) throw new Error("non-paused ledger transition carries pause evidence");
		if (entry.state === "paused" && prior.at(-1) === "started" && (!entry.pause_evidence_ref || !entry.journal_sha256)) throw new Error("started pause lacks typed evidence relation");
		prior.push(entry.state); states.set(entry.cell_id, prior);
	}
	let missingPrior = false;
	for (const cell of manifest.cells) {
		const sequence = states.get(cell.cell_id) ?? [];
		if (sequence.length === 0) {
			missingPrior = true;
			continue;
		}
		if (missingPrior) throw new Error("Pilot ledger skipped a prior cell");
		if (sequence[0] !== "planned") throw new Error("Pilot ledger cell was not planned");
	}
}

function aggregateUsage(pilotRoot: string, manifest: ExecutionManifestV1B, entries: LedgerEntryV1B[]): BudgetUsageV1B {
	const usage = emptyBudgetUsageV1B();
	for (const entry of entries.filter((value) => value.state === "terminal" || value.state === "invalid")) {
		const cell = manifest.cells.find((value) => value.cell_id === entry.cell_id)!;
		const terminal = JSON.parse(readFileSync(resolve(pilotRoot, "runs", cell.planned_run_id, "terminal-evidence.json"), "utf8")) as TerminalCellEvidenceV1B;
		for (const key of Object.keys(usage) as Array<keyof BudgetUsageV1B>) usage[key] += terminal.budget_usage[key];
	}
	for (const entry of entries.filter((value) => value.state === "paused" && value.pause_evidence_ref)) {
		const pause = JSON.parse(readFileSync(resolve(pilotRoot, "runs", entry.planned_run_id, entry.pause_evidence_ref!.path), "utf8")) as PauseEvidenceV1B;
		for (const key of Object.keys(usage) as Array<keyof BudgetUsageV1B>) usage[key] += pause.budget_usage_after_conservative_charge[key];
	}
	return usage;
}

function nextCell(manifest: ExecutionManifestV1B, entries: LedgerEntryV1B[]): ExecutionCellV1B | null {
	const byCell = new Map<string, LedgerEntryV1B[]>();
	for (const entry of entries) { const list = byCell.get(entry.cell_id) ?? []; list.push(entry); byCell.set(entry.cell_id, list); }
	for (const cell of manifest.cells) {
		const transitions = byCell.get(cell.cell_id) ?? [];
		if (transitions.some((entry) => entry.state === "paused")) throw new Error(`Pilot paused at ${cell.cell_id}`);
		if (!transitions.some((entry) => entry.state === "terminal" || entry.state === "invalid")) {
			if (transitions.some((entry) => entry.state === "started")) throw new Error(`Cell already started without terminal evidence: ${cell.cell_id}`);
			return cell;
		}
	}
	return null;
}

export function initializePilotV1B(options: { projectRoot: string; pilotRoot: string; manifest: ExecutionManifestV1B }): PilotStateV1B {
	validateExecutionManifestV1B(options.manifest, options.projectRoot);
	if (existsSync(options.pilotRoot)) throw new Error("Pilot root already exists");
	mkdirSync(options.pilotRoot, { recursive: true });
	mkdirSync(resolve(options.pilotRoot, "runs"), { recursive: false });
	writeOnceJson(options.pilotRoot, "manifest.json", options.manifest);
	const handle = openSync(ledgerPath(options.pilotRoot), "wx"); closeSync(handle);
	for (const cell of options.manifest.cells) appendLedger(options.pilotRoot, options.manifest, cell, "planned", null, null);
	const ledger = readPilotLedgerV1B(options.pilotRoot);
	return { manifest: options.manifest, ledger, next_cell: nextCell(options.manifest, ledger), pilot_usage: emptyBudgetUsageV1B() };
}

export function loadPilotStateV1B(options: { projectRoot: string; pilotRoot: string }): PilotStateV1B {
	const manifest = JSON.parse(readFileSync(resolve(options.pilotRoot, "manifest.json"), "utf8")) as ExecutionManifestV1B;
	validateExecutionManifestV1B(manifest, options.projectRoot);
	const ledger = readPilotLedgerV1B(options.pilotRoot);
	validatePilotLedgerV1B(manifest, ledger);
	const pilotUsage = aggregateUsage(options.pilotRoot, manifest, ledger);
	return { manifest, ledger, next_cell: nextCell(manifest, ledger), pilot_usage: pilotUsage };
}

export async function runNextPilotCellV1B(options: {
	projectRoot: string;
	pilotRoot: string;
	realExecution?: { createAuthority(cell: ExecutionCellV1B): OneRunProviderAuthorityV1B };
	replacementSequence?: { assertCurrent(): void; beforeInitialStart(runId: string): void; beforeChildStart(runId: string, attemptId: string): void };
	deterministicInjection?: ExecuteV1RunCellOptions["deterministicInjection"];
	fakeScenario?: ExecuteV1RunCellOptions["fakeScenario"];
	deterministicPausePhase?: PausePhaseV1B;
	deterministicPauseRequestOrdinal?: number;
}): Promise<ExecuteV1RunCellResult | null> {
	const state = loadPilotStateV1B(options);
	const cell = state.next_cell;
	if (!cell) return null;
	if (state.manifest.execution_mode === "stage2_real" && !options.realExecution) throw new Error("real execution dependencies are unavailable");
	if (state.manifest.execution_mode === "stage1_zero_call" && options.realExecution) throw new Error("Stage 1 rejects real execution dependencies");
	if (state.manifest.experiment_revision === 2 && !options.replacementSequence) throw new Error("V1-B replacement sequence authority is required");
	if (state.manifest.experiment_revision === 1 && options.replacementSequence) throw new Error("V1-B revision 1 rejects replacement sequence authority");
	options.replacementSequence?.assertCurrent();
	let realAuthority: OneRunProviderAuthorityV1B | undefined;
	if (options.realExecution) {
		try {
			realAuthority = options.realExecution.createAuthority(cell);
			realAuthority.assertAvailable();
		} catch {
			throw new FixedProviderBoundaryErrorV1B();
		}
	}
	if (options.deterministicInjection?.kind === "global_budget_stop") {
		appendLedger(options.pilotRoot, state.manifest, cell, "paused", options.deterministicInjection.cause_id, null);
		throw new V1BTypedPauseError("global_budget_stop", options.deterministicInjection.cause_id);
	}
	const invalid = state.ledger.filter((entry) => entry.state === "invalid").filter((entry) => {
		const terminal = JSON.parse(readFileSync(resolve(options.pilotRoot, "runs", entry.planned_run_id, "terminal-evidence.json"), "utf8")) as TerminalCellEvidenceV1B;
		return terminal.failure_class === "infrastructure_invalid" || terminal.failure_class === "evidence_invalid";
	});
	const started = state.ledger.filter((entry) => entry.state === "started");
	if (started.length > 0 && invalid.length / started.length >= state.manifest.policy.invalid_ratio_pause_threshold) {
		appendLedger(options.pilotRoot, state.manifest, cell, "paused", "pilot_invalid_ratio_threshold", null);
		throw new V1BTypedPauseError("paused_unclassified", "pilot_invalid_ratio_threshold");
	}
	const causeCounts = new Map<string, number>();
	for (const entry of invalid) if (entry.cause_id) causeCounts.set(entry.cause_id, (causeCounts.get(entry.cause_id) ?? 0) + 1);
	if ([...causeCounts.values()].some((count) => count >= state.manifest.policy.repeated_invalid_cause_pause_count)) {
		appendLedger(options.pilotRoot, state.manifest, cell, "paused", "pilot_repeated_invalid_cause", null);
		throw new V1BTypedPauseError("paused_unclassified", "pilot_repeated_invalid_cause");
	}
	options.replacementSequence?.beforeInitialStart(cell.planned_run_id);
	appendLedger(options.pilotRoot, state.manifest, cell, "started", null, null);
	const runRoot = resolve(options.pilotRoot, "runs", cell.planned_run_id);
	try {
		const result = await executeV1RunCell({ projectRoot: options.projectRoot, manifest: state.manifest, cell, runRoot, pilotUsage: state.pilot_usage, ...(options.replacementSequence ? { replacementSequence: options.replacementSequence } : {}), ...(realAuthority ? { realExecution: { authority: realAuthority } } : {}), ...(options.fakeScenario ? { fakeScenario: options.fakeScenario } : {}), ...(options.deterministicInjection ? { deterministicInjection: options.deterministicInjection } : {}), ...(options.deterministicPausePhase ? { deterministicPausePhase: options.deterministicPausePhase } : {}), ...(options.deterministicPauseRequestOrdinal !== undefined ? { deterministicPauseRequestOrdinal: options.deterministicPauseRequestOrdinal } : {}) });
		appendLedger(options.pilotRoot, state.manifest, cell, result.terminal.disposition === "invalid" ? "invalid" : "terminal", result.terminal.cause_id, `runs/${cell.planned_run_id}/run-result.json`);
		return result;
	} catch (error) {
		const cause = error instanceof V1BTypedPauseError ? error.causeId : "paused_unclassified";
		const pauseRef = error instanceof V1BTypedPauseError ? error.pauseEvidenceRef : undefined;
		if (!pauseRef) throw error;
		const journalPath = resolve(runRoot, "journal.jsonl");
		appendLedger(options.pilotRoot, state.manifest, cell, "paused", cause, null, { ref: pauseRef, journalSha256: fileSha256(journalPath) });
		throw error;
	}
}

export async function simulatePilotV1B(options: { projectRoot: string; pilotRoot: string; manifest: ExecutionManifestV1B }): Promise<ExecuteV1RunCellResult[]> {
	initializePilotV1B(options);
	const results: ExecuteV1RunCellResult[] = [];
	for (;;) {
		const result = await runNextPilotCellV1B({ projectRoot: options.projectRoot, pilotRoot: options.pilotRoot });
		if (!result) break;
		results.push(result);
	}
	if (results.length !== 24) throw new Error("Stage 1 simulation did not terminalize all 24 cells");
	return results;
}
