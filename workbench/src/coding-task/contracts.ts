import type { Api, Model, Models } from "@earendil-works/pi-ai";
import type { BoundedTaskPolicy } from "../types.ts";

export const PINNED_PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";

export interface CodingTaskSpec {
	task_id: string;
	prompt: string;
	skill?: {
		path: string;
		expected_sha256: string;
	};
	source_root: string;
	source_revision?: string;
	existing_tree_digest?: string;
	writable_paths: string[];
	protected_paths: string[];
	command_descriptors: BoundedTaskPolicy["command_descriptors"];
	verifier_spec: {
		id: string;
		source_path: string;
		sha256: string;
		timeout_ms: number;
		output_limit_bytes: number;
	};
	output_root: string;
	timeout_ms: number;
}

export interface CodingTaskModelRuntime {
	models: Models;
	model: Model<Api>;
	close(): Promise<void>;
}

export type ExecutionStatus = "completed" | "timeout" | "aborted" | "infrastructure_failed";
export type VerificationStatus = "passed" | "failed" | "not_run";
export type FailureReason = "provider" | "workspace" | "verifier" | "task_configuration" | "artifact_persistence" | "unknown" | null;

export interface CodingTaskUsage {
	request_count: number;
	input_tokens: number | "unknown";
	output_tokens: number | "unknown";
	cost_usd: number | "unknown";
	tool_count: number;
	duration_ms: number;
	unknown_fields: string[];
}

export interface CodingTaskRunManifest {
	schema_version: 1;
	run_id: string;
	task_id: string;
	source_revision: string | null;
	existing_tree_digest: string | null;
	model: { provider: string; id: string };
	pi_commit: string;
	skill: { path: string; actual_sha256: string } | null;
	execution_status: ExecutionStatus;
	verification_status: VerificationStatus;
	failure_reason: FailureReason;
	agent_final_claim: string | null;
	started_at: string;
	finished_at: string;
	usage: CodingTaskUsage;
	changes: { added: string[]; modified: string[]; deleted: string[] };
	artifacts: {
		session: string;
		trace: string;
		diff: string;
		verifier_result: string;
		report: string;
	};
	known_limitations: string[];
}
