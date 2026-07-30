# V0-B Closeout

```yaml
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
closeout_status: closed_accepted
accepted_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
accepted_by_main_session: true
accepted_by_user: 2026-07-31
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
first_failed_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
control_evidence_closeout_commit: resulting_HEAD_of_this_revision
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authoritative_run_id: run-914dc89c-defd-4e03-ab37-7fd09230fe93
workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
gates_A_through_H: passed
definition_of_done: 25_of_25
real_model_calls: 0
external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
pi_core_patch_count: 0
private_pi_import_count: 0
stage_2_executed: false
```

## 1. Final disposition

**Fact.** The dedicated V0-B Goal Session completed deterministic Stage 1,
returned its implementation evidence and Closeout Draft, and did not modify
project control state or self-accept its result.

**Fact.** The first independent audit rejected Candidate Commit
`18ba8466799198b1ce3e732990a49f626fb83d48` with four P1 evidence-integrity
findings and one P2 bounded-scanner finding. That candidate, its Runs, its raw
audit evidence and the first audit report remain preserved.

**Fact.** The user authorized a bounded correction. The corrected Candidate was
fixed as Commit `7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180`. A focused independent
re-audit then resolved all five findings and recommended
`PASS_FOCUSED_INDEPENDENT_REAUDIT`.

**Decision.** The main project-control Session accepts the corrected technical
result. The user formally accepts V0-B with disposition
`PASS_V0_B_EVIDENCE_FOUNDATION` and authorizes this control/evidence closeout.
V0-B is closed; `active_goal` becomes `null`.

The historical `V0_B_CLOSEOUT_DRAFT.md` and the dedicated Session's structured
state proposal remain unchanged as execution-time evidence. This document is
the authoritative accepted Closeout.

## 2. Accepted implementation identity

```yaml
control_baseline:
  commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
  role: activated_clean_V0_B_control_baseline
first_audit_candidate:
  commit: 18ba8466799198b1ce3e732990a49f626fb83d48
  disposition: rejected_by_first_independent_audit
corrected_implementation_baseline:
  commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  parent: 18ba8466799198b1ce3e732990a49f626fb83d48
  role: accepted_V0_B_implementation_baseline
source_inventory:
  files: 52
  mismatches: 0
  sha256: 6b9e90e4652df1ee85fc1f29e6d053d931901c17e098fa46dcb4cdbdf9ca9ac5
source_delta:
  files: 36
  mismatches: 0
  sha256: 49e6cf7a750f446734c87a662088843fb104d4d6c5c7994f3243cf9aca19237b
workbench:
  tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
```

The control-baseline-to-corrected-candidate Git delta has 40 paths: 36
declared Workbench/fixture/report source paths and four explicitly excluded
audit/control provenance paths. The bounded correction delta has 14 paths and
has no protected control, V0-A, Pi or reference hit.

## 3. Authoritative deterministic evidence

| Role | Run | Committed | Integrity | Outcome |
| --- | --- | ---: | ---: | --- |
| authoritative pass | `run-914dc89c-defd-4e03-ab37-7fd09230fe93` | true | valid | `passed/null` |
| valid Agent failure | `run-71cab6c1-146e-408e-ad6e-f3fcca69a2fb` | true | valid | `failed/agent` |
| invalid Verifier | `run-b39a2e08-c8b3-472f-9273-227f31d28830` | true | valid | `invalid/verifier` |
| post-persistence corruption | `run-fa298df7-19bc-462a-87a4-9c9bdec1dad4` | true | invalid | `invalid/evidence` |
| persistence operation failure | `run-95bc62c4-7bf5-4f74-bd32-ecd627fc8ee3` | false | invalid | incomplete; no terminal |
| secret-scan rejection | `run-155f1cae-9ae5-4c69-a261-ef32f80d482b` | false | invalid | incomplete; no terminal |

The wall-time crossing Run
`run-76ba3cab-3d2b-42a3-a65c-dc1eb0774142` also remains incomplete with no
Outcome, Evidence Index or terminal marker.

All accepted V0-B Runs use exactly one ordinal-1 initial Attempt and no parent
Attempt. External Provider/model calls, Recovery Attempts and child Attempts
are all zero.

## 4. Independent audit history

### 4.1 First audit

The first audit report is
`docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md`, SHA-256
`10316dc66c99868772ec4548f0314a5cfc707ef45dd2b4047a127eb29e70393e`.
It returned `REQUEST_BOUNDED_CORRECTION`.

### 4.2 Focused re-audit

The focused report is
`docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md`, SHA-256
`65df80ca35a5514031898cd37b079dd4570e856c44c620ed41f6b71be81ff901`.
It returned `PASS_FOCUSED_INDEPENDENT_REAUDIT`:

| Finding | Accepted result |
| --- | --- |
| `V0B-AUD-001` scan attestation binding | resolved |
| `V0B-AUD-002` Evidence Index completeness | resolved |
| `V0B-AUD-003` terminal Journal suffix | resolved |
| `V0B-AUD-004` bounded wall-time truthfulness | resolved |
| `V0B-AUD-005` bounded scanner variants | resolved |

The focused re-audit did not repeat the full architecture/security audit and
did not create a sixth finding class. It independently checked Candidate
identity, the five original findings, the required regression set, current
Runs and protected boundaries.

## 5. Verification

| Check | Accepted result |
| --- | --- |
| strict TypeScript | passed |
| post-audit focused tests | 11 passed, 0 failed, 0 skipped |
| complete Workbench tests | 67 passed, 0 failed, 0 skipped |
| public emitted Pi import | passed |
| accepted V0-A authoritative verification | passed |
| V0-A public Coding Task | 3 passed, 0 failed, 0 skipped |
| Source Inventory | 52/52 byte identities matched |
| Source Delta | 36/36 change types and byte identities matched |
| fixed Run replay | nominal results matched |
| mutation-copy replay | all intended mutations failed closed |
| final secret/reasoning scan | zero persisted forbidden values |
| protected/control/V0-A/reference delta | zero unauthorized hits |
| `.upstream/pi` and `.runs/v0-a/pi` | pinned and clean |

The independent re-audit's first isolated invocation of
`v0b-post-audit.test.ts` found that the ignored
`.runs/v0-b/test-cases/` setup directory did not yet exist. After creating that
directory, the unchanged test passed 11/11 and the complete suite passed
67/67. This is accepted as a non-blocking test-fixture setup debt, not a
product, evidence-semantic or finding-closure failure. It does not trigger a
third independent audit. Future work that touches the test runner may make
this setup self-creating, but must not rewrite V0-B evidence history.

## 6. Gates and Definition of Done

The corrected implementation, main review and focused independent re-audit
support:

```yaml
gates:
  A: passed
  B: passed
  C: passed
  D: passed
  E: passed
  F: passed
  G: passed
  H: passed
definition_of_done:
  passed: 25
  failed: 0
  total: 25
```

Stage 2 is optional under the Contract and was never authorized or executed.
Its absence does not block Stage 1 acceptance.

## 7. Accepted claims

V0-B now supports the following bounded claims:

- a settled Attempt can become an auditable external Outcome;
- Task, Strategy, Run, Attempt, Workspace, Pi Session, Tool, Journal, Verifier
  and Outcome identities can be linked;
- reasoning-safe Session evidence can be persisted and reopened through the
  public JSONL route used by the Workbench;
- valid Verifier failure, Verifier invalid and Agent failure are distinct;
- invalid evidence is not accepted as Agent failure;
- `inspect` can validate V0-B terminal evidence and rejects the audited
  semantic-integrity mutations;
- these deterministic routes require no Pi Core patch or private Pi import.

Because V0-B Stage 2 was not executed, every external presentation must add:

- V0-B-specific real-route smoke was not executed;
- accepted historical G006 real-route evidence uses pre-V0-B evidence
  contracts.

## 8. Claims and work still not authorized

This Closeout does not prove or authorize:

- Completion Policy effectiveness or statistical improvement;
- a real Recovery effect;
- cross-process Resume or crash-after-side-effect reconciliation;
- exactly-once Tool execution;
- OS Sandbox, system-level network-egress blocking or general DLP;
- V0 completion;
- V1 Skill competition;
- V2 multi-path recovery;
- V0-C implementation or a V0-C real Coding Task;
- Pi upgrade, Pi Core patch, private import or fallback Runtime.

## 9. Final control state

```yaml
active_goal: null
V0_A:
  status: closed_accepted
  disposition: PASS_V0_A_FOUNDATION
  implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
V0_B:
  status: closed_accepted
  disposition: PASS_V0_B_EVIDENCE_FOUNDATION
  implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  authoritative_run_id: run-914dc89c-defd-4e03-ab37-7fd09230fe93
  independent_reaudit: passed
  stage_2: not_authorized_not_executed
V0_C:
  status: charter_defined_not_authorized
```

The next possible project action is main-session research and Goal Contract
drafting for V0-C. This Closeout does not authorize that action, create the
Contract, activate the Goal, call a model or start a dedicated V0-C Session.
