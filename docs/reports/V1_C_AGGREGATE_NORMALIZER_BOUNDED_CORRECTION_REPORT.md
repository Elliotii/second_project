# V1-C Aggregate Normalizer Bounded Correction Report

```yaml
status: ready_for_main_narrow_review
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
correction: aggregate_normalizer_real_shaped_duplicate_payload
starting_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
starting_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
starting_workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
corrected_workbench_source_digest_proposal: 2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3
real_model_calls: 0
real_provider_calls: 0
network_access: 0
credential_reads: 0
dependencies_installed: 0
pi_changes: 0
staged_paths: 0
commits_created: 0
```

## 1. Disposition

**Fact.** The bounded correction is implemented and the required zero-call verification passes. `normalizedExactDispatch()` now validates the frozen last-user treatment independently in `context.messages` and in a present real-shaped `provider_payload.messages`, then normalizes both copies while retaining all other dispatch bytes.

**Fact.** The correction does not change B/C complete-dispatch equality, the frozen A/B Skill delta, aggregation read-only behavior, denominator/invalid semantics, Manifest construction, Run production, Recovery, Provider/model bindings, budgets, tasks, Skill, Prompt, Tool Profile, Verifier, fixtures, or Pi.

**Recommendation.** Main Session should perform a narrow source/test review, create any corrected Candidate only under separate authority, and request a focused re-audit limited to the aggregate fairness normalizer and the retained regression matrix. This report does not accept the correction, establish an Execution Baseline, or authorize real execution.

## 2. Gate A and authority

| Check | Result |
| --- | --- |
| HEAD | exact `962b42a281d3092f0faf399b9f6f1ecaa0212f31` |
| HEAD tree | exact `d828f9fdb23c7099cdb1e4d5a993ff5579422dd4` |
| Initial tracked/staged state | clean; zero staged paths |
| Primary Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Registered V0-A Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Starting source digest | exact authoritative `4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604` |
| Real access authority | zero credential/network/Provider/model access only |

**Fact.** The first direct Pi Git queries returned exit `1` because Git rejected the sandbox account as a different owner. The retry used command-local `-c safe.directory=<exact Pi path>` and returned the pinned clean identity for both checkouts. No global/local Git configuration was written.

**Fact.** The old Prompt digest containing the one-character `...e84bf56...` transcription remains untouched. Main has identified the authoritative starting digest as `4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604`; this session did not alter control files or historical reports.

## 3. Correction mechanism

**Fact.** `workbench/src/inspect-v1.ts` now:

1. validates the messages container and resolves the last user message per representation;
2. treats `provider_payload: null | undefined` as the deterministic Faux shape, while a present Provider payload must contain a valid `messages` array;
3. asserts the context last-user text equals the arm-specific frozen expected text;
4. independently asserts a present Provider-payload last-user text equals the same expected text;
5. only after both assertions, clones the dispatch and replaces the last-user text treatment in each present representation with `<V1B_EXACT_TREATMENT_TEXT>`;
6. retains the existing derived payload-digest sentinel and leaves model, system text, Tool schemas, options, non-treatment Provider fields, and all other bytes unchanged.

**Inference.** Because B/C complete byte equality still runs before A/B normalization and the normalizer retains non-treatment fields, a shared B/C drift cannot be hidden as Skill treatment, while a B-versus-C drift is still rejected by the pre-existing complete-dispatch comparison.

## 4. Tracked regression matrix

The existing `V1-B F-003` focused aggregate test now constructs a sanitized real-shaped duplicate payload without Provider or model access.

| Case | Expected | Observed |
| --- | --- | --- |
| A context + Provider payload contain instruction; B/C contain exact frozen Skill wrapper + instruction | pass | pass |
| B/C Provider-payload treatment changed while context remains frozen | reject | rejected by Provider-payload frozen-treatment assertion |
| B/C context treatment changed while Provider payload remains frozen | reject | rejected by context frozen-treatment assertion |
| B/C context and Provider payload both changed to identical arbitrary treatment | reject | rejected against frozen Skill treatment |
| B/C share a non-treatment Provider-field drift relative to A | reject | rejected as non-Skill A/B delta |
| Pre-existing missing wrapper, extra text, wrong Skill body, model/options/Tool drift | reject | retained and passing |

**Fact.** Before the product fix, the new positive real-shaped case failed deterministically with `A/B delta is not exactly the frozen Skill treatment` (focused command exit `1`). After the fix, the same focused test passed (exit `0`).

## 5. Exact source delta

Exact workspace source/deliverable delta at report creation:

| Path | Change |
| --- | --- |
| `workbench/src/inspect-v1.ts` | bounded context/Provider-payload treatment validation and normalization |
| `workbench/tests/v1b-stage1.test.ts` | real-shaped positive case plus four required negative mutations in existing F-003 |
| `docs/reports/V1_C_AGGREGATE_NORMALIZER_BOUNDED_CORRECTION_REPORT.md` | this handoff report |

Product/test diff before this report: `80 insertions, 13 deletions` across the two focused files. File SHA-256 after correction:

```text
workbench/src/inspect-v1.ts        9377d14a95608d9f2728f4330a690eefb815e6e24bb7bc3478abfe8db07f2c43
workbench/tests/v1b-stage1.test.ts 878d9fc1a1ef02dad1638d210ef10fcd3b6db24f629dc308e0709289c69695db
```

**Fact.** No other tracked source, test, fixture, control, historical report, or Pi path changed. The required tests created only isolated ignored deterministic test scratch under their existing `.runs/v1-b/stage1/tests` and `.runs/v1-c/stage1/tests` roots; no historical real-run evidence was read, rewritten, deleted, or backfilled.

## 6. Commands and exit codes

| Command | Exit | Result |
| --- | ---: | --- |
| `git rev-parse HEAD` | 0 | exact starting Candidate |
| `git show -s --format=%T HEAD` | 0 | exact starting tree |
| `git status --short --untracked-files=all` | 0 | initially empty |
| `git diff --cached --name-only` | 0 | empty |
| direct `git -C <Pi> rev-parse HEAD/status --short` for each Pi | 1 | sandbox-owner trust diagnostic; no repository mutation |
| `git -c safe.directory=<exact Pi> -C <Pi> rev-parse HEAD` and `status --short` | 0 | both pinned and clean |
| `node --input-type=module -e "...v1bSourceDigest(process.cwd())..."` before correction | 0 | authoritative `4d12e4...74604` |
| `node --test --test-name-pattern="V1-B F-003" workbench/tests/v1b-stage1.test.ts` before product fix | 1 | expected defect reproduction; positive real-shaped case rejected |
| same focused F-003 command after product fix | 0 | 1/1 passed |
| `node .runs/v0-a/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json` | 0 | strict TypeScript passed |
| `node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1c-budget-stop.test.ts` | 0 | 40/40 passed |
| `git diff --check` | 0 | clean |
| `node --input-type=module -e "...v1bSourceDigest(process.cwd())..."` after correction | 0 | corrected proposal `2de1b7...ad3` |
| final Git allowlist/protected/staging/secret-pattern composite check | 0 | exactly three allowed paths; zero unexpected, staged, protected, or secret-pattern matches |
| final command-local safe-directory Pi identity/status checks | 0 | both Pi checkouts pinned and clean |

**Fact.** No failure was hidden: the expected exit `1` is the tracked pre-fix reproduction, followed by the focused and complete specified passing runs.

## 7. Protected state and zero-real-access attestation

**Fact.** `CURRENT_STATE.md`, `AGENTS.md`, the V1 Charter, V1-C Contract, governance documents, ADRs, existing Stage 1 reports, package/lock files, fixtures, Provider/model composition, Run producer, Recovery, Skill, Prompt, Tool Profile, Verifier, and both Pi checkouts are outside the delta.

**Fact.** No command read credentials, opened network access, dispatched a Provider request, invoked a real model, installed dependencies, modified Pi, staged files, created a commit, generated a final Manifest, ran a Canary/Pilot, or changed control state. The combined tests passed their zero-call and zero-credential counter assertions.

## 8. Remaining unverified

- **Unconfirmed.** No real Provider path was executed in this zero-call correction. The regression reconstructs the sanitized real-shaped duplicated payload deterministically.
- **Unconfirmed.** No corrected Candidate commit, focused re-audit, audited Execution Baseline, Manifest rebind, Canary, or full Pilot has been performed or authorized by this session.
- **Unconfirmed.** Suites outside strict TypeScript and the two explicitly required focused V1-B/V1-C test files were not run.
- **Unconfirmed.** Main has not yet reviewed whether the corrected source digest proposal should become a frozen Candidate/Execution binding.

No Pause Condition was encountered. The session stops here for Main narrow review.
