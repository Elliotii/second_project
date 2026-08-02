import { pathToFileURL } from "node:url"; import { resolve } from "node:path";
const id="v1-state-transition-verifier"; try { const {canSettle}=await import(pathToFileURL(resolve(process.env.V1_WORKSPACE,"src/subject.ts")));
const passed=canSettle("running")===true&&["failed","settled","cancelled","planned",""] .every((x)=>canSettle(x)===false);
console.log(JSON.stringify({schema_version:1,verifier_id:id,status:passed?"passed":"failed",summary:passed?"behavior accepted":"transition contract failed",...(passed?{}:{failed_checks:["transition_behavior"]})})); process.exitCode=passed?0:1;
} catch { console.log(JSON.stringify({schema_version:1,verifier_id:id,status:"failed",summary:"transition verifier exception",failed_checks:["transition_exception"]})); process.exitCode=1; }
