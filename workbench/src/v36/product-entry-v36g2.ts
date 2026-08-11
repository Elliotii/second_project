import { existsSync, mkdirSync } from "node:fs";
import { request } from "node:http";
import { dirname, resolve } from "node:path";
import type { ChangeHandoffReceiptV36, SafeChangeSetV36 } from "../contracts/v36g2-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { DockerRegisteredCommandExecutorV36, FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3 } from "../pi/runtime-profile-v3.ts";
import { ProjectProfileRegistryV36 } from "../project/registry-v36.ts";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { PersistentSessionServiceV35 } from "../session/persistent-session-v35.ts";
import { createPostV35DeepSeekModelFactory, type PostV35RealModelFactory } from "../session/real-smoke-turn-v35.ts";
import type { CommandDescriptor } from "../types.ts";
import { Goal3WorkbenchApplicationV35 } from "../webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../webui/application-v36g1.ts";
import { Goal2WorkbenchExtensionV36, type SafeInteractiveSessionV36G2 } from "../webui/application-v36g2.ts";
import { loadGoal3DemoProjectionV35 } from "../webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../webui/server-v36g1.ts";
import { registeredSourceInventoryV36 } from "../workspace/managed-copy-v36.ts";
import { InteractiveControlPlaneV36 } from "./authority-v36.ts";

const SHA40 = /^[a-f0-9]{40}$/;

export const V36G2_REAL_JOURNEY_AUTHORITY = "V3_6_G2_REAL_TWO_TURN_EXECUTION_AUTHORIZED" as const;
export const V36G2_FIXTURE_INVENTORY_DIGEST = "f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb" as const;
export const V36G2_TURN_PROMPTS = Object.freeze([
	"Implement parseDuration(input) in src/parse-duration.js. It must parse non-negative integer values ending in ms, s, m, or h into milliseconds and throw Error(\"invalid duration\") for malformed, signed, decimal, mixed-unit, unsafe-integer or overflow inputs. Modify only the implementation file and run the registered test command.",
	"Review the duration parser you just implemented for boundary cases, make only the smallest correction still needed, run the registered test command again, and briefly explain what you checked. Do not modify tests or package metadata.",
] as const);
export const V36G2_REGISTERED_TEST_COMMAND: CommandDescriptor = Object.freeze({ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 });
export const V36G2_PER_TURN_BUDGET = Object.freeze({ provider_requests_max: 16, tool_calls_max: 24, combined_tokens_max: 131_072, cost_usd_max: 0.2, wall_time_ms_max: 900_000 });
export const V36G2_JOURNEY_BUDGET = Object.freeze({ provider_requests_max: 32, tool_calls_max: 48, combined_tokens_max: 262_144, cost_usd_max: 0.4, wall_time_ms_max: 1_800_000, credential_reads_max: 2 });
export const V36G2_EXECUTION_POLICY = Object.freeze({ retry: 0, fallback: 0, replacement: 0, extra_task_or_case: 0, apply_condition: "valid_nonempty_current_changeset_and_frozen_verifier_pass" as const });

export interface Goal2ProductPreflightV36 {
	schema_version: 1;
	ready: true;
	execution_baseline_commit: string;
	fixture_inventory_digest: string;
	backend_profile_digest: string;
	provider_profile_digest: string;
	registered_command_digest: string;
	prompt_sha256: [string, string];
	per_turn_budget_digest: string;
	journey_budget_digest: string;
	execution_policy_digest: string;
	credential_reads: 0;
	network_calls: 0;
	external_provider_calls: 0;
	real_model_calls: 0;
	runtime_identity_created: false;
}

interface Goal2JourneyAuthorityV36 {
	schema_version: 1;
	authority_kind: "v36g2_real_two_turn_product_journey";
	execution_baseline_commit: string;
	fixture_inventory_digest: string;
	backend_profile_digest: string;
	provider_profile_digest: string;
	registered_command: CommandDescriptor;
	writable_paths: ["src/parse-duration.js"];
	protected_paths: ["test/**", "package.json"];
	prompts: readonly [string, string];
	per_turn_budget: typeof V36G2_PER_TURN_BUDGET;
	journey_budget: typeof V36G2_JOURNEY_BUDGET;
	execution_policy: typeof V36G2_EXECUTION_POLICY;
	authority_digest: string;
}

interface Goal2JourneyUsageV36 {
	provider_requests: number;
	tool_calls: number;
	combined_tokens: number;
	cost_usd: number;
	wall_time_ms: number;
}

export interface Goal2JourneyReportV36 {
	schema_version: 1;
	status: "applied";
	authority_digest: string;
	execution_baseline_commit: string;
	session_id: string;
	run_ids: [string, string];
	change_set_digest: string;
	change_count: number;
	verifier_passed: true;
	verifier_terminal_digest: string;
	apply_receipt_digest: string;
	source_identity_before: string;
	source_identity_after: string;
	usage: Goal2JourneyUsageV36;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	retry: 0;
	fallback: 0;
	replacement: 0;
	report_digest: string;
}

function authorityBody(value: Goal2JourneyAuthorityV36): Omit<Goal2JourneyAuthorityV36, "authority_digest"> {
	const { authority_digest: _digest, ...body } = value;
	return body;
}

function reportBody(value: Goal2JourneyReportV36): Omit<Goal2JourneyReportV36, "report_digest"> {
	const { report_digest: _digest, ...body } = value;
	return body;
}

function assertJourneyUsage(usage: Goal2JourneyUsageV36): void {
	if (usage.provider_requests > V36G2_JOURNEY_BUDGET.provider_requests_max || usage.tool_calls > V36G2_JOURNEY_BUDGET.tool_calls_max || usage.combined_tokens > V36G2_JOURNEY_BUDGET.combined_tokens_max || usage.cost_usd > V36G2_JOURNEY_BUDGET.cost_usd_max || usage.wall_time_ms > V36G2_JOURNEY_BUDGET.wall_time_ms_max) throw new Error("V3.6 Goal 2 whole-Journey budget exceeded");
}

function assertFrozenProductConstants(): void {
	if (stableJson(V36G2_REGISTERED_TEST_COMMAND) !== stableJson({ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 })) throw new Error("Goal 2 registered command drifted");
	if (V36G2_TURN_PROMPTS.length !== 2 || V36G2_TURN_PROMPTS.some((prompt) => Buffer.byteLength(prompt, "utf8") === 0) || stableJson(V36G2_PER_TURN_BUDGET) !== stableJson({ provider_requests_max: 16, tool_calls_max: 24, combined_tokens_max: 131_072, cost_usd_max: 0.2, wall_time_ms_max: 900_000 }) || stableJson(V36G2_JOURNEY_BUDGET) !== stableJson({ provider_requests_max: 32, tool_calls_max: 48, combined_tokens_max: 262_144, cost_usd_max: 0.4, wall_time_ms_max: 1_800_000, credential_reads_max: 2 }) || stableJson(V36G2_EXECUTION_POLICY) !== stableJson({ retry: 0, fallback: 0, replacement: 0, extra_task_or_case: 0, apply_condition: "valid_nonempty_current_changeset_and_frozen_verifier_pass" })) throw new Error("Goal 2 frozen Journey constants drifted");
	if (GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.provider_kind !== "deepseek_real" || GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.model_id !== "deepseek-v4-flash" || GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.retry !== false || GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.fallback !== false) throw new Error("Goal 2 fixed DeepSeek route drifted");
}

export function preflightGoal2ProductEntryV36(options: { sourceRoot: string; executionBaselineCommit: string }): Goal2ProductPreflightV36 {
	assertFrozenProductConstants();
	if (!SHA40.test(options.executionBaselineCommit)) throw new Error("Goal 2 Execution Baseline commit is invalid");
	const source = registeredSourceInventoryV36(options.sourceRoot);
	if (source.inventory_digest !== V36G2_FIXTURE_INVENTORY_DIGEST || source.files.length !== 3) throw new Error("Goal 2 representative Source does not match the frozen fixture");
	return {
		schema_version: 1,
		ready: true,
		execution_baseline_commit: options.executionBaselineCommit,
		fixture_inventory_digest: source.inventory_digest,
		backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest,
		provider_profile_digest: GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.profile_digest,
		registered_command_digest: digestObject(V36G2_REGISTERED_TEST_COMMAND),
		prompt_sha256: [sha256(V36G2_TURN_PROMPTS[0]), sha256(V36G2_TURN_PROMPTS[1])],
		per_turn_budget_digest: digestObject(V36G2_PER_TURN_BUDGET),
		journey_budget_digest: digestObject(V36G2_JOURNEY_BUDGET),
		execution_policy_digest: digestObject(V36G2_EXECUTION_POLICY),
		credential_reads: 0,
		network_calls: 0,
		external_provider_calls: 0,
		real_model_calls: 0,
		runtime_identity_created: false,
	};
}

function makeAuthority(preflight: Goal2ProductPreflightV36): Goal2JourneyAuthorityV36 {
	const body: Omit<Goal2JourneyAuthorityV36, "authority_digest"> = {
		schema_version: 1,
		authority_kind: "v36g2_real_two_turn_product_journey",
		execution_baseline_commit: preflight.execution_baseline_commit,
		fixture_inventory_digest: preflight.fixture_inventory_digest,
		backend_profile_digest: preflight.backend_profile_digest,
		provider_profile_digest: preflight.provider_profile_digest,
		registered_command: structuredClone(V36G2_REGISTERED_TEST_COMMAND),
		writable_paths: ["src/parse-duration.js"],
		protected_paths: ["test/**", "package.json"],
		prompts: V36G2_TURN_PROMPTS,
		per_turn_budget: V36G2_PER_TURN_BUDGET,
		journey_budget: V36G2_JOURNEY_BUDGET,
		execution_policy: V36G2_EXECUTION_POLICY,
	};
	return { ...body, authority_digest: digestObject(body) };
}

function httpJson(port: number, path: string, method = "GET", body?: unknown): Promise<{ status: number; value: unknown; text: string }> {
	return new Promise((accept, reject) => {
		const bytes = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
		const req = request({ host: "127.0.0.1", port, path, method, headers: bytes ? { "content-type": "application/json", "content-length": bytes.length } : {} }, (response) => {
			const chunks: Buffer[] = [];
			response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
			response.on("end", () => {
				const text = Buffer.concat(chunks).toString("utf8");
				let value: unknown = text;
				try { value = JSON.parse(text) as unknown; } catch {}
				accept({ status: response.statusCode ?? 0, value, text });
			});
		});
		req.on("error", reject);
		if (bytes) req.write(bytes);
		req.end();
	});
}

export async function executeGoal2ProductJourneyV36(options: {
	sourceRoot: string;
	dataRoot: string;
	evidenceRoot: string;
	dockerExecutable: string;
	executionBaselineCommit: string;
	realAuthority?: string;
	credentialResolver?: OpaqueCredentialResolverV1;
	modelFactory?: PostV35RealModelFactory;
}): Promise<Goal2JourneyReportV36> {
	if (options.realAuthority !== V36G2_REAL_JOURNEY_AUTHORITY || !options.credentialResolver) throw new Error("explicit V3.6 Goal 2 real Journey authority and opaque Credential resolver are required");
	const preflight = preflightGoal2ProductEntryV36({ sourceRoot: options.sourceRoot, executionBaselineCommit: options.executionBaselineCommit });
	if (existsSync(resolve(options.dataRoot)) || existsSync(resolve(options.evidenceRoot))) throw new Error("Goal 2 Journey data/evidence root must be absent");
	const authority = makeAuthority(preflight);
	mkdirSync(resolve(options.evidenceRoot), { recursive: true });
	writeOnceJson(resolve(options.evidenceRoot), "journey-authority.json", authority);
	mkdirSync(resolve(options.dataRoot), { recursive: true });
	const interactiveData = resolve(options.dataRoot, "interactive");
	const legacyData = resolve(options.dataRoot, "legacy");
	const legacyWorkspace = resolve(options.dataRoot, "legacy-workspace");
	for (const path of [interactiveData, legacyData, legacyWorkspace]) mkdirSync(path, { recursive: true });
	const executor = new DockerRegisteredCommandExecutorV36({ dockerExecutable: options.dockerExecutable });
	const modelFactory = options.modelFactory ?? createPostV35DeepSeekModelFactory();
	const usage: Goal2JourneyUsageV36 = { provider_requests: 0, tool_calls: 0, combined_tokens: 0, cost_usd: 0, wall_time_ms: 0 };
	let credentialReads = 0;
	let completedTurns = 0;
	const startedAt = Date.now();
	const registry = new ProjectProfileRegistryV36([{
		project_id: "duration-parser",
		display_name: "Duration parser",
		source_root: options.sourceRoot,
		writable_paths: ["src/parse-duration.js"],
		protected_paths: ["test/**", "package.json"],
		supported_modes: ["bounded_edit"],
		risk_notice: "Frozen network-none Docker execution; Source changes require verified explicit Host handoff.",
		execution_backend_profile_id: "docker-v36g2-frozen",
		provider_model_policy_id: "deepseek-v4-flash-fixed",
		pi_native_skills: [],
		harness_adaptations: [],
		command_descriptors: [structuredClone(V36G2_REGISTERED_TEST_COMMAND)],
		current_state: () => ({ state_digest: sha256("v36g2-product-no-state-binding") }),
	}]);
	const plane = new InteractiveControlPlaneV36({
		dataRoot: interactiveData,
		registry,
		goal2Enabled: true,
		dispatch: async (input) => {
			const ordinal = completedTurns;
			if (ordinal > 1 || input.task_text !== V36G2_TURN_PROMPTS[ordinal]) throw new Error("Goal 2 browser prompt or Turn ordinal differs from frozen Journey authority");
			assertJourneyUsage(usage);
			if (credentialReads >= V36G2_JOURNEY_BUDGET.credential_reads_max) throw new Error("Goal 2 Journey Credential-read budget exhausted");
			credentialReads += 1;
			const credential = await options.credentialResolver!.resolve();
			if (typeof credential !== "string" || credential.length === 0) throw new Error("opaque Credential resolution failed");
			const runtime = await modelFactory.create(credential);
			const commandParent = resolve(dirname(input.authority_path), "docker-commands");
			mkdirSync(commandParent, { recursive: true });
			let commandOrdinal = 0;
			const turnStarted = Date.now();
			try {
				const result = await input.service.executeBoundedTurn({
					sessionId: input.session_id,
					runId: input.run_id,
					prompt: input.task_text,
					taskPolicy: { writable_paths: ["src/parse-duration.js"], protected_paths: ["test/**", "package.json"], command_descriptors: [structuredClone(V36G2_REGISTERED_TEST_COMMAND)] },
					commandExecutor: async ({ descriptor, workspace_root }) => await executor.execute({ workspaceRoot: workspace_root, evidenceRoot: resolve(commandParent, `command-${++commandOrdinal}`), descriptor }),
					models: runtime.models,
					model: runtime.model,
					systemPrompt: "Work only in the managed Workspace. Modify only src/parse-duration.js and run only the registered test command. Do not request Host paths, credentials, network, image, mount, argv or policy changes.",
					credentialReads: 1,
					externalModel: true,
					authorityDigest: input.authority.authority_digest,
				});
				if ("terminal_kind" in result.manifest) throw new Error("Goal 2 frozen real Journey stopped at the local Provider-request budget");
				const elapsed = Date.now() - turnStarted;
				if (elapsed > V36G2_PER_TURN_BUDGET.wall_time_ms_max) throw new Error("Goal 2 per-Turn wall-time budget exceeded");
				usage.provider_requests += result.manifest.provider_requests;
				usage.tool_calls += result.manifest.tool_call_ids.length;
				usage.combined_tokens += result.manifest.input_tokens + result.manifest.output_tokens;
				usage.cost_usd += result.manifest.cost_usd;
				usage.wall_time_ms = Date.now() - startedAt;
				assertJourneyUsage(usage);
				completedTurns += 1;
				return result;
			} finally {
				await runtime.close();
			}
		},
	});
	const legacy = new Goal3WorkbenchApplicationV35({ sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "v36g2-legacy", workspaceRoot: legacyWorkspace, workspaceId: "v36g2-legacy" }), projection: loadGoal3DemoProjectionV35(resolve(import.meta.dirname, "../../../fixtures/v3-5/goal3-demo/projection.json")) });
	const app = new WorkbenchApplicationV36G1({ legacy, controlPlane: plane, goal2: new Goal2WorkbenchExtensionV36(plane) });
	const loopback = createWorkbenchLoopbackServerV36G1(app);
	const address = await loopback.start();
	const sourceIdentityBefore = registeredSourceInventoryV36(options.sourceRoot).inventory_digest;
	try {
		const html = await httpJson(address.port, "/");
		if (html.status !== 200 || !html.text.includes("V3.6")) throw new Error("Goal 2 loopback WebUI preflight failed");
		const first = await httpJson(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: V36G2_TURN_PROMPTS[0], title: "Duration parser real Journey" });
		if (first.status !== 201) throw new Error("Goal 2 Turn 1 API dispatch failed");
		const firstView = first.value as SafeInteractiveSessionV36G2;
		const second = await httpJson(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: V36G2_TURN_PROMPTS[1], session_id: firstView.session_id });
		if (second.status !== 201) throw new Error("Goal 2 Turn 2 API dispatch failed");
		const secondView = second.value as SafeInteractiveSessionV36G2;
		if (completedTurns !== 2 || secondView.runs.length !== 2 || secondView.session_id !== firstView.session_id) throw new Error("Goal 2 two-Turn Session lineage is invalid");
		const changes = secondView.goal2.changes as SafeChangeSetV36 | null;
		if (!changes || changes.status !== "proposed" || changes.changes.length === 0) throw new Error("Goal 2 frozen Apply condition rejected an empty or invalid ChangeSet");
		const finalRun = secondView.runs.at(-1)!;
		const context = plane.hostChangeSetContext(secondView.session_id, finalRun.run_id);
		const verifier = await executor.execute({ workspaceRoot: context.workspace_root, evidenceRoot: resolve(options.evidenceRoot, "verifier"), descriptor: structuredClone(V36G2_REGISTERED_TEST_COMMAND) });
		if (verifier.exit_code !== 0 || verifier.timed_out || verifier.truncated || !verifier.cleanup_complete) throw new Error("Goal 2 frozen verifier failed");
		const applied = await httpJson(address.port, "/api/v1/v36/handoff", "POST", { session_id: secondView.session_id, change_set_digest: changes.change_set_digest, action: "apply_all" });
		if (applied.status !== 200 || !applied.value || typeof applied.value !== "object" || (applied.value as ChangeHandoffReceiptV36).status !== "applied") throw new Error("Goal 2 verified Host Apply failed");
		const receipt = applied.value as ChangeHandoffReceiptV36;
		usage.wall_time_ms = Date.now() - startedAt;
		assertJourneyUsage(usage);
		const body: Omit<Goal2JourneyReportV36, "report_digest"> = {
			schema_version: 1,
			status: "applied",
			authority_digest: authority.authority_digest,
			execution_baseline_commit: options.executionBaselineCommit,
			session_id: secondView.session_id,
			run_ids: [secondView.runs[0]!.run_id, secondView.runs[1]!.run_id],
			change_set_digest: changes.change_set_digest,
			change_count: changes.changes.length,
			verifier_passed: true,
			verifier_terminal_digest: verifier.terminal_digest,
			apply_receipt_digest: receipt.receipt_digest,
			source_identity_before: sourceIdentityBefore,
			source_identity_after: registeredSourceInventoryV36(options.sourceRoot).inventory_digest,
			usage: structuredClone(usage),
			credential_reads: credentialReads,
			network_calls: usage.provider_requests,
			external_provider_calls: usage.provider_requests,
			real_model_calls: usage.provider_requests,
			retry: 0,
			fallback: 0,
			replacement: 0,
		};
		const report: Goal2JourneyReportV36 = { ...body, report_digest: digestObject(body) };
		if (digestObject(reportBody(report)) !== report.report_digest) throw new Error("Goal 2 Journey report digest failed");
		writeOnceJson(resolve(options.evidenceRoot), "journey-report.json", report);
		return report;
	} finally {
		await loopback.stop();
	}
}
