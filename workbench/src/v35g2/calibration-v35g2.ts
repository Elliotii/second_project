import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeOnceBytes, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, treeDigest } from "../hash.ts";
import { createTemporaryWorkspace } from "../workspace/temp-copy.ts";
import { assertFrozenGoal2CaseBytesV35, GOAL2_REFERENCE_SHA256_V35, GOAL2_TASK_POLICY_V35, GOAL2_VERIFIER_SHA256_V35, GOAL2_WORKSPACE_DIGEST_V35, goal2FixturePathsV35 } from "./case-v35g2.ts";

function execute(executable: string, argv: string[], cwd: string, env: NodeJS.ProcessEnv): { status: number | null; output: string } {
	const result = spawnSync(executable, argv, { cwd, encoding: "utf8", windowsHide: true, env });
	return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

export function runGoal2ReferenceCalibrationV35(options: { projectRoot: string; outputRoot: string }): Record<string, unknown> {
	assertFrozenGoal2CaseBytesV35(options.projectRoot);
	if (existsSync(options.outputRoot)) throw new Error("Goal 2 calibration output already exists");
	mkdirSync(options.outputRoot, { recursive: true });
	const fixture = goal2FixturePathsV35(options.projectRoot);
	const workspace = resolve(options.outputRoot, "reference-workspace");
	createTemporaryWorkspace({ projectRoot: options.projectRoot, sourceRoot: fixture.workspace, targetRoot: workspace, workspaceId: "v35-g2-reference-calibration-workspace", task: { ...GOAL2_TASK_POLICY_V35, workspace_source_digest: GOAL2_WORKSPACE_DIGEST_V35 } });
	if (fileSha256(fixture.reference) !== GOAL2_REFERENCE_SHA256_V35 || fileSha256(fixture.verifier) !== GOAL2_VERIFIER_SHA256_V35) throw new Error("Goal 2 calibration authority drift");
	copyFileSync(fixture.reference, resolve(workspace, "src/subject.ts"));
	const environment = { NO_COLOR: "1", V35_WORKSPACE: workspace };
	const publicCheck = execute(process.execPath, ["--test", "test/public.test.mjs"], workspace, environment);
	const verifier = execute(process.execPath, [fixture.verifier], options.projectRoot, environment);
	writeOnceBytes(options.outputRoot, "public-check.txt", publicCheck.output);
	writeOnceBytes(options.outputRoot, "hidden-verifier.txt", verifier.output);
	if (publicCheck.status !== 0 || verifier.status !== 0) throw new Error("Goal 2 zero-model reference calibration failed");
	const wire = JSON.parse(verifier.output.trim().split(/\r?\n/).at(-1) ?? "null") as { verifier_id?: unknown; status?: unknown } | null;
	if (!wire || wire.verifier_id !== "v35-stable-unique-verifier" || wire.status !== "passed") throw new Error("Goal 2 calibration Verifier contract mismatch");
	const body = { schema_version: 1, calibration_id: "v35-g2-stable-unique-reference-calibration", initial_workspace_digest: GOAL2_WORKSPACE_DIGEST_V35, calibrated_workspace_digest: treeDigest(workspace), reference_patch_sha256: GOAL2_REFERENCE_SHA256_V35, verifier_sha256: GOAL2_VERIFIER_SHA256_V35, public_check_exit_code: publicCheck.status, verifier_exit_code: verifier.status, verifier_status: "passed", credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 };
	const result = { ...body, calibration_digest: digestObject(body) };
	writeOnceJson(options.outputRoot, "calibration.json", result);
	return result;
}
