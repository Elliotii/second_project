# V1-A Closeout — Deterministic Skill and Experiment Substrate

```yaml
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
status: closed_accepted
closed_at: 2026-08-04
disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
first_failed_audit_candidate: e3ff98948b26187b48af61928b56e7cacb550d31
implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
implementation_baseline_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
gate_J: passed_after_bounded_correction_and_fresh_focused_reaudit
definition_of_done: 27/27
real_model_calls: 0
external_provider_calls: 0
external_network_calls: 0
credential_reads: 0
pi_core_patches: 0
private_pi_imports: 0
```

## 1. Final disposition

Main Session accepts V1-A with:

```text
PASS_V1_A_DETERMINISTIC_SUBSTRATE
```

The accepted result is the corrected Candidate at
`784bd1ec06c2aa9ed554a7da661bdf582097bcdf`. It establishes the deterministic
Skill and three-strategy experiment substrate required before a bounded real
V1 Pilot. It does not prove that Skill or Runtime Control improves real Coding
Task outcomes.

## 2. Accepted implementation identity

```yaml
commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
source_digest: 8702ac87651808e30f971e27dbcb64dfb4c8a2c1ca4ceb28e124978042b7ea59
workbench_inventory_digest: a20c910330ef886a7c519deac2f6bfebb097215e970d1e30babe28ac50f8fa7b
fixture_inventory_digest: cf0d88930491e8d9bfded909be490960b6eb995549abae274b8c81685aa68c06
manifest_workbench_digest: aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2
manifest_id: c59cc2b780e6b0ca5c01c5f1d63f17fced4cc1d6b345370fd1856a0b11d3126e
```

The fixed Pi checkout remains clean at
`027a5847901b5dde30270abaa1041046cd2b4b55`. V1-A used only public emitted Pi
surfaces and made no Pi patch or private import.

## 3. What V1-A establishes

- A project-owned, tracked, self-contained exact-one Skill can be loaded and
  consumed through public emitted `AgentHarness.skill()`.
- Windows path, wrapper, alias, link, escape, collision and diagnostic
  boundaries fail closed for the accepted deterministic cases.
- The three Strategy identities are fixed as Baseline, Skill-only and Skill +
  External Verifier / Runtime Control.
- B/C initial model-visible request identity is byte-equivalent; A/B differ by
  the intended Skill wrapper/body treatment.
- The same external Measurement Verifier evaluates A/B/C initial Attempts;
  only an eligible failed C Attempt may create one bounded child.
- Experiment membership, Manifest identity, denominator accounting and
  read-only aggregation reject the contracted invalid and drift cases.
- A tracked fixed DeepSeek composition seam exists and fails closed without
  credentials, network or real Provider calls.
- Four candidate Coding Task families and deterministic calibration exist for
  later V1-B selection and revalidation.

## 4. Review and audit lineage

The original deterministic Candidate passed implementation review only after
two bounded Main Review correction rounds. The first frozen audit Candidate,
`e3ff98948b26187b48af61928b56e7cacb550d31`, then received four focused audit
findings:

- F-001: fresh Windows checkout LF/digest authority;
- F-002: complete B/C request model identity;
- F-003: credential-safe public Provider error projection;
- F-004: fail-closed Provider usage evidence.

The original Implementation Session corrected only those findings. Main
Session's lightweight re-review passed typecheck, focused tests 4/4 and V0-B
targeted regressions 2/2 before freezing the accepted Candidate.

The fresh independent re-audit ran from a detached Windows worktree with
`core.autocrlf=true` and returned:

```yaml
disposition: PASS_FOCUSED_V1_A_REAUDIT
blocking_findings: 0
focused_findings_closed: 4/4
v1_a_tests: 18/18
v0_b_targeted_tests: 2/2
v0_c_focused_tests: 24/24
strict_typescript: passed
```

The full 109-test Workbench regression had already passed in the bounded
correction evidence. The fresh re-audit correctly did not repeat it because no
targeted result contradicted the correction boundary or indicated a non-local
regression.

## 5. Gate and Definition of Done closeout

| Gate | Final result |
| --- | --- |
| A — Control baseline and source identity | passed |
| B — Public emitted Skill route | passed |
| C — Exact-one Skill and Windows path boundary | passed |
| D — Three-arm treatment isolation | passed |
| E — Measurement and bounded intervention | passed |
| F — Experiment identity and aggregation | passed |
| G — Provider/credential boundary | passed with zero real calls |
| H — Task pack and regression | passed |
| I — Evidence and dedicated-session closeout | passed |
| J — Focused independent audit | passed after four bounded corrections and fresh re-audit |

Contract DoD items 1–22 are satisfied by the accepted implementation and
evidence. Items 23–27 are satisfied by Main Review, the exact frozen Candidate,
the passing fresh re-audit, user instruction to continue the accepted plan, and
recording this Implementation Baseline and final control state. Final result:
**27/27**.

## 6. Evidence index

Tracked reports:

- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`;
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`;
- `docs/reports/V1_A_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`;
- `docs/reports/V1_A_FOCUSED_REAUDIT_START_PROMPT.md`.

Ignored evidence remains append-only under `.runs/v1-a/`, including the final
correction evidence and fresh re-audit evidence. It is not committed.

## 7. Claims allowed

It is now accurate to state that, on the pinned Pi and accepted deterministic
Workbench baseline:

- the public emitted Pi Skill route was dynamically consumed;
- exact-one Skill and Windows identity boundaries were deterministically
  verified;
- A/B/C treatment isolation and B/C initial payload identity were verified;
- common Measurement Verifier and C-only bounded intervention semantics were
  verified with Faux scenarios;
- immutable Manifest/read-only aggregation rejected the contracted invalid
  evidence;
- the fixed Provider seam was tested with zero credential, network and real
  Provider calls;
- V1-B has an independently audited deterministic implementation baseline.

## 8. Claims not allowed and remaining unknowns

V1-A does not establish:

- Skill improves real Coding Task success;
- Runtime Control beats Skill-only or Baseline;
- DeepSeek real Skill execution is compatible or effective;
- a real failed Attempt recovers successfully;
- any statistical significance or Policy promotion threshold;
- SDK, Extension or Worktree compatibility;
- OS sandbox, general permission platform, durable runtime or V2/V3 behavior.

These remain V1-B or later-version questions. The recorded Pi SDK/Extension
checkpoint stays non-blocking and must not alter the Direct `AgentHarness`
route or delay the bounded V1 Pilot without a concrete compatibility trigger.

## 9. Final control state and next boundary

```yaml
active_goal: null
V1_A: closed_accepted
V1_A_disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
V1_A_implementation_baseline: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
V1_B: charter_defined_contract_not_created
V1_B_execution_authorized: false
real_model_calls_authorized: 0
```

The next Main Session planning action is a bounded V1-B Goal Contract Draft
based on this exact Implementation Baseline and the accepted V1 Charter. V1-B
Contract acceptance, Activation, Pilot baseline, credentials, network and any
real-model budget remain separate user decisions.
