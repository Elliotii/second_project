import {
	AgentHarness,
	InMemorySessionStorage,
	Session,
	type SessionMetadata,
} from "@earendil-works/pi-agent-core";
import {
	createModels,
	fauxAssistantMessage,
	fauxProvider,
	fauxToolCall,
} from "@earendil-works/pi-ai";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SYSTEM_PROMPT } from "../prompts/base.ts";
import type { TaskSpecV0A } from "../types.ts";
import { FAUX_SEQUENCE_DESCRIPTOR } from "./faux-sequence.ts";
import { createBoundedToolProfile, type CommandExecutionProjection } from "./tool-profile.ts";

interface ProjectSessionMetadata extends SessionMetadata {
	attempt_id: string;
	workspace_id: string;
	strategy_id: "v0a_faux_single_cycle";
}

export interface PiSettlementResult {
	settled: true;
	terminal_reason: "assistant_final";
	final_text: string;
	session_id: string;
	attempt_id: string;
	workspace_id: string;
	provider_identity: string;
	faux_provider_calls: number;
	external_provider_calls: 0;
	settled_event_observed: boolean;
	provider_response_events: number;
	session_entry_count: number;
	tool_audit: ReturnType<typeof createBoundedToolProfile>["auditEvents"];
	command_executions: CommandExecutionProjection[];
}

function finalText(message: { content: Array<{ type: string; text?: string }> }): string {
	return message.content.flatMap((part) => (part.type === "text" && part.text ? [part.text] : [])).join("\n");
}

function fauxResponses() {
	return FAUX_SEQUENCE_DESCRIPTOR.map((step, index) => {
		if ("final" in step) return fauxAssistantMessage(step.final);
		return fauxAssistantMessage(
			fauxToolCall(step.tool, step.arguments, { id: `v0a-call-${index + 1}` }),
			{ stopReason: "toolUse" },
		);
	});
}

export async function runPiSingleCycle(options: {
	workspaceRoot: string;
	task: TaskSpecV0A;
	sessionId: string;
	attemptId: string;
	workspaceId: string;
}): Promise<PiSettlementResult> {
	const models = createModels();
	const registration = fauxProvider({ provider: `v0a-faux-${options.sessionId}` });
	models.setProvider(registration.provider);
	registration.setResponses(fauxResponses());
	const profile = createBoundedToolProfile(options.workspaceRoot, options.task);
	const storage = new InMemorySessionStorage<ProjectSessionMetadata>({
		metadata: {
			id: options.sessionId,
			createdAt: new Date().toISOString(),
			attempt_id: options.attemptId,
			workspace_id: options.workspaceId,
			strategy_id: "v0a_faux_single_cycle",
		},
	});
	const session = new Session(storage);
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
	let providerResponseEvents = 0;
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "settled") settledObserved = true;
		if (event.type === "after_provider_response") providerResponseEvents += 1;
	});
	try {
		const instruction = readFileSync(resolve(options.workspaceRoot, options.task.instruction_ref), "utf8");
		const response = await harness.prompt(instruction);
		await harness.waitForIdle();
		if (!settledObserved) throw new Error("Pi AgentHarness returned without an observed settled event");
		if (registration.getPendingResponseCount() !== 0) throw new Error("Faux sequence did not fully drain");
		return {
			settled: true,
			terminal_reason: "assistant_final",
			final_text: finalText(response),
			session_id: options.sessionId,
			attempt_id: options.attemptId,
			workspace_id: options.workspaceId,
			provider_identity: registration.provider.id,
			faux_provider_calls: registration.state.callCount,
			external_provider_calls: 0,
			settled_event_observed: settledObserved,
			provider_response_events: providerResponseEvents,
			session_entry_count: (await session.getEntries()).length,
			tool_audit: [...profile.auditEvents],
			command_executions: [...profile.commandExecutions],
		};
	} catch (error) {
		try {
			await harness.abort();
		} catch {
			// Cleanup must not replace the primary execution error.
		}
		throw new Error(`V0-A Pi execution error: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
	} finally {
		unsubscribe();
	}
}

export async function runFauxWriteProbe(options: {
	workspaceRoot: string;
	task: TaskSpecV0A;
	path: string;
	content: string;
}): Promise<{ settled: boolean; external_provider_calls: 0; faux_provider_calls: number }> {
	const models = createModels();
	const registration = fauxProvider({ provider: `v0a-write-probe-${Date.now()}` });
	models.setProvider(registration.provider);
	registration.setResponses([
		fauxAssistantMessage(fauxToolCall("workspace_write", { path: options.path, content: options.content }, { id: "write-probe" }), {
			stopReason: "toolUse",
		}),
		fauxAssistantMessage("write probe complete"),
	]);
	const profile = createBoundedToolProfile(options.workspaceRoot, options.task);
	const harness = new AgentHarness({
		models,
		session: new Session(new InMemorySessionStorage()),
		model: registration.getModel(),
		tools: profile.tools,
		toolContext: profile.context,
		systemPrompt: SYSTEM_PROMPT,
	});
	let settled = false;
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "settled") settled = true;
	});
	try {
		await harness.prompt("Perform the bounded write probe.");
		await harness.waitForIdle();
		return { settled, external_provider_calls: 0, faux_provider_calls: registration.state.callCount };
	} finally {
		unsubscribe();
	}
}
