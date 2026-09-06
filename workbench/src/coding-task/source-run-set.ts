import { resolve } from "node:path";
import { portableArtifactPath, writeJson } from "./artifacts.ts";
import { normalizeCodingRun, type SourceRunInput } from "./normalization.ts";

export interface SourceRunSetInput {
	taskFamily: string;
	runs: SourceRunInput[];
}

export interface SourceRunRef {
	sourceRunId: string;
	taskFamily: string;
	sourceRunPath: string;
	normalizedRunPath: string;
	historicalVerifierStatus: "passed" | "failed";
}

export interface SourceRunSet {
	taskFamily: string;
	sourceRuns: SourceRunRef[];
}

export function prepareSourceRunSet(input: SourceRunSetInput, outputDirectory: string): SourceRunSet {
	if (typeof input.taskFamily !== "string" || input.taskFamily.trim().length === 0) throw new Error("taskFamily must be a non-empty string");
	if (!Array.isArray(input.runs) || input.runs.length === 0) throw new Error("at least one source Run is required");
	const resolvedPaths = input.runs.map((run) => resolve(run.sourceRunPath));
	if (new Set(resolvedPaths.map((path) => path.toLowerCase())).size !== resolvedPaths.length) throw new Error("sourceRunPath values must be unique");
	const normalizedDirectory = resolve(outputDirectory, "normalized-runs");
	const sourceRuns: SourceRunRef[] = [];
	for (const run of input.runs) {
		const normalized = normalizeCodingRun(run, normalizedDirectory);
		const verifierStatus = normalized.verifier.status;
		if (normalized.outcome.executionStatus !== "completed" || (verifierStatus !== "passed" && verifierStatus !== "failed") || normalized.outcome.verificationStatus !== verifierStatus) throw new Error(`source Run ${normalized.runId} is not valid learning evidence`);
		sourceRuns.push({
			sourceRunId: normalized.runId,
			taskFamily: input.taskFamily,
			sourceRunPath: run.sourceRunPath,
			normalizedRunPath: portableArtifactPath(outputDirectory, resolve(normalizedDirectory, `${normalized.runId}.json`)),
			historicalVerifierStatus: verifierStatus,
		});
	}
	const result: SourceRunSet = { taskFamily: input.taskFamily, sourceRuns };
	writeJson(resolve(outputDirectory, "source-runs.json"), result);
	return result;
}
