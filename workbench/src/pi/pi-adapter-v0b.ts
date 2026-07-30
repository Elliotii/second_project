import { AgentHarness, Session } from "@earendil-works/pi-agent-core";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ArtifactRefV0B, TaskSpecV0B } from "../contracts/v0b-types.ts";
import { artifactRef, writeOnceBytes } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import type { JournalWriterV0B } from "../evidence/journal.ts";
import {
	EvidencePersistenceOperationErrorV0B,
	type EvidenceMirrorSessionStorageV0B,
} from "../session/evidence-session.ts";
import { FAUX_SEQUENCE_DESCRIPTOR } from "./faux-sequence.ts";
import { createBoundedToolProfile, type CommandExecutionProjection } from "./tool-profile.ts";

export interface PiV0BSettlementResult {
	settled: true;
	terminal_reason: "assistant_final";
	final_text: string;
	faux_provider_calls: number;
	external_provider_calls: 0;
	provider_response_events: number;
	provider_request_events: number;
	tool_call_events: number;
	tool_result_events: number;
	session_entry_count: number;
	command_executions: CommandExecutionProjection[];
	tool_result_artifacts: ArtifactRefV0B[];
}

export interface FauxSequenceHardBoundV0B {
	provider_requests: number;
	tool_calls: number;
}

export function fauxSequenceHardBoundV0B(mode: "repair" | "no_repair"): FauxSequenceHardBoundV0B {
	if (mode === "no_repair") return { provider_requests: 1, tool_calls: 0 };
	return {
		provider_requests: FAUX_SEQUENCE_DESCRIPTOR.length,
		tool_calls: FAUX_SEQUENCE_DESCRIPTOR.filter((step) => !("final" in step)).length,
	};
}

export class PiEvidenceCycleErrorV0B extends Error {
	readonly failureKind: "evidence_persistence" | "budget" | "infrastructure";
	readonly progress: {
		settled_observed: boolean;
		provider_request_events: number;
		tool_call_events: number;
		tool_result_events: number;
		abort_requested: boolean;
		abort_completed: boolean;
	};

	constructor(
		failureKind: PiEvidenceCycleErrorV0B["failureKind"],
		progress: PiEvidenceCycleErrorV0B["progress"],
	) {
		super(`Pi evidence cycle stopped: ${failureKind}`);
		this.name = "PiEvidenceCycleErrorV0B";
		this.failureKind = failureKind;
		this.progress = progress;
	}
}

function passResponses() {
	return FAUX_SEQUENCE_DESCRIPTOR.map((step, index) => {
		if ("final" in step) return fauxAssistantMessage(step.final);
		return fauxAssistantMessage(
			fauxToolCall(step.tool, step.arguments, { id: `v0b-call-${index + 1}` }),
			{ stopReason: "toolUse" },
		);
	});
}

function noRepairResponses() {
	return [fauxAssistantMessage("I inspected the task but did not modify the implementation.")];
}

function finalText(message: { content: Array<{ type: string; text?: string }> }): string {
	return message.content.flatMap((part) => (part.type === "text" && part.text ? [part.text] : [])).join("\n");
}

export async function runPiEvidenceCycleV0B(options: {
	projectRoot: string;
	workspaceRoot: string;
	task: TaskSpecV0B;
	runRoot: string;
	sessionStorage: EvidenceMirrorSessionStorageV0B;
	journal: JournalWriterV0B;
	sessionId: string;
	mode: "repair" | "no_repair";
	budgetLimits: {
		provider_request_limit: number;
		tool_call_limit: number;
	};
}): Promise<PiV0BSettlementResult> {
	const models = createModels();
	const registration = fauxProvider({ provider: `v0b-faux-${options.sessionId}` });
	models.setProvider(registration.provider);
	registration.setResponses(options.mode === "repair" ? passResponses() : noRepairResponses());
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
	let settledObserved = false;
	let providerResponses = 0;
	let providerRequests = 0;
	let toolCalls = 0;
	let toolResults = 0;
	let abortObserved = false;
	const toolResultArtifacts: ArtifactRefV0B[] = [];
	const offProvider = harness.on("before_provider_request", (event) => {
		if (providerRequests >= options.budgetLimits.provider_request_limit) {
			throw new Error("provider request budget exhausted before request");
		}
		providerRequests += 1;
		options.journal.append("provider_request_started", {
			request_ordinal: providerRequests,
			session_id_observed: event.sessionId,
		});
		return undefined;
	});
	const offToolCall = harness.on("tool_call", (event) => {
		if (toolCalls >= options.budgetLimits.tool_call_limit) {
			throw new Error("tool call budget exhausted before execution");
		}
		toolCalls += 1;
		options.journal.append("tool_call_started", {
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			safe_input_sha256: digestObject(event.input),
		});
		return undefined;
	});
	const offToolResult = harness.on("tool_result", (event) => {
		toolResults += 1;
		const safeId = event.toolCallId.replace(/[^A-Za-z0-9._-]/g, "_");
		const safeOutput = {
			schema_version: 1,
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			is_error: event.isError,
			content: event.content.flatMap((part) => (part.type === "text" ? [{ type: "text", text: part.text }] : [])),
		};
		const serializedOutput = `${stableJson(safeOutput)}\n`;
		const outputPath = writeOnceBytes(options.runRoot, `artifacts/tool-results/${safeId}.json`, serializedOutput);
		const outputRef = artifactRef(
			options.runRoot,
			outputPath,
			"application/json",
			/"truncated":true|truncated by V0-A tool result budget/.test(serializedOutput),
		);
		toolResultArtifacts.push(outputRef);
		options.journal.append(event.isError ? "tool_call_error" : "tool_call_completed", {
			tool_call_id: event.toolCallId,
			tool_name: event.toolName,
			is_error: event.isError,
			output_ref: {
				path: outputRef.path,
				sha256: outputRef.sha256,
				size_bytes: outputRef.size_bytes,
				media_type: outputRef.media_type,
				truncated: outputRef.truncated,
			},
		});
		return undefined;
	});
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "after_provider_response") {
			providerResponses += 1;
			options.journal.append("provider_response_observed", {
				response_ordinal: providerResponses,
				status: event.status,
			});
		}
		if (event.type === "abort") {
			abortObserved = true;
			options.journal.append("attempt_aborted", {
				last_complete_seq: options.journal.lastSeq(),
				outstanding_tool_call_ids: [],
			});
		}
		if (event.type === "settled" && !settledObserved) {
			settledObserved = true;
			options.journal.append("attempt_settled", { next_turn_count: event.nextTurnCount });
		}
	});
	try {
		const instruction = readFileSync(resolve(options.projectRoot, options.task.instruction_ref), "utf8");
		const response = await harness.prompt(instruction);
		await harness.waitForIdle();
		if (!settledObserved) throw new Error("Pi AgentHarness returned without observed settled");
		if (registration.getPendingResponseCount() !== 0) throw new Error("Faux response sequence did not fully drain");
		return {
			settled: true,
			terminal_reason: "assistant_final",
			final_text: finalText(response),
			faux_provider_calls: registration.state.callCount,
			external_provider_calls: 0,
			provider_response_events: providerResponses,
			provider_request_events: providerRequests,
			tool_call_events: toolCalls,
			tool_result_events: toolResults,
			session_entry_count: (await session.getEntries()).length,
			command_executions: [...profile.commandExecutions],
			tool_result_artifacts: toolResultArtifacts,
		};
	} catch (error) {
		const failureKind =
			error instanceof EvidencePersistenceOperationErrorV0B
				? "evidence_persistence"
				: error instanceof Error && /budget exhausted/.test(error.message)
					? "budget"
					: "infrastructure";
		options.journal.append("attempt_error", {
			error_class: failureKind,
			message: "Pi evidence cycle stopped before a complete settled Session was available",
		});
		let abortCompleted = false;
		try {
			await harness.abort();
			abortCompleted = true;
		} catch {
			// Cleanup cannot replace primary evidence.
		}
		if (!abortObserved) {
			options.journal.append("attempt_aborted", {
				abort_requested: true,
				abort_completed: abortCompleted,
				last_complete_seq: options.journal.lastSeq(),
				outstanding_tool_call_ids: [],
			});
		}
		throw new PiEvidenceCycleErrorV0B(failureKind, {
			settled_observed: settledObserved,
			provider_request_events: providerRequests,
			tool_call_events: toolCalls,
			tool_result_events: toolResults,
			abort_requested: true,
			abort_completed: abortCompleted,
		});
	} finally {
		unsubscribe();
		offProvider();
		offToolCall();
		offToolResult();
	}
}
