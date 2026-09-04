import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createAnalysisContext, listRuns, readEvidence, resolveFindingLocators, searchTrace } from "../src/trace-analysis/analysis.ts";
import type { AnalysisState, EvidenceLocator, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { loadAnalysisState, renderDevelopmentFinding, saveAnalysisState } from "../src/trace-analysis/state.ts";

function usage(): never {
	throw new Error("usage: node scripts/run-trace-analysis-development.ts --output <directory> --run <run-id> <root> --run <run-id> <root>");
}

function argumentsFrom(argv: string[]): { output: string; descriptors: RunDescriptor[] } {
	let output: string | undefined;
	const descriptors: RunDescriptor[] = [];
	for (let index = 0; index < argv.length;) {
		if (argv[index] === "--output" && argv[index + 1]) {
			output = resolve(argv[index + 1]!);
			index += 2;
		} else if (argv[index] === "--run" && argv[index + 1] && argv[index + 2]) {
			descriptors.push({ runId: argv[index + 1]!, root: resolve(argv[index + 2]!), labels: { cohort: "development" } });
			index += 3;
		} else usage();
	}
	if (!output || descriptors.length !== 2) usage();
	for (const descriptor of descriptors) {
		const relative = resolve(output).toLocaleLowerCase();
		const runRoot = resolve(descriptor.root).toLocaleLowerCase();
		if (relative === runRoot || relative.startsWith(`${runRoot}\\`) || relative.startsWith(`${runRoot}/`)) {
			throw new Error("analysis output directory must be outside source Run roots");
		}
	}
	return { output, descriptors };
}

const input = argumentsFrom(process.argv.slice(2));
const context = createAnalysisContext(input.descriptors);
const runs = listRuns(context);
const failed = runs.find((entry) => entry.outcome === "TASK_FAILURE");
const passed = runs.find((entry) => entry.outcome === "PASS");
if (!failed || !passed || typeof failed.runId !== "string" || typeof passed.runId !== "string") {
	throw new Error("development analysis requires one TASK_FAILURE Run and one PASS Run");
}

const failedMatches = searchTrace(context, failed.runId, { eventType: "file_write", toolName: "workspace_write", keyword: ".trim()", limit: 5 });
const passedWrites = searchTrace(context, passed.runId, { eventType: "file_write", toolName: "workspace_write", limit: 5 });
if (failedMatches.length !== 1 || passedWrites.length !== 1) throw new Error("the bounded development evidence query did not identify one write event in each Run");
const failedTrace = failedMatches[0]!.locator;
const passedTrace = passedWrites[0]!.locator;
const failedVerifier: EvidenceLocator = { artifact: "verifier", run_id: failed.runId };
const passedVerifier: EvidenceLocator = { artifact: "verifier", run_id: passed.runId };
const failedDiff: EvidenceLocator = { artifact: "diff", run_id: failed.runId };

const evidence = [
	readEvidence(context, failedTrace),
	readEvidence(context, failedDiff),
	readEvidence(context, failedVerifier),
	readEvidence(context, passedTrace),
	readEvidence(context, passedVerifier),
];
const state: AnalysisState = {
	phase: "blind_analysis",
	covered_runs: [...context.coveredRuns],
	matrix_triage_complete: false,
	investigation_agenda: [],
	notes: ["Compared the corresponding workspace_write events and deterministic Verifier outcomes for two Runs of the same task."],
	open_questions: ["This two-Run development check does not establish a general causal rule or a Skill effect."],
	next_action: "Day 1-B remains separate and is not started by this development analysis.",
	loaded_evidence: structuredClone(context.loadedEvidence),
	finding_drafts: [{
		id: "f1",
		observation: `For task ${String(failed.taskId)}, the TASK_FAILURE Run write event uses value.trim(), while the corresponding PASS Run write event does not; the frozen external Verifier failed the first Run and passed the second.`,
		interpretation: "The implementation-path difference is consistent with the frozen Verifier's explicit requirement to reject leading or trailing whitespace.",
		limitation: "This is a bounded two-Run development Finding. It does not establish general causality, model quality, or Skill effectiveness; Diff and Verifier Locators are whole-artifact Locators.",
		applicable_runs: [failed.runId, passed.runId],
		repeated_support_run_ids: [],
		support: [failedTrace, failedDiff, failedVerifier],
		counter: [passedTrace, passedVerifier],
		counter_checked: true,
		status: "draft",
		sealed: false,
	}],
};
const statePath = saveAnalysisState(input.output, state);
const reloaded = loadAnalysisState(statePath);
const finding = reloaded.finding_drafts[0]!;
const resolved = resolveFindingLocators(context, [...finding.support, ...finding.counter]);
const rendered = renderDevelopmentFinding(reloaded, finding.id);
writeFileSync(resolve(input.output, "development-finding.md"), rendered, "utf8");
console.log(JSON.stringify({ runs, searches: { failedMatches, passedWrites }, evidence: evidence.map(({ content: _content, ...record }) => record), statePath, state: reloaded, reloadedEqual: JSON.stringify(reloaded) === JSON.stringify(state), resolved: resolved.map(({ content: _content, ...record }) => record), rendered }, null, 2));
