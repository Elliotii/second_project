# V3.7 Goal 3A Correction Round 1 Report

## Disposition

```yaml
status: CORRECTION_COMPLETE_PENDING_MAIN_REREVIEW
finding_set: V37-G3A-MAIN-P1-001_through_V37-G3A-MAIN-P2-008
preserved_failed_candidate_commit: 71dd205e5fea6610d855ababb16dd17d265d83e7
preserved_failed_candidate_tree: e1a71cc0858b9f1b23fb54b49e0467e6702f94ed
ordinary_correction_budget_used: 1_of_2
audit_started: false
goal_3b_locked: true
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Finding resolution

| Finding | Bounded correction | Deterministic evidence |
|---|---|---|
| `P1-001` | Registry discovery, Host-constructor execution ports, and formal-terminal stage derivation replace Case-ID product routing | Temporary ignored third fully validated registration completes Primary through the same service and ends from its terminal facts |
| `P1-002` | Regression receipt references immutable accepted State version rather than mutable `active.json` identity | Two complete sequential workflows both reopen after restart |
| `P1-003` | Primary preflight validates Task, instruction, ordinary Source tree, and Verifier content | Four one-at-a-time drift mutations reject before dispatch and restore in `finally` |
| `P1-004` | Default workflow identity uses `randomUUID`; deterministic mint remains constructor-only | Independent service instances mint distinct UUID-shaped IDs |
| `P1-005` | Journal descendants validate every ancestor; formal JSON requires one ordinary link | Junction and hardlink tests reject locally |
| `P1-006` | Canonical JSON bytes enforced; fingerprint covers all validation-semantic sources including frozen v1 validator | Reformat and semantic-source mutation tests reject |
| `P1-007` | Disable test starts from a fully accepted complete workflow and snapshots all relevant JSON evidence | Reopen is complete/read-only, every action rejects, identities and bytes remain exact |
| `P2-008` | CSS string repaired | Balanced-string/declaration guard fails on the original malformed form |

## Files changed

- `workbench/src/v37/host-registry-v37g3a.ts`
- `workbench/src/v37/product-service-v37g3a.ts`
- `workbench/src/v37/registered-follow-up-v37g3a.ts`
- `workbench/src/v37/workflow-journal-v37g3a.ts`
- `workbench/src/read-model/workflow-v37g3a.ts`
- `workbench/src/webui/static/styles.css`
- `workbench/tests/v37g3a-authority.test.ts`
- `workbench/tests/v37g3a-product.test.ts`
- `workbench/tests/v37g3a-http-ui.test.ts`
- `docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md`
- `docs/reports/V3_7_G3A_CORRECTION_1_REPORT.md`

## Verification results

- Goal 3A focused: 18/18 PASS.
- Goal 1/2: 25/25 PASS.
- V2: 11/11 PASS.
- V3: 19/19 PASS.
- V3.6: 10/10 PASS.
- Demo smoke: PASS, loopback only, project commands 0, Docker project commands 0.
- Authorized strict TypeScript equivalent: PASS, zero errors.
- Project `npm run typecheck`: unavailable because its fixed ignored compiler path is absent.
- `git diff --check`: PASS.
- Frozen v1 byte inventory: 13/13 exact.

## Scope and handoff

- **Fact:** No configuration or fixture bytes changed. The temporary third Case files were ignored test material and were removed; it is not a tracked Case.
- **Fact:** No out-of-allowlist tracked delta, access expansion, audit action, acceptance action, control-state edit, Goal 3B work, tag, or push occurred.
- **Recommendation:** Main should record the resulting single correction Candidate commit/tree, rerun its preliminary review, and freeze an audit Candidate only if that review passes.
