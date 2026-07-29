# G003 Direct AgentHarness Go Gate Retry

This bounded spike verifies the integrity-pinned Pi AI model-data restore, the
standard emitted public package boundary, and deterministic Gates A-E. It uses
only the local faux provider, one disposable output file, one external
verifier, and at most one Candidate recovery prompt. It does not call a real
model or use SDK, RPC, WSL, containers, live model-data generation, or private
Pi imports.

Run from the project root with Windows PowerShell:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
npm.cmd run build --workspace=@earendil-works/pi-agent-core
node spikes/pi-runtime/g003/verify-artifact.mjs .runs/g003/source .runs/g003/evidence
node spikes/pi-runtime/g003/stage-model-data.mjs D:/AI/AI_Projects/project2
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/public-import-smoke.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/resolve-public-types.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node .runs/g003/pi/node_modules/typescript/bin/tsc -p spikes/pi-runtime/g003/tsconfig.json --noEmit
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node --test spikes/pi-runtime/g003/gates.test.ts
```

The setup commands must be applied only under the fresh `.runs/g003` root and
in the exact order specified by the G003 Goal Contract. The provenance and
Gate commands are not designed to overwrite or reset prior evidence.
