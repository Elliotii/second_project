import type { SafeRunViewV35, SafeSessionViewV35 } from "./v35-types.ts";
import type { SafeProviderRequestBudgetTerminalV36 } from "./v36g2-types.ts";

export type InteractiveRequestedModeV36 = "inspect_only" | "bounded_edit";

export interface BrowserTaskRequestV36 {
	project_id: string;
	requested_mode: InteractiveRequestedModeV36;
	task_text: string;
	title?: string;
	session_id?: string;
}

export interface ProjectSkillDescriptorV36 {
	id: string;
	name: string;
	description: string;
	source: "pi_native";
	read_only: true;
}

export interface HarnessAdaptationDescriptorV36 {
	id: string;
	kind: "prompt_addendum" | "adaptive_skill";
	name: string;
	status: "active" | "available" | "not_bound";
	read_only: true;
}

export interface SafeProjectProfileV36 {
	schema_version: 1;
	project_id: string;
	display_name: string;
	profile_digest: string;
	workspace_strategy: "managed_session_copy";
	supported_modes: InteractiveRequestedModeV36[];
	capability_summary: {
		inspect_only: "read_only_files_no_commands";
		bounded_edit: "planned_file_edits_commands_disabled_until_goal2" | "docker_bounded_edit_change_handoff" | "unavailable";
	};
	risk_notice: string;
	pi_native_skills: ProjectSkillDescriptorV36[];
	harness_adaptations: HarnessAdaptationDescriptorV36[];
	read_only: true;
}

export interface SessionPinV36 {
	schema_version: 1;
	session_id: string;
	project_id: string;
	project_profile_digest: string;
	workspace_id: string;
	workspace_strategy: "managed_session_copy";
	source_snapshot_identity: string;
	code_identity: string;
	harness_state_digest: string;
	execution_backend_profile_digest: string;
	provider_model_policy_digest: string;
	capability_digest: string;
	requested_mode: InteractiveRequestedModeV36;
	created_at: string;
	session_pin_digest: string;
}

export interface InteractiveRunAuthorityV36 {
	schema_version: 1;
	authority_kind: "v36_interactive_run";
	mode: "interactive_agent";
	run_id: string;
	session_id: string;
	project_id: string;
	project_profile_digest: string;
	requested_mode: InteractiveRequestedModeV36;
	task_prompt_sha256: string;
	workspace_id: string;
	workspace_strategy: "managed_session_copy";
	workspace_identity_before: string;
	code_identity: string;
	source_snapshot_identity: string;
	harness_state_digest: string;
	execution_backend_profile_digest: string;
	provider_model_policy_digest: string;
	capability_digest: string;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	command_execution_authority: "disabled_goal1" | "docker_registered_only";
	source_mutation_authority: "not_granted_goal1" | "host_handoff_only";
	created_at: string;
	authority_digest: string;
}

export interface InteractiveRunEvidenceV36 {
	schema_version: 1;
	run_id: string;
	session_id: string;
	authority_digest: string;
	settled: true;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	credential_reads: 0;
	network_calls: 0;
	external_provider_calls: 0;
	real_model_calls: 0;
	docker_project_command_executions: 0;
	project_command_executions: 0;
	underlying_run_ref: string;
	evidence_digest: string;
}

export interface SafeInteractiveRunV36 {
	run_id: string;
	authority_digest: string;
	settled: boolean;
	verification_mode: "unverified";
	formal_outcome: null;
	comparison_eligible: false;
	adaptation_eligible: false;
	promotion_eligible: false;
	command_execution: "disabled_goal1" | "docker_registered_only";
	terminal: SafeProviderRequestBudgetTerminalV36 | null;
}

export interface SafePersistentRunV36 extends Omit<SafeRunViewV35, "settled" | "mode"> {
	settled: boolean;
	mode: "deterministic_faux" | "real_product_smoke" | "pre_dispatch_budget_terminal";
	terminal: SafeProviderRequestBudgetTerminalV36 | null;
}

export interface SafePersistentSessionV36 extends Omit<SafeSessionViewV35, "runs"> {
	runs: SafePersistentRunV36[];
}

export interface SafeInteractiveSessionV36 {
	schema_version: 1;
	session_id: string;
	project_id: string;
	title: string;
	requested_mode: InteractiveRequestedModeV36;
	workspace_id: string;
	workspace_strategy: "managed_session_copy";
	pins: Omit<SessionPinV36, "session_pin_digest" | "created_at" | "schema_version" | "session_id" | "project_id" | "workspace_id" | "workspace_strategy" | "requested_mode"> & { session_pin_digest: string };
	capabilities: {
		file_read: true;
		file_write: boolean;
		planned_file_write: boolean;
		project_commands: boolean;
		docker_commands: boolean;
		source_apply: boolean;
	};
	verification: {
		mode: "unverified";
		formal_outcome: null;
		comparison_eligible: false;
		adaptation_eligible: false;
		promotion_eligible: false;
	};
	pi_native_skills: ProjectSkillDescriptorV36[];
	harness_adaptations: HarnessAdaptationDescriptorV36[];
	runs: SafeInteractiveRunV36[];
	persistent_session: SafePersistentSessionV36;
	read_only: true;
}

export interface WorkspaceTreeEntryV36 {
	path: string;
	kind: "file" | "directory";
	bytes: number | null;
}

export interface SafeWorkspaceTreeV36 {
	schema_version: 1;
	session_id: string;
	workspace_id: string;
	managed_copy: true;
	read_only_preview: true;
	entries: WorkspaceTreeEntryV36[];
	limits: { max_files: number; max_total_bytes: number; truncated: boolean };
}

export interface SafeWorkspaceTextPreviewV36 {
	schema_version: 1;
	session_id: string;
	workspace_id: string;
	path: string;
	media_type: "text/plain; charset=utf-8";
	bytes: number;
	text: string;
	truncated: false;
	read_only: true;
}
