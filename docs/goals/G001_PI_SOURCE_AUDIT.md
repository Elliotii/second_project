# G001 — Pi Source Audit

```yaml
goal_id: G001_PI_SOURCE_AUDIT
status: ready_to_start
owner: new_goal_session
reviewer: architecture_control_session
phase: Phase_1_Pi_Source_Audit
source_mode: static_read_only
network_required: false
dependency_install_authorized: false
real_model_authorized: false
upstream_modification_authorized: false
```

## 1. Objective

Deeply audit the pinned Pi source and its tests to decide which Pi integration
surface is the best basis for the Agent Harness Reliability Workbench.

The audit must answer this concrete decision:

> Should V0 integrate directly with the new `@earendil-works/pi-agent-core`
> `AgentHarness`, retain the prior Pi Coding Agent SDK Runner plus Inline
> Extension candidate, use an RPC/process adapter, or reject Pi for this
> project?

This goal produces a source-evidence decision package. It does not implement a
spike and does not claim that any behavior has been dynamically verified.

## 2. Frozen Source Basis

All Pi claims must refer to this exact checkout:

```yaml
remote: https://github.com/earendil-works/pi.git
commit: 027a5847901b5dde30270abaa1041046cd2b4b55
branch_at_capture: main
nearest_tag: v0.82.1
distance_from_tag: 40_commits
checkout: .upstream/pi
```

Before auditing, confirm that `HEAD` still equals the pinned commit and that
the working tree is clean. Do not pull, fetch, switch, reset, install, build,
or edit the checkout.

## 3. Required Read Order

Read these control documents first and completely:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. this goal contract;
4. `docs/research/pi/upstream-snapshot.md`;
5. relevant sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`,
   especially candidate structure, Completion Verification, run semantics,
   Phase 1, and Pi Go/No-Go;
6. `.upstream/pi/AGENTS.md`.

Then read the relevant upstream documents and source files completely before
drawing conclusions. At minimum, route through:

- root and relevant package `README.md` files;
- `packages/agent/docs/harness.md`;
- `packages/agent/package.json`, exports, and public entry points;
- `packages/agent/src/harness/` and matching `test/harness/` evidence;
- core agent loop, agent, stream, message, and event types;
- Coding Agent public entry points, SDK/session/runtime code, extension APIs,
  RPC mode, session persistence, tool lifecycle, context/compaction, and
  relevant tests;
- any additional source reached by those files that is required to answer the
  audit questions.

Do not treat README prose alone as proof when source or tests can answer the
same question.

## 4. Hypotheses to Test, Not Assume

1. The new direct `AgentHarness` is sufficiently durable and externally
   controllable to be the V0 runtime basis.
2. It exposes a non-interactive entry path suitable for deterministic and real
   model runs.
3. It has a stable observable boundary for agent settled/termination, tool
   lifecycle, assistant output, errors, and usage.
4. Its session/storage APIs can be linked losslessly enough to an external
   `RunRecord` and append-only project journal.
5. Deterministic Completion Verification can run after the agent settles; a
   failed verifier result can be fed back exactly once; the same session can
   resume; and the verifier can run again.
6. Workspace/CWD, environment, permissions, tools, provider/model, retry,
   compaction, and cancellation can be controlled or explicitly bounded.
7. The Coding Agent SDK plus Inline Extension remains preferable only if the
   direct harness lacks a required user-facing or lifecycle capability.
8. RPC/process mode is a fallback, not the default, unless in-process APIs
   cannot meet isolation or observability requirements.

## 5. Required Audit Questions

### 5.1 Public integration surface

- What is exported from each relevant package and entry point?
- Which APIs are public contracts versus internal implementation details?
- What construction, configuration, execution, resume, stop, and teardown
  operations exist?
- Which surface has the smallest dependency on interactive/TUI state?

### 5.2 Lifecycle and events

- Reconstruct the actual sequence from prompt submission through model stream,
  tool call, tool result, follow-up generation, settling, cancellation, error,
  and termination.
- Identify exact types, symbols, and event names.
- Distinguish model stop from agent settled and process exit.
- State whether tool start/end and context transformations are directly
  observable or must be projected from other state.

### 5.3 Session, storage, and replay

- What is persisted, in what order, and with which identifiers?
- Can an external `run_id` be attached without patching core code?
- Can a session resume after deterministic feedback?
- Is persisted session data an event journal, a state snapshot, or a mixture?
- What is lost, transformed, or compacted?

### 5.4 Tools, workspace, and side effects

- How are tools registered, invoked, validated, cancelled, and reported?
- Where are CWD, repository root, environment, permissions, and shell behavior
  determined?
- Can Baseline and Candidate share the exact same tools and environment?
- Can the verifier remain outside the agent tool surface?

### 5.5 Context, compaction, retry, and failure

- Where is model context assembled and transformed?
- When does compaction occur and what events/state expose it?
- What retries exist at provider, model, or agent-loop levels?
- How are errors and partial tool/model results represented?
- Which behaviors could invalidate a fair Baseline/Candidate comparison?

### 5.6 Completion Verification insertion

Trace whether this exact bounded protocol can be built without a large fork:

```text
agent settles
→ external deterministic verifier runs against the same workspace
→ baseline records the result and stops
→ candidate, only on failure, appends one structured failure message
→ same session receives one bounded recovery cycle
→ verifier runs once more
→ run ends with explicit outcome and reason
```

Identify the clean insertion point, required adapter code, missing events, and
any side-effect or fairness hazards.

### 5.7 Architecture comparison

Compare at least:

1. direct `pi-agent-core` `AgentHarness`;
2. Pi Coding Agent SDK Runner plus Inline Extension;
3. Pi RPC/process adapter;
4. Pi No-Go / alternative runtime, if a hard blocker exists.

Evaluate each on public API stability, non-interactive operation,
observability, session continuity, workspace control, verifier insertion,
implementation size, upstream-coupling risk, and portfolio explainability.

## 6. Evidence Rules

Every material claim must be labeled as one of:

- **Fact** — directly supported by pinned source, tests, manifest, or docs;
- **Inference** — reasoned from facts but not directly guaranteed;
- **Recommendation** — project choice based on facts and trade-offs;
- **Unconfirmed** — requires dynamic verification or external clarification.

For Facts, cite repository-relative file paths plus symbol names and useful
line numbers. Prefer source and test evidence together. Keep quotations short;
paraphrase behavior. Do not use the deep-research report's internal citation
markers as evidence.

If internet research becomes genuinely necessary for provenance, use only the
official repository or official package documentation, record exact URLs, and
keep current pinned source as authority for implementation behavior. Internet
research is not expected for this static goal.

## 7. Required Deliverables

Write only project documentation outside `.upstream/pi`:

1. `docs/research/pi/source-map.md`
   - packages, entry points, key symbols, responsibility, source/test paths;
2. `docs/research/pi/capability-matrix.md`
   - required capability × integration option × evidence × status;
3. `docs/research/pi/lifecycle-and-session.md`
   - event/tool/session sequences and Completion Verification insertion point;
4. `docs/research/pi/open-questions.md`
   - remaining unknowns, their risk, and the smallest dynamic check needed;
5. `docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md`
   - executive conclusion, detailed findings, risks, architecture comparison,
     provisional Pi decision, and a bounded G002 dynamic verification plan;
6. update `CURRENT_STATE.md` accurately when the audit is complete.

The report must explicitly say whether the previous candidate architecture was
confirmed, superseded, or rejected by the post-`v0.82.1` AgentHarness source.

## 8. Allowed and Prohibited Actions

Allowed:

- read and search all files in the pinned Pi checkout;
- run read-only Git metadata commands with the exact per-command
  `safe.directory` override if needed;
- create or edit only the G001 documentation deliverables and
  `CURRENT_STATE.md`;
- calculate static inventories or line references without modifying upstream.

Prohibited:

- modifying `.upstream/pi`;
- fetching, pulling, switching, rebasing, resetting, or updating Pi;
- installing dependencies or running lifecycle scripts;
- running Pi builds or tests in G001;
- calling a real model;
- creating `workbench/` or implementation code;
- freezing schemas or policy thresholds beyond what source evidence supports;
- committing changes.

## 9. Definition of Done

G001 is complete only when:

- pinned commit and clean state are reconfirmed;
- all audit dimensions in Section 5 are answered as `confirmed`, `partial`,
  `absent`, or `unconfirmed`;
- material claims carry source/test evidence and epistemic labels;
- the three integration options are compared under the same criteria;
- the Completion Verification protocol has a traced insertion path or a
  precise blocker;
- every Unconfirmed behavior is converted into a smallest-possible G002
  dynamic check with command/setup intent and pass/fail criteria;
- the report returns exactly one provisional disposition:
  `ACCEPT_FOR_DYNAMIC_VERIFICATION`, `ACCEPT_WITH_CONSTRAINTS`, or
  `REJECT_PI_BASIS`;
- no Pi files changed and no dependencies were installed;
- `CURRENT_STATE.md` records the result and next checkpoint.

The disposition is provisional. The architecture/control session reviews the
evidence before authorizing G002 or declaring a final Pi Go.

## 10. Pause Conditions

Pause and report instead of guessing if:

- the checkout no longer matches the pinned commit or is dirty before audit;
- applicable repository instructions conflict with this contract;
- required blobs are missing and obtaining them would require network access;
- source evidence exposes a decision that materially changes project scope;
- completing the audit would require dependency installation, code execution,
  upstream modification, credentials, or a real model.

## 11. Exact New-Session Prompt

Start a fresh Codex task in Goal mode from the repository root and use:

```text
/goal 执行 docs/goals/G001_PI_SOURCE_AUDIT.md 中定义的完整目标。严格以固定的 Pi commit 027a5847901b5dde30270abaa1041046cd2b4b55 为依据，先完整阅读项目与上游 AGENTS.md、CURRENT_STATE.md、目标契约和上游快照，再进行只读静态源码与测试审计。完成全部指定交付物并更新 CURRENT_STATE.md；不安装依赖、不运行构建或测试、不调用真实模型、不修改 .upstream/pi、不创建 workbench、不提交 Git。若触发 Pause Conditions，停止扩张并精确报告阻塞。
```

