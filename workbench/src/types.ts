export type CommandId = "test" | "build" | "typecheck" | "lint" | "public_test";

export interface CommandDescriptor {
	command_id: CommandId;
	executable: "current_node_executable";
	argv: string[];
	cwd: "workspace";
	timeout_seconds: number;
	max_combined_output_bytes: number;
}

export interface BoundedTaskPolicy {
	writable_paths: string[];
	protected_paths: string[];
	command_descriptors: CommandDescriptor[];
}

export interface TaskSpecV0A {
	schema_version: 1;
	task_id: string;
	instruction_ref: string;
	instruction_sha256: string;
	workspace_source_ref: string;
	workspace_source_digest: string;
	writable_paths: string[];
	protected_paths: string[];
	tool_profile_id: "v0a_bounded_local";
	command_descriptors: CommandDescriptor[];
}

export interface StrategySpecV0A {
	strategy_id: "v0a_faux_single_cycle";
	provider: "public_faux";
	system_prompt_id: "project_minimal_base_v1";
	skill_refs: [];
	completion_policy: "foundation_single_cycle_no_external_verifier";
	recovery_budget: 0;
}

export interface PreflightPlanV0A {
	schema_version: 1;
	mode: "dry_run" | "execution_preflight";
	task_id: string;
	strategy: StrategySpecV0A;
	config_digest: string;
	instruction_sha256: string;
	workspace_source_digest: string;
	workspace_source_root: string;
	workspace_target_template: ".runs/v0-a/runs/<generated-run-id>/workspace";
	evidence_target_template: ".runs/v0-a/runs/<generated-run-id>";
	pi_public_import: string;
	real_model_budget: 0;
	recovery_budget: 0;
	formal_run_identity_created: false;
	provider_calls: 0;
}

export interface RunRecordV0A {
	schema_version: 1;
	run_id: string;
	task_id: string;
	strategy_id: string;
	config_digest: string;
	workspace_id: string;
	attempt_ids: [string];
	status: "planned" | "running" | "settled" | "invalid";
}

export interface AttemptRecordV0A {
	schema_version: 1;
	attempt_id: string;
	run_id: string;
	ordinal: 1;
	parent_attempt_id: null;
	strategy_id: string;
	session_id: string;
	workspace_id: string;
	status: "planned" | "running" | "settled" | "error";
	terminal_reason: string | null;
}

export interface WorkspaceRefV0A {
	workspace_id: string;
	provider: "temporary_copy";
	root: string;
	source_digest: string;
	initial_tree_digest: string;
	final_tree_digest: string | null;
	writable_paths: string[];
	protected_paths: string[];
	file_count: number;
	hardlink_pairs: 0;
}

export interface ToolAuditEvent {
	sequence: number;
	type: "start" | "end" | "error";
	tool_call_id: string;
	tool_name: string;
	error?: string;
}

export interface FoundationAcceptance {
	status: "passed" | "failed";
	public_test_exit_code: number | null;
	public_test_timed_out: boolean;
	protected_files_unchanged: boolean;
	changed_paths: string[];
	only_allowed_paths_changed: boolean;
	final_tree_digest: string;
	formal_outcome: null;
}
