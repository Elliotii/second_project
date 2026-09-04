# 《R1-R2 Cross-Replay事实对照附件》

除明确标为 `Unconfirmed` 的项目外，下列项目均为 `Fact`。本附件仅作事实对照，不作 Gate、优先级或后续路线裁决。

## 1. Frozen Identity

```text
HEAD: e22c7637b6840c8b7a9221860318b0af4e5be3e1
Formal Evaluation: candidate-formal-matrix-v1-20260902-9d3b127
Raw Runs: 18
R1 output: .runs/day3-formal-analysis/r1-e22c763-valid1 (exists)
R2 output: .runs/day3-formal-analysis/r2-e22c763-trial1 (exists)
R1 execution HEAD / Formal Evaluation / Raw Runs: e22c7637b6840c8b7a9221860318b0af4e5be3e1 / candidate-formal-matrix-v1-20260902-9d3b127 / 18
R2 execution HEAD / Formal Evaluation / Raw Runs: e22c7637b6840c8b7a9221860318b0af4e5be3e1 / candidate-formal-matrix-v1-20260902-9d3b127 / 18
R1_R2_COMPARABLE_IDENTITY: YES
```

机械依据：当前分支为 `codex/trace-analysis-day1`，当前 HEAD 与冻结 HEAD 相同，起始工作树干净；R1/R2 的 Execution identity 均指向 `e22c763` 命名输出、同一 Formal Evaluation ID，最终 State 均覆盖同一 18 个 Run。

## 2. Pre-registered Stability Table

| Check | R1 factual result | R2 factual result | Relation |
| --- | --- | --- | --- |
| 18/18 Global Matrix coverage | `covered_runs=18`; `matrix_triage_complete=true` | Fresh 与 Resume 最终均为 `covered_runs=18`; `matrix_triage_complete=true` | SAME_REPORTED_BOUNDARY |
| A/no_skill/t3 claim boundary | `F-1` 为 `run_observation`；仅说明该 Run 只读探索后未实施；未声称 condition causation 或 Skill effect | `FD-1` 为 `run_observation`；`FD-2` 为限于六个 Case A Runs 的 `condition_comparison`；明确不声称 no_skill 导致失败、Skill effect 或跨 Case 推广 | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |
| C process attribution boundary | C/no_skill/t1 使用量信号进入 AG-2 后被 deprioritize；未调查；未声称 overall efficiency improvement | 使用量条件对比进入 AGR-3 后被 deprioritize；未调查；未声称 overall efficiency improvement | SAME_REPORTED_BOUNDARY |
| Non-finding / deprioritization | AG-2 以 mixed/confounded、仅 process metric 且低决策价值停止；未强行保留 Claim | AGR-3 以 outcome 无正确性对比且证据规模不支持因果结论停止；未强行保留 Claim | SAME_REPORTED_BOUNDARY |
| `settle_condition` semantic stop | AG-1 在必需 evidence 检查、支持/不支持边界及停止理由成立后 settled；AG-2 独立 deprioritized | Fresh 时 AGR-1 settled、AGR-2 仍 open；Resume 在完成六个 Case A 检查并明确支持/不支持边界后才 settled | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |
| D1 Evidence legality | `all_finding_locators_were_loaded=true` | Fresh 与 Resume 均为 `all_finding_locators_were_loaded=true` | SAME_REPORTED_BOUNDARY |
| D2 Claim Scope → Required Contrast | `run_observation` 的 anchor Run 已检查；未把未检查 comparator 当作 condition claim 支撑 | `FD-1` 的 anchor Run已检查；`FD-2 condition_comparison` 的六个 Case A Runs 全部进入 `checked_runs` | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |
| D3 Local Closure != Global Completion | Fresh 中唯一调查项 settled，另一个项独立 deprioritized 后才形成 Global Completion | Fresh 中 AGR-1 已 settled，但 AGR-2 仍 open，故未以 Local Closure 代替 Global Completion；Resume 后才完成 | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |
| Global Completion | Fresh：Matrix complete；AG-1 settled、AG-2 deprioritized；最终 Global Completion | Fresh 未完成；Resume：Matrix complete；AGR-1/AGR-2 settled、AGR-3 deprioritized；最终 Global Completion | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |
| Resume path coverage | natural single-session path；Fresh 已完成，无未完成责任，未执行 Resume | natural cross-session path；新 model Session、未加载 prior chat、从 State-only Resume 延续 AGR-2 与 `prior_next_action`，并完成未完成责任 | COMPLEMENTARY_PATH_COVERAGE |
| P0 Summary fidelity | Fresh invocation 的完整 `state` 含唯一 kept Finding；Fresh 路径不生成 `development-finding.md` | Resume invocation 的完整 `state` 含 FD-1、FD-2；单 Finding 展示件仅含 FD-1 | DIFFERENT_TRAJECTORY_SAME_REPORTED_BOUNDARY |

未观察到 `required_runs complete → 自动等于 semantic settle`。R2 Fresh 尤其显示：一个 Item 已局部关闭时，另一个 Item 仍可保持 open，且 Global Completion 尚未成立。

## 3. Key Boundary Facts

**R1 A/t3:** investigation/claim scope 为单 Run `run_observation`。`F-1.counter_checked=false`；同条件与 with_skill sibling 仅作为 Matrix 背景保留，最终解释限于 fa563461 的只读探索、空 Diff 与 `behavior_not_implemented` 一致。Condition-level causation claimed: `NO`。Skill-effect claimed: `NO`。

**R2 A/t3:** Fresh 先保留 `FD-1 run_observation` 并检查一个 PASS sibling counter；Resume 完成所有六个 Case A Runs 的 Required Contrast，保留 `FD-2 condition_comparison`。最终解释仅称“无实施事件”与唯一失败在已加载 Case A Runs 内重合并定位到 no_skill/t3；不解释停止原因。Condition-level causation claimed: `NO`。Skill-effect claimed: `NO`。

**R1 C process boundary:** signal noted: `YES`；Finding: `NO`；deprioritized: `YES`；overall efficiency improvement claimed: `NO`。

**R2 C process boundary:** signal noted: `YES`；Finding: `NO`；deprioritized: `YES`。预注册 calibration（With-Skill tool calls 3/3 lower、duration mixed、tokens mixed）未被转写为 overall efficiency improvement；overall efficiency improvement claimed: `NO`。

## 4. D1–D3 + Resume Facts

| Item | R1 | R2 |
| --- | --- | --- |
| D1 unseen Evidence cannot support Finding | 所有 Finding locators 均在 `loaded_evidence` | Fresh/Resume 所有 Finding locators 均在 `loaded_evidence` |
| D2 required contrast | `run_observation` anchor 已检查；未形成 condition-effect Claim | `FD-2 condition_comparison` 的六个 Case A Runs 全部检查；Claim 同时被缩窄 |
| D3 Local Closure vs Global Completion | 所有 Item settled/deprioritized 后完成 | Fresh 的 AGR-1 closure 未令全局完成；AGR-2 经 Resume settled 后完成 |
| Fresh completion | `YES` | `NO`（仍有 AGR-2 open 与非空 `next_action`） |
| Resume | 未执行；Fresh 已 Global Complete，无未完成责任 | `YES`；新 Session；`loaded_prior_session=false`；`loaded_state_path` 指向同一 `analysis-state.json`；`prior_next_action` 非空；继续并完成 AGR-2 |
| Resume continuity | natural single-session path | State-only natural cross-session path；`resume_direction.queried_different_run=true` |

关系：`COMPLEMENTARY_PATH_COVERAGE`。本附件不把单次 Resume 路径扩展为统计稳定性或多次 Resume 验证。

## 5. Existing Repeated / Replay-Specific Signals

| Signal already reported | R1 | R2 | Relation |
| --- | --- | --- | --- |
| A/no_skill/t3 fa563461 是唯一 TASK_FAILURE，且只有只读探索、零改动 | AG-1/F-1 明确记录 | AGR-1/FD-1 明确记录 | REPEATED_SIGNAL |
| A/no_skill/t3 的停止原因未由已读 evidence 建立 | 明确保留为 open evidence boundary | 明确保留为 open evidence boundary | REPEATED_SIGNAL |
| C 使用量/process signal 不支持 overall efficiency 或 Skill-effect 结论 | AG-2 deprioritized | AGR-3 deprioritized | REPEATED_SIGNAL |
| State-only cross-session continuation | 未执行 Resume | Fresh 留下 AGR-2；Resume 新 Session 完成 | R2_ONLY |
| `development-finding.md` 只呈现一个 kept Finding | Fresh 路径未生成该文件 | 最终 State 有 FD-1、FD-2，文件只有 FD-1 | R2_ONLY |
| `update_state` 的 Agenda item schema 外辅助字段被拒绝后自纠 | `checked_runs_note` | `open_questions_note` | REPEATED_SIGNAL |

## 6. Canonical P0 Summary Check

```text
canonical output: R1 fresh-invocation.json / R2 resume-invocation.json 中的完整 AnalysisInvocationResult.state
development-finding.md role: single-Finding presentation/export
R2 FD-2 absence classification: non-canonical artifact omitted a kept Finding; current evidence does not establish canonical synthesis loss
```

Supporting narrow source facts：

- `workbench/src/trace-analysis/model-runner.ts::runAnalysisInvocation` 构造 `AnalysisInvocationResult` 时放入完整 `state`，无条件写入 `<mode>-invocation.json`；这是 writer/finalization symbol。
- 同一 symbol 仅在 `mode === "resume" && state.finding_drafts.length > 0` 时写 `development-finding.md`；选择表达式为“第一个 kept Finding，否则第一个 Finding”，因此该文件是单 Finding 渲染件。
- 18-Run Evaluation 的 immediate caller 为 `workbench/src/trace-analysis/evaluation.ts::runEvaluationAnalysis`：它从冻结 Evaluation 准备全部 descriptors，选择 `runAnalysisInvocation` 并直接返回该调用结果。writer → immediate caller 关系为 `runEvaluationAnalysis → runAnalysisInvocation`。
- 这条窄链直接确认 canonical result 的 `state` 消费完整 `investigation_agenda`、`notes`、`open_questions`、`next_action`、`loaded_evidence` 与全部 `finding_drafts`；每个 Finding 内含其 `limitation`。R2 `resume-invocation.json` 的 State 确含 FD-1 与 FD-2。

## 7. `update_state` Misuse Comparison

```text
R1 rejected fields: investigation_agenda[0].checked_runs_note
R2 rejected fields: investigation_agenda[0].open_questions_note
self-recovery: BOTH YES — each model removed the extra field and retried update_state successfully in the same Session
material effect: BOTH NO — final State persisted; R1 Fresh and R2 Fresh both continued to their reported terminal boundary
SAME_ERROR_PATTERN: YES
```

两次均属于模型试图向 Agenda item 提交 schema 外的解释性/辅助字段；错误均为 `Validation failed for tool "update_state"`，具体摘要均为 `investigation_agenda.0: must not have additional properties`。

## 8. Evidence Gaps

```text
NONE
```

## 9. Freeze Confirmation

```text
R1 artifacts modified: NO
R2 artifacts modified: NO
tracked source modified: NO
Prompt / Tool modified: NO
new model runs: NO
R3 executed: NO
Commit created: NO
```

```text
CROSS_REPLAY_FACT_ATTACHMENT_COMPLETE
```
