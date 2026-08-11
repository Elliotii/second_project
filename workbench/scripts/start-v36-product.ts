import { resolve } from "node:path";
import { createDeferredCredentialFileResolverV35 } from "../src/session/real-smoke-turn-v35.ts";
import { createDailyProductApplicationV36, loadDailyProjectProfileV36 } from "../src/v36/daily-product-v36.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";

interface Options { profileFile: string; credentialFile: string; dockerExecutable: string; dataRoot: string; port: number; smoke: boolean }

function argumentsFrom(argv: readonly string[]): Options {
	const values: Partial<Options> = { dataRoot: resolve(process.cwd(), "../.runs/v3-6/daily-product"), port: 43_136, smoke: false };
	for (let index = 0; index < argv.length; index += 1) {
		const key = argv[index];
		if (key === "--smoke") { values.smoke = true; continue; }
		const next = argv[++index];
		if (!next) throw new Error("daily Product arguments are invalid");
		if (key === "--profile-file") values.profileFile = resolve(next);
		else if (key === "--credential-file") values.credentialFile = resolve(next);
		else if (key === "--docker-executable") values.dockerExecutable = resolve(next);
		else if (key === "--data-root") values.dataRoot = resolve(next);
		else if (key === "--port") values.port = Number(next);
		else throw new Error("daily Product arguments are invalid");
	}
	if (!values.profileFile || !values.credentialFile || !values.dockerExecutable || !Number.isSafeInteger(values.port) || values.port! < 0 || values.port! > 65_535) throw new Error("daily Product required arguments are missing or invalid");
	return values as Options;
}

const options = argumentsFrom(process.argv.slice(2));
const profile = loadDailyProjectProfileV36(options.profileFile);
const application = createDailyProductApplicationV36({ profile, dataRoot: options.dataRoot, dockerExecutable: options.dockerExecutable, credentialResolver: createDeferredCredentialFileResolverV35(options.credentialFile) });
const loopback = createWorkbenchLoopbackServerV36G1(application);
const address = await loopback.start(options.port);
process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "v36_daily_product_started", url: address.url, project_id: profile.project.project_id, mode: "bounded_edit_deepseek_v4_flash", source_apply: "host_handoff_only" })}\n`);
if (options.smoke) {
	await loopback.stop();
	process.stdout.write(`${JSON.stringify({ schema_version: 1, event: "v36_daily_product_stopped", real_model_calls: 0 })}\n`);
}
