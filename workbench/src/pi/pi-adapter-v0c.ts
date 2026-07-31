import { randomUUID } from "node:crypto";
import { AgentHarness, Session } from "@earendil-works/pi-agent-core";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { AttemptBudgetV0C, TaskSpecV0C } from "../contracts/v0c-types.ts";
import { artifactRef, writeOnceBytes } from "../evidence/artifacts.ts";
import type { JournalWriterV0C } from "../evidence/journal-v0c.ts";
import { digestObject, stableJson } from "../hash.ts";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import type { EvidenceMirrorSessionStorageV0C } from "../session/evidence-session-v0c.ts";
import { FAUX_SEQUENCE_DESCRIPTOR } from "./faux-sequence.ts";
import { createBoundedToolProfile } from "./tool-profile.ts";

type FauxAttemptMode = "repair" | "no_repair";

export interface PiAttemptSettlementV0C {
	settled: true;
	terminal_reason: "assistant_final";
	final_text: string;
	provider_requests: number;
	tool_calls: number;
	tool_results: number;
	session_entry_count: number;
	tool_result_artifacts: ArtifactRefV0B[];
	external_provider_calls: number;
	token_usage: number | "unknown";
	cost_usage_usd: number;
}

export interface PiRunHandleV0C {
	readonly sessionId: string;
	readonly workspaceId: string;
	runAttempt(input: {
		attemptId: string;
		prompt: string;
		mode: FauxAttemptMode;
		budget: AttemptBudgetV0C;
	}): Promise<PiAttemptSettlementV0C>;
	abort(): Promise<{ requested: boolean; completed: boolean }>;
	close(): Promise<void>;
	debugIdentity(): { harness_instance_id: string; session_id: string; workspace_id: string; closed: boolean };
}

function responses(mode: FauxAttemptMode, attemptId: string) {
	if (mode === "no_repair") return [fauxAssistantMessage("I stopped without modifying the implementation.")];
	return FAUX_SEQUENCE_DESCRIPTOR.map((step, index) => {
		if ("final" in step) return fauxAssistantMessage(step.final);
		return fauxAssistantMessage(
			fauxToolCall(step.tool, step.arguments, { id: `${attemptId}-call-${index + 1}` }),
			{ stopReason: "toolUse" },
		);
	});
}

function assistantText(message: { content: Array<{ type: string; text?: string }> }): string {
	return message.content.flatMap((part) => (part.type === "text" && part.text ? [part.text] : [])).join("\n");
}

export interface PiRunHandleOptionsV0C {
	workspaceRoot: string;
	runRoot: string;
	task: TaskSpecV0C;
	sessionStorage: EvidenceMirrorSessionStorageV0C;
	journal: JournalWriterV0C;
	sessionId: string;
	workspaceId: string;
}

export function createPiRunHandleV0C(options: PiRunHandleOptionsV0C): PiRunHandleV0C {
	const models = createModels();
	const registration = fauxProvider({ provider: `v0c-faux-${options.sessionId}` });
	models.setProvider(registration.provider);
	const profile = createBoundedToolProfile(options.workspaceRoot, options.task);
	const session = new Session(options.sessionStorage);
	const harness = new AgentHarness({
		models,
		session,
		model: registration.getModel(),
		tools: profile.tools,
		toolContext: profile.context,
		systemPrompt: SYSTEM_PROMPT,
		thinkingLevel: "off",
	});
	const harnessInstanceId = `harness-${randomUUID()}`;
	let closed = false;
	let running = false;
	let activeAttemptId: string | null = null;
	let currentProviderRequests = 0;
	let currentToolCalls = 0;
	let currentToolResults = 0;
	let settledObserved = false;
	let currentArtifacts: ArtifactRefV0B[] = [];

	const requireActive = (): string => {
		const journalAttempt = options.journal.getActiveAttempt();
		if (!activeAttemptId || journalAttempt !== activeAttemptId) throw new Error("active Attempt identity drift");
		return activeAttemptId;
	};
	const offProvider = harness.on("before_provider_request", (event) => {
		const attemptId = requireActive();
		currentProviderRequests += 1;
		options.journal.append("provider_request_started", {
			request_ordinal: currentProviderRequests,
			session_id_observed: event.sessionId,
		}, attemptId);
		return undefined;
	});
	const offToolCall = harness.on("tool_call", (event) => {
		const attemptId = requireActive();
		currentToolCalls += 1;
		options.journal.append("tool_call_started", {
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			safe_input_sha256: digestObject(event.input),
		}, attemptId);
		return undefined;
	});
	const offToolResult = harness.on("tool_result", (event) => {
		const attemptId = requireActive();
		currentToolResults += 1;
		const safeId = event.toolCallId.replace(/[^A-Za-z0-9._-]/g, "_");
		const ordinal = options.journal.entries.filter((entry) => entry.type === "attempt_started").length;
		const payload = {
			schema_version: 1,
			attempt_id: attemptId,
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			is_error: event.isError,
			content: event.content.flatMap((part) => (part.type === "text" ? [{ type: "text", text: part.text }] : [])),
		};
		const relativePath = `attempts/0${ordinal}-${attemptId}/tool-results/${safeId}.json`;
		const outputPath = writeOnceBytes(options.runRoot, relativePath, `${stableJson(payload)}\n`);
		const ref = artifactRef(options.runRoot, outputPath, "application/json", false);
		currentArtifacts.push(ref);
		options.journal.append(event.isError ? "tool_call_error" : "tool_call_completed", {
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			is_error: event.isError,
			output_ref: { ...ref },
		}, attemptId);
		return undefined;
	});
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "after_provider_response") {
			const attemptId = requireActive();
			options.journal.append("provider_response_observed", {
				response_ordinal: currentProviderRequests,
				status: event.status,
			}, attemptId);
		}
		if (event.type === "settled") {
			const attemptId = requireActive();
			if (settledObserved) throw new Error("duplicate settled event for active Attempt");
			settledObserved = true;
			options.journal.append("attempt_settled", { next_turn_count: event.nextTurnCount }, attemptId);
		}
	});

	return {
		sessionId: options.sessionId,
		workspaceId: options.workspaceId,
		async runAttempt(input) {
			if (closed) throw new Error("Pi Run handle is closed");
			if (running || activeAttemptId !== null) throw new Error("Pi Run handle rejects concurrent or uncleared Attempt");
			if (options.journal.getActiveAttempt() !== input.attemptId) throw new Error("active Attempt must be committed before Pi execution");
			running = true;
			activeAttemptId = input.attemptId;
			currentProviderRequests = 0;
			currentToolCalls = 0;
			currentToolResults = 0;
			settledObserved = false;
			currentArtifacts = [];
			registration.setResponses(responses(input.mode, input.attemptId));
			try {
				const response = await harness.prompt(input.prompt);
				await harness.waitForIdle();
				if (!settledObserved) throw new Error("Pi AgentHarness returned without settled");
				if (registration.getPendingResponseCount() !== 0) throw new Error("Faux response sequence did not fully drain");
				if (currentProviderRequests > input.budget.provider_request_limit) throw new Error("Attempt provider budget exceeded");
				if (currentToolCalls > input.budget.tool_call_limit) throw new Error("Attempt Tool budget exceeded");
				return {
					settled: true,
					terminal_reason: "assistant_final",
					final_text: assistantText(response),
					provider_requests: currentProviderRequests,
					tool_calls: currentToolCalls,
					tool_results: currentToolResults,
					session_entry_count: (await session.getEntries()).length,
					tool_result_artifacts: [...currentArtifacts],
					external_provider_calls: 0,
					token_usage: "unknown",
					cost_usage_usd: 0,
				};
			} finally {
				running = false;
				activeAttemptId = null;
			}
		},
		async abort() {
			if (closed) return { requested: false, completed: true };
			await harness.abort();
			return { requested: true, completed: true };
		},
		async close() {
			if (running) throw new Error("cannot close Pi Run handle while Attempt is running");
			if (!closed) {
				unsubscribe();
				offProvider();
				offToolCall();
				offToolResult();
				closed = true;
			}
		},
		debugIdentity: () => ({
			harness_instance_id: harnessInstanceId,
			session_id: options.sessionId,
			workspace_id: options.workspaceId,
			closed,
		}),
	};
}
