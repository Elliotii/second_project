export interface PersistentSessionCatalogV35 {
	schema_version: 1;
	project_id: string;
	sessions: PersistentSessionCatalogEntryV35[];
}

export interface PersistentSessionCatalogEntryV35 {
	schema_version: 1;
	session_id: string;
	project_id: string;
	workspace_id: string;
	workspace_path_sha256: string;
	title: string;
	created_at: string;
	updated_at: string;
	parent_session_id: string | null;
	pi_session_ref: string;
	run_refs: PersistentRunCatalogRefV35[];
}

export interface PersistentRunCatalogRefV35 {
	run_id: string;
	run_ref: string;
	created_at: string;
}

export interface PersistentFauxRunManifestV35 {
	schema_version: 1;
	run_id: string;
	project_id: string;
	workspace_id: string;
	workspace_path_sha256: string;
	session_id: string;
	session_ref: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	catalog_session_identity_sha256: string;
	created_at: string;
	settled: true;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	final_context_message_count: number;
	prompt_sha256: string;
	provider_requests: number;
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: 0;
	network_calls: 0;
	external_provider_calls: 0;
	real_model_calls: 0;
}

export interface PersistentRealRunManifestV35 {
	schema_version: 2;
	mode: "real_product_smoke";
	run_id: string;
	project_id: string;
	workspace_id: string;
	workspace_path_sha256: string;
	session_id: string;
	session_ref: string;
	session_entry_count_after_turn: number;
	session_entries_sha256_after_turn: string;
	catalog_session_identity_sha256: string;
	created_at: string;
	settled: true;
	prior_run_id: string | null;
	prior_context_message_count: number;
	prior_context_sha256: string;
	provider_observed_prior_context_sha256: string;
	final_context_message_count: number;
	prompt_sha256: string;
	provider_requests: number;
	tool_call_ids: string[];
	tool_result_ids: string[];
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	wall_time_ms: number;
	verifier_id: string;
	verifier_status: "passed" | "failed";
	verifier_ref: string;
	outcome: "passed" | "failed";
	outcome_ref: string;
	binding_status: "not_applicable";
}

export type PersistentRunManifestV35 = PersistentFauxRunManifestV35 | PersistentRealRunManifestV35;

export interface SafeSessionMessageV35 {
	entry_id: string;
	role: "user" | "assistant" | "tool";
	text: string | null;
	tool_call_id: string | null;
	tool_name: string | null;
	tool_arguments_sha256: string | null;
	is_error: boolean | null;
}

export interface SafeRunViewV35 {
	run_id: string;
	created_at: string;
	settled: true;
	provider_requests: number;
	tool_call_count: number;
	context_reconstructed: boolean;
	mode: "deterministic_faux" | "real_product_smoke";
	prior_run_id: string | null;
	input_tokens: number | "not_recorded";
	output_tokens: number | "not_recorded";
	cost_usd: number | "not_recorded";
	verifier_id: string | "not_recorded";
	verifier_status: "passed" | "failed" | "not_recorded";
	outcome: "passed" | "failed" | "not_recorded";
	binding_status: "not_applicable" | "not_recorded";
	source_ref: string;
}

export interface SafeSessionViewV35 {
	schema_version: 1;
	session_id: string;
	project_id: string;
	workspace_id: string;
	title: string;
	created_at: string;
	updated_at: string;
	parent_session_id: string | null;
	messages: SafeSessionMessageV35[];
	runs: SafeRunViewV35[];
	source_status: "available";
}

export type SourceAvailabilityV35 = "available" | "not_recorded" | "unavailable";

export interface ComparisonViewV35 {
	schema_version: 1;
	kind: "v2_recovery" | "goal2_skill";
	source_status: SourceAvailabilityV35;
	run_id: string | null;
	outcome: string | null;
	candidate_ids: string[];
	selected_candidate_id: string | null;
	source_refs: string[];
}

export interface AdaptationLineageViewV35 {
	schema_version: 1;
	kind: "v3_prompt_adaptation";
	source_status: SourceAvailabilityV35;
	run_id: string | null;
	binding_digest: string | null;
	runtime_path: string | null;
	verifier_status: string | null;
	source_refs: string[];
}

export interface LegacyRunFallbackViewV35 {
	schema_version: 1;
	source_status: SourceAvailabilityV35;
	run_id: string | null;
	status: string | null;
	session_link: "available" | "not_recorded";
	source_ref: string;
}
