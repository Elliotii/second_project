import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { AgentHarness, JsonlSessionRepo, type AgentMessage, type JsonlSessionMetadata, type SessionTreeEntry } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall, type AssistantMessage } from "@earendil-works/pi-ai";
import type { SafeSessionMessageV35 } from "../contracts/v35-types.ts";
import type { SafePersistentSessionV36 } from "../contracts/v36-types.ts";
import type { DockerCommandAuthorityV36, DockerTerminalEvidenceV36, FiniteBudgetDimensionV36, FiniteBudgetTerminalV36, ProviderRequestBudgetTerminalV36, ReconciledFiniteBudgetTerminalV36, ReconciledRegisteredCommandTerminalV36, RegisteredCommandTerminalV36, SafeFiniteBudgetTerminalV36 } from "../contracts/v36g2-types.ts";
import { readJsonArtifact, writeOnceJson } from "../evidence/artifacts.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { createBoundedToolProfile, type BoundedCommandExecutor } from "../pi/tool-profile.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import { managedWorkspaceIdentityV36 } from "../workspace/managed-copy-v36.ts";
import { assertBoundedEditBudgetProfileV36, type BoundedEditBudgetProfileV36, V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE } from "../v36/budget-profile-v36.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const READ_ONLY_TOOLS = ["workspace_read", "workspace_list"] as const;
const SYSTEM_PROMPT = "You are a deterministic V3.6 Goal 1 persistence agent. Inspect only the managed Workspace using the available read-only tools. Project commands and writes are unavailable.";

export const V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE = "V36_PROVIDER_REQUEST_BUDGET_EXHAUSTED";
export const V36_FINITE_BUDGET_TERMINAL_CODE = "V36_RECONCILED_FINITE_BUDGET_EXHAUSTED";

export class ProviderRequestBudgetTerminalV36Error extends Error {
	readonly code = V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE;
	readonly requestAttempt: number;

	constructor(requestAttempt: number) {
		super(`${V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE}: request attempt ${requestAttempt} refused before dispatch`);
		this.name = "ProviderRequestBudgetTerminalV36Error";
		this.requestAttempt = requestAttempt;
	}
}

class ReconciledFiniteBudgetTerminalV36Error extends Error {
	readonly code = V36_FINITE_BUDGET_TERMINAL_CODE;
	readonly reason: ReconciledFiniteBudgetTerminalV36["terminal_reason"];
	readonly dimensions: FiniteBudgetDimensionV36[];

	constructor(reason: ReconciledFiniteBudgetTerminalV36["terminal_reason"], dimensions: FiniteBudgetDimensionV36[]) {
		super(`${V36_FINITE_BUDGET_TERMINAL_CODE}: ${reason}`);
		this.name = "ReconciledFiniteBudgetTerminalV36Error";
		this.reason = reason;
		this.dimensions = structuredClone(dimensions);
	}
}

interface RuntimeMetadataV36 extends Record<string, unknown> {
	schema_version: 1;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
}

interface RuntimeManifestV36 {
	schema_version: 1;
	mode: "v36_interactive_deterministic_faux";
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	created_at: string;
	settled: true;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	prompt_sha256: string;
	provider_requests: 2;
	active_tool_names: ["workspace_read", "workspace_list"];
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: 0;
	network_calls: 0;
	external_provider_calls: 0;
	real_model_calls: 0;
	project_command_executions: 0;
	docker_project_command_executions: 0;
	manifest_digest: string;
}

export interface RuntimeManifestG2V36 {
	schema_version: 2;
	mode: "v36_interactive_bounded_edit";
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	created_at: string;
	settled: true;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	prompt_sha256: string;
	provider_requests: number;
	active_tool_names: string[];
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	project_command_executions: number;
	docker_project_command_executions: number;
	backend_terminal_digests: string[];
	workspace_identity_after: string;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	manifest_digest: string;
}

export interface InteractiveDispatchManifestV36 {
	mode: "v36_interactive_deterministic_faux" | "v36_interactive_bounded_edit";
	run_id: string;
	session_id: string;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	project_command_executions: number;
	docker_project_command_executions: number;
}

export interface PersistentInteractiveTurnResultV36 {
	manifest: InteractiveDispatchManifestV36 | FiniteBudgetTerminalV36;
	view: SafePersistentSessionV36;
}

export interface PersistentInteractiveBoundedTurnResultV36 extends PersistentInteractiveTurnResultV36 {
	manifest: RuntimeManifestG2V36 | FiniteBudgetTerminalV36;
}

function identifier(value: string, label: string): void {
	if (!ID.test(value)) throw new Error(`${label} is invalid`);
}

function ordinaryDirectory(pathValue: string, label: string, create = false): string {
	const path = resolve(pathValue);
	if (create) mkdirSync(path, { recursive: true });
	const stats = lstatSync(path);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
	return realpathSync.native(path);
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function runRoot(runtimeRoot: string, runId: string, create = false): string {
	identifier(runId, "Run ID");
	const parent = ordinaryDirectory(resolve(runtimeRoot, "runs"), "interactive Runtime Runs root", true);
	const target = resolve(parent, runId);
	if (!contained(runtimeRoot, target)) throw new Error("interactive Runtime Run path escaped");
	if (create) mkdirSync(target, { recursive: false });
	return target;
}

function safeText(value: string): string {
	const redacted = value
		.replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+/gi, "[credential omitted]")
		.replace(/\b(api[_-]?key|authorization|password|secret|access[_-]?token)\s*[:=]\s*[^\s,;]+/gi, "$1=[credential omitted]")
		.replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"']+/g, "[path omitted]")
		.replace(/(^|\s)\/(?:[^\s"']+\/)*[^\s"']*/g, "$1[path omitted]");
	const bytes = Buffer.from(redacted, "utf8");
	return bytes.length <= 8_192 ? redacted : `${bytes.subarray(0, 8_128).toString("utf8")}\n[content truncated]`;
}

function messageText(content: unknown): string {
	if (typeof content === "string") return safeText(content);
	if (!Array.isArray(content)) return "";
	return content.flatMap((part) => part && typeof part === "object" && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string" ? [safeText((part as { text: string }).text)] : []).join("\n");
}

function projectMessages(entries: readonly SessionTreeEntry[]): SafeSessionMessageV35[] {
	const result: SafeSessionMessageV35[] = [];
	for (const entry of entries) {
		if (entry.type !== "message") continue;
		const message = entry.message as unknown as Record<string, unknown>;
		if (message.role === "user") result.push({ entry_id: entry.id, role: "user", text: messageText(message.content), tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
		if (message.role === "assistant") {
			const content = Array.isArray(message.content) ? message.content : [];
			const text = messageText(content);
			if (text) result.push({ entry_id: entry.id, role: "assistant", text, tool_call_id: null, tool_name: null, tool_arguments_sha256: null, is_error: null });
			for (const part of content) if (part && typeof part === "object" && (part as { type?: unknown }).type === "toolCall") {
				const call = part as Record<string, unknown>;
				result.push({ entry_id: entry.id, role: "tool", text: null, tool_call_id: typeof call.id === "string" ? call.id : null, tool_name: typeof call.name === "string" ? call.name : null, tool_arguments_sha256: digestObject(call.arguments ?? null), is_error: null });
			}
		}
		if (message.role === "toolResult") result.push({ entry_id: entry.id, role: "tool", text: messageText(message.content), tool_call_id: typeof message.toolCallId === "string" ? message.toolCallId : null, tool_name: typeof message.toolName === "string" ? message.toolName : null, tool_arguments_sha256: null, is_error: typeof message.isError === "boolean" ? message.isError : null });
	}
	return result;
}

function parseMetadata(value: unknown, expected: { projectId: string; workspaceId: string; pinDigest: string }): RuntimeMetadataV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Pi Session metadata is invalid");
	const record = value as Partial<RuntimeMetadataV36>;
	if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(["schema_version", "project_id", "workspace_id", "session_pin_digest"].sort()) || record.schema_version !== 1 || record.project_id !== expected.projectId || record.workspace_id !== expected.workspaceId || record.session_pin_digest !== expected.pinDigest) throw new Error("V3.6 Pi Session metadata identity mismatch");
	return record as RuntimeMetadataV36;
}

function parseManifest(value: unknown): RuntimeManifestV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Runtime Manifest is invalid");
	const manifest = value as RuntimeManifestV36;
	const { manifest_digest: _digest, ...body } = manifest;
	if (manifest.schema_version !== 1 || manifest.mode !== "v36_interactive_deterministic_faux" || !ID.test(manifest.run_id) || !ID.test(manifest.session_id) || !ID.test(manifest.project_id) || !ID.test(manifest.workspace_id) || !SHA256.test(manifest.session_pin_digest) || manifest.settled !== true || !SHA256.test(manifest.prior_context_sha256) || manifest.prior_context_sha256 !== manifest.provider_observed_prior_context_sha256 || !SHA256.test(manifest.session_entries_sha256_after_turn) || !SHA256.test(manifest.prompt_sha256) || manifest.provider_requests !== 2 || stableJson(manifest.active_tool_names) !== stableJson(READ_ONLY_TOOLS) || !Array.isArray(manifest.tool_call_ids) || stableJson(manifest.tool_call_ids) !== stableJson(manifest.tool_result_ids) || manifest.credential_reads !== 0 || manifest.network_calls !== 0 || manifest.external_provider_calls !== 0 || manifest.real_model_calls !== 0 || manifest.project_command_executions !== 0 || manifest.docker_project_command_executions !== 0 || !SHA256.test(manifest.manifest_digest) || digestObject(body) !== manifest.manifest_digest) throw new Error("V3.6 Runtime Manifest is invalid");
	return manifest;
}

function parseManifestG2(value: unknown): RuntimeManifestG2V36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 Goal 2 Runtime Manifest is invalid");
	const manifest = value as RuntimeManifestG2V36;
	const { manifest_digest: _digest, ...body } = manifest;
	if (manifest.schema_version !== 2 || manifest.mode !== "v36_interactive_bounded_edit" || !ID.test(manifest.run_id) || !ID.test(manifest.session_id) || !ID.test(manifest.project_id) || !ID.test(manifest.workspace_id) || !SHA256.test(manifest.session_pin_digest) || manifest.settled !== true || !SHA256.test(manifest.prior_context_sha256) || manifest.prior_context_sha256 !== manifest.provider_observed_prior_context_sha256 || !SHA256.test(manifest.session_entries_sha256_after_turn) || !SHA256.test(manifest.prompt_sha256) || !Number.isSafeInteger(manifest.provider_requests) || manifest.provider_requests < 1 || manifest.provider_requests > V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.provider_requests_hard_max || !Array.isArray(manifest.active_tool_names) || stableJson(manifest.active_tool_names) !== stableJson(["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"]) || !Array.isArray(manifest.tool_call_ids) || stableJson(manifest.tool_call_ids) !== stableJson(manifest.tool_result_ids) || ![manifest.credential_reads, manifest.network_calls, manifest.external_provider_calls, manifest.real_model_calls, manifest.project_command_executions, manifest.docker_project_command_executions, manifest.input_tokens, manifest.output_tokens].every((entry) => Number.isSafeInteger(entry) && entry >= 0) || manifest.project_command_executions < 1 || manifest.project_command_executions !== manifest.docker_project_command_executions || !Array.isArray(manifest.backend_terminal_digests) || manifest.backend_terminal_digests.length !== manifest.project_command_executions || manifest.backend_terminal_digests.some((entry) => !SHA256.test(entry)) || !SHA256.test(manifest.workspace_identity_after) || !Number.isFinite(manifest.cost_usd) || manifest.cost_usd < 0 || !SHA256.test(manifest.manifest_digest) || digestObject(body) !== manifest.manifest_digest) throw new Error("V3.6 Goal 2 Runtime Manifest is invalid");
	return manifest;
}

const BUDGET_STOP_KEYS_V1 = [
	"schema_version", "terminal_kind", "trajectory_outcome", "terminal_reason", "run_id", "session_id", "project_id", "workspace_id", "session_pin_digest", "authority_digest", "created_at", "settled",
	"request_attempts", "provider_dispatches", "provider_responses", "provider_requests_max", "pending_provider_reservations", "pending_tool_calls", "pending_side_effects",
	"usage_known", "input_tokens", "output_tokens", "cost_usd", "tool_calls", "last_registered_command", "workspace_identity_at_terminal", "session_entry_count_before_turn", "session_entries_sha256_before_turn", "session_entry_count_at_terminal", "session_entries_sha256_at_terminal",
	"verification_mode", "formal_outcome", "comparison_eligible", "adaptation_eligible", "promotion_eligible", "terminal_digest",
] as const;

const BUDGET_STOP_KEYS_V2 = [...BUDGET_STOP_KEYS_V1, "budget_profile_id"] as const;

const FINITE_BUDGET_STOP_KEYS_V3 = [
	"schema_version", "budget_profile_id", "terminal_kind", "trajectory_outcome", "terminal_reason", "stop_dimensions", "run_id", "session_id", "project_id", "workspace_id", "session_pin_digest", "authority_digest", "created_at", "settled",
	"request_attempts", "provider_dispatches", "provider_responses", "pending_provider_reservations", "provider_accounting_reconciled", "pending_tool_calls", "pending_side_effects", "tool_call_attempts", "tool_calls_executed", "tool_calls_completed", "tool_calls_blocked", "tool_results_recorded", "executed_tool_call_ids", "tool_lifecycle_reconciled",
	"usage_known", "harness_diagnostic_error_sha256", "input_tokens", "output_tokens", "cost_usd", "wall_time_ms", "last_registered_command", "command_evidence_reconciled", "workspace_identity_at_terminal", "workspace_identity_reconciled", "session_entry_count_before_turn", "session_entries_sha256_before_turn", "session_entry_count_at_terminal", "session_entries_sha256_at_terminal", "session_identity_reconciled", "authority_identity_reconciled",
	"verification_mode", "formal_outcome", "comparison_eligible", "adaptation_eligible", "promotion_eligible", "terminal_digest",
] as const;

function terminalBody(value: ProviderRequestBudgetTerminalV36): Omit<ProviderRequestBudgetTerminalV36, "terminal_digest"> {
	const { terminal_digest: _digest, ...body } = value;
	return body;
}

function finiteTerminalBody(value: ReconciledFiniteBudgetTerminalV36): Omit<ReconciledFiniteBudgetTerminalV36, "terminal_digest"> {
	const { terminal_digest: _digest, ...body } = value;
	return body;
}

function commandEvidenceRef(ordinal: number, file: "authority.json" | "terminal.json"): string {
	return `docker-commands/command-${ordinal}/${file}`;
}

function parseRegisteredCommandTerminal(value: unknown): RegisteredCommandTerminalV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 budget terminal registered command is invalid");
	const command = value as RegisteredCommandTerminalV36;
	if (stableJson(Object.keys(command).sort()) !== stableJson(["command_id", "exit_code", "timed_out", "truncated", "command_ordinal", "authority_digest", "authority_ref", "terminal_ref", "terminal_digest"].sort()) || !ID.test(command.command_id) || (command.exit_code !== null && (!Number.isSafeInteger(command.exit_code))) || typeof command.timed_out !== "boolean" || typeof command.truncated !== "boolean" || !Number.isSafeInteger(command.command_ordinal) || command.command_ordinal < 1 || !SHA256.test(command.authority_digest) || command.authority_ref !== commandEvidenceRef(command.command_ordinal, "authority.json") || command.terminal_ref !== commandEvidenceRef(command.command_ordinal, "terminal.json") || !SHA256.test(command.terminal_digest)) throw new Error("V3.6 budget terminal registered command is invalid");
	return command;
}

function parseReconciledRegisteredCommandTerminal(value: unknown): ReconciledRegisteredCommandTerminalV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 finite-budget terminal registered command is invalid");
	const command = value as ReconciledRegisteredCommandTerminalV36;
	const { observation, ...legacyShape } = command;
	parseRegisteredCommandTerminal(legacyShape);
	if (observation !== "PASS" && observation !== "FAIL") throw new Error("V3.6 finite-budget terminal registered command observation is invalid");
	return command;
}

function parseBudgetStopTerminal(value: unknown): ProviderRequestBudgetTerminalV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 budget terminal is invalid");
	const terminal = value as ProviderRequestBudgetTerminalV36;
	const versionKeys = terminal.schema_version === 1 ? BUDGET_STOP_KEYS_V1 : terminal.schema_version === 2 ? BUDGET_STOP_KEYS_V2 : [];
	if (stableJson(Object.keys(terminal).sort()) !== stableJson([...versionKeys].sort())) throw new Error("V3.6 budget terminal fields are invalid");
	const legacyBudget = terminal.schema_version === 1 && terminal.budget_profile_id === undefined && terminal.request_attempts === 17 && terminal.provider_dispatches === 16 && terminal.provider_responses === 16 && terminal.provider_requests_max === 16;
	const dailyBudget = terminal.schema_version === 2 && terminal.budget_profile_id === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id && terminal.request_attempts === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.provider_requests_hard_max + 1 && terminal.provider_dispatches === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.provider_requests_hard_max && terminal.provider_responses === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.provider_requests_hard_max && terminal.provider_requests_max === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.provider_requests_hard_max;
	if (
		(!legacyBudget && !dailyBudget) || terminal.terminal_kind !== "v36_pre_dispatch_provider_request_budget_terminal" || terminal.trajectory_outcome !== "pre_dispatch_budget_terminal" || terminal.terminal_reason !== "provider_request_budget_exhausted" ||
		!ID.test(terminal.run_id) || !ID.test(terminal.session_id) || !ID.test(terminal.project_id) || !ID.test(terminal.workspace_id) || ![terminal.session_pin_digest, terminal.authority_digest, terminal.workspace_identity_at_terminal, terminal.session_entries_sha256_before_turn, terminal.session_entries_sha256_at_terminal, terminal.terminal_digest].every((entry) => SHA256.test(entry)) ||
		terminal.settled !== false || terminal.pending_provider_reservations !== 0 || terminal.pending_tool_calls !== 0 || terminal.pending_side_effects !== 0 || terminal.usage_known !== true ||
		!Number.isSafeInteger(terminal.input_tokens) || terminal.input_tokens < 0 || !Number.isSafeInteger(terminal.output_tokens) || terminal.output_tokens < 0 || !Number.isFinite(terminal.cost_usd) || terminal.cost_usd < 0 || !Number.isSafeInteger(terminal.tool_calls) || terminal.tool_calls < 1 || !Number.isSafeInteger(terminal.session_entry_count_before_turn) || terminal.session_entry_count_before_turn < 0 || !Number.isSafeInteger(terminal.session_entry_count_at_terminal) || terminal.session_entry_count_at_terminal < 1 || terminal.session_entry_count_before_turn >= terminal.session_entry_count_at_terminal ||
		terminal.verification_mode !== "unverified" || terminal.formal_outcome !== null || terminal.comparison_eligible !== false || terminal.adaptation_eligible !== false || terminal.promotion_eligible !== false || digestObject(terminalBody(terminal)) !== terminal.terminal_digest
	) throw new Error("V3.6 budget terminal is invalid");
	parseRegisteredCommandTerminal(terminal.last_registered_command);
	return terminal;
}

function parseStopDimension(value: unknown): FiniteBudgetDimensionV36 {
	const dimension = exactRecord(value, ["dimension", "observed", "allowed", "capture_phase"], "V3.6 finite-budget stop dimension") as unknown as FiniteBudgetDimensionV36;
	if (!(["provider_request", "combined_token", "cost", "tool_call", "wall_time"] as const).includes(dimension.dimension) || !Number.isFinite(dimension.observed) || dimension.observed < 0 || !Number.isFinite(dimension.allowed) || dimension.allowed < 0 || !(["before_provider_dispatch", "after_provider_response_accounted", "before_tool_execution", "clean_boundary_before_provider_request", "clean_boundary_before_tool_execution"] as const).includes(dimension.capture_phase)) throw new Error("V3.6 finite-budget stop dimension is invalid");
	return dimension;
}

function finiteBudgetProfile(profileId: ReconciledFiniteBudgetTerminalV36["budget_profile_id"]): BoundedEditBudgetProfileV36 {
	const profile = profileId === V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE.profile_id ? V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE : profileId === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id ? V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE : null;
	if (profile === null) throw new Error("V3.6 finite-budget profile identity is invalid");
	assertBoundedEditBudgetProfileV36(profile);
	return profile;
}

function parseFiniteBudgetStopTerminal(value: unknown): ReconciledFiniteBudgetTerminalV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 finite-budget terminal is invalid");
	const terminal = value as ReconciledFiniteBudgetTerminalV36;
	if (stableJson(Object.keys(terminal).sort()) !== stableJson([...FINITE_BUDGET_STOP_KEYS_V3].sort())) throw new Error("V3.6 finite-budget terminal fields are invalid");
	if (!Array.isArray(terminal.stop_dimensions) || terminal.stop_dimensions.length < 1 || terminal.stop_dimensions.length > 2) throw new Error("V3.6 finite-budget stop dimensions are invalid");
	const dimensions = terminal.stop_dimensions.map(parseStopDimension);
	const profile = finiteBudgetProfile(terminal.budget_profile_id);
	const allowedByDimension: Record<FiniteBudgetDimensionV36["dimension"], number> = { provider_request: profile.provider_requests_hard_max, combined_token: profile.combined_tokens_hard_max, cost: profile.cost_usd_hard_max, tool_call: profile.tool_calls_hard_max, wall_time: profile.wall_time_ms_hard_max };
	if (dimensions.some((entry) => entry.allowed !== allowedByDimension[entry.dimension])) throw new Error("V3.6 finite-budget stop dimension does not match its Host budget profile");
	const dimensionNames = dimensions.map((entry) => entry.dimension);
	const accountedUsage = terminal.terminal_reason === "accounted_usage_budget_exhausted" && dimensionNames.every((entry) => entry === "combined_token" || entry === "cost") && (dimensionNames.includes("combined_token") || dimensionNames.includes("cost")) && dimensions.every((entry) => entry.capture_phase === "after_provider_response_accounted" && entry.observed > entry.allowed);
	const toolStop = terminal.terminal_reason === "tool_call_budget_exhausted" && stableJson(dimensionNames) === stableJson(["tool_call"]) && dimensions[0]!.capture_phase === "before_tool_execution" && dimensions[0]!.observed === dimensions[0]!.allowed + 1;
	const wallStop = terminal.terminal_reason === "wall_time_budget_exhausted" && stableJson(dimensionNames) === stableJson(["wall_time"]) && (dimensions[0]!.capture_phase === "clean_boundary_before_provider_request" || dimensions[0]!.capture_phase === "clean_boundary_before_tool_execution") && dimensions[0]!.observed > dimensions[0]!.allowed;
	if (
		terminal.schema_version !== 3 || (terminal.budget_profile_id !== "v36g2_frozen_acceptance_v1" && terminal.budget_profile_id !== "v36_daily_bounded_edit_v2") || terminal.terminal_kind !== "v36_reconciled_finite_budget_terminal" || terminal.trajectory_outcome !== "finite_budget_terminal" || (!accountedUsage && !toolStop && !wallStop) ||
		!ID.test(terminal.run_id) || !ID.test(terminal.session_id) || !ID.test(terminal.project_id) || !ID.test(terminal.workspace_id) || ![terminal.session_pin_digest, terminal.authority_digest, terminal.workspace_identity_at_terminal, terminal.session_entries_sha256_before_turn, terminal.session_entries_sha256_at_terminal, terminal.harness_diagnostic_error_sha256, terminal.terminal_digest].every((entry) => SHA256.test(entry)) || terminal.settled !== false ||
		![terminal.request_attempts, terminal.provider_dispatches, terminal.provider_responses, terminal.tool_call_attempts, terminal.tool_calls_executed, terminal.tool_calls_completed, terminal.tool_calls_blocked, terminal.tool_results_recorded, terminal.input_tokens, terminal.output_tokens, terminal.wall_time_ms, terminal.session_entry_count_before_turn, terminal.session_entry_count_at_terminal].every((entry) => Number.isSafeInteger(entry) && entry >= 0) || terminal.request_attempts !== terminal.provider_dispatches || terminal.provider_dispatches !== terminal.provider_responses || terminal.pending_provider_reservations !== 0 || terminal.provider_accounting_reconciled !== true || terminal.pending_tool_calls !== 0 || terminal.pending_side_effects !== 0 || terminal.tool_calls_executed !== terminal.tool_calls_completed || !Array.isArray(terminal.executed_tool_call_ids) || terminal.executed_tool_call_ids.length !== terminal.tool_calls_executed || terminal.executed_tool_call_ids.some((entry) => !ID.test(entry)) || new Set(terminal.executed_tool_call_ids).size !== terminal.executed_tool_call_ids.length || terminal.tool_lifecycle_reconciled !== true ||
		terminal.tool_call_attempts !== terminal.tool_calls_executed + terminal.tool_calls_blocked || terminal.tool_results_recorded !== terminal.tool_call_attempts || (toolStop && terminal.tool_calls_blocked !== 1) || terminal.usage_known !== true || !Number.isFinite(terminal.cost_usd) || terminal.cost_usd < 0 || terminal.command_evidence_reconciled !== true || terminal.workspace_identity_reconciled !== true || terminal.session_identity_reconciled !== true || terminal.authority_identity_reconciled !== true || terminal.session_entry_count_before_turn >= terminal.session_entry_count_at_terminal ||
		terminal.verification_mode !== "unverified" || terminal.formal_outcome !== null || terminal.comparison_eligible !== false || terminal.adaptation_eligible !== false || terminal.promotion_eligible !== false || digestObject(finiteTerminalBody(terminal)) !== terminal.terminal_digest
	) throw new Error("V3.6 finite-budget terminal is invalid");
	if (terminal.last_registered_command !== null) parseReconciledRegisteredCommandTerminal(terminal.last_registered_command);
	return terminal;
}

function parseFiniteBudgetTerminal(value: unknown): FiniteBudgetTerminalV36 {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("V3.6 budget terminal is invalid");
	return (value as { schema_version?: unknown }).schema_version === 3 ? parseFiniteBudgetStopTerminal(value) : parseBudgetStopTerminal(value);
}

function commandObservation(command: RegisteredCommandTerminalV36): ReconciledRegisteredCommandTerminalV36 {
	return { ...structuredClone(command), observation: command.exit_code === 0 && command.timed_out === false ? "PASS" : "FAIL" };
}

function safeBudgetStopTerminal(terminal: FiniteBudgetTerminalV36): SafeFiniteBudgetTerminalV36 {
	if (terminal.schema_version === 3) {
		const profile = finiteBudgetProfile(terminal.budget_profile_id);
		return {
		trajectory_outcome: terminal.trajectory_outcome,
		terminal_reason: terminal.terminal_reason,
		authority_digest: terminal.authority_digest,
		stop_dimensions: structuredClone(terminal.stop_dimensions),
		request_usage: { attempts: terminal.request_attempts, used: terminal.provider_dispatches, max: profile.provider_requests_hard_max },
		tool_usage: { attempts: terminal.tool_call_attempts, executed: terminal.tool_calls_executed, completed: terminal.tool_calls_completed, blocked: terminal.tool_calls_blocked, results: terminal.tool_results_recorded, max: profile.tool_calls_hard_max },
		usage: { input_tokens: terminal.input_tokens, output_tokens: terminal.output_tokens, combined_tokens: terminal.input_tokens + terminal.output_tokens, cost_usd: terminal.cost_usd, wall_time_ms: terminal.wall_time_ms, known: true },
		last_registered_command: terminal.last_registered_command === null ? null : structuredClone(terminal.last_registered_command),
		settled: false, verification_mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false,
		unverified_changes: true,
		terminal_digest: terminal.terminal_digest,
		};
	}
	return {
		trajectory_outcome: terminal.trajectory_outcome,
		terminal_reason: terminal.terminal_reason,
		authority_digest: terminal.authority_digest,
		stop_dimensions: [{ dimension: "provider_request", observed: terminal.request_attempts, allowed: terminal.provider_requests_max, capture_phase: "before_provider_dispatch" }],
		request_usage: { attempts: terminal.request_attempts, used: terminal.provider_dispatches, max: terminal.provider_requests_max },
		tool_usage: { attempts: terminal.tool_calls, executed: terminal.tool_calls, completed: terminal.tool_calls, blocked: 0, results: terminal.tool_calls, max: terminal.tool_calls },
		usage: { input_tokens: terminal.input_tokens, output_tokens: terminal.output_tokens, combined_tokens: terminal.input_tokens + terminal.output_tokens, cost_usd: terminal.cost_usd, wall_time_ms: "not_recorded", known: terminal.usage_known },
		last_registered_command: commandObservation(terminal.last_registered_command),
		settled: false, verification_mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false,
		unverified_changes: true,
		terminal_digest: terminal.terminal_digest,
	};
}

function plainRecord(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} is invalid`);
	return value as Record<string, unknown>;
}

function exactRecord(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	const record = plainRecord(value, label);
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} fields are invalid`);
	return record;
}

function dockerAuthorityBody(value: DockerCommandAuthorityV36): Omit<DockerCommandAuthorityV36, "authority_digest"> {
	const { authority_digest: _digest, ...body } = value;
	return body;
}

function dockerTerminalBody(value: DockerTerminalEvidenceV36): Omit<DockerTerminalEvidenceV36, "terminal_digest"> {
	const { terminal_digest: _digest, ...body } = value;
	return body;
}

function parseDockerCommandAuthority(value: unknown): DockerCommandAuthorityV36 {
	const record = exactRecord(value, ["schema_version", "authority_kind", "execution_id", "command_id", "executable", "argv", "workspace_identity", "backend_profile_digest", "created_at", "authority_digest"], "V3.6 Docker command authority");
	const authority = record as unknown as DockerCommandAuthorityV36;
	if (authority.schema_version !== 1 || authority.authority_kind !== "v36_docker_registered_command" || !ID.test(authority.execution_id) || !ID.test(authority.command_id) || authority.executable !== "node" || !Array.isArray(authority.argv) || authority.argv.some((entry) => typeof entry !== "string") || !SHA256.test(authority.workspace_identity) || authority.backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest || typeof authority.created_at !== "string" || authority.created_at.length === 0 || !SHA256.test(authority.authority_digest) || digestObject(dockerAuthorityBody(authority)) !== authority.authority_digest) throw new Error("V3.6 Docker command authority is invalid");
	return authority;
}

function booleanRecord(value: unknown, keys: readonly string[], label: string): Record<string, boolean> {
	const record = exactRecord(value, keys, label);
	if (Object.values(record).some((entry) => typeof entry !== "boolean")) throw new Error(`${label} is invalid`);
	return record as Record<string, boolean>;
}

function parseDockerTerminalEvidence(value: unknown): DockerTerminalEvidenceV36 {
	const record = exactRecord(value, ["schema_version", "execution_id", "command_id", "authority_digest", "backend_profile_digest", "status", "create", "start", "output", "inspect", "timeout", "kill", "remove", "exit_code", "timed_out", "cleanup_complete", "error_code", "terminal_digest"], "V3.6 Docker terminal evidence");
	const terminal = record as unknown as DockerTerminalEvidenceV36;
	const create = exactRecord(terminal.create, ["attempted", "succeeded", "container_identity"], "V3.6 Docker create evidence");
	const start = booleanRecord(terminal.start, ["attempted", "succeeded"], "V3.6 Docker start evidence");
	const output = exactRecord(terminal.output, ["stdout", "stderr", "combined_bytes_observed", "truncated"], "V3.6 Docker output evidence");
	const inspect = exactRecord(terminal.inspect, ["attempted", "succeeded", "exit_code", "oom_killed", "mount_count", "profile_match"], "V3.6 Docker inspect evidence");
	const timeout = exactRecord(terminal.timeout, ["triggered", "wall_timeout_ms"], "V3.6 Docker timeout evidence");
	const kill = booleanRecord(terminal.kill, ["attempted", "succeeded"], "V3.6 Docker kill evidence");
	const remove = booleanRecord(terminal.remove, ["attempted", "succeeded"], "V3.6 Docker remove evidence");
	const combinedBytesObserved = output.combined_bytes_observed;
	const mountCount = inspect.mount_count;
	if (
		terminal.schema_version !== 1 || !ID.test(terminal.execution_id) || !ID.test(terminal.command_id) || !SHA256.test(terminal.authority_digest) || terminal.backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest || !["succeeded", "nonzero_exit", "timed_out", "preflight_failed", "start_failed", "cleanup_failed"].includes(terminal.status) ||
		typeof create.attempted !== "boolean" || typeof create.succeeded !== "boolean" || (create.container_identity !== null && !SHA256.test(String(create.container_identity))) || !start.attempted && start.succeeded || typeof output.stdout !== "string" || typeof output.stderr !== "string" || typeof combinedBytesObserved !== "number" || !Number.isSafeInteger(combinedBytesObserved) || combinedBytesObserved < 0 || typeof output.truncated !== "boolean" ||
		typeof inspect.attempted !== "boolean" || typeof inspect.succeeded !== "boolean" || (inspect.exit_code !== null && !Number.isSafeInteger(inspect.exit_code)) || (inspect.oom_killed !== null && typeof inspect.oom_killed !== "boolean") || (mountCount !== null && (typeof mountCount !== "number" || !Number.isSafeInteger(mountCount) || mountCount < 0)) || typeof inspect.profile_match !== "boolean" ||
		typeof timeout.triggered !== "boolean" || timeout.wall_timeout_ms !== 30_000 || (terminal.exit_code !== null && !Number.isSafeInteger(terminal.exit_code)) || typeof terminal.timed_out !== "boolean" || terminal.timed_out !== timeout.triggered || typeof terminal.cleanup_complete !== "boolean" || (terminal.error_code !== null && typeof terminal.error_code !== "string") || !SHA256.test(terminal.terminal_digest) || digestObject(dockerTerminalBody(terminal)) !== terminal.terminal_digest
	) throw new Error("V3.6 Docker terminal evidence is invalid");
	return terminal;
}

function interactiveEvidenceRunRoot(runtimeRoot: string, runId: string): string {
	const dataRoot = ordinaryDirectory(resolve(runtimeRoot, "..", "..", ".."), "V3.6 data root");
	const runsRoot = ordinaryDirectory(resolve(dataRoot, "interactive-evidence", "runs"), "V3.6 interactive Evidence runs root");
	const target = resolve(runsRoot, runId);
	if (!contained(dataRoot, target)) throw new Error("V3.6 interactive Evidence Run path escaped");
	return ordinaryDirectory(target, "V3.6 interactive Evidence Run root");
}

function validateBudgetTerminalCommandEvidence(runtimeRoot: string, terminal: FiniteBudgetTerminalV36): void {
	const command = terminal.last_registered_command;
	const evidenceRun = interactiveEvidenceRunRoot(runtimeRoot, terminal.run_id);
	if (command === null) {
		const commandsRoot = resolve(evidenceRun, "docker-commands");
		if (existsSync(commandsRoot)) {
			ordinaryDirectory(commandsRoot, "V3.6 Docker command evidence root");
			if (readdirSync(commandsRoot).length !== 0) throw new Error("V3.6 zero-command terminal has ambiguous Docker command evidence");
		}
		return;
	}
	const commandsRoot = ordinaryDirectory(resolve(evidenceRun, "docker-commands"), "V3.6 Docker command evidence root");
	const expectedRoots = Array.from({ length: command.command_ordinal }, (_, index) => `command-${index + 1}`);
	const actualRoots = readdirSync(commandsRoot, { withFileTypes: true }).map((entry) => entry.name).sort((left, right) => left.localeCompare(right));
	if (stableJson(actualRoots) !== stableJson(expectedRoots)) throw new Error("V3.6 Docker command evidence is ambiguous");
	for (const name of expectedRoots) ordinaryDirectory(resolve(commandsRoot, name), "V3.6 Docker command evidence directory");
	const commandRoot = ordinaryDirectory(resolve(commandsRoot, expectedRoots.at(-1)!), "V3.6 final Docker command evidence directory");
	const files = readdirSync(commandRoot, { withFileTypes: true }).map((entry) => entry.name).sort((left, right) => left.localeCompare(right));
	if (stableJson(files) !== stableJson(["authority.json", "terminal.json"])) throw new Error("V3.6 final Docker command evidence is missing or ambiguous");
	const authority = parseDockerCommandAuthority(readJsonArtifact(evidenceRun, command.authority_ref));
	const dockerTerminal = parseDockerTerminalEvidence(readJsonArtifact(evidenceRun, command.terminal_ref));
	if (authority.command_id !== command.command_id || authority.authority_digest !== command.authority_digest || dockerTerminal.execution_id !== authority.execution_id || dockerTerminal.command_id !== authority.command_id || dockerTerminal.authority_digest !== authority.authority_digest || dockerTerminal.backend_profile_digest !== authority.backend_profile_digest || dockerTerminal.terminal_digest !== command.terminal_digest || dockerTerminal.exit_code !== command.exit_code || dockerTerminal.timed_out !== command.timed_out || dockerTerminal.output.truncated !== command.truncated || dockerTerminal.cleanup_complete !== true || dockerTerminal.inspect.profile_match !== true || dockerTerminal.inspect.exit_code !== dockerTerminal.exit_code || !["succeeded", "nonzero_exit", "timed_out"].includes(dockerTerminal.status) || ("observation" in command && command.observation !== (dockerTerminal.status === "succeeded" && dockerTerminal.exit_code === 0 && dockerTerminal.timed_out === false ? "PASS" : "FAIL"))) throw new Error("V3.6 budget terminal Docker command evidence does not match");
}

function reconcileProviderBudgetTerminalSession(entries: readonly SessionTreeEntry[], terminal: ProviderRequestBudgetTerminalV36): void {
	if (terminal.session_entry_count_before_turn > entries.length || entries.length !== terminal.session_entry_count_at_terminal || digestObject(entries.slice(0, terminal.session_entry_count_before_turn)) !== terminal.session_entries_sha256_before_turn || digestObject(entries) !== terminal.session_entries_sha256_at_terminal) throw new Error("V3.6 budget terminal Session prefix identity mismatch");
	const turnEntries = entries.slice(terminal.session_entry_count_before_turn);
	const userMessages = turnEntries.filter((entry) => entry.type === "message" && entry.message.role === "user");
	if (userMessages.length !== 1) throw new Error("V3.6 budget terminal Session turn boundary is invalid");
	const toolCallIds: string[] = [];
	const toolResultIds: string[] = [];
	const commandIds: string[] = [];
	let providerResponses = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	let costUsd = 0;
	for (const entry of turnEntries) {
		if (entry.type !== "message") continue;
		if (entry.message.role === "toolResult") {
			if (!ID.test(entry.message.toolCallId)) throw new Error("V3.6 budget terminal Tool Result identity is invalid");
			toolResultIds.push(entry.message.toolCallId);
			continue;
		}
		if (entry.message.role !== "assistant") continue;
		const message = entry.message as AssistantMessage;
		if (message.stopReason === "error") {
			if (message.errorMessage?.includes(V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE) !== true) throw new Error("V3.6 budget terminal has an unrelated Assistant error");
			continue;
		}
		if (message.stopReason !== "toolUse" || !Array.isArray(message.content)) throw new Error("V3.6 budget terminal Provider response is invalid");
		const usage = message.usage;
		const currentInput = usage.input + usage.cacheRead + usage.cacheWrite;
		const currentOutput = usage.output;
		const currentCost = usage.cost.total;
		if (![currentInput, currentOutput, currentCost].every((entry) => Number.isFinite(entry) && entry >= 0)) throw new Error("V3.6 budget terminal Provider usage is invalid");
		providerResponses += 1;
		inputTokens += currentInput;
		outputTokens += currentOutput;
		costUsd += currentCost;
		for (const part of message.content) {
			if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "toolCall") continue;
			const call = part as { id?: unknown; name?: unknown; arguments?: unknown };
			if (typeof call.id !== "string" || !ID.test(call.id) || typeof call.name !== "string") throw new Error("V3.6 budget terminal Tool call is invalid");
			toolCallIds.push(call.id);
			if (call.name === "run_command") {
				const argumentsRecord = plainRecord(call.arguments, "V3.6 budget terminal registered command arguments");
				if (stableJson(Object.keys(argumentsRecord).sort()) !== stableJson(["command_id"]) || typeof argumentsRecord.command_id !== "string" || !ID.test(argumentsRecord.command_id)) throw new Error("V3.6 budget terminal registered command arguments are invalid");
				commandIds.push(argumentsRecord.command_id);
			}
		}
	}
	if (providerResponses !== terminal.provider_responses || inputTokens !== terminal.input_tokens || outputTokens !== terminal.output_tokens || costUsd !== terminal.cost_usd || toolCallIds.length !== terminal.tool_calls || stableJson(toolCallIds) !== stableJson(toolResultIds) || commandIds.length !== terminal.last_registered_command.command_ordinal || commandIds.at(-1) !== terminal.last_registered_command.command_id) throw new Error("V3.6 budget terminal Session-derived accounting does not match");
}

function reconcileFiniteBudgetTerminalSession(entries: readonly SessionTreeEntry[], terminal: ReconciledFiniteBudgetTerminalV36): void {
	if (terminal.session_entry_count_before_turn > entries.length || entries.length !== terminal.session_entry_count_at_terminal || digestObject(entries.slice(0, terminal.session_entry_count_before_turn)) !== terminal.session_entries_sha256_before_turn || digestObject(entries) !== terminal.session_entries_sha256_at_terminal) throw new Error("V3.6 finite-budget terminal Session prefix identity mismatch");
	const turnEntries = entries.slice(terminal.session_entry_count_before_turn);
	if (turnEntries.filter((entry) => entry.type === "message" && entry.message.role === "user").length !== 1) throw new Error("V3.6 finite-budget terminal Session turn boundary is invalid");
	const toolCalls: Array<{ id: string; name: string; commandId: string | null }> = [];
	const toolResultIds: string[] = [];
	let providerResponses = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	let costUsd = 0;
	let diagnosticErrors = 0;
	for (const entry of turnEntries) {
		if (entry.type !== "message") continue;
		if (entry.message.role === "toolResult") {
			if (!ID.test(entry.message.toolCallId)) throw new Error("V3.6 finite-budget terminal Tool Result identity is invalid");
			toolResultIds.push(entry.message.toolCallId);
			continue;
		}
		if (entry.message.role !== "assistant") continue;
		const message = entry.message as AssistantMessage;
		if (message.stopReason === "error" || message.stopReason === "aborted") {
			if (typeof message.errorMessage !== "string" || sha256(message.errorMessage) !== terminal.harness_diagnostic_error_sha256) throw new Error("V3.6 finite-budget terminal has an unrelated Assistant error");
			diagnosticErrors += 1;
			continue;
		}
		if (message.stopReason !== "toolUse" && message.stopReason !== "stop") throw new Error("V3.6 finite-budget terminal Provider response is invalid");
		const currentInput = message.usage.input + message.usage.cacheRead + message.usage.cacheWrite;
		const currentOutput = message.usage.output;
		const currentCost = message.usage.cost.total;
		if (![currentInput, currentOutput, currentCost].every((entry) => Number.isFinite(entry) && entry >= 0)) throw new Error("V3.6 finite-budget terminal Provider usage is invalid");
		providerResponses += 1;
		inputTokens += currentInput;
		outputTokens += currentOutput;
		costUsd += currentCost;
		for (const part of message.content) {
			if (!part || typeof part !== "object" || (part as { type?: unknown }).type !== "toolCall") continue;
			const call = part as { id?: unknown; name?: unknown; arguments?: unknown };
			if (typeof call.id !== "string" || !ID.test(call.id) || typeof call.name !== "string") throw new Error("V3.6 finite-budget terminal Tool call is invalid");
			let commandId: string | null = null;
			if (call.name === "run_command") {
				const argumentsRecord = plainRecord(call.arguments, "V3.6 finite-budget terminal registered command arguments");
				if (stableJson(Object.keys(argumentsRecord).sort()) !== stableJson(["command_id"]) || typeof argumentsRecord.command_id !== "string" || !ID.test(argumentsRecord.command_id)) throw new Error("V3.6 finite-budget terminal registered command arguments are invalid");
				commandId = argumentsRecord.command_id;
			}
			toolCalls.push({ id: call.id, name: call.name, commandId });
		}
	}
	const callIds = toolCalls.map((entry) => entry.id);
	const command = terminal.last_registered_command;
	const executedSet = new Set(terminal.executed_tool_call_ids);
	const executedCommands = toolCalls.filter((entry) => entry.commandId !== null && executedSet.has(entry.id)).map((entry) => entry.commandId!);
	if (diagnosticErrors !== 1 || providerResponses !== terminal.provider_responses || terminal.provider_dispatches !== providerResponses || inputTokens !== terminal.input_tokens || outputTokens !== terminal.output_tokens || costUsd !== terminal.cost_usd || callIds.length !== terminal.tool_call_attempts || toolResultIds.length !== terminal.tool_results_recorded || stableJson(callIds) !== stableJson(toolResultIds) || terminal.executed_tool_call_ids.some((entry) => !callIds.includes(entry)) || executedCommands.length !== (command?.command_ordinal ?? 0) || (command !== null && executedCommands.at(-1) !== command.command_id)) throw new Error("V3.6 finite-budget terminal Session-derived accounting does not match");
}

function reconcileBudgetTerminalSession(entries: readonly SessionTreeEntry[], terminal: FiniteBudgetTerminalV36): void {
	if (terminal.schema_version === 3) reconcileFiniteBudgetTerminalSession(entries, terminal);
	else reconcileProviderBudgetTerminalSession(entries, terminal);
}

export class PersistentInteractiveSessionServiceV36 {
	private readonly runtimeRoot: string;
	private readonly workspaceRoot: string;
	private readonly projectId: string;
	private readonly workspaceId: string;
	private readonly sessionId: string;
	private readonly title: string;
	private readonly pinDigest: string;
	private readonly repo: JsonlSessionRepo;

	constructor(options: { runtimeRoot: string; workspaceRoot: string; projectId: string; workspaceId: string; sessionId: string; title: string; sessionPinDigest: string }) {
		identifier(options.projectId, "project ID");
		identifier(options.workspaceId, "Workspace ID");
		identifier(options.sessionId, "Session ID");
		if (!SHA256.test(options.sessionPinDigest)) throw new Error("Session pin digest is invalid");
		this.runtimeRoot = ordinaryDirectory(options.runtimeRoot, "V3.6 Session Runtime root", true);
		this.workspaceRoot = ordinaryDirectory(options.workspaceRoot, "managed Workspace root");
		this.projectId = options.projectId;
		this.workspaceId = options.workspaceId;
		this.sessionId = options.sessionId;
		this.title = safeText(options.title).slice(0, 120);
		this.pinDigest = options.sessionPinDigest;
		mkdirSync(resolve(this.runtimeRoot, "sessions"), { recursive: true });
		mkdirSync(resolve(this.runtimeRoot, "runs"), { recursive: true });
		this.repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: this.runtimeRoot, shellEnv: {} }), sessionsRoot: resolve(this.runtimeRoot, "sessions") });
	}

	async create(): Promise<void> {
		if ((await this.repo.list()).length !== 0) throw new Error("V3.6 Session Runtime is not empty");
		await this.repo.create({ cwd: this.workspaceRoot, id: this.sessionId, metadata: { schema_version: 1, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest } satisfies RuntimeMetadataV36 });
	}

	private async open() {
		const listed = await this.repo.list();
		if (listed.length !== 1 || listed[0]!.id !== this.sessionId) throw new Error("V3.6 Pi Session identity is missing or ambiguous");
		const metadata = listed[0]!;
		parseMetadata(metadata.metadata, { projectId: this.projectId, workspaceId: this.workspaceId, pinDigest: this.pinDigest });
		if (realpathSync.native(metadata.cwd) !== this.workspaceRoot) throw new Error("V3.6 Pi Session managed Workspace identity mismatch");
		return await this.repo.open(metadata);
	}

	async executeTurn(options: { sessionId: string; runId: string; prompt: string }): Promise<PersistentInteractiveTurnResultV36> {
		if (options.sessionId !== this.sessionId) throw new Error("V3.6 Session identity mismatch");
		identifier(options.runId, "Run ID");
		if (Buffer.byteLength(options.prompt, "utf8") === 0 || Buffer.byteLength(options.prompt, "utf8") > 16_384) throw new Error("V3.6 task text is invalid");
		const root = runRoot(this.runtimeRoot, options.runId, true);
		const session = await this.open();
		const priorContext = await session.buildContext();
		const priorMessages = structuredClone(priorContext.messages) as AgentMessage[];
		const priorDigest = digestObject(priorMessages);
		const models = createModels();
		const registration = fauxProvider({ provider: `v36-faux-${options.runId}` });
		models.setProvider(registration.provider);
		let observedPrior = "";
		const observe = (messages: readonly AgentMessage[]): void => {
			observedPrior = digestObject(messages.slice(0, priorMessages.length));
			if (observedPrior !== priorDigest) throw new Error("V3.6 AgentHarness prior Session context mismatch");
		};
		registration.setResponses([
			(context) => { observe(context.messages); return fauxAssistantMessage(fauxToolCall("workspace_list", { path: ".", depth: 2 }, { id: `${options.runId}-tool-1` }), { stopReason: "toolUse", timestamp: 1 }); },
			(context) => { observe(context.messages); return fauxAssistantMessage(`deterministic settled interactive turn ${options.runId}`, { timestamp: 2 }); },
		]);
		const profile = createBoundedToolProfile(this.workspaceRoot, { writable_paths: [], protected_paths: [], command_descriptors: [] }, { allowed_tool_names: READ_ONLY_TOOLS, allow_repository_commands: false });
		if (stableJson(profile.tools.map((tool) => tool.name)) !== stableJson(READ_ONLY_TOOLS)) throw new Error("V3.6 inspect-only tool surface drifted");
		const harness = new AgentHarness({ models, session, model: registration.getModel(), tools: profile.tools, toolContext: profile.context, systemPrompt: SYSTEM_PROMPT, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: 10_000 } });
		let settled = 0;
		const unsubscribe = harness.subscribe((event) => { if (event.type === "settled") settled += 1; });
		try { await harness.prompt(options.prompt); await harness.waitForIdle(); } finally { unsubscribe(); await harness.abort(); }
		if (settled !== 1 || registration.state.callCount !== 2 || registration.getPendingResponseCount() !== 0 || observedPrior !== priorDigest || profile.commandExecutions.length !== 0 || profile.pendingSideEffects() !== 0) throw new Error("V3.6 deterministic interactive turn did not settle safely");
		const entries = await session.getEntries();
		const toolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
		const toolResultIds = entries.flatMap((entry) => entry.type === "message" && entry.message.role === "toolResult" ? [entry.message.toolCallId] : []);
		const body: Omit<RuntimeManifestV36, "manifest_digest"> = {
			schema_version: 1, mode: "v36_interactive_deterministic_faux", run_id: options.runId, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest, created_at: new Date().toISOString(), settled: true,
			prior_context_message_count: priorMessages.length, prior_context_sha256: priorDigest, provider_observed_prior_context_sha256: observedPrior, session_entry_count_after_turn: entries.length, session_entries_sha256_after_turn: digestObject(entries), prompt_sha256: sha256(options.prompt), provider_requests: 2, active_tool_names: [...READ_ONLY_TOOLS], tool_call_ids: toolCallIds, tool_result_ids: toolResultIds.slice(-toolCallIds.length), credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, project_command_executions: 0, docker_project_command_executions: 0,
		};
		const manifest: RuntimeManifestV36 = { ...body, manifest_digest: digestObject(body) };
		writeOnceJson(root, "manifest.json", manifest);
		return { manifest, view: await this.inspect() };
	}

	async executeBoundedTurn(options: {
		sessionId: string;
		runId: string;
		prompt: string;
		taskPolicy: BoundedTaskPolicy;
		commandExecutor: BoundedCommandExecutor;
		budgetProfile: BoundedEditBudgetProfileV36;
		models: ReturnType<typeof createModels>;
		model: NonNullable<ReturnType<ReturnType<typeof createModels>["getModel"]>>;
		systemPrompt: string;
		credentialReads?: number;
		externalModel?: boolean;
		authorityDigest?: string;
		testOnlyAssistantUsageByResponse?: AssistantMessage["usage"][];
		testOnlyClock?: () => number;
	}): Promise<PersistentInteractiveBoundedTurnResultV36> {
		if (options.sessionId !== this.sessionId) throw new Error("V3.6 Session identity mismatch");
		assertBoundedEditBudgetProfileV36(options.budgetProfile);
		identifier(options.runId, "Run ID");
		if (Buffer.byteLength(options.prompt, "utf8") < 1 || Buffer.byteLength(options.prompt, "utf8") > 16_384 || Buffer.byteLength(options.systemPrompt, "utf8") < 1 || Buffer.byteLength(options.systemPrompt, "utf8") > 16_384) throw new Error("V3.6 bounded Turn prompt is invalid");
		const root = runRoot(this.runtimeRoot, options.runId, true);
		const session = await this.open();
		let testUsageOrdinal = 0;
		if (options.testOnlyAssistantUsageByResponse !== undefined) {
			const appendMessage = session.appendMessage.bind(session);
			session.appendMessage = async (message: AgentMessage): Promise<string> => {
				if (message.role === "assistant" && message.stopReason !== "error" && message.stopReason !== "aborted") {
					const injected = options.testOnlyAssistantUsageByResponse![testUsageOrdinal++];
					if (injected === undefined || ![injected.input, injected.output, injected.cacheRead, injected.cacheWrite, injected.totalTokens, injected.cost.input, injected.cost.output, injected.cost.cacheRead, injected.cost.cacheWrite, injected.cost.total].every((entry) => Number.isFinite(entry) && entry >= 0) || injected.totalTokens !== injected.input + injected.output + injected.cacheRead + injected.cacheWrite || injected.cost.total !== injected.cost.input + injected.cost.output + injected.cost.cacheRead + injected.cost.cacheWrite) throw new Error("V3.6 test-only persisted Assistant usage is invalid");
					(message as AssistantMessage).usage = structuredClone(injected);
				}
				return await appendMessage(message);
			};
		}
		const entriesBeforeTurn = await session.getEntries();
		const priorContext = await session.buildContext();
		const priorMessages = structuredClone(priorContext.messages) as AgentMessage[];
		const priorDigest = digestObject(priorMessages);
		let observedPrior = "";
		let settled = 0;
		let providerRequests = 0;
		let toolCallAttempts = 0;
		let toolCallsExecuted = 0;
		let toolCallsCompleted = 0;
		let inputTokens = 0;
		let outputTokens = 0;
		let costUsd = 0;
		let usageBudgetError: Error | null = null;
		let budgetTerminal: ProviderRequestBudgetTerminalV36Error | null = null;
		let finiteBudgetTerminal: ReconciledFiniteBudgetTerminalV36Error | null = null;
		let pendingProviderReservation = false;
		let providerResponses = 0;
		let pendingToolCalls = 0;
		let usageKnown = true;
		let terminalDiagnosticErrorSha256: string | null = null;
		const clock = options.testOnlyClock ?? Date.now;
		const turnStartedAt = clock();
		let wallTimeMs = 0;
		const assertTurnWallTimeBudget = (capturePhase: "clean_boundary_before_provider_request" | "clean_boundary_before_tool_execution"): void => {
			wallTimeMs = clock() - turnStartedAt;
			if (!Number.isSafeInteger(wallTimeMs) || wallTimeMs < 0) throw new Error("V3.6 per-Turn wall-time observation is invalid");
			if (wallTimeMs > options.budgetProfile.wall_time_ms_hard_max) {
				finiteBudgetTerminal ??= new ReconciledFiniteBudgetTerminalV36Error("wall_time_budget_exhausted", [{ dimension: "wall_time", observed: wallTimeMs, allowed: options.budgetProfile.wall_time_ms_hard_max, capture_phase: capturePhase }]);
				throw finiteBudgetTerminal;
			}
		};
		const assertTurnUsageBudget = (): void => {
			const dimensions: FiniteBudgetDimensionV36[] = [];
			if (inputTokens + outputTokens > options.budgetProfile.combined_tokens_hard_max) dimensions.push({ dimension: "combined_token", observed: inputTokens + outputTokens, allowed: options.budgetProfile.combined_tokens_hard_max, capture_phase: "after_provider_response_accounted" });
			if (costUsd > options.budgetProfile.cost_usd_hard_max) dimensions.push({ dimension: "cost", observed: costUsd, allowed: options.budgetProfile.cost_usd_hard_max, capture_phase: "after_provider_response_accounted" });
			if (dimensions.length > 0) finiteBudgetTerminal ??= new ReconciledFiniteBudgetTerminalV36Error("accounted_usage_budget_exhausted", dimensions);
			if (usageBudgetError) throw usageBudgetError;
			if (finiteBudgetTerminal) throw finiteBudgetTerminal;
		};
		const profile = createBoundedToolProfile(this.workspaceRoot, options.taskPolicy, { allowed_tool_names: ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"], allow_repository_commands: false, expose_task_command_ids: true, command_executor: options.commandExecutor });
		const expectedTools = ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"];
		if (stableJson(profile.tools.map((tool) => tool.name)) !== stableJson(expectedTools)) throw new Error("V3.6 Goal 2 tool surface drifted");
		const harness = new AgentHarness({ models: options.models, session, model: options.model, tools: profile.tools, toolContext: profile.context, systemPrompt: options.systemPrompt, thinkingLevel: "off", streamOptions: { maxRetries: 0, timeoutMs: options.budgetProfile.wall_time_ms_hard_max } });
		const unsubscribe = harness.subscribe((event) => {
			if (event.type === "settled") settled += 1;
			if (event.type === "tool_execution_start") { pendingToolCalls += 1; toolCallsExecuted += 1; }
			if (event.type === "tool_execution_end") {
				pendingToolCalls -= 1;
				toolCallsCompleted += 1;
				if (pendingToolCalls < 0) usageKnown = false;
			}
			if (event.type === "message_end" && event.message.role === "assistant") {
				const message = event.message as AssistantMessage;
				if (budgetTerminal !== null && message.stopReason === "error" && message.errorMessage?.includes(V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE) === true) return;
				if (finiteBudgetTerminal !== null && (message.stopReason === "error" || message.stopReason === "aborted")) {
					if (typeof message.errorMessage !== "string" || terminalDiagnosticErrorSha256 !== null) usageKnown = false;
					else terminalDiagnosticErrorSha256 = sha256(message.errorMessage);
					return;
				}
				if (!pendingProviderReservation) {
					usageKnown = false;
					return;
				}
				const usage = message.usage;
				const currentInput = usage.input + usage.cacheRead + usage.cacheWrite;
				const currentOutput = usage.output;
				const currentCost = usage.cost.total;
				if (![currentInput, currentOutput, currentCost].every((entry) => Number.isFinite(entry) && entry >= 0)) {
					usageKnown = false;
					pendingProviderReservation = false;
					usageBudgetError ??= new Error("V3.6 Goal 2 model usage is invalid");
					void harness.abort();
					return;
				}
				inputTokens += currentInput;
				outputTokens += currentOutput;
				costUsd += currentCost;
				providerResponses += 1;
				pendingProviderReservation = false;
				try { assertTurnUsageBudget(); } catch { void harness.abort(); }
			}
		});
		const offContext = harness.on("context", (event) => {
			observedPrior = digestObject(event.messages.slice(0, priorMessages.length));
			if (observedPrior !== priorDigest) throw new Error("V3.6 Goal 2 prior Session context mismatch");
			return { messages: event.messages };
		});
		const offRequest = harness.on("before_provider_request", () => {
			assertTurnWallTimeBudget("clean_boundary_before_provider_request");
			assertTurnUsageBudget();
			providerRequests += 1;
			if (pendingProviderReservation) throw new Error("V3.6 Goal 2 Provider reservation is already pending");
			if (providerRequests > options.budgetProfile.provider_requests_hard_max) {
				budgetTerminal = new ProviderRequestBudgetTerminalV36Error(providerRequests);
				throw budgetTerminal;
			}
			pendingProviderReservation = true;
			return undefined;
		});
		const offTool = harness.on("tool_call", () => {
			assertTurnWallTimeBudget("clean_boundary_before_tool_execution");
			toolCallAttempts += 1;
			if (toolCallAttempts > options.budgetProfile.tool_calls_hard_max) {
				finiteBudgetTerminal = new ReconciledFiniteBudgetTerminalV36Error("tool_call_budget_exhausted", [{ dimension: "tool_call", observed: toolCallAttempts, allowed: options.budgetProfile.tool_calls_hard_max, capture_phase: "before_tool_execution" }]);
				return { block: true, reason: V36_FINITE_BUDGET_TERMINAL_CODE };
			}
			return undefined;
		});
		try {
			await harness.prompt(options.prompt);
			await harness.waitForIdle();
		} catch (error) {
			const providerStop = budgetTerminal !== null && (error instanceof ProviderRequestBudgetTerminalV36Error || error instanceof Error && error.message.includes(V36_PROVIDER_REQUEST_BUDGET_TERMINAL_CODE));
			const finiteStop = finiteBudgetTerminal !== null && (error instanceof ReconciledFiniteBudgetTerminalV36Error || error instanceof Error && error.message.includes(V36_FINITE_BUDGET_TERMINAL_CODE));
			if (!providerStop && !finiteStop) throw error;
		} finally {
			unsubscribe();
			offContext();
			offRequest();
			offTool();
			await harness.abort();
		}
		const terminalError = budgetTerminal as ProviderRequestBudgetTerminalV36Error | null;
		if (terminalError !== null) {
			if (!SHA256.test(options.authorityDigest ?? "")) throw new Error("V3.6 budget terminal authority digest is required");
			const requestMax = options.budgetProfile.provider_requests_hard_max;
			if (terminalError.requestAttempt !== requestMax + 1 || providerRequests !== requestMax + 1 || providerResponses !== requestMax || pendingProviderReservation || pendingToolCalls !== 0 || profile.pendingSideEffects() !== 0 || usageKnown !== true || toolCallAttempts < 1 || toolCallAttempts !== toolCallsExecuted || toolCallsExecuted !== toolCallsCompleted || profile.commandExecutions.length < 1) throw new Error("V3.6 pre-dispatch Provider-request budget terminal is not quiescent or reconciled");
			const lastCommand = profile.commandExecutions.at(-1);
			if (!lastCommand || !ID.test(lastCommand.command_id) || !SHA256.test(lastCommand.authority_digest ?? "") || !SHA256.test(lastCommand.terminal_digest ?? "") || !Number.isSafeInteger(lastCommand.exit_code ?? 0)) throw new Error("V3.6 budget terminal has no valid registered command result");
			const entries = await session.getEntries();
			const terminalCommand: RegisteredCommandTerminalV36 = {
				command_id: lastCommand.command_id,
				exit_code: lastCommand.exit_code,
				timed_out: lastCommand.timed_out,
				truncated: lastCommand.truncated,
				command_ordinal: profile.commandExecutions.length,
				authority_digest: lastCommand.authority_digest!,
				authority_ref: commandEvidenceRef(profile.commandExecutions.length, "authority.json"),
				terminal_ref: commandEvidenceRef(profile.commandExecutions.length, "terminal.json"),
				terminal_digest: lastCommand.terminal_digest!,
			};
			const terminalBody: Omit<ProviderRequestBudgetTerminalV36, "terminal_digest"> = {
				schema_version: options.budgetProfile.profile_id === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id ? 2 : 1,
				...(options.budgetProfile.profile_id === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id ? { budget_profile_id: V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id } : {}),
				terminal_kind: "v36_pre_dispatch_provider_request_budget_terminal",
				trajectory_outcome: "pre_dispatch_budget_terminal",
				terminal_reason: "provider_request_budget_exhausted",
				run_id: options.runId,
				session_id: this.sessionId,
				project_id: this.projectId,
				workspace_id: this.workspaceId,
				session_pin_digest: this.pinDigest,
				authority_digest: options.authorityDigest!,
				created_at: new Date().toISOString(),
				settled: false,
				request_attempts: requestMax + 1,
				provider_dispatches: requestMax,
				provider_responses: requestMax,
				provider_requests_max: requestMax,
				pending_provider_reservations: 0,
				pending_tool_calls: 0,
				pending_side_effects: 0,
				usage_known: true,
				input_tokens: inputTokens,
				output_tokens: outputTokens,
				cost_usd: costUsd,
				tool_calls: toolCallAttempts,
				last_registered_command: terminalCommand,
				workspace_identity_at_terminal: managedWorkspaceIdentityV36(this.workspaceRoot),
				session_entry_count_before_turn: entriesBeforeTurn.length,
				session_entries_sha256_before_turn: digestObject(entriesBeforeTurn),
				session_entry_count_at_terminal: entries.length,
				session_entries_sha256_at_terminal: digestObject(entries),
				verification_mode: "unverified",
				formal_outcome: null,
				comparison_eligible: false,
				adaptation_eligible: false,
				promotion_eligible: false,
			};
			const terminal: ProviderRequestBudgetTerminalV36 = { ...terminalBody, terminal_digest: digestObject(terminalBody) };
			reconcileBudgetTerminalSession(entries, terminal);
			validateBudgetTerminalCommandEvidence(this.runtimeRoot, terminal);
			writeOnceJson(root, "budget-stop.json", terminal);
			return { manifest: terminal, view: await this.inspect() };
		}
		const reconciledTerminalError = finiteBudgetTerminal as ReconciledFiniteBudgetTerminalV36Error | null;
		if (reconciledTerminalError !== null) {
			if (!SHA256.test(options.authorityDigest ?? "")) throw new Error("V3.6 finite-budget terminal authority digest is required");
			const entries = await session.getEntries();
			const persistedDiagnosticErrors = entries.slice(entriesBeforeTurn.length).flatMap((entry) => entry.type === "message" && entry.message.role === "assistant" && (entry.message.stopReason === "error" || entry.message.stopReason === "aborted") && typeof entry.message.errorMessage === "string" ? [entry.message.errorMessage] : []);
			if (persistedDiagnosticErrors.length === 1) terminalDiagnosticErrorSha256 = sha256(persistedDiagnosticErrors[0]!);
			wallTimeMs = clock() - turnStartedAt;
			const toolStop = reconciledTerminalError.reason === "tool_call_budget_exhausted";
			const wallStop = reconciledTerminalError.reason === "wall_time_budget_exhausted";
			toolCallsExecuted = profile.auditEvents.filter((event) => event.type === "start").length;
			toolCallsCompleted = profile.auditEvents.filter((event) => event.type === "end" || event.type === "error").length;
			const executedToolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
			// A harness-generated diagnostic assistant error is not a Provider response. All
			// dispatched responses remain known when their reservation counters reconcile.
			if (!pendingProviderReservation && providerRequests === providerResponses) usageKnown = true;
			if ((options.testOnlyAssistantUsageByResponse !== undefined && testUsageOrdinal !== options.testOnlyAssistantUsageByResponse.length) || terminalDiagnosticErrorSha256 === null || pendingProviderReservation || pendingToolCalls !== 0 || profile.pendingSideEffects() !== 0 || usageKnown !== true || providerRequests !== providerResponses || toolCallsExecuted !== toolCallsCompleted || toolCallAttempts < toolCallsExecuted || (toolStop && toolCallAttempts !== toolCallsExecuted + 1) || !Number.isSafeInteger(wallTimeMs) || wallTimeMs < 0 || (!wallStop && wallTimeMs > options.budgetProfile.wall_time_ms_hard_max)) throw new Error("V3.6 finite-budget terminal is not quiescent or reconciled");
			const lastCommand = profile.commandExecutions.at(-1) ?? null;
			let terminalCommand: ReconciledRegisteredCommandTerminalV36 | null = null;
			if (lastCommand !== null) {
				if (!ID.test(lastCommand.command_id) || !SHA256.test(lastCommand.authority_digest ?? "") || !SHA256.test(lastCommand.terminal_digest ?? "") || !Number.isSafeInteger(lastCommand.exit_code ?? 0)) throw new Error("V3.6 finite-budget terminal registered command result is invalid");
				terminalCommand = {
					command_id: lastCommand.command_id,
					exit_code: lastCommand.exit_code,
					timed_out: lastCommand.timed_out,
					truncated: lastCommand.truncated,
					command_ordinal: profile.commandExecutions.length,
					authority_digest: lastCommand.authority_digest!,
					authority_ref: commandEvidenceRef(profile.commandExecutions.length, "authority.json"),
					terminal_ref: commandEvidenceRef(profile.commandExecutions.length, "terminal.json"),
					terminal_digest: lastCommand.terminal_digest!,
					observation: lastCommand.exit_code === 0 && lastCommand.timed_out === false ? "PASS" : "FAIL",
				};
			}
			const body: Omit<ReconciledFiniteBudgetTerminalV36, "terminal_digest"> = {
				schema_version: 3,
				budget_profile_id: options.budgetProfile.profile_id,
				terminal_kind: "v36_reconciled_finite_budget_terminal",
				trajectory_outcome: "finite_budget_terminal",
				terminal_reason: reconciledTerminalError.reason,
				stop_dimensions: structuredClone(reconciledTerminalError.dimensions),
				run_id: options.runId,
				session_id: this.sessionId,
				project_id: this.projectId,
				workspace_id: this.workspaceId,
				session_pin_digest: this.pinDigest,
				authority_digest: options.authorityDigest!,
				created_at: new Date().toISOString(),
				settled: false,
				request_attempts: providerResponses,
				provider_dispatches: providerResponses,
				provider_responses: providerResponses,
				pending_provider_reservations: 0,
				provider_accounting_reconciled: true,
				pending_tool_calls: 0,
				pending_side_effects: 0,
				tool_call_attempts: toolCallAttempts,
				tool_calls_executed: toolCallsExecuted,
				tool_calls_completed: toolCallsCompleted,
				tool_calls_blocked: toolCallAttempts - toolCallsExecuted,
				tool_results_recorded: toolCallAttempts,
				executed_tool_call_ids: executedToolCallIds,
				tool_lifecycle_reconciled: true,
				usage_known: true,
				harness_diagnostic_error_sha256: terminalDiagnosticErrorSha256,
				input_tokens: inputTokens,
				output_tokens: outputTokens,
				cost_usd: costUsd,
				wall_time_ms: wallTimeMs,
				last_registered_command: terminalCommand,
				command_evidence_reconciled: true,
				workspace_identity_at_terminal: managedWorkspaceIdentityV36(this.workspaceRoot),
				workspace_identity_reconciled: true,
				session_entry_count_before_turn: entriesBeforeTurn.length,
				session_entries_sha256_before_turn: digestObject(entriesBeforeTurn),
				session_entry_count_at_terminal: entries.length,
				session_entries_sha256_at_terminal: digestObject(entries),
				session_identity_reconciled: true,
				authority_identity_reconciled: true,
				verification_mode: "unverified",
				formal_outcome: null,
				comparison_eligible: false,
				adaptation_eligible: false,
				promotion_eligible: false,
			};
			const terminal: ReconciledFiniteBudgetTerminalV36 = { ...body, terminal_digest: digestObject(body) };
			parseFiniteBudgetStopTerminal(terminal);
			reconcileFiniteBudgetTerminalSession(entries, terminal);
			validateBudgetTerminalCommandEvidence(this.runtimeRoot, terminal);
			writeOnceJson(root, "budget-stop.json", terminal);
			return { manifest: terminal, view: await this.inspect() };
		}
		assertTurnWallTimeBudget("clean_boundary_before_provider_request");
		assertTurnUsageBudget();
		if (settled !== 1 || observedPrior !== priorDigest || profile.pendingSideEffects() !== 0 || profile.commandExecutions.length < 1 || profile.commandExecutions.some((entry) => entry.cleanup_complete !== true || !SHA256.test(entry.terminal_digest ?? "") || entry.backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest)) throw new Error("V3.6 Goal 2 bounded Turn did not settle with exact frozen terminal Docker evidence");
		const entries = await session.getEntries();
		const toolCallIds = profile.auditEvents.filter((event) => event.type === "start").map((event) => event.tool_call_id);
		const toolResultIds = entries.flatMap((entry) => entry.type === "message" && entry.message.role === "toolResult" ? [entry.message.toolCallId] : []).slice(-toolCallIds.length);
		if (stableJson(toolCallIds) !== stableJson(toolResultIds)) throw new Error("V3.6 Goal 2 Tool lifecycle is incomplete");
		const external = options.externalModel === true;
		assertTurnUsageBudget();
		const body: Omit<RuntimeManifestG2V36, "manifest_digest"> = {
			schema_version: 2, mode: "v36_interactive_bounded_edit", run_id: options.runId, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, session_pin_digest: this.pinDigest, created_at: new Date().toISOString(), settled: true,
			prior_context_message_count: priorMessages.length, prior_context_sha256: priorDigest, provider_observed_prior_context_sha256: observedPrior, session_entry_count_after_turn: entries.length, session_entries_sha256_after_turn: digestObject(entries), prompt_sha256: sha256(options.prompt), provider_requests: providerRequests, active_tool_names: expectedTools, tool_call_ids: toolCallIds, tool_result_ids: toolResultIds, credential_reads: options.credentialReads ?? 0, network_calls: external ? providerRequests : 0, external_provider_calls: external ? providerRequests : 0, real_model_calls: external ? providerRequests : 0, project_command_executions: profile.commandExecutions.length, docker_project_command_executions: profile.commandExecutions.length, backend_terminal_digests: profile.commandExecutions.map((entry) => entry.terminal_digest!), workspace_identity_after: managedWorkspaceIdentityV36(this.workspaceRoot), input_tokens: inputTokens, output_tokens: outputTokens, cost_usd: costUsd,
		};
		const manifest: RuntimeManifestG2V36 = { ...body, manifest_digest: digestObject(body) };
		writeOnceJson(root, "manifest.json", manifest);
		return { manifest, view: await this.inspect() };
	}

	async inspect(): Promise<SafePersistentSessionV36> {
		const session = await this.open();
		const entries = await session.getEntries();
		const manifests: Array<RuntimeManifestV36 | RuntimeManifestG2V36 | FiniteBudgetTerminalV36> = [];
		for (const entry of readdirSync(resolve(this.runtimeRoot, "runs"), { withFileTypes: true })) {
			if (!entry.isDirectory() || !ID.test(entry.name)) throw new Error("V3.6 Runtime Run directory is invalid");
			const root = runRoot(this.runtimeRoot, entry.name);
			const manifestPath = resolve(root, "manifest.json");
			const terminalPath = resolve(root, "budget-stop.json");
			if (existsSync(manifestPath) === existsSync(terminalPath)) throw new Error("V3.6 Runtime must have exactly one settled Manifest or budget terminal");
			if (existsSync(manifestPath)) {
				const rawManifest = readJsonArtifact<{ schema_version?: unknown }>(root, "manifest.json");
				const manifest = rawManifest.schema_version === 2 ? parseManifestG2(rawManifest) : parseManifest(rawManifest);
				if (manifest.run_id !== entry.name || manifest.session_id !== this.sessionId || manifest.project_id !== this.projectId || manifest.workspace_id !== this.workspaceId || manifest.session_pin_digest !== this.pinDigest || entries.length < manifest.session_entry_count_after_turn || digestObject(entries.slice(0, manifest.session_entry_count_after_turn)) !== manifest.session_entries_sha256_after_turn) throw new Error("V3.6 Runtime/Session historical identity mismatch");
				manifests.push(manifest);
			} else {
				const terminal = parseFiniteBudgetTerminal(readJsonArtifact(root, "budget-stop.json"));
				if (terminal.run_id !== entry.name || terminal.session_id !== this.sessionId || terminal.project_id !== this.projectId || terminal.workspace_id !== this.workspaceId || terminal.session_pin_digest !== this.pinDigest || entries.length !== terminal.session_entry_count_at_terminal || digestObject(entries) !== terminal.session_entries_sha256_at_terminal || managedWorkspaceIdentityV36(this.workspaceRoot) !== terminal.workspace_identity_at_terminal) throw new Error("V3.6 budget terminal Runtime/Session/Workspace identity mismatch");
				reconcileBudgetTerminalSession(entries, terminal);
				validateBudgetTerminalCommandEvidence(this.runtimeRoot, terminal);
				manifests.push(terminal);
			}
		}
		manifests.sort((left, right) => left.created_at.localeCompare(right.created_at));
		const runs = manifests.map((manifest) => {
			if ("terminal_kind" in manifest) return {
				run_id: manifest.run_id,
				created_at: manifest.created_at,
				settled: false,
				provider_requests: manifest.provider_dispatches,
				tool_call_count: manifest.schema_version === 3 ? manifest.tool_call_attempts : manifest.tool_calls,
				context_reconstructed: true,
				mode: manifest.schema_version === 3 ? "finite_budget_terminal" as const : "pre_dispatch_budget_terminal" as const,
				prior_run_id: null,
				input_tokens: manifest.input_tokens,
				output_tokens: manifest.output_tokens,
				cost_usd: manifest.cost_usd,
				verifier_id: "not_recorded" as const,
				verifier_status: "not_recorded" as const,
				outcome: "not_recorded" as const,
				binding_status: "not_recorded" as const,
				source_ref: `runtime/runs/${manifest.run_id}/budget-stop.json`,
				terminal: safeBudgetStopTerminal(manifest),
			};
			return {
				run_id: manifest.run_id,
				created_at: manifest.created_at,
				settled: true,
				provider_requests: manifest.provider_requests,
				tool_call_count: manifest.tool_call_ids.length,
				context_reconstructed: manifest.prior_context_message_count === 0 || manifest.prior_context_sha256 === manifest.provider_observed_prior_context_sha256,
				mode: manifest.schema_version === 2 && manifest.real_model_calls > 0 ? "real_product_smoke" as const : "deterministic_faux" as const,
				prior_run_id: null,
				input_tokens: manifest.schema_version === 2 ? manifest.input_tokens : "not_recorded" as const,
				output_tokens: manifest.schema_version === 2 ? manifest.output_tokens : "not_recorded" as const,
				cost_usd: manifest.schema_version === 2 ? manifest.cost_usd : "not_recorded" as const,
				verifier_id: "not_recorded" as const,
				verifier_status: "not_recorded" as const,
				outcome: "not_recorded" as const,
				binding_status: "not_recorded" as const,
				source_ref: `runtime/runs/${manifest.run_id}/manifest.json`,
				terminal: null,
			};
		});
		const createdAt = manifests[0]?.created_at ?? (await session.getMetadata()).createdAt;
		return { schema_version: 1, session_id: this.sessionId, project_id: this.projectId, workspace_id: this.workspaceId, title: this.title, created_at: createdAt, updated_at: manifests.at(-1)?.created_at ?? createdAt, parent_session_id: null, messages: projectMessages(entries), runs, source_status: "available" };
	}
}
