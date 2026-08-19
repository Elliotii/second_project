# V3.7 Goal 1 Focused Independent Audit

~~~yaml
status: COMPLETED_FAIL
disposition: FAIL_V3_7_G1_FOCUSED_AUDIT_THREE_P1_FINDINGS
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
audit_owner: fresh_independent_read_only_local_consistency_session
audit_candidate_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
audit_candidate_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
audit_candidate_parent: a62051044332d438cbc0f33ec6ccc3f74097ef2f
candidate_tracked_clean_before_and_after_audit: true
candidate_source_or_configuration_changes: 0
goal_acceptance: NOT_CLAIMED
goal_2_started: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
dependency_installs: 0
pi_source_reads_or_changes: 0
~~~

## Scope and authority

This was a fresh independent, local-only, read-only software consistency review of the
immutable candidate above. Authority was limited to repository/Git inspection,
deterministic tests, pinned local TypeScript/Pi declarations and ignored evidence under
.runs/v37/g1-focused-audit. No candidate source, configuration or test was repaired.

The audit applied the accepted Charter, frozen Goal contract/control state and then the
final plan. It reviewed the fixed Host registry and trust root, workflow/task/Primary Run
binding, V2 recovery lineage, admission and historical reopen, Candidate frozen-content
independence, State scope, old semantics, allowlists and rejected Schema 2 absence.

## Findings

### V37-G1-AUDIT-P1-001 — Primary Run uniqueness is split by caller-selected data roots

Fact: bindPrimaryRunV37 places the by-Run-ID and by-Run-root indexes beneath the
caller-selected project-relative dataRoot. loadPrimaryRunBindingV37 checks only that same
selected root, and the selected data-root identity is absent from the binding.

Deterministic reproduction: two workflows in two different ignored data roots bound the
same Run ID and same not-yet-created Run root. One deterministic executeRunV2A episode
was executed once. Production deriveRegisteredRecoveryPackageV37 accepted that same Run
for both workflows. The fail-closed audit assertion failed, 0/1.

Impact: the claimed global Run/root uniqueness holds only inside one selected data root.
This violates the exact Host-owned Run/root/workflow/task binding and cross-workflow
substitution contract.

Affected paths: workbench/src/v37/workflow-registration-v37.ts and the consumers that
forward caller-selected dataRoot, including workbench/src/v37/registered-recovery-v37.ts.

### V37-G1-AUDIT-P1-002 — Direct frozen-task answers remain admissible without the exported symbol

Fact: Candidate validation reloads and recomputes the frozen Task, Source tree and
Verifier, but its rejection predicate still depends on naming the protected symbol,
matching two Verifier literals, or matching five shared tokens plus one literal.

The real production validator accepted both:

~~~text
For the s suffix, multiply by 1000.
~~~

and the complete direct answer:

~~~text
Accept only non-negative digits followed by ms or s. Leave milliseconds unchanged,
multiply seconds by 1000, and reject everything else.
~~~

Neither names parseDuration and each contains only one extracted Verifier literal.
Generic transferable guidance also remained accepted. Result: 1/3 passed, with the two
direct-answer rejection assertions failing.

Impact: concrete frozen task answers can still enter the prompt-addendum path, violating
Candidate/source fairness and the explicit content-independence contract.

Affected paths: workbench/src/v37/candidate-v37.ts and its incomplete negative coverage
in workbench/tests/v37g1-registered-recovery.test.ts.

### V37-G1-AUDIT-P1-003 — Admission reopen accepts an intermediate recovery-directory junction

Fact: recomputeRegisteredRecoveryAdmissionV37 reads workflows/<id>/recovery/*.json.
Its ordinaryJson helper checks only the final file, not intermediate path components.

Deterministic reproduction: the audit copied valid workflow data, replaced only its
recovery directory with a Windows junction to the original valid recovery directory and
called inspectRegisteredRecoveryAdmissionV37. Inspection returned integrity_valid true;
the fail-closed assertion failed, 0/1.

Impact: the formal Comparison/Evidence/confirmation/request/admission subtree may resolve
through an unapproved intermediate location. Byte recomputation alone does not satisfy
the Prompt's intermediate-junction rejection or Host-owned artifact-location boundary.

Affected path: workbench/src/v37/registered-recovery-v37.ts.

## Passing evidence outside the findings

- Loader-owned registry root and source-contract fingerprint checks passed.
- Exact registry/Manifest/Envelope and exercised mutation checks passed.
- Within one data root, workflow/task/Run/root substitution checks passed.
- V2 Primary/Seed/two Candidate Path/common Verifier/terminal/Selection lineage was
  preserved without invented peer Run IDs.
- With ordinary directories, disable blocked new actions and exact accepted admission
  reopened read-only with unchanged identity.
- State scope, immutable Base, old regressions and rejected Schema 2 checks passed.

## Verification summary

| Verification | Result |
|---|---|
| Goal 1 focused | PASS, 13/13 |
| V2-A recovery | PASS, 5/5 |
| V3 G1 | PASS, 13/13 |
| V3 G2 | PASS, 6/6 |
| Final Capstone G1 with inherited fixed loader | PASS, 24/24 |
| Final Capstone G2 with inherited fixed loader | PASS, 10/10 |
| viable local-loader regression matrix | PASS, 71/71 |
| exact repository TypeScript | environment stop TS2688; isolated worktree lacks ignored @types/node |
| strict seven-entry equivalent TypeScript | PASS, 0 diagnostics |
| audit-only Candidate tests | 1/3, confirming P1-002 |
| audit-only alternate-data-root binding | 0/1, confirming P1-001 |
| audit-only recovery-junction reopen | 0/1, confirming P1-003 |
| identity/parent/tree, allowlists and diff check | PASS |
| rejected Schema 2 paths | PASS, 5/5 absent |

The parent-only Capstone forms reached 23/24 and 8/10 solely because spawned child
processes did not inherit local Pi resolution. The same test bodies passed 24/24 and
10/10 when the identical fixed loader was inherited. No dependency was installed.

## Zero external access and remaining unverified

Credential reads, network, external Provider/model, real data, Docker product tasks,
dependency installation and environment-secret enumeration were zero. The isolated
worktree did not contain .upstream/pi; it was not read or changed.

Remaining unverified are repository-wide exact TypeScript with the normal ignored Node
declaration layout, any repair/re-audit of these findings, and every Goal 2/3 or real
external path.

## Disposition

The candidate does not receive audit PASS. Two ordinary correction rounds are already
consumed. This audit does not authorize another correction or accept Goal 1. Main/user
must apply the Charter exhausted-budget Hard Stop. Goal 2 remains locked.
