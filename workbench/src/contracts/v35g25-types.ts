import type { ArtifactRefV0B } from "./v0b-types.ts";

export type Goal25TrajectoryOutcomeV35 = "settled" | "pre_dispatch_budget_terminal" | "invalid";
export type Goal25TaskOutcomeV35 = "passed" | "failed" | "invalid";

export interface Goal25ProviderReservationV35 {
	request_attempt: number;
	dispatch_ordinal: number;
	state: "reserved" | "responded";
	input_tokens: number | null;
	output_tokens: number | null;
	cost_usd: number | null;
}

export interface Goal25RuntimeEvidenceV35 {
	schema_version: 1;
	run_id: string;
	session_id: string;
	trajectory_outcome: Goal25TrajectoryOutcomeV35;
	task_outcome: null;
	terminal_reason: "successful_public_test" | "provider_request_budget_exhausted" | "invalid";
	request_attempts: number;
	provider_dispatches: number;
	provider_responses: number;
	pending_provider_reservations: number;
	pending_tool_calls: number;
	pending_side_effects: number;
	raw_harness_settled_events: number;
	public_test_succeeded: boolean;
	public_test_terminated: boolean;
	usage_known: boolean;
	workspace_tree_sha256_at_terminal: string;
	protected_bytes_sha256_at_terminal: string;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	tool_calls: number;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	tool_interface_sha256: string;
	reservations: Goal25ProviderReservationV35[];
	runtime_digest: string;
}

export interface Goal25PreVerifierCheckpointV35 {
	schema_version: 1;
	run_id: string;
	session_id: string;
	trajectory_outcome: "pre_dispatch_budget_terminal";
	task_outcome: null;
	checkpoint_sequence: 1;
	request_attempts: 17;
	provider_dispatches: 16;
	provider_responses: 16;
	pending_provider_reservations: 0;
	pending_tool_calls: 0;
	pending_side_effects: 0;
	usage_known: true;
	provider_usage_reconciled: true;
	session_reopen_equal: true;
	tool_calls_closed: true;
	workspace_unchanged_since_terminal: true;
	protected_unchanged: true;
	first_payload_present: true;
	timed_out: false;
	post_dispatch_loss: false;
	checkpoint_before_verifier: true;
	workspace_tree_sha256: string;
	protected_bytes_sha256: string;
	session_entries_sha256: string;
	first_payload_sha256: string;
	tool_interface_sha256: string;
	runtime_ref: ArtifactRefV0B;
	first_payload_ref: ArtifactRefV0B;
	session_snapshot_ref: ArtifactRefV0B;
	workspace_snapshot_ref: ArtifactRefV0B;
	checkpoint_digest: string;
}

export interface Goal25SettledVerifierHandoffV35 {
	schema_version: 1;
	run_id: string;
	session_id: string;
	trajectory_outcome: "settled";
	task_outcome: null;
	handoff_sequence: 1;
	runtime_authenticated: true;
	runtime_matches_expected: true;
	session_reopen_equal: true;
	tool_calls_closed: true;
	workspace_unchanged_since_terminal: true;
	protected_unchanged: true;
	first_payload_authenticated: true;
	handoff_before_verifier: true;
	session_ref: string;
	session_entry_count: number;
	session_entries_sha256: string;
	workspace_tree_sha256: string;
	protected_bytes_sha256: string;
	tool_interface_sha256: string;
	runtime_ref: ArtifactRefV0B;
	first_payload_ref: ArtifactRefV0B;
	session_snapshot_ref: ArtifactRefV0B;
	workspace_snapshot_ref: ArtifactRefV0B;
	handoff_digest: string;
}

export interface Goal25SessionRunLinkV35 {
	schema_version: 1;
	arm: "base" | "candidate";
	run_id: string;
	run_ref: string;
	session_id: string;
	session_ref_root: "pair_root";
	session_ref: ArtifactRefV0B;
	session_entry_count: number;
	session_entries_sha256: string;
	link_digest: string;
}

export interface Goal25ArmOutcomeV35 {
	schema_version: 1;
	run_id: string;
	trajectory_outcome: Goal25TrajectoryOutcomeV35;
	task_outcome: Goal25TaskOutcomeV35;
	verifier_runs: 0 | 1;
	candidate_eligible: boolean;
	tool_interface_sha256: string;
	outcome_digest: string;
}
