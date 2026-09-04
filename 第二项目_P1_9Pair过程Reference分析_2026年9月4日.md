# 第二项目 P1 9 Pair 过程 Reference 分析

## 1. Identity / Scope

- Formal Evaluation：`candidate-formal-matrix-v1-20260902-9d3b127`。
- 机械身份核验：`18 mapped / 18 unique / 18 included`；形成 9 个唯一 Case/Trial Pair；每个 Pair 恰好包含 `no_skill` 与 `with_skill`；18 个 Run 的 `run-manifest.json`、`trace.json`、`diff.json`、`verifier/result.json` 均存在，mapping Run ID 与 Manifest Run ID 一致。
- Reference isolation：本分析只读取 Formal mapping/plan、Task config、Frozen Run 的 Manifest/Trace/Diff/Verifier，以及理解 task relevance 所需的 workspace 内容；未读取 R1/R2 analysis-state、invocation result、Findings、evaluator report、Cross-Replay 语义比较或 Candidate/Skill 解释材料。
- 边界：只做 Frozen Evaluation 的只读过程分析；未运行 Coding Agent、Analysis Agent 或 Frozen Trial，未修改源码、实验、Prompt、Tool、State、Candidate、Task、Verifier 或 Formal Matrix。

## 2. Analysis Contract

按 `A/t1 → A/t2 → A/t3 → B/t1 → B/t2 → B/t3 → C/t1 → C/t2 → C/t3` 逐 Pair 分析并封存。全部 9 Pair 封存后才做 Case synthesis，再考虑 cross-case observation。每个判断区分 Raw Artifact、mechanical fact 与 semantic interpretation；保留 Counter/Ambiguity；单 Trial 差异不等于稳定 Skill effect，Outcome divergence 不等于 Skill causation，过程差异也不自动等于过程改善。

## 3. Nine Pair Observations

### A/t1（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902082144220-2c23cf9c`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902082230206-be6114b3`；External Outcome：`passed`。

**Observed process contrast**

- 两臂都先定位 registry/contracts/apply path、既有 action 与 tests，然后新增 `src/actions/pause-job.ts`、注册 handler、补测试，最后仅运行一次 `npm_test` 并通过；未见 validation 后 rework、unchanged/no-delta retry，termination 均紧随成功测试。
- With-Skill 较早进入首次 task-relevant write（seq 17），No-Skill 在 seq 23 才进入；主要机械差异是 No-Skill 在探索中两次调用不存在的 `read` tool 并报错，之后改用 `workspace_read`，With-Skill 未发生该错误。No-Skill 还读取 `package.json`，With-Skill 未读；两者对核心实现文件的覆盖总体接近。
- 实现内容有轻微测试组织差异：With-Skill 先把 `paused` 加入共享 fixture，再用一个循环覆盖 non-running 状态；No-Skill 分开构造 already-paused 用例。两者外部 Verifier 均通过，没有证据表明这一组织差异造成 task quality 差异。

**Evidence**

- No-Skill Trace：seq 3–8、17、21 为 task-relevant reads；seq 9–10 与 18–19 为两次 `read`/`Tool read not found`；seq 23/25/27 为实现写入；seq 29–30 为唯一 `npm_test` 且 exit 0。
- With-Skill Trace：seq 3–16 为 task-relevant reads；seq 17/19/21/23 为实现写入；seq 25–26 为唯一 `npm_test` 且 exit 0。
- 两 Run 的 `verifier/result.json.status=passed`，summary 均为 pause-job behavior contract satisfied；各自 `diff.patch` 显示同一三文件类别的实现范围。

**Counter / Ambiguity**

- 首次写入更早可能来自读取顺序或单次生成随机性；它没有伴随更少的总 Provider requests（两者均 9）或可观察 Outcome 优势。
- No-Skill 的两次无效 tool 调用是明确浪费步骤，但没有触发代码返工；仅凭本 Pair 不能把它归因于 condition。

**Pair-level claim boundary**

本 Pair 最多支持：两臂采取相同的核心实现—单次测试路径并都通过；With-Skill 本次更早开始写入且避免了两次无效 tool 调用。不能支持稳定效率提升、稳定减少探索或 Skill 因果效应。

### A/t2（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143253191-27a464c7`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143216845-b29b95a1`；External Outcome：`passed`。

**Observed process contrast**

- 两臂的 task-relevant trajectory 高度接近：读取 registry/contracts/apply/index、两个既有 action 和 tests；新增相同 hash 的 `pause-job.ts`，得到相同 hash 的 registry；各对 tests 做两次 edit；仅运行一次 `npm_test` 并通过，随后结束。未见 validation 后 rework、重复 task-source read 或 unchanged/no-delta retry。
- No-Skill 额外读取 `package.json` 与受保护的 `README.md`；With-Skill 则在最开始尝试列出 workspace 边界外的 Skill build 绝对路径，被 `unbounded path is forbidden` 拒绝，随后转入正常 workspace 探索。两边各有少量不直接推进实现的读取/调用，类型不同。
- 首次实现写入只呈轻微序列差异（No-Skill seq 21；With-Skill seq 19），但此前事件数量受到 With-Skill 初始失败调用、No-Skill 两个额外文件读取影响，不能把 seq 差直接当作更快决策。

**Evidence**

- No-Skill Trace：seq 3–20 reads（含 seq 16 `README.md`）；seq 21/23/25/27 writes；seq 29–30 唯一 `npm_test` exit 0。
- With-Skill Trace：seq 1–2 为 workspace 外绝对路径 `workspace_list` 失败；seq 3–18 workspace reads；seq 19/21/23/25 writes；seq 27–28 唯一 `npm_test` exit 0。
- `diff.json`：两臂均只 added `src/actions/pause-job.ts`、modified `src/action-registry.ts` 与 `test/actions.test.ts`；action 文件与 registry 的 after SHA-256 相同，tests hash 略异。两 Run 的 `verifier/result.json.status=passed`。

**Counter / Ambiguity**

- With-Skill 的边界外 list 失败可机械确认为一次无推进调用，但 Artifact 不能说明它是否源于 condition 指令、模型自行尝试，或可重复行为。
- No-Skill 的额外 README/package reads 也不等于有害探索：package 可用于确认测试命令，README 可能用于确认约定；本 Pair 未显示其造成返工或失败。

**Pair-level claim boundary**

本 Pair 支持两臂核心过程与有效结果近似相同，仅外围读取路径不同；不存在足够证据把任一差异解释为过程改善或稳定 condition effect。

### A/t3（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143555194-fa563461`；External Outcome：`failed`（`behavior_not_implemented`）。
- With-Skill：`coding-task-20260902143638956-605498a0`；External Outcome：`passed`。

**Observed process contrast**

- 两臂都完成了 task-relevant workspace inspection；No-Skill 读取 package/README、registry、既有 actions、apply/contracts/tests/index 后，在一次 `workspace_read(src/index.ts)` 返回后以 assistant `stop_reason=error` 终止，没有任何 implementation write、没有 `npm_test`，workspace 无 delta。With-Skill 在相近的核心文件读取后进入完整实现：新增 action、注册、两次测试编辑、单次 `npm_test` 通过。
- 这是 material trajectory divergence：一臂停在 inspection 阶段，另一臂完成 implementation/validation。termination relative to implementation 因此根本不同，而不是普通的 validation/rework 差异。
- With-Skill 开始时也有一次 workspace 外路径的 `workspace_list` 被拒绝，但它随后恢复到 workspace 内；No-Skill 没有 tool error event，最终停止来自 assistant message 的 `stop_reason=error`，Artifact 未给出更具体错误原因。

**Evidence**

- No-Skill Trace：seq 1–20 全为 list/read 及结果；最后 message 为 assistant 空文本、`stop_reason=error`；无 `file_write`、`test` event。`diff.json.files=[]`；Manifest usage 为 4 requests/10 tools；`verifier/result.json.status=failed`、`public_failed_checks=[behavior_not_implemented]`。
- With-Skill Trace：seq 1–2 为越界 list 拒绝；seq 3–18 为 workspace inspection；seq 19/21/23/25 为实现 writes；seq 27–28 为唯一 `npm_test` exit 0。`diff.json` 为 action/registry/tests 三文件 delta；`verifier/result.json.status=passed`。

**Counter / Ambiguity**

- No-Skill 的终止具有明确的 `stop_reason=error`，但没有错误类型、原因或可复现触发条件；它可能是独立于实现策略的模型/Provider/runtime 单次故障。
- Outcome 与 condition 同时不同并不能识别因果。With-Skill 的成功路径本身也包含一次失败的越界调用；它只证明该 Run 在该错误后仍继续，不证明 Skill 防止了另一臂的终止。

**Pair-level claim boundary**

本 Pair 支持：存在显著的 trajectory/outcome divergence，No-Skill 在 inspection 后异常停止且未实现，With-Skill 完成实现、测试并通过。不能支持“Skill prevented failure”或稳定提高完成率；必须与 A/t1/t2 共同校准，且仍受单次未解释 error 的限制。

### B/t1（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143023079-2354e310`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143108160-4578b16f`；External Outcome：`passed`。

**Observed process contrast**

- 两臂均先完整读取 registry/apply/contracts/index、既有 actions 与 tests，再新增 `disable-worker.ts`、注册 handler、扩展 tests，只运行一次 `npm_test` 并通过。核心 handler 判断顺序、稳定 code、state mutation 与 event 语义相同，仅 helper 命名/泛化程度不同。
- No-Skill 首次编辑 tests 时漏掉必需 `path`，tool validation 失败；下一次补全 path 后成功，属于一次明确的 write-call rework。成功测试后又读取 README 才终止。With-Skill 无 write error，测试通过后直接终止，但探索阶段额外读取 `tsconfig.json`。
- 首次 task-relevant file 均可视为 registry（seq 4）；首次实现 write 为 No-Skill seq 19、With-Skill seq 21。seq 次序本身受读取数量和并发 tool results 影响，不形成明确的规划速度优势。

**Evidence**

- No-Skill Trace：seq 3–18 reads；seq 19/21 writes；seq 23–24 是缺少 `path` 的 `workspace_edit` validation error；seq 25–26 修正成功；seq 27–28 `npm_test` exit 0；seq 29–30 测试后读取 README。
- With-Skill Trace：seq 3–20 reads（seq 11 `tsconfig.json`）；seq 21/22/25 writes；seq 27–28 唯一 `npm_test` exit 0，此后终止。
- 两 `diff.json` 均为新增 action、修改 registry/tests；registry after hash 相同。两个 `verifier/result.json.status=passed`。

**Counter / Ambiguity**

- 一次 malformed tool call 和一次测试后 README read 是本 Run 的局部摩擦，没有造成实现代码返工、额外测试或 Outcome 差异。
- With-Skill 请求数较少（6 vs 9）是 usage 机械事实，但这里可观察过程差异混合了 batching/turn 划分，不能等同于更高 task efficiency。

**Pair-level claim boundary**

本 Pair 最多支持：核心过程与结果相同；No-Skill 出现一次可恢复的 malformed edit 并在成功测试后多一次 read，With-Skill 未出现。不能支持稳定减少 rework、稳定效率优势或质量提升。

### B/t2（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143359954-534be3e4`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143327178-4ecca555`；External Outcome：`passed`。

**Observed process contrast**

- 两臂都从 contracts/registry 和既有 action path 入手，读取 tests 后新增 action、注册 handler、补 tests，并以单次成功 `npm_test` 结束；无 validation 后代码返工或 unchanged/no-delta retry，外部 Verifier 均通过。
- material 过程差异集中在 No-Skill 的重复无效读取：先后 4 次调用不存在的 `read` tool（其中两次针对 `test/actions.test.ts`、一次针对 `src/contracts.ts`、一次无 path），全部报 `Tool read not found`；随后才用 `workspace_read` 成功读取 tests。With-Skill 全部使用 `workspace_read`，没有 tool error，并更早进入首次 implementation write（seq 17 vs seq 27）。
- 两臂最终 handler 都采用同一前置条件顺序与 outcome/event，只在 helper/局部变量写法上不同；没有观察到 task-relevant quality 差异。

**Evidence**

- No-Skill Trace：seq 3–7 初始 reads；seq 8–9、15–16、19–20、21–22 为 4 个失败 `read`；seq 25–26 才成功读取 tests；seq 27/29/31 writes；seq 33–34 唯一 `npm_test` exit 0。
- With-Skill Trace：seq 3–16 task-relevant reads；seq 17/18/21 writes；seq 23–24 唯一 `npm_test` exit 0。
- 两 `diff.json` 均只涉及 action/registry/tests，registry after hash 相同；两个 `verifier/result.json.status=passed`。

**Counter / Ambiguity**

- 无效读取明确增加了步骤并延迟写入，但没有导致实现返工或 Outcome 差异；这是 tool selection friction，不足以单独推出总体效率或质量差异。
- B/t1 的 No-Skill 也出现过 tool-call 错误，但错误类型不同（malformed edit vs nonexistent read）；是否属于同一可重复机制需待 B/t3 后判断。

**Pair-level claim boundary**

本 Pair 支持：With-Skill 本次避免了 No-Skill 的 4 次重复无效 read，并沿更直接的 source-read→write→single-test 路径完成；两臂最终实现均通过。不能支持稳定 Skill effect 或任务质量优势。

### B/t3（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143719613-216a3bc5`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143800536-9091bdba`；External Outcome：`passed`。

**Observed process contrast**

- 两臂均读取 registry/apply/contracts/index、既有 actions 与 tests，完成相同三文件类别的实现，并以一次 `npm_test` 成功结束；最终 action 与 registry after hashes 相同，外部 Verifier 均通过。
- No-Skill 在写 tests 时连续经历两次失败：第一次遗漏 `path`；第二次的 anchor 在文件中出现两次而不唯一；第三次提供更具体上下文后成功。这是明确的局部 rework。With-Skill 一次 test edit 成功，无 write rework。
- No-Skill 在实现前做两个不同 query 的 source-wide search（`disable_worker`、`worker.disabled`），它们是确认既有符号/事件是否存在的不同检索，不属于 unchanged 重复；还在成功测试后重读 tests。With-Skill 无 search，测试后直接终止。

**Evidence**

- No-Skill Trace：seq 3–21 reads；seq 22–23 两个不同 `workspace_search` query；seq 27/29 writes；seq 31–32 malformed edit；seq 33–34 non-unique anchor；seq 35–36 corrected edit；seq 37–38 唯一 `npm_test` exit 0；seq 39–40 测试后重读 tests。
- With-Skill Trace：seq 3–20 reads；seq 21/23/25 writes 全部成功；seq 27–28 唯一 `npm_test` exit 0，随后终止。
- `diff.json`：两臂 action 与 registry after SHA-256 相同，tests 内容有组织差异；两 `verifier/result.json.status=passed`。

**Counter / Ambiguity**

- No-Skill 的两次 edit failure 是工具参数/anchor 选择问题，并非实现逻辑被测试否定；成功测试后也没有代码再修改。因此它支持局部过程摩擦，不支持较差实现质量。
- 两个 search 与测试后 read 可能是合理确认步骤；缺少证据证明它们对 task outcome 有害。

**Pair-level claim boundary**

本 Pair 支持：With-Skill 本次采用无 write-error 的直接 edit 路径，No-Skill 对 test edit 做两次可观察修正并有额外确认读取；最终实现与 Outcome 均有效。不能单独支持因果或总体效率结论。

### C/t1（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902082314226-da201d5c`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902082432669-447c5bb8`；External Outcome：`passed`。

**Observed process contrast**

- 两臂都定位 registry/apply/contracts/既有 actions/tests，新增 `cancel-attempt.ts`、注册 handler、分三次编辑 tests，单次 `npm_test` 通过；无测试后代码 rework 或 unchanged/no-delta retry，外部 Verifier 均通过。
- No-Skill 在实现前额外读取 package/README，并做两个 source-wide search；成功测试后又重读 tests。With-Skill 没有这些步骤，但在早期调用不存在的 `read_actions` tool 一次并报错，随后继续正常读取。
- No-Skill 首次 write 为 seq 25，With-Skill 为 seq 19；两者最终 action/tests 写法不同但均满足 Verifier。由于各自都包含外围探索/错误，且没有 elapsed-work normalization，不能仅从 event 序列推出效率提升。

**Evidence**

- No-Skill Trace：seq 3–20 reads；seq 21–24 两个 search；seq 25/27/29/31/33 writes；seq 35–36 唯一 `npm_test` exit 0；seq 37–38 测试后重读 tests。
- With-Skill Trace：seq 3–6 core reads；seq 7–8 `read_actions`/`Tool read_actions not found`；seq 13–18 source/test reads；seq 19/21/23/25/27 writes；seq 29–30 唯一 `npm_test` exit 0。
- 两 `diff.json` 均只涉及 action/registry/tests，registry after hash 相同；两个 `verifier/result.json.status=passed`。

**Counter / Ambiguity**

- No-Skill 的 searches 可能是合理的 absence/consistency check，测试后 read 可能是确认；Artifact 不证明它们无意义。
- With-Skill 自身也有一次无效 tool call，因此差异不是简单的“一臂无摩擦”。Usage 较低（10 requests/14 tools vs 13/19）仍只是机械事实，未被独立映射为任务质量或净效率。

**Pair-level claim boundary**

本 Pair 支持：With-Skill 的本次 path 更短、首次写入更早，但含一次无效 tool 调用；No-Skill 含更多预写入确认与测试后 read；两者任务结果相同。不能支持过程改善、稳定效率或 Skill 质量优势。

### C/t2（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143518168-f878fb2b`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143436830-6b723282`；External Outcome：`passed`。

**Observed process contrast**

- 两臂均完成相同的 core-source inspection、新增 action、注册、两次 tests edit、单次成功 `npm_test`；无 validation 后代码 rework 或 unchanged/no-delta retry，外部 Verifier 均通过。
- No-Skill 在实现前多读 `tsconfig.json` 与 README，成功测试后重读 registry 并 list `src/actions`；With-Skill 没有测试后确认，但最开始尝试 list workspace 外 Skill 路径而被拒绝。首次 write 为 No-Skill seq 23、With-Skill seq 21，差距很小且混合了外围调用。
- Usage 并不沿单一方向表示“更高效率”：With-Skill tools/requests 较少（15/9 vs 18/11），但 total tokens 略高（6,530 vs 6,371）。可观察过程只显示不同的读取/确认组合，不能赋予净效率含义。

**Evidence**

- No-Skill Trace：seq 3–22 reads；seq 23/25/27/29 writes；seq 31–32 唯一 `npm_test` exit 0；seq 33–36 测试后 registry read + actions list。
- With-Skill Trace：seq 1–2 越界 list 被拒；seq 3–20 workspace reads；seq 21/23/25/27 writes；seq 29–30 唯一 `npm_test` exit 0。
- Manifest usage：No-Skill 11 requests/18 tools/6,371 total tokens；With-Skill 9/15/6,530。两 `verifier/result.json.status=passed`；`diff.json` 均为 action/registry/tests 三文件范围。

**Counter / Ambiguity**

- No-Skill 的测试后 inspection 可被理解为 verification supplement，也可能是冗余确认；既没有后续 edit，也没有失败信号来区分。
- With-Skill 的较少 tool calls 与较多 tokens 相互制约；单项 Usage 方向不能替代 task-relevant process 解释。

**Pair-level claim boundary**

本 Pair 最多支持：两臂核心实现/validation 路径与结果相同；No-Skill 做更多外围及测试后确认，With-Skill 有一次初始越界调用。不能支持明确过程改善或效率优势。

### C/t3（sealed）

**Pair identity**

- No-Skill：`coding-task-20260902143842647-11492eba`；External Outcome：`passed`。
- With-Skill：`coding-task-20260902143928101-3fdfe488`；External Outcome：`passed`。

**Observed process contrast**

- 两臂核心路径再次相同：读取 registry/apply/contracts/index、既有 actions/tests，新增 action、注册、两次 tests edit，以一次成功 `npm_test` 验证；无 rework 或 unchanged/no-delta retry，外部 Verifier 均通过。
- No-Skill 额外读取 package/README，并在成功测试后重读 registry；With-Skill 未做这些确认，但最开始的 workspace 外 Skill path list 被拒绝。首次 task-relevant write 为 No-Skill seq 21、With-Skill seq 19。
- With-Skill 的 requests/tools/tokens 均较少（9/14/5,844 vs 10/16/6,316），但 task-relevant semantic difference 仍主要是少读 package/README 与不做 post-test registry confirmation；这不足以自动定义为质量或净效率提升。

**Evidence**

- No-Skill Trace：seq 3–20 reads；seq 21/23/25/27 writes；seq 29–30 唯一 `npm_test` exit 0；seq 31–32 测试后重读 registry。
- With-Skill Trace：seq 1–2 越界 list 被拒；seq 3–18 reads；seq 19/21/23/25 writes；seq 27–28 唯一 `npm_test` exit 0。
- Manifest usage 如上；两 `verifier/result.json.status=passed`；两 `diff.json` 均为 action/registry/tests 范围，registry after hash 相同。

**Counter / Ambiguity**

- No-Skill 的额外 reads 很少且与任务约定/注册确认有关，可能是审慎检查而非浪费。
- With-Skill 更低 usage 与更早 write 在本 Trial 方向一致，但仍混有一次越界失败调用；单个 Pair 不能将机械用量差升级为 process improvement。

**Pair-level claim boundary**

本 Pair 支持：With-Skill 本次少做外围/测试后读取，并以较低机械 usage 完成同样有效结果；No-Skill 也无实现/validation 错误。不能支持质量优势或稳定因果效应。

## 4. Across-Trial Synthesis

### Case A

**Hypothesis A1：With-Skill 在本 Case 更稳定地从 inspection 进入 implementation。**

- t1：两臂都通过；With-Skill first write seq 17，No-Skill seq 23；No-Skill 有两次 nonexistent-tool error。
- t2：两臂都通过；With-Skill first write seq 19，No-Skill seq 21；但 With-Skill 自身先有一次越界 list error，而 No-Skill 只是多读 package/README。
- t3：With-Skill 完成 write/test 并通过；No-Skill 在 inspection 后以未解释的 assistant `stop_reason=error` 终止，无 write/test，Verifier 报未实现。
- Classification：`mixed`。机械上 With-Skill 3/3 都进入 implementation，且在两个可比较的 completed trajectories 中 first-write seq 较早；但 t2 的差距微小且含反向摩擦，t3 主要由原因未知的单次 error 支配。
- Counter / limitation：t1/t2 的最终 implementation/validation pattern 与 Outcome 相同；t3 没有错误类型或复现证据。无法区分 condition-related planning 与随机 Provider/model/runtime stop。
- Maximum supported claim：Case A 中存在一次 material completion divergence，且 With-Skill 三次都进入 implementation；尚不足以形成“Skill 稳定减少探索/防止失败/提高完成率”的过程解释。

### Case B

**Hypothesis B1：No-Skill 在 task-relevant tool interaction 中重复出现需修正的失败调用，With-Skill 未出现。**

- t1：No-Skill test edit 缺少 `path`，一次失败后修正；With-Skill writes 一次成功。
- t2：No-Skill 4 次调用不存在的 `read` tool 后才以 `workspace_read` 继续；With-Skill 无 tool error。
- t3：No-Skill test edit 先缺 `path`、再遇 non-unique anchor，第三次成功；With-Skill一次成功。
- Classification：`repeated`（3/3 方向一致），但摩擦的具体类型不同。
- Counter / limitation：三组两臂都只跑一次 `npm_test` 且通过外部 Verifier；这些是 tool selection/argument/anchor 层的局部摩擦，没有观察到 implementation logic 被 validation 驳回，也没有任务成功差异。
- Maximum supported claim：在 Case B 的三个 frozen trials 中，No-Skill 每次至少出现一次可恢复的失败 tool operation，With-Skill 为 0/3；这支持一个 Case-bounded、可重复的过程差异，但不支持质量提升、成功率提升或一般化 Skill 效果。

**Hypothesis B2：With-Skill 更直接在成功 validation 后终止。**

- t1：No-Skill 测试后读 README；With-Skill 直接终止。
- t2：两臂都直接终止。
- t3：No-Skill 测试后重读 tests；With-Skill 直接终止。
- Classification：`mixed`（2/3 有差异，1/3 相同）。
- Counter / limitation：post-test read 没有引发 edit，既可能是冗余，也可能是审慎确认。
- Maximum supported claim：B 中存在两次 No-Skill 的额外 post-validation read，但不是 3/3 稳定对比，且价值不明。

### Case C

**Hypothesis C1：No-Skill 保持更宽的 pre-write inspection，并在成功测试后继续只读确认；With-Skill 更早写入并在测试后直接终止。**

- t1：No-Skill 读 package/README、做两个 search，first write seq 25，测试后重读 tests；With-Skill first write seq 19，测试后终止。
- t2：No-Skill 额外读 tsconfig/README，first write seq 23，测试后 read registry + list actions；With-Skill first write seq 21，测试后终止。
- t3：No-Skill 读 package/README，first write seq 21，测试后重读 registry；With-Skill first write seq 19，测试后终止。
- Classification：`repeated`（3/3 在 inspection breadth、first-write sequence、post-validation termination 三项方向一致）。
- Counter / limitation：No-Skill 的额外读取都与 repository convention、命令或最终注册状态有关，不能证明是无意义探索；With-Skill 每次也各有一次初始失败调用（t1 nonexistent `read_actions`，t2/t3 越界 Skill-path list）。所有六个 Run 均通过。
- Maximum supported claim：Case C 的 frozen trials 显示一个可重复的 trajectory contrast：No-Skill 更广/更长的只读 inspection 与 post-test confirmation，With-Skill 较早写入且成功测试后直接结束。不能把“更短”升级为“更好”或稳定净效率提升。

**Hypothesis C2：较低 requests/tools 是否表示 task efficiency 提升。**

- t1：With-Skill 10 requests/14 tools，No-Skill 13/19；tokens 7,627 vs 13,818。
- t2：With-Skill 9/15，No-Skill 11/18；但 tokens 6,530 vs 6,371（反向）。
- t3：With-Skill 9/14，No-Skill 10/16；tokens 5,844 vs 6,316。
- Classification：`unclear`。requests/tools 的机械方向为 3/3，且部分对应 C1 的较少外围读取；但 tokens 方向不是 3/3，并且没有 task-quality、必要性或时间归一化证据。
- Counter / limitation：较少调用可能来自 batching；较多只读确认可能有审慎价值；每个 With-Skill Run 仍含一次失败调用。
- Maximum supported claim：只可保留 “With-Skill requests/tools 3/3 较低” 的机械事实及其与较短 trace 的对应，不可称为效率提升。

## 5. Cross-case Observation

`NO_STABLE_CROSS_CASE_PROCESS_PATTERN`

- Case B 的重复模式是 No-Skill 的失败 tool operation，而 Case C 反而是 With-Skill 3/3 各含一次初始失败调用；因此“Skill 普遍减少 tool error”被跨 Case 证据反驳。
- Case C 的 3/3 较宽 No-Skill inspection/post-test confirmation 在 A、B 中并不稳定：A/t1、A/t2 与 B/t2 没有 post-test read，B 仅 2/3 出现。
- A/t3 的 completion divergence 未在 B/C 重复；其未知 `stop_reason=error` 不允许跨 Case 泛化。

## 6. Non-findings / Ambiguities

- 除 A/t3 外，其余 17 个 Run 都完成实现、各运行恰好一次 `npm_test` 且通过外部 Verifier；未观察到 test failure 后的 implementation rework。
- 9 Pair 中未观察到 unchanged/no-delta retry；重复读取/检索只在少数 Pair 出现，且有些 query 不同或承担确认作用。
- 各 Case 中两 condition 通常先定位相同的 registry/contracts/apply/既有 action/tests 路径；没有稳定的“首次 task-relevant file 完全不同”模式。
- 最终 action/test 文件 hash 的差异多为 helper、fixture 或测试组织差异；由于 Verifier 均通过且无进一步判别信号，不能升级为质量差异。
- With-Skill 的 workspace 外 Skill-path/read-actions 失败集中在 A/t2、A/t3 与 C/t1–t3，但 A/t1/B 全部没有同类模式；它不是跨 Case 稳定现象，本 Reference 也不从 Candidate/Skill 解释材料推断其原因。
- Usage 数字受 requests batching、输出长度、额外确认和 A/t3 提前停止共同影响。尤其 A/t3 的低 No-Skill usage 来自未实现即停止，不能解释为效率。

## 7. Scoped Reference Conclusion

当前 9 Pair 支持两个 **Case-bounded、可重复且 task-relevant** 的 process differences：

1. **Case B：失败 tool operation 的重复对比。** No-Skill 3/3 均出现至少一次需修正的失败调用，With-Skill 0/3；但两臂 3/3 都通过，故只支持“过程摩擦较少”的 bounded observation，不支持成功或质量收益。
2. **Case C：inspection/termination trajectory 的重复对比。** No-Skill 3/3 在写入前读取更宽、first write sequence 更晚，并在成功测试后继续 read/list；With-Skill 3/3 更早写入且测试后直接终止。机械 requests/tools 也为 With-Skill 3/3 较低，但 tokens 不一致，额外检查价值不明，故不能称为净效率提升。

Case A 只支持 `mixed` 结论：A/t1、A/t2 的核心实现与 validation 路径近似且都通过；A/t3 存在 inspection 后异常停止 vs 完成通过的显著 divergence，但缺少 error cause，不能声称 Skill prevented failure。

没有得到跨 A/B/C 稳定重复的 process pattern。尤其不支持以下更强解释：Skill 普遍减少探索、普遍减少 tool error、提高任务质量/成功率、提高净效率，或导致 A/t3 Outcome divergence。Reference 的最大边界是对上述 frozen Cases/trials 的描述性、可回查过程对比。

## Completion Gate

- 9/9 Pair 均按规定顺序独立形成并封存 Observation；全部 Pair 先于 Case synthesis。
- 未选择性跳过 Pair；material contrast 与 synthesis 输入均附 Raw Evidence locator。
- Counter / ambiguity 已保留；A/B/C synthesis 已完成；未进行因果升级。
- 未读取 R1/R2 semantic conclusions；未运行新 Coding/Analysis Agent 或 Frozen Trial；未修改源码/Frozen Evaluation；仅新增本 Reference Report。

`P1A_REFERENCE_ANALYSIS_COMPLETE`

`P1A_REFERENCE_READY_FOR_HUMAN_CALIBRATION`
