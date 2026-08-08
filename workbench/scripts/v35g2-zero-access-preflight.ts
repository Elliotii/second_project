import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { writeOnceJson } from "../src/evidence/artifacts.ts";
import { digestObject } from "../src/hash.ts";
import { assertFrozenGoal2CaseBytesV35, materializeGoal2CaseAuthorityV35 } from "../src/v35g2/case-v35g2.ts";
import { materializeGoal2StateSelectionV35 } from "../src/v35g2/state-selection-v35g2.ts";

function value(flag: string): string | undefined { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; }
const projectRoot = resolve(value("--project-root") ?? ".");
const outputValue = value("--output-root"); const historicalValue = value("--historical-state-root");
if (!outputValue || !historicalValue) throw new Error("--output-root and --historical-state-root are required");
const outputRoot = resolve(outputValue); if (existsSync(outputRoot)) throw new Error("zero-access preflight output already exists"); mkdirSync(outputRoot, { recursive: true });
assertFrozenGoal2CaseBytesV35(projectRoot);
const caseAuthority = materializeGoal2CaseAuthorityV35({ projectRoot, authorityRoot: resolve(outputRoot, "case") });
const selection = await materializeGoal2StateSelectionV35({ sourceStateRoot: resolve(historicalValue), authorityRoot: resolve(outputRoot, "state-selection") });
const body = { schema_version: 1, case_authority_digest: caseAuthority.authority.authority_digest, state_selection_digest: selection.authority.authority_digest, selected_state_digest: selection.authority.selected_state_digest, skill_source_sha256: selection.authority.skill_source_sha256, skill_wrapper_sha256: selection.authority.skill_wrapper_sha256, credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0, real_cost_usd: 0 };
const result = { ...body, preflight_digest: digestObject(body) }; writeOnceJson(outputRoot, "zero-access-preflight.json", result); process.stdout.write(`${JSON.stringify(result)}\n`);
