import { resolve } from "node:path";
import { runGoal2ReferenceCalibrationV35 } from "../src/v35g2/calibration-v35g2.ts";

function value(flag: string): string | undefined { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; }
const projectRoot = resolve(value("--project-root") ?? ".");
const output = value("--output-root");
if (!output) throw new Error("--output-root is required");
const result = runGoal2ReferenceCalibrationV35({ projectRoot, outputRoot: resolve(output) });
process.stdout.write(`${JSON.stringify(result)}\n`);
