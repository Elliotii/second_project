import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import type {
	BrowserTaskRequestV36,
	InteractiveRunAuthorityV36,
	InteractiveRunEvidenceV36,
	InteractiveRequestedModeV36,
	SafeInteractiveRunV36,
	SafeInteractiveSessionV36,
	SessionPinV36,
} from "../contracts/v36-types.ts";
import type { InteractiveRunEvidenceV36G2 } from "../contracts/v36g2-types.ts";
import { readJsonArtifact, validateArtifactRef, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256 } from "../hash.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";
import { ProjectProfileRegistryV36, type ResolvedProjectProfileV36 } from "../project/registry-v36.ts";
import { PersistentInteractiveSessionServiceV36, type PersistentInteractiveTurnResultV36 } from "../session/persistent-session-v36.ts";
import { createManagedSessionCopyV36, managedWorkspaceIdentityV36, workspaceTextPreviewV36, workspaceTreePreviewV36 } from "../workspace/managed-copy-v36.ts";
import { assertManagedWorkspaceHeadV36, assertSessionContinuationAllowedV36, persistInitialInventoryV36, validateSuccessfulApplyMarkerV36, type ChangeSetHostContextV36 } from "../workspace/change-set-v36.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const BROWSER_KEYS = ["project_id", "requested_mode", "task_text", "title", "session_id"] as const;
const AUTHORITY_KEYS = ["schema_version", "authority_kind", "mode", "run_id", "session_id", "project_id", "project_profile_digest", "requested_mode", "task_prompt_sha256", "workspace_id", "workspace_strategy", "workspace_identity_before", "code_identity", "source_snapshot_identity", "harness_state_digest", "execution_backend_profile_digest", "provider_model_policy_digest", "capability_digest", "verification_mode", "formal_outcome", "comparison_eligible", "adaptation_eligible", "promotion_eligible", "command_execution_authority", "source_mutation_authority", "created_at", "authority_digest"] as const;
const PIN_KEYS = ["schema_version", "session_id", "project_id", "project_profile_digest", "workspace_id", "workspace_strategy", "source_snapshot_identity", "code_identity", "harness_state_digest", "execution_backend_profile_digest", "provider_model_policy_digest", "capability_digest", "requested_mode", "created_at", "session_pin_digest"] as const;
const EVIDENCE_KEYS = ["schema_version", "run_id", "session_id", "authority_digest", "settled", "verification_mode", "formal_outcome", "comparison_eligible", "adaptation_eligible", "promotion_eligible", "credential_reads", "network_calls", "external_provider_calls", "real_model_calls", "docker_project_command_executions", "project_command_executions", "underlying_run_ref", "evidence_digest"] as const;
const EVIDENCE_G2_KEYS = [...EVIDENCE_KEYS.filter((key) => key !== "schema_version"), "schema_version", "workspace_identity_after"] as const;

interface StoredSessionV36 { schema_version: 1; title: string; pin: SessionPinV36 }

export interface InteractiveDispatchInputV36 {
	service: PersistentInteractiveSessionServiceV36;
	session_id: string;
	run_id: string;
	task_text: string;
	authority: InteractiveRunAuthorityV36;
	authority_path: string;
}

export type InteractiveDispatchV36 = (input: InteractiveDispatchInputV36) => Promise<PersistentInteractiveTurnResultV36>;

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
	if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} fields are invalid`);
}

function identifier(value: unknown, label: string): asserts value is string {
	if (typeof value !== "string" || !ID.test(value)) throw new Error(`${label} is invalid`);
}

function boundedText(value: unknown, label: string, maxBytes: number): asserts value is string {
	if (typeof value !== "string" || Buffer.byteLength(value, "utf8") === 0 || Buffer.byteLength(value, "utf8") > maxBytes) throw new Error(`${label} is invalid`);
}

function plainObject(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

export function parseBrowserTaskRequestV36(value: unknown): BrowserTaskRequestV36 {
	const input = plainObject(value, "browser task request");
	if (Object.keys(input).some((key) => !BROWSER_KEYS.includes(key as typeof BROWSER_KEYS[number]))) throw new Error("browser task request fields are invalid");
	for (const required of ["project_id", "requested_mode", "task_text"]) if (!(required in input)) throw new Error("browser task request fields are invalid");
	identifier(input.project_id, "project ID");
	if (input.requested_mode !== "inspect_only" && input.requested_mode !== "bounded_edit") throw new Error("requested mode is invalid");
	boundedText(input.task_text, "task text", 16_384);
	if (input.title !== undefined) boundedText(input.title, "task title", 512);
	if (input.session_id !== undefined) identifier(input.session_id, "Session ID");
	return {
		project_id: input.project_id,
		requested_mode: input.requested_mode,
		task_text: input.task_text,
		...(input.title === undefined ? {} : { title: input.title }),
		...(input.session_id === undefined ? {} : { session_id: input.session_id }),
	};
}

function generatedId(prefix: "session" | "run" | "workspace"): string {
	return `v36-${prefix}-${randomUUID()}`;
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

function sessionRoot(dataRoot: string, sessionId: string): string {
	identifier(sessionId, "Session ID");
	const parent = ordinaryDirectory(resolve(dataRoot, "sessions"), "V3.6 Sessions root");
	const target = resolve(parent, sessionId);
	if (!contained(dataRoot, target)) throw new Error("Session path escaped V3.6 data root");
	return target;
}

function runRoot(dataRoot: string, runId: string): string {
	identifier(runId, "Run ID");
	const parent = ordinaryDirectory(resolve(dataRoot, "interactive-evidence", "runs"), "V3.6 interactive Evidence root");
	const target = resolve(parent, runId);
	if (!contained(dataRoot, target)) throw new Error("Run path escaped V3.6 data root");
	return target;
}

function capabilityDigest(mode: InteractiveRequestedModeV36, goal2Enabled = false): string {
	return digestObject({
		mode,
		file_read: true,
		file_write: goal2Enabled && mode === "bounded_edit",
		planned_file_write: mode === "bounded_edit",
		project_commands: goal2Enabled && mode === "bounded_edit",
		docker_commands: goal2Enabled && mode === "bounded_edit",
		source_apply: goal2Enabled && mode === "bounded_edit",
	});
}

function parsePin(value: unknown): SessionPinV36 {
	const record = plainObject(value, "Session pin");
	exactKeys(record, PIN_KEYS, "Session pin");
	const pin = record as unknown as SessionPinV36;
	const body = { ...pin };
	delete (body as Partial<SessionPinV36>).session_pin_digest;
	if (pin.schema_version !== 1 || !ID.test(pin.session_id) || !ID.test(pin.project_id) || !ID.test(pin.workspace_id) || ![pin.project_profile_digest, pin.source_snapshot_identity, pin.code_identity, pin.harness_state_digest, pin.execution_backend_profile_digest, pin.provider_model_policy_digest, pin.capability_digest, pin.session_pin_digest].every((entry) => SHA256.test(entry)) || pin.workspace_strategy !== "managed_session_copy" || (pin.requested_mode !== "inspect_only" && pin.requested_mode !== "bounded_edit") || digestObject(body) !== pin.session_pin_digest) throw new Error("Session pin is invalid");
	return pin;
}

function readStoredSession(dataRoot: string, sessionId: string): StoredSessionV36 {
	const root = ordinaryDirectory(sessionRoot(dataRoot, sessionId), "V3.6 Session root");
	const value = readJsonArtifact<unknown>(root, "session.json");
	const stored = plainObject(value, "stored Session");
	exactKeys(stored, ["schema_version", "title", "pin"], "stored Session");
	if (stored.schema_version !== 1 || typeof stored.title !== "string") throw new Error("stored Session is invalid");
	return { schema_version: 1, title: stored.title, pin: parsePin(stored.pin) };
}

function authorityBody(authority: InteractiveRunAuthorityV36): Omit<InteractiveRunAuthorityV36, "authority_digest"> {
	const { authority_digest: _digest, ...body } = authority;
	return body;
}

export function validateInteractiveAuthorityV36(root: string, value: unknown): InteractiveRunAuthorityV36 {
	const record = plainObject(value, "Interactive Run Authority");
	exactKeys(record, AUTHORITY_KEYS, "Interactive Run Authority");
	const authority = record as unknown as InteractiveRunAuthorityV36;
	const authorityPairValid = (authority.command_execution_authority === "disabled_goal1" && authority.source_mutation_authority === "not_granted_goal1") || (authority.requested_mode === "bounded_edit" && authority.command_execution_authority === "docker_registered_only" && authority.source_mutation_authority === "host_handoff_only");
	if (authority.schema_version !== 1 || authority.authority_kind !== "v36_interactive_run" || authority.mode !== "interactive_agent" || !ID.test(authority.run_id) || !ID.test(authority.session_id) || !ID.test(authority.project_id) || !ID.test(authority.workspace_id) || (authority.requested_mode !== "inspect_only" && authority.requested_mode !== "bounded_edit") || authority.workspace_strategy !== "managed_session_copy" || ![authority.project_profile_digest, authority.task_prompt_sha256, authority.workspace_identity_before, authority.code_identity, authority.source_snapshot_identity, authority.harness_state_digest, authority.execution_backend_profile_digest, authority.provider_model_policy_digest, authority.capability_digest, authority.authority_digest].every((entry) => SHA256.test(entry)) || authority.verification_mode !== "unverified" || authority.formal_outcome !== null || authority.comparison_eligible !== false || authority.adaptation_eligible !== false || authority.promotion_eligible !== false || !authorityPairValid || digestObject(authorityBody(authority)) !== authority.authority_digest) throw new Error("Interactive Run Authority is invalid");
	const ref = writeReference(root, "authority.json");
	if (validateArtifactRef(root, ref).length > 0) throw new Error("Interactive Run Authority artifact is missing or invalid");
	return authority;
}

function validateInteractiveEvidenceV36(root: string, value: unknown, authority: InteractiveRunAuthorityV36): InteractiveRunEvidenceV36 {
	const record = plainObject(value, "Interactive Run Evidence");
	exactKeys(record, EVIDENCE_KEYS, "Interactive Run Evidence");
	const evidence = record as unknown as InteractiveRunEvidenceV36;
	const { evidence_digest: _digest, ...body } = evidence;
	if (evidence.schema_version !== 1 || evidence.run_id !== authority.run_id || evidence.session_id !== authority.session_id || evidence.authority_digest !== authority.authority_digest || evidence.settled !== true || evidence.verification_mode !== "unverified" || evidence.formal_outcome !== null || evidence.comparison_eligible !== false || evidence.adaptation_eligible !== false || evidence.promotion_eligible !== false || evidence.credential_reads !== 0 || evidence.network_calls !== 0 || evidence.external_provider_calls !== 0 || evidence.real_model_calls !== 0 || evidence.docker_project_command_executions !== 0 || evidence.project_command_executions !== 0 || evidence.underlying_run_ref !== `sessions/${authority.session_id}/runtime/runs/${authority.run_id}/manifest.json` || !SHA256.test(evidence.evidence_digest) || digestObject(body) !== evidence.evidence_digest) throw new Error("Interactive Run Evidence is invalid");
	const ref = writeReference(root, "result.json");
	if (validateArtifactRef(root, ref).length > 0) throw new Error("Interactive Run Evidence artifact is missing or invalid");
	return evidence;
}

function validateInteractiveEvidenceG2V36(root: string, value: unknown, authority: InteractiveRunAuthorityV36): InteractiveRunEvidenceV36G2 {
	const record = plainObject(value, "Interactive Run Evidence");
	exactKeys(record, EVIDENCE_G2_KEYS, "Interactive Run Evidence");
	const evidence = record as unknown as InteractiveRunEvidenceV36G2;
	const { evidence_digest: _digest, ...body } = evidence;
	if (evidence.schema_version !== 2 || evidence.run_id !== authority.run_id || evidence.session_id !== authority.session_id || evidence.authority_digest !== authority.authority_digest || evidence.settled !== true || evidence.verification_mode !== "unverified" || evidence.formal_outcome !== null || evidence.comparison_eligible !== false || evidence.adaptation_eligible !== false || evidence.promotion_eligible !== false || ![evidence.credential_reads, evidence.network_calls, evidence.external_provider_calls, evidence.real_model_calls, evidence.docker_project_command_executions, evidence.project_command_executions].every((entry) => Number.isSafeInteger(entry) && entry >= 0) || evidence.docker_project_command_executions !== evidence.project_command_executions || !SHA256.test(evidence.workspace_identity_after) || evidence.underlying_run_ref !== `sessions/${authority.session_id}/runtime/runs/${authority.run_id}/manifest.json` || !SHA256.test(evidence.evidence_digest) || digestObject(body) !== evidence.evidence_digest) throw new Error("Interactive Goal 2 Run Evidence is invalid");
	if (validateArtifactRef(root, writeReference(root, "result.json")).length > 0) throw new Error("Interactive Run Evidence artifact is missing or invalid");
	return evidence;
}

function writeReference(root: string, path: string) {
	const target = resolve(root, path);
	const stats = lstatSync(target);
	return { path, sha256: sha256(readFileSync(target)), size_bytes: stats.size, media_type: "application/json", truncated: false };
}

function makeService(dataRoot: string, stored: StoredSessionV36): PersistentInteractiveSessionServiceV36 {
	const root = sessionRoot(dataRoot, stored.pin.session_id);
	return new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(root, "runtime"), projectId: stored.pin.project_id, workspaceRoot: resolve(root, "workspace"), workspaceId: stored.pin.workspace_id, sessionId: stored.pin.session_id, title: stored.title, sessionPinDigest: stored.pin.session_pin_digest });
}

function assertProfilePin(profile: ResolvedProjectProfileV36, pin: SessionPinV36, goal2Enabled = false): void {
	if (profile.profile_digest !== pin.project_profile_digest || profile.execution_backend_profile_digest !== pin.execution_backend_profile_digest || profile.provider_model_policy_digest !== pin.provider_model_policy_digest || capabilityDigest(pin.requested_mode, goal2Enabled) !== pin.capability_digest) throw new Error("continued Session Project/Profile/Backend/Provider/Capability drift rejected");
	if (goal2Enabled && pin.requested_mode === "bounded_edit" && (profile.registration.execution_backend_profile_id !== "docker-v36g2-frozen" || pin.execution_backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest || (profile.registration.command_descriptors?.length ?? 0) === 0)) throw new Error("bounded-edit Session requires the exact frozen Docker command profile");
}

export class InteractiveControlPlaneV36 {
	private readonly dataRoot: string;
	private readonly registry: ProjectProfileRegistryV36;
	private readonly dispatch: InteractiveDispatchV36;
	private readonly goal2Enabled: boolean;

	constructor(options: { dataRoot: string; registry: ProjectProfileRegistryV36; dispatch?: InteractiveDispatchV36; goal2Enabled?: boolean }) {
		this.dataRoot = ordinaryDirectory(options.dataRoot, "V3.6 data root", true);
		this.registry = options.registry;
		this.dispatch = options.dispatch ?? (async (input) => await input.service.executeTurn({ sessionId: input.session_id, runId: input.run_id, prompt: input.task_text }));
		this.goal2Enabled = options.goal2Enabled === true;
		mkdirSync(resolve(this.dataRoot, "sessions"), { recursive: true });
		mkdirSync(resolve(this.dataRoot, "interactive-evidence", "runs"), { recursive: true });
	}

	projects() { return this.registry.list(); }

	private async createSession(profile: ResolvedProjectProfileV36, input: BrowserTaskRequestV36): Promise<StoredSessionV36> {
		if (!profile.registration.supported_modes.includes(input.requested_mode)) throw new Error("requested mode is not supported by the registered Project Profile");
		if (this.goal2Enabled && input.requested_mode === "bounded_edit" && (profile.registration.execution_backend_profile_id !== "docker-v36g2-frozen" || profile.execution_backend_profile_digest !== FROZEN_DOCKER_PROFILE_V36.profile_digest || (profile.registration.command_descriptors?.length ?? 0) === 0)) throw new Error("bounded-edit Session requires the exact frozen Docker command profile");
		const sessionId = generatedId("session");
		const workspaceId = generatedId("workspace");
		const root = sessionRoot(this.dataRoot, sessionId);
		mkdirSync(root, { recursive: false });
		const copied = createManagedSessionCopyV36({ sourceRoot: profile.canonical_source_root, targetRoot: resolve(root, "workspace") });
		persistInitialInventoryV36(root, resolve(root, "workspace"));
		const state = profile.registration.current_state();
		const pinBody: Omit<SessionPinV36, "session_pin_digest"> = {
			schema_version: 1,
			session_id: sessionId,
			project_id: input.project_id,
			project_profile_digest: profile.profile_digest,
			workspace_id: workspaceId,
			workspace_strategy: "managed_session_copy",
			source_snapshot_identity: copied.source_snapshot_identity,
			code_identity: copied.code_identity,
			harness_state_digest: state.state_digest,
			execution_backend_profile_digest: profile.execution_backend_profile_digest,
			provider_model_policy_digest: profile.provider_model_policy_digest,
			capability_digest: capabilityDigest(input.requested_mode, this.goal2Enabled),
			requested_mode: input.requested_mode,
			created_at: new Date().toISOString(),
		};
		const pin: SessionPinV36 = { ...pinBody, session_pin_digest: digestObject(pinBody) };
		const title = input.title ?? Buffer.from(input.task_text, "utf8").subarray(0, 120).toString("utf8");
		mkdirSync(resolve(root, "runtime"), { recursive: false });
		const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(root, "runtime"), projectId: input.project_id, workspaceRoot: resolve(root, "workspace"), workspaceId, sessionId, title, sessionPinDigest: pin.session_pin_digest });
		await service.create();
		writeOnceJson(root, "session.json", { schema_version: 1, title, pin });
		return { schema_version: 1, title, pin };
	}

	async submit(value: unknown): Promise<SafeInteractiveSessionV36> {
		const input = parseBrowserTaskRequestV36(value);
		const profile = this.registry.resolve(input.project_id);
		let stored: StoredSessionV36;
		if (input.session_id === undefined) {
			stored = await this.createSession(profile, input);
		} else {
			stored = readStoredSession(this.dataRoot, input.session_id);
			assertSessionContinuationAllowedV36(sessionRoot(this.dataRoot, input.session_id));
			if (stored.pin.project_id !== input.project_id || stored.pin.requested_mode !== input.requested_mode) throw new Error("continued Session browser identity drift rejected");
			assertProfilePin(profile, stored.pin, this.goal2Enabled);
		}
		const service = makeService(this.dataRoot, stored);
		const workspaceRoot = resolve(sessionRoot(this.dataRoot, stored.pin.session_id), "workspace");
		const beforeIdentity = managedWorkspaceIdentityV36(workspaceRoot);
		if (this.goal2Enabled && stored.pin.requested_mode === "bounded_edit") assertManagedWorkspaceHeadV36(sessionRoot(this.dataRoot, stored.pin.session_id), beforeIdentity);
		else if (beforeIdentity !== stored.pin.code_identity) throw new Error("continued Session managed Workspace/code drift rejected");
		const runId = generatedId("run");
		const root = runRoot(this.dataRoot, runId);
		mkdirSync(root, { recursive: false });
		const authorityWithoutDigest: Omit<InteractiveRunAuthorityV36, "authority_digest"> = {
			schema_version: 1,
			authority_kind: "v36_interactive_run",
			mode: "interactive_agent",
			run_id: runId,
			session_id: stored.pin.session_id,
			project_id: stored.pin.project_id,
			project_profile_digest: stored.pin.project_profile_digest,
			requested_mode: stored.pin.requested_mode,
			task_prompt_sha256: sha256(input.task_text),
			workspace_id: stored.pin.workspace_id,
			workspace_strategy: "managed_session_copy",
			workspace_identity_before: beforeIdentity,
			code_identity: stored.pin.code_identity,
			source_snapshot_identity: stored.pin.source_snapshot_identity,
			harness_state_digest: stored.pin.harness_state_digest,
			execution_backend_profile_digest: stored.pin.execution_backend_profile_digest,
			provider_model_policy_digest: stored.pin.provider_model_policy_digest,
			capability_digest: stored.pin.capability_digest,
			verification_mode: "unverified",
			formal_outcome: null,
			comparison_eligible: false,
			adaptation_eligible: false,
			promotion_eligible: false,
			command_execution_authority: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit" ? "docker_registered_only" : "disabled_goal1",
			source_mutation_authority: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit" ? "host_handoff_only" : "not_granted_goal1",
			created_at: new Date().toISOString(),
		};
		const authority: InteractiveRunAuthorityV36 = { ...authorityWithoutDigest, authority_digest: digestObject(authorityWithoutDigest) };
		const authorityRef = writeOnceJson(root, "authority.json", authority);
		const validated = validateInteractiveAuthorityV36(root, readJsonArtifact(root, authorityRef.path));
		const result = await this.dispatch({ service, session_id: stored.pin.session_id, run_id: runId, task_text: input.task_text, authority: validated, authority_path: resolve(root, authorityRef.path) });
		if (result.manifest.run_id !== runId || result.manifest.session_id !== stored.pin.session_id) throw new Error("interactive dispatch evidence identity is invalid");
		const afterIdentity = managedWorkspaceIdentityV36(workspaceRoot);
		const goal2Run = this.goal2Enabled && stored.pin.requested_mode === "bounded_edit" && result.manifest.mode === "v36_interactive_bounded_edit";
		if (!goal2Run) {
			if (result.manifest.credential_reads !== 0 || result.manifest.network_calls !== 0 || result.manifest.external_provider_calls !== 0 || result.manifest.real_model_calls !== 0 || afterIdentity !== stored.pin.code_identity) throw new Error("Goal 1 deterministic dispatch evidence is invalid");
			const evidenceWithoutDigest: Omit<InteractiveRunEvidenceV36, "evidence_digest"> = { schema_version: 1, run_id: runId, session_id: stored.pin.session_id, authority_digest: authority.authority_digest, settled: true, verification_mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false, credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, docker_project_command_executions: 0, project_command_executions: 0, underlying_run_ref: `sessions/${stored.pin.session_id}/runtime/runs/${runId}/manifest.json` };
			writeOnceJson(root, "result.json", { ...evidenceWithoutDigest, evidence_digest: digestObject(evidenceWithoutDigest) } satisfies InteractiveRunEvidenceV36);
		} else {
			if (result.manifest.docker_project_command_executions < 1 || result.manifest.project_command_executions !== result.manifest.docker_project_command_executions) throw new Error("Goal 2 Docker command evidence is invalid");
			const evidenceWithoutDigest: Omit<InteractiveRunEvidenceV36G2, "evidence_digest"> = { schema_version: 2, run_id: runId, session_id: stored.pin.session_id, authority_digest: authority.authority_digest, settled: true, verification_mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false, credential_reads: result.manifest.credential_reads, network_calls: result.manifest.network_calls, external_provider_calls: result.manifest.external_provider_calls, real_model_calls: result.manifest.real_model_calls, docker_project_command_executions: result.manifest.docker_project_command_executions, project_command_executions: result.manifest.project_command_executions, workspace_identity_after: afterIdentity, underlying_run_ref: `sessions/${stored.pin.session_id}/runtime/runs/${runId}/manifest.json` };
			writeOnceJson(root, "result.json", { ...evidenceWithoutDigest, evidence_digest: digestObject(evidenceWithoutDigest) } satisfies InteractiveRunEvidenceV36G2);
		}
		return await this.session(stored.pin.session_id);
	}

	async startSessionFromUpdatedSource(previousSessionId: string): Promise<SafeInteractiveSessionV36> {
		identifier(previousSessionId, "previous Session ID");
		const previous = readStoredSession(this.dataRoot, previousSessionId);
		const profile = this.registry.resolve(previous.pin.project_id);
		assertProfilePin(profile, previous.pin, this.goal2Enabled);
		if (!validateSuccessfulApplyMarkerV36(sessionRoot(this.dataRoot, previousSessionId), previousSessionId)) throw new Error("previous Session has no successful Apply");
		const created = await this.createSession(profile, {
			project_id: previous.pin.project_id,
			requested_mode: previous.pin.requested_mode,
			task_text: "Start a new Session from the updated registered Source.",
			title: `Updated Source · ${previous.title}`.slice(0, 500),
		});
		if (created.pin.session_id === previousSessionId || created.pin.source_snapshot_identity === previous.pin.source_snapshot_identity) throw new Error("new Session did not pin the updated Source identity");
		return await this.session(created.pin.session_id);
	}

	async session(sessionId: string): Promise<SafeInteractiveSessionV36> {
		const stored = readStoredSession(this.dataRoot, sessionId);
		const profile = this.registry.resolve(stored.pin.project_id);
		assertProfilePin(profile, stored.pin, this.goal2Enabled);
		const persistent = await makeService(this.dataRoot, stored).inspect();
		const runs: SafeInteractiveRunV36[] = [];
		for (const persistentRun of persistent.runs) {
			const root = runRoot(this.dataRoot, persistentRun.run_id);
			if (!existsSync(resolve(root, "authority.json")) || !existsSync(resolve(root, "result.json"))) throw new Error("Interactive Run Authority or Evidence artifact is missing");
			const authority = validateInteractiveAuthorityV36(root, readJsonArtifact(root, "authority.json"));
			if (authority.session_id !== sessionId) throw new Error("Interactive Run Authority Session identity is invalid");
			const evidenceValue = readJsonArtifact<Record<string, unknown>>(root, "result.json");
			if (evidenceValue.schema_version === 2) validateInteractiveEvidenceG2V36(root, evidenceValue, authority); else validateInteractiveEvidenceV36(root, evidenceValue, authority);
			runs.push({ run_id: authority.run_id, authority_digest: authority.authority_digest, settled: true, verification_mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false, command_execution: authority.command_execution_authority === "docker_registered_only" ? "docker_registered_only" : "disabled_goal1" });
		}
		return {
			schema_version: 1,
			session_id: stored.pin.session_id,
			project_id: stored.pin.project_id,
			title: stored.title,
			requested_mode: stored.pin.requested_mode,
			workspace_id: stored.pin.workspace_id,
			workspace_strategy: "managed_session_copy",
			pins: {
				project_profile_digest: stored.pin.project_profile_digest,
				source_snapshot_identity: stored.pin.source_snapshot_identity,
				code_identity: stored.pin.code_identity,
				harness_state_digest: stored.pin.harness_state_digest,
				execution_backend_profile_digest: stored.pin.execution_backend_profile_digest,
				provider_model_policy_digest: stored.pin.provider_model_policy_digest,
				capability_digest: stored.pin.capability_digest,
				session_pin_digest: stored.pin.session_pin_digest,
			},
			capabilities: { file_read: true, file_write: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit", planned_file_write: stored.pin.requested_mode === "bounded_edit", project_commands: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit", docker_commands: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit", source_apply: this.goal2Enabled && stored.pin.requested_mode === "bounded_edit" },
			verification: { mode: "unverified", formal_outcome: null, comparison_eligible: false, adaptation_eligible: false, promotion_eligible: false },
			pi_native_skills: structuredClone(profile.registration.pi_native_skills),
			harness_adaptations: structuredClone(profile.registration.harness_adaptations),
			runs,
			persistent_session: persistent,
			read_only: true,
		};
	}

	async sessions(): Promise<SafeInteractiveSessionV36[]> {
		const root = resolve(this.dataRoot, "sessions");
		const views = [];
		for (const entry of readdirSync(root, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) if (entry.isDirectory() && ID.test(entry.name)) views.push(await this.session(entry.name));
		return views;
	}

	workspaceTree(sessionId: string) {
		const stored = readStoredSession(this.dataRoot, sessionId);
		return workspaceTreePreviewV36({ workspaceRoot: resolve(sessionRoot(this.dataRoot, sessionId), "workspace"), sessionId, workspaceId: stored.pin.workspace_id });
	}

	workspaceFile(sessionId: string, path: string) {
		const stored = readStoredSession(this.dataRoot, sessionId);
		return workspaceTextPreviewV36({ workspaceRoot: resolve(sessionRoot(this.dataRoot, sessionId), "workspace"), sessionId, workspaceId: stored.pin.workspace_id, path });
	}

	hostChangeSetContext(sessionId: string, runId: string): ChangeSetHostContextV36 {
		const stored = readStoredSession(this.dataRoot, sessionId);
		const profile = this.registry.resolve(stored.pin.project_id);
		assertProfilePin(profile, stored.pin, this.goal2Enabled);
		if (!ID.test(runId)) throw new Error("Run ID is invalid");
		return {
			project_id: stored.pin.project_id,
			session_id: stored.pin.session_id,
			run_id: runId,
			project_profile_digest: stored.pin.project_profile_digest,
			source_snapshot_identity: stored.pin.source_snapshot_identity,
			session_root: sessionRoot(this.dataRoot, sessionId),
			workspace_root: resolve(sessionRoot(this.dataRoot, sessionId), "workspace"),
			source_root: profile.canonical_source_root,
			writable_paths: profile.registration.writable_paths,
			protected_paths: profile.registration.protected_paths,
		};
	}
}
