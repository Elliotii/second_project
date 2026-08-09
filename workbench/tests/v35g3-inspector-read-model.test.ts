import assert from "node:assert/strict";
import { cpSync, linkSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { readGoal25ComparisonSafeV35, unavailableAdaptationLineageV35, unavailableGoal25ComparisonV35, unavailableStateHistoryV35, unavailableV2RecoveryV35 } from "../src/read-model/workbench-v35g3.ts";
import { digestObject, stableJson } from "../src/hash.ts";
import { inspectGoal25PairV35 } from "../src/v35g25/inspect-v35g25.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const ACCEPTED_PAIR = "C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01";
const ACCEPTED_COMPARISON_DIGEST = "243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f";

function copy(label: string): string {
	const root = resolve(PROJECT_ROOT, ".runs/v3-5-g3/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(root, { recursive: true });
	cpSync(ACCEPTED_PAIR, root, { recursive: true });
	return root;
}

test("Goal 2.5 Inspector directly projects the accepted Pair and exact frozen digest", () => {
	const inspected = inspectGoal25PairV35({ pairRoot: ACCEPTED_PAIR });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.comparison?.comparison_digest, ACCEPTED_COMPARISON_DIGEST);
	assert.equal(inspected.base?.outcome.verifier_runs, 1);
	assert.equal(inspected.candidate?.outcome.verifier_runs, 1);
	const view = readGoal25ComparisonSafeV35({ pairRoot: ACCEPTED_PAIR });
	assert.equal(view.comparison_digest, ACCEPTED_COMPARISON_DIGEST);
	assert.equal(view.base?.task_outcome, "passed");
	assert.equal(view.candidate?.task_outcome, "passed");
	assert.ok((view.candidate?.input_tokens ?? 0) > (view.base?.input_tokens ?? 0));
	assert.equal(view.result_statement, "Both arms passed; no task-success advantage was observed for the Skill; Candidate used more tokens.");
	assert.doesNotMatch(JSON.stringify(view), /C:\\|C:\/|private.reasoning|Bearer\s+/i);
});

test("Goal 2.5 Inspector rejects exact-key, coherent aggregate, ArtifactRef, outcome and hardlink tampering", () => {
	const extra = copy("extra-key");
	const extraPath = resolve(extra, "comparison.json");
	const extraValue = JSON.parse(readFileSync(extraPath, "utf8"));
	extraValue.unexpected = true;
	writeFileSync(extraPath, `${stableJson(extraValue)}\n`);
	assert.equal(inspectGoal25PairV35({ pairRoot: extra }).integrity_valid, false);

	const aggregate = copy("aggregate");
	const aggregatePath = resolve(aggregate, "comparison.json");
	const aggregateValue = JSON.parse(readFileSync(aggregatePath, "utf8"));
	aggregateValue.input_tokens += 1;
	const aggregateBody = { ...aggregateValue };
	delete aggregateBody.comparison_digest;
	aggregateValue.comparison_digest = digestObject(aggregateBody);
	writeFileSync(aggregatePath, `${stableJson(aggregateValue)}\n`);
	assert.equal(inspectGoal25PairV35({ pairRoot: aggregate }).integrity_valid, false);

	const outcome = copy("outcome");
	const outcomePath = resolve(outcome, "runs/v35-g25-stable-unique-base-run-01/outcome.json");
	const outcomeValue = JSON.parse(readFileSync(outcomePath, "utf8"));
	outcomeValue.verifier_runs = 0;
	writeFileSync(outcomePath, `${stableJson(outcomeValue)}\n`);
	assert.equal(inspectGoal25PairV35({ pairRoot: outcome }).integrity_valid, false);

	const traversal = copy("traversal");
	const traversalPath = resolve(traversal, "comparison.json");
	const traversalValue = JSON.parse(readFileSync(traversalPath, "utf8"));
	traversalValue.base_manifest_ref.path = "../outside.json";
	writeFileSync(traversalPath, `${stableJson(traversalValue)}\n`);
	assert.equal(inspectGoal25PairV35({ pairRoot: traversal }).integrity_valid, false);

	const hardlink = copy("hardlink");
	linkSync(resolve(hardlink, "comparison.json"), resolve(hardlink, "comparison-copy.json"));
	assert.equal(inspectGoal25PairV35({ pairRoot: hardlink }).integrity_valid, false);
});

test("safe Read Model keeps missing historical fields explicit", () => {
	const goal25 = unavailableGoal25ComparisonV35();
	assert.equal(goal25.source_status, "unavailable");
	assert.equal(goal25.aggregates.input_tokens, "not_recorded");
	assert.equal(unavailableV2RecoveryV35().source_status, "unavailable");
	assert.equal(unavailableAdaptationLineageV35().prompt_diff, "not_recorded");
	assert.equal(unavailableStateHistoryV35().active, "unavailable");
});
