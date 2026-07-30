# V0-B Evidence / Session / Verifier / Outcome 预契约研究

```yaml
status: accepted_as_v0_b_contract_input
document_type: precontract_research
version_target: V0_B
date: 2026-07-31
accepted_by_user: 2026-07-31
authoring_owner: current_codex_main_session
active_goal_created: true_after_separate_user_activation
implementation_authorized: true_for_dedicated_v0_b_goal_session_after_Gate_A
real_model_calls_authorized: 0
external_network_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: false
```

> 本报告已被用户接受为正式 V0-B Goal Contract 的研究输入。V0-B 随后经
> 单独用户决定被激活；实现只授权给专用 V0-B Goal Session 并受正式
> Contract Gate A 约束。真实模型调用、外部下载、Pi 修改和实现 Git commit
> 仍未授权。

---

## 1. Executive Decision

### 1.1 Recommendation

**Recommendation.** V0-B 应继续使用已经接受的 Direct
`pi-agent-core` `AgentHarness` 路线，并在 V0-A 基础上增加：

1. 可审计但不承诺跨进程继续执行的脱敏 Session 镜像；
2. 带完整 Run / Attempt / Session / Workspace identity 的 closed-envelope
   Journal；
3. Agent settled 后运行的外部 Verifier；
4. 对 evidence、verifier、infrastructure、budget、user 和 agent
   failure 进行严格区分的单一 terminal Outcome；
5. Artifact externalization、Evidence Index 和安全的 `inspect`；
6. 对 budget、abort 和 terminal reason 的最小记录。

V0-B 不应实现：

- Recovery 或 child Attempt；
- Completion Controller 的恢复决策；
- 跨进程 Resume；
- crash-after-side-effect 自动协调；
- 通用 Durable Runtime；
- OS Sandbox；
- V1 Skill 或 V2 多路径恢复。

### 1.2 Why this is the next bounded Goal

**Fact.** V0-A 已证明正式 Workbench 能完成一次确定性 Coding Task，但其正式
`Outcome` 为 `null`。当前 `workbench/src/run.ts` 仍主要保存 Foundation
Acceptance 工件，尚未形成 V0 Charter 要求的 Session / Journal / Verifier /
Outcome 证据闭环。

**Fact.** G006 已证明真实 Pi Provider、Tool、Session、Observer、settled 和
外部 Verifier 路线可工作；但它的代码和数据结构是 Goal-specific Spike，并不
满足已经接受的 V0 数据合同和 Outcome precedence。

**Conclusion.** 当前缺口不是“Pi 是否能跑”，而是“Workbench 能否把一次运行
变成不可混淆、可复核的环境 Outcome”。这正是 V0-B 的单一责任。

---

## 2. Authority and Verified Baseline

### 2.1 Project control baseline

```yaml
root_git_HEAD: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
tracked_worktree: clean_at_research_start
known_untracked_boundary:
  - reference/
V0_A:
  status: closed_accepted
  disposition: PASS_V0_A_FOUNDATION
  authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
  tests: 32_passed_0_failed_0_skipped
  real_model_calls: 0
  pi_core_patch_count: 0
active_goal: null
```

**Fact.** `CURRENT_STATE.md` 是当前状态权威；V0-B 仍是 next candidate，尚无
正式 Contract、Activation 或实现授权。

### 2.2 Fixed Pi identity

```yaml
path: .upstream/pi
commit: 027a5847901b5dde30270abaa1041046cd2b4b55
describe: v0.82.1-40-g027a5847
package: "@earendil-works/pi-agent-core@0.82.1"
license: MIT
working_tree: clean_at_research_start
```

### 2.3 Binding documents

- `CURRENT_STATE.md`
- `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`
- `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`
- `docs/第二项目_Codex交接包_2026-07-30/V0_A_GOAL_CONTRACT.md`
- `docs/reports/V0_A_IMPLEMENTATION_REPORT.md`
- `docs/reports/V0_A_CLOSEOUT.md`
- G003 / G005 / G006 已接受的 Contract、Report 与 Closeout
- 固定 Pi 源码和测试

---

## 3. What V0-A Already Provides

| Capability | Current evidence | V0-B treatment |
| --- | --- | --- |
| Task and Strategy preflight | `workbench/src/contracts/preflight.ts` | preserve and extend without weakening zero-side-effect rejection |
| Run / Attempt / Workspace identity | `workbench/src/types.ts`, `workbench/src/run.ts` | evolve to V0-neutral terminal contracts |
| temp-copy Workspace | `workbench/src/workspace/materialize.ts` | reuse |
| path / reparse security | `workbench/src/workspace/path-policy.ts` and accepted correction tests | reuse; no relaxation |
| bounded Tool Profile | `workbench/src/pi/tool-profile.ts` | reuse; project Tool events into Journal and externalize large results |
| public Direct Pi Adapter | `workbench/src/pi/pi-adapter.ts` | extend behind Pi boundary |
| deterministic Faux Coding Task | `fixtures/tasks/v0-a-parse-duration/` | reuse as the first V0-B task source |
| dry-run | CLI and preflight tests | preserve |
| source / workspace digests | `workbench/src/hash.ts`, inventory and acceptance artifacts | incorporate into Evidence Index |

### 3.1 Current V0-A gaps

| Gap | Current fact | V0-B requirement |
| --- | --- | --- |
| Session persistence | runtime uses `InMemorySessionStorage` | persist a reasoning-safe Session evidence mirror |
| Journal | no V0 Journal | append-only JSONL with closed event enum and all four identities |
| Verifier | Foundation Acceptance is not V0 Verifier | execute fixed external Verifier after settled |
| Outcome | formal Outcome is `null` | create exactly one terminal Outcome |
| Invalid semantics | run errors are mainly thrown / marked invalid locally | preserve evidence and apply accepted precedence |
| Evidence Index | V0-A has goal evidence inventory, not per-run V0 index | build per-run index with digests and refs |
| Artifact externalization | bounded Tool output remains inline | externalize outputs that exceed inline budget |
| `inspect` | absent | safe read-only inspection with integrity result |
| Budget / abort | only local command timeout and adapter cleanup | record run/attempt/provider/tool/time budgets and abort terminal reason |
| V1/V2 continuity | V0-A has one Attempt and V0-A-specific names | preserve generic strategy and lineage fields |

---

## 4. Pi Source Findings

### 4.1 Public API sufficiency

**Fact.** `.upstream/pi/packages/agent/src/index.ts` publicly exports:

- `AgentHarness`;
- `Session`;
- `InMemorySessionStorage`;
- `JsonlSessionStorage`;
- `JsonlSessionRepo`;
- Harness event and Session types.

The package exposes only the package root and `./node` as supported emitted
imports in `.upstream/pi/packages/agent/package.json`. V0-B therefore does not
need a private source import.

### 4.2 Session persistence capability

**Fact.** `.upstream/pi/packages/agent/src/harness/session/jsonl-storage.ts`
defines public `JsonlSessionStorage.create()`, `open()`, `appendEntry()` and
`getEntries()`. It writes a version-3 JSONL header and appends Session tree
entries.

**Fact.** `.upstream/pi/packages/agent/test/harness/storage.test.ts` proves:

- creation writes the Session header;
- metadata round-trips;
- existing entries reopen;
- the active leaf is reconstructed;
- malformed header/entry failures are classified.

**Fact.** `.upstream/pi/packages/agent/test/harness/session.test.ts` runs the
same Session behavior suite over in-memory and JSONL storage.

**Boundary.** Raw Pi JSONL contains the full `AgentMessage`. When the Provider
emits a `thinking` block or thought signature, direct raw persistence can violate
the accepted rule that reasoning bodies must not enter Workbench evidence.
Pi does not expose a dedicated persistence-redaction hook before every Session
message append.

### 4.3 Lifecycle and event capability

**Fact.** In
`.upstream/pi/packages/agent/src/harness/agent-harness.ts`:

- `handleAgentEvent()` appends `message_end` to Session before forwarding the
  event;
- it flushes pending Session writes at `turn_end` and `agent_end`;
- it emits `settled` after the run reaches its external settled boundary;
- `waitForIdle()` covers the run promise;
- `abort()` aborts the current run, waits for idle, and emits an abort event;
- `subscribe()` and typed `on()` hooks are public.

**Fact.**
`.upstream/pi/packages/agent/test/harness/agent-harness.test.ts` proves:

- awaited listeners are included before `waitForIdle()` resolves;
- public `tool_call` and `tool_result` hooks receive correlated call IDs;
- Tool Result usage can be observed and projected.

**Fact.** `.upstream/pi/packages/agent/src/harness/types.ts` exposes events for:

- `before_provider_request`;
- `after_provider_response`;
- `tool_call`;
- `tool_result`;
- `save_point`;
- `abort`;
- `settled`;
- underlying Agent lifecycle messages.

**Conclusion.** Pi already provides the minimum lifecycle facts required by
V0-B. Outcome semantics and evidence validation remain Workbench
responsibilities.

### 4.4 What Pi does not prove for V0-B

Pi source and tests do not prove:

- that Workbench evidence is reasoning-safe;
- that Journal identities match Workbench Run/Attempt/Workspace;
- that an external Verifier is correct;
- that verifier failure is distinct from verifier infrastructure failure;
- that per-run artifacts are immutable or complete;
- that the accepted Outcome precedence is applied;
- that a future process can resume this Workbench Run.

These are not Pi Core defects. They belong to the Workbench Adapter and
Coordinator boundary.

---

## 5. G006 Reuse Review

### 5.1 Reuse matrix

| G006 component | Useful evidence or pattern | V0-B decision |
| --- | --- | --- |
| `observer.ts` | projects public Provider/Tool/assistant/settled events | adapt the pattern; add V0 identities and closed event mapping |
| `journal.ts` | append-only JSONL and monotonic in-process seq | rewrite contract shape; G006 lacks Attempt and Workspace IDs |
| `session-storage.ts` | keeps runtime reasoning in memory while writing a redacted Session file | adapt the dual-state idea; use public Session contracts and verify the evidence mirror can reopen |
| `verifier.ts` | runs an external process after settled | rewrite status semantics; timeout/contract errors must be `invalid`, not `failed` |
| `runtime-utils.ts` | collision-safe `wx` JSON writes and process execution | port only small reviewed helpers; add double-settlement guards and project tests |
| `provenance.ts` | source identity and digest evidence | reuse concepts; remove G006 path assumptions |
| `attribution.ts` | prevents route/setup failures from being called task failures | do not reuse taxonomy as V0 Outcome taxonomy |
| `driver.ts` | end-to-end ordering and secret scan | use as evidence; do not make Workbench depend on the Goal-specific driver |

### 5.2 Important non-reuse decisions

1. G006 Journal schema v2 is not the accepted V0 Journal schema.
2. G006 `VerificationResult` has only `passed|failed`; V0 requires
   `passed|failed|invalid`.
3. G006 verifier stores bounded stdout/stderr in one JSON object rather than a
   separate full-output ArtifactRef.
4. G006 redacted Session file was not itself used to prove continuation and
   should not be advertised as a durable Resume store.
5. G006 hard-codes DeepSeek, one task, pair identities and recovery behavior;
   V0-B must remain Task/Strategy-neutral and recovery-free.

**Recommendation.** Reuse mechanisms only after they are brought under V0 data
contracts and tests. This is permitted internal project reuse, not an external
module port.

---

## 6. Recommended Session Design

### 6.1 Chosen design

V0-B should use a project-owned `SessionStorage` adapter with two coordinated
views:

```text
AgentHarness
  → runtime SessionStorage: complete in-process Agent state
  → evidence SessionStorage: append-only, reasoning-safe JSONL mirror
```

The runtime view preserves the complete message state needed by the current
Agent Loop. The evidence view removes:

- `thinking` body text;
- thinking signatures / opaque thought signatures;
- raw Provider payloads and authorization material;
- unbounded Tool Result bodies.

It retains:

- Session header and identity;
- entry ID, parent ID, type and timestamp;
- user and assistant visible text within an explicit budget;
- Tool Call ID/name and safe input projection;
- Tool Result ID/name/error state and bounded result projection;
- usage/cost metadata when available;
- redaction metadata such as count and byte length, never reasoning content.

### 6.2 Required validation

The dedicated implementation must prove:

1. Runtime and evidence mirrors have the same Session ID.
2. Every evidence entry can be parsed by public
   `JsonlSessionStorage.open()`.
3. Tool Call and Tool Result IDs pair correctly.
4. Parent linkage is valid for the single V0-B branch.
5. The evidence file contains no reasoning body, thought signature, API key or
   authorization header.
6. A persistence failure stops valid task attribution and yields
   `invalid/evidence`.

### 6.3 Explicit non-claim

The evidence mirror is:

```yaml
auditable: true
reopenable_for_read_and_integrity_check: true
runtime_resume_capable: false
cross_process_continuation_proven: false
```

Calling it “Session persistence” means persistence for evidence and inspection,
not a promise of durable execution continuation.

---

## 7. Journal and Artifact Design

### 7.1 Journal envelope

Every entry must use:

```yaml
schema_version: 1
seq: positive_integer
timestamp: rfc3339
type: closed_event_enum
run_id: string
attempt_id: string
session_id: string
workspace_id: string
data: object
```

`data` must reject reserved outer keys, including `type`, `seq`, `run_id`,
`attempt_id`, `session_id` and `workspace_id`.

### 7.2 Minimum closed event enum for V0-B

```yaml
run:
  - run_started
  - run_terminal
attempt:
  - attempt_started
  - attempt_settled
  - attempt_aborted
  - attempt_error
workspace:
  - workspace_materialized
  - workspace_finalized
session:
  - session_linked
  - session_entry_persisted
provider:
  - provider_request_started
  - provider_response_observed
tool:
  - tool_call_started
  - tool_call_completed
  - tool_call_error
  - tool_call_aborted
verifier:
  - verifier_started
  - verifier_completed
evidence:
  - evidence_validation_completed
outcome:
  - outcome_created
```

V0-B does not add `policy_decision`, `continuation_queued` or recovery events;
those belong to V0-C.

### 7.3 ArtifactRef

The implementation should freeze one minimal ArtifactRef:

```yaml
artifact_ref:
  path: run_relative_path
  sha256: sha256
  size_bytes: integer
  media_type: string
  truncated: boolean
```

Rules:

- path is relative to the Run evidence root;
- canonical resolution must stay inside that root;
- ArtifactRef target must exist and match digest/size during evidence
  validation;
- large Tool/Verifier output is written once and referenced from Journal or
  result objects;
- no Report text can backfill a missing runtime event or artifact.

### 7.4 Mutability model

V0-B should distinguish:

- append-only original events and Session evidence;
- write-once Verifier Result, Outcome and referenced artifacts;
- current-state Run/Attempt records that may be atomically replaced while the
  Run is active, but become immutable after terminalization.

The Evidence Index is generated only after all deterministic terminal artifacts
except the index itself have been finalized. `outcome.json` is created exactly
once.

To avoid a digest cycle, `Outcome.evidence_index_ref` should be a validated
run-relative path reference rather than a full digest-bearing ArtifactRef. The
final Evidence Index may then include the `outcome.json` digest while excluding
its own digest. This is a field-level refinement allowed by V0 Charter section
6; it does not change the binding responsibility that Outcome must point to its
Evidence Index.

The implementation should write a small `terminal-record.json` last, containing
the Outcome and Evidence Index digests. `inspect` treats a Run as committed
terminal evidence only when that marker and both digests agree. This is a
bounded two-artifact commit marker, not a general transaction or crash-recovery
platform.

---

## 8. External Verifier Design

### 8.1 Authority boundary

The Verifier:

- runs only after an observed `settled`;
- lives outside the materialized Workspace;
- is not in Agent write scope;
- has a fixed ID and SHA-256;
- runs with fixed executable/argv/cwd/env/timeout;
- is not an Agent self-evaluation;
- produces a bounded summary plus a full-output artifact and digest.

### 8.2 Status rules

```yaml
passed:
  condition: verifier_process_completed_and_acceptance_passed
failed:
  condition: verifier_process_completed_validly_and_acceptance_failed
invalid:
  condition:
    - verifier_missing
    - verifier_digest_mismatch
    - spawn_failure
    - timeout
    - output_contract_failure
    - output_budget_exceeded_before_complete_capture
```

Verifier timeout or contract failure must never be mapped to
`failed/agent`.

### 8.3 First deterministic task

**Recommendation.** Reuse
`fixtures/tasks/v0-a-parse-duration/` as the Task source, but create a new
V0-B-owned verifier outside that source tree. The Agent may run the public
`test` command; the Workbench must subsequently run its own external verifier.

The V0-B verifier should include the accepted requirements and additional
boundary cases without revealing an expected implementation. It must not depend
on `spikes/pi-runtime/g006/` at runtime.

---

## 9. Outcome and Evidence Validity

### 9.1 Binding precedence

V0-B must implement the accepted V0 Charter order:

1. Missing/conflicting Run, Attempt, Session, Journal, Workspace or Artifact
   evidence → `invalid/evidence`.
2. Verifier unable to run, timeout or contract error →
   `invalid/verifier`.
3. Infrastructure prevents a valid task conclusion →
   `invalid/infrastructure`.
4. User cancellation before a valid conclusion → `cancelled/user`.
5. A hard budget ends the run with complete evidence → `failed/budget`.
6. Valid Verifier pass with complete evidence → `passed/null`.
7. Valid Verifier failure with no V0-B recovery → `failed/agent`.

Evidence validation must precede task attribution. Implementation must not rely
on enum sorting to encode causality.

### 9.2 Exactly one terminal Outcome

Every completed V0-B Run must have:

- one `outcome.json`;
- one final Attempt;
- `attempt_count: 1`;
- `parent_attempt_id: null`;
- `recovery_triggered: false`;
- a valid Evidence Index reference.

An exception before terminalization must be converted into an auditable invalid
Outcome whenever the evidence root itself is safely writable. If even the
evidence root cannot be established, the CLI may fail pre-run and must not claim
that a Run occurred.

### 9.3 Deterministic counterexample matrix

| Case | Expected top-level result |
| --- | --- |
| valid settled + valid verifier pass | `passed/null` |
| valid settled + valid verifier task failure | `failed/agent` |
| verifier timeout/missing/digest mismatch | `invalid/verifier` |
| Session write or Journal identity failure | `invalid/evidence` |
| runtime/infrastructure failure with incomplete safe attribution | `invalid/infrastructure` or `invalid/evidence` according to the concrete cause |
| complete hard-budget stop before pass | `failed/budget` |
| explicit user cancellation before conclusion | `cancelled/user` |

At least the pass, agent-failure, verifier-invalid and evidence-invalid paths
must execute as end-to-end deterministic tests. Budget and user-cancel paths may
be tested at the Coordinator/Outcome level if an end-to-end trigger would add
unrelated process complexity.

---

## 10. Budget, Abort and Terminal Reason

### 10.1 V0-B minimum budget dimensions

Each Run/Attempt must snapshot and report:

- provider request limit and usage;
- Tool call limit and usage;
- wall-clock limit and usage;
- model token/cost limit and observed usage when available;
- Verifier timeout/output cap;
- external real-model call count.

The deterministic Faux route must report external model calls as exactly zero.

### 10.2 Abort rule

`AgentHarness.abort()` is a public cooperative abort boundary. V0-B must record:

- abort requested;
- whether idle/settled cleanup completed;
- last complete Journal seq;
- outstanding Tool Call IDs if any;
- final Workspace digest if safely obtainable.

V0-B does not claim OS-level process-tree kill or exactly-once Tool execution.
If cleanup leaves side effects or evidence uncertain, the run is invalid rather
than automatically retried.

### 10.3 Timeout attribution

- complete, policy-defined Agent wall-budget stop with trustworthy counters:
  `failed/budget`;
- uncertain cancellation, lost process state or incomplete evidence:
  `invalid/infrastructure` or `invalid/evidence`;
- Verifier timeout: `invalid/verifier`.

---

## 11. `inspect` Boundary

`workbench inspect <run-id>` should:

- locate only a syntactically valid Run ID beneath the configured `.runs` root;
- validate Outcome, Evidence Index, ArtifactRefs and key identity links;
- display Task, Strategy, Run, Attempt, Session, Workspace, Verifier, budget,
  terminal reason, failure class and artifact paths;
- display redaction/truncation flags;
- default to summaries rather than full large artifacts;
- never print credentials, raw Provider payloads or reasoning bodies;
- return a non-zero exit code for missing, malformed or integrity-invalid
  evidence.

V0-B needs only one-Run inspection. Comparison views, dashboards and statistical
reports remain out of scope.

---

## 12. Optional Real-route Smoke

### 12.1 Authorization boundary

The accepted V0 Charter sets a V0-B ceiling of:

```yaml
max_authorized_runs: 1
purpose: real_route_smoke
cost_cap_usd: 1
```

This ceiling is not current authorization. The draft Contract should use two
stages:

1. Stage 1: implementation and deterministic Faux validation, zero real calls;
2. Stage 2: at most one real-route smoke, only after separate user authorization.

### 12.2 Acceptance effect

**Recommendation.** V0-B foundation acceptance should be possible after all
deterministic Gates pass. If Stage 2 is not authorized, the Closeout must state
that V0-B’s own real-route evidence is unverified while preserving G006 as
historical route evidence.

If Stage 2 is authorized, it is observe-only:

- one Run;
- one Attempt;
- zero Recovery;
- fixed task/model/provider/thinking/tool/verifier identities;
- hard $1 ceiling;
- no automatic retry;
- no `.env` or secret persistence.

This avoids mixing V0-B evidence correctness with V0-C recovery behavior.

---

## 13. V1 / V2 Continuity

V0-B must preserve:

- generic `strategy_id`;
- `comparison_group_id`;
- Attempt ordinal and `parent_attempt_id`;
- Attempt-level Session and Workspace references;
- separate base prompt, Task instruction and future Skill identities;
- shared Verifier and Outcome contracts across strategies;
- immutable evidence suitable for future diagnosis.

V0-B must not create:

- a `baseline/candidate`-only schema;
- a one-Session-per-Run invariant;
- a same-Workspace-per-child invariant;
- a Recovery-specific Outcome schema;
- Experience, Promotion or Routing stores.

Thus V0-C can add a same-session child Attempt, V1 can add Skill-only Strategy,
and V2 can add clean-session/new-Workspace child Attempts without rewriting the
core lineage.

---

## 14. Recommended V0-B Contract Scope

### 14.1 In scope

- extend V0-A contracts to V0-neutral Run/Attempt/Session/Verifier/Outcome;
- add a reasoning-safe Session evidence mirror;
- add Journal V0 and event projection;
- add ArtifactRef and output externalization;
- add external Verifier Runner;
- add evidence validator and accepted Outcome precedence;
- add budget/abort/terminal reason records;
- add `inspect`;
- add deterministic pass/fail/invalid validation;
- update Workbench README and tests;
- produce Implementation Report, Closeout Draft, evidence index, source delta,
  commands/exit codes and `CURRENT_STATE_UPDATE_PROPOSAL`.

### 14.2 Out of scope

- Recovery, continuation prompts or child Attempts;
- real-model use without a second authorization;
- Pi patch/private import;
- dependency/network download;
- Worktree;
- cross-process Resume;
- crash reconciliation/transactions;
- general sandbox;
- external module port;
- Skill, Subagent, Multi-Agent, MCP, SQLite, UI, V2/V3 systems;
- Git commit by the dedicated Session;
- control-state modification by the dedicated Session.

---

## 15. Risks and Pause Conditions

The dedicated Session must pause if:

1. public Pi APIs cannot support the Session/Event path without a Pi patch or
   private import;
2. reasoning or credentials enter persisted evidence;
3. the external Verifier is inside Agent write scope;
4. verifier infrastructure failure cannot be distinguished from task failure;
5. Journal/Session/Tool identities cannot be reconciled;
6. a terminal Outcome would need Report backfill;
7. V0-A path-security boundaries must be weakened;
8. V0-B requires recovery, cross-process Resume or a general durability layer;
9. a real Provider would be called without the second authorization;
10. dependency download, registry access or external module port becomes
    necessary;
11. the implementation owner would need to modify control-state documents or
    create a Git commit.

---

## 16. Accepted Decisions and Remaining Authority

```yaml
accepted_decisions:
  - decision: accept_or_revise_v0_b_contract
    evidence: V0-A leaves formal Outcome null; Pi and G006 prove the required public mechanism
    accepted_value: accept
    consequence: the V0-B Contract is formal

  - decision: authorize_v0_b_activation_and_control_baseline
    evidence: project governance requires a committed active-goal control baseline before specialist execution
    accepted_value: authorize
    consequence: a dedicated V0-B Goal Session can then start from an exact clean commit

user_decisions_required:
  - decision: authorize_v0_b_real_route_smoke
    evidence: G006 proves the real route, while V0-B-specific evidence contracts are not yet exercised on it
    options:
      - defer_until_stage_1_review
      - pre_authorize_one_run_under_one_dollar
      - omit_from_v0_b
    recommendation: defer_until_stage_1_review
    consequence: Stage 1 remains deterministic and zero-cost; user retains explicit control of credentials and spend
```

---

## 17. Final Assessment

```yaml
v0_b_needed: true
single_architecture_unknown: can_the_formal_workbench_turn_one_settled_attempt_into_a_valid_auditable_outcome
pi_route: sufficient_without_core_patch
g006_reuse: selective_internal_adaptation_only
recovery_in_v0_b: false
cross_process_resume_in_v0_b: false
real_model_now: false
recommended_next_control_action:
  - create_and_verify_V0_B_control_baseline
  - start_dedicated_V0_B_goal_session
  - execute_deterministic_Stage_1_only
```

**Conclusion.** V0-B is a bounded evidence-and-attribution Goal, not another Pi
feasibility Spike and not V0-C in disguise. Its success condition is that one
settled Coding Attempt produces a trustworthy external Outcome, including
correct invalidation when the evidence or Verifier is not trustworthy.
