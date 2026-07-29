import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Type } from "@earendil-works/pi-ai";
import type { AgentHarnessTool } from "@earendil-works/pi-agent-core";
import { runProcess, sha256, truncateUtf8 } from "./runtime-utils.ts";

const NO_PARAMETERS = Type.Object({}, { additionalProperties: false });
const WRITE_PARAMETERS = Type.Object({ content: Type.String() }, { additionalProperties: false });
const READ_FILES = ["task.md", "package.json", "src/parse-duration.ts", "test/public.test.ts"] as const;
const SOURCE_FILE = "src/parse-duration.ts";

export type ToolAuditRecord = {
	type: "source_write";
	toolCallId: string;
	path: typeof SOURCE_FILE;
	before: { exists: boolean; bytes: number; sha256: string | null };
	after: { bytes: number; sha256: string };
};

export type G005ToolContext = {
	workspace: string;
	record: (record: ToolAuditRecord) => void;
};

function exactWorkspacePath(context: G005ToolContext, relativePath: (typeof READ_FILES)[number]): string {
	return resolve(context.workspace, relativePath);
}

export function createG005Tools(): Array<AgentHarnessTool<G005ToolContext>> {
	const readTool: AgentHarnessTool<G005ToolContext, typeof NO_PARAMETERS, { files: string[]; bytes: number }> = {
		name: "read_task_and_source",
		label: "Read task and source",
		description: "Read the fixed task, package metadata, editable source, and public test. Takes no path.",
		parameters: NO_PARAMETERS,
		executionMode: "sequential",
		execute: async (_toolCallId, _params, _signal, _onUpdate, context) => {
			const sections = READ_FILES.map((relativePath) => {
				const value = readFileSync(exactWorkspacePath(context, relativePath), "utf8");
				return `--- ${relativePath} ---\n${value}`;
			});
			const text = sections.join("\n");
			const bytes = Buffer.byteLength(text, "utf8");
			if (bytes > 16_384) throw new Error(`fixed read result exceeds 16384 bytes: ${bytes}`);
			return { content: [{ type: "text", text }], details: { files: [...READ_FILES], bytes } };
		},
	};

	const writeTool: AgentHarnessTool<G005ToolContext, typeof WRITE_PARAMETERS, ToolAuditRecord> = {
		name: "write_source",
		label: "Write source",
		description: "Replace only src/parse-duration.ts with complete UTF-8 content. No path argument is accepted.",
		parameters: WRITE_PARAMETERS,
		executionMode: "sequential",
		execute: async (toolCallId, params, _signal, _onUpdate, context) => {
			const bytes = Buffer.from(params.content, "utf8");
			if (bytes.length > 16_384) throw new Error(`source write exceeds 16384 bytes: ${bytes.length}`);
			const path = exactWorkspacePath(context, SOURCE_FILE);
			const existed = existsSync(path);
			const prior = existed ? readFileSync(path) : Buffer.alloc(0);
			writeFileSync(path, bytes, { encoding: "utf8" });
			const record: ToolAuditRecord = {
				type: "source_write",
				toolCallId,
				path: SOURCE_FILE,
				before: { exists: existed, bytes: prior.length, sha256: existed ? sha256(prior) : null },
				after: { bytes: bytes.length, sha256: sha256(bytes) },
			};
			context.record(record);
			return { content: [{ type: "text", text: "src/parse-duration.ts replaced" }], details: record };
		},
	};

	const testTool: AgentHarnessTool<G005ToolContext, typeof NO_PARAMETERS, Record<string, unknown>> = {
		name: "run_public_tests",
		label: "Run public tests",
		description: "Run exactly: node --test test/public.test.ts in the fixed workspace. Takes no command.",
		parameters: NO_PARAMETERS,
		executionMode: "sequential",
		execute: async (_toolCallId, _params, signal, _onUpdate, context) => {
			const result = await runProcess({
				command: process.execPath,
				args: ["--test", "test/public.test.ts"],
				cwd: context.workspace,
				timeoutMs: 15_000,
				maxCombinedOutputBytes: 8_192,
				env: {},
				signal,
			});
			const combined = `${result.stdout}${result.stderr}`;
			const output = truncateUtf8(combined, 8_192);
			return {
				content: [{ type: "text", text: `${output.text}\nexit_code=${result.exitCode}` }],
				details: {
					exitCode: result.exitCode,
					timedOut: result.timedOut,
					durationMs: result.durationMs,
					outputBytes: output.originalBytes,
					outputSha256: sha256(combined),
				},
			};
		},
	};

	return [readTool, writeTool, testTool];
}

export const G005_TOOL_NAMES = ["read_task_and_source", "write_source", "run_public_tests"] as const;
