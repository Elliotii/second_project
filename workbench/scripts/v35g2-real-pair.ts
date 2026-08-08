import { resolve } from "node:path";
import { executeGoal2RealPairV35, prepareGoal2PairV35 } from "../src/v35g2/pair-v35g2.ts";

function value(flag: string): string | undefined { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; }
const projectRoot = resolve(value("--project-root") ?? "."); const pairValue = value("--pair-root"); const stateValue = value("--historical-state-root"); const implementationCommit = value("--implementation-commit");
if (!pairValue || !stateValue || !implementationCommit || value("--authorize-real-pair") !== "V3_5_G2_REAL_PAIR_ONCE") throw new Error("the frozen real-pair arguments and explicit authorization token are required");
const prepared = await prepareGoal2PairV35({ projectRoot, pairRoot: resolve(pairValue), historicalStateRoot: resolve(stateValue) });
const result = await executeGoal2RealPairV35({ projectRoot, ...prepared, expectedImplementationCommit: implementationCommit, credentialResolver: { resolve: async () => { const value = process.env.DEEPSEEK_API_KEY; if (!value) throw new Error("opaque DeepSeek credential unavailable"); return value; } } });
process.stdout.write(`${JSON.stringify(result)}\n`);
