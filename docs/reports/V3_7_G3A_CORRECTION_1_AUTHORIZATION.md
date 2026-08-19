# V3.7 Goal 3A Correction 1 Authorization

```yaml
status: AUTHORIZED
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
finding_set: V37-G3A-MAIN-P1-001_through_V37-G3A-MAIN-P2-008
preserved_failed_candidate_commit: 71dd205e5fea6610d855ababb16dd17d265d83e7
preserved_failed_candidate_tree: e1a71cc0858b9f1b23fb54b49e0467e6702f94ed
implementation_owner: /root/v37_g3a_implementation
ordinary_correction_budget: 1_of_2
candidate_commits_authorized: 1
audit_authority: false
goal_3b_authority: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Exact correction scope

Correct only the eight findings in the Main preliminary review and the deterministic
tests/reports necessary to prove them. Preserve the failed Candidate commit/tree without
amendment. Only these existing Candidate-allowlisted paths plus the correction report may
change:

```text
workbench/src/contracts/v37g3a-types.ts
workbench/src/v37/host-registry-v37g3a.ts
workbench/src/v37/workflow-registration-v37g3a.ts
workbench/src/v37/registered-recovery-v37g3a.ts
workbench/src/v37/registered-follow-up-v37g3a.ts
workbench/src/v37/workflow-journal-v37g3a.ts
workbench/src/v37/product-service-v37g3a.ts
workbench/src/read-model/workflow-v37g3a.ts
workbench/src/webui/application-v37g3a.ts
workbench/src/webui/static/styles.css
workbench/scripts/start-v37g3a-demo.ts
workbench/tests/v37g3a-authority.test.ts
workbench/tests/v37g3a-product.test.ts
workbench/tests/v37g3a-http-ui.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_CORRECTION_1_REPORT.md
```

No registered Goal 3A config/fixture bytes, accepted v1 bytes, V2/V3/G2 semantic module,
old Goal file, package/config, Charter, Amendment, Prompt, control state, Pi or Goal 3B
file may change. If an exact fix needs another path, stop with zero out-of-allowlist delta
and return the reason to Main.

## Required outcomes

1. Discover Cases from the validated bounded Host registry, not Case-id constants. Provide
   Host-construction-only execution ports so a later reviewed third config can use this
   service/path without a G3A source edit. Keep today's deterministic adapters as defaults
   for the two frozen G3A Cases. Do not add real provider/config/access. Browser/API callers
   must not select or inject authority/runtime ports.
2. Derive the post-Primary stage from the validated formal Primary terminal outcome, not
   from Case id. Invalid, missing or contradictory formal facts fail closed.
3. Store immutable accepted State-version and promotion-Decision artifact references in
   Regression receipts. Complete two workflows, restart, and reopen both independently
   after the shared active pointer advances.
4. Before Primary dispatch, verify the exact registered Task JSON/instruction, source-tree
   content and Verifier content against Host-loaded authority. Add one-at-a-time drift
   rejection tests and restore every temporary mutation reliably.
5. Use a collision-resistant Host default workflow-id mint across restart; preserve a
   constructor-injected deterministic mint solely for bounded tests.
6. Reject symlink/junction/reparse ancestors under each workflow journal/receipts path on
   create, append and reopen. Require ordinary single-link formal artifact files. Add
   deterministic descendant-junction and formal-hardlink rejection tests where the local
   platform supports those primitives; explicit fail-closed platform handling is allowed.
7. Bind the new loader fingerprint to every source file that supplies its authority
   validation semantics, including the frozen v1 validator, and enforce canonical stable
   JSON bytes with the required terminal newline. Add focused mutation/reformat rejection.
8. Complete and accept a workflow before disabling its registration; snapshot formal
   artifact/admission/Assessment identities, reopen read-only after disable, prove them
   unchanged, and prove every new action is unavailable.
9. Repair the malformed stylesheet declaration and add a deterministic CSS syntax guard
   that fails on the observed quote regression.
10. Add a temporary, ignored, fully Host-validated third registration/config test proving
    registry discovery and the same service/Host-port path without implementation-source
    changes. It is test evidence only, must be restored/removed, and must not become a
    third tracked G3A Case or authorize Goal 3B.

## Verification and handoff

Rerun the exact Goal 3A focused suites, Goal 1/2 regressions, V2, V3, V3.6 regressions,
demo smoke and the Prompt's strict TypeScript-equivalent check. Record exact commands,
counts and unavailable project-script facts without overclaiming. Reconfirm all thirteen
frozen v1 hashes and a clean allowlist. Create exactly one correction Candidate commit
and stop for Main rereview. Do not audit, accept Goal 3A, update control state, start Goal
3B, inspect Credentials, or access any external system.
