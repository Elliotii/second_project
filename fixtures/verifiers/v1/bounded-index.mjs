import { pathToFileURL } from "node:url"; import { resolve } from "node:path";
const id="v1-bounded-index-verifier"; try { const {boundedAt}=await import(pathToFileURL(resolve(process.env.V1_WORKSPACE,"src/subject.ts"))); const v=["a","b"];
const passed=boundedAt(v,0)==="a"&&boundedAt(v,1)==="b"&&boundedAt(v,-1)===undefined&&boundedAt(v,2)===undefined&&boundedAt(v,0.5)===undefined;
console.log(JSON.stringify({schema_version:1,verifier_id:id,status:passed?"passed":"failed",summary:passed?"behavior accepted":"index contract failed",...(passed?{}:{failed_checks:["index_behavior"]})})); process.exitCode=passed?0:1;
} catch { console.log(JSON.stringify({schema_version:1,verifier_id:id,status:"failed",summary:"index verifier exception",failed_checks:["index_exception"]})); process.exitCode=1; }
