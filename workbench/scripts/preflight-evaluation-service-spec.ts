import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { evaluateEvaluation } from "./evaluate-evaluation.ts";
import { loadEvaluationSpecRegistry, safeProjectPath, validateFormalSpecFiles } from "../src/evaluation-service/registry.ts";

const [registryArgument, specId, outputArgument] = process.argv.slice(2);
if (!registryArgument || !specId || !outputArgument) throw new Error("usage: preflight-evaluation-service-spec <registry> <spec-id> <new-output>");
const projectRoot = resolve("..");
const registryPath = resolve(registryArgument);
const output = resolve(outputArgument);
const spec = loadEvaluationSpecRegistry(registryPath).get(specId);
if (!spec || spec.executor.kind !== "formal_cli") throw new Error("enabled formal_cli Spec was not found");
validateFormalSpecFiles(projectRoot, spec);
mkdirSync(dirname(output), { recursive: true });
const sentinel = "ZERO_CALL_PREFLIGHT_REACHED_EXECUTION_BOUNDARY";
try {
	await evaluateEvaluation({
		projectRoot,
		plan: safeProjectPath(projectRoot, spec.executor.plan_path, "plan_path"),
		bindings: spec.executor.bindings.map((binding) => ({ planId: binding.plan_id, configPath: safeProjectPath(projectRoot, binding.config_path, `config ${binding.plan_id}`) })),
		credentialFile: resolve(".zero-call-preflight-no-credential"),
		output,
		analysisRequestTimeoutMs: spec.executor.analysis_request_timeout_ms,
		json: true,
	}, {
		credentialResolverFactory: () => ({ async resolve(): Promise<string> { throw new Error("zero-call preflight attempted Credential resolution"); } }),
		runTask: async () => { throw new Error(sentinel); },
		review: async () => { throw new Error("zero-call preflight unexpectedly reached review"); },
	});
	throw new Error("zero-call preflight unexpectedly completed");
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	if (!message.includes(sentinel)) throw error;
}
process.stdout.write(`${JSON.stringify({ status: "ready_at_execution_boundary", real_model_calls: 0, credential_reads: 0, spec_id: specId, registry: registryPath, preflight_output: output, analysis_request_timeout_ms: spec.executor.analysis_request_timeout_ms })}\n`);
