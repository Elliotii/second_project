# V1-C Aggregate Normalizer Focused Re-audit Report

```yaml
status: PASS_FOCUSED_REAUDIT
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
audit_role: fresh_focused_independent_audit_session
candidate_commit: 5b87b98e431663595e9bd26a54589defbabcd3b1
candidate_tree: a238d838c4197aae1ef35dd70507b680160e0c65
parent_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authoritative_parent_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
candidate_source_digest: 2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3
real_model_calls: 0
real_provider_calls: 0
network_access: 0
credential_reads: 0
source_or_test_repairs: 0
control_or_manifest_edits: 0
staged_paths: 0
commits_created: 0
```

## 1. Disposition

**Fact.** The focused Candidate re-audit passes. No P1, P2 or P3 finding was identified in the authorized aggregate-normalizer delta, its F-003 regression delta, or the bounded correction report.

**Fact.** The Candidate validates each present `context.messages` and `provider_payload.messages` last-user treatment against the arm-specific frozen expected text before normalization, retains non-treatment dispatch fields, preserves the pre-existing B/C complete-dispatch comparison, fails closed on malformed present Provider payloads, and keeps deterministic Faux `null`/omitted Provider-payload shapes valid.

**Recommendation.** Main Session may accept this focused re-audit and freeze a new unified audited Execution Baseline bound to Candidate commit/tree and source digest. Any full comparison must use a fresh immutable 24-cell Pilot identity and must not reuse a prior partial Pilot or V1-B evidence. Main retains the decision whether all prerequisite Canary acceptance gates are already satisfied; this audit does not itself authorize an Execution Baseline, Credential/network access, a real Canary, or the full Pilot.

## 2. Findings

| Severity | Findings |
| --- | --- |
| P1 | none |
| P2 | none |
| P3 | none |

## 3. Identity, protected state and Pi

**Fact.** Candidate identity matched exactly:

```text
HEAD   5b87b98e431663595e9bd26a54589defbabcd3b1
tree   a238d838c4197aae1ef35dd70507b680160e0c65
parent 962b42a281d3092f0faf399b9f6f1ecaa0212f31
```

**Fact.** At audit start, tracked and staged state were clean. The Candidate delta from its parent contains exactly:

```text
A docs/reports/V1_C_AGGREGATE_NORMALIZER_BOUNDED_CORRECTION_REPORT.md
M workbench/src/inspect-v1.ts
M workbench/tests/v1b-stage1.test.ts
```

The product/test delta is exactly 80 insertions and 13 deletions. The only final tracked-worktree addition is this authorized audit report; source, tests, fixtures, Manifest, control state and staging remain unchanged by the Audit Session.

**Fact.** Both registered Pi checkouts were read only after their complete `AGENTS.md` files were read. Command-local `safe.directory` was used; no Git configuration was written. Both resolved to exact commit `027a5847901b5dde30270abaa1041046cd2b4b55` with empty status:

```text
D:\AI\AI_Projects\project2\.upstream\pi
D:\AI\AI_Projects\project2\.runs\v0-a\pi
```

**Fact.** The Candidate does not change Manifest construction, Run production, Recovery, Provider/model composition, budgets, tasks, Skill, Prompt, Tool Profile, Verifier, fixtures, `CURRENT_STATE.md`, governance, package/lock state, Pi or historical evidence.

## 4. Focused audit conclusions

### 4.1 Frozen treatment is checked before normalization

**Fact.** `workbench/src/inspect-v1.ts:285` reads the context and optional Provider-message representations, asserts the context text against the arm-specific expected text, independently asserts the present Provider text against that same expected text, and only then clones and normalizes the dispatch. The helper at `workbench/src/inspect-v1.ts:262` accepts only `null`/`undefined` as absent; every present payload must be a non-array object with an array-valued `messages` member.

### 4.2 Normalization scope is limited

**Fact.** `replaceLastUserTreatment()` at `workbench/src/inspect-v1.ts:269` changes only text parts of the final user message. The normalized clone otherwise retains model, system, tools, options, stream, all non-treatment Provider fields and the complete message structure; only the existing `payload_sha256` comparison sentinel is replaced.

**Fact.** The independent probe changed shared B/C Provider `system`, `tools`, `stream` and an arbitrary extra Provider field. Every case was rejected as a non-Skill A/B delta. A C-only `stream` change was rejected by the pre-existing B/C complete-dispatch comparison.

### 4.3 Required tamper cases

**Fact.** `workbench/tests/v1b-stage1.test.ts:264` constructs a sanitized real-shaped duplicate Provider payload. Its negative matrix at lines 273-276 rejects:

- Provider-only treatment tamper;
- context-only treatment tamper;
- identical arbitrary treatment in both representations;
- shared B/C non-treatment Provider drift relative to A.

The focused F-003 command passed 1/1, and the complete two-file regression passed 40/40.

### 4.4 B/C complete-dispatch equality

**Fact.** The B/C check at `workbench/src/inspect-v1.ts:510` still compares complete `initial_dispatch` values before A/B treatment normalization. The independent C-only Provider drift probe was rejected with `B/C complete initial dispatch drift`.

### 4.5 Faux and malformed Provider-payload paths

**Fact.** The 40-test regression exercises the deterministic Faux `provider_payload: null` route. The independent probe coherently omitted `provider_payload` from every completed Run; aggregation passed and the Pilot tree digest was byte-identical before and after aggregation.

**Fact.** Independent malformed-present cases for array payload, missing `messages`, object-valued `messages`, empty `messages`, and a null message member all failed closed.

### 4.6 Aggregate semantics remain unchanged

**Fact.** The source delta is confined to the fairness-normalization helpers before the unchanged aggregation loop. Denominator, infrastructure/evidence exclusion, treatment-invalid inclusion, recovery and totals logic at `workbench/src/inspect-v1.ts:478-517` are outside the delta. The retained F-004 denominator/treatment regression passed as part of the 40/40 run.

**Fact.** The independent probe compared the complete Pilot tree digest immediately before and after a successful aggregate call; it was unchanged.

## 5. Source digest and report consistency

**Fact.** An audit-local script computed the parent digest directly from exact Git blob bytes for every path in `V1B_SOURCE_DIGEST_DOMAIN`, and computed the Candidate digest from the current files:

```text
parent    4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
candidate 2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3
```

These match the authoritative old digest and corrected proposal in the handoff and bounded correction report.

**Fact.** Candidate file digests match the bounded correction report:

```text
workbench/src/inspect-v1.ts        9377d14a95608d9f2728f4330a690eefb815e6e24bb7bc3478abfe8db07f2c43
workbench/tests/v1b-stage1.test.ts 878d9fc1a1ef02dad1638d210ef10fcd3b6db24f629dc308e0709289c69695db
```

**Fact.** The bounded correction report's identity, delta, test counts, zero-real-access statement, unchanged protected scope and remaining-unverified statements are consistent with the frozen Candidate and independently observed commands.

## 6. Audit-local environment preparation

The fresh worktree lacked ignored dependencies. Under the explicit non-expanding audit-environment authorization, the Audit Session first resolved and validated both absolute targets, then created only these two junctions:

```text
workbench/node_modules -> D:\AI\AI_Projects\project2\workbench\node_modules
.runs/v0-a/pi          -> D:\AI\AI_Projects\project2\.runs\v0-a\pi
```

**Fact.** No dependency was installed or downloaded, neither target was modified, and neither junction was staged or committed. Final state: both junctions remain present as ignored audit-local environment links with the exact targets above. This mechanical preparation is not a finding.

Audit-local probes were written only below `.runs/v1-c/audit/` and remain ignored. No historical `.runs/v1-c/full-pilot` evidence or credential was read, copied or modified.

## 7. Commands and exit codes

| Exact command | Exit | Result |
| --- | ---: | --- |
| `git rev-parse 'HEAD'` | 0 | exact Candidate commit |
| `git rev-parse 'HEAD^{tree}'` | 0 | exact Candidate tree |
| `git rev-parse 'HEAD^'` | 0 | exact parent |
| `git status --short --untracked-files=all` and tracked/staged quiet checks | 0 | clean at audit start |
| `git diff --name-status 962b42a281d3092f0faf399b9f6f1ecaa0212f31..HEAD` | 0 | exactly three Candidate paths |
| `git diff --check 962b42a281d3092f0faf399b9f6f1ecaa0212f31..HEAD` | 0 | no whitespace error |
| initial `rg --files .upstream/pi -g AGENTS.md; rg --files .runs/v0-a/pi -g AGENTS.md` | 1 | expected fresh-worktree path absence; not used as Pi evidence |
| `git worktree list --porcelain` | 0 | resolved registered main checkout without entering Pilot evidence |
| `git -c safe.directory='D:\AI\AI_Projects\project2\.upstream\pi' -C 'D:\AI\AI_Projects\project2\.upstream\pi' rev-parse HEAD` and `status --short --untracked-files=all` | 0 | pinned and clean |
| `git -c safe.directory='D:\AI\AI_Projects\project2\.runs\v0-a\pi' -C 'D:\AI\AI_Projects\project2\.runs\v0-a\pi' rev-parse HEAD` and `status --short --untracked-files=all` | 0 | pinned and clean |
| PowerShell absolute-target resolution, containment/exact-target checks | 0 | both junction targets validated before creation |
| PowerShell `New-Item -ItemType Junction` for the two authorized paths | 0 | exactly two audit-local junctions created |
| `node .runs/v0-a/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json` | 0 | strict TypeScript passed |
| `node --test --test-name-pattern="V1-B F-003" workbench/tests/v1b-stage1.test.ts` | 0 | 1 passed, 0 failed |
| `node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1c-budget-stop.test.ts` | 0 | 40 passed, 0 failed |
| `node --test .runs/v1-c/audit/aggregate-normalizer-focused-reaudit-probe.test.ts` | 0 | 3 passed, 0 failed |
| `node .runs/v1-c/audit/verify-source-digests.ts` | 0 | parent and Candidate digests exact |
| `Get-FileHash -Algorithm SHA256 -LiteralPath workbench/src/inspect-v1.ts,workbench/tests/v1b-stage1.test.ts` | 0 | both file digests exact |
| final identity/tracked/staged/Pi/junction composite recheck | 0 | identity exact; tracked/staged clean; report is the only non-ignored untracked path; both Pi checkouts pinned and clean; both junction targets exact |

## 8. Zero-real-access and remaining boundary

**Fact.** This Audit Session performed zero credential reads, zero network access, zero Provider/model calls, zero real calls, zero dependency installs, zero Pi modifications, zero source/test/control/fixture/Manifest repairs, zero staging and zero commits. The authorized tests' real-call/credential counter assertions passed.

**Unconfirmed.** This focused zero-call audit does not prove a real Provider path, an audited Execution Baseline, a fresh Canary, or a new full-Pilot execution. Those remain Main/user-controlled gates.

**Recommendation.** Accept `PASS_FOCUSED_REAUDIT`; bind any next Execution Baseline to Candidate `5b87b98e431663595e9bd26a54589defbabcd3b1`, tree `a238d838c4197aae1ef35dd70507b680160e0c65`, and source digest `2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3`; if Main authorizes continuation after confirming Canary prerequisites, restart the comparison only as a fresh immutable 24-cell Pilot.
