import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3 } from "../src/pi/runtime-profile-v3.ts";
import {
	executeGoal2ProductJourneyV36,
	preflightGoal2ProductEntryV36,
	V36G2_EXECUTION_POLICY,
	V36G2_FIXTURE_INVENTORY_DIGEST,
	V36G2_JOURNEY_BUDGET,
	V36G2_PER_TURN_BUDGET,
	V36G2_REGISTERED_TEST_COMMAND,
	V36G2_TURN_PROMPTS,
} from "../src/v36/product-entry-v36g2.ts";
import { registeredSourceInventoryV36 } from "../src/workspace/managed-copy-v36.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const WORKBENCH_ROOT = resolve(PROJECT_ROOT, "workbench");

test("tracked Goal 2 product entry preflight freezes the no-fallback two-Turn Journey with zero access or runtime identity", async () => {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g2/product-entry", `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "registered-source");
	const data = resolve(root, "data");
	const evidence = resolve(root, "evidence");
	cpSync(resolve(WORKBENCH_ROOT, "fixtures/v36g2/duration-parser"), source, { recursive: true });
	const baseline = "a".repeat(40);
	const before = registeredSourceInventoryV36(source).inventory_digest;
	const preflight = preflightGoal2ProductEntryV36({ sourceRoot: source, executionBaselineCommit: baseline });
	assert.equal(preflight.ready, true);
	assert.equal(preflight.fixture_inventory_digest, V36G2_FIXTURE_INVENTORY_DIGEST);
	assert.equal(preflight.provider_profile_digest, GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3.profile_digest);
	assert.deepEqual([preflight.credential_reads, preflight.network_calls, preflight.external_provider_calls, preflight.real_model_calls, preflight.runtime_identity_created], [0, 0, 0, 0, false]);
	assert.deepEqual(V36G2_REGISTERED_TEST_COMMAND, { command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 });
	assert.equal(V36G2_TURN_PROMPTS.length, 2);
	assert.deepEqual(V36G2_PER_TURN_BUDGET, { provider_requests_max: 16, tool_calls_max: 24, combined_tokens_max: 131_072, cost_usd_max: 0.2, wall_time_ms_max: 900_000 });
	assert.deepEqual(V36G2_JOURNEY_BUDGET, { provider_requests_max: 32, tool_calls_max: 48, combined_tokens_max: 262_144, cost_usd_max: 0.4, wall_time_ms_max: 1_800_000, credential_reads_max: 2 });
	assert.deepEqual(V36G2_EXECUTION_POLICY, { retry: 0, fallback: 0, replacement: 0, extra_task_or_case: 0, apply_condition: "valid_nonempty_current_changeset_and_frozen_verifier_pass" });

	const cli = spawnSync(process.execPath, ["--experimental-loader", "./scripts/v35g2-public-pi-loader.mjs", "scripts/run-v36g2-product-journey.ts", "preflight", "--source-root", source, "--execution-baseline-commit", baseline], { cwd: WORKBENCH_ROOT, encoding: "utf8", env: { NO_COLOR: "1" } });
	assert.equal(cli.status, 0, cli.stderr);
	const cliPreflight = JSON.parse(cli.stdout) as typeof preflight;
	assert.deepEqual(cliPreflight, preflight);
	assert.doesNotMatch(cli.stdout, /[A-Za-z]:[\\/]|DEEPSEEK_API_KEY|Bearer|must-not-be-read/i);

	let credentialReads = 0;
	let modelFactoryCalls = 0;
	await assert.rejects(() => executeGoal2ProductJourneyV36({
		sourceRoot: source,
		dataRoot: data,
		evidenceRoot: evidence,
		dockerExecutable: "host-only-docker",
		executionBaselineCommit: baseline,
		realAuthority: "not-authorized",
		credentialResolver: { async resolve(): Promise<string> { credentialReads += 1; return "must-not-be-read"; } },
		modelFactory: { async create(): Promise<never> { modelFactoryCalls += 1; throw new Error("must not construct model"); } },
	}), /explicit .* authority/);
	assert.equal(credentialReads, 0);
	assert.equal(modelFactoryCalls, 0);
	assert.equal(existsSync(data), false);
	assert.equal(existsSync(evidence), false);
	assert.equal(registeredSourceInventoryV36(source).inventory_digest, before);
});
