# V0-C Bounded Completion Precontract Research

```yaml
report_status: complete_pending_main_session_review
report_role: advisory_precontract_research
recommended_disposition: READY_FOR_MAIN_SESSION_CONTRACT_DRAFTING
root_control_commit: bb4d1023d9359a5b4172e9ce2e3c9332a6a917be
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_b_implementation_baseline: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
v0_b_closeout_commit: 2f05713ccda4ea9145cc948fb4b3ac6f0ebd3768
active_goal: false
goal_contract_created: false
source_modified: false
control_state_modified: false
tests_or_builds_run: false
real_model_calls: 0
external_network_calls: 0
dependency_installs: 0
pi_core_patches: 0
git_commits: 0
```

## 1. Executive Decision Summary

**Fact.** 固定 Pi 的 public Direct `AgentHarness` 路径足以支持 V0-C 所需的
same-process、same-session、settled 后一次 continuation。Pi
`AgentHarness.prompt()` 只在非 `idle` 时拒绝；`agent_end` 会把 phase 恢复为
`idle` 并发出 `settled`；下一次 `prompt()` 从同一个 `Session` 构建新 turn。
Pi 自己不需要 patch 或 private import。

**Fact.** G003 已在固定 Pi 上用同一 Harness、同一 Session、同一 Workspace
执行：

```text
initial prompt
→ settled
→ external verifier failed
→ bounded recovery prompt
→ settled
→ external verifier passed
```

G006 则证明真实 Provider / Tool / Session / settled / external Verifier 路线可行，
但 Candidate 首次通过，因此没有触发 Recovery。两者合起来证明“机制可组合”，
不证明真实 Recovery 已观察到或 Completion Policy 有效。

**Fact.** V0-B 的单 Attempt 假设分布在多个层，不是只改一个 tuple type：

- `StrategySpecV0B` 只允许 `observe_only/none`；
- `RunRecordV0B.attempt_ids` 是单元素 tuple；
- `AttemptRecordV0B` 写死 `ordinal: 1`、`parent_attempt_id: null`；
- `OutcomeV0B` 写死 `attempt_count: 1`、`recovery_triggered: false`；
- `JournalWriterV0B` 在构造时固定一个 `attempt_id`；
- Pi Adapter 每次调用内部新建并销毁 Harness；
- Verifier、Attempt、Tool Result artifact 使用单实例固定路径；
- terminal scan、Evidence Index 和 Inspector 写死单 Attempt 文件集合；
- `buildOutcomeV0B()` 只有一个 Verifier 状态输入。

**Recommendation.** 不改写 accepted V0-B 历史合同和 Inspector。V0-C 应增加一条
版本化、可并存的 V0-C 路径，复用已经审计过的 artifact/path/secret/verifier
基础能力，同时新增：

1. V0-C contracts/preflight；
2. Run-level Completion Controller；
3. 能保留同一 Harness/Session 的 V0-C Pi execution handle；
4. per-entry Attempt identity 的 V0-C Journal；
5. per-Attempt artifact layout；
6. 动态但封闭的 terminal scan/Evidence Index policy；
7. V0-C Outcome Builder 和 Inspector。

**Recommendation.** V0-C Stage 1 可以继续保持零真实模型调用，并用 Faux
Provider 完整覆盖 policy branches。由于治理规则要求 Stage 2 使用冻结产品且
不得临场改源码，Stage 1 必须同时交付一个“只做离线/零调用验证”的正式 real
provider product route；Stage 2 以后只注入单独授权的配置/凭据和任务，不再改
实现。

**Recommendation.** 可以进入主 Session Contract drafting。当前没有必要为
Pi、Claude Code 源码镜像、跨进程 Resume、crash durability 或外部论文再开一个
前置研究 Goal。

## 2. Gate A Identity

| Check | Result |
| --- | --- |
| Root HEAD | exact `bb4d1023d9359a5b4172e9ce2e3c9332a6a917be` |
| Root tracked diff | clean |
| Allowed untracked inputs | `docs/reports/V0_C_PRECONTRACT_RESEARCH_START_PROMPT.md`, registered `reference/` |
| Active Goal | `null` |
| V0-C authority | precontract research only |
| V0-C Contract | not created / not authorized |
| Implementation | not authorized |
| Real model calls | 0 authorized / 0 observed |
| Pi HEAD | exact `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pi worktree | clean |

没有命中身份 Pause Condition。

## 3. Evidence and Authority Map

### 3.1 Binding project facts

| Question | Authority |
| --- | --- |
| V0 Completion / Attempt / Outcome semantics | accepted `V0_VERSION_CHARTER.md` §§5–9, 13.3, 14–17 |
| Current V0-B behavior | accepted source at `7e0d8f7...`, tests, `V0_B_CLOSEOUT.md` |
| V0-B evidence integrity boundary | `V0_B_INDEPENDENT_REAUDIT_REPORT.md` and current shared writer/Inspector policy |
| deterministic same-session recovery | G003 source, Report and Closeout |
| real Provider route, no-recovery initial pass | G006 source, Report and Closeout |
| current Pi behavior | `.upstream/pi` source/tests at `027a5847...` |

### 3.2 Design references

`cc-harness-knowledge` reinforces these transferable invariants:

- capability、permission、execution 和 evidence 是不同状态；
- Recovery 应是显式 transition，而不是无界 retry wrapper；
- Continue transition 与 terminal reason 应分开；
- 每条 Recovery 需要 failure class、state repair、side-effect policy、budget
  和 terminal condition；
- Tool Call/Result pairing 必须跨 continuation 保持；
- Session transcript、runtime state、external Workspace state 不是同一个
  source of truth；
- persistent metadata 不等于 durable executor；
- 没有统一 Exactly-once ledger 时，不应盲目重放副作用。

这些是设计参考，不证明 Pi 或 Workbench 已实现相应能力。本研究没有进入
`reference/src/`：知识笔记、固定 Pi 源码和当前 Workbench 已足够回答 V0-C
决策，源码镜像细节不会改变当前建议。

## 4. V0-B → V0-C Source and Symbol Delta

### 4.1 单 Attempt 假设的位置

| Path / Symbol | Current fact | V0-C need |
| --- | --- | --- |
| `workbench/src/contracts/v0b-types.ts` `StrategySpecV0B` | only `observe_only`, `none` | add versioned V0-C strategy union |
| same, `RunRecordV0B.attempt_ids` | `[string]` | one or two ordered IDs |
| same, `AttemptRecordV0B` | ordinal 1, null parent, initial trigger | ordinal 1/2; child parent/trigger |
| same, `OutcomeV0B` | count 1, recovery false | count 1/2 and initial/final verifier statuses |
| `preflight-v0b.ts` `preflightV0B` | rejects every non-observe strategy; recovery budget 0 | V0-C preflight freezes 0/1 policy and budgets |
| `run-v0b.ts` `executeV0BRun` | creates one attempt/session/workspace and terminalizes once | Run Coordinator loops at most two Attempts |
| `evidence/journal.ts` `JournalWriterV0B` | one fixed Attempt identity | per-entry current Attempt identity with fail-closed switch |
| `pi/pi-adapter-v0b.ts` `runPiEvidenceCycleV0B` | constructs Harness inside one call and unsubscribes | persistent V0-C handle with `runAttempt()` |
| `session/evidence-session.ts` | metadata and persist callback bind initial attempt | Session metadata becomes Run-level; persist projection uses active Attempt |
| `verifier/runner.ts` `runExternalVerifierV0B` | writes fixed `artifacts/verifier-output.txt` | attempt-scoped output/result paths |
| `outcome/builder.ts` `buildOutcomeV0B` | one verifier signal | ordered attempt results + policy decision |
| `terminal-policy.ts` | exact static single-Attempt paths/scopes | closed dynamic set derived from attempt IDs |
| `inspect-v0b.ts` `inspectRunV0B` | requires `attempt.json`, exactly one ID | separate V0-C Inspector validates 1/2 lineage |
| `cli.ts` | hard-coded V0-B strategy dispatch | explicit V0-C strategy/product route |

Tests that explicitly preserve the V0-B boundary include:

- `workbench/tests/v0b-preflight.test.ts` — recovery budget 0 and
  `observe_only/none`;
- `workbench/tests/v0b-e2e.test.ts` — zero child/recovery and attempt count 1;
- `workbench/tests/v0b-outcome.test.ts` — count 1 and recovery false;
- `workbench/tests/v0b-post-audit.test.ts` — exact terminal suffix and evidence
  integrity mutation rejection.

### 4.2 Recommended source organization

**Recommendation.** Preserve V0-B entry points and accepted evidence replay.
Prefer additive versioned V0-C modules:

```text
workbench/src/contracts/v0c-types.ts
workbench/src/contracts/preflight-v0c.ts
workbench/src/completion/controller-v0c.ts
workbench/src/completion/failure-packet-v0c.ts
workbench/src/pi/pi-adapter-v0c.ts
workbench/src/evidence/journal-v0c.ts
workbench/src/evidence/terminal-policy-v0c.ts
workbench/src/outcome/builder-v0c.ts
workbench/src/inspect-v0c.ts
workbench/src/run-v0c.ts
```

Small shared refactors are legitimate where duplication would create two
security policies, especially:

- bounded verifier process execution with caller-supplied attempt-scoped paths；
- Session sanitization/redaction；
- ArtifactRef/path validation；
- secret scan primitives.

Every refactor must leave `executeV0BRun`/`inspectRunV0B` and their accepted
regressions behaviorally unchanged. Do not rename historical V0-B files or
rewrite old `.runs/v0-b/` evidence.

### 4.3 Recommended artifact layout

```text
.runs/v0-c/runs/<run-id>/
  config/
  run.json
  workspace/
  evidence/workspace.json
  evidence/session-ref.json
  session/evidence.jsonl
  journal/events.jsonl
  attempts/
    01-<initial-attempt-id>/
      attempt.json
      workspace-state.json
      verifier-result.json
      verifier-output.txt
      validation.json
      tool-results/
    02-<child-attempt-id>/
      attempt.json
      failure-packet.json
      failure-packet-agent-projection.json
      workspace-state.json
      verifier-result.json
      verifier-output.txt
      validation.json
      tool-results/
  evidence/secret-scan.json
  evidence/abort.json
  outcome.json
  evidence-index.json
  terminal.json
```

The exact spelling is Contract-level, not Charter-level. The invariant is that
per-Attempt outputs cannot overwrite each other and the final Index has one
closed expected set derived from `run.attempt_ids`.

## 5. Pi Same-session Continuation Call Chain

### 5.1 Fixed Pi source

At pinned source:

```text
AgentHarness.prompt()
  → requires phase === "idle"
  → createTurnState()
      → Session-backed context
  → executeTurn()
      → runAgentLoop()
      → handleAgentEvent()
          → message_end persists messages
          → agent_end flushes writes
          → phase = "idle"
          → emits settled
```

Evidence:

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`
  - `createTurnState` line 354；
  - `handleAgentEvent` line 538；
  - `agent_end` / `settled` lines 557–561；
  - `executeTurn` line 581；
  - `prompt` line 658；
  - `waitForIdle` line 1054.
- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`
  - “abort ... preserves next-turn messages” calls `prompt("first")`, aborts,
    then calls `prompt("second")` and confirms prior Session context；
  - “settles thrown hook failures ...” confirms a settled Harness accepts a
    later prompt；
  - “waitForIdle waits ...” confirms awaited listener/settlement ordering.
- `.upstream/pi/packages/agent/test/harness/session.test.ts`
  - Session appends/builds ordered context；
  - moving/appending branches and storage-backed reconstruction are separately
    tested.

### 5.2 G003 mechanism evidence

`spikes/pi-runtime/g003/driver.ts` `runVariant` creates one `AgentHarness` and
one Session. It performs the initial `harness.prompt(INITIAL_PROMPT)`, external
verification, then—only for Candidate—calls the same
`harness.prompt(RECOVERY_PROMPT)` and asserts Session ID stability. G003 Report
records two prompts, four Faux calls and two Verifiers for Candidate.

### 5.3 Adapter responsibility

Pi owns:

- Session message/tree persistence through the injected `Session`；
- turn context construction；
- Tool loop and Tool Call/Result protocol；
- busy/idle lifecycle, abort and settled event.

Workbench must own:

- Attempt identity and active Attempt switch；
- policy eligibility and recovery budget；
- Failure Packet construction/projection；
- per-Attempt Verifier ordering；
- cumulative budgets；
- Run-level terminal Outcome and evidence completeness.

**Recommendation.** V0-C Adapter should expose a long-lived handle similar to:

```ts
interface PiRunHandleV0C {
  sessionId: string;
  workspaceId: string;
  runAttempt(input: {
    attemptId: string;
    prompt: string;
    budget: AttemptBudget;
  }): Promise<Settlement>;
  abort(): Promise<AbortEvidence>;
  close(): Promise<void>;
}
```

The handle is created once per Run and closed only after the Completion
Controller reaches a terminal decision.

### 5.4 Explicitly out of scope

This proves only same-process settled continuation. It does not add:

- cross-process Session reconstruction；
- in-flight crash recovery；
- replay of partially persisted Tool side effects；
- Exactly-once semantics.

## 6. Attempt Lineage Candidate Contract

```yaml
initial_attempt:
  ordinal: 1
  parent_attempt_id: null
  trigger: initial

child_attempt:
  ordinal: 2
  parent_attempt_id: initial_attempt_id
  trigger: verifier_failure

same_session_recovery:
  run_id: unchanged
  strategy_id: unchanged
  session_id: unchanged
  workspace_id: unchanged
  attempt_id: new
```

Rules:

1. `run.attempt_ids` is ordered and length is exactly 1 or 2；
2. ordinals are contiguous and unique；
3. child may exist only for `verify_recover_once_same_session`；
4. child requires a valid failed initial Verifier and a valid Failure Packet；
5. no third Attempt ID can be allocated；
6. a started child remains represented even if it ends invalid/aborted；
7. every Journal entry carries the active `attempt_id`；
8. each Attempt has exactly one terminal Agent route and, only when settled,
   exactly one Verifier result；
9. `Outcome.final_attempt_id` is the last evaluated Attempt；
10. the Run has exactly one `outcome_created` and one `run_terminal`.

This contract preserves V1 because `strategy_id` remains arbitrary, not
baseline/candidate-coded. It preserves V2 because a future clean-session child
can change `session_id`/`workspace_id` without changing `parent_attempt_id`
semantics.

## 7. Completion Controller

### 7.1 State model

```text
planned
→ initial_running
→ initial_settled
→ initial_verifying
→ initial_validated
→ policy_deciding
   ├─ terminal
   └─ child_reserved
      → failure_packet_committed
      → child_running
      → child_settled
      → child_verifying
      → child_validated
      → terminal
```

`child_reserved` must atomically consume the one Recovery slot before a child
Attempt starts. If the reservation or Failure Packet persistence fails, no
child starts and the Run fails closed as invalid evidence/infrastructure
according to the observed cause.

### 7.2 Decision table

| Initial observation | Other gates | Decision |
| --- | --- | --- |
| evidence invalid | any | `invalid/evidence`; no child |
| Verifier invalid | evidence valid | `invalid/verifier`; no child |
| infrastructure blocked before valid task conclusion | evidence valid | `invalid/infrastructure`; no child |
| user cancelled | no prior terminal | `cancelled/user`; no child |
| any hard budget exhausted | counters valid | `failed/budget`; no child |
| Verifier passed | all valid | `passed`; no child |
| Verifier failed + `observe_only` | all valid | `failed/agent`; no child |
| Verifier failed + recovery strategy | slot 1, start reserve sufficient, packet valid | reserve slot, create one child |
| Verifier failed + recovery strategy | no slot/reserve/packet | terminal according to budget or invalid cause |

Child decision:

| Child observation | Decision |
| --- | --- |
| evidence invalid | `invalid/evidence` |
| Verifier invalid | `invalid/verifier` |
| infrastructure blocked | `invalid/infrastructure` |
| user cancelled | `cancelled/user` |
| hard budget exhausted before valid pass | `failed/budget` |
| Verifier passed | `passed/null` |
| Verifier failed | `failed/agent` |

No child branch may re-enter policy eligibility.

### 7.3 Ordering and fail-closed invariants

Eligibility order:

```text
attempt settled?
→ Attempt evidence valid?
→ Verifier execution valid?
→ user cancellation?
→ cumulative budget valid and child-start reserve available?
→ verifier pass/fail?
→ strategy allows recovery?
→ Recovery slot available?
→ Failure Packet valid/persisted/scanned?
→ child starts
```

The final Outcome continues to use accepted Charter causal precedence:
evidence → verifier/infrastructure → user → budget → task result. A valid
initial failure is not yet Run-terminal when a child was validly reserved.

Contract should freeze:

- `attempt_limit = 2`；
- `recovery_slot_limit = 1`；
- cumulative Run caps；
- per-Attempt allocations；
- a numeric `minimum_child_start_reserve` for provider requests, Tool calls,
  wall time, Verifier time/output and cost/token caps；
- whether a budget exhausted *inside* child ends as `failed/budget`
  (recommended: yes, if evidence counters are valid).

Duplicate child allocation, duplicate Verifier, terminal event before final
validation or event after `run_terminal` must be rejected by writer and
Inspector.

## 8. Bounded Failure Packet

### 8.1 Evidence object

```yaml
schema_version: 1
failure_packet_id: string
run_id: string
parent_attempt_id: string
child_attempt_id: string
verifier:
  verifier_id: string
  verifier_sha256: sha256
  status: failed
  result_ref: artifact_ref
  result_sha256: sha256
failure_summary: bounded_string
failed_checks:
  - bounded_string
workspace_digest: sha256
budget_remaining: bounded_object
agent_projection_sha256: sha256
created_at: rfc3339
```

### 8.2 Agent-visible projection

The Agent should receive a separately serialized projection:

```yaml
type: verifier_failure
parent_attempt_id: string
verifier_id: string
failure_summary: bounded_string
failed_checks: []
instruction: repair_the_task_then_finish
```

It must not include:

- credential、authorization header、reasoning body/signature；
- hidden expected implementation；
- writable or absolute Verifier path；
- unbounded stdout/stderr；
- raw ArtifactRef that grants new read authority；
- unverified free text from infrastructure stderr.

Recommended hard bounds:

- serialized agent projection: at most 8 KiB UTF-8；
- summary: at most 2,000 characters；
- failed checks: at most 32, each at most 256 characters；
- stable JSON serialization and SHA-256；
- full Verifier output remains an evidence Artifact outside Agent write/read
  scope.

### 8.3 Visibility decision

**Recommendation.** For V0-C, automatic recovery is eligible only when:

1. `acceptance_visibility` is `public_external`; or
2. TaskSpec freezes a separate safe `agent_feedback` projection contract and
   digest.

Do not forward the current raw Verifier `summary` from hidden acceptance by
default. If no safe projection exists, a failed hidden Verifier ends without
automatic recovery. This is a Contract decision the main Session should make
explicitly.

Malformed, missing, oversized, digest-mismatched or scan-rejected Packet means
no child Attempt and fail-closed terminalization; Report prose cannot repair it.

## 9. Evidence, Verifier and Outcome

### 9.1 Per-Attempt sequence

```text
attempt_started
→ Agent/Tool/Session events
→ attempt_settled
→ workspace_attempt_snapshot
→ verifier_started
→ verifier_completed
→ attempt_evidence_validated
→ policy_decided
```

Verifier is forbidden on error/abort routes that never settled.

### 9.2 Recovery sequence

```text
initial policy_decided(recover_once)
→ recovery_slot_reserved
→ failure_packet_created
→ child attempt_started
```

Only after the final policy decision:

```text
final evidence_validation_completed
→ integrated secret scan
→ outcome_created
→ run_terminal
→ Evidence Index / terminal marker ordering as frozen by Contract
```

The current V0-B terminal ordering and terminal marker implementation must be
reviewed carefully when V0-C Contract freezes exact write order. The accepted
invariant is one final Outcome, one final terminal suffix and an Inspector-bound
digest/index; not “one validation event total across both Attempts.”

### 9.3 Reuse

Reuse with regression:

- path/ArtifactRef validation；
- stable digest and write-once helpers；
- Session reasoning redaction；
- external Verifier subprocess bounds；
- secret scan primitives；
- causal Outcome precedence；
- terminal marker and Inspector fail-closed philosophy.

Generalize:

- expected Index set based on declared Attempts；
- secret scan scopes across all Attempt artifacts and Failure Packet；
- Journal validation across attempt transitions；
- Session/Journal Tool correlation by Attempt；
- Inspector identity result to expose ordered Attempt summaries, not one
  `identity.attempt_id`.

### 9.4 Test-fixture setup debt

The accepted V0-B re-audit found
`.runs/v0-b/test-cases/` was not self-created for an isolated test invocation.
V0-C may fix test setup only if the new V0-C test harness already touches that
shared setup. It is non-blocking hygiene, not a Completion feature, and must
not rewrite V0-B evidence history or trigger a broad test-runner project.

## 10. Deterministic Stage 1 Matrix

All Stage 1 cases use public emitted Faux Provider and zero real/external model
calls.

| Case | Initial | Child | Expected |
| --- | --- | --- | --- |
| observe-pass | valid pass | absent | passed, 1 Attempt |
| observe-fail | valid fail | absent | failed/agent, 1 Attempt |
| recover-policy-initial-pass | valid pass | absent | passed, recovery false |
| recover-once-pass | valid fail | valid pass | passed, 2 Attempts |
| recover-once-fail | valid fail | valid fail | failed/agent, 2 Attempts |
| initial-verifier-invalid | invalid | absent | invalid/verifier |
| initial-evidence-invalid | any | absent | invalid/evidence |
| initial-abort/cancel | none | absent | abort/cancel terminal, no Verifier/child |
| child-start-budget-insufficient | valid fail | absent | failed/budget |
| child-budget-exhausted | valid fail | budget stop | failed/budget, 2 Attempts |
| packet malformed/oversized/digest mismatch | valid fail | absent | invalid/evidence |
| duplicate child request | valid fail | forbidden | rejected; no third Attempt |
| duplicate Verifier | any | forbidden | integrity invalid |
| premature Outcome / event after terminal | any | forbidden | Inspector rejects |
| Session or Workspace ID drift in child | valid fail | invalid child | invalid/evidence |
| G003 regression | initial fail | recovery pass | same Session mechanism passes |
| G006 regression | initial pass | absent | no extra prompt/Verifier |

Required regression sets:

- strict TypeScript；
- all accepted V0-A tests；
- all accepted V0-B tests, including focused post-audit mutations；
- public Pi import smoke；
- V0-C branch matrix；
- formal CLI `run` and `inspect` end-to-end.

No deterministic test may weaken accepted V0-B scan/index/terminal checks merely
to make two Attempts fit.

## 11. Focused Independent Audit Recommendation

V0-C triggers the accepted risk-based audit rule because it changes control
flow, lineage, budget/stop and terminal evidence. After main review and a frozen
Candidate Commit, authorize one focused independent audit limited to:

1. child eligibility and exactly-one Recovery slot；
2. parent/child/session/workspace lineage；
3. no child on invalid/budget/abort/cancel；
4. Failure Packet visibility, bounds, digest and secret safety；
5. per-Attempt Verifier ordering and exactly-once execution；
6. cumulative budget reservation/consumption；
7. one Run-level terminal Outcome and dynamic Index completeness；
8. regression of V0-B findings `V0B-AUD-001`…`005`.

The audit should not reopen Workspace path security generally, re-audit Pi,
research cross-process Resume, or assess statistical policy effectiveness.
Findings return to the original V0-C Implementation Session for bounded repair.

## 12. Frozen Stage 2 User-Acceptance Recommendation

### 12.1 Required before authorization

Stage 2 may start only after:

- deterministic Stage 1 accepted by main Session；
- focused audit passed or findings corrected/rechecked；
- exact Implementation Baseline Commit and Workbench digest frozen；
- formal real-provider product route exists and was zero-call validated；
- user separately chooses Task, Workspace source, public/safe feedback contract,
  model profile and cost/run caps；
- credentials enter only the fresh UAT Session；
- source edit authority is absent.

### 12.2 Product surface

Use only:

```text
run --task <accepted-manifest>
    --strategy <observe-or-recover-once-real-profile>
inspect --run <run-id>
```

The exact CLI may differ, but no internal Driver or direct source import should
be the user-facing acceptance route.

### 12.3 Run boundary

- one authorized Run；
- one initial Attempt plus at most one policy-triggered child；
- total cost cap no higher than Charter V0-C maximum USD 2；
- explicit request, Tool, wall-time, token/output and Verifier caps；
- no automatic second Run or alternate model；
- no network/package install/background service/Git push in the Coding Task；
- if initial pass occurs, record honest no-recovery and stop；
- if implementation defect appears, stop and return to Implementation Session；
  UAT Session does not patch source.

### 12.4 Stage 1 implication

**Important Recommendation.** Stage 1 Contract must include implementation and
offline validation of the frozen real-provider adapter/config boundary, with
zero actual calls. Otherwise Stage 2 would require source edits and violate the
accepted frozen-product governance. This does not authorize a provider call or
credential access during Stage 1.

## 13. Recommended Contract Inputs

### 13.1 Scope

- two Strategy capabilities；
- one/two Attempt lineage；
- same-process same-session one-time recovery；
- bounded Failure Packet and safe Agent projection；
- cumulative budgets and explicit Completion Controller；
- per-Attempt Verifier/evidence；
- one Run-level Outcome/Index/terminal marker；
- V0-C `run`/`inspect` product path；
- deterministic branch suite；
- G003/G006 and V0-A/V0-B regressions；
- offline real-provider route readiness；
- reports, evidence and state-update proposal.

### 13.2 Non-goals

- policy effectiveness or statistical comparison；
- forced real failure；
- cross-process Resume or crash recovery；
- Exactly-once Tool execution；
- V2 clean-session/multi-path routing；
- V3 Experience/Curator/Promotion；
- Worktree、OS sandbox、MCP、Multi-Agent、UI、SQLite；
- Pi patch/private import/upgrade；
- external module port or new dependency without separate authorization.

### 13.3 Recommended Gates

| Gate | Purpose |
| --- | --- |
| A | exact control/Pi/V0-B identities and clean tracked baseline |
| B | strict V0-C preflight, strategies, 0/1 budget, no side effect on dry-run |
| C | same Harness/Session/Workspace lineage and two-attempt Session correlation |
| D | Completion Controller full deterministic decision table |
| E | Failure Packet projection, size, digest, visibility and secret safety |
| F | per-Attempt Verifier/evidence and one final Outcome |
| G | dynamic Index/scan/terminal Inspector mutation rejection |
| H | V0-A/V0-B/G003/G006 regression and public Pi boundary |
| I | formal product CLI plus offline real-provider route readiness, zero calls |
| J | source inventory/delta, claims, reports and protected paths |
| R | separately authorized Stage 2 real user run; not part of Stage 1 activation |

### 13.4 Recommended DoD

- every deterministic branch passes；
- `run.attempt_ids` and parent lineage validate for 1/2 Attempts；
- same-session child preserves Session/Workspace；
- invalid/budget/abort/cancel never starts child；
- no third Attempt possible；
- every settled Attempt gets exactly one Verifier；
- Packet is bounded and safe；
- exactly one terminal Outcome/marker；
- Inspector rejects lineage, Packet, Index, terminal and budget mutations；
- accepted V0-B tests still pass unchanged；
- public Direct Pi imports and Pi patch count 0；
- real Provider calls 0 during implementation；
- frozen UAT route exists without credentials；
- all unverified claims stated.

### 13.5 Allowed write paths

Contract should enumerate:

- new/modified `workbench/` V0-C source/tests/scripts/README；
- new V0-C Task/Strategy/Verifier fixture paths；
- ignored `.runs/v0-c/`；
- V0-C Implementation Report and Closeout Draft；
- Source Inventory/Delta and evidence index.

It should protect:

- `CURRENT_STATE.md` and formal control/Contract status；
- accepted V0-A/V0-B source fixtures and historical Runs；
- `.upstream/pi` and `.runs/v0-a/pi`；
- `reference/`；
- credentials and `.env`；
- accepted ADR/Closeouts.

### 13.6 Recommended Pause Conditions

Pause if:

- Pi public Harness cannot remain alive across settled Attempts；
- same Session/Workspace cannot be proven without private import/Pi patch；
- active Attempt identity can drift during Session/Tool callbacks；
- failed hidden Verifier content cannot be safely projected；
- child can start before evidence/budget/Packet gates commit；
- cumulative budget cannot be enforced or truthfully persisted；
- two Attempts require weakening V0-B evidence integrity；
- final Outcome/Index can be written more than once or before final validation；
- formal Stage 2 route would require post-freeze source edits；
- any real call, credential, download, new dependency or external module is
  needed without separate authority；
- scope expands into V2/V3 or cross-process durability.

## 14. Main-session and User Decisions

```yaml
user_decisions_required:
  - decision: authorize_main_session_to_draft_V0_C_Goal_Contract
    evidence: local_source_research_ready
    recommendation: yes
    consequence: still_no_activation_or_implementation

  - decision: failure_feedback_visibility_rule
    options:
      - public_external_only
      - explicit_safe_agent_feedback_projection
    recommendation: allow_both_but_require_explicit_projection_for_hidden_acceptance
    consequence: determines_recovery_eligibility_and_TaskSpec_fields

  - decision: V0_C_stage_1_real_provider_route
    options:
      - implement_and_zero_call_validate_now
      - defer_and_accept_that_stage_2_needs_a_new_source_baseline
    recommendation: implement_and_zero_call_validate_in_stage_1
    consequence: preserves_frozen_product_UAT_governance

  - decision: exact_child_start_budget_reserve
    evidence: Charter_requires_no_child_when_budget_insufficient
    recommendation: freeze_numeric_reserve_in_Contract_after_current_faux_and_real_profile_bounds_are_written
    consequence: determines_policy_decision_and_budget_tests

  - decision: Stage_2_task_model_and_cost_authority
    recommendation: defer_until_stage_1_and_audit_acceptance
    consequence: no_current_model_or_credential_authority
```

Main Session may decide exact file names and internal class signatures. It
should not silently change accepted Outcome precedence, maximum one child,
same-session mode, Stage 2 USD 2 Charter ceiling or independent authorization
points.

## 15. Facts, Inferences, Recommendations and Unconfirmed

### Facts

- Pi public `AgentHarness` returns to idle after settled and accepts another
  prompt using the same injected Session；
- G003 exercised one deterministic same-session recovery；
- G006 exercised a real route but no recovery；
- V0-B is accepted, one-Attempt-only and audit-hardened；
- current Workbench cannot represent or inspect a child Attempt；
- no Pi patch/private import is required by the identified route.

### Inferences

- a long-lived V0-C Adapter can compose the proven Pi mechanism with V0-B
  evidence primitives；
- versioned additive V0-C modules reduce risk to accepted V0-B replay；
- dynamic closed evidence policy is safer than loosening V0-B's static allowlist；
- safe hidden-Verifier feedback requires a separate projection contract.

### Recommendations

- draft one bounded V0-C Contract with deterministic Stage 1 and separately
  authorized Stage 2；
- retain risk-driven focused audit after Candidate freeze；
- implement the dormant real route in Stage 1 but call it zero times；
- do not acquire new references or research cross-process durability now.

### Unconfirmed

- exact implementation complexity and final file count until Contract/source
  design is frozen；
- natural real-model Recovery occurrence；
- Completion Policy effectiveness；
- current future provider catalog/pricing at the eventual Stage 2 date；
- cross-process Resume, crash reconciliation and Exactly-once behavior.

None of these Unconfirmed items blocks Contract drafting. Provider facts should
be rechecked immediately before an authorized Stage 2 call.

## 16. Commands and Exit Codes

Only read-only commands were used.

| Command intent | Representative exact command | Exit |
| --- | --- | ---: |
| root identity | `git -c safe.directory=D:/AI/AI_Projects/project2 rev-parse HEAD` | 0 |
| root status | `git -c safe.directory=D:/AI/AI_Projects/project2 status --short` | 0 |
| root tracked diff | `git -c safe.directory=D:/AI/AI_Projects/project2 diff --name-status` | 0 |
| Pi identity | `git -C .upstream/pi -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD` | 0 |
| Pi status | `git -C .upstream/pi -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi status --short` | 0 |
| file discovery | `rg --files workbench/src workbench/tests` | 0 |
| V0-C Charter map | `rg -n "V0-C|Completion|Recovery|Failure Packet|Attempt" docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md` | 0 |
| Workbench assumption map | `rg -n "attempt|parent|ordinal|recovery|verifier|terminal|sessionId|workspaceId" workbench/src/...` | 0 |
| Pi lifecycle symbols | `Select-String ... agent-harness.ts -Pattern "handleAgentEvent","executeTurn","prompt","waitForIdle","settled"` | 0 |
| G003 continuation map | `rg -n "new AgentHarness|harness.prompt|continuation|recovery|verifier|Session" spikes/pi-runtime/g003` | 0 |
| knowledge pattern map | `rg -n "Recovery|Session|Resume|Stop|Budget|Tool Result|Failure" reference/cc-harness-knowledge/...` | 0 |

Several `Get-Content -Encoding UTF8` commands read the required control,
Contract, Report, Closeout, Workbench, Pi and selected knowledge-reference
files. All exited 0. No test, build, Agent, Provider, Verifier, network,
install, stage or commit command was run.

## 17. Source Citation Index

### Workbench

- `workbench/src/contracts/v0b-types.ts`
  - `StrategySpecV0B`, `RunRecordV0B`, `AttemptRecordV0B`,
    `JournalEntryV0B`, `OutcomeV0B`；
- `workbench/src/contracts/preflight-v0b.ts`
  - `preflightV0B`, `V0BPreflightPlan`；
- `workbench/src/run-v0b.ts`
  - `executeV0BRun`, single ID allocation, single Verifier and terminal path；
- `workbench/src/pi/pi-adapter-v0b.ts`
  - `runPiEvidenceCycleV0B`；
- `workbench/src/session/evidence-session.ts`
  - `EvidenceMirrorSessionStorageV0B`, `sanitizeSessionEntry`,
    `reopenAndValidateEvidenceSession`；
- `workbench/src/evidence/journal.ts`
  - `JournalWriterV0B`, `validateJournal`；
- `workbench/src/evidence/terminal-policy.ts`
  - `TERMINAL_INDEX_RESPONSIBILITIES_V0B`,
    `TERMINAL_SCAN_*`, `validateTerminalIndexPolicyV0B`,
    `validateTerminalJournalSuffixV0B`；
- `workbench/src/verifier/runner.ts`
  - `runExternalVerifierV0B`；
- `workbench/src/outcome/builder.ts`
  - `buildOutcomeV0B`；
- `workbench/src/inspect-v0b.ts`
  - `inspectRunV0B` / `inspectCore`；
- tests:
  `v0b-preflight.test.ts`, `v0b-e2e.test.ts`, `v0b-outcome.test.ts`,
  `v0b-evidence.test.ts`, `v0b-post-audit.test.ts`.

### Pi

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`
  - `AgentHarness.createTurnState`, `handleAgentEvent`, `executeTurn`,
    `prompt`, `abort`, `waitForIdle`；
- `.upstream/pi/packages/agent/src/harness/session/session.ts`
  - public `Session` context/persistence boundary；
- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`
  - later prompt after abort/failure, settled and wait-for-idle tests；
- `.upstream/pi/packages/agent/test/harness/session.test.ts`
  - context ordering, branching and storage-backed reconstruction；
- `.upstream/pi/packages/agent/test/harness/storage.test.ts`
  - JSONL metadata, append/open and leaf reconstruction.

### Historical dynamic evidence

- `spikes/pi-runtime/g003/driver.ts` `runVariant`；
- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`；
- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`；
- `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md`；
- `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_CLOSEOUT.md`；
- `docs/reports/V0_B_CLOSEOUT.md`；
- `docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md`.

### Mature Harness design reference

- `reference/cc-harness-knowledge/docs/HARNESS_ENGINEERING_PLAYBOOK.md`
  - Control Plane/Data Path, Context Projection, Validation/Gating,
    Recovery as Explicit Transitions；
- `reference/cc-harness-knowledge/docs/CC_HARNESS_REFERENCE.md`
  - §§1, 4, 7；
- `reference/cc-harness-knowledge/research/source-reports/s11_error_recovery_source_report.md`.

## 18. Final Recommendation

```yaml
disposition: READY_FOR_MAIN_SESSION_CONTRACT_DRAFTING
reason:
  - public_same_session_route_is_source_supported
  - deterministic_recovery_is_already_observed_in_G003
  - V0_B_foundation_has_clear_versioned_extension_points
  - no_pi_patch_private_import_or_new_dependency_is_required
  - remaining_choices_are_bounded_Contract_decisions
not_authorized:
  - V0_C_Goal_Contract_creation
  - Goal_activation
  - implementation
  - independent_audit
  - real_model_or_provider_call
  - credential_access
  - git_commit
```

The next action belongs to the main Session: verify the cited symbols, accept
or narrow these recommendations, discuss the feedback-visibility and frozen
real-provider-route choices with the user, and only then request authority to
draft the V0-C Goal Contract.
