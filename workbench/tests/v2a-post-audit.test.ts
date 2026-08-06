import assert from "node:assert/strict";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { ArtifactRefV0B } from "../src/contracts/v0b-types.ts";
import type { CandidatePathV2A, RunManifestV2A, RunTerminalV2A } from "../src/contracts/v2-types.ts";
import { digestObject, sha256, stableJson } from "../src/hash.ts";
import { inspectRunV2A } from "../src/inspect-v2.ts";
import { selectCandidateV2A } from "../src/recovery/selector-v2.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function rootFor(label: string): string {
	const parent = resolve(PROJECT_ROOT, ".runs/v2-a/post-audit-tests");
	mkdirSync(parent, { recursive: true });
	return resolve(parent, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${stableJson(value)}\n`, "utf8");
}

function readJsonl(path: string): Array<Record<string, unknown>> {
	return readFileSync(path, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as Record<string, unknown>);
}

function writeJsonl(path: string, lines: readonly unknown[]): void {
	writeFileSync(path, `${lines.map((line) => JSON.stringify(line)).join("\n")}\n`, "utf8");
}

function refreshedRef(ref: ArtifactRefV0B, path: string): ArtifactRefV0B {
	const bytes = readFileSync(path);
	return { ...ref, sha256: sha256(bytes), size_bytes: statSync(path).size };
}

function readTerminal(root: string): RunTerminalV2A {
	return readJson<RunTerminalV2A>(resolve(root, "terminal.json"));
}

function writeTerminal(root: string, terminal: RunTerminalV2A): void {
	writeJson(resolve(root, "terminal.json"), terminal);
}

function rehashCandidate(root: string, suffix: "a" | "b", candidate: CandidatePathV2A): ArtifactRefV0B {
	const path = resolve(root, `candidates/${suffix}/candidate.json`);
	writeJson(path, candidate);
	const terminal = readTerminal(root);
	const index = suffix === "a" ? 0 : 1;
	terminal.candidate_refs[index] = refreshedRef(terminal.candidate_refs[index]!, path);
	writeTerminal(root, terminal);
	return terminal.candidate_refs[index]!;
}

function rehashSelection(root: string, selection: unknown): void {
	const path = resolve(root, "selection.json");
	writeJson(path, selection);
	const terminal = readTerminal(root);
	terminal.selection_ref = refreshedRef(terminal.selection_ref!, path);
	terminal.selected_candidate_id = (selection as { selected_candidate_id: string | null }).selected_candidate_id;
	terminal.outcome = terminal.selected_candidate_id ? "recovery_selected" : "recovery_none";
	writeTerminal(root, terminal);
}

function rewriteJournal(root: string, update: (events: Array<Record<string, unknown>>) => void): void {
	const path = resolve(root, "journal.jsonl");
	const events = readJsonl(path);
	update(events);
	writeFileSync(path, `${events.map((event) => stableJson(event)).join("\n")}\n`, "utf8");
}

function updateCandidateJournalRefs(root: string, suffix: "a" | "b", candidate: CandidatePathV2A, candidateRef?: ArtifactRefV0B): void {
	rewriteJournal(root, (events) => {
		for (const event of events) {
			const data = event.data as Record<string, unknown> | undefined;
			if (data?.candidate_path_id !== candidate.candidate_path_id) continue;
			if (event.type === "candidate_started") {
				data.initial_workspace_ref = candidate.initial_workspace_ref;
				data.initial_workspace_digest = candidate.initial_workspace_digest;
				data.session_snapshot_before_run_ref = candidate.session_snapshot_before_run_ref;
				data.session_digest_before_run = candidate.session_digest_before_run;
			}
			if (event.type === "candidate_workspace_initial_frozen") {
				data.initial_workspace_ref = candidate.initial_workspace_ref;
				data.initial_workspace_digest = candidate.initial_workspace_digest;
			}
			if (event.type === "candidate_terminal") {
				data.session_ref = candidate.session_ref;
				data.verifier_result_ref = candidate.verifier_result_ref;
				data.verifier_status = candidate.verifier_status;
				data.terminal_reason = candidate.terminal_reason;
				if (candidateRef) data.candidate_ref = candidateRef;
			}
		}
	});
}

async function makeRecoveryRun(label: string, modes: readonly ["pass" | "fail" | "budget_stop", "pass" | "fail" | "budget_stop"] = ["pass", "fail"]): Promise<string> {
	const root = rootFor(label);
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root, runId: `v2a-post-audit-${label}`, primaryMode: "fail", candidateModes: modes });
	const valid = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
	assert.equal(valid.integrity_valid, true, valid.errors.join("; "));
	return root;
}

test("V2A-AUDIT-P1-001 derives Verifier pass from raw result/output, not coherently rehashed summaries", async () => {
	for (const variant of ["forged-summary", "tampered-raw-output"] as const) {
		const root = await makeRecoveryRun(`p1-001-${variant}`, ["fail", "fail"]);
		const candidatePath = resolve(root, "candidates/a/candidate.json");
		const candidate = readJson<CandidatePathV2A>(candidatePath);
		if (variant === "tampered-raw-output") writeFileSync(resolve(root, "candidates/a/verifier-output.txt"), "tampered raw verifier output\n", "utf8");
		candidate.verifier_status = "passed";
		candidate.hard_gates.verifier_passed = true;
		const candidateRef = rehashCandidate(root, "a", candidate);
		updateCandidateJournalRefs(root, "a", candidate, candidateRef);
		const candidateB = readJson<CandidatePathV2A>(resolve(root, "candidates/b/candidate.json"));
		const selection = selectCandidateV2A(candidate.recovery_group_id, [candidate, candidateB]);
		rehashSelection(root, selection);
		const rejected = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
		assert.match(rejected.errors.join("; "), /Verifier|derived Hard Gates|Selection Decision/i);
	}
});

test("V2A-AUDIT-P1-002 rejects foreign, changed, aliased and divergent Session lineage after coherent rehash", async () => {
	for (const variant of ["foreign-parent", "same-count-entry", "aliased-session-id", "divergent-final-prefix"] as const) {
		const root = await makeRecoveryRun(`p1-002-${variant}`);
		const candidatePath = resolve(root, "candidates/a/candidate.json");
		const candidate = readJson<CandidatePathV2A>(candidatePath);
		const beforePath = resolve(root, candidate.session_snapshot_before_run_ref.path);
		const finalPath = resolve(root, candidate.session_ref.path);
		const before = readJsonl(beforePath);
		const final = readJsonl(finalPath);
		if (variant === "foreign-parent") {
			before[0]!.parentSession = "C:\\forged\\unrelated-parent.jsonl";
			final[0]!.parentSession = before[0]!.parentSession;
		} else if (variant === "same-count-entry") {
			const beforeMessage = before[1]!.message as Record<string, unknown>;
			const finalMessage = final[1]!.message as Record<string, unknown>;
			beforeMessage.content = [{ type: "text", text: "forged same-count parent entry" }];
			finalMessage.content = structuredClone(beforeMessage.content);
		} else if (variant === "aliased-session-id") {
			const parent = readJsonl(resolve(root, readTerminal(root).primary_session_ref.path));
			before[0]!.id = parent[0]!.id;
			final[0]!.id = parent[0]!.id;
		} else {
			const message = final[1]!.message as Record<string, unknown>;
			message.content = [{ type: "text", text: "divergent final prefix" }];
		}
		writeJsonl(beforePath, before);
		writeJsonl(finalPath, final);
		candidate.session_snapshot_before_run_ref = refreshedRef(candidate.session_snapshot_before_run_ref, beforePath);
		candidate.session_digest_before_run = candidate.session_snapshot_before_run_ref.sha256;
		candidate.session_ref = refreshedRef(candidate.session_ref, finalPath);
		const candidateRef = rehashCandidate(root, "a", candidate);
		updateCandidateJournalRefs(root, "a", candidate, candidateRef);
		const rejected = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
		assert.match(rejected.errors.join("; "), /Session|parent|prefix|unique/i);
	}
});

test("V2A-AUDIT-P1-003 rejects missing, tampered, cross, final-substituted and coherently wrong initial Workspace evidence", async () => {
	for (const variant of ["missing", "tampered", "cross-candidate", "final-substituted", "coherent-wrong"] as const) {
		const root = await makeRecoveryRun(`p1-003-${variant}`);
		const candidate = readJson<CandidatePathV2A>(resolve(root, "candidates/a/candidate.json"));
		const initialPath = resolve(root, candidate.initial_workspace_ref.path);
		if (variant === "missing") {
			candidate.initial_workspace_ref = { ...candidate.initial_workspace_ref, path: "candidates/a/missing-initial.json" };
			candidate.workspace_ref = candidate.initial_workspace_ref;
		} else if (variant === "tampered") {
			writeFileSync(initialPath, `${readFileSync(initialPath, "utf8")} `, "utf8");
		} else if (variant === "cross-candidate") {
			const other = readJson<CandidatePathV2A>(resolve(root, "candidates/b/candidate.json"));
			candidate.initial_workspace_ref = structuredClone(other.initial_workspace_ref);
			candidate.workspace_ref = structuredClone(other.initial_workspace_ref);
		} else if (variant === "final-substituted") {
			candidate.initial_workspace_ref = structuredClone(candidate.final_workspace_ref);
			candidate.workspace_ref = structuredClone(candidate.final_workspace_ref);
		} else {
			const snapshot = readJson<{ digest: string; inventory: Array<{ sha256: string }>; file_links: unknown[] }>(initialPath);
			snapshot.inventory[0]!.sha256 = "0".repeat(64);
			snapshot.digest = digestObject(snapshot.inventory);
			writeJson(initialPath, snapshot);
			candidate.initial_workspace_ref = refreshedRef(candidate.initial_workspace_ref, initialPath);
			candidate.workspace_ref = structuredClone(candidate.initial_workspace_ref);
			candidate.initial_workspace_digest = snapshot.digest;
		}
		const candidateRef = rehashCandidate(root, "a", candidate);
		updateCandidateJournalRefs(root, "a", candidate, candidateRef);
		const rejected = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
		assert.match(rejected.errors.join("; "), /initial Workspace|Artifact path|artifact|Seed/i);
	}
});

test("V2A-AUDIT-P1-004 recomputes fixed caps, raw Attempt usage, Group totals and budget terminal gates", async () => {
	for (const variant of ["manifest-cap-raise", "raw-over-cap", "group-under-report", "terminal-gate-flip"] as const) {
		const root = await makeRecoveryRun(`p1-004-${variant}`, variant === "terminal-gate-flip" ? ["budget_stop", "pass"] : ["pass", "fail"]);
		if (variant === "manifest-cap-raise") {
			const manifestPath = resolve(root, "config/manifest.json");
			const manifest = readJson<RunManifestV2A>(manifestPath);
			(manifest as unknown as { per_attempt_budget: { faux_provider_dispatches_max: number } }).per_attempt_budget.faux_provider_dispatches_max = 99;
			const { manifest_id: _old, ...body } = manifest;
			manifest.manifest_id = digestObject(body);
			writeJson(manifestPath, manifest);
			const terminal = readTerminal(root);
			terminal.manifest_id = manifest.manifest_id;
			writeTerminal(root, terminal);
			rewriteJournal(root, (events) => {
				const runStarted = events.find((event) => event.type === "run_started")!;
				const data = runStarted.data as Record<string, unknown>;
				data.manifest_ref = refreshedRef(data.manifest_ref as ArtifactRefV0B, manifestPath);
			});
		} else if (variant === "raw-over-cap") {
			const candidate = readJson<CandidatePathV2A>(resolve(root, "candidates/a/candidate.json"));
			const sessionPath = resolve(root, candidate.session_ref.path);
			const lines = readJsonl(sessionPath);
			for (let index = 0; index < 6; index++) {
				lines.push({ type: "message", id: `forged-extra-${index}`, parentId: null, timestamp: new Date().toISOString(), message: { role: "assistant", content: [{ type: "text", text: "forged" }], provider: "v2a-faux", model: "faux-1", stopReason: "stop", usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } } });
			}
			writeJsonl(sessionPath, lines);
			candidate.session_ref = refreshedRef(candidate.session_ref, sessionPath);
			candidate.budget_usage.faux_provider_dispatches = 9;
			(candidate.budget_caps as { faux_provider_dispatches_max: number }).faux_provider_dispatches_max = 99;
			candidate.budget_within_limits = true;
			candidate.hard_gates.budget_valid = true;
			const candidateRef = rehashCandidate(root, "a", candidate);
			updateCandidateJournalRefs(root, "a", candidate, candidateRef);
		} else if (variant === "group-under-report") {
			const groupPath = resolve(root, "recovery-group.json");
			const group = readJson<{ budget_usage: { faux_provider_dispatches: number; tool_calls: number; verifier_runs: number } }>(groupPath);
			group.budget_usage = { faux_provider_dispatches: 1, tool_calls: 0, verifier_runs: 1 };
			writeJson(groupPath, group);
		} else {
			const candidate = readJson<CandidatePathV2A>(resolve(root, "candidates/a/candidate.json"));
			candidate.settled = true;
			candidate.terminal_reason = "settled";
			candidate.budget_within_limits = true;
			candidate.hard_gates.unique_terminal_settled = true;
			candidate.hard_gates.budget_valid = true;
			const candidateRef = rehashCandidate(root, "a", candidate);
			updateCandidateJournalRefs(root, "a", candidate, candidateRef);
		}
		const rejected = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
		assert.match(rejected.errors.join("; "), /budget|terminal|Manifest frozen constants|raw-derived/i);
	}
});

test("V2A-AUDIT-P1-005 rejects forged/rehashed Pi, revision, constants and stale source evidence", async () => {
	for (const variant of ["pi", "revision", "model", "stale-source"] as const) {
		const root = await makeRecoveryRun(`p1-005-${variant}`);
		const manifestPath = resolve(root, "config/manifest.json");
		const manifest = readJson<RunManifestV2A>(manifestPath);
		const mutableManifest = manifest as unknown as { pi_commit: string; workbench_revision: string; model_id: string };
		const seedPath = resolve(root, "seed/recovery-seed.json");
		const seed = readJson<Record<string, unknown>>(seedPath);
		if (variant === "pi") {
			mutableManifest.pi_commit = "0".repeat(40);
			seed.pi_commit = "0".repeat(40);
		} else if (variant === "revision") {
			mutableManifest.workbench_revision = "forged-revision";
		} else if (variant === "model") {
			mutableManifest.model_id = "forged/model";
		} else {
			const sourcePath = resolve(root, manifest.workbench_source_ref.path);
			const source = readJson<{ digest: string; inventory: Array<{ sha256: string }> }>(sourcePath);
			source.inventory[0]!.sha256 = "f".repeat(64);
			source.digest = digestObject(source.inventory);
			writeJson(sourcePath, source);
			manifest.workbench_source_ref = refreshedRef(manifest.workbench_source_ref, sourcePath);
			manifest.workbench_source_digest = source.digest;
			seed.workbench_source_ref = structuredClone(manifest.workbench_source_ref);
			seed.workbench_digest = source.digest;
		}
		const { manifest_id: _old, ...body } = manifest;
		manifest.manifest_id = digestObject(body);
		writeJson(manifestPath, manifest);
		writeJson(seedPath, seed);
		const terminal = readTerminal(root);
		terminal.manifest_id = manifest.manifest_id;
		terminal.recovery_seed_ref = refreshedRef(terminal.recovery_seed_ref!, seedPath);
		writeTerminal(root, terminal);
		rewriteJournal(root, (events) => {
			const runStarted = events.find((event) => event.type === "run_started")!;
			const runData = runStarted.data as Record<string, unknown>;
			runData.manifest_ref = refreshedRef(runData.manifest_ref as ArtifactRefV0B, manifestPath);
			runData.workbench_source_ref = manifest.workbench_source_ref;
			const seedFrozen = events.find((event) => event.type === "seed_frozen")!;
			(seedFrozen.data as Record<string, unknown>).recovery_seed_ref = terminal.recovery_seed_ref;
		});
		const rejected = inspectRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
		assert.match(rejected.errors.join("; "), /Manifest frozen constants|Workbench source|Recovery Seed lineage\/source/i);
	}
});
