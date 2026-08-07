# V3 Goal 1 — Evidence to Candidate State Implementation Report

Date: 2026-08-08
Goal: `V3_G1_EVIDENCE_TO_CANDIDATE_STATE`  
Execution owner: dedicated top-level Goal 1 Implementation Session  
Control baseline: `8107df7e7ca10206fbb3fc58f93c3baf3cd4ab75` / tree `07ba2a3c28fa8761583dd62eb9698ce99d396860`  
Bounded-real-proposal Candidate Baseline: `07b81a4cf392854bbbde041f3dafae13b52a768f` / tree `cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d`
Recommended disposition: `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`

## 1. Outcome and claim boundary

**Fact:** The authorized zero-call Goal 1 implementation is present and verified. Valid frozen Run/Verifier/A-B evidence can be projected into three bounded opportunity kinds, converted into evidence-linked Diagnosis/Lesson/Candidate objects, host-validated, and staged as either a prompt addendum or a Pi public Markdown Skill. Every staged State is content-identified, reloadable, and explicitly `staged_inactive`.

**Fact:** Invalid, infrastructure-attributed, cancelled, missing-Verifier, unclosed-lineage, malformed, stale, unknown-key, authority-targeting, linked-file, hardlink, inventory-tampered, derived-field-tampered, and invocation-authority-tampered inputs fail closed in the focused tests. A structural opportunity is recognized only for the exact ordered and linked pattern `same frozen check fails -> edit occurs -> same frozen check fails`.

**Fact:** Under the later bounded execution authorization, this Session made exactly one opaque Credential read and one request to `https://api.deepseek.com/chat/completions` using `deepseek-v4-flash`. The response was direct-JSON parsed without repair, passed the existing host exact-schema/evidence/base/applicability/authority checks, and produced one `prompt_addendum` Candidate. Authority totals are Credential reads 1, external requests 1, Provider calls 1, real-model calls 1, retries 0, fallbacks 0, replacements 0.

**Fact:** Candidate `candidate-48ee92898bdb1eeedfc33956a67725f0` (digest `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4`) was written outside the Agent workspace and accepted base as inactive State `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9`. Reload was byte-semantically equal and status remained `staged_inactive`. No comparator, promotion/reject decision, active binding, rollback, Goal 2, or Goal 3 path ran.

**Fact:** Pi, accepted base prompt bytes, accepted V1 Skill bytes, Verifier/Outcome/control files, and the Goal-local accepted-active sentinel were unchanged. This Session did not modify source, tests, fixtures, Pi, `CURRENT_STATE.md`, or Git index/history.

**Recommendation:** Main should perform the finite acceptance review of the real proposal evidence. Goal 1 is not self-accepted by this Session; the current disposition is `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`.

## 2. Gate and exit-criteria matrix

| Gate / criterion | Evidence | Disposition |
|---|---|---|
| Exact control baseline | `git rev-parse HEAD`; `git show -s --format=%T HEAD` | PASS: exact commit/tree above |
| Initial tracked cleanliness | initial `git status --short`; cached diff | PASS: tracked and staged clean before edits |
| Dedicated Goal 1 authority | accepted Charter and delegated start prompt | PASS: Goal 1 only; no subagents |
| Pinned Pi source | local checkout HEAD/status/package | PASS: `027a5847901b5dde30270abaa1041046cd2b4b55`, clean, `@earendil-works/pi-agent-core@0.82.1` |
| Emitted public boundary | local emitted checkout and public-entry smoke | PASS: same commit/version; public `agent/index.js`, `agent/node.js`, `ai/index.js`; TypeScript 5.9.3 |
| Three Trigger fixtures | Goal 1 focused suite | PASS: `hard_failure`, `inefficient_success`, `structural_trajectory_pathology` |
| Real repeated-failure cycle | spawned frozen Node check, edit artifact, same check again | PASS: both checks exit 3; exact command/argv and call/result links required |
| Invalid evidence fail closed | focused invalidity matrix | PASS |
| Diagnosis/Lesson provenance | Candidate assertions and canonical digests | PASS: immutable evidence identity/digest and artifact refs retained |
| Deterministic producer | both State kinds | PASS |
| Bounded model-backed adapter | deep-frozen bounded input, output cap, Faux valid/malformed responses | PASS for zero-call adapter mechanism |
| Host schema/authority validation | exact keys, controlled applicability and two allowed edit kinds | PASS |
| Prompt addendum adapter | immutable-base composition preview and digest | PASS: no accepted base write |
| Adaptive Skill adapter | public `loadSkills()`, `formatSkillInvocation`, public `NodeExecutionEnv` | PASS: Markdown/frontmatter, explicit wrapper, diagnostics/links fail closed |
| Immutable staged State | atomic directory rename, content ID, exact inventory, reload/recompute | PASS |
| Persisted derived/authority fields | trusted-base prompt recomputation; public Skill identity recomputation; literal invocation flags | PASS: both Main repros rejected |
| Rejected State-root residue | pre-create nearest-ancestor canonical boundary plus post-create canonical check | PASS: prohibited workspace/base targets never created |
| Whole-Candidate atomic reject | mixed valid plus authority-targeting edit | PASS: no staged write |
| Accepted base / active bytes | raw evidence summary plus tests | PASS: before/after SHA-256 equal |
| Candidate not active | State envelope and absence of active mutation path | PASS: `staged_inactive` only |
| Bounded real model-backed proposal | `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02/` | PASS: exactly 1 request; direct JSON; host validation accepted |
| Real prompt Candidate / inactive State | Candidate/State artifacts and reload | PASS: one `prompt_addendum`; `staged_inactive`; reload equal |
| Real-call cost and authority ceilings | safe Provider response and counters | PASS: USD 0.0002016 conservative; 1/1/1/1; zero retry/fallback/replacement |
| Goal 1 acceptance / commit | Main/user authority only | NOT CLAIMED |

## 3. Implementation

### 3.1 Evidence projection

`evidence-v3.ts` performs exact-key validation, canonical evidence-digest recomputation, bounded artifact validation, terminal/integrity/lineage checks, and trigger projection. Hard failure requires a valid terminal Verifier failure. Inefficient success requires a common passing Verifier and a strictly worse bounded provider/tool vector against the passing peer.

Structural evidence is not inferred from “recovery happened and final outcome failed.” It requires exactly six ordered events: check call/result, edit call/result, and check call/result. Both checks must carry the same `command_id` and `argv_sha256`; every call/result pair must link; result IDs must be distinct; both exits must be nonzero; and both check outputs plus the edit artifact must revalidate under the project artifact boundary. If a trajectory is supplied but this proof fails, projection returns no opportunity instead of downgrading it to another trigger.

### 3.2 Proposal and Candidate authority

The deterministic producer and injected bounded producer share one host validator. The model-facing port receives only a recursively frozen, byte-capped structured opportunity/base identity and returns proposal data. The Harness independently enforces exact keys, byte limits, evidence/base freshness, matching evidence refs, bounded applicability, edit count, unique IDs, and the only permitted edits: `prompt_addendum` and `adaptive_skill`. Candidate IDs and digests are host-derived.

There is no Credential resolver, Provider construction, network transport, state-store write authority, Verifier field, promotion decision, active pointer, rollback, comparator, router, or autonomous loop in this implementation.

### 3.3 Two staged adapters

- `prompt_addendum` sorts accepted entries, verifies the immutable base-prompt SHA-256, composes a preview in memory, and records content/composed digests. It never writes `workbench/src/prompts/base.ts`.
- `adaptive_skill` renders self-contained Markdown/frontmatter with `disable-model-invocation: true`, loads it through Pi public `loadSkills()` and public `NodeExecutionEnv`, and records the public explicit invocation wrapper identity. Symlinks/reparse points, hardlinks, Windows aliases, relative resources, diagnostics, duplicates, and identity drift fail closed.

Staging requires a host State root outside both the Agent tool workspace and accepted base authorities. Before any `mkdir` or write, it resolves the nearest existing ordinary ancestor, constructs the canonical future target, and checks workspace/base overlap. It retains the canonical check after creation. It then writes to a scratch directory, verifies the Skill path, writes a canonical manifest, atomically renames to `candidates/<state_digest>`, reloads it, recomputes the semantic digest, verifies exact keys and exact ordinary-file inventory, and removes the final directory if post-rename verification fails. Existing content IDs are write-once rejected.

### 3.4 Main-review correction

Main's lightweight review reproduced two Goal-local fail-closed defects and returned one combined correction:

- `G1-MAIN-001`: the manifest semantic projection did not cover `composed_prompt_sha256`, `disable_model_invocation`, or `invocation_mode`. Reload now requires the trusted immutable base prompt and its identity, recomposes the complete prompt preview, and compares the persisted composed digest. Skill reload asserts `disable_model_invocation === true`, `invocation_mode === "explicit_skill"`, and the deterministic `skills/<name>/SKILL.md` source identity before continuing the existing public source/wrapper recomputation. Thus each persisted field is either content/manifest-identity-covered or deterministically checked from trusted inputs/files.
- `G1-MAIN-002`: boundary validation previously created `stateRoot` before detecting that it was prohibited. Reload/staging now performs nearest-existing-ancestor canonical preflight before any filesystem mutation and retains the ordinary canonical post-check. Focused tests prove that rejected workspace and accepted-base targets do not exist afterward and that their sentinel bytes/directory inventories remain identical.

The exact Main repro outputs in the corrected raw evidence are `PROMPT_TAMPER_REJECTED`, `SKILL_FLAGS_TAMPER_REJECTED`, and `BOUNDARY_REJECTED_NO_RESIDUE`. This correction adds no State kind, Trigger, formal Outcome adapter, store, version, active pointer, Promotion, Goal 2, or Goal 3 behavior.

### 3.5 Bounded real proposal execution

The later Main/user authorization bound execution to the exact Candidate Baseline `07b81a4cf392854bbbde041f3dafae13b52a768f` / `cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d`, one DeepSeek request, one Credential read, one `deepseek-v4-flash` call, USD 0.20, and `prompt_addendum` only. The frozen input was deterministically rebuilt from accepted V2 evidence and validated before dispatch:

- Evidence ID `v2b-controlled-seed-evidence`; digest `26a5fb5900e4eba39972406dae056733f939df58d7f60adca26d5ed044c905be`.
- Opportunity ID `opp-8eaa309ec84c340b1b3d276c068d577b`; canonical digest `62ecb8c4fba737141168c03f0e77a662dec47c3f9b4d7fbe75b74228a451fbb2`; Trigger `hard_failure`.
- Model-facing structured input: 853 bytes; canonical SHA-256 `7181526a6c42a543c6b8db59dff9c9c7ab78d4eaf1504907fe5181879b31828c`.
- Accepted-base identity was recomputed as `0c667c4b193b4de106107e5dd47782b634920c172a80ba6233509239c9184eb8`.

The model returned a plain JSON object with one `prompt_addendum`. Direct `JSON.parse` succeeded; no fence stripping, repair, fallback, retry, replacement, tool call, or manual proposal rewrite occurred. Usage was 628 prompt tokens and 406 completion tokens (1,034 total); conservative recorded cost was USD 0.0002016, below the USD 0.20 cap. The safe response copy contains no Credential or reasoning payload.

The existing `createBoundedModelBackedProducerV3` host validation accepted the raw object and derived Candidate identity/digest. `stageCandidateStateV3` then wrote exactly one host-only State, and `loadStagedStateV3` recomputed/reloaded it equal with `status: staged_inactive`. No accepted State or active binding changed.

## 4. Source Delta

The final intended tracked delta is ten files, all inside the authorized Goal 1 boundary:

| Path | Change and reason |
|---|---|
| `workbench/package.json` | Add only the `v3g1:test` focused command using the Goal-local ignored public Pi loader. |
| `workbench/src/contracts/v3-types.ts` | Add the minimal evidence, opportunity, Diagnosis, Lesson, edit, Candidate and staged-State contracts. |
| `workbench/src/refinement/evidence-v3.ts` | Add strict frozen-evidence validation and three trigger projections. |
| `workbench/src/refinement/producer-v3.ts` | Add deterministic and bounded proposal producers plus host schema/authority validation. |
| `workbench/src/prompts/adapter-v3.ts` | Add pure immutable-base prompt composition/preview. |
| `workbench/src/skill/adapter-v3.ts` | Add public Pi Markdown Skill rendering/loading/wrapper validation. |
| `workbench/src/state/staging-v3.ts` | Add bounded, atomic, content-identified inactive staging and reload verification. |
| `workbench/tests/v3g1-evidence-to-candidate.test.ts` | Add 13 focused mechanism/security tests, including both Main repros and no-residue boundary assertions. |
| `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md` | This report. |
| `docs/reports/V3_G1_CLOSEOUT_DRAFT.md` | Main/user review draft; not an acceptance decision. |

No existing V0–V2 product module was rewritten. No CLI/runtime/router/eval repository was added. The ignored `.runs/v3-g1/runtime/` bridge and `.runs/v3-g1/evidence/` artifacts are local, rebuildable runtime/evidence material, not tracked product dependencies.

## 5. Commands and exit codes

| Command / check | Exit and observed result |
|---|---|
| Initial root HEAD/tree/status/cached-diff preflight | 0; exact baseline/tree; tracked and staged clean |
| Pi source HEAD/status/package preflight | 0; exact pinned HEAD; clean; version 0.82.1 |
| Emitted Pi HEAD/status/package/entry/compiler preflight | 0; exact identity; clean; all three public entries and compiler present |
| Goal-local public runtime import smoke | 0; `AgentHarness`, `loadSkills`, `NodeExecutionEnv` loaded from public emitted entries |
| Goal-local public type smoke | 0; no diagnostics |
| `tsc -p ./.runs/v3-g1/runtime/tsconfig.workbench.json` | 0; strict Workbench TypeScript, final run |
| `npm --prefix workbench run v3g1:test` | 0; 13 pass, 0 fail, 0 skipped, correction run |
| V1-A focused regression through pinned public loader | 0; 18 pass, 0 fail, 0 skipped |
| V2-A recovery plus post-audit regression through pinned public loader | 0; 10 pass, 0 fail, 0 skipped |
| zero-call evidence generation/reload | 0; two inactive States staged and reloaded; authority counters all zero |
| final public import plus public type smoke | 0; exact three-symbol runtime output and no type diagnostics |
| final protected-identity/Pi/status/diff bundle | 0; named blobs equal, Pi clean, staged diff empty, `git diff --check` clean |
| `node --experimental-loader ./.runs/v3-g1/runtime/public-pi-loader.mjs ./.runs/v3-g1/runtime/run-bounded-real-proposal.mjs` | 0; one real proposal accepted and staged inactive |
| post-execution strict TypeScript through pinned emitted compiler | 0; no diagnostics |
| post-execution `npm --prefix workbench run v3g1:test` | 0; 13 pass, 0 fail, 0 skipped |

### 5.1 Development failures and repairs retained

| Observed failure | Repair | Verification |
|---|---|---|
| Initial focused run: 11/12; a malformed structural trajectory downgraded to `hard_failure`. | A supplied but invalid trajectory now fails closed and cannot fall through to another trigger. | Subsequent and final focused suites pass. |
| A focused rerun encountered transient Windows `EPERM` during scratch-directory rename. | Added a finite five-attempt retry limited to `EPERM`/`EACCES`/`EBUSY`; no alternate or non-atomic staging route. | Subsequent staging and final suite pass. |
| Post-hardening test expected inventory rejection after copying a Skill State, but copying correctly changed its absolute public wrapper identity first. | Used a prompt State for ordinary extra-file inventory proof and tested the hardlink directly on its original Skill State. | Pre-review focused suite 12/12. |
| Initial ignored TypeScript bridge lacked the public provider subpath mapping required by existing Workbench imports. | Added only public emitted provider/type path mapping to the ignored bridge. | Strict Workbench and public type smokes exit 0. |
| `G1-MAIN-001`: prompt composed digest and Skill invocation flags could be tampered without rejection. | Added trusted-base prompt recomputation and explicit Skill source/authority-field checks while retaining public source/wrapper recomputation. | Main repro test and corrected focused suite 13/13. |
| `G1-MAIN-002`: a prohibited State root left an empty directory because validation followed `mkdir`. | Added pre-create canonical-future-path overlap checks and no-residue byte/inventory assertions. | Main boundary repro returns `BOUNDARY_REJECTED_NO_RESIDUE`. |
| First real runner invocation omitted the public Pi loader; a second command used a Windows path that was not a valid loader specifier. Both failed during module linking before the runner body. | Used the already verified public loader with an explicit `./` module specifier. | No Run root, Credential read, network request, or model call occurred in either failure. |
| Pre-dispatch execution `v3g1-real-proposal-20260808-01` transcribed the expected accepted-base digest incorrectly. Trusted recomputation rejected it before dispatch. | Corrected the ignored runner constant to the exact Prompt value and used a new write-once execution ID; the failed root was preserved. | Failure counters are all zero; authoritative execution `v3g1-real-proposal-20260808-02` passed with exactly one request and zero retries. |

These were ordinary Goal-local schema/path/adapter/test defects. They caused no credential, network, model, accepted-file, Pi, Git-control, or external side effect.

## 6. Evidence Index

| Evidence | Location / identity |
|---|---|
| Runtime hydration | `.runs/v3-g1/runtime/public-pi-loader.mjs`, `public-import-smoke.mjs`, `public-type-smoke.ts`, and ignored tsconfig bridges |
| Focused raw test workspaces | `.runs/v3-g1/test-cases/`; final real structural fixture begins at `real-repeated-check-82a3f78b-4e68-479a-9899-a65692c46899/` and contains first check, edit, second check artifacts |
| Canonical corrected zero-call summary | `.runs/v3-g1/evidence/main-review-correction-20260807-01/evidence-summary.json`; includes both Main tamper rejections and the no-residue boundary rejection |
| Prompt State manifest | `.runs/v3-g1/evidence/main-review-correction-20260807-01/host-state-prompt/candidates/330310751aede212be7cc792488c3644d87663d3f6906fac41c3e5bee199bc4e/state.json`; State digest `330310751aede212be7cc792488c3644d87663d3f6906fac41c3e5bee199bc4e`; artifact SHA-256 `101f2a1710579883795e7c2dc81e5e76003dcd87344a3b6da587005e85ebbda6` |
| Adaptive Skill State manifest | `.runs/v3-g1/evidence/main-review-correction-20260807-01/host-state-skill/candidates/37c284ade18042e4b83e3c40af12ec2da6f7e846e7d26449d46a8dbd10c32d86/state.json`; State digest `37c284ade18042e4b83e3c40af12ec2da6f7e846e7d26449d46a8dbd10c32d86`; artifact SHA-256 `2623e41267786884e2973fb4c592b7123fa7d9c58bba6a507f08bd3aeb6fbda9` |
| Focused test definition | `workbench/tests/v3g1-evidence-to-candidate.test.ts` |
| Authoritative bounded real execution | `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02/`; result `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE` |
| Real execution Evidence Index | `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02/evidence-index.json`; SHA-256 `0f9d62c976546a2364121cb65d467e3d0f591b65154f3cced64da6672c557373` |
| Safe Provider response / usage | `provider-response-safe.json` under the authoritative root; prompt/completion/total 628/406/1,034; cost USD 0.0002016 |
| Raw parsed proposal | `raw-proposal-content.json` SHA-256 `5cd6e211d4885c37c154191b9f8a3aba285ce8e9766a83208eaabd9841e7957d`; direct parse artifact `parsed-proposal.json` SHA-256 `8caee507c69fdb16c96198d6eee48eae47cfc45dbe719072ed24fa592bc55ef4` |
| Host Candidate | `validated-candidate.json`; Candidate ID `candidate-48ee92898bdb1eeedfc33956a67725f0`; digest `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4` |
| Real inactive State | `host-state/candidates/efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9/state.json`; artifact SHA-256 `25c2c0e3f43f2e9984e70e184a4d59206f4f96dc23685a94fb4a1402c467a676`; reload equal |
| Pre-dispatch fail-closed evidence | `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-01/execution-failure.json`; all authority counters zero |
| Command/exit supplement | `.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02-post-verification/evidence-index.json`; SHA-256 `d4bfb10a5c41b9bb2a16612687bd516a2e80058c7434e468173b38c98a7de8ef` |

Both manifests reloaded equal to their in-memory State and retained `status: staged_inactive`. Prompt Candidate digest is `b388c102c737efafc90170981cfdf336101e46db9b2290cd8f593ae6f297fdb3`; Skill Candidate digest is `f89a6f5c9ac3817332259c3c2e6053ecaabab847fd00e262fb4ec4b15141ccd2`.

## 7. Protected-file identity check

The final worktree blob IDs equal the baseline `HEAD` blob IDs:

| Protected path | Baseline/worktree Git blob |
|---|---|
| `AGENTS.md` | `eecadcf4ba39f4e32c5da84a62ed9ec3d913b6d8` |
| `CURRENT_STATE.md` | `b3830ce5f371908237aea24aecdc63ad586bd739` |
| accepted V3 Charter | `ba5df15d22fc43b8d2ce9554aac5552d01d8e41d` |
| authority/acceptance rules | `4062cba030530aa95d28c933760dc5ee8db5a4d5` |
| V3 precontract review | `4dab40f589231a1984f0cf3615fa86d6c324b9f0` |
| `docs/reports/V2_CLOSEOUT.md` | `a05a01fc875c087dd11191845f1b9bd4687f1330` |
| `workbench/src/prompts/base.ts` | `e58a868a672fd36f76ca532036380c3bac5b5415` |
| accepted V1 Skill fixture | `71c93244bf6218a17a7295bb358f7a189dc05c64` |

Raw byte SHA-256 evidence additionally records base prompt `d380370a1e16c64cc875f4520dd527a477a6d5ff21765d73779125e6b7a10313` before/after, accepted Skill `d41a123a4fa7c5aece7c1efece8fcc3be2040b272a5ab76f14622d3b17fc80af` before/after, and the evidence-local active sentinel `a8657034a13a4e73646a1e07b01c7f63ca89f5416c005c92748fc957e4b91093` before/after.

For the bounded real execution, `protected-identities-before.json` and `protected-identities-after.json` under the authoritative Run root contain equal SHA-256/size maps for every tracked path other than the two report paths authorized for post-execution editing. The Goal-local accepted-active sentinel SHA-256 was `a3863c5130f98bd6a5f7d24b09a7b9a76685be1a9ae29c76fcb308a5a7f3e2fe` before and after. Tracked/index status was clean immediately before and immediately after the real call.

## 8. Pi and public-import check

- Pi source: `D:/AI/AI_Projects/project2/.upstream/pi`, HEAD `027a5847901b5dde30270abaa1041046cd2b4b55`, clean, package `@earendil-works/pi-agent-core@0.82.1`.
- Emitted boundary: `D:/AI/AI_Projects/project2/.runs/g006/pi`, same HEAD/version and clean.
- Used public emitted entries only: `packages/agent/dist/index.js`, `packages/agent/dist/node.js`, `packages/ai/dist/index.js`, plus public provider subpaths exported by the emitted package.
- Runtime smoke observed `AgentHarness`, `loadSkills`, and `NodeExecutionEnv`; type smoke and strict TypeScript used the existing emitted TypeScript 5.9.3 compiler.
- No Pi source/artifact file was modified; no dependency was copied, installed, downloaded, or resolved from the absent old-worktree `.runs/v0-a/pi` path.

## 9. Remaining gate

The bounded real-proposal authorization has been consumed exactly once and is not reusable. The sole remainder is Main/user finite acceptance of Goal 1 based on the preserved Candidate/State evidence. This Session does not claim that acceptance and has no authority to make another request, promote/reject the Candidate, bind active state, commit, enter Goal 2, or enter Goal 3.

## 10. CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal for Main review only. This Session did not edit `CURRENT_STATE.md`.

```yaml
active_goal: V3_G1_EVIDENCE_TO_CANDIDATE_STATE
goal_1_zero_call_implementation: complete
goal_1_zero_call_verification: pass
goal_1_final_acceptance: pending
goal_1_bounded_real_proposal: pass_pending_main_acceptance
goal_1_disposition: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE
remaining_gate: main_user_finite_acceptance
credential_reads_observed: 1
external_network_calls_observed: 1
provider_calls_observed: 1
real_model_calls_observed: 1
retry_fallback_replacement_observed: 0
real_candidate_id: candidate-48ee92898bdb1eeedfc33956a67725f0
real_state_digest: efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9
real_state_status: staged_inactive
accepted_base_mutated: false
active_state_mutated: false
git_staged_or_committed: false
goal_2_authorized: false
goal_3_authorized: false
```

Final Session output: `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`
