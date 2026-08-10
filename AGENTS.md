# Project Instructions

## Purpose

This repository contains the accepted V0–V3.5 implementation of a reliability-first
Adaptive Coding Agent Harness built on public Direct Pi `AgentHarness`.

V3.5 is closed and accepted as
`PASS_V3_5_PERSISTENT_INSPECTABLE_ADAPTIVE_HARNESS_WORKBENCH_WITH_BOUNDED_SINGLE_CASE_SKILL_EVIDENCE`.
The post-V3.5 real two-Turn product smoke and the additive English/Simplified-Chinese
WebUI maintenance are also closed and accepted. V3.6 preimplementation planning is
accepted as design input only. No Goal is active; the Execution Backend Selection Gate,
V3.6 Charter, implementation, Credential/model access and Pi changes remain unauthorized.

Preserve these binding facts:

- V2 is closed with limited mechanism evidence; its sole real Negative produced no
  Verifier result, so V2-B is not a full PASS.
- V3 is closed and accepted with one external-real-model prompt-addendum path; do not
  generalize causal improvement or adaptive-Skill behavior from it.
- V3.5 Goal 1 proves settled deterministic/Faux Pi Session reopen/continue across
  processes, explicit Session↔Run linkage and a safe Read Model. It does not prove
  in-flight crash recovery, exactly-once Tool effects or real-model continuation.
- V3.5 Goal 2 remains closed inconclusive. Preserve its invalid Base budget-stop Pair.
- V3.5 Goal 2.5 is closed and accepted from one valid frozen replacement Pair. Base and
  Candidate both passed; Candidate used more tokens and no Skill task-success advantage
  was observed.
- V3.5 Goal 3 is closed and accepted at implementation commit
  `b5c34033a4ff64d2bacd01279823611193834920`. Its HTTP surface is loopback-only,
  evidence projections are non-authoritative, and browser State mutation is deferred.
- Fixed Pi remains `027a5847901b5dde30270abaa1041046cd2b4b55` with zero Pi Core patches.
- All V3.5 Credential, external-network, Provider/model and real-execution authority is
  consumed. Do not create a new Goal, reopen an accepted version or enter V4 without
  explicit user authorization.

## Required Read Order

Before doing project work, read in this order:

1. `CURRENT_STATE.md`.
2. The active goal named in `CURRENT_STATE.md` under `active_goal`, when non-null.
3. The files listed by `CURRENT_STATE.md` under `required_reading`.
4. The relevant sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`.
5. Any source or decision files explicitly referenced by the active goal.

When working inside `.upstream/pi`, read every applicable Pi `AGENTS.md` completely before inspecting, testing, or changing files. More deeply nested instructions take precedence for their subtree.

## Authority and Evidence

- Treat the original research package and deep-research report as context, not authority.
- Treat `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` as the current project plan, but preserve every item marked candidate, conditional, pending, or not frozen.
- Local source, local tests, and observed command output are stronger evidence than README claims or external summaries.
- Label material conclusions as `Fact`, `Inference`, `Recommendation`, or `Unconfirmed`.
- Every Pi source claim must cite the pinned local path, symbol, and relevant test when available.

## Harness Reference Boundary

- Treat `reference/cc-harness-knowledge/` as a design reference for mature Harness problems, goals, invariants, failure modes, and applicability boundaries. It does not prove Pi behavior or authorize implementation.
- Use `reference/src/` as a read-only mature-Harness source mirror when the knowledge notes are insufficient and a concrete implementation detail, symbol, call chain, or failure path could change a project decision.
- The source mirror's product version and full provenance are not established. Do not claim that it represents the latest Claude Code behavior unless separately verified.
- Prove Pi behavior from the pinned Pi source, Pi tests, and observed project commands. Compare reference patterns against Pi; do not mechanically copy Claude Code classes, modules, or feature lists.
- An unverified mature pattern is not an observed failure, architecture blocker, Goal, or Gate. Promote a risk only when it blocks a current decision, threatens the core loop with specific evidence, cannot be safely deferred, and has a bounded stop condition.

## Filesystem Boundaries

- `.upstream/pi/` is a read-only upstream checkout. Do not edit, format, install generated files into, or commit changes inside it unless a future goal explicitly authorizes an upstream experiment.
- `.runs/` contains generated run workspaces and artifacts and must remain ignored.
- `reference/cc-harness-knowledge/` and `reference/src/` are user-provided read-only references. Do not modify, reformat, flatten, vendor, or commit them unless the user explicitly authorizes that exact operation.
- Do not create the formal `workbench/` application until Pi receives a Go decision and a V0 Version Charter is accepted.
- Preserve the three root research/planning Markdown files unless a goal explicitly authorizes updating one.

## Scope Rules

- Do not add technologies because they are popular.
- Do not introduce MCP, Godot, Multi-Agent, A2A, Web UI, SQLite, Harbor integration, containers, or a general sandbox during Pi Source Audit.
- Do not turn a source-audit goal into implementation.
- Do not treat a fixed-task Spike as statistical Policy evidence.
- Do not silently decide Outcome semantics, Failure Taxonomy, Recovery Budget, Eval validity, or Policy promotion thresholds. These require user review.

## Main and Specialist Session Governance

- Keep architecture selection, project-scope decisions, Goal acceptance, risk promotion, and updates to `CURRENT_STATE.md` in the main project-control session with the user.
- Recommend a separate specialist research session only for a concrete, bounded, context-heavy question whose answer could change an important design decision. Do not create or dispatch one without user authorization.
- A specialist research report is advisory. The main session must check its cited source paths and symbols, compare the result with pinned Pi evidence and project scope, and accept, narrow, reject, or request revision.
- Use specialist implementation sessions only after the main session has produced a reviewed Goal Contract or an accepted Version Charter with a bounded Goal definition, and the user has explicitly authorized execution. The implementation session must not grant final Pi Go, freeze architecture, or expand scope.
- Every execution authority document (Goal Contract or accepted Version Charter) must name its execution-session owner. When it names a dedicated Goal Session, approvals given in the main session authorize handoff to that Session; they do not authorize the main session to implement or execute the Goal silently.
- The dedicated Goal Session owns the bounded implementation, commands, raw evidence, execution report, and Closeout draft. It must stop at Contract gates and return its report without making architecture acceptance decisions.
- The main session reviews the dedicated Session's report and cited evidence, discusses material choices with the user, and owns final Goal acceptance and next-phase decisions.
- Deviating from the declared Session owner requires explicit user direction and must be recorded in the Goal report, Closeout, and `CURRENT_STATE.md`.
- For V2 and later, pin the Version Question separately from each Goal or Stage DoD. Completing a substrate, implementation stage, audit, or execution attempt does not close the Version while its Version Question remains unanswered. Close an unanswered Version only when the user explicitly accepts a revised or inconclusive closeout.
- Use persisted Goal mode only after the user explicitly requests or authorizes it. The Goal objective must state the outcome, constraints, and verification that answer the Version Question; it must not be a broad activity such as “do all V2 work.” Goal mode does not broaden file, network, credential, model-call, commit, or architecture authority.
- Treat proposed counts of Sessions, correction loops, audits, reports, commits, or Goals as soft complexity-review triggers, not as completion limits. Exceeding a default must cause Main Session review; it must not by itself cause Goal completion, Version closeout, evidence discard, or abandonment of a still-achievable objective.
- A specialist report must separate findings that answer its assigned question from non-binding additional observations. An additional observation may change the current route only after Main maps it to a current Contract/Version requirement, concrete reproducible evidence, a current-version blocker, and a reason it cannot be safely deferred. A specialist may not cause another Session, Goal, Gate, dependency, or subsystem to be created automatically.
- When the user asks whether work is becoming too complex, or when a second material correction/audit, a new Goal/subsystem, or a materially broader research dependency is proposed, Main must perform a short complexity checkpoint before expanding work. State the Version Question, evidence obtained, evidence still missing, required-now/deferred/rejected work, the exact decision a proposed Session can change, and the recommended continuation. This checkpoint is normally conversational and does not require a new tracked report.
- Bundle compatible Main and audit findings into the smallest correction package and return it to the original implementation Session. Re-review only affected findings and necessary regressions. If further material work is needed, reassess the route and Contract rather than multiplying documents or Sessions; continue when the objective remains safely achievable and authorized.
- Independent audit is risk-driven, not automatic for every Goal or correction. Use a separate audit Session when a frozen candidate changes or depends on high-risk control-flow, lineage, budget/stop, secret/evidence, terminalization, permission, or external-side-effect boundaries, or when the user explicitly requests independent review.
- An independent audit Session may inspect source, run authorized regressions, and create audit-local ignored evidence plus an audit report. It must not repair source, modify control state, create the candidate commit, accept the Goal, or broaden a focused audit into a general platform review.
- When main review or audit finds a correctable implementation defect, return a bounded correction prompt to the original implementation Session. Main Session and audit Session do not silently repair it. Re-audit only the affected findings and required regressions unless new concrete evidence justifies broader scope.
- For V1-B, keep the accepted temporary roles distinct when separately authorized: a dedicated zero-call Stage 1 Preparation Session with only Contract-listed source-edit authority; a fresh focused independent Audit Session for the frozen Candidate; the original Preparation Session for any bounded correction; and a fresh Stage 2 Execution Session with no source, fixture, test, Manifest, control-state, staging, or commit authority. The Main Session alone creates Candidate and Execution Baseline commits and accepts results.
- V1-B Stage 1 and the accepted pause-path correction/audit must use zero credentials, network, external-provider calls, and real-model calls. Stage 2 authority is separate and does not flow backward. The Session that observes real arm outcomes must not edit source. V1-B uses the accepted 24-cell bounded descriptive Pilot, one-cell-at-a-time Manifest-enforced execution, no fallback/same-Run retry/automatic replacement, and the accepted cost cap only after separate user authorization. For the accepted replacement sequence, preserve the original evidence, debit USD 0.10 conservatively, cap replacement actual cost at USD 1.90 and allow at most 25 started initial Runs across original plus replacement Pilots.
- For V1-C, keep the accepted roles distinct: the dedicated zero-call Stage 1 Implementation Session owns only the Contract-listed correction/tests/reports; a fresh focused independent Audit Session reviews the frozen Candidate; the original Implementation Session owns any accepted bounded correction; and fresh no-source-edit Sessions separately own the real Canary and, only after Canary acceptance, the full Pilot. The Main Session alone creates baselines and commits, changes control state, accepts results and grants handoffs.
- V1-C Stage 1 has zero credentials, network, external-provider/model calls and real calls. It must separate typed local pre-dispatch budget stops from real Provider responses, preserve fail-closed unknown-usage accounting, let Pi reach `settled`, and keep the common external Verifier outside the treatment boundary. Do not change V1-B history, raise budgets, use SDK/Extension, or enter V2.
- V1-C and its R2 Pilot are closed. Preserve the immutable `.runs/v1-c/full-pilot-r2/` evidence, the historical four-Run prefix, the cell-04 outer-timeout reports and all accepted V1 Closeouts. Do not authorize further V1 calls, rerun any R2 cell, replace a denominator member or tune the result after seeing outcomes.
- Carry V1's decision accurately: Skill-only is the bounded preferred default; the exact same-Session Runtime Control treatment is not promoted; the common external Verifier remains accepted infrastructure. Do not generalize these findings beyond the fixed protocol or turn them into V2 authority.
- For V2, preserve the accepted Version Question separately from Goal DoD: freeze one immutable verifier-failed Recovery Seed, create exactly two isolated candidates from identical failed Workspace bytes, vary parent Session history as the primary delta, verify both with the common external Verifier, and select only a candidate that passes all hard gates or explicitly select none. Initial pass must create no recovery branch.
- V2 keeps Direct public emitted `AgentHarness` as the runtime route. Prefer the public `pi-agent-core` JSONL Session repo/open/fork primitive subject to a V2-A deterministic Windows Gate. Treat `pi-coding-agent` SDK as behavioral reference, Extension as a deferred thin-adapter candidate for future real Pi integration, and unscoped third-party Pi packages or Git worktree lifecycle as deferred until a concrete gap is proven.
- V2 is split into only V2-A deterministic substrate and V2-B frozen bounded real recovery acceptance. V2-A is closed and accepted. The active V2-B Contract has two stages: Stage 1 adds only the thin real Provider/Model/Tool/Session composition needed to consume the audited V2-A substrate and must use zero credentials, network and real calls; Stage 2 uses a different fresh no-source-edit Session to execute the frozen bounded real protocol. Do not create a default V2-C or implement V3 Experience/Curator/Router work in V2.
- Both V2-B specialist stages must be created as new top-level Codex Sessions/tasks visible to the user, not as subagents or child agents of Main. Main retains Contract, baseline, acceptance and route-control ownership. No focused independent audit is automatic: Stage 2 begins with its Contract-required fresh read-only preflight, and Main may recommend a separate top-level focused audit only if concrete high-risk evidence justifies it.
- V2-B cost ceilings are USD 0.20 per real Attempt, USD 0.60 per Recovery Group and USD 1.40 for the whole authorized sequence. Stage 1 Activation, its Control Baseline, bounded allowlist correction, the conditional Candidate/Execution Baseline, Stage 2 after Gate H, and one risk-triggered top-level focused audit have been preauthorized. These permissions remain condition-bound: no Credential/network/Provider/model access may occur in Stage 1, and final V2-B/V2 acceptance still belongs to Main plus the user.
- Preserve V2-B R1 `v2b-real-20260807-01` and its reports as immutable pause evidence. It proved real route and fail-closed budget behavior but did not answer the Version Question. Do not rerun, overwrite, continue or relabel it as valid recovery evidence.
- For accepted bounded R2, the controlled primary must use zero external/real calls but must still traverse Direct public `AgentHarness`, Tool lifecycle and a public JSONL Session; it must settle, pass the public/maintenance check, fail the external target Verifier and freeze the Seed before either Candidate. Real A/B then vary only parent Session history, and one real stable-format Negative must pass without recovery objects.
- R2 may treat a pre-dispatch budget refusal as a verifiable terminal only when Provider/Tool/side-effect state is quiescent, prior usage is known, Session/Workspace/evidence are consistent and the external Verifier runs once. Preserve that terminal label; never generalize it to crash, timeout, unknown usage or post-dispatch loss.
- R2 Inspector may allow only finite non-negative numeric `message.usage.reasoning` metadata at the exact schema path. Reasoning/thinking content, signatures, credentials, Authorization material, unknown shapes and all other reasoning paths remain fail-closed.
- R2 used the bounded top-level Implementation, focused Audit and fresh no-source-edit Execution roles. The Amendment hard exit was honored; the formerly separate final user decision has now been consumed only for the limited closeout, not for a full Contract PASS.
- V2-B and V2 are now closed by explicit user acceptance of a limited closeout. Treat the execution permissions described above as historical and consumed. Preserve the valid controlled Seed/A/B/Selection evidence and the incomplete real Negative together. Do not reopen V2, rerun the Negative, enter V3 or convert the limited closeout into a full PASS without a new user-authorized planning decision.
- V3 is closed and accepted under `V3_VERSION_CHARTER.md`. Preserve Goal 1/2/3 reports, the frozen Goal 3 Implementation Baseline `74e7e73a07321f191d1b266ab8dd3cb94f66cade`, the ignored real evidence and the formal V3 Closeout. Do not add a second V3 real path, comparator, retry, replacement or audit after closeout. Future work may consider full Pi Session/Tool-trace persistence, one-command failure-lineage recomputation, stronger privacy-preserving payload proof and a more durable State store, but these are recorded follow-ups rather than reopened V3 requirements. V4 requires a new user-authorized planning decision.
- V3.5 is governed by accepted `V3_5_CHARTER.md`. Goal 1 is closed and accepted while preserving `Session != Run`: public Pi JSONL is resumable conversation/context authority; Workbench Run artifacts remain execution/evaluation authority; the single-writer catalog is navigation metadata only. Full raw Session remains local Runtime state while CLI/API/UI/report consumers receive only allowlisted safe projections. The accepted claim is settled cross-process reopen/continue with deterministic/Faux evidence, not crash recovery, exactly-once Tool effects, database durability or external-model behavior. Automatic catalog rebuild remains a recorded productization limitation; missing/corrupt catalog currently fails closed. Goal 2 is closed inconclusive and its invalid evidence remains immutable. Goal 2.5 is closed and accepted after its audited implementation and one bounded infrastructure correction produced one valid real fixed-case Pair: both arms settled and passed, Candidate used more tokens, and no task-success advantage was observed. Preserve both the pre-arm pause and successful replacement evidence; do not claim general Skill superiority or rerun the Pair. Active Goal 3 is governed by `V3_5_G3_GOAL_CONTRACT.md`: add only a read-only Goal 2.5 Inspector/Read Model, loopback-only safe API, inspectability-first WebUI and sanitized demo projection. State rollback history is visible but HTTP State mutation is deferred. The dedicated top-level Session owns implementation and ordinary bounded fixes; Main retains acceptance and scope authority.
- For V0-C, keep four temporary specialist roles distinct when their stages are authorized: a read-only precontract research Session, a dedicated deterministic Stage 1 implementation Session, a focused independent audit Session for the frozen candidate, and a fresh Stage 2 user-acceptance Session that exercises the frozen product surface without source-edit authority.
- V0-C Stage 1 must use zero real-model calls. Stage 2 requires a separately authorized frozen implementation baseline, one bounded user-visible Coding Task and its explicit run/cost budget. Credentials and real-model authority do not flow backward to research, implementation, or audit Sessions.

## Commands and Changes

- Use `rg` and `rg --files` for search.
- Use `apply_patch` for project file edits.
- Do not modify or commit user files outside the active goal.
- Do not create Git commits unless the user explicitly asks.
- Before installing dependencies or running broad test/build commands, read the pinned Pi repository instructions and package scripts.
- Run only the narrowest tests needed to answer the active goal.

## Goal Closeout

Every execution goal must:

1. Produce the deliverables named in its governing Goal Contract or accepted Version Charter.
2. Record exact verification commands and results.
3. List what remains unverified.
4. Identify scope changes or user decisions needed.
5. Write `docs/reports/<GOAL_ID>_CLOSEOUT.md`.
6. Update `CURRENT_STATE.md` truthfully.
7. Mark a goal complete only when every Definition of Done item is satisfied.

If blocked by an architectural fork, missing authority, credentials, destructive operation, or materially expanded scope, stop and request direction instead of choosing silently.
