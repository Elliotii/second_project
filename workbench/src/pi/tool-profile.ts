import { spawn } from "node:child_process";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import {
	createEditTool,
	createReadTool,
	createWriteTool,
	type AgentHarnessTool,
	type ExecutionToolContext,
} from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { Type, type TSchema } from "@earendil-works/pi-ai";
import type { CommandDescriptor, TaskSpecV0A, ToolAuditEvent } from "../types.ts";
import { resolveWorkspacePath } from "../workspace/path-policy.ts";

const MAX_TEXT_BYTES = 50 * 1024;
const MAX_TEXT_LINES = 2_000;
const DEFAULT_LIST_DEPTH = 4;

interface ToolProfileContext extends ExecutionToolContext {
	workspaceRoot: string;
}

type ProfileTool<TParameters extends TSchema = TSchema, TDetails = unknown> = AgentHarnessTool<
	ToolProfileContext,
	TParameters,
	TDetails
> & {
	name: string;
	label: string;
	description: string;
	parameters: TParameters;
};
type AnyProfileTool = ProfileTool<TSchema, unknown>;

export interface CommandExecutionProjection {
	command_id: string;
	executable: string;
	argv: string[];
	exit_code: number | null;
	timed_out: boolean;
	truncated: boolean;
	output: string;
}

export interface BoundedToolProfile {
	tools: AnyProfileTool[];
	context: ToolProfileContext;
	auditEvents: ToolAuditEvent[];
	commandExecutions: CommandExecutionProjection[];
}

const readSchema = Type.Object(
	{
		path: Type.String(),
		offset: Type.Optional(Type.Number()),
		limit: Type.Optional(Type.Number()),
	},
	{ additionalProperties: false },
);
const listSchema = Type.Object(
	{ path: Type.String(), depth: Type.Optional(Type.Number({ minimum: 0, maximum: DEFAULT_LIST_DEPTH })) },
	{ additionalProperties: false },
);
const searchSchema = Type.Object(
	{ query: Type.String({ minLength: 1 }), path: Type.String() },
	{ additionalProperties: false },
);
const editSchema = Type.Object(
	{ path: Type.String(), old_text: Type.String(), new_text: Type.String() },
	{ additionalProperties: false },
);
const writeSchema = Type.Object(
	{ path: Type.String(), content: Type.String() },
	{ additionalProperties: false },
);
const commandSchema = Type.Object({ command_id: Type.String() }, { additionalProperties: false });

function projectText(text: string, byteBudget: number, forceTruncated = false): { text: string; truncated: boolean } {
	const marker = "\n[truncated by V0-A tool result budget]";
	const lines = text.split(/\r?\n/);
	let projected = lines.slice(0, MAX_TEXT_LINES).join("\n");
	let truncated = forceTruncated || lines.length > MAX_TEXT_LINES;
	const encoded = Buffer.from(projected, "utf8");
	if (encoded.length > byteBudget) {
		truncated = true;
	}
	if (truncated) {
		const markerBytes = Buffer.byteLength(marker, "utf8");
		const contentBudget = Math.max(0, byteBudget - markerBytes);
		projected = encoded.subarray(0, contentBudget).toString("utf8");
		while (Buffer.byteLength(projected, "utf8") > contentBudget) projected = projected.slice(0, -1);
		projected = markerBytes <= byteBudget ? `${projected}${marker}` : Buffer.from(marker).subarray(0, byteBudget).toString("utf8");
	}
	return { text: projected, truncated };
}

function assertInputKeys(args: Record<string, unknown>, allowed: readonly string[]): void {
	const allowedSet = new Set(allowed);
	const unknown = Object.keys(args).filter((key) => !allowedSet.has(key));
	if (unknown.length > 0) throw new Error(`unexpected tool argument(s): ${unknown.join(", ")}`);
}

function boundedEnvironment(): NodeJS.ProcessEnv {
	const environment: NodeJS.ProcessEnv = { NO_COLOR: "1" };
	for (const key of ["PATH", "Path", "SystemRoot", "WINDIR", "TEMP", "TMP", "PATHEXT", "COMSPEC"]) {
		const value = process.env[key];
		if (value !== undefined) environment[key] = value;
	}
	return environment;
}

async function executeProcess(options: {
	executable: string;
	argv: string[];
	cwd: string;
	timeoutSeconds: number;
	maxBytes: number;
}): Promise<Omit<CommandExecutionProjection, "command_id" | "executable" | "argv">> {
	return await new Promise((fulfill, reject) => {
		const child = spawn(options.executable, options.argv, {
			cwd: options.cwd,
			shell: false,
			env: boundedEnvironment(),
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
		});
		let output = "";
		let outputOverflow = false;
		let timedOut = false;
		const append = (chunk: Buffer): void => {
			const captureBudget = options.maxBytes + 1;
			const currentBytes = Buffer.byteLength(output, "utf8");
			const remaining = Math.max(0, captureBudget - currentBytes);
			if (chunk.length > remaining) outputOverflow = true;
			if (remaining > 0) output += chunk.subarray(0, remaining).toString("utf8");
		};
		child.stdout.on("data", append);
		child.stderr.on("data", append);
		child.once("error", reject);
		const timeout = setTimeout(() => {
			timedOut = true;
			child.kill();
		}, options.timeoutSeconds * 1_000);
		child.once("close", (code) => {
			clearTimeout(timeout);
			const projection = projectText(output, options.maxBytes, outputOverflow);
			fulfill({ exit_code: code, timed_out: timedOut, truncated: projection.truncated, output: projection.text });
		});
	});
}

function repositoryDescriptor(commandId: string): { executable: string; argv: string[]; timeout: number; maxBytes: number } | undefined {
	const descriptors: Record<string, string[]> = {
		git_status: ["status", "--short", "--branch", "--untracked-files=all"],
		git_diff: ["diff", "--no-ext-diff", "--no-color", "--"],
		git_log: ["log", "--max-count=20", "--format=%H%x09%an%x09%aI%x09%s", "--"],
	};
	const argv = descriptors[commandId];
	return argv ? { executable: "git", argv, timeout: 15, maxBytes: MAX_TEXT_BYTES } : undefined;
}

function listWorkspace(root: string, start: string, depth: number, task: TaskSpecV0A): string {
	const rows: string[] = [];
	const visit = (absolute: string, level: number): void => {
		for (const entry of readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const relativePath = relative(root, resolve(absolute, entry.name)).split(sep).join("/");
			resolveWorkspacePath({
				workspaceRoot: root,
				path: relativePath,
				operation: "list",
				writablePaths: task.writable_paths,
				protectedPaths: task.protected_paths,
			});
			const stats = lstatSync(resolve(absolute, entry.name));
			rows.push(`${stats.isDirectory() ? "d" : "f"} ${relativePath}`);
			if (stats.isDirectory() && level < depth) visit(resolve(absolute, entry.name), level + 1);
		}
	};
	visit(start, 0);
	return projectText(rows.join("\n"), MAX_TEXT_BYTES).text;
}

export function createBoundedToolProfile(workspaceRoot: string, task: TaskSpecV0A): BoundedToolProfile {
	const canonicalRoot = resolve(workspaceRoot);
	const auditEvents: ToolAuditEvent[] = [];
	const commandExecutions: CommandExecutionProjection[] = [];
	let sequence = 0;
	const context: ToolProfileContext = {
		workspaceRoot: canonicalRoot,
		env: new NodeExecutionEnv({ cwd: canonicalRoot, shellEnv: boundedEnvironment() }),
	};
	const audit = <TParameters extends TSchema, TDetails>(
		tool: ProfileTool<TParameters, TDetails>,
	): ProfileTool<TParameters, TDetails> => {
		const execute = tool.execute.bind(tool);
		return {
			...tool,
			async execute(toolCallId, args, signal, onUpdate, executionContext) {
				auditEvents.push({ sequence: ++sequence, type: "start", tool_call_id: toolCallId, tool_name: tool.name });
				try {
					const result = await execute(toolCallId, args, signal, onUpdate, executionContext);
					auditEvents.push({ sequence: ++sequence, type: "end", tool_call_id: toolCallId, tool_name: tool.name });
					return result;
				} catch (error) {
					auditEvents.push({
						sequence: ++sequence,
						type: "error",
						tool_call_id: toolCallId,
						tool_name: tool.name,
						error: error instanceof Error ? error.message : String(error),
					});
					throw error;
				}
			},
		};
	};

	const piRead = createReadTool<ToolProfileContext>();
	const piEdit = createEditTool<ToolProfileContext>();
	const piWrite = createWriteTool<ToolProfileContext>();
	const tools: AnyProfileTool[] = [
		audit<typeof readSchema, unknown>({
			name: "workspace_read",
			label: "workspace_read",
			description: "Read a file inside the bounded Workspace.",
			parameters: readSchema,
			async execute(id, args, signal, onUpdate, executionContext) {
				assertInputKeys(args, ["path", "offset", "limit"]);
				resolveWorkspacePath({
					workspaceRoot: canonicalRoot,
					path: args.path,
					operation: "read",
					writablePaths: task.writable_paths,
					protectedPaths: task.protected_paths,
				});
				return piRead.execute(id, args, signal, onUpdate, executionContext);
			},
		}),
		audit<typeof listSchema, undefined>({
			name: "workspace_list",
			label: "workspace_list",
			description: "List bounded Workspace entries.",
			parameters: listSchema,
			async execute(_id, args) {
				assertInputKeys(args, ["path", "depth"]);
				const target = resolveWorkspacePath({
					workspaceRoot: canonicalRoot,
					path: args.path,
					operation: "list",
					writablePaths: task.writable_paths,
					protectedPaths: task.protected_paths,
				});
				return {
					content: [{ type: "text", text: listWorkspace(canonicalRoot, target, args.depth ?? DEFAULT_LIST_DEPTH, task) }],
					details: undefined,
				};
			},
		}),
		audit<typeof searchSchema, undefined>({
			name: "workspace_search",
			label: "workspace_search",
			description: "Fixed-string search inside the bounded Workspace.",
			parameters: searchSchema,
			async execute(_id, args) {
				assertInputKeys(args, ["query", "path"]);
				const target = resolveWorkspacePath({
					workspaceRoot: canonicalRoot,
					path: args.path,
					operation: "search",
					writablePaths: task.writable_paths,
					protectedPaths: task.protected_paths,
				});
				const result = await executeProcess({
					executable: "rg",
					argv: [
						"--fixed-strings",
						"--line-number",
						"--no-heading",
						"--color",
						"never",
						"--",
						args.query,
						relative(canonicalRoot, target) || ".",
					],
					cwd: canonicalRoot,
					timeoutSeconds: 10,
					maxBytes: MAX_TEXT_BYTES,
				});
				if (result.timed_out) throw new Error("workspace_search timed out");
				if (result.exit_code !== 0 && result.exit_code !== 1) throw new Error(`workspace_search failed: ${result.output}`);
				return { content: [{ type: "text", text: result.output }], details: undefined };
			},
		}),
		audit<typeof editSchema, unknown>({
			name: "workspace_edit",
			label: "workspace_edit",
			description: "Replace one exact block in an allowed Workspace file.",
			parameters: editSchema,
			async execute(id, args, signal, onUpdate, executionContext) {
				assertInputKeys(args, ["path", "old_text", "new_text"]);
				resolveWorkspacePath({
					workspaceRoot: canonicalRoot,
					path: args.path,
					operation: "edit",
					writablePaths: task.writable_paths,
					protectedPaths: task.protected_paths,
				});
				return piEdit.execute(
					id,
					{ path: args.path, edits: [{ oldText: args.old_text, newText: args.new_text }] },
					signal,
					onUpdate,
					executionContext,
				);
			},
		}),
		audit<typeof writeSchema, unknown>({
			name: "workspace_write",
			label: "workspace_write",
			description: "Write one allowed Workspace file.",
			parameters: writeSchema,
			async execute(id, args, signal, onUpdate, executionContext) {
				assertInputKeys(args, ["path", "content"]);
				resolveWorkspacePath({
					workspaceRoot: canonicalRoot,
					path: args.path,
					operation: "write",
					writablePaths: task.writable_paths,
					protectedPaths: task.protected_paths,
				});
				return piWrite.execute(id, args, signal, onUpdate, executionContext);
			},
		}),
		audit<typeof commandSchema, undefined>({
			name: "run_command",
			label: "run_command",
			description: "Run one frozen command descriptor by ID; no arguments may be supplied.",
			parameters: commandSchema,
			async execute(_id, args) {
				assertInputKeys(args, ["command_id"]);
				const taskDescriptor = task.command_descriptors.find((entry) => entry.command_id === args.command_id);
				const repository = repositoryDescriptor(args.command_id);
				if (!taskDescriptor && !repository) throw new Error(`command ID is not allowed: ${args.command_id}`);
				const executable = taskDescriptor ? process.execPath : repository!.executable;
				const argv = taskDescriptor ? [...taskDescriptor.argv] : [...repository!.argv];
				const result = await executeProcess({
					executable,
					argv,
					cwd: canonicalRoot,
					timeoutSeconds: taskDescriptor?.timeout_seconds ?? repository!.timeout,
					maxBytes: taskDescriptor?.max_combined_output_bytes ?? repository!.maxBytes,
				});
				const projection: CommandExecutionProjection = {
					command_id: args.command_id,
					executable: taskDescriptor ? "current_node_executable" : executable,
					argv,
					...result,
				};
				commandExecutions.push(projection);
				return { content: [{ type: "text", text: JSON.stringify(projection) }], details: undefined };
			},
		}),
	];
	return { tools, context, auditEvents, commandExecutions };
}

export function readProtectedBytes(workspaceRoot: string, task: TaskSpecV0A): Record<string, string> {
	return Object.fromEntries(task.protected_paths.map((path) => [path, readFileSync(resolve(workspaceRoot, path), "utf8")]));
}
