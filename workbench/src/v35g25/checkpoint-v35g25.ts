import { readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { JsonlSessionRepo, type JsonlSessionMetadata, type Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type {
	Goal25ArmOutcomeV35,
	Goal25PreVerifierCheckpointV35,
	Goal25RuntimeEvidenceV35,
	Goal25SettledVerifierHandoffV35,
} from "../contracts/v35g25-types.ts";
import type { Goal2FirstProviderPayloadEvidenceV35 } from "../contracts/v35g2-types.ts";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { BoundedTaskPolicy } from "../types.ts";
import {
	artifactRef,
	readJsonArtifact,
	validateArtifactRef,
	writeOnceBytes,
	writeOnceJson,
} from "../evidence/artifacts.ts";
import { digestObject, stableJson, treeDigest, treeInventory } from "../hash.ts";
import { readProtectedBytes } from "../pi/tool-profile.ts";
import { validateGoal2FirstPayloadEvidenceV35 } from "../v35g2/payload-fairness-v35g2.ts";

function checkpointBody(checkpoint: Goal25PreVerifierCheckpointV35): Omit<Goal25PreVerifierCheckpointV35, "checkpoint_digest"> {
	const { checkpoint_digest: _digest, ...body } = checkpoint;
	return body;
}

function outcomeBody(outcome: Goal25ArmOutcomeV35): Omit<Goal25ArmOutcomeV35, "outcome_digest"> {
	const { outcome_digest: _digest, ...body } = outcome;
	return body;
}

function settledHandoffBody(handoff: Goal25SettledVerifierHandoffV35): Omit<Goal25SettledVerifierHandoffV35, "handoff_digest"> {
	const { handoff_digest: _digest, ...body } = handoff;
	return body;
}

function runtimeBody(runtime: Goal25RuntimeEvidenceV35): Omit<Goal25RuntimeEvidenceV35, "runtime_digest"> {
	const { runtime_digest: _digest, ...body } = runtime;
	return body;
}

function portable(value: string): string { return value.split(sep).join("/"); }

export function sessionToolLifecycleClosedV35(entries: readonly unknown[]): boolean {
	const calls = new Set<string>();
	const results = new Set<string>();
	for (const entry of entries) {
		if (!entry || typeof entry !== "object") return false;
		const message = (entry as { message?: unknown }).message;
		if (!message || typeof message !== "object") continue;
		const role = (message as { role?: unknown }).role;
		if (role === "assistant") {
			const content = (message as { content?: unknown }).content;
			if (!Array.isArray(content)) return false;
			for (const block of content) {
				if (!block || typeof block !== "object" || (block as { type?: unknown }).type !== "toolCall") continue;
				const id = (block as { id?: unknown }).id;
				if (typeof id !== "string" || id === "" || calls.has(id)) return false;
				calls.add(id);
			}
		} else if (role === "toolResult") {
			const id = (message as { toolCallId?: unknown }).toolCallId;
			if (typeof id !== "string" || !calls.has(id) || results.has(id)) return false;
			results.add(id);
		}
	}
	return calls.size === results.size;
}

export function goal25CheckpointGateErrors(checkpoint: Goal25PreVerifierCheckpointV35): string[] {
	const errors: string[] = [];
	if (checkpoint.checkpoint_digest !== digestObject(checkpointBody(checkpoint))) errors.push("checkpoint digest mismatch");
	if (checkpoint.trajectory_outcome !== "pre_dispatch_budget_terminal" || checkpoint.task_outcome !== null) errors.push("terminal outcome invalid");
	if (checkpoint.request_attempts !== 17 || checkpoint.provider_dispatches !== 16 || checkpoint.provider_responses !== 16) errors.push("request/dispatch/response counters invalid");
	if (checkpoint.pending_provider_reservations !== 0) errors.push("Provider reservation remains pending");
	if (checkpoint.pending_tool_calls !== 0) errors.push("Tool call remains pending");
	if (checkpoint.pending_side_effects !== 0) errors.push("side effect remains pending");
	if (!checkpoint.usage_known) errors.push("usage is unknown");
	if (!checkpoint.provider_usage_reconciled) errors.push("Provider usage is not reconciled");
	if (!checkpoint.session_reopen_equal) errors.push("public Session reopen mismatch");
	if (!checkpoint.tool_calls_closed) errors.push("Tool Result closure invalid");
	if (!checkpoint.workspace_unchanged_since_terminal) errors.push("Workspace changed after terminal");
	if (!checkpoint.protected_unchanged) errors.push("protected Workspace bytes changed");
	if (!checkpoint.first_payload_present) errors.push("first Provider payload evidence missing");
	if (checkpoint.timed_out) errors.push("timeout terminal is ineligible");
	if (checkpoint.post_dispatch_loss) errors.push("post-dispatch loss is ineligible");
	if (!checkpoint.checkpoint_before_verifier || checkpoint.checkpoint_sequence !== 1) errors.push("checkpoint ordering invalid");
	if (!Number.isSafeInteger(checkpoint.session_entry_count) || checkpoint.session_entry_count < 2) errors.push("Session entry count invalid");
	if (checkpoint.session_ref === "" || checkpoint.session_ref === ".." || checkpoint.session_ref.startsWith("../")) errors.push("Session reference invalid");
	return errors;
}

export async function createGoal25PreVerifierCheckpointV35(options: {
	runRoot: string;
	runtime: Goal25RuntimeEvidenceV35;
	session: Session<JsonlSessionMetadata>;
	sessionEvidenceRoot: string;
	sessionRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	firstPayloadRef: ArtifactRefV0B;
	firstPayloadToolsSha256: string;
	timedOut?: boolean;
	postDispatchLoss?: boolean;
}): Promise<{ checkpoint: Goal25PreVerifierCheckpointV35; ref: ArtifactRefV0B }> {
	if (options.runtime.trajectory_outcome !== "pre_dispatch_budget_terminal") throw new Error("Goal 2.5 checkpoint requires the typed pre-dispatch budget terminal");
	const metadata = await options.session.getMetadata();
	const liveEntries = await options.session.getEntries();
	const repo = new JsonlSessionRepo({
		fs: new NodeExecutionEnv({ cwd: options.sessionRoot, shellEnv: {} }),
		sessionsRoot: resolve(options.sessionRoot),
	});
	const reopened = await repo.open(metadata);
	const reopenedMetadata = await reopened.getMetadata();
	const reopenedEntries = await reopened.getEntries();
	const sessionReopenEqual =
		reopenedMetadata.id === metadata.id &&
		resolve(reopenedMetadata.path) === resolve(metadata.path) &&
		stableJson(reopenedEntries) === stableJson(liveEntries);
	const sessionRef = portable(relative(resolve(options.sessionEvidenceRoot), resolve(metadata.path)));
	if (sessionRef === "" || sessionRef === ".." || sessionRef.startsWith("../")) throw new Error("Goal 2.5 budget-terminal Session is outside its evidence root");
	const sessionSnapshotRef = artifactRef(
		options.runRoot,
		writeOnceBytes(options.runRoot, "checkpoint/session-pre-verifier.jsonl", readFileSync(metadata.path)),
		"application/x-ndjson",
		false,
	);
	const workspaceSnapshot = { schema_version: 1, files: treeInventory(options.workspaceRoot) };
	const workspaceSnapshotRef = writeOnceJson(options.runRoot, "checkpoint/workspace-pre-verifier.json", workspaceSnapshot);
	const runtimeRef = artifactRef(options.runRoot, "runtime-v35g25.json", "application/json", false);
	const workspaceTreeSha256 = treeDigest(options.workspaceRoot);
	const protectedBytesSha256 = digestObject(readProtectedBytes(options.workspaceRoot, options.taskPolicy));
	const protectedBeforeSha256 = digestObject(options.protectedBefore);
	const rawResponses = reopenedEntries.flatMap((entry) => {
		if (!entry || typeof entry !== "object" || !("message" in entry)) return [];
		const message = entry.message;
		if (!message || typeof message !== "object" || (message as { role?: unknown }).role !== "assistant") return [];
		if ((message as { stopReason?: unknown }).stopReason === "error" && String((message as { errorMessage?: unknown }).errorMessage ?? "").includes("V35_G2_5_PROVIDER_REQUEST_BUDGET_EXHAUSTED")) return [];
		const usage = (message as { usage?: unknown }).usage;
		if (!usage || typeof usage !== "object") return [{ input_tokens: Number.NaN, output_tokens: Number.NaN, cost_usd: Number.NaN }];
		const value = usage as { input?: unknown; output?: unknown; cacheRead?: unknown; cacheWrite?: unknown; cost?: { total?: unknown } };
		return [{
			input_tokens: Number(value.input) + Number(value.cacheRead) + Number(value.cacheWrite),
			output_tokens: Number(value.output),
			cost_usd: Number(value.cost?.total),
		}];
	});
	const respondedReservations = options.runtime.reservations.filter((reservation) => reservation.state === "responded");
	const providerUsageReconciled =
		rawResponses.length === options.runtime.provider_responses &&
		stableJson(rawResponses) === stableJson(respondedReservations.map((reservation) => ({
			input_tokens: reservation.input_tokens,
			output_tokens: reservation.output_tokens,
			cost_usd: reservation.cost_usd,
		}))) &&
		rawResponses.every((usage) => Object.values(usage).every((value) => Number.isFinite(value) && value >= 0));
	const body: Omit<Goal25PreVerifierCheckpointV35, "checkpoint_digest"> = {
		schema_version: 1,
		run_id: options.runtime.run_id,
		session_id: options.runtime.session_id,
		trajectory_outcome: "pre_dispatch_budget_terminal",
		task_outcome: null,
		checkpoint_sequence: 1,
		request_attempts: options.runtime.request_attempts as 17,
		provider_dispatches: options.runtime.provider_dispatches as 16,
		provider_responses: options.runtime.provider_responses as 16,
		pending_provider_reservations: options.runtime.pending_provider_reservations as 0,
		pending_tool_calls: options.runtime.pending_tool_calls as 0,
		pending_side_effects: options.runtime.pending_side_effects as 0,
		usage_known: options.runtime.usage_known as true,
		provider_usage_reconciled: providerUsageReconciled as true,
		session_reopen_equal: sessionReopenEqual as true,
		tool_calls_closed: sessionToolLifecycleClosedV35(reopenedEntries) as true,
		workspace_unchanged_since_terminal: (workspaceTreeSha256 === options.runtime.workspace_tree_sha256_at_terminal) as true,
		protected_unchanged: (protectedBytesSha256 === protectedBeforeSha256 && protectedBytesSha256 === options.runtime.protected_bytes_sha256_at_terminal) as true,
		first_payload_present: (validateArtifactRef(options.runRoot, options.firstPayloadRef).length === 0) as true,
		timed_out: (options.timedOut ?? false) as false,
		post_dispatch_loss: (options.postDispatchLoss ?? false) as false,
		checkpoint_before_verifier: true,
		workspace_tree_sha256: workspaceTreeSha256,
		protected_bytes_sha256: protectedBytesSha256,
		session_ref: sessionRef,
		session_entry_count: reopenedEntries.length,
		session_entries_sha256: digestObject(reopenedEntries),
		first_payload_sha256: options.firstPayloadRef.sha256,
		tool_interface_sha256: options.runtime.tool_interface_sha256,
		runtime_ref: runtimeRef,
		first_payload_ref: options.firstPayloadRef,
		session_snapshot_ref: sessionSnapshotRef,
		workspace_snapshot_ref: workspaceSnapshotRef,
	};
	if (options.firstPayloadToolsSha256 !== options.runtime.tool_interface_sha256) throw new Error("Goal 2.5 first-payload Tool-interface digest mismatch");
	const checkpoint = { ...body, checkpoint_digest: digestObject(body) };
	const errors = goal25CheckpointGateErrors(checkpoint);
	if (errors.length > 0) throw new Error(`Goal 2.5 pre-Verifier checkpoint rejected: ${errors.join("; ")}`);
	const ref = writeOnceJson(options.runRoot, "checkpoint/pre-verifier.json", checkpoint);
	return { checkpoint, ref };
}

export async function inspectGoal25PreVerifierCheckpointV35(options: {
	runRoot: string;
	checkpointRef: ArtifactRefV0B;
	sessionRoot: string;
	sessionEvidenceRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	expectedRunId: string;
	expectedSessionId: string;
	expectedToolInterfaceSha256: string;
}): Promise<Goal25PreVerifierCheckpointV35> {
	const refErrors = validateArtifactRef(options.runRoot, options.checkpointRef);
	if (refErrors.length > 0) throw new Error(`Goal 2.5 checkpoint artifact invalid: ${refErrors.join("; ")}`);
	const checkpoint = readJsonArtifact<Goal25PreVerifierCheckpointV35>(options.runRoot, options.checkpointRef.path);
	const errors = goal25CheckpointGateErrors(checkpoint);
	for (const ref of [checkpoint.runtime_ref, checkpoint.first_payload_ref, checkpoint.session_snapshot_ref, checkpoint.workspace_snapshot_ref]) {
		errors.push(...validateArtifactRef(options.runRoot, ref));
	}
	const runtime = readJsonArtifact<Goal25RuntimeEvidenceV35>(options.runRoot, checkpoint.runtime_ref.path);
	if (runtime.runtime_digest !== digestObject(runtimeBody(runtime))) errors.push("runtime digest mismatch");
	if (
		runtime.run_id !== checkpoint.run_id ||
		runtime.session_id !== checkpoint.session_id ||
		runtime.trajectory_outcome !== checkpoint.trajectory_outcome ||
		runtime.request_attempts !== checkpoint.request_attempts ||
		runtime.provider_dispatches !== checkpoint.provider_dispatches ||
		runtime.provider_responses !== checkpoint.provider_responses ||
		runtime.tool_interface_sha256 !== checkpoint.tool_interface_sha256 ||
		runtime.workspace_tree_sha256_at_terminal !== checkpoint.workspace_tree_sha256 ||
		runtime.protected_bytes_sha256_at_terminal !== checkpoint.protected_bytes_sha256
	) errors.push("runtime/checkpoint lineage mismatch");
	const firstPayload = readJsonArtifact<{ tools_sha256?: unknown }>(options.runRoot, checkpoint.first_payload_ref.path);
	if (checkpoint.first_payload_sha256 !== checkpoint.first_payload_ref.sha256 || firstPayload.tools_sha256 !== checkpoint.tool_interface_sha256) errors.push("first-payload/checkpoint lineage mismatch");
	const workspaceSnapshot = readJsonArtifact<{ files?: unknown }>(options.runRoot, checkpoint.workspace_snapshot_ref.path);
	if (digestObject(workspaceSnapshot.files) !== checkpoint.workspace_tree_sha256) errors.push("Workspace snapshot digest mismatch");
	const sessionLines = readFileSync(resolve(options.runRoot, checkpoint.session_snapshot_ref.path), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line) as unknown);
	if (sessionLines.length < 2 || sessionLines.length - 1 !== checkpoint.session_entry_count || digestObject(sessionLines.slice(1)) !== checkpoint.session_entries_sha256) errors.push("Session snapshot identity mismatch");
	if (checkpoint.run_id !== options.expectedRunId || checkpoint.session_id !== options.expectedSessionId) errors.push("expected checkpoint lineage mismatch");
	if (checkpoint.tool_interface_sha256 !== options.expectedToolInterfaceSha256) errors.push("Tool-interface digest identity mismatch");
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: options.sessionRoot, shellEnv: {} }), sessionsRoot: resolve(options.sessionRoot) });
	const matches = (await repo.list()).filter((entry) => entry.id === checkpoint.session_id);
	if (matches.length !== 1) errors.push("persisted Session identity unavailable");
	else {
		const reopened = await repo.open(matches[0]!);
		const metadata = await reopened.getMetadata();
		const entries = await reopened.getEntries();
		const sessionRef = portable(relative(resolve(options.sessionEvidenceRoot), resolve(metadata.path)));
		if (metadata.id !== checkpoint.session_id || sessionRef !== checkpoint.session_ref || entries.length !== checkpoint.session_entry_count || digestObject(entries) !== checkpoint.session_entries_sha256 || !sessionToolLifecycleClosedV35(entries)) errors.push("current Session/Tool closure mismatch");
	}
	const workspaceTreeSha256 = treeDigest(options.workspaceRoot);
	const protectedBytesSha256 = digestObject(readProtectedBytes(options.workspaceRoot, options.taskPolicy));
	if (workspaceTreeSha256 !== checkpoint.workspace_tree_sha256) errors.push("current Workspace drifted before Verifier");
	if (protectedBytesSha256 !== checkpoint.protected_bytes_sha256 || protectedBytesSha256 !== digestObject(options.protectedBefore)) errors.push("current protected bytes drifted before Verifier");
	if (errors.length > 0) throw new Error(`Goal 2.5 checkpoint inspection rejected: ${errors.join("; ")}`);
	return checkpoint;
}

export async function handoffGoal25VerifierV35(options: {
	runRoot: string;
	checkpointRef: ArtifactRefV0B;
	sessionRoot: string;
	sessionEvidenceRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	expectedRunId: string;
	expectedSessionId: string;
	expectedToolInterfaceSha256: string;
	runVerifier: () => Promise<"passed" | "failed">;
}): Promise<Goal25ArmOutcomeV35> {
	const checkpoint = await inspectGoal25PreVerifierCheckpointV35(options);
	const taskOutcome = await options.runVerifier();
	const body: Omit<Goal25ArmOutcomeV35, "outcome_digest"> = {
		schema_version: 1,
		run_id: checkpoint.run_id,
		trajectory_outcome: checkpoint.trajectory_outcome,
		task_outcome: taskOutcome,
		verifier_runs: 1,
		candidate_eligible: true,
		tool_interface_sha256: checkpoint.tool_interface_sha256,
	};
	const outcome = { ...body, outcome_digest: digestObject(body) };
	writeOnceJson(options.runRoot, "outcome.json", outcome);
	if (outcome.outcome_digest !== digestObject(outcomeBody(outcome))) throw new Error("Goal 2.5 outcome identity failure");
	return outcome;
}

export async function createGoal25SettledVerifierHandoffV35(options: {
	runRoot: string;
	runtime: Goal25RuntimeEvidenceV35;
	session: Session<JsonlSessionMetadata>;
	sessionEvidenceRoot: string;
	sessionRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	firstPayloadRef: ArtifactRefV0B;
	firstPayloadToolsSha256: string;
}): Promise<{ handoff: Goal25SettledVerifierHandoffV35; ref: ArtifactRefV0B }> {
	const runtimeRef = artifactRef(options.runRoot, "runtime-v35g25.json", "application/json", false);
	const persistedRuntime = readJsonArtifact<Goal25RuntimeEvidenceV35>(options.runRoot, runtimeRef.path);
	const runtimeAuthenticated = validateArtifactRef(options.runRoot, runtimeRef).length === 0 && persistedRuntime.runtime_digest === digestObject(runtimeBody(persistedRuntime));
	const runtimeMatchesExpected = stableJson(persistedRuntime) === stableJson(options.runtime);
	const metadata = await options.session.getMetadata();
	const liveEntries = await options.session.getEntries();
	const repo = new JsonlSessionRepo({
		fs: new NodeExecutionEnv({ cwd: options.sessionRoot, shellEnv: {} }),
		sessionsRoot: resolve(options.sessionRoot),
	});
	const reopened = await repo.open(metadata);
	const reopenedMetadata = await reopened.getMetadata();
	const reopenedEntries = await reopened.getEntries();
	const sessionRef = portable(relative(resolve(options.sessionEvidenceRoot), resolve(metadata.path)));
	if (sessionRef === "" || sessionRef === ".." || sessionRef.startsWith("../")) throw new Error("Goal 2.5 settled Session is outside its evidence root");
	const sessionReopenEqual =
		metadata.id === options.runtime.session_id &&
		reopenedMetadata.id === metadata.id &&
		resolve(reopenedMetadata.path) === resolve(metadata.path) &&
		stableJson(reopenedEntries) === stableJson(liveEntries);
	const workspaceTreeSha256 = treeDigest(options.workspaceRoot);
	const protectedBytesSha256 = digestObject(readProtectedBytes(options.workspaceRoot, options.taskPolicy));
	const firstPayloadErrors = validateArtifactRef(options.runRoot, options.firstPayloadRef);
	const firstPayload = firstPayloadErrors.length === 0
		? readJsonArtifact<Goal2FirstProviderPayloadEvidenceV35>(options.runRoot, options.firstPayloadRef.path)
		: null;
	const firstPayloadAuthenticated = firstPayload !== null &&
		validateGoal2FirstPayloadEvidenceV35(firstPayload) &&
		firstPayload.run_id === options.runtime.run_id &&
		firstPayload.tools_sha256 === options.runtime.tool_interface_sha256 &&
		options.firstPayloadToolsSha256 === options.runtime.tool_interface_sha256;
	const sessionSnapshotRef = artifactRef(
		options.runRoot,
		writeOnceBytes(options.runRoot, "settled-handoff/session-pre-verifier.jsonl", readFileSync(metadata.path)),
		"application/x-ndjson",
		false,
	);
	const workspaceSnapshotRef = writeOnceJson(options.runRoot, "settled-handoff/workspace-pre-verifier.json", { schema_version: 1, files: treeInventory(options.workspaceRoot) });
	const body: Omit<Goal25SettledVerifierHandoffV35, "handoff_digest"> = {
		schema_version: 1,
		run_id: options.runtime.run_id,
		session_id: options.runtime.session_id,
		trajectory_outcome: "settled",
		task_outcome: null,
		handoff_sequence: 1,
		runtime_authenticated: runtimeAuthenticated as true,
		runtime_matches_expected: runtimeMatchesExpected as true,
		session_reopen_equal: sessionReopenEqual as true,
		tool_calls_closed: sessionToolLifecycleClosedV35(reopenedEntries) as true,
		workspace_unchanged_since_terminal: (workspaceTreeSha256 === options.runtime.workspace_tree_sha256_at_terminal) as true,
		protected_unchanged: (protectedBytesSha256 === digestObject(options.protectedBefore) && protectedBytesSha256 === options.runtime.protected_bytes_sha256_at_terminal) as true,
		first_payload_authenticated: firstPayloadAuthenticated as true,
		handoff_before_verifier: true,
		session_ref: sessionRef,
		session_entry_count: reopenedEntries.length,
		session_entries_sha256: digestObject(reopenedEntries),
		workspace_tree_sha256: workspaceTreeSha256,
		protected_bytes_sha256: protectedBytesSha256,
		tool_interface_sha256: options.runtime.tool_interface_sha256,
		runtime_ref: runtimeRef,
		first_payload_ref: options.firstPayloadRef,
		session_snapshot_ref: sessionSnapshotRef,
		workspace_snapshot_ref: workspaceSnapshotRef,
	};
	const handoff = { ...body, handoff_digest: digestObject(body) };
	const errors = goal25SettledHandoffGateErrors(handoff);
	if (errors.length > 0) throw new Error(`Goal 2.5 settled Verifier handoff rejected: ${errors.join("; ")}`);
	const ref = writeOnceJson(options.runRoot, "settled-handoff/pre-verifier.json", handoff);
	return { handoff, ref };
}

export function goal25SettledHandoffGateErrors(handoff: Goal25SettledVerifierHandoffV35): string[] {
	const errors: string[] = [];
	if (handoff.handoff_digest !== digestObject(settledHandoffBody(handoff))) errors.push("settled handoff digest mismatch");
	if (handoff.trajectory_outcome !== "settled" || handoff.task_outcome !== null) errors.push("settled outcome invalid");
	if (!handoff.runtime_authenticated || !handoff.runtime_matches_expected) errors.push("persisted Runtime authentication failed");
	if (!handoff.session_reopen_equal) errors.push("public Session reopen mismatch");
	if (!handoff.tool_calls_closed) errors.push("Tool Result closure invalid");
	if (!handoff.workspace_unchanged_since_terminal) errors.push("Workspace changed after settled terminal");
	if (!handoff.protected_unchanged) errors.push("protected Workspace bytes changed");
	if (!handoff.first_payload_authenticated) errors.push("first Provider payload evidence invalid");
	if (!handoff.handoff_before_verifier || handoff.handoff_sequence !== 1) errors.push("settled handoff ordering invalid");
	if (!Number.isSafeInteger(handoff.session_entry_count) || handoff.session_entry_count < 2) errors.push("Session entry count invalid");
	return errors;
}

export async function inspectGoal25SettledVerifierHandoffV35(options: {
	runRoot: string;
	handoffRef: ArtifactRefV0B;
	sessionRoot: string;
	sessionEvidenceRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	expectedRunId: string;
	expectedSessionId: string;
	expectedToolInterfaceSha256: string;
}): Promise<Goal25SettledVerifierHandoffV35> {
	const errors = validateArtifactRef(options.runRoot, options.handoffRef);
	const handoff = readJsonArtifact<Goal25SettledVerifierHandoffV35>(options.runRoot, options.handoffRef.path);
	errors.push(...goal25SettledHandoffGateErrors(handoff));
	const runtimeRefErrors = validateArtifactRef(options.runRoot, handoff.runtime_ref);
	const firstPayloadRefErrors = validateArtifactRef(options.runRoot, handoff.first_payload_ref);
	const sessionSnapshotRefErrors = validateArtifactRef(options.runRoot, handoff.session_snapshot_ref);
	const workspaceSnapshotRefErrors = validateArtifactRef(options.runRoot, handoff.workspace_snapshot_ref);
	errors.push(...runtimeRefErrors, ...firstPayloadRefErrors, ...sessionSnapshotRefErrors, ...workspaceSnapshotRefErrors);
	const runtime = readJsonArtifact<Goal25RuntimeEvidenceV35>(options.runRoot, handoff.runtime_ref.path);
	if (runtime.runtime_digest !== digestObject(runtimeBody(runtime))) errors.push("runtime digest mismatch");
	if (
		runtime.run_id !== handoff.run_id || runtime.session_id !== handoff.session_id ||
		runtime.trajectory_outcome !== "settled" || runtime.task_outcome !== null ||
		runtime.raw_harness_settled_events !== 1 || !runtime.public_test_succeeded || !runtime.public_test_terminated ||
		runtime.pending_provider_reservations !== 0 || runtime.pending_tool_calls !== 0 || runtime.pending_side_effects !== 0 || !runtime.usage_known ||
		runtime.workspace_tree_sha256_at_terminal !== handoff.workspace_tree_sha256 ||
		runtime.protected_bytes_sha256_at_terminal !== handoff.protected_bytes_sha256 ||
		runtime.tool_interface_sha256 !== handoff.tool_interface_sha256
	) errors.push("runtime/settled-handoff lineage mismatch");
	if (handoff.run_id !== options.expectedRunId || handoff.session_id !== options.expectedSessionId || handoff.tool_interface_sha256 !== options.expectedToolInterfaceSha256) errors.push("expected settled lineage mismatch");
	if (firstPayloadRefErrors.length === 0) {
		const firstPayload = readJsonArtifact<Goal2FirstProviderPayloadEvidenceV35>(options.runRoot, handoff.first_payload_ref.path);
		if (!validateGoal2FirstPayloadEvidenceV35(firstPayload) || firstPayload.run_id !== handoff.run_id || firstPayload.tools_sha256 !== handoff.tool_interface_sha256) errors.push("first-payload/settled-handoff lineage mismatch");
	}
	const workspaceSnapshot = readJsonArtifact<{ files?: unknown }>(options.runRoot, handoff.workspace_snapshot_ref.path);
	if (digestObject(workspaceSnapshot.files) !== handoff.workspace_tree_sha256) errors.push("Workspace snapshot digest mismatch");
	const sessionLines = readFileSync(resolve(options.runRoot, handoff.session_snapshot_ref.path), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line) as unknown);
	if (sessionLines.length < 3 || digestObject(sessionLines.slice(1)) !== handoff.session_entries_sha256) errors.push("Session snapshot digest mismatch");
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: options.sessionRoot, shellEnv: {} }), sessionsRoot: resolve(options.sessionRoot) });
	const matches = (await repo.list()).filter((entry) => entry.id === handoff.session_id);
	if (matches.length !== 1) errors.push("persisted Session identity unavailable");
	else {
		const reopened = await repo.open(matches[0]!);
		const metadata = await reopened.getMetadata();
		const entries = await reopened.getEntries();
		const sessionRef = portable(relative(resolve(options.sessionEvidenceRoot), resolve(metadata.path)));
		if (sessionRef !== handoff.session_ref || entries.length !== handoff.session_entry_count || digestObject(entries) !== handoff.session_entries_sha256 || !sessionToolLifecycleClosedV35(entries)) errors.push("current Session/Tool closure mismatch");
	}
	const workspaceTreeSha256 = treeDigest(options.workspaceRoot);
	const protectedBytesSha256 = digestObject(readProtectedBytes(options.workspaceRoot, options.taskPolicy));
	if (workspaceTreeSha256 !== handoff.workspace_tree_sha256) errors.push("current Workspace drifted before Verifier");
	if (protectedBytesSha256 !== handoff.protected_bytes_sha256 || protectedBytesSha256 !== digestObject(options.protectedBefore)) errors.push("current protected bytes drifted before Verifier");
	if (errors.length > 0) throw new Error(`Goal 2.5 settled handoff inspection rejected: ${errors.join("; ")}`);
	return handoff;
}

export async function handoffGoal25SettledVerifierV35(options: {
	runRoot: string;
	handoffRef: ArtifactRefV0B;
	sessionRoot: string;
	sessionEvidenceRoot: string;
	workspaceRoot: string;
	taskPolicy: BoundedTaskPolicy;
	protectedBefore: Readonly<Record<string, string>>;
	expectedRunId: string;
	expectedSessionId: string;
	expectedToolInterfaceSha256: string;
	runVerifier: () => Promise<"passed" | "failed">;
}): Promise<Goal25ArmOutcomeV35> {
	const handoff = await inspectGoal25SettledVerifierHandoffV35(options);
	const taskOutcome = await options.runVerifier();
	const body: Omit<Goal25ArmOutcomeV35, "outcome_digest"> = {
		schema_version: 1,
		run_id: handoff.run_id,
		trajectory_outcome: "settled",
		task_outcome: taskOutcome,
		verifier_runs: 1,
		candidate_eligible: true,
		tool_interface_sha256: handoff.tool_interface_sha256,
	};
	const outcome = { ...body, outcome_digest: digestObject(body) };
	writeOnceJson(options.runRoot, "outcome.json", outcome);
	return outcome;
}
