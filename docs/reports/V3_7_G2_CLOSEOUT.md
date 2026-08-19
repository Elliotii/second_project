# V3.7 Goal 2 Closeout

```yaml
status: CLOSED_ACCEPTED
closed_on: 2026-08-20
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
disposition: PASS_V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
accepted_candidate_commit: b954b303770be5f3232a56cb12805fcae2a0b019
accepted_candidate_tree: 37fd1cd2df6a8f7536c644e958f22dc92e16a344
accepted_candidate_parent: 3adb5654a24633375d3171f115e8b73d86c023ed
integrated_main_commit: ab74573f6a3b7103b3cb6e8be77a671c0abd4143
integrated_main_tree: 86d5ef236c3e9eb0772a2e18cfe8a0dc0cb0fa15
focused_reaudit: PASS_V3_7_G2_AUDIT_REMEDIATION_REAUDIT
closed_finding: V37-G2-AUDIT-P1-001
new_findings: []
goal_3a_unlocked: true
goal_3b_unlocked: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
observed_external_cost_usd: 0
docker_product_runs: 0
dependency_installations: 0
pi_or_reference_reads_or_changes: 0
```

## Accepted result

Main accepts Goal 2. Bridge 2A and Bridge 2B now form one audited deterministic path:
the registered Candidate is bound to the promoted applicable State, the production V3.6
seam consumes the exact composed prompt and records the pre-dispatch runtime identity,
the Host derives formal Verifier/Outcome/Evidence artifacts, the independent admission
reopens them, and the new canonical adapter reaches the unchanged G2 State Assessment
decision table.

The accepted implementation adds one fixed Host-owned follow-up execution profile. It
does not add caller-selectable profiles, reinterpret ordinary V3.6 evidence, change V3
State Store/CAS/rollback semantics, weaken Final Capstone G2 assessment, adopt Schema 2
or modify Pi.

## Audit remediation and preserved history

The initial audit candidate
`3adb5654a24633375d3171f115e8b73d86c023ed` /
`333d265bab61ec81c0a84bbc2e24bca02253be89` remains preserved and failed focused audit
finding `V37-G2-AUDIT-P1-001` because historical admission depended on the later current
active State pointer.

Under the user-approved one-time Audit Remediation, the original implementation Session
created exactly one new candidate on that parent. Main review passed it and a fresh
independent read-only re-audit closed the finding with no new P1/P2 finding.

The accepted historical path now resolves the frozen State version and promotion
Decision from binding IDs and digests, while retaining full Store, validation,
Candidate, staged-State and base-State checks. A legitimate production rollback no
longer invalidates historical evidence. Live mutation remains current-active-only, and
disabled registration allows only identity-stable read-only reopen of accepted history.

## Verification

Fresh independent re-audit results:

- Goal 2 focused, including rollback/disabled/tamper remediation: 11/11 PASS, twice;
- Goal 1 registered recovery: 14/14 PASS;
- V2-A with inherited fixed public loader: 11/11 PASS;
- V3 Candidate/State validation and rollback: 19/19 PASS;
- Final Capstone G2 with inherited fixed public loader: 10/10 PASS;
- aggregate: 65/65 PASS;
- strict seven-entry changed/transitive TypeScript: zero diagnostics;
- exact one-commit remediation and four-path allowlist: PASS;
- protected configuration, State Store/CAS/rollback, old-family, loader, Pi and reference
  delta: zero.

Main independently reproduced the Goal 2 focused 11/11, V2-A 11/11, V3 19/19,
Final Capstone G2 10/10 and strict TypeScript zero-diagnostic results. Main's Goal 1 run
encountered an NTFS Number-valued inode precision collision before assertions; the fresh
audit worktree did not reproduce it and passed all 14 Goal 1 assertions.

The literal V2-A and Final Capstone commands retain their known child-process loader
qualification (10/11 and 8/10); inheriting the same accepted loader closes them at 11/11
and 10/10. The repository package compiler path is absent and the available full config
stops at `TS2688` because isolated worktrees lack ignored declarations; the strict
environment-equivalent check passed without installing dependencies.

Exact commands and qualifications are recorded in:

- `docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_7_G2_AUDIT_REMEDIATION_MAIN_REVIEW.md`;
- `docs/reports/V3_7_G2_AUDIT_REMEDIATION_REAUDIT.md`.

## Definition of Done

- Bridge 2A and Bridge 2B deterministic implementation: met;
- accepted State/applicability frozen before dispatch: met;
- production V3.6 exact composed-prompt consumption and observation: met;
- formal terminal, Verifier, Outcome, Evidence and second request: met;
- valid admission plus invalid/caller-package rejection and reopen: met;
- dual-source canonical G2 normalization with unchanged decision logic: met;
- ordinary V3.6 and accepted State/G2 boundaries preserved: met;
- candidate identity, Main review and fresh independent audit PASS: met;
- verification commands, environment qualifications and unverified items: recorded.

## Remaining unverified and next boundary

No real Credential, network, Provider/model, cost or Docker behavior was exercised; Goal
2 intentionally required zero-access deterministic implementation. The package-script
and full-repository TypeScript environment stops remain as documented.

Goal 3A is now unlocked for a separately frozen dedicated product implementation Prompt.
Goal 3B remains locked until Goal 3A is accepted and Main/user separately freeze the one
real Case, budgets, execution baseline and real-access authority.
