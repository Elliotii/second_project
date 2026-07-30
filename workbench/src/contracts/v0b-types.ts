import type { CommandDescriptor } from "../types.ts";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface VerifierCommandV0B {
	executable: "current_node_executable";
	argv: string[];
	cwd: "project";
	timeout_ms: number;
	output_limit_bytes: number;
}

export interface TaskSpecV0B {
	schema_version: 1;
	task_id: string;
	instruction_ref: string;
	instruction_sha256: string;
	workspace_source_ref: string;
	workspace_source_digest: string;
	writable_paths: string[];
	protected_paths: string[];
	verifier_id: string;
	verifier_ref: string;
	verifier_sha256: string;
	acceptance_visibility: "hidden_external" | "public_external";
	tool_profile_id: string;
	command_descriptors: CommandDescriptor[];
	verifier_command: VerifierCommandV0B;
}

export interface StrategySpecV0B {
	schema_version: 1;
	strategy_id: string;
	base_prompt_id: string;
	base_prompt_sha256: string;
	skill_refs: string[];
	completion_policy_id: "observe_only";
	recovery_mode: "none";
	tool_profile_id: string;
	model_profile_id: "public_emitted_faux";
}

export interface BudgetSnapshotV0B {
	provider_request_limit: number;
	provider_request_usage: number;
	tool_call_limit: number;
	tool_call_usage: number;
	wall_time_limit_ms: number;
	wall_time_usage_ms: number;
	token_limit: "not_applicable";
	token_usage: "unknown";
	cost_limit_usd: 0;
	cost_usage_usd: 0;
	verifier_timeout_ms: number;
	verifier_output_limit_bytes: number;
	external_provider_calls: 0;
}

export interface RunRecordV0B {
	schema_version: 1;
	run_id: string;
	task_id: string;
	strategy_id: string;
	comparison_group_id: null;
	created_at: string;
	status: "running" | "terminal";
	config_digest: string;
	source_identity: {
		root_baseline_commit: string;
		v0a_implementation_baseline: string;
		pi_commit: string;
		workbench_tree_digest: string;
		task_sha256: string;
		strategy_sha256: string;
		verifier_sha256: string;
	};
	provider_identity: {
		kind: "public_emitted_faux";
		external: false;
		credentials_used: false;
	};
	budget: BudgetSnapshotV0B;
	attempt_ids: [string];
}

export interface AttemptRecordV0B {
	schema_version: 1;
	attempt_id: string;
	run_id: string;
	ordinal: 1;
	strategy_id: string;
	parent_attempt_id: null;
	trigger: "initial";
	session_id: string;
	workspace_id: string;
	started_at: string;
	settled_at: string | null;
	terminal_reason: string | null;
	budget_allocation: BudgetSnapshotV0B;
	budget_usage: BudgetSnapshotV0B;
}

export interface WorkspaceRefV0B {
	schema_version: 1;
	workspace_id: string;
	provider: "temporary_copy";
	root: string;
	parent_workspace_id: null;
	source_digest: string;
	initial_tree_digest: string;
	final_tree_digest: string | null;
	writable_paths: string[];
	protected_paths: string[];
	file_count: number;
	hardlink_pairs: 0;
}

export interface ArtifactRefV0B {
	path: string;
	sha256: string;
	size_bytes: number;
	media_type: string;
	truncated: boolean;
}

export interface SessionRefV0B {
	schema_version: 1;
	session_id: string;
	runtime: "pi_agent_core";
	pi_commit: string;
	storage_ref: ArtifactRefV0B;
	metadata_digest: string;
	model_profile_id: "public_emitted_faux";
	tool_profile_id: string;
	reasoning_persistence: "metadata_only";
	resume_capability: "not_claimed";
	redaction: {
		reasoning_blocks: number;
		reasoning_characters: number;
		reasoning_utf8_bytes: number;
		removed_signatures: number;
		content_types: Array<{
			content_type: string;
			blocks: number;
			characters: number;
			utf8_bytes: number;
		}>;
	};
	truncation: {
		entries: number;
	};
}

export const JOURNAL_EVENT_TYPES = [
	"run_started",
	"run_terminal",
	"attempt_started",
	"attempt_settled",
	"attempt_aborted",
	"attempt_error",
	"workspace_materialized",
	"workspace_finalized",
	"session_linked",
	"session_entry_persisted",
	"provider_request_started",
	"provider_response_observed",
	"tool_call_started",
	"tool_call_completed",
	"tool_call_error",
	"tool_call_aborted",
	"verifier_started",
	"verifier_completed",
	"evidence_validation_completed",
	"outcome_created",
] as const;

export type JournalEventTypeV0B = (typeof JOURNAL_EVENT_TYPES)[number];

export interface JournalEntryV0B {
	schema_version: 1;
	seq: number;
	timestamp: string;
	type: JournalEventTypeV0B;
	run_id: string;
	attempt_id: string;
	session_id: string;
	workspace_id: string;
	data: Record<string, JsonValue>;
}

export interface VerifierResultV0B {
	schema_version: 1;
	verifier_id: string;
	verifier_sha256: string;
	attempt_id: string;
	started_at: string;
	completed_at: string;
	duration_ms: number;
	execution: {
		executable: string;
		executable_identity: {
			node_version: string;
		};
		argv: string[];
		cwd: string;
		cwd_identity: "project_root";
		shell: false;
		environment_allowlist_keys: string[];
		timeout_ms: number;
		output_limit_bytes: number;
		source_snapshot_ref: ArtifactRefV0B;
		source_sha256: string;
		source_digest_verified: boolean;
	};
	status: "passed" | "failed" | "invalid";
	exit_code: number | null;
	timed_out: boolean;
	summary: string;
	full_output_ref: ArtifactRefV0B;
	full_output_sha256: string;
	invalid_reason: string | null;
}

export type OutcomeStatusV0B = "passed" | "failed" | "invalid" | "cancelled";
export type FailureClassV0B = "agent" | "verifier" | "infrastructure" | "evidence" | "budget" | "user" | null;

export interface OutcomeV0B {
	schema_version: 1;
	run_id: string;
	final_attempt_id: string;
	status: OutcomeStatusV0B;
	failure_class: FailureClassV0B;
	terminal_reason: string;
	initial_verifier_status: VerifierResultV0B["status"] | null;
	final_verifier_status: VerifierResultV0B["status"] | null;
	recovery_triggered: false;
	attempt_count: 1;
	evidence_index_ref: string;
}

export interface EvidenceIndexItemV0B extends ArtifactRefV0B {
	responsibility: string;
}

export interface EvidenceIndexV0B {
	schema_version: 1;
	run_id: string;
	items: EvidenceIndexItemV0B[];
}

export interface TerminalRecordV0B {
	schema_version: 1;
	run_id: string;
	outcome_sha256: string;
	evidence_index_sha256: string;
	preterminal_scan: {
		completed: true;
		scope_labels: string[];
		match_count: 0;
		result_ref: ArtifactRefV0B;
	};
	committed_at: string;
}

export interface SecretScanResultV0B {
	schema_version: 1;
	status: "passed" | "rejected";
	completed: true;
	scope_labels: string[];
	scanned_file_count: number;
	scanned_object_count: number;
	scopes: Array<{
		scope_label: string;
		kind: "file" | "object";
		sha256: string;
		size_bytes: number;
	}>;
	match_count: number;
	matches: Array<{
		scope_label: string;
		rule_id: string;
	}>;
}

export interface EvidenceValidationV0B {
	schema_version: 1;
	run_id: string;
	valid: boolean;
	errors: string[];
	checked_artifact_count: number;
	tool_call_count: number;
	tool_result_count: number;
	journal_entry_count: number;
}
