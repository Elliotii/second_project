#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));

export const WORKBENCH_HELP = `Agent Eval & Skill Optimization Workbench

Usage:
  workbench <group> <command> [options]

Main workflow commands:
  experience run      Execute predefined Coding Run instances in order.
  skill build         Build one Candidate Skill from selected valid Run evidence.
  evaluation run      Execute a frozen Formal Evaluation and produce its review.

Auxiliary / re-entry commands:
  task run            Execute exactly one Coding Task and persist its artifacts.
  evaluation review   Re-analyze existing Evaluation artifacts without Coding Runs.

Use "workbench <group> --help" or "workbench <group> <command> --help" for details.
`;

const GROUP_HELP = {
	experience: `Usage:\n  workbench experience run [options]\n\nExecute an ordered list of predefined Coding Task configs. Each --run is exactly one Run; legal Verifier failure is preserved and does not stop the sequence.\n`,
	skill: `Usage:\n  workbench skill build [options]\n\nBuild one Candidate Skill from explicitly selected evidence-valid passed and/or failed Coding Runs.\n`,
	evaluation: `Usage:\n  workbench evaluation run [options]\n  workbench evaluation review [options]\n\nRun a frozen Formal Evaluation, or re-enter review using existing Evaluation artifacts.\n`,
	task: `Usage:\n  workbench task run [options]\n\nExecute exactly one Coding Task with the existing isolated Workspace, Pi runtime and External Verifier.\n`,
};

const ROUTES = new Map([
	["experience run", "run-experience.ts"],
	["skill build", "build-skill-from-runs.ts"],
	["evaluation run", "evaluate-evaluation.ts"],
	["evaluation review", "review-evaluation.ts"],
	["task run", "run-coding-task.ts"],
]);

export function resolveWorkbenchRoute(argv) {
	if (argv.length === 0 || (argv.length === 1 && argv[0] === "--help")) return { kind: "help", text: WORKBENCH_HELP };
	const [group, command, ...rest] = argv;
	if (!Object.hasOwn(GROUP_HELP, group)) return { kind: "error", message: `unknown command group ${group ?? ""}` };
	if (command === undefined || command === "--help") return { kind: "help", text: GROUP_HELP[group] };
	const script = ROUTES.get(`${group} ${command}`);
	if (!script) return { kind: "error", message: `unknown command ${group} ${command}` };
	return { kind: "command", script: resolve(scriptRoot, script), args: rest };
}

export function runWorkbench(argv) {
	const route = resolveWorkbenchRoute(argv);
	if (route.kind === "help") {
		process.stdout.write(route.text);
		return 0;
	}
	if (route.kind === "error") {
		process.stderr.write(`${route.message}\n\n${WORKBENCH_HELP}`);
		return 1;
	}
	const child = spawnSync(process.execPath, ["--experimental-loader", pathToFileURL(resolve(scriptRoot, "v35g2-public-pi-loader.mjs")).href, route.script, ...route.args], {
		cwd: process.cwd(),
		env: process.env,
		stdio: "inherit",
		windowsHide: true,
	});
	if (child.error) {
		process.stderr.write(`workbench command failed to start: ${child.error.message}\n`);
		return 1;
	}
	return child.status ?? 1;
}

const entry = process.argv[1] ? pathToFileURL(realpathSync(resolve(process.argv[1]))).href : "";
if (import.meta.url === entry) process.exitCode = runWorkbench(process.argv.slice(2));
