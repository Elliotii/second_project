import { runGoal25RealPairEntryV35 } from "../src/v35g25/real-entry-v35g25.ts";

const result = await runGoal25RealPairEntryV35(process.argv.slice(2));
process.stdout.write(`${JSON.stringify(result)}\n`);
