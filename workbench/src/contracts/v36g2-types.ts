import type { ArtifactRefV0B } from "./v0b-types.ts";

export interface DockerBackendProfileV36 {
	schema_version: 1;
	backend_kind: "docker_engine_linux_container";
	host_frontend: "docker_desktop_wsl2";
	docker_context: "desktop-linux";
	docker_client_version: "29.6.2";
	docker_server_version: "29.6.2";
	platform: "linux/amd64";
	image_reference: "node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03";
	network_mode: "none";
	root_filesystem: "read_only";
	tmpfs: "/tmp:rw,noexec,nosuid,nodev,size=67108864";
	user: "65532:65532";
	cpus: 0.5;
	memory_bytes: 536870912;
	memory_swap_bytes: 536870912;
	pids_limit: 64;
	nofile: "1024:1024";
	cap_drop: "ALL";
	no_new_privileges: true;
	pull_policy: "never";
	wall_timeout_ms: 30000;
	combined_output_budget_bytes: 65536;
	workspace_mount_destination: "/workspace";
	workspace_mount_count: 1;
	container_lifecycle: "one_disposable_container_per_registered_command";
	profile_digest: string;
}

export interface DockerCommandAuthorityV36 {
	schema_version: 1;
	authority_kind: "v36_docker_registered_command";
	execution_id: string;
	command_id: string;
	executable: "node";
	argv: string[];
	workspace_identity: string;
	backend_profile_digest: string;
	created_at: string;
	authority_digest: string;
}

export interface DockerTerminalEvidenceV36 {
	schema_version: 1;
	execution_id: string;
	command_id: string;
	authority_digest: string;
	backend_profile_digest: string;
	status: "succeeded" | "nonzero_exit" | "timed_out" | "preflight_failed" | "start_failed" | "cleanup_failed";
	create: { attempted: boolean; succeeded: boolean; container_identity: string | null };
	start: { attempted: boolean; succeeded: boolean };
	output: { stdout: string; stderr: string; combined_bytes_observed: number; truncated: boolean };
	inspect: { attempted: boolean; succeeded: boolean; exit_code: number | null; oom_killed: boolean | null; mount_count: number | null; profile_match: boolean };
	timeout: { triggered: boolean; wall_timeout_ms: 30000 };
	kill: { attempted: boolean; succeeded: boolean };
	remove: { attempted: boolean; succeeded: boolean };
	exit_code: number | null;
	timed_out: boolean;
	cleanup_complete: boolean;
	error_code: string | null;
	terminal_digest: string;
}

export interface InteractiveRunEvidenceV36G2 {
	schema_version: 2;
	run_id: string;
	session_id: string;
	authority_digest: string;
	settled: true;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	docker_project_command_executions: number;
	project_command_executions: number;
	workspace_identity_after: string;
	underlying_run_ref: string;
	evidence_digest: string;
}

export interface RegisteredCommandTerminalV36 {
	command_id: string;
	exit_code: number | null;
	timed_out: boolean;
	truncated: boolean;
	command_ordinal: number;
	authority_digest: string;
	authority_ref: string;
	terminal_ref: string;
	terminal_digest: string;
}

export type FiniteBudgetDimensionKindV36 = "provider_request" | "combined_token" | "cost" | "tool_call" | "wall_time";

export interface FiniteBudgetDimensionV36 {
	dimension: FiniteBudgetDimensionKindV36;
	observed: number;
	allowed: number;
	capture_phase: "before_provider_dispatch" | "after_provider_response_accounted" | "before_tool_execution" | "clean_boundary_before_provider_request" | "clean_boundary_before_tool_execution";
}

export interface ReconciledRegisteredCommandTerminalV36 extends RegisteredCommandTerminalV36 {
	observation: "PASS" | "FAIL";
}

/**
 * The accepted legacy Provider-request non-settled terminal form. It records a local refusal
 * before the configured finite Provider-request hard boundary; it is not an
 * AgentHarness settle result, task success, verifier outcome, or Source-apply
 * authorization. Schema 1 preserves the accepted legacy 17/16 terminal;
 * schema 2 identifies the daily 25/24 profile explicitly.
 */
export interface ProviderRequestBudgetTerminalV36 {
	schema_version: 1 | 2;
	budget_profile_id?: "v36_daily_bounded_edit_v2";
	terminal_kind: "v36_pre_dispatch_provider_request_budget_terminal";
	trajectory_outcome: "pre_dispatch_budget_terminal";
	terminal_reason: "provider_request_budget_exhausted";
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	authority_digest: string;
	created_at: string;
	settled: false;
	request_attempts: number;
	provider_dispatches: number;
	provider_responses: number;
	provider_requests_max: number;
	pending_provider_reservations: 0;
	pending_tool_calls: 0;
	pending_side_effects: 0;
	usage_known: true;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	tool_calls: number;
	last_registered_command: RegisteredCommandTerminalV36;
	workspace_identity_at_terminal: string;
	session_entry_count_before_turn: number;
	session_entries_sha256_before_turn: string;
	session_entry_count_at_terminal: number;
	session_entries_sha256_at_terminal: string;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	terminal_digest: string;
}

/**
 * Schema 3 is additive. It covers only known, quiescent finite-budget stops
 * other than the accepted schema-1/schema-2 Provider-request artifacts above.
 * Each counter retains its capture-phase meaning; no field implies settle,
 * verification, Outcome, comparison, adaptation, promotion, or Apply authority.
 */
export interface ReconciledFiniteBudgetTerminalV36 {
	schema_version: 3 | 4;
	budget_profile_id: "v36g2_frozen_acceptance_v1" | "v36_daily_bounded_edit_v2";
	terminal_kind: "v36_reconciled_finite_budget_terminal";
	trajectory_outcome: "finite_budget_terminal";
	terminal_reason: "accounted_usage_budget_exhausted" | "tool_call_budget_exhausted" | "wall_time_budget_exhausted";
	stop_dimensions: FiniteBudgetDimensionV36[];
	run_id: string;
	session_id: string;
	project_id: string;
	workspace_id: string;
	session_pin_digest: string;
	authority_digest: string;
	created_at: string;
	settled: false;
	request_attempts: number;
	provider_dispatches: number;
	provider_responses: number;
	pending_provider_reservations: 0;
	provider_accounting_reconciled: true;
	pending_tool_calls: 0;
	pending_side_effects: 0;
	tool_call_attempts: number;
	tool_calls_executed: number;
	tool_calls_completed: number;
	tool_calls_blocked: number;
	tool_results_recorded: number;
	executed_tool_call_ids: string[];
	/** Schema 4 authenticates every persisted request/result while retaining the
	 * registered-hook budget domain. These fields are absent from schema 3. */
	persisted_tool_call_ids?: string[];
	persisted_tool_result_ids?: string[];
	registered_tool_attempt_ids?: string[];
	registered_tool_blocked_ids?: string[];
	pre_hook_rejected_tool_requests?: Array<{ tool_call_id: string; tool_name: string; category: "unavailable_tool" | "active_tool_pre_hook_rejection"; result_is_error: true }>;
	budget_blocked_registered_tool_call_id?: string | null;
	tool_lifecycle_reconciled: true;
	usage_known: true;
	harness_diagnostic_error_sha256: string;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	wall_time_ms: number;
	last_registered_command: ReconciledRegisteredCommandTerminalV36 | null;
	command_evidence_reconciled: true;
	workspace_identity_at_terminal: string;
	workspace_identity_reconciled: true;
	session_entry_count_before_turn: number;
	session_entries_sha256_before_turn: string;
	session_entry_count_at_terminal: number;
	session_entries_sha256_at_terminal: string;
	session_identity_reconciled: true;
	authority_identity_reconciled: true;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	terminal_digest: string;
}

export type FiniteBudgetTerminalV36 = ProviderRequestBudgetTerminalV36 | ReconciledFiniteBudgetTerminalV36;

export interface SafeProviderRequestBudgetTerminalV36 {
	trajectory_outcome: "pre_dispatch_budget_terminal";
	terminal_reason: "provider_request_budget_exhausted";
	authority_digest: string;
	request_usage: { attempts: number; used: number; max: number };
	usage: { input_tokens: number; output_tokens: number; cost_usd: number; known: true };
	last_registered_command: RegisteredCommandTerminalV36;
	unverified_changes: true;
	terminal_digest: string;
}

export interface SafeFiniteBudgetTerminalV36 {
	trajectory_outcome: "pre_dispatch_budget_terminal" | "finite_budget_terminal";
	terminal_reason: "provider_request_budget_exhausted" | "accounted_usage_budget_exhausted" | "tool_call_budget_exhausted" | "wall_time_budget_exhausted";
	authority_digest: string;
	stop_dimensions: FiniteBudgetDimensionV36[];
	request_usage: { attempts: number; used: number; max: number };
	tool_usage: { attempts: number; executed: number; completed: number; blocked: number; results: number; max: number };
	tool_accounting: {
		persisted_calls: number;
		persisted_results: number;
		registered_attempts: number;
		registered_executions: number;
		registered_completions: number;
		registered_blocked: number;
		unavailable_requests: Array<{ tool_call_id: string; tool_name: string; result_is_error: true }>;
		active_tool_pre_hook_rejections: Array<{ tool_call_id: string; tool_name: string; result_is_error: true }>;
		budget_blocked_registered_tool_call_id: string | null;
	};
	usage: { input_tokens: number; output_tokens: number; combined_tokens: number; cost_usd: number; wall_time_ms: number | "not_recorded"; known: true };
	last_registered_command: ReconciledRegisteredCommandTerminalV36 | null;
	settled: false;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	unverified_changes: true;
	terminal_digest: string;
}

export interface WorkspaceInventoryV36 {
	schema_version: 1;
	files: Array<{ path: string; bytes: number; sha256: string }>;
	inventory_digest: string;
}

export type ChangeOperationV36 = "add" | "modify" | "delete";

export interface ChangeEntryV36 {
	path: string;
	operation: ChangeOperationV36;
	before_sha256: string | null;
	after_sha256: string | null;
	after_blob_ref: ArtifactRefV0B | null;
}

export interface ChangeSetV36 {
	schema_version: 1;
	project_id: string;
	session_id: string;
	run_id: string;
	project_profile_digest: string;
	source_snapshot_identity: string;
	initial_inventory_digest: string;
	final_inventory_digest: string;
	changes: ChangeEntryV36[];
	status: "proposed";
	change_set_digest: string;
}

export interface SafeChangeSetV36 {
	schema_version: 1;
	project_id: string;
	session_id: string;
	run_id: string;
	change_set_digest: string;
	status: "proposed" | "applied" | "discarded" | "partial_apply_error";
	changes: Array<{ path: string; operation: ChangeOperationV36; before_sha256: string | null; after_sha256: string | null; diff: string }>;
	backend: { kind: "docker_engine_linux_container"; image_digest: string; network: "none"; profile_digest: string };
	handoff_actions: Array<"apply_all" | "discard" | "export">;
	handoff_result: SafeHandoffResultV36 | null;
}

export interface SafeHandoffResultV36 {
	schema_version: 1;
	result_kind: "v36_safe_handoff_result";
	action: "apply_all" | "discard";
	status: "applied" | "discarded" | "partial_apply_error" | "conflict_stale_source" | "failed";
	source_state: "updated" | "unchanged" | "partially_updated" | "unknown";
	message_code: "source_updated" | "changes_discarded" | "source_conflict" | "partial_apply" | "handoff_failed";
	receipt_digest: string | null;
	error_code: "source_stale_or_conflict" | "source_apply_failed" | "handoff_failed" | null;
	journal: Array<{ path: string; operation: ChangeOperationV36; state: "applied" | "not_applied"; recovery_material_saved: boolean }>;
	recovery_material_saved: boolean;
	retry_safe: false;
}

export interface ChangeHandoffRequestV36 {
	session_id: string;
	change_set_digest: string;
	action: "apply_all" | "discard" | "export";
}

export interface ApplyJournalEntryV36 {
	path: string;
	operation: ChangeOperationV36;
	state: "applied" | "not_applied";
	recovery_blob_ref: ArtifactRefV0B | null;
	recovery_requires_absence: boolean;
}

export interface ChangeHandoffReceiptV36 {
	schema_version: 1;
	session_id: string;
	change_set_digest: string;
	action: "apply_all" | "discard";
	status: "applied" | "discarded" | "partial_apply_error";
	journal: ApplyJournalEntryV36[];
	source_identity_after: string;
	error_code: string | null;
	receipt_digest: string;
}

export interface ChangeSetExportV36 {
	schema_version: 1;
	change_set: ChangeSetV36;
	blobs: Array<{ sha256: string; bytes_base64: string }>;
	export_digest: string;
}
