# V3 Goal 1 Dedicated Implementation Session Start Prompt

```yaml
status: authorized_for_new_top_level_session
goal_id: V3_G1_EVIDENCE_TO_CANDIDATE_STATE
control_baseline_commit: 8107df7e7ca10206fbb3fc58f93c3baf3cd4ab75
control_baseline_tree: 07ba2a3c28fa8761583dd62eb9698ce99d396860
source_branch: codex/v2-b-bounded-r2
execution_owner: this_new_top_level_dedicated_goal_1_session
goal_2_authorized: false
goal_3_authorized: false
credential_reads_authorized: 0
external_network_authorized: false
real_model_calls_authorized: 0
pi_core_patch_authorized: false
git_stage_or_commit_authorized: false
```

## 1. Role and stopping point

你是 V3 Goal 1 的新顶层 Dedicated Implementation Session，不是 Main Session、subagent、Audit Session 或 Goal 2/3 Session。

你的唯一任务是实现并验证 accepted `V3_VERSION_CHARTER.md` 的 **Goal 1 — Evidence → Candidate State**。你负责本 Goal 的有界源码、focused tests、raw evidence、Implementation Report 与 Closeout Draft；你无权接受 Goal、修改控制状态、创建 Git commit、进入 Goal 2/3 或改变 V3 架构。

本次真实调用授权为 0。因此你应完成 Goal 1 的全部零调用实现与验证，包括 bounded model-backed producer adapter 的 Faux/fixture 测试；随后在真实 proposal authorization gate 停止，并报告：

```text
READY_FOR_BOUNDED_MODEL_BACKED_PROPOSAL
```

不得把尚未执行的真实 model-backed proposal 写成已完成，也不得因此把 Goal 1 宣布为最终 PASS。

## 2. Gate A — baseline and authority preflight

在修改任何 tracked 文件前，必须：

1. 完整读取并服从：
   - `AGENTS.md`；
   - `CURRENT_STATE.md`；
   - `docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`；
   - `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
   - `docs/reports/V3_HARNESS_STATE_ADAPTATION_PRECONTRACT_REVIEW.md`；
   - `docs/reports/V2_CLOSEOUT.md`；
   - Charter/Review 明确引用的现有 Workbench source/tests。
2. 核验当前 `HEAD` 精确等于：

   ```text
   8107df7e7ca10206fbb3fc58f93c3baf3cd4ab75
   ```

3. 核验所有 tracked files clean。已登记的 ignored operational files 可以存在，但不得把它们误当 tracked baseline。
4. 核验固定 Pi source checkout：

   ```text
   path: D:/AI/AI_Projects/project2/.upstream/pi
   commit: 027a5847901b5dde30270abaa1041046cd2b4b55
   expected_status: clean
   package: @earendil-works/pi-agent-core@0.82.1
   ```

   进入该目录检查源码前，先完整读取所有适用的 Pi `AGENTS.md`。
5. 核验既有 emitted Pi artifact boundary：

   ```text
   D:/AI/AI_Projects/project2/.runs/g006/pi
   ```

   它必须仍固定在同一 Pi commit、package version，并提供 public emitted `packages/agent/dist/index.js`、`packages/agent/dist/node.js`、`packages/ai/dist/index.js` 以及 TypeScript compiler。只允许 public emitted entries；禁止 private import。
6. 新 worktree 不应依赖旧 worktree 中不存在的 `.runs/v0-a/pi` 或其他相对 ignored 路径。可以在本 Session 自己的 `.runs/v3-g1/runtime/` 下创建 ignored loader 与 type-path bridge，显式指向上述固定 emitted artifacts，并完成 `AgentHarness`、`loadSkills`、`NodeExecutionEnv` 的 public-import/type smoke。

该 hydration 只是 Goal-local、ignored、可重建的运行桥；不得复制/安装另一套 Pi，不得修改 package lock、不得联网或执行 dependency install。

任一 identity、cleanliness、public-entry 或 authority Gate 不成立时立即停止并提交 Pause Report，不要开始实现。

## 3. Goal 1 objective

从有效且冻结的 Run/Verifier/A-B evidence 形成安全、可审计、尚未生效的 Harness State Candidate，并保持：

```text
Agent / Model proposes
Harness validates and stages
accepted base unchanged
active state unchanged
```

Goal 1 不做比较、Promotion、Reject decision、active pointer mutation、selective binding 或 rollback；这些属于后续未授权 Goal。

## 4. In-scope implementation

在先阅读现有实现并优先复用后，完成最薄的 Goal 1 实现：

1. 从现有有效 evidence 投影三类 `ImprovementOpportunity`：
   - `hard_failure`；
   - `inefficient_success`；
   - `structural_trajectory_pathology`。
2. structural trigger 必须真正重算并证明：

   ```text
   same frozen command/check fails
     -> workspace edit/intervention occurs
     -> same frozen command/check runs again
     -> same check fails again
   ```

   必须依赖 frozen command/check identity、Tool call/result linkage 与 bounded artifact，而不是只判断“发生 recovery 且最终失败”。
3. invalid/infrastructure/cancelled/missing-Verifier/unclosed-lineage evidence 必须 fail closed，不得生成 Lesson/Candidate。
4. 实现可追溯的 `Diagnosis`、`Lesson`、`RefinementCandidate` 与统一 `HarnessEdit` 边界；每个结论必须指向 immutable evidence identity/digest。
5. 实现 deterministic fixture producer。
6. 实现一个薄的 bounded model-backed producer adapter：
   - 输入为冻结 evidence；
   - 输出只是一份结构化 proposal；
   - exact-key/schema/authority validation 由 Harness 执行；
   - 本轮只用 Faux/fixture 测试正常和畸形输出；
   - 禁止读取真实凭据、联网或调用外部 Provider/model。
7. 实现 host-side proposal/schema/authority validation。Candidate 只能改变：
   - `prompt_addendum`；
   - `adaptive_skill`；
   - 与它们直接关联的最小 applicability metadata。
8. 实现两条真实且不同的 staged adapter：
   - `prompt_addendum`：对 immutable base prompt 的纯组合/预览路径；不得修改 `workbench/src/prompts/base.ts` 的 accepted 常量；
   - `adaptive_skill`：Pi public Markdown/frontmatter Skill、public `loadSkills()`、wrapper/explicit invocation 兼容路径；复用 V1 的 path/link/hardlink/diagnostic fail-closed 思路，但不得修改 accepted V1 fixture identity，也不得退化为 executable plugin。
9. 将 Candidate 写为 immutable/content-identified staged State，位于 Agent tool workspace 与 accepted base 之外；它必须可由后续 Goal 重读、重算 digest 和核验，但不得成为 active state。
10. 增加最少、聚焦的 mechanism/security tests，覆盖三类 Trigger、真实 repeated-failure cycle、两种 State、malformed/stale/authority-targeting proposal、whole-candidate atomic reject 与 accepted base/active byte identity。

具体 TypeScript interface、目录和 symbol 名称可以按现有源码选择最小实现；不要为了未来 Goal 预建平台。

## 5. Source and change boundary

允许的 tracked 变更只限 Goal 1 必需内容：

- `workbench/src/` 下新增的薄 V3 contracts/refinement/state/prompt/skill adapters；
- 仅为接线所必需的最小现有 product-surface/export/CLI 改动；
- `workbench/tests/` 下 Goal 1 focused tests 与必要 fixture；
- `workbench/package.json` 中仅为 Goal 1 focused command 所需的最小 script；
- `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V3_G1_CLOSEOUT_DRAFT.md`。

优先新增 adapter，不重写 accepted V0–V2 模块。以下 tracked 文件为 protected control/accepted authority，不得修改或暂存：

- `AGENTS.md`；
- `CURRENT_STATE.md`；
- `docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`；
- `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
- accepted V0–V2 Contract/Charter/Closeout/fixtures；
- `workbench/src/prompts/base.ts` 的 accepted base；
- accepted V1 Skill fixture/identity；
- Pi source、emitted Pi artifacts、reference sources。

若最小接线确实需要改动一个未列出的 Workbench 文件，可在不改变架构/实验语义的情况下做最小修改，并在 Source Delta 中逐项解释；不得借此扩大为新 runtime、eval、router 或 repository。

## 6. Explicit prohibitions

本 Session 不得：

- 实现 Goal 2 或 Goal 3；
- 实现 symmetric Base/Candidate comparator、Promotion/Reject decision、active pointer、rollback 或 selective binding；
- 调用真实模型、读取/探测凭据、联网、下载或安装依赖；
- 修改 Pi、使用 Pi private import、切换 SDK/Extension/RPC；
- 修改 Verifier、Acceptance Criteria、Outcome semantics、Promotion rule、budget/security/permission、Evidence writer 或 Inspector authority；
- 新增 Memory、Runtime Policy、第三种 State、Router、Curator、Experience Repository、embedding、daemon、subagent 或第二套 Agent Loop/Trace/Eval Runtime；
- 修改、暂存或提交控制文件；
- 执行 `git add`、`git commit`、`git push`；
- 把普通 compile/test/schema/path/adapter defect 升级为新 Goal、Stage、R1/R2、Amendment 或 Audit。

普通 Goal 1 allowlist 内 defect 由本 Session 直接修复并重跑命中测试。只有命中 Charter hard stop、需要架构/Scope/authority 变更、需要真实调用或两种 State 无法通过 public Pi/Workbench path 成立时才暂停。

## 7. Required verification and evidence

至少记录：

1. Gate A 的 exact HEAD、tracked status、Pi HEAD/status/package、emitted public-import/type smoke；
2. strict TypeScript；
3. Goal 1 focused tests；
4. 与所改共享模块相关的最窄 accepted regression tests；
5. 三类 Trigger fixture 与 real repeated-failure structural fixture；
6. deterministic producer、Faux model-backed adapter、invalid output 与 authority-targeting rejection；
7. 两种 staged State 的 digest、reload 与 accepted base/active byte identity；
8. source delta、commands、exit codes、失败后修复记录及仍未验证项。

不得用 README 断言代替命令和 artifact evidence，也不要运行与 Goal 1 无关的宽泛测试矩阵。

## 8. Required deliverables

最终必须提交但不得 commit：

1. `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`；
2. `docs/reports/V3_G1_CLOSEOUT_DRAFT.md`；
3. 报告中的结构化：
   - Gate/Exit-criteria matrix；
   - Source Delta；
   - Commands 与 Exit Codes；
   - Evidence Index；
   - protected-file identity check；
   - Pi/public-import check；
   - `CURRENT_STATE_UPDATE_PROPOSAL`；
   - remaining real-proposal gate。

`CURRENT_STATE_UPDATE_PROPOSAL` 只写在报告中；不得直接修改 `CURRENT_STATE.md`。

若零调用实现及验证全部通过，建议 disposition 必须是：

```text
READY_FOR_BOUNDED_MODEL_BACKED_PROPOSAL
```

若命中 hard stop，则提交 `V3_G1_PAUSE_REPORT.md`，只陈述观察、证据、阻塞原因和需要 Main/用户决定的最小选项。

提交结果后立即停止，等待 Main Session 与用户有限验收；不要自行进入下一授权门或后续 Goal。
