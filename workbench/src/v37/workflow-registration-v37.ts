import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { LoadedRegisteredCaseV37, PrimaryRunBindingV37, TaskInstanceV37, WorkflowRegistrationV37 } from "../contracts/v37-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";
import { V37_CONFIGURATION_BASELINE_ID, V37_LOADER_CONTRACT_ID, deriveRegistryTrustRootDigestV37, loadRegisteredCaseFromHostRegistryV37 } from "./host-registry-v37.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function projectRelativeRoot(projectRoot: string, path: string, create: boolean): string {
	if (typeof path !== "string" || path.length === 0 || isAbsolute(path) || path.replaceAll("\\", "/").split("/").includes("..") || path.includes("\0")) throw new Error("V3.7 data root must be project-relative");
	const root = resolve(projectRoot);
	const target = resolve(root, path);
	if (!contained(root, target)) throw new Error("V3.7 data root escapes project root");
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) break;
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error("V3.7 data root contains a symlink or junction");
		if (!stats.isDirectory()) throw new Error("V3.7 data root ancestor is not a directory");
	}
	if (!existsSync(target)) {
		if (!create) throw new Error("V3.7 data root is missing");
		mkdirSync(target, { recursive: true });
	}
	const stats = lstatSync(target);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("V3.7 data root must be an ordinary directory");
	if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error("V3.7 data root real path escapes project root");
	return target;
}

function ordinaryJson<T>(path: string, label: string): T {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function ordinaryJsonUnder<T>(root: string, path: string, label: string): T {
	if (!contained(root, path)) throw new Error(`${label} escapes its Host-owned authority root`);
	let cursor = root;
	for (const segment of relative(root, path).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		if (cursor !== path && !stats.isDirectory()) throw new Error(`${label} ancestor is not an ordinary directory`);
	}
	return ordinaryJson<T>(path, label);
}

function workflowBody(value: WorkflowRegistrationV37): Omit<WorkflowRegistrationV37, "workflow_registration_digest"> {
	const { workflow_registration_digest: _digest, ...body } = value;
	return body;
}

function taskBody(value: TaskInstanceV37): Omit<TaskInstanceV37, "task_instance_digest"> {
	const { task_instance_digest: _digest, ...body } = value;
	return body;
}

function primaryRunBindingBody(value: PrimaryRunBindingV37): Omit<PrimaryRunBindingV37, "primary_run_binding_digest"> {
	const { primary_run_binding_digest: _digest, ...body } = value;
	return body;
}

function normalizedProjectLocation(projectRoot: string, path: string, label: string): string {
	if (typeof path !== "string" || path.length === 0 || path.includes("\0")) throw new Error(`${label} is invalid`);
	const root = resolve(projectRoot);
	const target = resolve(root, path);
	if (!contained(root, target) || target === root) throw new Error(`${label} must be inside the Host project root`);
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) break;
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} contains a symlink or junction`);
		if (cursor !== target && !stats.isDirectory()) throw new Error(`${label} ancestor is not a directory`);
	}
	if (existsSync(target)) {
		const stats = lstatSync(target);
		if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error(`${label} must be an ordinary directory`);
		if (!contained(realpathSync.native(root), realpathSync.native(target))) throw new Error(`${label} real path escapes the Host project root`);
	}
	return relative(root, target).split(sep).join("/");
}

function validateWorkflow(value: WorkflowRegistrationV37): WorkflowRegistrationV37 {
	const keys = ["schema_version", "kind", "workflow_id", "case_id", "manifest_version", "project_id", "created_at", "manifest_body_digest", "registration_digest", "registry_trust_root_digest", "source_baseline_digest", "state_store_scope_digest", "provider_profile_digest", "tool_profile_digest", "command_profile_digest", "budget_profile_digest", "stop_condition_profile_digest", "runtime_base_prompt_digest", "workflow_registration_digest"];
	if (!value || typeof value !== "object" || Array.isArray(value) || stableJson(Object.keys(value).sort()) !== stableJson(keys.sort())) throw new Error("workflow registration exact-key validation failed");
	if (value.schema_version !== 1 || value.kind !== "v37_workflow_registration" || !ID.test(value.workflow_id) || !ID.test(value.case_id) || !ID.test(value.project_id) || !Number.isSafeInteger(value.manifest_version) || Number.isNaN(Date.parse(value.created_at)) || [value.manifest_body_digest, value.registration_digest, value.registry_trust_root_digest, value.source_baseline_digest, value.state_store_scope_digest, value.provider_profile_digest, value.tool_profile_digest, value.command_profile_digest, value.budget_profile_digest, value.stop_condition_profile_digest, value.runtime_base_prompt_digest, value.workflow_registration_digest].some((digest) => !SHA256.test(digest)) || digestObject(workflowBody(value)) !== value.workflow_registration_digest) throw new Error("workflow registration identity/digest invalid");
	return structuredClone(value);
}

function validateTask(value: TaskInstanceV37, workflow: WorkflowRegistrationV37, role: TaskInstanceV37["role"]): TaskInstanceV37 {
	const keys = ["schema_version", "kind", "workflow_id", "workflow_registration_digest", "role", "task_spec_digest", "task_instance_digest"];
	if (!value || typeof value !== "object" || Array.isArray(value) || stableJson(Object.keys(value).sort()) !== stableJson(keys.sort())) throw new Error("task instance exact-key validation failed");
	if (value.schema_version !== 1 || value.kind !== "v37_task_instance" || value.workflow_id !== workflow.workflow_id || value.workflow_registration_digest !== workflow.workflow_registration_digest || value.role !== role || !SHA256.test(value.task_spec_digest) || !SHA256.test(value.task_instance_digest) || digestObject(taskBody(value)) !== value.task_instance_digest) throw new Error("task instance identity/digest invalid");
	return structuredClone(value);
}

function primaryRunAuthority(projectRoot: string, loaded: LoadedRegisteredCaseV37, create: boolean): { authorityId: string; authorityLocation: string; authorityRoot: string } {
	const identity = {
		configuration_baseline_id: V37_CONFIGURATION_BASELINE_ID,
		loader_contract_id: V37_LOADER_CONTRACT_ID,
		loader_contract_fingerprint: loaded.loader_contract_fingerprint,
		case_id: loaded.manifest.case_id,
		manifest_version: loaded.manifest.manifest_version,
		manifest_body_digest: loaded.manifest.manifest_body_digest,
	};
	const authorityId = `v37-primary-run-authority-${digestObject(identity).slice(0, 32)}`;
	const authorityLocation = `.runs/v37/host-authority/${V37_CONFIGURATION_BASELINE_ID}/${loaded.manifest.case_id}/${loaded.manifest.manifest_body_digest}/${loaded.loader_contract_fingerprint}`;
	return { authorityId, authorityLocation, authorityRoot: projectRelativeRoot(projectRoot, authorityLocation, create) };
}

function validatePrimaryRunBinding(value: PrimaryRunBindingV37, workflow: WorkflowRegistrationV37, primary: TaskInstanceV37, authority: ReturnType<typeof primaryRunAuthority>): PrimaryRunBindingV37 {
	const keys = ["schema_version", "kind", "binding_authority_id", "binding_authority_location", "workflow_id", "workflow_registration_digest", "primary_task_instance_digest", "primary_run_id", "primary_run_root_location", "bound_at", "primary_run_binding_digest"];
	if (!value || typeof value !== "object" || Array.isArray(value) || stableJson(Object.keys(value).sort()) !== stableJson(keys.sort())) throw new Error("Primary Run binding exact-key validation failed");
	if (value.schema_version !== 1 || value.kind !== "v37_primary_run_binding" || value.binding_authority_id !== authority.authorityId || value.binding_authority_location !== authority.authorityLocation || value.workflow_id !== workflow.workflow_id || value.workflow_registration_digest !== workflow.workflow_registration_digest || value.primary_task_instance_digest !== primary.task_instance_digest || !ID.test(value.primary_run_id) || typeof value.primary_run_root_location !== "string" || value.primary_run_root_location.length === 0 || isAbsolute(value.primary_run_root_location) || value.primary_run_root_location.replaceAll("\\", "/").split("/").includes("..") || Number.isNaN(Date.parse(value.bound_at)) || !SHA256.test(value.primary_run_binding_digest) || digestObject(primaryRunBindingBody(value)) !== value.primary_run_binding_digest) throw new Error("Primary Run binding identity/digest invalid");
	return structuredClone(value);
}

function deriveWorkflow(loaded: LoadedRegisteredCaseV37, workflowId: string, createdAt: string): WorkflowRegistrationV37 {
	const manifest = loaded.manifest;
	const body: Omit<WorkflowRegistrationV37, "workflow_registration_digest"> = {
		schema_version: 1,
		kind: "v37_workflow_registration",
		workflow_id: workflowId,
		case_id: manifest.case_id,
		manifest_version: manifest.manifest_version,
		project_id: manifest.project_id,
		created_at: createdAt,
		manifest_body_digest: manifest.manifest_body_digest,
		registration_digest: loaded.current_envelope.registration_digest,
		registry_trust_root_digest: loaded.registry_trust_root_digest,
		source_baseline_digest: manifest.source_baseline_spec.spec_digest,
		state_store_scope_digest: manifest.state_store_scope_spec.state_store_scope_digest,
		provider_profile_digest: manifest.provider_profile_spec.spec_digest,
		tool_profile_digest: manifest.tool_profile_spec.spec_digest,
		command_profile_digest: manifest.command_profile_spec.spec_digest,
		budget_profile_digest: manifest.budget_profile_spec.spec_digest,
		stop_condition_profile_digest: manifest.stop_condition_profile_spec.spec_digest,
		runtime_base_prompt_digest: manifest.state_store_scope_spec.runtime_base_prompt_digest,
	};
	return { ...body, workflow_registration_digest: digestObject(body) };
}

function deriveTask(workflow: WorkflowRegistrationV37, role: TaskInstanceV37["role"], taskSpecDigest: string): TaskInstanceV37 {
	const body: Omit<TaskInstanceV37, "task_instance_digest"> = { schema_version: 1, kind: "v37_task_instance", workflow_id: workflow.workflow_id, workflow_registration_digest: workflow.workflow_registration_digest, role, task_spec_digest: taskSpecDigest };
	return { ...body, task_instance_digest: digestObject(body) };
}

export function createWorkflowRegistrationV37(options: { projectRoot: string; dataRoot: string; caseId: string; workflowId: string; createdAt: string }): { workflow: WorkflowRegistrationV37; primary: TaskInstanceV37; follow_up: TaskInstanceV37 } {
	if (!ID.test(options.workflowId) || Number.isNaN(Date.parse(options.createdAt))) throw new Error("workflow ID/timestamp invalid");
	const loaded = loadRegisteredCaseFromHostRegistryV37({ projectRoot: options.projectRoot, caseId: options.caseId });
	const root = projectRelativeRoot(options.projectRoot, options.dataRoot, true);
	const workflow = deriveWorkflow(loaded, options.workflowId, options.createdAt);
	const primary = deriveTask(workflow, "primary", loaded.manifest.primary_task_spec.spec_digest);
	const followUp = deriveTask(workflow, "follow_up", loaded.manifest.follow_up_task_spec.spec_digest);
	writeOnceJson(root, `workflows/${workflow.workflow_id}/registration.json`, workflow);
	writeOnceJson(root, `workflows/${workflow.workflow_id}/tasks/primary.json`, primary);
	writeOnceJson(root, `workflows/${workflow.workflow_id}/tasks/follow_up.json`, followUp);
	return { workflow, primary, follow_up: followUp };
}

export function loadWorkflowRegistrationV37(options: { projectRoot: string; dataRoot: string; workflowId: string; allowHistoricalReadOnly?: boolean }): { loadedCase: LoadedRegisteredCaseV37; workflow: WorkflowRegistrationV37; primary: TaskInstanceV37; follow_up: TaskInstanceV37 } {
	if (!ID.test(options.workflowId)) throw new Error("workflow ID invalid");
	const root = projectRelativeRoot(options.projectRoot, options.dataRoot, false);
	const workflowRoot = resolve(root, "workflows", options.workflowId);
	if (!contained(root, workflowRoot)) throw new Error("workflow path escapes V3.7 data root");
	let cursor = root;
	for (const segment of relative(root, workflowRoot).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("workflow path contains a link/reparse or non-directory");
	}
	const workflow = validateWorkflow(ordinaryJson(resolve(workflowRoot, "registration.json"), "workflow registration"));
	if (workflow.workflow_id !== options.workflowId) throw new Error("workflow path/identity mismatch");
	const loadedCase = loadRegisteredCaseFromHostRegistryV37({ projectRoot: options.projectRoot, caseId: workflow.case_id, allowDisabledHistorical: options.allowHistoricalReadOnly });
	const pinnedEnvelope = loadedCase.envelopes.find((envelope) => envelope.registration_digest === workflow.registration_digest);
	if (!pinnedEnvelope || pinnedEnvelope.registration_status !== "accepted") throw new Error("workflow pinned registration is not an accepted Host envelope");
	if (!options.allowHistoricalReadOnly && loadedCase.current_envelope.registration_digest !== workflow.registration_digest) throw new Error("workflow registration is no longer current");
	const pinnedEnvelopeCount = loadedCase.envelopes.indexOf(pinnedEnvelope) + 1;
	const historicalTrustRootDigest = deriveRegistryTrustRootDigestV37(loadedCase, pinnedEnvelopeCount);
	const expected = deriveWorkflow({ ...loadedCase, current_envelope: pinnedEnvelope, registry_trust_root_digest: historicalTrustRootDigest }, workflow.workflow_id, workflow.created_at);
	if (stableJson(expected) !== stableJson(workflow)) throw new Error("workflow registration recomputation mismatch");
	const primary = validateTask(ordinaryJson(resolve(workflowRoot, "tasks/primary.json"), "primary task instance"), workflow, "primary");
	const followUp = validateTask(ordinaryJson(resolve(workflowRoot, "tasks/follow_up.json"), "follow-up task instance"), workflow, "follow_up");
	if (primary.task_spec_digest !== loadedCase.manifest.primary_task_spec.spec_digest || followUp.task_spec_digest !== loadedCase.manifest.follow_up_task_spec.spec_digest) throw new Error("task instance/Manifest mismatch");
	return { loadedCase, workflow, primary, follow_up: followUp };
}

export function bindPrimaryRunV37(options: { projectRoot: string; dataRoot: string; workflowId: string; runId: string; runRoot: string; boundAt: string }): PrimaryRunBindingV37 {
	if (!ID.test(options.runId) || Number.isNaN(Date.parse(options.boundAt))) throw new Error("Primary Run binding ID/timestamp invalid");
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const authority = primaryRunAuthority(options.projectRoot, registered.loadedCase, true);
	const body: Omit<PrimaryRunBindingV37, "primary_run_binding_digest"> = {
		schema_version: 1,
		kind: "v37_primary_run_binding",
		binding_authority_id: authority.authorityId,
		binding_authority_location: authority.authorityLocation,
		workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		primary_task_instance_digest: registered.primary.task_instance_digest,
		primary_run_id: options.runId,
		primary_run_root_location: normalizedProjectLocation(options.projectRoot, options.runRoot, "Primary Run root"),
		bound_at: options.boundAt,
	};
	const binding = { ...body, primary_run_binding_digest: digestObject(body) };
	const root = projectRelativeRoot(options.projectRoot, options.dataRoot, false);
	const rootIdentity = digestObject({ primary_run_root_location: binding.primary_run_root_location });
	const targets = [
		{ root: authority.authorityRoot, relativePath: `by-run-id/${binding.primary_run_id}.json`, path: resolve(authority.authorityRoot, "by-run-id", `${binding.primary_run_id}.json`), label: "Host-global Primary Run ID" },
		{ root: authority.authorityRoot, relativePath: `by-run-root/${rootIdentity}.json`, path: resolve(authority.authorityRoot, "by-run-root", `${rootIdentity}.json`), label: "Host-global Primary Run root" },
		{ root, relativePath: `workflows/${options.workflowId}/execution/primary-run-binding.json`, path: resolve(root, "workflows", options.workflowId, "execution", "primary-run-binding.json"), label: "workflow Primary Run" },
	] as const;
	for (const target of targets) {
		if (existsSync(target.path) && stableJson(ordinaryJsonUnder<PrimaryRunBindingV37>(target.root, target.path, `${target.label} binding`)) !== stableJson(binding)) throw new Error(`${target.label} is already bound to another workflow`);
	}
	const existingCount = targets.filter((target) => existsSync(target.path)).length;
	if (existingCount === targets.length) return binding;
	if (existingCount !== 0) throw new Error("Primary Run binding persistence is incomplete");
	if (existsSync(resolve(options.projectRoot, binding.primary_run_root_location))) throw new Error("Primary Run must be bound before its Run root is created");
	for (const target of targets) writeOnceJson(target.root, target.relativePath, binding);
	return binding;
}

export function loadPrimaryRunBindingV37(options: { projectRoot: string; dataRoot: string; workflowId: string; runRoot: string; allowHistoricalReadOnly?: boolean }): PrimaryRunBindingV37 {
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, allowHistoricalReadOnly: options.allowHistoricalReadOnly });
	const authority = primaryRunAuthority(options.projectRoot, registered.loadedCase, false);
	const root = projectRelativeRoot(options.projectRoot, options.dataRoot, false);
	const path = resolve(root, "workflows", options.workflowId, "execution", "primary-run-binding.json");
	const binding = validatePrimaryRunBinding(ordinaryJsonUnder(root, path, "Primary Run binding"), registered.workflow, registered.primary, authority);
	const actualLocation = normalizedProjectLocation(options.projectRoot, options.runRoot, "Primary Run root");
	if (binding.primary_run_root_location !== actualLocation) throw new Error("Primary Run binding root mismatch");
	const rootIdentity = digestObject({ primary_run_root_location: binding.primary_run_root_location });
	const byId = ordinaryJsonUnder<PrimaryRunBindingV37>(authority.authorityRoot, resolve(authority.authorityRoot, "by-run-id", `${binding.primary_run_id}.json`), "Host-global Primary Run ID binding");
	const byRoot = ordinaryJsonUnder<PrimaryRunBindingV37>(authority.authorityRoot, resolve(authority.authorityRoot, "by-run-root", `${rootIdentity}.json`), "Host-global Primary Run root binding");
	if (stableJson(byId) !== stableJson(binding) || stableJson(byRoot) !== stableJson(binding)) throw new Error("Primary Run global binding mismatch");
	return binding;
}

export function v37DataRootPath(projectRoot: string, dataRoot: string): string {
	return projectRelativeRoot(projectRoot, dataRoot, false);
}
