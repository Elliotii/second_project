import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const id = "v1-parse-duration-verifier";
try {
  const { parseDuration } = await import(pathToFileURL(resolve(process.env.V1_WORKSPACE, "src/subject.ts")));
  const checks = [parseDuration("0ms") === 0, parseDuration("17ms") === 17, parseDuration("3s") === 3000];
  for (const bad of ["3", "-1s", "1.5s", " 2s", "2s "]) { try { parseDuration(bad); checks.push(false); } catch { checks.push(true); } }
  const passed = checks.every(Boolean); console.log(JSON.stringify({schema_version:1,verifier_id:id,status:passed?"passed":"failed",summary:passed?"behavior accepted":"duration contract failed",...(passed?{}:{failed_checks:["duration_behavior"]})})); process.exitCode=passed?0:1;
} catch { console.log(JSON.stringify({schema_version:1,verifier_id:id,status:"failed",summary:"duration verifier exception",failed_checks:["duration_exception"]})); process.exitCode=1; }
