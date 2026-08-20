# V3.7 Goal 3B 64-Request Successor Execution Prompt

> Status: `FROZEN_PENDING_SEPARATE_EXPLICIT_REAL_ACCESS_AUTHORIZATION`.
> Existence of this Prompt grants no real-access authority.

You are the fresh no-source-edit execution Session for successor identity
`v37-g3b-64-request-successor-v1`. Stop before Credential resolution, workflow creation
or dispatch unless Main supplies both the exact execution-baseline commit/tree and a new
explicit user real-access authorization naming this Prompt.

## 1. Required authority

Read `AGENTS.md`, `CURRENT_STATE.md`, `V3_7_CHARTER.md`,
`V3_7_G3B_64_REQUEST_SUCCESSOR_CONTRACT.md`,
`docs/reports/V3_7_G3B_64_REQUEST_CORRECTION_MAIN_REVIEW.md`, and
`docs/reports/V3_7_G3B_64_REQUEST_AFFECTED_FINDING_REAUDIT.md` from the supplied
Execution Baseline.

```yaml
configuration_candidate_commit: ca33885f4691f00ab9ab90643f8ed5fbc0825bb8
configuration_candidate_tree: ae12fd560f1d6dc802648a682eb5d94f96335f80
accepted_corrected_bridge_commit: 86edd40c2b8349dfdeed5c081c78cf0a4590b246
accepted_corrected_bridge_tree: b8d1a1faabf81ab63a48fb105fed30e9749184b7
execution_baseline_commit: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
execution_baseline_tree: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
```

The execution worktree must start at the supplied baseline with a clean tracked tree.
Verify these frozen Git blobs before any real boundary:

| Frozen path | Git blob |
|---|---|
| real Manifest v2 | `f8caccb526fd32af0cb02bbd62659707c594cdae` |
| accepted Envelope v2 | `bafb6148785f80dd9ae7179c6429b2519228dd3d` |
| follow-up profile v2 | `3813f7b06cffa3ca9d563b7a8aaf3070fe09c621` |
| canonical registry v2 | `4aaaedfeb741a86bd51f33e11f6e836222f42b6f` |
| corrected Host bridge | `c6511a7b25ad85299b08ccfd15e148d1f6d52afc` |

Any mismatch is a zero-call stop. Never read or reuse the prior rejected workflow.

## 2. Frozen Case identities

```yaml
case_id: v37-real-recovery-promote-retain
project_id: v37-real-recovery-project
manifest_body_digest: dcaf5ff929a5a98ae32fe42b7f1700cf4a7dd0630e2989b10b8fd5fb219a39dc
registration_digest: 1315d746ccbcad5927a6163319f342cb836b2d6dc07389eb5d44f1fb28ea6245
follow_up_execution_profile_digest: 89fa6b4227495ddd1d972c91f1139532858842c4e3a13529d682b99aa93b7ace
registry_index_digest: 665e911654eb811337ede1ce11281fbe167acba2e52e9b532c53270290d14ee3
candidate_proposal_authority_digest: c93ce9bb18b23990f909c24ea2fdf13d0f6b9b6b93f7401b0f8aef22bbaf6450
regression_authority_digest: 91497eba6a828e2845ca22145669926e0debbe4ca0aa5f1b67a06fb12d5750ab
```

Primary task/source/Verifier, Recovery strategies, Candidate template, Regression pack,
follow-up task/source/Verifier and State applicability are byte-identical to the prior
frozen Case. Candidate remains exactly one `prompt_addendum`, template
`v37-verify-before-finish`, content SHA-256
`1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f`.

## 3. Provider and budgets

Provider/model remain `deepseek` / `deepseek-v4-flash` through exactly the two accepted
Runtime compositions, using one opaque Credential lease. Follow-up uses
`v36_64_request_bounded_edit_v3` with threshold/hard max `64/64`, Tool max 96, token max
524288 and wall max 3600000 ms.

| Unit | requests | tokens | Tools | commands | wall time | USD |
|---|---:|---:|---:|---:|---:|---:|
| Primary | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Recovery A | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Recovery B | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Candidate proposal | 1 | 16384 | 0 | 0 | 120000 ms | 0.20 |
| Regression Base | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Regression Candidate | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Follow-up | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Global | 385 | 3162112 | 576 | 6 | 21720000 ms | 1.40 |

Registered Primary/Recovery access maxima are `1/192/192/192` and follow-up maxima are
`1/64/64/64` for Credential/network/Provider/model. Limits are ceilings, not targets.
Unknown or unreconciled usage is terminal invalidity.

## 4. One-shot sequence

After authorization, create one new ignored successor root and one new workflow. Invoke
the existing product actions once in order: Primary; Recovery; first confirmation and
admission; Candidate; Regression; follow-up; second confirmation and admission;
Assessment. Stop at the first honest negative or invalid stage. Do not force later
actions.

After any Provider dispatch, Tool/command side effect or unit artifact, retry, fallback,
replacement, rerun, task swap, Candidate reproposal and result hunting remain forbidden.
Regression Base/Candidate are indivisible. Persist only sanitized counters, digests,
stages and receipts; never persist or print Credential values, headers, raw Provider
payloads, model text, secrets or environment contents.

No source, test, fixture, configuration, Prompt, Charter or control-state edit is allowed
in the execution Session. Return one truthful successor execution report to Main. If the
new explicit real-access authorization is absent, report
`NOT_STARTED_REAL_ACCESS_LOCKED` with zero operations and stop.
