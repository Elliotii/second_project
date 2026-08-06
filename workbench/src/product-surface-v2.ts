import { resolve } from "node:path";
import type { CandidateModeV2A } from "./contracts/v2-types.ts";
import { inspectRunV2A } from "./inspect-v2.ts";
import { executeRunV2A } from "./run-v2.ts";

export const V2A_SCENARIOS: Readonly<Record<string, { primary: "pass" | "fail"; candidates?: readonly [CandidateModeV2A, CandidateModeV2A] }>> = Object.freeze({
	initial_pass_no_branch: { primary: "pass" },
	a_pass_b_fail: { primary: "fail", candidates: ["pass", "fail"] },
	a_fail_b_pass: { primary: "fail", candidates: ["fail", "pass"] },
	a_pass_b_pass: { primary: "fail", candidates: ["pass", "pass"] },
	a_fail_b_fail: { primary: "fail", candidates: ["fail", "fail"] },
	a_budget_b_pass: { primary: "fail", candidates: ["budget_stop", "pass"] },
});

export async function runV2A(options: { projectRoot: string; runRoot: string; runId: string; scenario: string }) {
	const scenario = V2A_SCENARIOS[options.scenario];
	if (!scenario) throw new Error(`unknown V2-A scenario: ${options.scenario}`);
	return executeRunV2A({
		projectRoot: options.projectRoot,
		runRoot: resolve(options.runRoot),
		runId: options.runId,
		primaryMode: scenario.primary,
		...(scenario.candidates ? { candidateModes: scenario.candidates } : {}),
	});
}

export function inspectV2A(options: { projectRoot: string; runRoot: string }) {
	return inspectRunV2A({ projectRoot: resolve(options.projectRoot), runRoot: resolve(options.runRoot) });
}
