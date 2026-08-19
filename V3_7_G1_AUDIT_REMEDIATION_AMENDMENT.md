# V3.7 Goal 1 Audit Remediation Amendment

~~~yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-20
applies_to: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
trigger: FAIL_V3_7_G1_FOCUSED_AUDIT_THREE_P1_FINDINGS
failed_audit_candidate_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
failed_audit_candidate_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
ordinary_correction_budget: 2_of_2_consumed
exceptional_remediation_budget: 1_of_1_authorized
goal_1_acceptance: false
goal_2_authority: false
~~~

## Authority and purpose

The user explicitly approved this one-time amendment after Main presented the combined
audit findings and recommended root-cause design. This amendment changes only the Goal 1
correction-budget stop and the exact three affected contracts below. Every other V3.7
Charter decision remains frozen.

This is an exceptional Audit Remediation, not ordinary Correction round 3. It permits one
new implementation candidate, one Main preliminary review and one fresh independent
read-only re-audit. If the new candidate fails for any of these findings or another P1
inside the remediated boundaries, Goal 1 closes unaccepted unless the user makes a new
project-control decision.

## Amended contracts

### 1. Host-global Primary Run authority

Primary Run ID and normalized Run-root uniqueness must be enforced by one fixed
Host-owned authority root derived from the accepted Manifest/loader checkout. The
authority root must not be selected, partitioned or redirected by runtime dataRoot.

The binding identity must include a fixed authority ID/location identity plus exact Run
ID, normalized Run-root, workflow registration and Primary task instance. A workflow may
retain a local immutable reference, but binding and reopen must compare it to the one
Host-global by-Run-ID and by-Run-root index.

Two workflows using different data roots cannot bind or derive the same Run ID or Run
root. Disable keeps existing accepted bindings inspectable read-only but grants no new
binding authority.

### 2. Host-registered generic Candidate guidance

Goal 1 no longer treats unconstrained free-text semantic leakage classification as its
primary fairness guarantee. The accepted Manifest Candidate policy must register an exact
finite set of generic transferable prompt-addendum templates.

The producer may propose only one registered template identity/content. Host validation
reloads that policy and deterministically renders or verifies the exact registered
content. Arbitrary free text, task-specific answers, paraphrases, frozen identifiers and
Verifier-derived literals are rejected. Frozen Primary Task/Source/Verifier content
recomputation remains a second fail-closed layer.

The registered template may describe reusable verification discipline or failure-family
process guidance. It must not encode the current task's implementation, symbols, units,
literals or expected outputs.

### 3. Formal artifact path integrity

Every formal Goal 1 workflow/recovery artifact path must be validated component by
component from its trusted root on create, persist, admit, recompute and read-only reopen.
Intermediate symlink, junction or reparse components are forbidden. Formal JSON files
must remain ordinary singly linked files. Validation cannot rely only on the final file's
bytes or link count.

## Scope and preserved decisions

The remediation may change only Goal 1 V3.7 types, registry validation, workflow/Run
binding, registered recovery path handling, Candidate validation, the three fixed Host
configuration documents, the focused test and the two Goal 1 implementation reports.

It must not change task/source/verifier bytes, recovery profiles, provider/tool/command/
budget/stop semantics, State scope, old V2/G1/V3/G2 modules, Pi, Schema 2, Goal 2 or any
real-access authority. Registry/Manifest/Envelope digest changes are permitted only as a
mechanical consequence of registering the generic guidance policy.

## Required gate

The new candidate must pass:

- the original Goal 1 suite and all three independent audit repro classes;
- exact alternate-data-root Run-ID/root uniqueness tests;
- exact registered-template acceptance plus symbol-bearing, symbol-omitting, literal and
  paraphrased direct-answer rejection;
- recovery-descendant junction rejection while ordinary historical read-only reopen
  remains valid;
- Prompt Section 10 regressions and the strict environment-equivalent TypeScript check;
- Main preliminary review and a fresh independent read-only re-audit.

Goal 2 remains locked until re-audit PASS and Main formally accepts Goal 1.
