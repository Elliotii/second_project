import { pathToFileURL } from "node:url"; import { resolve } from "node:path";
const id="v1-stable-format-verifier"; try { const {stableFormat}=await import(pathToFileURL(resolve(process.env.V1_WORKSPACE,"src/subject.ts"))); const input={z:"2",a:"1",m:"3"}; const before=JSON.stringify(input);
const one=stableFormat(input),two=stableFormat({m:"3",z:"2",a:"1"}); const passed=one==='{\"a\":\"1\",\"m\":\"3\",\"z\":\"2\"}'&&two===one&&JSON.stringify(input)===before;
console.log(JSON.stringify({schema_version:1,verifier_id:id,status:passed?"passed":"failed",summary:passed?"behavior accepted":"format contract failed",...(passed?{}:{failed_checks:["format_behavior"]})})); process.exitCode=passed?0:1;
} catch { console.log(JSON.stringify({schema_version:1,verifier_id:id,status:"failed",summary:"format verifier exception",failed_checks:["format_exception"]})); process.exitCode=1; }
