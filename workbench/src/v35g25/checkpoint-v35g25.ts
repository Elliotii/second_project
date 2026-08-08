import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JsonlSessionRepo, type JsonlSessionMetadata, type Session } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type {
	Goal25ArmOutcomeV35,
	Goal25PreVerifierCheckpointV35,
	Goal25RuntimeEvidenceV35,
} from "../contracts/v35g25-types.ts";
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

function checkpointBody(checkpoint: Goal25PreVerifierCheckpointV35): Omit<Goal25PreVerifierCheckpointV35, "checkpoint_digest"> {
	const { checkpoint_digest: _digest, ...body } = checkpoint;
	return body;
}

function outcomeBody(outcome: Goal25ArmOutcomeV35): Omit<Goal25ArmOutcomeV35, "outcome_digest"> {
	const { outcome_digest: _digest, ...body } = outcome;
	return body;
}

function sessionToolLifecycleClosed(entries: readonly unknown[]): boolean {
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
	return errors;
}

export async function createGoal25PreVerifierCheckpointV35(options: {
	runRoot: string;
	runtime: Goal25RuntimeEvidenceV35;
	session: Session<JsonlSessionMetadata>;
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
		fs: new NodeExecutionEnv({ cwd: options.runRoot, shellEnv: {} }),
		sessionsRoot: resolve(options.runRoot, "sessions"),
	});
	const reopened = await repo.open(metadata);
	const reopenedMetadata = await reopened.getMetadata();
	const reopenedEntries = await reopened.getEntries();
	const sessionReopenEqual =
		reopenedMetadata.id === metadata.id &&
		resolve(reopenedMetadata.path) === resolve(metadata.path) &&
		stableJson(reopenedEntries) === stableJson(liveEntries);
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
		tool_calls_closed: sessionToolLifecycleClosed(reopenedEntries) as true,
		workspace_unchanged_since_terminal: (workspaceTreeSha256 === options.runtime.workspace_tree_sha256_at_terminal) as true,
		protected_unchanged: (protectedBytesSha256 === protectedBeforeSha256 && protectedBytesSha256 === options.runtime.protected_bytes_sha256_at_terminal) as true,
		first_payload_present: (validateArtifactRef(options.runRoot, options.firstPayloadRef).length === 0) as true,
		timed_out: (options.timedOut ?? false) as false,
		post_dispatch_loss: (options.postDispatchLoss ?? false) as false,
		checkpoint_before_verifier: true,
		workspace_tree_sha256: workspaceTreeSha256,
		protected_bytes_sha256: protectedBytesSha256,
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

export function inspectGoal25PreVerifierCheckpointV35(options: {
	runRoot: string;
	checkpointRef: ArtifactRefV0B;
	expectedToolInterfaceSha256: string;
}): Goal25PreVerifierCheckpointV35 {
	const refErrors = validateArtifactRef(options.runRoot, options.checkpointRef);
	if (refErrors.length > 0) throw new Error(`Goal 2.5 checkpoint artifact invalid: ${refErrors.join("; ")}`);
	const checkpoint = readJsonArtifact<Goal25PreVerifierCheckpointV35>(options.runRoot, options.checkpointRef.path);
	const errors = goal25CheckpointGateErrors(checkpoint);
	for (const ref of [checkpoint.runtime_ref, checkpoint.first_payload_ref, checkpoint.session_snapshot_ref, checkpoint.workspace_snapshot_ref]) {
		errors.push(...validateArtifactRef(options.runRoot, ref));
	}
	const runtime = readJsonArtifact<Goal25RuntimeEvidenceV35>(options.runRoot, checkpoint.runtime_ref.path);
	const runtimeBody = { ...runtime } as Record<string, unknown>;
	delete runtimeBody.runtime_digest;
	if (runtime.runtime_digest !== digestObject(runtimeBody)) errors.push("runtime digest mismatch");
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
	if (sessionLines.length < 2 || digestObject(sessionLines.slice(1)) !== checkpoint.session_entries_sha256) errors.push("Session snapshot digest mismatch");
	if (checkpoint.tool_interface_sha256 !== options.expectedToolInterfaceSha256) errors.push("Tool-interface digest identity mismatch");
	if (errors.length > 0) throw new Error(`Goal 2.5 checkpoint inspection rejected: ${errors.join("; ")}`);
	return checkpoint;
}

export async function handoffGoal25VerifierV35(options: {
	runRoot: string;
	checkpointRef: ArtifactRefV0B;
	expectedToolInterfaceSha256: string;
	runVerifier: () => Promise<"passed" | "failed">;
}): Promise<Goal25ArmOutcomeV35> {
	const checkpoint = inspectGoal25PreVerifierCheckpointV35(options);
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

export async function handoffGoal25SettledVerifierV35(options: {
	runRoot: string;
	runtime: Goal25RuntimeEvidenceV35;
	firstPayloadRef: ArtifactRefV0B;
	firstPayloadToolsSha256: string;
	runVerifier: () => Promise<"passed" | "failed">;
}): Promise<Goal25ArmOutcomeV35> {
	const runtimeRefErrors = validateArtifactRef(options.runRoot, artifactRef(options.runRoot, "runtime-v35g25.json", "application/json", false));
	const payloadRefErrors = validateArtifactRef(options.runRoot, options.firstPayloadRef);
	if (
		options.runtime.trajectory_outcome !== "settled" ||
		options.runtime.task_outcome !== null ||
		options.runtime.raw_harness_settled_events !== 1 ||
		!options.runtime.public_test_succeeded ||
		!options.runtime.public_test_terminated ||
		options.runtime.pending_provider_reservations !== 0 ||
		options.runtime.pending_tool_calls !== 0 ||
		options.runtime.pending_side_effects !== 0 ||
		!options.runtime.usage_known ||
		options.runtime.tool_interface_sha256 !== options.firstPayloadToolsSha256 ||
		runtimeRefErrors.length > 0 ||
		payloadRefErrors.length > 0
	) throw new Error("Goal 2.5 settled Verifier handoff rejected");
	const taskOutcome = await options.runVerifier();
	const body: Omit<Goal25ArmOutcomeV35, "outcome_digest"> = {
		schema_version: 1,
		run_id: options.runtime.run_id,
		trajectory_outcome: "settled",
		task_outcome: taskOutcome,
		verifier_runs: 1,
		candidate_eligible: true,
		tool_interface_sha256: options.runtime.tool_interface_sha256,
	};
	const outcome = { ...body, outcome_digest: digestObject(body) };
	writeOnceJson(options.runRoot, "outcome.json", outcome);
	return outcome;
}
