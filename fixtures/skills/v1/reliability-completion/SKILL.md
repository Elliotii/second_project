---
name: reliability-completion
description: Complete a bounded TypeScript maintenance task and verify the result before finishing.
disable-model-invocation: true
---
Inspect the provided TypeScript task before editing. Preserve the declared public API and protected files. Make the smallest change that satisfies the task, run the task-declared public check, inspect the result, and only then report completion. If a check fails, use its public output to make one focused correction. Do not claim success from source inspection alone.
