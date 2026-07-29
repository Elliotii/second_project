import type { AgentHarnessEvent } from "@earendil-works/pi-agent-core";
import type { JournalEventType } from "./journal.ts";

export type CycleCounters = {
	providerRequests: number;
	providerResponses: number;
	assistantMessages: number;
	successfulAssistantMessages: number;
	responseIdsPresent: number;
	toolStarts: number;
	toolEnds: number;
	settled: number;
	startedAt: number;
};

export type SubscribedObservation = {
	type: JournalEventType;
	data: Record<string, unknown>;
};

export function createCycleCounters(startedAt = Date.now()): CycleCounters {
	return {
		providerRequests: 0,
		providerResponses: 0,
		assistantMessages: 0,
		successfulAssistantMessages: 0,
		responseIdsPresent: 0,
		toolStarts: 0,
		toolEnds: 0,
		settled: 0,
		startedAt,
	};
}

export function observeSubscribedEvent(
	event: AgentHarnessEvent,
	counters: CycleCounters,
): SubscribedObservation | undefined {
	if (event.type === "after_provider_response") {
		counters.providerResponses += 1;
		return { type: "provider_response", data: { status: event.status } };
	}
	if (event.type === "tool_execution_start") {
		counters.toolStarts += 1;
		return {
			type: "tool_execution_start",
			data: {
				toolCallId: event.toolCallId,
				toolName: event.toolName,
				argumentKeys: Object.keys(event.args ?? {}).sort(),
			},
		};
	}
	if (event.type === "tool_execution_end") {
		counters.toolEnds += 1;
		return {
			type: "tool_execution_end",
			data: {
				toolCallId: event.toolCallId,
				toolName: event.toolName,
				isError: event.isError,
			},
		};
	}
	if (event.type === "message_end" && event.message.role === "assistant") {
		counters.assistantMessages += 1;
		const successful = event.message.stopReason !== "error" && event.message.stopReason !== "aborted";
		if (successful) counters.successfulAssistantMessages += 1;
		const responseIdPresent = typeof event.message.responseId === "string" && event.message.responseId.length > 0;
		if (responseIdPresent) counters.responseIdsPresent += 1;
		return {
			type: "assistant_message",
			data: {
				stopReason: event.message.stopReason,
				responseIdPresent,
				responseModel: event.message.responseModel,
				contentTypes: event.message.content.map((block) => block.type),
				toolCalls: event.message.content.flatMap((block) =>
					block.type === "toolCall"
						? [{ id: block.id, name: block.name, argumentKeys: Object.keys(block.arguments).sort() }]
						: [],
				),
				usage: event.message.usage,
				hasErrorMessage: typeof event.message.errorMessage === "string" && event.message.errorMessage.length > 0,
			},
		};
	}
	if (event.type === "settled") {
		counters.settled += 1;
		return { type: "agent_settled", data: { nextTurnCount: event.nextTurnCount } };
	}
	return undefined;
}
