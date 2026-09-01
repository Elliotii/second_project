import { existsSync } from "node:fs";
import type { AgentHarnessTool } from "@earendil-works/pi-agent-core";
import { Type, type TSchema } from "@earendil-works/pi-ai";
import { listRuns, readEvidence, searchTrace } from "./analysis.ts";
import type { AnalysisContext, AnalysisState, EvidenceLocator, FindingDraft } from "./contracts.ts";
import { saveAnalysisState } from "./state.ts";

export interface AnalysisToolCall {
	sequence: number;
	name: "list_runs" | "search_trace" | "read_evidence" | "update_state";
	input: Record<string, unknown>;
	evidence?: { locator: EvidenceLocator; characterCount: number };
}

export interface SemanticStateUpdate {
	notes: string[];
	open_questions: string[];
	next_action: string;
	finding_drafts: FindingDraft[];
}

interface AnalysisToolContext {
	analysis: AnalysisContext;
	statePath: string;
	initialState: AnalysisState;
	calls: AnalysisToolCall[];
	currentState: AnalysisState;
}

type AnyAnalysisTool = AgentHarnessTool<AnalysisToolContext, TSchema, unknown> & { name: AnalysisToolCall["name"] };

const locatorSchema = Type.Object({
	artifact: Type.Union([Type.Literal("trace"), Type.Literal("diff"), Type.Literal("verifier"), Type.Literal("manifest")]),
	run_id: Type.String({ minLength: 1 }),
	sequence: Type.Optional(Type.Integer()),
}, { additionalProperties: false });
const findingSchema = Type.Object({
	id: Type.String({ minLength: 1 }),
	observation: Type.String(),
	interpretation: Type.String(),
	limitation: Type.String(),
	applicable_runs: Type.Array(Type.String()),
	support: Type.Array(locatorSchema),
	counter: Type.Array(locatorSchema),
	counter_checked: Type.Boolean(),
	status: Type.Union([Type.Literal("draft"), Type.Literal("kept"), Type.Literal("dropped")]),
}, { additionalProperties: false });

const listRunsSchema = Type.Object({}, { additionalProperties: false });
const searchTraceSchema = Type.Object({
	run_id: Type.String({ minLength: 1 }),
	eventType: Type.Optional(Type.String()),
	toolName: Type.Optional(Type.String()),
	keyword: Type.Optional(Type.String()),
	limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
}, { additionalProperties: false });
const updateStateSchema = Type.Object({
	notes: Type.Array(Type.String()),
	open_questions: Type.Array(Type.String()),
	next_action: Type.String(),
	finding_drafts: Type.Array(findingSchema),
}, { additionalProperties: false });

function text(value: unknown, terminate = false) {
	return { content: [{ type: "text" as const, text: JSON.stringify(value) }], details: undefined, ...(terminate ? { terminate: true as const } : {}) };
}

function cloneLocator(value: EvidenceLocator): EvidenceLocator {
	const input = value as EvidenceLocator & { sequence?: number };
	if (input.artifact === "trace") {
		if (!Number.isSafeInteger(input.sequence)) throw new Error("trace Evidence Locator requires an integer sequence");
		return { artifact: "trace", run_id: input.run_id, sequence: input.sequence! };
	}
	if (input.sequence !== undefined) throw new Error(`${input.artifact} Evidence Locator must not include sequence`);
	return { artifact: input.artifact, run_id: input.run_id };
}

function validateUpdate(value: SemanticStateUpdate): SemanticStateUpdate {
	if (!Array.isArray(value.notes) || value.notes.some((entry) => typeof entry !== "string") ||
		!Array.isArray(value.open_questions) || value.open_questions.some((entry) => typeof entry !== "string") ||
		typeof value.next_action !== "string" || !Array.isArray(value.finding_drafts)) throw new Error("semantic State update is invalid");
	const ids = new Set<string>();
	for (const finding of value.finding_drafts) {
		if (!finding || typeof finding !== "object" || typeof finding.id !== "string" || finding.id.length === 0) throw new Error("Finding ID is invalid");
		if (ids.has(finding.id)) throw new Error(`duplicate Finding ID in semantic snapshot: ${finding.id}`);
		ids.add(finding.id);
		if (finding.status !== "draft" && finding.status !== "kept" && finding.status !== "dropped") throw new Error(`Finding ${finding.id} status is invalid`);
	}
	return structuredClone(value);
}

function record(context: AnalysisToolContext, name: AnalysisToolCall["name"], input: Record<string, unknown>, evidence?: AnalysisToolCall["evidence"]): void {
	context.calls.push({ sequence: context.calls.length + 1, name, input: structuredClone(input), ...(evidence ? { evidence: structuredClone(evidence) } : {}) });
}

export function createAnalysisTools(options: { analysis: AnalysisContext; statePath: string; initialState: AnalysisState }): {
	tools: AnyAnalysisTool[];
	context: AnalysisToolContext;
} {
	const context: AnalysisToolContext = {
		analysis: options.analysis,
		statePath: options.statePath,
		initialState: structuredClone(options.initialState),
		currentState: structuredClone(options.initialState),
		calls: [],
	};
	const tools: AnyAnalysisTool[] = [
		{
			name: "list_runs", label: "list_runs",
			description: "List deterministic summaries for the loaded development Runs. Does not return complete Trace, Diff, or Verifier content.",
			parameters: listRunsSchema,
			async execute(_id, args, _signal, _update, toolContext) {
				record(toolContext, "list_runs", args as Record<string, unknown>);
				return text(listRuns(toolContext.analysis));
			},
		},
		{
			name: "search_trace", label: "search_trace",
			description: "Search one loaded Run Trace by eventType, toolName, or visible keyword. Returns bounded summaries and precise Locators, never a complete Trace.",
			parameters: searchTraceSchema,
			async execute(_id, args, _signal, _update, toolContext) {
				const input = args as Record<string, unknown>;
				record(toolContext, "search_trace", input);
				return text(searchTrace(toolContext.analysis, input.run_id as string, { eventType: input.eventType as string | undefined, toolName: input.toolName as string | undefined, keyword: input.keyword as string | undefined, limit: input.limit as number | undefined }));
			},
		},
		{
			name: "read_evidence", label: "read_evidence",
			description: "Read one trace, diff, verifier, or manifest Locator. The Runner records the real Locator and character count. This tool does not persist Analysis State.",
			parameters: locatorSchema,
			async execute(_id, args, _signal, _update, toolContext) {
				const locator = cloneLocator(args as EvidenceLocator);
				const evidence = readEvidence(toolContext.analysis, locator);
				record(toolContext, "read_evidence", args as Record<string, unknown>, { locator, characterCount: evidence.characterCount });
				return text(evidence);
			},
		},
		{
			name: "update_state", label: "update_state",
			description: "Persist a complete semantic State snapshot. counter_checked=false means counter-evidence has not been actively checked. counter_checked=true with counter=[] means it was checked and no direct counter-evidence was found. Runner-managed covered_runs, loaded_evidence, Locators actually read, and characterCount cannot be supplied or replaced.",
			parameters: updateStateSchema,
			async execute(_id, args, _signal, _update, toolContext) {
				const update = validateUpdate(args as SemanticStateUpdate);
				const next: AnalysisState = {
					covered_runs: [...toolContext.analysis.coveredRuns],
					notes: update.notes,
					open_questions: update.open_questions,
					next_action: update.next_action,
					loaded_evidence: [...toolContext.initialState.loaded_evidence, ...structuredClone(toolContext.analysis.loadedEvidence)],
					finding_drafts: update.finding_drafts,
				};
				toolContext.currentState = next;
				saveAnalysisState(toolContext.statePath.replace(/[\\/]analysis-state\.json$/, ""), next);
				record(toolContext, "update_state", args as Record<string, unknown>);
				return text({ saved: true, state_path: toolContext.statePath, covered_runs: next.covered_runs, loaded_evidence_count: next.loaded_evidence.length }, true);
			},
		},
	];
	return { tools, context };
}

export function analysisStateWasSaved(statePath: string): boolean {
	return existsSync(statePath);
}
