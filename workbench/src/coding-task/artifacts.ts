import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import type { CodingTaskRunManifest } from "./contracts.ts";

export function portableArtifactPath(runRoot: string, path: string): string {
	return relative(resolve(runRoot), resolve(path)).split(sep).join("/");
}

export function writeJson(path: string, value: unknown): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

export function writeText(path: string, value: string): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, value, { encoding: "utf8", flag: "wx" });
}

function shown(value: number | "unknown"): string {
	return value === "unknown" ? "unknown" : String(value);
}

export function renderReport(manifest: CodingTaskRunManifest): string {
	const changed = [...manifest.changes.added, ...manifest.changes.modified, ...manifest.changes.deleted];
	return `# Coding Task Run ${manifest.run_id}

## Task

- Task ID: ${manifest.task_id}
- Model: ${manifest.model.provider}/${manifest.model.id}
- Execution status: ${manifest.execution_status}
- Verification status: ${manifest.verification_status}

## Agent and Verifier

- Agent final claim: ${manifest.agent_final_claim ?? "unknown"}
- External Verifier result: ${manifest.verification_status}
- Failure reason: ${manifest.failure_reason ?? "none"}

## Changes and Agent Tests

- Changed files: ${changed.length > 0 ? changed.join(", ") : "none"}
- Agent test/command executions: see trace.json events
- Final Diff: ${manifest.artifacts.diff}

## Usage

- Provider requests: ${manifest.usage.request_count}
- Input tokens: ${shown(manifest.usage.input_tokens)}
- Output tokens: ${shown(manifest.usage.output_tokens)}
- Cost USD: ${shown(manifest.usage.cost_usd)}
- Tool calls: ${manifest.usage.tool_count}
- Duration ms: ${manifest.usage.duration_ms}

## Artifacts

- Session: ${manifest.artifacts.session}
- Trace: ${manifest.artifacts.trace}
- Diff: ${manifest.artifacts.diff}
- Verifier: ${manifest.artifacts.verifier_result}
- Manifest: run-manifest.json

## Known Limitations

${manifest.known_limitations.map((entry) => `- ${entry}`).join("\n") || "- none"}
`;
}
