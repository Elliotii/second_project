export const EVALUATION_JOB_KIND = "formal_skill_evaluation" as const;
export const EVALUATION_SERVICE_SCHEMA_VERSION = 1 as const;

export type EvaluationJobTerminalReason =
	| "completed"
	| "preflight_failed"
	| "execution_failed"
	| "timed_out_cleanup_complete"
	| "uncertain_requires_review"
	| "artifact_invalid";

export interface EvaluationJobRequest {
	schema_version: 1;
	job_id: string;
	kind: typeof EVALUATION_JOB_KIND;
	evaluation_spec_id: string;
	idempotency_key_sha256: string;
	payload_sha256: string;
	accepted_at: string;
}

export interface EvaluationQueueData {
	schema_version: 1;
	job_id: string;
	kind: typeof EVALUATION_JOB_KIND;
	evaluation_spec_id: string;
	payload_sha256: string;
	spec_snapshot_sha256: string;
}

export interface ArtifactReference {
	name: string;
	path: string;
	sha256: string;
	bytes: number;
}

export interface EvaluationJobTerminal {
	schema_version: 1;
	job_id: string;
	attempt: 1;
	reason: EvaluationJobTerminalReason;
	started_at: string | null;
	finished_at: string;
	message: string;
	cleanup_confirmed: boolean | null;
	evaluation_result: Record<string, unknown> | null;
	artifacts: ArtifactReference[];
}

export interface FakeEvaluationExecutorSpec {
	kind: "fake";
	behavior: "success" | "task_failure" | "execution_failure" | "timeout" | "nested_timeout" | "credential_echo";
	delay_ms: number;
	credential_profile_id: string | null;
	stdout_bytes: number;
}

export interface FormalEvaluationBinding {
	plan_id: string;
	config_path: string;
	config_sha256: string;
}

export interface FormalExecutorFile {
	path: string;
	sha256: string;
}

export interface FormalEvaluationExecutorSpec {
	kind: "formal_cli";
	plan_path: string;
	plan_sha256: string;
	bindings: FormalEvaluationBinding[];
	credential_profile_id: string;
	analysis_request_timeout_ms: number;
	expected_workbench_commit: string;
	expected_workbench_tree: string;
	executor_files: FormalExecutorFile[];
}

export interface FauxFormalEvaluationExecutorSpec {
	kind: "faux_formal_cli";
	plan_path: string;
	plan_sha256: string;
	bindings: FormalEvaluationBinding[];
	credential_profile_id: null;
	expected_workbench_commit: string;
	expected_workbench_tree: string;
	executor_files: FormalExecutorFile[];
}

export interface RegisteredEvaluationSpec {
	schema_version: 1;
	id: string;
	kind: typeof EVALUATION_JOB_KIND;
	enabled: boolean;
	job_timeout_ms: number;
	log_limit_bytes: number;
	executor: FakeEvaluationExecutorSpec | FormalEvaluationExecutorSpec | FauxFormalEvaluationExecutorSpec;
}

export interface EvaluationSpecRegistryFile {
	schema_version: 1;
	specs: RegisteredEvaluationSpec[];
}

export interface CredentialProfile {
	id: string;
	file: string;
}

export interface CredentialProfileRegistryFile {
	schema_version: 1;
	profiles: CredentialProfile[];
}

export interface ServiceRuntimeConfig {
	projectRoot: string;
	registryPath: string;
	credentialRegistryPath: string | null;
	jobsRoot: string;
	redisUrl: string;
	queueName: string;
	host: "127.0.0.1";
	port: number;
	workerConcurrency: number;
	globalConcurrency: number;
	lockDurationMs: number;
	stalledIntervalMs: number;
	killGraceMs: number;
	reconciliationGraceMs: number;
}

export interface EvaluationQueueResult {
	job_id: string;
	reason: EvaluationJobTerminalReason;
}

export interface EvaluationChildTerminal {
	schema_version: 1;
	job_id: string;
	launch_token: string;
	reason: "completed" | "execution_failed";
	finished_at: string;
	exit_code: number | null;
	evaluation_result: Record<string, unknown> | null;
	message: string;
}

export interface EvaluationLaunchControl {
	schema_version: 1;
	job_id: string;
	launch_token: string;
	project_root: string;
	launch_root: string;
	spec: RegisteredEvaluationSpec;
}

export interface ProcessTreeRecord {
	schema_version: 1;
	launch_token: string;
	processes: Array<{ pid: number; role: "runner" | "evaluator"; identity_fragment: string }>;
}
