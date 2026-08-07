# V2-B R2 `context_message_count` Main Narrow Review

```yaml
status: accepted_for_hit_specific_reaudit
date: 2026-08-07
review_owner: main_session
source_execution_baseline: a9da3c505af6219a05202359c113a4de6943b16f
implementation_session: 019fd804-a262-7e70-aa6f-865d2dc478ba
main_disposition: ACCEPT_CONTEXT_MESSAGE_COUNT_CORRECTION_FOR_HIT_SPECIFIC_REAUDIT
```

## Review result

Main independently inspected the full source/test diff and correction report. The implementation is
bounded to the observed real-path evidence omission:

- the first actual Provider payload now supplies both its existing safe SHA-256 identity and exact
  message-array count;
- invalid or absent `messages` fails through the existing typed shape boundary;
- the Inspector still requires a non-negative safe integer;
- the deterministic Faux count path remains unchanged;
- Case, A/B treatment, Negative, budgets, Prompt, Skill, Verifier, Selector, Session lineage, Pi and
  historical evidence are unchanged.

Main reran strict TypeScript successfully. Its first direct test launch lacked the audited public-Pi
loader and failed before tests with `ERR_MODULE_NOT_FOUND`; after applying the existing read-only loader,
the same `workbench/tests/v2b-r2.test.ts` suite passed 8/8 with zero skipped. This is classified as a
mechanical Main environment difference, not a source or product failure.

## Decision

The correction is suitable for a Candidate Audit Baseline Commit and a hit-specific re-audit by the
existing V2-B R2 Audit Session. The re-audit should inspect only:

1. first-payload message count capture on the real hook;
2. fail-closed invalid-shape behavior;
3. unchanged Inspector strictness and deterministic Faux behavior;
4. exact source/identity/Pi boundaries and the focused regression.

No fresh Audit Session, broad audit, new Case, budget or architecture work is warranted.
