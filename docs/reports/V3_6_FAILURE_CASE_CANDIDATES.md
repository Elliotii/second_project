# V3.6 Engineering Stabilization — Failure Case Candidates

Status: frozen at Campaign Closeout.

## Candidate: ES-N03 Tool-budget terminalization before/after

| Field | Record |
| --- | --- |
| Case ID | `ES_N03` plus one post-maintenance Retest |
| Task | Behavior-preserving non-negative-integer validation refactor across multiple modules |
| Before-Fix failure | Tool budget stopped the Run, but no trusted terminal was created and Session inspection collapsed to generic `request_rejected` |
| Detection | External HTTP result, persistent Pi Session/Trace, Tool call/result counts, absent terminal/Manifest/command evidence, unchanged Source |
| Maintenance | Additive schema-4 reconciliation for persisted, registered, rejected, executed and blocked Tool identities; no budget or Agent Loop change |
| After evidence | Same lifecycle recurred naturally; schema-4 typed terminal persisted, HTTP inspection worked, proposed ChangeSet stayed unverified, Apply denied |
| Harness response | `STOP / FAIL CLOSED`; no Retry, continuation, replacement or automatic budget increase |
| Outcome | Maintenance target passed; coding task remained incomplete because verification never executed |
| Limitation | Current daily Tool/token envelope may be tight for this medium refactor; trajectory also showed inefficient granular reads/edits |
| Counterfactual | Without terminalization, the user sees only a generic rejection and cannot safely distinguish partial Workspace progress from verified completion |
| Interview value | Demonstrates real-workload detection, immutable before/after evidence, typed terminalization, authority preservation, and refusal to make the result prettier by retrying or raising caps |

This is a candidate narrative, not a claim that every finite-budget failure is solved or
that the Tool cap is optimal. ES-N01 and ES-N02 were normal-completion cases, not failure
candidates. Historical UX Attempts remain separate context and are not reclassified as
Campaign Natural Cases.
