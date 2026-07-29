import { resolve } from "node:path";
import { runProcess, sha256, truncateUtf8, writeJson } from "./runtime-utils.ts";

export type VerificationResult = {
	id: "g005-parse-duration-verifier-v1";
	status: "passed" | "failed";
	exitCode: number | null;
	timedOut: boolean;
	durationMs: number;
	stdout: string;
	stderr: string;
	feedback: string;
	feedbackTruncated: boolean;
	fullOutputSha256: string;
};

export async function verifyWorkspace(options: {
	projectRoot: string;
	workspace: string;
	evidencePath: string;
}): Promise<VerificationResult> {
	const acceptance = resolve(options.projectRoot, "spikes/pi-runtime/g006/acceptance/acceptance.test.ts");
	const result = await runProcess({
		command: process.execPath,
		args: ["--test", "test/public.test.ts", acceptance],
		cwd: options.workspace,
		timeoutMs: 30_000,
		maxCombinedOutputBytes: 65_536,
		env: { G005_WORKSPACE: options.workspace },
	});
	const fullOutput = `${result.stdout}${result.stderr}`;
	const feedback = truncateUtf8(fullOutput, 8_192);
	const verification: VerificationResult = {
		id: "g005-parse-duration-verifier-v1",
		status: result.exitCode === 0 && !result.timedOut ? "passed" : "failed",
		exitCode: result.exitCode,
		timedOut: result.timedOut,
		durationMs: result.durationMs,
		stdout: result.stdout,
		stderr: result.stderr,
		feedback: feedback.text,
		feedbackTruncated: feedback.truncated,
		fullOutputSha256: sha256(fullOutput),
	};
	writeJson(options.evidencePath, verification);
	return verification;
}
