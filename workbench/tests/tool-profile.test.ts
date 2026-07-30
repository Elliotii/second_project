import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { INITIAL_PARSE_DURATION_SOURCE, REPAIRED_PARSE_DURATION_SOURCE } from "../src/pi/faux-sequence.ts";
import { runFauxWriteProbe } from "../src/pi/pi-adapter.ts";
import { createBoundedToolProfile } from "../src/pi/tool-profile.ts";
import type { CommandDescriptor, TaskSpecV0A } from "../src/types.ts";
import { copyFormalWorkspace } from "./helpers.ts";

type Profile = ReturnType<typeof createBoundedToolProfile>;

async function call(profile: Profile, name: string, id: string, args: unknown) {
	const tool = profile.tools.find((entry) => entry.name === name);
	assert.ok(tool, `missing tool: ${name}`);
	return await tool.execute(id, args, undefined, undefined, profile.context);
}

function resultText(result: Awaited<ReturnType<typeof call>>): string {
	const part = result.content[0];
	assert.ok(part && part.type === "text");
	return part.text;
}

function descriptors(ids: CommandDescriptor["command_id"][]): CommandDescriptor[] {
	return ids.map((command_id) => ({
		command_id,
		executable: "current_node_executable",
		argv: ["--version"],
		cwd: "workspace",
		timeout_seconds: 5,
		max_combined_output_bytes: 1_024,
	}));
}

test("bounded profile exposes only the frozen tool surface and performs read/list/search/edit/test", async () => {
	const { workspaceRoot, task } = copyFormalWorkspace("tool-positive");
	const profile = createBoundedToolProfile(workspaceRoot, task);
	assert.deepEqual(
		profile.tools.map((tool) => tool.name),
		["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"],
	);
	assert.equal(profile.tools.some((tool) => /bash|shell|powershell/i.test(tool.name)), false);
	assert.match(resultText(await call(profile, "workspace_list", "list-1", { path: ".", depth: 3 })), /src\/parse-duration\.ts/);
	assert.match(
		resultText(await call(profile, "workspace_search", "search-1", { query: "parseDuration", path: "." })),
		/parseDuration/,
	);
	assert.match(resultText(await call(profile, "workspace_read", "read-1", { path: "task.md" })), /Repair/);
	await call(profile, "workspace_edit", "edit-1", {
		path: "src/parse-duration.ts",
		old_text: INITIAL_PARSE_DURATION_SOURCE,
		new_text: REPAIRED_PARSE_DURATION_SOURCE,
	});
	assert.equal(readFileSync(resolve(workspaceRoot, "src/parse-duration.ts"), "utf8"), REPAIRED_PARSE_DURATION_SOURCE);
	const command = JSON.parse(resultText(await call(profile, "run_command", "command-1", { command_id: "test" }))) as {
		exit_code: number;
		timed_out: boolean;
		argv: string[];
	};
	assert.equal(command.exit_code, 0);
	assert.equal(command.timed_out, false);
	assert.deepEqual(command.argv, ["--test", "test/public.test.ts"]);
	assert.equal(profile.auditEvents.length, 10);
	for (let index = 0; index < profile.auditEvents.length; index += 2) {
		assert.equal(profile.auditEvents[index]?.type, "start");
		assert.equal(profile.auditEvents[index + 1]?.type, "end");
		assert.equal(profile.auditEvents[index]?.tool_call_id, profile.auditEvents[index + 1]?.tool_call_id);
	}
});

test("write capability works through public Faux and AgentHarness in a disposable workspace", async () => {
	const base = copyFormalWorkspace("write-probe");
	const task: TaskSpecV0A = { ...base.task, writable_paths: ["src/probe.txt"] };
	const probe = await runFauxWriteProbe({
		workspaceRoot: base.workspaceRoot,
		task,
		path: "src/probe.txt",
		content: "bounded write\n",
	});
	assert.deepEqual(probe, { settled: true, external_provider_calls: 0, faux_provider_calls: 2 });
	assert.equal(readFileSync(resolve(base.workspaceRoot, "src/probe.txt"), "utf8"), "bounded write\n");
});

test("rejected tool calls have error pairing and no side effects", async () => {
	const { workspaceRoot, task } = copyFormalWorkspace("tool-deny");
	const profile = createBoundedToolProfile(workspaceRoot, task);
	const protectedPath = resolve(workspaceRoot, "task.md");
	const before = readFileSync(protectedPath, "utf8");
	await assert.rejects(
		call(profile, "workspace_write", "deny-write", { path: "task.md", content: "tampered" }),
		/protected path/,
	);
	await assert.rejects(
		call(profile, "workspace_read", "deny-read", { path: "../outside.txt" }),
		/unbounded path/,
	);
	await assert.rejects(call(profile, "run_command", "deny-command", { command_id: "git_commit" }), /not allowed/);
	await assert.rejects(
		call(profile, "run_command", "deny-override", { command_id: "test", argv: ["--eval", "process.exit()"] }),
		/unexpected tool argument/,
	);
	assert.equal(readFileSync(protectedPath, "utf8"), before);
	assert.deepEqual(
		profile.auditEvents.map((entry) => entry.type),
		["start", "error", "start", "error", "start", "error", "start", "error"],
	);
});

test(
	"Windows tool writes cannot use a case-only alias for a protected path",
	{ skip: process.platform !== "win32" },
	async () => {
		const base = copyFormalWorkspace("tool-case-alias-deny");
		const protectedPath = resolve(base.workspaceRoot, "task.md");
		const before = readFileSync(protectedPath, "utf8");
		const task: TaskSpecV0A = { ...base.task, writable_paths: ["TASK.MD"] };
		const profile = createBoundedToolProfile(base.workspaceRoot, task);
		await assert.rejects(
			call(profile, "workspace_write", "deny-case-alias", { path: "TASK.MD", content: "tampered" }),
			/protected path/,
		);
		assert.equal(readFileSync(protectedPath, "utf8"), before);
		assert.deepEqual(
			profile.auditEvents.map((entry) => entry.type),
			["start", "error"],
		);
	},
);

test("task and repository command IDs use fixed descriptors; mutation IDs remain denied", async () => {
	const base = copyFormalWorkspace("command-policy");
	const task: TaskSpecV0A = {
		...base.task,
		command_descriptors: descriptors(["test", "build", "typecheck", "lint"]),
	};
	const profile = createBoundedToolProfile(base.workspaceRoot, task);
	for (const command_id of ["test", "build", "typecheck", "lint"]) {
		const projection = JSON.parse(resultText(await call(profile, "run_command", `allow-${command_id}`, { command_id }))) as {
			exit_code: number;
			argv: string[];
		};
		assert.equal(projection.exit_code, 0);
		assert.deepEqual(projection.argv, ["--version"]);
	}
	for (const command_id of ["git_status", "git_diff", "git_log"]) {
		const projection = JSON.parse(resultText(await call(profile, "run_command", `allow-${command_id}`, { command_id }))) as {
			argv: string[];
			executable: string;
		};
		assert.equal(projection.executable, "git");
		assert.ok(projection.argv.length > 0);
	}
	for (const command_id of [
		"git_commit",
		"git_push",
		"git_reset",
		"git_checkout",
		"git_clean",
		"install",
		"network",
		"background",
	]) {
		await assert.rejects(call(profile, "run_command", `deny-${command_id}`, { command_id }), /not allowed/);
	}
});

test("command timeout and output caps are observable", async () => {
	const base = copyFormalWorkspace("command-budgets");
	const scriptPath = resolve(base.workspaceRoot, "test/slow-output.mjs");
	writeFileSync(scriptPath, 'process.stdout.write("x".repeat(4096)); setInterval(() => {}, 1000);\n', "utf8");
	const task: TaskSpecV0A = {
		...base.task,
		protected_paths: [...base.task.protected_paths, "test/slow-output.mjs"],
		command_descriptors: [
			{
				command_id: "test",
				executable: "current_node_executable",
				argv: ["test/slow-output.mjs"],
				cwd: "workspace",
				timeout_seconds: 1,
				max_combined_output_bytes: 64,
			},
		],
	};
	const profile = createBoundedToolProfile(base.workspaceRoot, task);
	const projection = JSON.parse(resultText(await call(profile, "run_command", "budget-command", { command_id: "test" }))) as {
		timed_out: boolean;
		truncated: boolean;
		output: string;
	};
	assert.equal(projection.timed_out, true);
	assert.equal(projection.truncated, true);
	assert.match(projection.output, /truncated/);
	assert.ok(Buffer.byteLength(projection.output, "utf8") <= 64);
});
