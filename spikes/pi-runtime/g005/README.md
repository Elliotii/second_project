# G005 Phase 3 Real-model Completion Verification Feasibility

This bounded spike exercises the public emitted `pi-agent-core` `AgentHarness`
against exactly one DeepSeek V4 Flash paired attempt. It uses one fixed fixture,
three pathless/commandless tools, an external verifier, and at most one
verifier-triggered Candidate recovery cycle. It does not modify Pi Core or the
pinned upstream tree and does not create the formal workbench.

The API key is never supplied on a command line. Only the credential-check and
real-run processes may receive it, exclusively through:

```powershell
node --env-file=.env.g005 ...
```

The Session implementation keeps full reasoning only in process memory so Pi
can replay `reasoning_content` after tool calls. Before each Session entry is
written to JSONL, thinking text and thought signatures are removed; separate
records retain only presence, length, and entry association.

The exact setup, Gate A, offline test, typecheck, real-run, and evidence audit
commands are recorded in `docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_REPORT.md`.
