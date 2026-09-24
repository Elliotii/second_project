import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import type { ProcessTreeRecord } from "./contracts.ts";

const execFileAsync = promisify(execFile);

function alive(pid: number): boolean {
	try { process.kill(pid, 0); return true; }
	catch (error) { return (error as NodeJS.ErrnoException).code === "EPERM"; }
}

async function commandLine(pid: number): Promise<string | null> {
	if (!alive(pid)) return null;
	if (process.platform === "win32") {
		try {
			const script = `$p = Get-CimInstance Win32_Process -Filter \"ProcessId = ${pid}\"; if ($null -ne $p) { [Console]::Out.Write($p.CommandLine) }`;
			const result = await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], { windowsHide: true, timeout: 5_000, maxBuffer: 256 * 1024 });
			return result.stdout || null;
		} catch { return null; }
	}
	try { return readFileSync(`/proc/${pid}/cmdline`).toString("utf8").replaceAll("\0", " "); }
	catch { return null; }
}

async function killOne(pid: number): Promise<void> {
	if (!alive(pid)) return;
	try {
		if (process.platform === "win32") await execFileAsync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, timeout: 10_000, maxBuffer: 256 * 1024 });
		else process.kill(-pid, "SIGKILL");
	} catch {
		try { process.kill(pid, "SIGKILL"); } catch { /* already gone or not ours */ }
	}
}

async function waitGone(pids: readonly number[], graceMs: number): Promise<boolean> {
	const deadline = Date.now() + graceMs;
	while (pids.some(alive) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 50));
	return pids.every((pid) => !alive(pid));
}

export interface CleanupResult {
	cleanup_confirmed: boolean;
	message: string;
	inspected_pids: number[];
}

export async function terminateRecordedProcessTree(options: { runnerPid: number; launchToken: string; processTreePath: string; graceMs: number }): Promise<CleanupResult> {
	let records: ProcessTreeRecord["processes"] = [{ pid: options.runnerPid, role: "runner", identity_fragment: options.launchToken }];
	if (existsSync(options.processTreePath)) {
		try {
			const parsed = JSON.parse(readFileSync(options.processTreePath, "utf8")) as ProcessTreeRecord;
			if (parsed.schema_version === 1 && parsed.launch_token === options.launchToken && Array.isArray(parsed.processes)) records = parsed.processes;
		} catch { /* retain the independently recorded runner */ }
	}
	const live = records.filter((entry) => Number.isSafeInteger(entry.pid) && entry.pid > 0 && alive(entry.pid));
	for (const entry of live) {
		const line = await commandLine(entry.pid);
		if (line === null || !line.includes(entry.identity_fragment)) {
			return { cleanup_confirmed: false, message: `process identity could not be confirmed for pid ${entry.pid}`, inspected_pids: live.map((item) => item.pid) };
		}
	}
	for (const entry of live) await killOne(entry.pid);
	const pids = [...new Set(records.map((entry) => entry.pid))];
	const gone = await waitGone(pids, options.graceMs);
	return { cleanup_confirmed: gone, message: gone ? "recorded process tree is no longer running" : "one or more recorded processes remain alive", inspected_pids: pids };
}

export function processIsAlive(pid: number): boolean { return alive(pid); }
