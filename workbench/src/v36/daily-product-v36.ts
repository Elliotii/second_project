import { lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { HarnessAdaptationDescriptorV36, ProjectSkillDescriptorV36 } from "../contracts/v36-types.ts";
import { DockerRegisteredCommandExecutorV36 } from "../execution/docker-v36.ts";
import { sha256, stableJson } from "../hash.ts";
import { ProjectProfileRegistryV36 } from "../project/registry-v36.ts";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { PersistentSessionServiceV35 } from "../session/persistent-session-v35.ts";
import type { PostV35RealModelFactory } from "../session/real-smoke-turn-v35.ts";
import { createPostV35DeepSeekModelFactory } from "../session/real-smoke-turn-v35.ts";
import type { CommandDescriptor } from "../types.ts";
import { Goal3WorkbenchApplicationV35 } from "../webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../webui/application-v36g1.ts";
import { Goal2WorkbenchExtensionV36 } from "../webui/application-v36g2.ts";
import { loadGoal3DemoProjectionV35 } from "../webui/projection-v35g3.ts";
import { InteractiveControlPlaneV36 } from "./authority-v36.ts";
import { V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE } from "./budget-profile-v36.ts";

export interface DailyProjectProfileFileV36 {
	schema_version: 1;
	project: {
		project_id: string;
		display_name: string;
		source_root: string;
		writable_paths: string[];
		protected_paths: string[];
		risk_notice: string;
		command_descriptors: CommandDescriptor[];
		pi_native_skills: ProjectSkillDescriptorV36[];
		harness_adaptations: HarnessAdaptationDescriptorV36[];
		harness_state_digest: string;
	};
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
	if (stableJson(Object.keys(value).sort()) !== stableJson([...expected].sort())) throw new Error(`${label} fields are invalid`);
}

export function loadDailyProjectProfileV36(pathValue: string): DailyProjectProfileFileV36 {
	const path = resolve(pathValue);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("daily Project Profile must be one ordinary non-link host file");
	const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("daily Project Profile is invalid");
	const envelope = parsed as Record<string, unknown>;
	exactKeys(envelope, ["schema_version", "project"], "daily Project Profile envelope");
	if (envelope.schema_version !== 1 || !envelope.project || typeof envelope.project !== "object" || Array.isArray(envelope.project)) throw new Error("daily Project Profile is invalid");
	exactKeys(envelope.project as Record<string, unknown>, ["project_id", "display_name", "source_root", "writable_paths", "protected_paths", "risk_notice", "command_descriptors", "pi_native_skills", "harness_adaptations", "harness_state_digest"], "daily Project Profile");
	const profile = parsed as DailyProjectProfileFileV36;
	if (typeof profile.project.harness_state_digest !== "string" || !/^[a-f0-9]{64}$/.test(profile.project.harness_state_digest)) throw new Error("daily Harness State digest is invalid");
	return profile;
}

export function createDailyProductApplicationV36(options: {
	profile: DailyProjectProfileFileV36;
	dataRoot: string;
	dockerExecutable: string;
	credentialResolver: OpaqueCredentialResolverV1;
	modelFactory?: PostV35RealModelFactory;
}): WorkbenchApplicationV36G1 {
	const project = options.profile.project;
	if (project.command_descriptors.length === 0) throw new Error("daily Product requires at least one registered command");
	const registry = new ProjectProfileRegistryV36([{
		project_id: project.project_id,
		display_name: project.display_name,
		source_root: project.source_root,
		writable_paths: [...project.writable_paths],
		protected_paths: [...project.protected_paths],
		supported_modes: ["bounded_edit"],
		risk_notice: project.risk_notice,
		execution_backend_profile_id: "docker-v36g2-frozen",
		provider_model_policy_id: "deepseek-v4-flash-fixed",
		pi_native_skills: structuredClone(project.pi_native_skills),
		harness_adaptations: structuredClone(project.harness_adaptations),
		command_descriptors: structuredClone(project.command_descriptors),
		current_state: () => ({ state_digest: project.harness_state_digest }),
	}]);
	const dataRoot = resolve(options.dataRoot);
	const interactiveData = resolve(dataRoot, "interactive");
	const legacyData = resolve(dataRoot, "legacy");
	const legacyWorkspace = resolve(dataRoot, "legacy-workspace");
	for (const path of [dataRoot, interactiveData, legacyData, legacyWorkspace]) mkdirSync(path, { recursive: true });
	const executor = new DockerRegisteredCommandExecutorV36({ dockerExecutable: options.dockerExecutable });
	const modelFactory = options.modelFactory ?? createPostV35DeepSeekModelFactory();
	const plane = new InteractiveControlPlaneV36({
		dataRoot: interactiveData,
		registry,
		goal2Enabled: true,
		dispatch: async (input) => {
			const registration = registry.resolve(input.authority.project_id).registration;
			const credential = await options.credentialResolver.resolve();
			if (typeof credential !== "string" || credential.length === 0) throw new Error("opaque Credential resolution failed");
			const runtime = await modelFactory.create(credential);
			const commandRoot = resolve(dirname(input.authority_path), "docker-commands");
			mkdirSync(commandRoot, { recursive: true });
			let ordinal = 0;
			try {
				return await input.service.executeBoundedTurn({
					sessionId: input.session_id,
					runId: input.run_id,
					prompt: input.task_text,
					taskPolicy: { writable_paths: [...registration.writable_paths], protected_paths: [...registration.protected_paths], command_descriptors: structuredClone(registration.command_descriptors ?? []) },
					commandExecutor: async ({ descriptor, workspace_root }) => await executor.execute({ workspaceRoot: workspace_root, evidenceRoot: resolve(commandRoot, `command-${++ordinal}`), descriptor }),
					budgetProfile: V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE,
					models: runtime.models,
					model: runtime.model,
					systemPrompt: `Work only inside the managed Workspace. Writable paths: ${JSON.stringify(registration.writable_paths)}. Protected paths: ${JSON.stringify(registration.protected_paths)}. Use only registered command IDs: ${JSON.stringify((registration.command_descriptors ?? []).map((entry) => entry.command_id))}. Run at least one relevant registered command before finishing. Never request Host paths, credentials, network, image, mount, argv, policy or direct Source changes.`,
					credentialReads: 1,
					externalModel: true,
					authorityDigest: input.authority.authority_digest,
				});
			} finally { await runtime.close(); }
		},
	});
	const legacy = new Goal3WorkbenchApplicationV35({
		sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "v36-daily-legacy", workspaceRoot: legacyWorkspace, workspaceId: "v36-daily-legacy" }),
		projection: loadGoal3DemoProjectionV35(resolve(import.meta.dirname, "../../../fixtures/v3-5/goal3-demo/projection.json")),
	});
	return new WorkbenchApplicationV36G1({ legacy, controlPlane: plane, goal2: new Goal2WorkbenchExtensionV36(plane) });
}

export function defaultHarnessStateDigestV36(projectId: string): string {
	return sha256(`v36-daily-no-active-adaptation:${projectId}`);
}
