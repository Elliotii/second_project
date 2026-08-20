# V3.7 Goal 3B Counter Correction Allowlist and Focused-Test Amendment

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-21
authority: V3_7_CHARTER.md
finding: G3B-PREFREEZE-P1-001
candidate_capacity: resume_same_1_of_1_no_prior_candidate
real_access: false
```

## Decision

The user authorized the one necessary G3A-specific Recovery source path and replaced the
previous broad regression matrix with a finding-specific minimum. The stopped experiment
created no Candidate, so the original implementation Session resumes the same single
Candidate capacity rather than starting another correction round.

Add exactly this implementation path to the existing allowlist:

```text
workbench/src/v37/registered-recovery-v37g3a.ts
```

The original four allowlisted paths remain allowed. No other source, test, report,
configuration or control path is authorized for the Candidate.

## Required behavior

The registered Recovery bridge must pass the terminal's exact actual counter tuple to the
unchanged accepted V2 Inspector. The G3A Primary Inspector must independently derive
Provider dispatches from the V2-inspected Journal/Candidate evidence and enforce both
actual-ledger equality and registered maxima. The follow-up validator must enforce actual
request alignment and registered maxima. Every existing Task, Run, Session, Candidate,
Selection, budget, terminal, admission, no-retry and no-fallback check remains intact.

## Minimum verification

Implementation and Main review run exactly one focused test command selecting tests whose
names contain `G3B counter maxima`. That focused group must collectively prove:

- real-declared under-cap Primary proceeds through Recovery without the duplicate exact
  counter obstruction;
- over-cap and Provider-ledger mismatch fail before a receipt and without fallback;
- follow-up under-cap request-aligned usage passes, while over-cap/request mismatch fails;
- real-declared zero actual access fails;
- the deterministic zero-access Recovery route remains unchanged;
- actual Credential/network/Provider/model operations performed by the tests remain zero.

Also run strict TypeScript, `git diff --check`, exact Candidate allowlist inspection and
frozen registry/config byte comparison. Do not run the full G3A product suite, G1/G2, V2,
V3, V3.6 or demo unless the focused test supplies concrete evidence of a shared-boundary
regression. Repetition alone is not a reason to expand the matrix.

## Focused re-audit

A fresh independent read-only review remains required because the finding affects
real-access accounting and terminal validity. It reviews the exact diff, reruns only the
same focused test command and strict TypeScript, checks allowlist/config immutability and
confirms the positive fix did not remove the negative guards. It must not run unrelated
suites, edit source, repair, change control state, freeze Goal 3B or use real access.

This Amendment supersedes only the original Prompt's exact allowlist, verification matrix
and outside-allowlist Hard Stop for the one named path. All other Prompt and Amendment
rules remain frozen.
