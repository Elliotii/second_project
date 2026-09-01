import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { AnalysisState, FindingDraft } from "./contracts.ts";

export function saveAnalysisState(outputDirectory: string, state: AnalysisState): string {
	mkdirSync(outputDirectory, { recursive: true });
	const path = resolve(outputDirectory, "analysis-state.json");
	writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
	return path;
}

export function loadAnalysisState(path: string): AnalysisState {
	const value = JSON.parse(readFileSync(resolve(path), "utf8")) as AnalysisState;
	if (!Array.isArray(value.covered_runs) || !Array.isArray(value.loaded_evidence) || !Array.isArray(value.finding_drafts)) {
		throw new Error("analysis State is missing required arrays");
	}
	return value;
}

export function renderDevelopmentFinding(state: AnalysisState, findingId: string): string {
	const finding = state.finding_drafts.find((candidate) => candidate.id === findingId);
	if (!finding) throw new Error(`Finding ${findingId} does not exist`);
	const locators = (values: FindingDraft["support"]): string => values.map((value) => `- ${JSON.stringify(value)}`).join("\n") || "- none";
	return `# Development Finding ${finding.id}

## Observation

${finding.observation}

## Applicable Runs

${finding.applicable_runs.map((runId) => `- ${runId}`).join("\n")}

## Supporting Evidence

${locators(finding.support)}

## Counter Evidence

${locators(finding.counter)}

## Interpretation

${finding.interpretation}

## Limitation

${finding.limitation}

## Locator

- State Finding: ${finding.id}
${locators([...finding.support, ...finding.counter])}
`;
}
