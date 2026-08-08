import { resolve } from "node:path";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import {
	executeGoal25RealPairV35,
	prepareGoal25PairV35,
	type Goal25ComparisonV35,
} from "./pair-v35g25.ts";

export const GOAL25_REAL_PAIR_AUTHORIZATION_TOKEN_V35 = "V3_5_G2_5_REAL_PAIR_ONCE";

export interface Goal25RealPairArgumentsV35 {
	projectRoot: string;
	pairRoot: string;
	historicalStateRoot: string;
	expectedExecutionBaseline: string;
}

const FLAGS = [
	"--project-root",
	"--pair-root",
	"--historical-state-root",
	"--execution-baseline",
	"--authorize-real-pair",
] as const;

export function parseGoal25RealPairArgumentsV35(argv: readonly string[]): Goal25RealPairArgumentsV35 {
	if (argv.length !== FLAGS.length * 2) throw new Error("the exact Goal 2.5 real-pair arguments are required");
	const values = new Map<string, string>();
	for (let index = 0; index < argv.length; index += 2) {
		const flag = argv[index];
		const value = argv[index + 1];
		if (!flag || !FLAGS.includes(flag as typeof FLAGS[number]) || values.has(flag) || !value || value.startsWith("--")) throw new Error("the exact Goal 2.5 real-pair arguments are required");
		values.set(flag, value);
	}
	if (values.get("--authorize-real-pair") !== GOAL25_REAL_PAIR_AUTHORIZATION_TOKEN_V35) throw new Error("the explicit Goal 2.5 real-pair authorization token is invalid");
	const baseline = values.get("--execution-baseline")!;
	if (!/^[a-f0-9]{40}$/.test(baseline)) throw new Error("the audited Goal 2.5 Execution Baseline is invalid");
	return {
		projectRoot: resolve(values.get("--project-root")!),
		pairRoot: resolve(values.get("--pair-root")!),
		historicalStateRoot: resolve(values.get("--historical-state-root")!),
		expectedExecutionBaseline: baseline,
	};
}

export function createGoal25EnvironmentCredentialResolverV35(environment: NodeJS.ProcessEnv = process.env): OpaqueCredentialResolverV1 {
	return {
		resolve: async () => {
			const credential = environment["DEEPSEEK_API_KEY"];
			if (!credential) throw new Error("opaque DeepSeek credential unavailable");
			return credential;
		},
	};
}

export async function runGoal25RealPairEntryV35(argv: readonly string[], environment: NodeJS.ProcessEnv = process.env): Promise<Goal25ComparisonV35> {
	const args = parseGoal25RealPairArgumentsV35(argv);
	const prepared = await prepareGoal25PairV35({
		projectRoot: args.projectRoot,
		pairRoot: args.pairRoot,
		historicalStateRoot: args.historicalStateRoot,
	});
	return await executeGoal25RealPairV35({
		projectRoot: args.projectRoot,
		prepared,
		expectedExecutionBaseline: args.expectedExecutionBaseline,
		credentialResolver: createGoal25EnvironmentCredentialResolverV35(environment),
	});
}
