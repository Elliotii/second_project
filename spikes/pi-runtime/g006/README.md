# G006 Phase 3 Real-model Completion Verification Clean Retry

This bounded clean-retry Spike preserves G005's model, task, tool, Verifier,
Policy and budget inputs while correcting only the accepted response Observer
and Journal-envelope defects. Gate 0 uses the public emitted Faux Provider and
offline regressions with zero credential loading and zero external provider
calls. A real paired attempt remains separately gated after Main Session source
review, an explicitly authorized implementation-baseline commit and Stage 2
authorization.

The API key is never supplied on a command line. Only the credential-check and
real-run processes may receive it, exclusively through:

```powershell
node --env-file=.env.g005 ...
```

The Session implementation keeps full reasoning only in process memory so Pi
can replay `reasoning_content` after tool calls. Before each Session entry is
written to JSONL, thinking text and thought signatures are removed; separate
records retain only presence, length, and entry association.

G005 code and evidence remain immutable. Generated G006 preflight state belongs
under `.runs/g006/preflight`; a future real pair may use only the write-once
`.runs/g006/attempt-001` root.
