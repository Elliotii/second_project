# V3.7 Goal 3B Freeze Proposal

```yaml
status: READY_FOR_EXACT_USER_REVIEW_BLOCKER_CLOSED
recorded_on: 2026-08-21
authority: V3_7_CHARTER.md_section_8
goal_3a_disposition: PASS_V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
goal_3a_accepted_candidate_commit: a764749e0d7f0355cef06decdcd5541af62a8f2f
goal_3a_accepted_candidate_tree: 070ce4177ebacf0250aeedf2e0db38c842c1e8a4
goal_3a_acceptance_control_commit: 31efa1f374522090e89260af853d6bc2639fa68b
goal_3a_acceptance_control_tree: 80f40dbfe3c551c5cf370fd273c2287373d301d5
configuration_frozen: false
execution_prompt_frozen: false
real_access_authorized: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Main recommendation

Freeze one additive real Case, `v37-real-recovery-promote-retain`, by reusing the accepted
Goal 3A production path and the already frozen `parse-duration` / `clampRetries` pair. Do
not introduce a new task family, Candidate type, State decision, Regression family,
workflow stage, UI route or product service.

The package is ready for exact user review. `G3B-PREFREEZE-P1-001` is closed by the
accepted access-counter maxima correction. The proposal still grants no configuration
freeze, Credential access, network access, Provider/model call or real execution.

## Proposed exact Case identity

| Field | Proposed frozen value |
|---|---|
| Case | `v37-real-recovery-promote-retain` |
| Project | `v37-real-recovery-project` |
| Manifest | Schema 1, revision 1, third and final canonical registry entry |
| Registration | `accepted`, policy `v37-main-reviewed-case-registration-v1` |
| Registry loader | `v37-g3a-host-registry-loader-v1` |
| Runtime base prompt | `project-minimal-base-v1` |
| Provider | `deepseek` |
| Model | `deepseek-v4-flash` |
| Provider route | existing Host-registered Direct Pi/DeepSeek composition only |
| Candidate | exactly one `prompt_addendum`; no reproposal |
| Recovery A | `continue_failed_session` |
| Recovery B | `fresh_session_from_failure_seed` |
| Comparison | `v37-v2a-two-path-selector-v1`, ordered A then B |
| Regression | `typescript-verifier-failure` symmetric Base/Candidate Pair |
| State applicability | task kind `typescript-maintenance`; failure family `verifier-failure` |
| Docker backend | `docker-v36g2-frozen`; profile digest `f31414d3a8aa288337f0b5ba2a1d976b7cb8c49b7935633e838fcbe4c2a96b05` |

`deepseek-v4-flash` is a locally registered historical project identity, not a claim of
current catalog availability or price. A later zero-dispatch preflight must confirm that
the registered Host adapter can construct this exact identity. Failure before any count
or unit artifact is a pre-dispatch stop; it grants neither an alternative model nor a
task replacement.

## Frozen content proposed for reuse

### Primary

- task: `v1-parse-duration`;
- Task JSON: `fixtures/tasks/v1/parse-duration/task.json`, SHA-256
  `d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec`;
- instruction SHA-256:
  `cc4c17609f1031774e4be4bc0cc9d8afff671a11f019b2515c304d9a4a1be262`;
- source baseline: `fixtures/tasks/v1/parse-duration/workspace`, digest
  `5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa`;
- writable path: `src/subject.ts`;
- protected paths: `package.json`, `test/public.test.mjs`;
- public command: current Node executable with `--test test/public.test.mjs`;
- independent Verifier: `v1-parse-duration-verifier` at
  `fixtures/verifiers/v1/parse-duration.mjs`, SHA-256
  `0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da`;
- problem trigger: Primary independent Verifier status `failed`, family
  `verifier-failure`.

### Bound related, non-duplicate follow-up

- task: `v37-g1-det-follow-up-clamp-retries`;
- exact body: update `src/policy.mjs` so negative integer inputs return `0` and
  non-negative integer inputs are preserved; verifier files remain protected;
- task body SHA-256:
  `4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8`;
- source SHA-256:
  `77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11`;
- Verifier SHA-256:
  `2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87`;
- command: current Node executable with `--test verifier/follow-up.test.mjs`;
- follow-up runs once and is bound to the promoted State/Candidate lineage.

### Candidate proposal

The sole proposed prompt addendum is:

> Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.

Its frozen content SHA-256 is
`1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f`.
No pre-freeze reproposal unit is proposed. A malformed, leaking, inapplicable or otherwise
invalid proposal terminates the Case as `closed_incomplete`.

## Proposed seven-unit budget envelope

These are hard maxima, not targets and not permission to consume unused capacity.

| Unit | Provider requests | Combined tokens | Tool calls | Commands | Wall time | USD |
|---|---:|---:|---:|---:|---:|---:|
| Primary | 16 | 131072 | 24 | 1 | 900 s | 0.20 |
| Recovery A | 16 | 131072 | 24 | 1 | 900 s | 0.20 |
| Recovery B | 16 | 131072 | 24 | 1 | 900 s | 0.20 |
| Candidate proposal | 1 | 16384 | 0 | 0 | 120 s | 0.20 |
| Regression Base | 16 | 131072 | 24 | 1 | 900 s | 0.20 |
| Regression Candidate | 16 | 131072 | 24 | 1 | 900 s | 0.20 |
| Bound follow-up | 24 | 131072 | 24 | 1 | 900 s | 0.20 |
| **Global hard cap** | **105** | **802816** | **144** | **6** | **5520 s** | **1.40** |

Additional global limits are one opaque Credential resolution, seven logical units,
three external Verifier runs for the Primary/Recovery group plus one follow-up Verifier,
one indivisible Regression Pair and zero retry, fallback, replacement, task swap,
same-Run retry, third Recovery, Candidate reproposal or post-dispatch rerun.

The USD limits are safety ceilings independent of any assumed current Provider price.
The execution report must reconcile exact observed usage and cost from local formal
evidence; unknown cost fails closed against the remaining global cap.

## G3B-PREFREEZE-P1-001 — closed

**Fact.** The accepted Candidate
`d509d259fc0ea88ffe488a96993641ec19ee6dd0` / tree
`1f705b1402f486b786d4567d1eb2d40b4ec3542b` interprets the registered tuples as hard
maxima while independently deriving actual counters from the already validated usage
evidence. It preserves exact Case/Manifest/profile/construction-authority binding.

**Fact.** Main review and a fresh independent focused re-audit both passed. The focused
matrix covered under-cap, at-cap, over-cap, mismatched-ledger, zero-real and deterministic
zero-access routes; strict TypeScript and the exact five-path/configuration boundary also
passed. No broad suite was rerun because the focused command produced no evidence of a
shared regression.

The proposed maximum for the Primary/Recovery group is one Credential read and 48 each
for network, external-Provider and real-model calls, subject to the stricter per-unit and
global limits above. The follow-up maximum is one Credential read and 24 each for those
three call counters. Actual values remain evidence-derived and may be lower.

### Deterministic reproduction

Main ran two complete local V2 Primary/A/B paths with an injected deterministic port and
zero actual external operations. Both were inspected against the same frozen tuple. The
exact tuple passed; changing only `network_calls` from `2` to the lower value `1` made
Inspector fail solely with `real-access counters mismatch`:

```yaml
exact_integrity_valid: true
lower_integrity_valid: false
lower_counter_mismatch: true
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

The unchanged Goal 3A 22-test product command was also invoked with Node's force-exit
option, but the outer process exceeded 180 seconds without returning buffered TAP output.
That invocation is recorded as `TIMEOUT_NO_CONCLUSION`, not PASS or FAIL. This proposal
changes no product source or test; the accepted Candidate's independently established
22/22 result remains the source baseline evidence.

## Stop, invalid-run and secret rules

- The future execution owner is one fresh no-source-edit Goal 3B Session.
- Before the first dispatch, Main must freeze the canonical Manifest, accepted Envelope,
  follow-up profile, registry index, Execution Prompt and their digests in one reviewed
  execution-baseline commit/tree.
- Provider/model construction and Credential resolution remain unavailable until a
  separate explicit real-access authorization after that baseline is reviewed.
- Credential values, headers, raw Provider payloads, environment contents and browser
  sessions must never be read into reports or logs. The Host adapter may resolve one
  opaque Credential only at the first authorized dispatch boundary.
- After any Provider dispatch, Tool/command side effect or unit-specific formal artifact,
  there is no restart, retry, replacement or rerun. A mechanical relaunch is allowed only
  when Provider, Tool/command and unit-artifact counts are all zero.
- Regression Base/Candidate are indivisible; neither arm can be rerun alone. The follow-up
  runs once.
- Any honest negative or invalid route becomes `closed_incomplete`; no result hunting is
  permitted. `rejected` is reserved for failure of an accepted bridge or reusable product
  capability.
- The user unguided WebUI check occurs only after the one-shot execution and uses existing
  artifacts with zero additional model calls.

## Proposed freeze sequence after user decision

1. Completed: the bounded counter-maxima correction passed Main review and fresh focused
   re-audit and is accepted without real access.
2. Create only the third Case Manifest, Envelope, follow-up profile and canonical registry
   append; do not change either accepted deterministic entry.
3. Run zero-access loader, registry, workflow reopen, affected regression and strict
   TypeScript checks.
4. Commit the configuration freeze and record its exact commit/tree as the Goal 3B
   Execution Baseline.
5. Freeze the no-source-edit Goal 3B Execution Prompt with the accepted bridge and
   construction-authority digests.
6. Stop again for separate explicit real-access authorization. User approval of this
   proposal alone does not authorize execution.

## User review decision

The recommended next decision is:

`AUTHORIZE_V3_7_G3B_ZERO_ACCESS_CONFIGURATION_FREEZE_PREPARATION`

This authorizes only creation and deterministic validation of the exact third Manifest,
Envelope, follow-up profile, registry append and no-source-edit Execution Prompt. It does
not authorize Credential resolution, network, Provider/model dispatch or the real Case.
