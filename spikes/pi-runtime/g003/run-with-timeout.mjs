import { spawn } from "node:child_process";

const timeoutMs = Number(process.argv[2]);
const command = process.argv[3];
const args = process.argv.slice(4);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || !command) {
	throw new Error("usage: node run-with-timeout.mjs <timeout-ms> <command> [args...]");
}

const child = spawn(command, args, { stdio: "inherit", windowsHide: true });
const timer = setTimeout(() => {
	console.error(`command timed out after ${timeoutMs} ms`);
	if (process.platform === "win32" && child.pid) {
		spawn("taskkill", ["/F", "/T", "/PID", String(child.pid)], { stdio: "ignore", windowsHide: true });
	} else {
		child.kill("SIGKILL");
	}
}, timeoutMs);

child.on("error", (error) => {
	clearTimeout(timer);
	console.error(error.message);
	process.exitCode = 1;
});
child.on("exit", (code, signal) => {
	clearTimeout(timer);
	process.exitCode = signal ? 124 : (code ?? 1);
});
