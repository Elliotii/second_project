# V3.5 Persistent & Inspectable Adaptive Harness Workbench — Preimplementation Review

```yaml
status: accepted_as_v3_5_charter_design_basis
review_type: bounded_preimplementation_review
review_date: 2026-08-08
accepted_by_user: 2026-08-08
implementation_authorized: false
real_model_calls_authorized: 0
v3_reopened: false
root_baseline: 6c686f01928a44211119e75767190e221b319fe2
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
planning_input_sha256: a6c035a8c5d342a08ed501ba1e3e5e0658b967b8a3612e073cae77492e71a9f8
```

## 0. Executive decision

**Recommendation:** accept the attachment's three-Goal direction, with bounded corrections, and proceed next to a short `V3_5_CHARTER.md` rather than another research chain.

The minimum viable V3.5 should be:

```text
Goal 1 — public Pi JSONL Session + thin Workbench catalog/read model
    ↓
Goal 2 — one pre-frozen, held-out real Base vs adaptive_skill Case
    ↓
Goal 3 — loopback-only thin API + post-run-first inspectability UI
```

This is implementable without a database, Pi Core patch, Runtime switch, Extension/RPC route, semantic memory, or a new Eval system. The key technical correction is that **Session and Run are separate identities and separate authorities**. Pi should own the replayable conversation tree; Workbench should own Run/evaluation identity and the links between Sessions, Runs, evidence, adaptations, and state decisions.

The attachment correctly identifies two V3 limitations worth addressing: the real V3 path used an in-memory Session, and only `prompt_addendum` received an external-real-model closure. It should be corrected in four places:

1. Pi's public `JsonlSessionRepo` provides create/list/open/fork and persisted context, but its current metadata does not provide the Workbench's required `updated_at` or Run linkage. A thin Workbench catalog is still needed.
2. The sanitized V0-B evidence mirror is appropriate for portable evidence, but must not be used as the resumable source of truth. The full Pi JSONL Session and the safe UI/evidence projection have different purposes.
3. V3.5 should claim settled Session reopen/continue, not in-flight crash recovery or exactly-once Tool effects.
4. The deterministic V3 adaptive Skill is an accepted historical state version, but the final active pointer was rolled back to the prompt-only state. Goal 2 must select it explicitly through a frozen, isolated case authority; it must not describe that Skill as the current global active state.

No correctness defect was found that reopens V3 or weakens its accepted claim.

## 1. Review scope and evidence order

### 1.1 Reviewed inputs

- `CURRENT_STATE.md`
- `docs/reports/V3_CLOSEOUT.md`
- `docs/reports/V3_G3_CLOSEOUT.md`
- V3 Goal 1–3 reports, review records, and accepted Charter
- current `workbench/src/` and relevant tests
- fixed Pi checkout at `027a5847901b5dde30270abaa1041046cd2b4b55`
- attachment `第二项目_V3.5_Persistent_Inspectable_Workbench_实施规划.md`, SHA-256 `a6c035a8c5d342a08ed501ba1e3e5e0658b967b8a3612e073cae77492e71a9f8`
- stored V3 Goal 3 state and real-run artifacts

### 1.2 Evidence labels

- **Fact** — local source, test, immutable artifact, accepted Closeout, or observed command.
- **Inference** — conclusion derived from those facts but not yet dynamically proven on the proposed V3.5 composition.
- **Recommendation** — proposed bounded design choice.
- **Unconfirmed** — item that must be resolved by a future implementation Gate or Case freeze.

### 1.3 Repository baseline

**Fact:** V3 is closed and accepted at root commit `6c686f01928a44211119e75767190e221b319fe2`. The accepted disposition is `PASS_V3_HARNESS_STATE_ADAPTATION_WITH_SINGLE_REAL_PROMPT_PATH_LIMITATION` (`docs/reports/V3_CLOSEOUT.md`). The pinned Pi checkout is clean at `027a5847901b5dde30270abaa1041046cd2b4b55`.

**Fact:** this review did not modify Workbench source, Pi, `CURRENT_STATE.md`, V3 artifacts, or control state; it performed no model/provider call.

## 2. Final V3 baseline and reusable capability

### 2.1 Accepted V3 mechanism

The accepted V3 flow is:

```text
Frozen Evidence
→ Improvement Opportunity
→ Diagnosis / Lesson
→ RefinementCandidate
→ staged prompt_addendum or adaptive_skill
→ symmetric Base/Candidate validation
→ promote / reject
→ immutable State version + active pointer
→ selective binding
→ subsequent Direct Pi Run
```

**Fact:** the relevant reusable implementation is already separated into bounded components:

| Concern | Existing source / symbol | Reuse in V3.5 |
|---|---|---|
| Evidence projection | `workbench/src/refinement/evidence-v3.ts` — `validateFrozenEvidenceV3`, `projectImprovementOpportunityV3` | Adaptation explanation view |
| Candidate production | `workbench/src/refinement/producer-v3.ts` — `validateProposalAndBuildCandidateV3` | Candidate/lesson lineage; no redesign |
| Candidate staging | `workbench/src/state/staging-v3.ts` — `stageCandidateStateV3`, `loadStagedStateV3` | State content and Skill source inspection |
| Validation | `workbench/src/refinement/comparator-v3.ts` — `executeSymmetricValidationV3`, `inspectValidationV3` | Goal 2 Base/Candidate substrate and comparison view |
| Persistent State | `workbench/src/state/store-v3.ts` — `inspectStateStoreV3`, `applyValidationDecisionV3`, `rollbackActiveStateV3` | State-history view and guarded rollback |
| Selective binding | `workbench/src/state/binding-v3.ts` — `freezeRunBindingV3`, `inspectRunBindingV3` | Explain why a State matched a Run |
| Skill loading | `workbench/src/skill/adapter-v3.ts` — `loadAdaptiveSkillV3` | Real adaptive Skill path |
| Direct Pi execution | `workbench/src/pi/pi-adapter-v3.ts` — `executeBoundDirectPiV3` / internal `runHarnessV3` | Same Runtime; replace only Session construction boundary |
| Goal 3 Run evidence | `workbench/src/run-v3.ts` — `executeGoal3RunV3` | Run/evidence adapter input |

### 2.2 Accepted limitations that become V3.5 inputs

**Fact:** `runHarnessV3` constructs `InMemorySessionStorage` and a fresh `Session` for each V3 real Run. `runtime.json` persists the `session_id`, counters, digests, Tool-call count, and binding identity, but not a replayable message/Tool transcript.

**Fact:** the V3 real Run proved a prompt-addendum-bound Direct Pi repair with a passing external Verifier. It did not prove causal superiority over a real comparator, an external-real adaptive Skill, or complete Session/Tool-event persistence.

**Recommendation:** preserve these statements verbatim in V3.5 history. V3.5 adds usability and evidence coverage; it must not rewrite V3 as incomplete or retrospectively strengthen its claims.

## 3. Current Session persistence gap

### 3.1 What exists today

**Fact:** current Workbench paths have three different Session uses:

1. `workbench/src/session/evidence-session.ts` uses `EvidenceMirrorSessionStorageV0B`: Runtime operates on `InMemorySessionStorage`, while a sanitized/redacted/truncated projection is appended to a public `JsonlSessionStorage` mirror. `SessionRefV0B.resume_capability` remains `not_claimed`.
2. V2 uses public `JsonlSessionRepo` for parent and recovery branch Sessions in `workbench/src/run-v2.ts`. Its deterministic Gate is exercised in `workbench/tests/v2a-recovery.test.ts`.
3. V3 real execution uses only `InMemorySessionStorage` in `workbench/src/pi/pi-adapter-v3.ts`.

### 3.2 The actual gap

The missing V3.5 product capability is not “save one more JSON file.” It is this composition:

```text
Process A
→ create public Pi JSONL Session
→ run one settled AgentHarness turn
→ persist complete Pi messages and Tool results
→ link one Workbench Run to the Session
→ exit

Process B
→ list and open Session
→ rebuild AgentHarness context from Pi Session
→ show safe history
→ continue with another Run/turn
→ preserve prior and new Run links
```

**Unconfirmed:** pinned Pi tests prove the pieces, but the Workbench does not yet have a combined cross-process “AgentHarness turn → reopen → continue” test. This should be Goal 1's central deterministic Gate.

### 3.3 Explicit non-claim

Goal 1 should prove only a **settled restart boundary**. It should not claim:

- recovery of an in-flight Provider or Tool call;
- exactly-once side-effect execution;
- concurrent-writer safety;
- distributed Session storage;
- automatic reconciliation after a crash between Tool effect and Session append.

Those are different reliability problems and are not needed for V3.5.

## 4. Pi public Session persistence path

### 4.1 Public capabilities verified

**Fact:** pinned Pi publicly exports its harness Session surface from `packages/agent/src/index.ts`.

**Fact:** `packages/agent/src/harness/session/jsonl-repo.ts` exposes `JsonlSessionRepo` with public `create`, `open`, `list`, `delete`, and `fork`. `packages/agent/src/harness/session/jsonl-storage.ts` implements append-only JSONL entries and persisted leaf movement. `packages/agent/src/harness/session/session.ts` rebuilds the current context with `Session.buildContext()`.

**Fact:** `AgentHarness` builds a new turn from the supplied Session context and appends observed messages back to that Session. Therefore a reopened `Session` is the correct public continuation input; no Pi Core patch or private import is indicated.

**Fact:** Pi tests provide component evidence:

- `packages/agent/test/harness/repo.test.ts` — JSONL create/list/open/fork and metadata preservation;
- `packages/agent/test/harness/session.test.ts` — context reconstruction, compaction/branch projection, name/label behavior, and persisted leaf changes.

### 4.2 Thin adapter, not new persistence infrastructure

**Recommendation:** Goal 1 should add a Workbench-owned Session service around public `JsonlSessionRepo`, with responsibilities limited to:

- create/list/open a Session under a project-owned ignored data root;
- construct the existing Direct `AgentHarness` with that opened `Session`;
- record Session identity on each Run;
- maintain a small Session↔Run catalog;
- expose safe, typed read projections to CLI/API/UI;
- fail closed on path escape, identity mismatch, corrupt JSONL, or broken references.

It should not wrap Pi JSONL in another message database or duplicate Pi's context tree.

### 4.3 Required correction to the attachment

Pi agent-core's `JsonlSessionRepo.list()` returns header metadata sorted by creation time. Its metadata has `createdAt`, `cwd`, `path`, `parentSessionPath`, and custom metadata, but no authoritative Workbench `updated_at` and no Run list.

The richer Pi coding-agent `SessionManager` computes `modified` by scanning entries, but that is a separate coding-agent implementation rather than the direct agent-core Runtime route.

**Recommendation:** keep Direct `AgentHarness` + agent-core JSONL as Runtime. Let a thin Workbench catalog own:

```text
session_id
pi_session_ref / path identity
project_id
workspace identity
display title
created_at
updated_at
run_ids
parent_session_id (when known)
catalog schema version
```

This catalog is navigation metadata, not conversation or evaluation authority. A derived cache/index may be rebuilt; the underlying Pi Session and Run artifacts remain authoritative.

## 5. Session, Run, and Evidence relationship

### 5.1 Frozen distinction

```text
Pi Session
  = conversation/context tree across one or more settled turns
  = user/assistant/tool-result history used to continue the Agent

Workbench Run
  = one bounded execution/evaluation unit
  = task, workspace, budget, State binding, Verifier, Outcome, counters, evidence
```

One Session may contain multiple Runs. A recovery or validation experiment may use multiple Sessions for one comparison group. A Run must therefore never be inferred merely from a Session entry boundary.

### 5.2 Minimal identity links

**Recommendation:** preserve both directions explicitly:

- Run Manifest/runtime contains `session_id` and a digest/reference to Session catalog identity;
- Session catalog lists ordered `run_ids` and their artifact roots;
- Run remains authoritative for task/Verifier/Outcome/budget;
- Pi JSONL remains authoritative for resumable conversation context;
- immutable V3 State and decision files remain authoritative for adaptation lifecycle;
- read-model records contain source references and digests, not copied authority.

### 5.3 Full Session vs safe evidence/UI projection

The current evidence mirror intentionally redacts private reasoning, sanitizes secrets, and truncates large content. Those properties are useful for reports and UI, but a sanitized mirror may no longer be sufficient to reconstruct the exact previous Agent context.

**Recommendation:** maintain two explicit planes:

```text
Runtime plane: full local Pi JSONL Session, used only for reopen/continue
Read/evidence plane: safe projection, used by reports, CLI, API, and WebUI
```

The API must never expose arbitrary raw JSONL or arbitrary filesystem paths. Credential values and private reasoning remain outside the inspectable surface.

## 6. Minimal Read Model

### 6.1 Why it is needed

**Recommendation:** accept the attachment's Read Model requirement. Without it, the WebUI would become a second Runtime/inspector that separately understands every V0–V3 artifact version. That would duplicate identity checks and make the UI authoritative by accident.

### 6.2 Shape

The Read Model should be a typed, read-only application layer over existing inspectors and a few versioned source adapters:

```text
Pi JSONL Session       V0/V1/V2/V3 Run artifacts       V3 State store
          \                    |                         /
           \--- versioned source adapters + inspectors -/
                                  ↓
                         stable view contracts
                                  ↓
                            CLI / local API / UI
```

Suggested view contracts, with exact names left to implementation:

- Session summary/detail: title, time, workspace identity, parent, Run links, safe messages and Tool events;
- Run summary/detail: task, status, Verifier, counters, Session, State binding, artifacts;
- timeline node: Agent/Tool/Verifier/decision events with source references;
- comparison: Base/Candidate or recovery alternatives, common inputs, outcomes, selected result;
- adaptation: evidence → opportunity → diagnosis → lesson → candidate → validation → decision;
- State history: versions, entries, active pointer, promotion/rejection/rollback, later bindings.

### 6.3 Authority rules

- The Read Model is not a new truth store.
- Each material field carries or resolves to its source artifact/reference.
- Missing historical evidence renders as `not_recorded`/`unavailable`; it is never guessed.
- Old formats are handled by versioned adapters, not destructively migrated.
- An optional materialized index is disposable and rebuildable.
- Existing V0–V3 inspectors continue to enforce integrity.

### 6.4 Minimal historical coverage

Goal 1 need not normalize every old field. It should cover the flows needed for the V3.5 product and demo:

1. current persistent Session and Run history;
2. one representative V2 recovery comparison;
3. V3 prompt adaptation and State lineage;
4. the future Goal 2 adaptive Skill comparison;
5. a safe generic fallback for older Runs with partial evidence.

This is enough to avoid a schema-migration project while still demonstrating V0–V3 continuity.

## 7. Bounded Pi UI/trace reference study

### 7.1 What exists at the pinned Pi commit

**Fact:** pinned Pi has no WebUI package. Its packages are `agent`, `ai`, `coding-agent`, `evals`, `server`, `storage`, and `tui`. The useful local references are therefore behavior/presentation patterns, not a reusable Web Runtime.

| Pi source | Pattern | Decision |
|---|---|---|
| `packages/coding-agent/src/core/session-manager.ts` — `SessionInfo`, `list`, `continueRecent` | Session name, parent link, message count, first-message preview, computed modified time | **Adapt** into Workbench catalog/read projection; do not replace agent-core Session Runtime |
| `packages/coding-agent/src/modes/interactive/components/session-selector.ts` — `buildSessionTree` | Parent/child Session grouping, latest-activity ordering, compact summary | **Adapt** for sidebar hierarchy and recent Sessions |
| `.../session-selector-search.ts` — `filterAndSortSessions` | Search across id/name/messages/cwd; recent/relevance ordering | **Adapt later** after basic list/open; not a Goal 1 blocker |
| `packages/coding-agent/src/core/export-html/index.ts` — `exportSessionToHtml`, `preRenderCustomTools` | Post-run static rendering, message/Tool pairing, custom Tool fallback | **Adopt as presentation reference**, not code/runtime dependency |
| `.../export-html/tool-renderer.ts` — `createToolHtmlRenderer` | Collapsed/expanded Tool result and graceful structured fallback | **Adapt** in the WebUI safe renderer |
| Pi TUI/live interaction | Streaming token/Tool updates | **Ignore for V3.5 v1**; post-run inspectability has priority |
| Pi `server` package or RPC route | Alternative server orchestration | **Reject as V3.5 base**; it would change the accepted Direct Runtime route |

### 7.2 Compare and State-history sources

No external UI implementation is needed to define their semantics:

- V2 recovery artifacts already define candidate paths, Outcome and selection;
- `executeSymmetricValidationV3` and `inspectValidationV3` define Base/Candidate comparison;
- `inspectStateStoreV3` defines versions, decisions, active state and integrity;
- `inspectRunBindingV3` defines later-use matching and lineage.

**Recommendation:** reuse those inspectors and design the UI around their language. Do not invent a dashboard-specific scoring or promotion model.

## 8. Thin Local API and WebUI

### 8.1 Architecture

```text
Browser
→ loopback-only thin HTTP API
→ Workbench application/read services
→ existing Run / Session / Verifier / State controllers
→ public Pi AgentHarness
```

**Recommendation:** first prefer Node's built-in HTTP/static-file capabilities and small browser assets. Do not add React/Vite/a database unless Goal 3 demonstrates a concrete need that cannot be met cleanly. No WebSocket is required for acceptance; polling is sufficient where refresh is needed.

### 8.2 Minimal product surface

- list/search/reopen Sessions;
- show safe conversation and collapsed/expanded Tool events;
- create a Session and submit/continue a bounded task through the existing Workbench service;
- show Run status, workspace identity, budget/counters, Verifier and Outcome;
- show Base/Candidate or recovery comparison;
- show adaptation lineage and Prompt/Skill content diff;
- show State history and why a State matched a subsequent Run;
- invoke rollback only through the existing guarded Harness authority.

Real calls from the UI are not implicitly authorized by the UI's existence. Credential resolution remains server-side and opaque; the browser neither stores nor receives credentials.

### 8.3 API safety boundary

- bind only to loopback by default;
- validate project/session/run IDs and canonical paths;
- expose allowlisted projections, never arbitrary file reads;
- render text as text, not trusted HTML;
- keep raw Provider payloads/private reasoning out of responses;
- require expected-active identity and explicit confirmation for rollback;
- do not let UI edit Verifier, promotion criteria, State files, Prompt/Skill files, or accepted evidence directly.

## 9. Adaptation visualization data mapping

The distinguishing view should be derived as follows:

| UI question | Existing evidence |
|---|---|
| Why did the Harness change? | `FrozenEvidenceV3` + `ImprovementOpportunityV3` |
| What was diagnosed and learned? | `DiagnosisV3`, `LessonV3` in Goal 1 artifacts/candidate lineage |
| What Prompt/Skill was proposed? | `RefinementCandidateV3` + staged State + Skill `SKILL.md` |
| How was it tested? | `ValidationResultV3` from `executeSymmetricValidationV3` |
| Why promote/reject? | immutable `StateDecisionV3` |
| What is active now? | `ActiveStatePointerV3` + referenced `HarnessStateVersionV3` |
| Why did it apply to this Run? | `FrozenRunBindingV3.binding_context`, bound entries and lineage |
| What did the Run do? | Run Manifest/runtime, Session projection, Verifier result, Outcome |
| What happened after rollback? | ordered State decisions and binding revisions |

The UI should present source digest/reference drill-down for each node. A diagram alone is insufficient if it cannot be traced back to immutable artifacts.

## 10. Real adaptive Skill Case feasibility

### 10.1 Current path is mechanically viable

**Fact:** V3 deterministically proved the public Direct Pi adaptive Skill route. `loadAdaptiveSkillV3` validates the generated Skill source/wrapper, and the Agent path invokes `harness.skill(...)`. No Pi patch or private import is required.

**Fact:** accepted historical State version 2, digest `0f6c5d44c815a0d1b267d7fdf2e0c01f50eb640d06da72fe9ff8fab343249927`, contains `adaptive-inefficient-success`. Its body is reusable procedure:

> Inspect the task and preserve protected files; run the frozen check after editing; if it fails, use only bounded public output for one focused correction and rerun the same check.

It does not contain a target file patch or a held-out answer.

**Fact/correction:** the final active pointer is version 1, digest `744ccd9ddce76f92b0b838f02253161748b9edb1e9071c8218bdf97f96ba2a7d`, after an operator rollback. The Skill remains an immutable accepted historical version; it is not currently active.

### 10.2 Recommended held-out task direction

Use one new, small, local TypeScript maintenance fixture with:

- a single understandable defect and deterministic install-free checks;
- a frozen public check plus a hidden acceptance Verifier;
- meaningful opportunity to follow “inspect → edit → run frozen check → one focused correction”;
- no dependence on containers, package download, large repository setup, or nondeterministic service;
- task text and identifiers absent from the Skill body.

Do not reuse the exact `parse-duration` task and do not select a task after observing real A/B outcomes.

### 10.3 Fairness and anti-cherry-picking procedure

1. Calibrate only task mechanics with deterministic/no-model execution.
2. Freeze one short Case Contract before any real dispatch: task source, initial workspace digest, Task prompt, model/provider profile, Tool profile, budgets, Verifier source/digest, allowed Skill content, leakage checks, and comparison metrics.
3. Freeze an isolated case-owned State authority that explicitly selects the accepted historical Skill through existing State APIs; do not manually edit the active pointer and do not mutate the closed V3 authority in place.
4. Create byte-identical Base and Candidate workspaces and fresh Sessions.
5. Keep task prompt, model, Tools, budget, Verifier, and stop semantics identical. The only treatment delta is explicit adaptive Skill binding.
6. Run one Base and one Candidate. No outcome-driven replacement task, fallback path, or “run until Skill wins.”
7. Persist both Sessions, Runs, comparison, and decision as observed.

The Goal passes if the frozen execution and evidence are valid, even if the Skill shows no improvement. A Skill win is a result, not a completion requirement.

### 10.4 Unconfirmed items for the Goal 2 Case freeze

- exact fixture/task and its source provenance;
- exact real model/cost/request/Tool budget;
- whether the existing V3 symmetric comparator receives a thin real execution port or the same symmetry is composed through the persistent Run service;
- the case-owned State activation sequence for the accepted historical Skill;
- structural efficiency metrics in addition to external Verifier pass/fail.

These are bounded Contract choices, not reasons for another broad research Goal.

## 11. Three-Goal implementation order and dependencies

### Goal 1 — Persistent Session & Run Foundation

**Question:** can a public Pi JSONL Session survive process restart, remain linked to Workbench Runs/evidence, be safely inspected, and continue through the same Direct AgentHarness route?

Minimum implementation:

- thin `JsonlSessionRepo` adapter/service;
- project-local Session catalog with Session↔Run links and updated time;
- refactor Direct V3-style execution to accept a created/opened Session rather than constructing in-memory storage internally;
- safe Session/Tool read projection;
- versioned Run/evidence read adapters sufficient for V2/V3 and partial legacy display;
- narrow CLI or service entrypoints for create/list/open/continue/inspect;
- deterministic restart test, zero real calls.

**Exit criteria:**

1. Process A creates a Session, completes a deterministic AgentHarness turn containing a Tool call/result, persists a linked Run, and exits.
2. Process B lists and opens the same Session, reconstructs prior context, continues one new turn/Run, and preserves both Run links.
3. Safe read projection renders conversation/Tool/Run history without exposing credential/private-reasoning content.
4. Corrupt/missing/cross-project/path-escape identities fail closed.
5. Existing V0–V3 regression suites required by the changed boundary pass.
6. No Pi patch, private import, database, external network, credential, or model call.

### Goal 2 — One Bounded Real Adaptive Skill Closure

**Dependency:** Goal 1 accepted. Goal 2 needs its durable Session/Run/evidence path, but not the WebUI.

Minimum implementation/execution:

- one short, user-reviewed Case freeze;
- isolated case-owned accepted Skill State;
- one frozen Base/Candidate pair using the same Direct Pi Runtime;
- persisted Sessions/Runs/comparison/Verifier evidence;
- no outcome-driven Case replacement.

**Exit criteria:**

1. Case, fairness fields, Skill leakage check, Verifier and budget are frozen before real dispatch.
2. Base and Candidate start from byte-identical workspaces and differ only by adaptive Skill binding.
3. Both use the same provider/model/Tool/Verifier/stop profile and fresh persistent Sessions.
4. Results and all mandated evidence are persisted and inspectable.
5. The observed result is accepted without Case hunting, whether Skill wins, ties, or loses.
6. V3 authority semantics and Pi remain unchanged.

### Goal 3 — Adaptive Harness Workbench WebUI & Demo

**Dependencies:** Goal 1 accepted; Goal 2 evidence available. The UI must consume the Read Model rather than raw per-version artifacts.

Minimum implementation:

- loopback-only thin API;
- Session sidebar and safe conversation/Tool rendering;
- Run/Verifier/Outcome page;
- V2 recovery comparison;
- V3 adaptation lineage, Prompt/Skill diff, State/history/binding view;
- guarded existing-authority rollback control;
- new/continue Session entry through the Workbench service;
- reproducible post-run demo data/commands.

**Exit criteria:**

1. A user can list, open, review, and continue a persisted Session.
2. Run history and Verifier/Outcome evidence are traceable to source references.
3. Base/Candidate or recovery comparison is visible without recomputing semantics in the browser.
4. Evidence → diagnosis → lesson → Prompt/Skill → validation → decision → later binding is explainable end to end.
5. State history and current active identity are visible; rollback, if exposed, calls the existing guarded controller.
6. UI/API cannot read arbitrary paths, expose secrets/private reasoning, or directly mutate accepted authority files.
7. Post-run inspection is complete; live streaming is not required.

## 12. Attachment decisions: accept / correct / simplify / reject

| Attachment proposal | Decision | Reason |
|---|---|---|
| V3.5 as persistence + real Skill evidence + inspectability, not new self-evolution | **Accept** | Fits accepted V3 limitations and portfolio need |
| Three Goals in the proposed order | **Accept** | Real Skill evidence should use durable Session/Run substrate; UI should use final data shape |
| Pi public persistence before new infrastructure | **Accept** | Public `JsonlSessionRepo` and `Session.buildContext()` are sufficient primitives |
| Session list/open/review/continue | **Accept with correction** | Requires Workbench updated-time/Run-link catalog; settled resume only |
| Save complete Session/Tool history | **Accept with privacy split** | Full JSONL for Runtime; sanitized safe projection for UI/evidence |
| Thin Read Model | **Accept** | Prevents browser and CLI from becoming artifact authorities |
| Broad normalization of all V0–V3 artifacts | **Simplify** | Use versioned adapters plus partial fallback; no migration platform |
| One real adaptive Skill Case | **Accept with correction** | Skill is accepted historical version but not currently active; use isolated frozen authority |
| Prefer Base fail / Skill pass | **Reject as success criterion** | It invites Case selection pressure; evidence validity, not a pretty outcome, closes Goal 2 |
| Pi WebUI as implementation reference | **Correct** | Pinned Pi has no WebUI package; its selector and HTML exporter provide bounded UI patterns only |
| New Web framework / full Pi chat client | **Defer/reject** | First version can remain thin and post-run-first; no Runtime replacement |
| State rollback in UI | **Accept narrowly** | Only through existing expected-active guarded authority; no direct file writes |
| Real-time token/Tool streaming | **Defer** | Not required for persistent inspectability or the V3.5 claim |
| Final architecture/README/interview consolidation now | **Defer** | Correctly belongs after V3.5 code/evidence freeze |

## 13. Risks, non-goals, and hard stops

### 13.1 Material risks to control

- **Raw Session confidentiality:** persisted Pi messages/tool details may contain information intentionally absent from current evidence mirrors.
- **Catalog drift:** Session↔Run index must be atomically updated, inspectable, and preferably rebuildable; it must not override raw truth.
- **Workspace continuity:** a reopened Session does not recreate a missing/mutated Workspace. Session continuation must validate project/workspace identity.
- **Single-writer limitation:** Pi JSONL and V3 State stores are not demonstrated as concurrent transactional stores. V3.5 stays local/single-writer.
- **Historical gaps:** older Runs lack some Session or lineage data. UI must say so explicitly.
- **Path traversal/API exposure:** artifact drill-down and static serving require strict canonical-path and content-type allowlists.
- **Authority mutation from UI:** rollback is a controlled Harness operation, not a generic file-edit endpoint.
- **Case-selection bias:** Goal 2 must freeze once before real outcomes.

### 13.2 Non-goals

- semantic memory, vector search, cross-Session retrieval, or Experience Repository;
- database, distributed store, multi-user platform, remote agent manager;
- in-flight crash recovery or exactly-once Tool semantics;
- LLM Router, Curator, Runtime Policy optimizer, automatic publishing, continual evolution;
- full IDE, terminal emulator, arbitrary shell UI, or Pi feature parity;
- Pi Extension/RPC/server route switch, Pi Core modification, or private import;
- real-time streaming as a completion condition;
- changing Verifier authority, promotion authority, accepted Prompt/Skill semantics, or V3 State lifecycle.

### 13.3 Hard stops

Return to Main/user decision only if one of these occurs:

1. public Pi Session storage cannot preserve/rebuild the actual context needed by Direct `AgentHarness` without Pi patch/private import;
2. the only resumable source would be the lossy sanitized evidence mirror;
3. persistent Session integration requires changing Verifier, promotion, budget/security, or State authority semantics;
4. Session/Run identity cannot be linked without making a derived catalog authoritative;
5. the chosen Skill Case requires answer leakage, outcome-driven Case replacement, extra treatment paths, or a new Eval Runtime;
6. WebUI implementation requires switching from Direct AgentHarness to Pi Extension/RPC/server or exposes arbitrary local files/secrets;
7. a concrete correctness defect is found that contradicts an accepted V3 claim.

Normal TypeScript, serialization, path, HTTP, CSS, fixture, catalog, polling, or focused-test defects are implementation work. They should be repaired within the Goal and should not automatically create an Audit, R1/R2, Amendment, or replacement Session.

## 14. Recommended governance and immediate next step

### 14.1 Lighter implementation governance

Use one independent top-level implementation Session per Goal, as already preferred by the user. Main owns Charter/Goal question, bounded acceptance, control state, and final commit. The implementation Session owns source, focused tests, evidence, report, and bounded corrections.

Do not schedule independent audit by default. Trigger it only for a concrete high-risk change to:

- Session continuation identity or sensitive-data projection;
- State/promotion/rollback authority;
- real-call Case fairness or evidence identity;
- filesystem/network/credential boundary.

### 14.2 Next step

**Recommendation:** after user review, write and freeze one concise `V3_5_CHARTER.md` that:

1. accepts the three-Goal order and the corrections in this review;
2. freezes Goal 1's settled-reopen question and zero-call exit criteria;
3. leaves the exact Goal 2 Case/model budget for a later short Case Contract;
4. keeps Goal 3 UI technology flexible within the thin local boundary;
5. authorizes no implementation or real call by itself.

Then activate only Goal 1 in a new top-level implementation Session. No additional general research Session is recommended before Goal 1.

## Relevant files and symbols

### Workbench

- `workbench/src/pi/pi-adapter-v3.ts` — `runHarnessV3`, `executeBoundDirectPiV3`: current Direct Pi execution and in-memory Session boundary.
- `workbench/src/run-v3.ts` — `executeGoal3RunV3`: V3 Run Manifest/runtime/Verifier persistence.
- `workbench/src/session/evidence-session.ts` — `EvidenceMirrorSessionStorageV0B`, `reopenAndValidateEvidenceSession`: safe evidence mirror, not resumable truth.
- `workbench/src/run-v2.ts` — public `JsonlSessionRepo` recovery use.
- `workbench/src/refinement/comparator-v3.ts` — `executeSymmetricValidationV3`, `inspectValidationV3`: Base/Candidate validation substrate.
- `workbench/src/state/store-v3.ts` — `inspectStateStoreV3`, `applyValidationDecisionV3`, `rollbackActiveStateV3`: immutable State lifecycle and guarded active pointer.
- `workbench/src/state/binding-v3.ts` — `freezeRunBindingV3`, `inspectRunBindingV3`: applicability and lineage.
- `workbench/src/skill/adapter-v3.ts` — `loadAdaptiveSkillV3`: public Pi Skill loading path.

### Pinned Pi

- `packages/agent/src/harness/session/jsonl-repo.ts` — `JsonlSessionRepo`.
- `packages/agent/src/harness/session/jsonl-storage.ts` — `JsonlSessionStorage`.
- `packages/agent/src/harness/session/session.ts` — `Session.buildContext`, message/leaf/name/label operations.
- `packages/agent/src/harness/agent-harness.ts` — supplied Session consumption and append lifecycle.
- `packages/agent/test/harness/repo.test.ts` — public repository create/list/open/fork evidence.
- `packages/agent/test/harness/session.test.ts` — context and persistence behavior.
- `packages/coding-agent/src/core/session-manager.ts` — session-list presentation metadata reference.
- `packages/coding-agent/src/modes/interactive/components/session-selector.ts` — session tree/list reference.
- `packages/coding-agent/src/core/export-html/index.ts` and `tool-renderer.ts` — post-run conversation/Tool rendering reference.
