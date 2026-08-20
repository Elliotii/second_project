import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { RegisteredBoundFollowUpAdmissionV37, RegisteredRecoveryInspectionV37 } from "./contracts/v37-types.ts";
import type { ExecutionAccessExpectationV37G3A } from "./contracts/v37g3a-types.ts";
import { digestObject, stableJson, treeDigest } from "./hash.ts";
import { inspectRunV2A } from "./inspect-v2.ts";
import { recomputeRegisteredRecoveryAdmissionV37G3A } from "./v37/registered-recovery-v37g3a.ts";
import { recomputeRegisteredFollowUpAdmissionV37G3A, type RegisteredFollowUpOptionsV37G3A } from "./v37/registered-follow-up-v37g3a.ts";
import { primaryExecutionDeclarationV37G3A } from "./v37/host-registry-v37g3a.ts";
import { loadPrimaryRunBindingV37G3A, loadWorkflowRegistrationV37G3A } from "./v37/workflow-registration-v37g3a.ts";

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const record = value as Record<string, unknown>;
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function readCanonicalTerminal(runRoot: string): Record<string, unknown> {
	const path = resolve(runRoot, "terminal.json");
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Primary terminal must be an ordinary singly linked file");
	const bytes = readFileSync(path, "utf8"), value = JSON.parse(bytes) as unknown;
	if (bytes !== `${stableJson(value)}\n`) throw new Error("Primary terminal bytes are not canonical");
	return exact(value, Object.keys(value as Record<string, unknown>), "Primary terminal");
}

function exactCounters(value: unknown, expected: ExecutionAccessExpectationV37G3A, label: string): void {
	const counters = accessCounters(value, label);
	for (const key of Object.keys(expected) as Array<keyof ExecutionAccessExpectationV37G3A>) if (counters[key] !== expected[key]) throw new Error(`${label} does not match the Host-loaded execution profile`);
}

function accessCounters(value: unknown, label: string): ExecutionAccessExpectationV37G3A {
	const counters = exact(value, ["credential_reads", "network_calls", "external_provider_calls", "real_model_calls"], label);
	for (const key of ["credential_reads", "network_calls", "external_provider_calls", "real_model_calls"] as const) if (!Number.isSafeInteger(counters[key]) || Number(counters[key]) < 0) throw new Error(`${label} contains an invalid counter`);
	return counters as unknown as ExecutionAccessExpectationV37G3A;
}

function inspectedProviderDispatches(runRoot: string, inspected: ReturnType<typeof inspectRunV2A>): number {
	const events = readFileSync(resolve(runRoot, "journal.jsonl"), "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as { type?: unknown; data?: Record<string, unknown> });
	const settled = events.filter((event) => event.type === "primary_settled");
	const primaryDispatches = settled[0]?.data?.provider_dispatches;
	const candidateDispatches = inspected.candidates.reduce((total, candidate) => total + candidate.budget_usage.faux_provider_dispatches, 0);
	if (settled.length !== 1 || !Number.isSafeInteger(primaryDispatches) || Number(primaryDispatches) < 0 || !Number.isSafeInteger(candidateDispatches) || candidateDispatches < 0) throw new Error("Primary Provider dispatch ledger is invalid");
	const total = Number(primaryDispatches) + candidateDispatches;
	if (!Number.isSafeInteger(total)) throw new Error("Primary Provider dispatch ledger is invalid");
	return total;
}

function validateRealCounters(actual: ExecutionAccessExpectationV37G3A, maxima: ExecutionAccessExpectationV37G3A, providerDispatches: number): void {
	for (const key of Object.keys(maxima) as Array<keyof ExecutionAccessExpectationV37G3A>) {
		if (!Number.isSafeInteger(maxima[key]) || maxima[key] < 0) throw new Error("registered Primary access maximum is invalid");
		if (actual[key] > maxima[key]) throw new Error("Primary actual access exceeds the registered maximum");
	}
	if (actual.credential_reads <= 0) throw new Error("real-declared Primary requires a positive Credential read count");
	if (actual.network_calls !== providerDispatches || actual.external_provider_calls !== providerDispatches || actual.real_model_calls !== providerDispatches) throw new Error("Primary actual access does not match the inspected Provider dispatch ledger");
}

export type PrimaryRouteV37G3A = "no_recovery_needed" | "ready_for_recovery" | "recovery_inconclusive";

export function validatePrimaryTerminalV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; returnedTerminal?: Record<string, unknown>; realAccessAuthorized?: boolean }): { terminal: Record<string, unknown>; route: PrimaryRouteV37G3A } {
	const registered = loadWorkflowRegistrationV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, allowHistoricalReadOnly: true });
	const binding = loadPrimaryRunBindingV37G3A({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, runRoot: options.runRoot, allowHistoricalReadOnly: true });
	const declaration = primaryExecutionDeclarationV37G3A(registered.loadedCase.manifest);
	if (options.realAccessAuthorized !== undefined && declaration.realAccessDeclared !== options.realAccessAuthorized) throw new Error("Primary real-access authorization/declaration mismatch");
	const stored = readCanonicalTerminal(options.runRoot);
	if (options.returnedTerminal && stableJson(options.returnedTerminal) !== stableJson(stored)) throw new Error("Primary returned/stored terminal mismatch");
	if (stored.run_id !== binding.primary_run_id || binding.workflow_id !== registered.workflow.workflow_id || binding.workflow_registration_digest !== registered.workflow.workflow_registration_digest || binding.primary_task_instance_digest !== registered.primary.task_instance_digest) throw new Error("Primary terminal/Run/workflow/Task binding mismatch");
	const taskSpec = registered.loadedCase.manifest.primary_task_spec.body as { task_id: string };
	if (stored.schema_version === "v2a-run-terminal-v2") {
		const actualCounters = accessCounters(stored.real_call_counters, "Primary actual access counters");
		const inspected = inspectRunV2A({ projectRoot: options.projectRoot, runRoot: options.runRoot, expectedTaskId: taskSpec.task_id, expectedRealExecutionAuthorized: declaration.realAccessDeclared, expectedExecutionPortKind: declaration.executionPortKind, expectedRealCallCounters: declaration.realAccessDeclared ? actualCounters : declaration.accessExpectation });
		if (!inspected.integrity_valid || !inspected.terminal_valid || !inspected.terminal || stableJson(inspected.terminal) !== stableJson(stored)) throw new Error(`Primary V2 terminal inspection failed: ${inspected.errors.join("; ")}`);
		if (declaration.realAccessDeclared) validateRealCounters(actualCounters, declaration.accessExpectation, inspectedProviderDispatches(options.runRoot, inspected));
		if (declaration.primaryMode === "pass") {
			if (inspected.terminal.outcome !== "initial_pass" || inspected.terminal.primary_verifier_status !== "passed") throw new Error("Primary V2 terminal contradicts the registered pass mode");
			return { terminal: stored, route: "no_recovery_needed" };
		}
		if (inspected.terminal.primary_verifier_status !== "failed") throw new Error("Primary V2 terminal contradicts the registered failure/recovery mode");
		if (inspected.terminal.outcome === "recovery_selected" && inspected.selection?.selected_candidate_id && inspected.candidates.length === 2) return { terminal: stored, route: "ready_for_recovery" };
		if (inspected.terminal.outcome === "recovery_none" && inspected.selection?.selected_candidate_id === null && inspected.selection.eligible_candidate_ids.length === 0 && inspected.candidates.length === 2) return { terminal: stored, route: "recovery_inconclusive" };
		throw new Error("Primary V2 terminal has no accepted registered route");
	}
	if (declaration.realAccessDeclared) throw new Error("real-declared Primary must use an independently inspected V2 terminal");
	const terminal = exact(stored, ["schema_version", "kind", "run_id", "task_id", "workspace_digest", "verifier_source_sha256", "verifier_status", "outcome", "credential_reads", "network_calls", "external_provider_calls", "real_model_calls", "terminal_digest"], "G3A Primary terminal");
	if (terminal.schema_version !== 1 || terminal.kind !== "v37_g3a_primary_terminal" || declaration.primaryMode !== "pass" || terminal.task_id !== taskSpec.task_id || terminal.workspace_digest !== treeDigest(resolve(options.runRoot, "primary/workspace")) || terminal.verifier_source_sha256 !== (registered.loadedCase.manifest.primary_verifier_spec.body as { source_sha256: string }).source_sha256 || terminal.verifier_status !== "passed" || terminal.outcome !== "passed") throw new Error("G3A Primary terminal identity/Task/Source/Verifier/Outcome mismatch");
	exactCounters({ credential_reads: terminal.credential_reads, network_calls: terminal.network_calls, external_provider_calls: terminal.external_provider_calls, real_model_calls: terminal.real_model_calls }, declaration.accessExpectation, "G3A Primary access counters");
	const { terminal_digest: declaredDigest, ...body } = terminal;
	if (typeof declaredDigest !== "string" || digestObject(body) !== declaredDigest) throw new Error("G3A Primary terminal digest mismatch");
	return { terminal: stored, route: "no_recovery_needed" };
}

export function inspectRegisteredRecoveryAdmissionV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; confirmedAt: string; requestedAt: string }): RegisteredRecoveryInspectionV37 {
	try { return { integrity_valid: true, errors: [], admission: recomputeRegisteredRecoveryAdmissionV37G3A(options) }; }
	catch (error) { return { integrity_valid: false, errors: [error instanceof Error ? error.message : String(error)], admission: null }; }
}

export interface RegisteredFollowUpInspectionV37G3A {
	integrity_valid: boolean;
	errors: string[];
	admission: RegisteredBoundFollowUpAdmissionV37 | null;
}

export async function inspectRegisteredFollowUpAdmissionV37G3A(options: RegisteredFollowUpOptionsV37G3A & { historicalReadOnly?: true }): Promise<RegisteredFollowUpInspectionV37G3A> {
	try { return { integrity_valid: true, errors: [], admission: await recomputeRegisteredFollowUpAdmissionV37G3A(options) }; }
	catch (error) { return { integrity_valid: false, errors: [error instanceof Error ? error.message : String(error)], admission: null }; }
}
