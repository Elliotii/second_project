# V3 Harness State Adaptation Precontract Design Review

```yaml
status: accepted_with_binding_calibrations_for_charter
review_disposition: user_accepted_subject_to_2026_08_07_binding_calibrations
review_date: 2026-08-07
scope: read_only_design_review
implementation_authorized: false
active_goal: null
repository_baseline: 3b6406fc142738dd85efa0e9ff6bc2a02dd6289c
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_package: "@earendil-works/pi-agent-core@0.82.1"
prime_agent_commit: b9a4461149419156599d60174dddf15458e2b9ee
v2_disposition: ACCEPT_V2_MECHANISM_EVIDENCE_WITH_NEGATIVE_INCOMPLETE_LIMITATION
```

## 0. Executive decision

外部研究输入的中心方向成立：V3 应在 V0–V2 的可靠运行、Trace、Verifier、隔离和 A/B 基础上，增加一层薄的、受控的 Harness State Adaptation，而不是另建 Agent Runtime、Eval 平台或 Experience 平台。

本审查经用户 binding calibration 后建议把 V3 冻结为三个 implementation Goal：

1. **Goal 1 — Evidence → Candidate State**：从 frozen evidence 形成 Diagnosis / Lesson，经 deterministic fixture 与 bounded model-backed producer 产生 typed `RefinementCandidate`，并把两种 State 安全 staging，但不生效。
2. **Goal 2 — Validate → Promote / Reject / Rollback**：以 symmetric comparator 验证 Candidate，实现 version、active pointer、stale protection、Promote / Reject 和 rollback。
3. **Goal 3 — Selective Reuse & Portfolio Closure**：让已晋级 State 跨 Run 持久化、选择性绑定，并用约 3–5 个行为/回归 Case 及有界真实代表性闭环完成项目收口。

三个 Goal 是 implementation units，不是新增治理层。仍不建议把 Curator、Experience Repository、Router、Memory、Runtime Policy 或大型 Benchmark 作为 V3 完成条件。

外部输入需要四项绑定修正：

1. **V2 复用的是 substrate，不是原样复用其 A/B treatment。** V2 的 A/B 主差异是保留父 Session 历史与 fresh Session；V3 的 Base/Candidate 对照必须采用相同 Session 语义，只让 Harness State 成为 treatment delta。
2. **现有 Trace 能支撑三类 Trigger 的薄投影，但还没有通用 pathology detector。** 不得把现有计数、Session 或 Journal 反向描述成已经实现的语义诊断系统。
3. **Prime 是设计参考，不是可直接复制的 lifecycle。** Prime 的部分 edit 成功、损坏 state 静默退化为空、inverse-edit rollback 和缺少正式 external Promotion Gate，不符合本项目的 fail-closed 与证据权威边界。
4. **Goal 2/Goal 3 的持久化职责必须去重。** Goal 2 实现 store、version 和 active-pointer 机制；Goal 3 只负责把它接入真实跨 Run binding 和行为回归，不再建设第二套状态系统。
5. **Candidate generation 不能停在 fixture/manual-only。** V3 必须有一个薄的 bounded model-backed producer；模型只有 proposal authority，Harness 独占 schema validation、staging、validation、promotion/rejection 与 active mutation authority。
6. **structural trigger 必须有一个真正的结构模式。** 除 recovery-without-improvement 外，至少实现一次由 frozen check identity 与 Tool/Artifact evidence 证明的 repeated fail→edit→same fail cycle；不引入 reasoning Judge。
7. **行为证据软目标为两个真实闭环。** 尽量分别覆盖 prompt addendum 与 adaptive Skill；若第二个被模型噪声、成本或 hard stop 阻塞，最低一个真实闭环加明确 limitation 即可收口。

## 1. Review scope and evidence authority

### 1.1 本轮读取的权威事实

- 最终 V2 repository baseline：`3b6406fc142738dd85efa0e9ff6bc2a02dd6289c`；开始审查时 tracked worktree clean。
- `CURRENT_STATE.md`：`phase: v2_closed_accepted_with_explicit_limitation`、`active_goal: null`、V3 仅为未授权候选。
- `docs/reports/V2_CLOSEOUT.md` 与 `docs/reports/V2_B_CLOSEOUT.md`。
- 当前 `workbench/src/` 与相关 tests。
- 固定 Pi checkout `027a5847901b5dde30270abaa1041046cd2b4b55`，clean。
- 固定 Prime Agent commit `b9a4461149419156599d60174dddf15458e2b9ee`，MIT；重点读取 refinement、system-prompt、agent-session 与对应 tests。
- 外部输入 `第二项目_V3_最终设计研究输入.md`；它是高优先级设计输入，不是工程事实或冻结 Spec。

### 1.2 结论标签

- **Fact**：由固定源码、测试、实际 Git 状态或已接受 Closeout 支持。
- **Inference**：从事实推导的设计解释。
- **Recommendation**：尚待用户通过 Charter / Contract 冻结的建议。
- **Unconfirmed**：需要后续实现或行为证据验证。

本报告不修改 V0–V2 结论，不授权 V3，不冻结预算、Provider、Case 具体内容或实施 Session。

## 2. Corrected final V2 fact baseline

### 2.1 已接受事实

**Fact**：V2-A 已以 `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE` 关闭，建立了：

- immutable `RecoverySeed` / `RecoveryGroup` identity；
- 相同失败 Workspace bytes 的两个隔离 Candidate Workspace；
- Pi public `JsonlSessionRepo` create/open/fork；
- parent Session / Attempt / Workspace lineage；
- write-once Artifact、append-only Journal、外部 Verifier 与 Inspector；
- hard-gate-first deterministic Selection；
- budget、protected path、secret/evidence 与 Pi source identity 检查；
- deterministic initial-pass/no-branch mechanism；
- Pi Core patch 0、private import 0。

**Fact**：V2-B R2 在真实 Provider 路径上，从一个 controlled verifier-failed Seed 运行了两条路径：A 保留失败父 Session，B 使用 fresh Session。两者都通过共同 Verifier，冻结的 V2 Selector 选择 A。

**Fact**：真实 Negative 没有到达 Verifier，因此没有证明“initial pass 时真实执行不创建 recovery branch”。V2 的正式结论是：

```text
ACCEPT_V2_MECHANISM_EVIDENCE_WITH_NEGATIVE_INCOMPLETE_LIMITATION
```

### 2.2 V3 可用与不可用的 V2 结论

V3 可以复用：

- failure/validation boundary；
- Workspace snapshot、copy 与 byte isolation；
- Session repository 和可核验 lineage；
- Provider/Tool/Verifier execution ports；
- Artifact、Journal、Manifest、terminal 与 Inspector；
- budget/credential/protected-path/secret guardrails；
- Candidate comparison 的 hard-gate-first 原则。

V3 不得声称：

- V2 已证明 retained-history 或 fresh-session 普遍更优；
- V2 Negative 已通过；
- V2 Selector 可直接决定 Harness State promotion；
- V2 已实现 Experience、adaptive state、selective binding 或 rollback；
- V2 的一次 real A/B 是统计性或一般性效果证据。

## 3. Existing-code reuse map

| 现有能力 | 真实入口 / Symbol | V3 处理 | 不应做的事 |
|---|---|---|---|
| Direct Pi runtime | `AgentHarness`；`workbench/src/pi/pi-run-handle-v1.ts`、`pi-run-handle-v2b.ts` | 继续作为执行基座；在 Run start 注入已冻结的 prompt/resources | 不切 SDK/Extension/RPC，不改 Pi Core |
| Base system prompt | `workbench/src/prompts/base.ts`：`SYSTEM_PROMPT`、`SYSTEM_PROMPT_SHA256` | 保持 immutable；新增纯函数式 `composeSystemPromptV3()` overlay | 不让 Candidate 编辑 base 文件 |
| Pi prompt composition | Pi `agent-harness.ts`：`createTurnState()`、constructor `systemPrompt` | 每个 Run 一次性组成静态 prompt 并记录 digest | 不在每个 turn 动态读取 mutable active state |
| Pi Skill public path | Pi `skills.ts`：`loadSkills()`、`formatSkillInvocation()`；`AgentHarness.skill()` | adaptive Skill 使用 Pi Markdown/frontmatter 语义和公开调用入口 | 不复制 Prime Python callable Skill 语义 |
| Workbench Skill guardrails | `workbench/src/skill/runtime-v1.ts`：`expectedSkillIdentityV1()`、`loadExactOneSkillV1()` | 复用其 path、link、hardlink、diagnostic fail-closed 模式，写薄的 V3 adapter | 不修改或复用写死的 V1 fixture identity 本身 |
| Pi Session | public `JsonlSessionRepo`；`workbench/src/run-v2.ts` | 验证两臂采用完全相同 Session policy；建议两臂均 fresh | 不让 Session history 与 State 同时成为 treatment |
| Workspace isolation | V2 seed snapshot、temporary copies、tree digest、`assertIndependentFiles` | 直接复用 snapshot/copy/digest 原语 | 不建设第二套 branch runtime |
| External Verifier | `workbench/src/verifier/runner.ts`：`runExternalVerifierV0B()` | 继续是 correctness authority | Candidate 不得修改 verifier、argv、criteria 或 result parsing |
| Evidence | `writeOnceJson()` / `writeOnceBytes()`、`JournalWriterV0B`、terminal artifacts | 记录 Opportunity→Candidate→Validation→Decision→Binding lineage | 不建设通用数据库或新 Trace 平台 |
| V1 treatment proof | `runTreatmentProbeV1()`、`payloadDeltaProofV1()`、`inspect-v1.ts` fairness checks | 用于证明 prompt/skill 是唯一 model-visible delta | 不把 fairness probe 误称为效果 Judge |
| V1 usage/terminal probes | `inspect-v1.ts` 的 verifier、usage、recovery、invalid attribution、budget 检查 | 作为 `inefficient_success` 与 pathology 的结构化输入 | 不引入 thought-quality classifier |
| V2 candidate runtime | `prepareAndFreezeRecoverySeedV2()`、`executeRecoveryCandidateFromSeedV2()`、`executeRecoveryGroupFromSeedV2()` | 复用底层 seed/workspace/session/execution/evidence 原语 | 不原样调用硬编码 continue/fresh treatment 的 V2 controller |
| V2 selector/inspector | `selectCandidateV2A()`、`inspectRunV2A()` | 复用 hard gates、recompute 和 tamper-check 模式 | 不复用 V2 固定 strategy-order tie-break 做 Promotion |

### 3.1 最重要的源码修正

`executeRecoveryCandidateFromSeedV2()` 在 `workbench/src/run-v2.ts:715-731` 根据 strategy 强制：

```text
A -> repo.fork(parent session)
B -> repo.create(fresh session)
```

`executeRunV2A()` 在 `workbench/src/run-v2.ts:1152-1190` 又固定把两臂设置为：

```text
continue_failed_session
fresh_session_from_failure_seed
```

因此，附件中的“直接复用 V2 A/B”必须解释为：**复用 V2 的冻结、隔离、执行、Verifier、Artifact 和 Inspector substrate，新增一个薄的、对称 Session 语义的 V3 intervention comparator**。原样复用会把 Session history 与 Harness State 两个变量混在一起，无法归因。

## 4. Prime bounded source study

### 4.1 固定来源

- Repository：`PrimeIntellect-ai/prime-agent`
- Commit：`b9a4461149419156599d60174dddf15458e2b9ee`
- License：MIT
- 主要源码：[`refinement.ts`](https://github.com/PrimeIntellect-ai/prime-agent/blob/b9a4461149419156599d60174dddf15458e2b9ee/packages/coding-agent/src/core/refinement/refinement.ts)、[`system-prompt.ts`](https://github.com/PrimeIntellect-ai/prime-agent/blob/b9a4461149419156599d60174dddf15458e2b9ee/packages/coding-agent/src/core/system-prompt.ts)、[`agent-session.ts`](https://github.com/PrimeIntellect-ai/prime-agent/blob/b9a4461149419156599d60174dddf15458e2b9ee/packages/coding-agent/src/core/agent-session.ts)
- 主要测试：[`refinement.test.ts`](https://github.com/PrimeIntellect-ai/prime-agent/blob/b9a4461149419156599d60174dddf15458e2b9ee/packages/coding-agent/test/refinement.test.ts)、[`system-prompt.test.ts`](https://github.com/PrimeIntellect-ai/prime-agent/blob/b9a4461149419156599d60174dddf15458e2b9ee/packages/coding-agent/test/system-prompt.test.ts)

### 4.2 源码事实

**Fact**：Prime 的 `RefinementKind` 是 `prompt | memory | skill | subagent`；`HarnessEntry` 有 kind、content、scope、metadata、version；`RefinementProposal` 使用 create/update/delete edits。

**Fact**：`planRefinement()` 与 `applyRefinementProposal()` 分离，并用 planning baseline 检测 apply 前的 state drift。

**Fact**：`saveHarnessState()` 以 temp file + rename 写入；有 local/global state、history、version 和 rollback tests。

**Fact**：Prime 将 Harness State 注入 system prompt，并在 apply 后重建后续 Session 使用的 prompt。

**Fact**：`applyRefinementProposal()` 对每个 edit 独立处理；失败 edit 被记录后继续，其他 edit 仍可落到 state。这是 partial apply，不是 candidate-level atomicity。

**Fact**：`loadHarnessState()` 遇到损坏、不可读或非 object state 时返回 empty state；malformed history line 被跳过。这是 availability-first，不是本项目需要的 fail-closed。

**Fact**：Prime rollback 根据历史生成反向 edits；它没有本项目这种“先外部 A/B 验证，再由独立 Promotion Gate 绑定 active state”的正式边界。

**Fact**：Prime Skill 可包含 callable/call pattern；当前 Pi Workbench Skill 是 Markdown/frontmatter + wrapper，两者不能机械映射。

### 4.3 Adopt / adapt / defer / reject

| Prime 机制 | 决定 | V3 映射 |
|---|---|---|
| Typed Harness State | **adopt** | 限定为 `prompt_addendum`、`adaptive_skill` |
| Unified create/update/delete | **adopt principle** | 共用 `HarnessEditV3`；默认每 Candidate 1 个 coherent edit；若近零额外成本可支持最多 2 个并验证 whole-candidate atomic reject |
| Proposal / apply separation | **adopt** | 扩展为 propose → stage → validate → promote/reject |
| Immutable base + adaptive overlay | **adopt** | Base prompt、base fixtures、Verifier 和 contracts 不可编辑 |
| Small evidence-backed edit | **adopt** | Candidate 必须引用 Opportunity/Diagnosis/Lesson/evidence |
| Version / history | **adopt lightweight** | immutable content-addressed versions + decision log |
| Planning baseline / stale protection | **adapt** | `expected_base_state_digest` 与 active pointer 比较；不做多写者平台 |
| Temp + rename persistence | **adapt** | immutable version write-once；active pointer 以 Windows focused test 验证原子替换 |
| Rollback by inverse edits | **adapt** | 改为把 active pointer 回绑至已接受旧 version；不改写旧版本 |
| Prompt state | **adapt** | 作为 base prompt 后的 canonical `prompt_addendum` overlay |
| Skill state | **adapt** | 转为 Pi `SKILL.md` / frontmatter / `loadSkills()` / `AgentHarness.skill()` |
| Local/global merged scopes | **defer** | V3 只做 project scope；不引入跨项目 global state |
| Memory / subagent kinds | **defer** | 不是 V3 完成条件 |
| Auto-refine | **defer** | V3 保留薄的 bounded model-backed producer，但不做自动触发、自动发布或 continual loop |
| Partial edit apply | **reject** | 任一 edit 无效即拒绝整个 Candidate，active state 不变 |
| Corrupt state silently becomes empty | **reject** | active state/version 损坏必须 fail closed 并保留诊断证据 |
| RLM、persistent IPython、daemon、worker、persistent child agent | **reject for V3** | 与当前 Version Question 无关 |
| Full Prime Verifiers / hosted runtime | **defer** | 已有外部 Verifier 与 V2 substrate 足够 |

## 5. Three Trigger minimal mapping

### 5.1 共同输入门槛

只有同时满足以下条件的 evidence 才能产生 Improvement Opportunity：

```text
integrity_valid == true
terminal_valid == true
identity / lineage / verifier refs are inspectable
failure attribution is not infrastructure/evidence invalid
```

invalid、infrastructure error、cancelled、缺失 Verifier 或证据无法闭合的 Run 是“修 Harness/证据”的输入，不是 adaptive learning evidence。V2-B real Negative 因缺少 Verifier，不能成为 V3 lesson 的事实依据。

### 5.2 最小且互斥的投影

| Trigger | 最小确定性条件 | 复用证据 | 第一版明确不做 |
|---|---|---|---|
| `structural_trajectory_pathology` | 优先级最高：当前 evidence 精确证明同一 frozen check 发生 `fail → intervention/edit → same check → fail`；recovery-without-improvement 可作为第二种结构信号，但不能代替前述必做模式 | frozen command/check identity、Tool call/result IDs、bounded output artifacts；V1/V2 recovery/selection topology | 不从 reasoning text 猜“思维循环”；不做 LLM pathology classifier |
| `hard_failure` | valid terminal + external Verifier failed，且未被上项更具体的 recovery pathology 吸收 | formal Outcome、Verifier result、terminal、Failure Packet | 不把 infrastructure/evidence invalid 归为任务失败 |
| `inefficient_success` | common Verifier 均 pass 的可比 pair 中，某 arm 在冻结的结构/usage vector 上严格更差 | V1/V2 usage、provider/tool counts、recovery count、cost/time | 不做综合 reward；不凭单次微小 cost/time 波动自动 Promote |

一条 evidence chain 默认只产生一个 primary Opportunity，按上表优先级分类，避免同一次失败被重复包装成多条“经验”。

### 5.3 当前能力边界

**Fact**：现有 Inspector 能核验 verifier status、usage、recovery topology、budget、invalid attribution、Session/Workspace lineage 与 evidence integrity。

**Fact**：现有 structural evidence 足以实现一个薄投影而不新增 Trace 平台。`EvidenceMirrorSessionStorageV0B` 保留 Tool Call 的 `name`/安全化 `arguments`、Tool Result text 与 call/result IDs；`run_command` 只接受 frozen `command_id`，其结果包含 `command_id`、argv、exit code、timeout、truncation 与 bounded output；已有 Run 路径也能持久化 Tool audit 和 command executions。因此 Goal 1 可以按时间顺序重算 `same command_id failed -> workspace_edit/write -> same command_id failed`。

**Unconfirmed**：当前没有一个已接受的、通用的 `repeated_speculative_patch`、thought loop 或 semantic action pathology detector。V3 不建设该通用系统，但必须选择一个最便宜的真实 structural pattern：同一 frozen command/check identity 两次失败，中间存在可核验 intervention/edit，且 Tool call/result linkage 与结果 artifact 闭合。

## 6. Contract recommendations

以下是 Precontract 建议，不是已冻结 TypeScript Spec。字段应以 exact-key validation 和 immutable evidence refs 实现。

```ts
type ImprovementTriggerV3 =
  | "hard_failure"
  | "inefficient_success"
  | "structural_trajectory_pathology";

interface ImprovementOpportunityV3 {
  opportunity_id: string;
  trigger: ImprovementTriggerV3;
  source_run_ids: string[];
  evidence_refs: ArtifactRefV0B[];
  observations: Record<string, string | number | boolean>;
  derivation: "deterministic_projection";
}

interface DiagnosisV3 {
  diagnosis_id: string;
  opportunity_id: string;
  pattern_id: string;                 // controlled allowlist
  evidence_refs: ArtifactRefV0B[];
  statement: string;
  derivation: "deterministic_projection" | "authored_interpretation";
}

interface LessonV3 {
  lesson_id: string;
  diagnosis_id: string;
  statement: string;
  expected_outcome: string;
  applicability: ApplicabilityV3;
}

type HarnessEditV3 =
  | { action: "create" | "update" | "delete";
      kind: "prompt_addendum";
      entry_id: string;
      content?: string;
      applicability?: ApplicabilityV3; }
  | { action: "create" | "update" | "delete";
      kind: "adaptive_skill";
      entry_id: string;
      skill_name?: string;
      description?: string;
      markdown_body?: string;
      applicability?: ApplicabilityV3; };

interface RefinementCandidateV3 {
  candidate_id: string;
  source_opportunity_id: string;
  diagnosis: DiagnosisV3;
  lesson: LessonV3;
  expected_base_state_version: number;
  expected_base_state_digest: string;
  edits: [HarnessEditV3];              // V3: one coherent treatment
  validation_plan_ref: ArtifactRefV0B;
  candidate_state_digest: string;
}
```

建议把 Diagnosis / Lesson 放在 Candidate evidence chain 内，而不是建设 Experience Repository。它们解决四个不同问题：

```text
Trigger      -> 为什么值得检查
Diagnosis    -> 证据显示哪个可复用模式
Lesson       -> 从模式中抽象出什么约束/做法
HarnessEdit  -> Harness 具体改变什么
```

Candidate producer 必须同时保留两条入口：deterministic fixture 用于机制测试；薄的 bounded model-backed Refiner 用于从 Frozen Evidence 产生结构化 Diagnosis / Lesson / HarnessEdit proposal。无论来源，只有 host-side mutation controller 能校验、形成 `RefinementCandidate` 和 staging；模型不能写 active state。V3 不建设 LLM Curator 或 autonomous refinement platform。

## 7. Real `prompt_addendum` and `adaptive_skill` paths

### 7.1 `prompt_addendum`

建议路径：

```text
immutable SYSTEM_PROMPT
  + deterministically selected promoted addenda
  -> canonical composition
  -> composed_prompt_sha256
  -> AgentHarness({ systemPrompt: composedPrompt })
```

约束：

- `SYSTEM_PROMPT` 与其 accepted digest 保持不变；
- addendum 使用固定分隔、按 `entry_id` 排序、限制数量和 bytes；
- Run start 后生成静态 composed prompt；active state 即使随后变化，也不得影响该 Run；
- Manifest 记录 base digest、active state version/digest、bound entry IDs/digests、composed prompt digest；
- Base/Candidate validation 两臂都用相同 `.prompt(task)` 路径，只让 composed prompt 不同。

Pi `AgentHarness.createTurnState()` 确实支持 system prompt，但 V3 不应使用 callback 每 turn 重读 mutable store，否则一个 Run 内可能漂移，无法 replay。

### 7.2 `adaptive_skill`

建议路径：

```text
immutable state version
  -> materialized <skill-name>/SKILL.md
  -> Workbench path/link/hardlink scan
  -> Pi loadSkills()
  -> diagnostics == [] and exact identity/digest match
  -> AgentHarness resources
  -> AgentHarness.skill(skillName, taskInstruction)
```

约束：

- 使用 Pi Markdown/frontmatter：name、description、body、`disable-model-invocation`；不支持 Prime callable Python schema；
- Pi loader 的 warning diagnostics 在 Workbench boundary 必须 fail closed；
- 复用 V1 Windows path normalization、link/hardlink、escape 与 collision 检查；
- accepted V1 fixture bytes 不变，V3 materialize 新的 immutable adaptive Skill；
- V3 初期每 Run 最多绑定一个 adaptive Skill，多个 match 时 fail closed；
- Base arm 用普通 prompt，Candidate arm 用 explicit Skill invocation；通过 V1 treatment-proof 模式证明唯一 model-visible delta；
- Manifest 记录 Skill source digest、wrapper digest、name、state entry/version。

这两条路径是真正不同的 mutation surface：一个改变 system instruction overlay，一个通过 Pi Skill resource + invocation 改变可复用程序性指导。它们共用 lifecycle，但不应被实现成同一个“追加字符串”分支。

## 8. State lifecycle and immutable authority boundary

### 8.1 Lifecycle

```text
valid evidence
  -> ImprovementOpportunity
  -> Diagnosis / Lesson
  -> immutable RefinementCandidate
  -> validate all edits against expected base
  -> stage immutable Candidate State
  -> Base vs Candidate intervention validation
  -> CandidateDecision(promoted | rejected)
  -> if promoted: materialize immutable version, atomically bind active pointer
  -> subsequent Run freezes selected binding in Manifest
  -> regression evidence
  -> rollback by pointer rebind when required
```

Candidate-level atomicity 是绑定要求：所有 edit 先在 memory 中完成 schema、authority、stale-base、digest、path 和 adapter validation；任一失败则整个 Candidate rejected，active state 不变。V3 默认每 Candidate 只允许一个 edit；若支持最多两个 coherent edits 几乎没有额外复杂度，应加入 `one valid + one invalid → whole Candidate rejected` 的 deterministic test。最终 claim 只描述 bounded candidate atomicity，不宣称通用 multi-edit transaction system。

### 8.2 Mutable adaptation plane

仅允许：

- `prompt_addendum` content + applicability；
- `adaptive_skill` Markdown/frontmatter content + applicability。

### 8.3 Immutable authority plane

Candidate schema 中根本不提供以下 target：

- External Verifier、Acceptance Criteria、Outcome mapping；
- regression case authority、Promotion comparator/rule；
- Evidence writer、Inspector、Manifest identity；
- protected paths、Tool permission/security、secret/credential/network authority；
- hard provider/tool/token/time/cost ceilings；
- core runtime contracts、accepted base prompt、accepted fixtures、Pi source。

Filesystem 上，state store 位于模型可写 Workspace 之外；Agent/Refiner 只能输出 immutable proposal artifact，不能直接写 active pointer。运行时 Tool profile 也不得暴露 state root 的 write path。

核心规则：

> Agent proposes; Harness validates and disposes. The adaptive layer may change how the Harness acts, but cannot relax how improvement is judged.

## 9. Candidate State, version, active binding and rollback

### 9.1 最小持久化布局

建议由调用方显式传入 host-owned `stateRoot`；本项目 CLI 的原型默认可为：

```text
.runs/v3/state/<project_id>/
  versions/<state_digest>.json
  payloads/<content_digest>/*
  decisions/<decision_id>.json
  active.json
```

它位于每个 Run 目录之外，可跨 Run 复用，但仍是 ignored operational state，不是 Git source 或生产级 durable database。删除 `.runs` 会删除该原型状态，这一限制应在最终 claim 中披露；V3 不为此引入 SQLite 或远程服务。

### 9.2 建议对象

```ts
interface HarnessStateVersionV3 {
  project_id: string;
  version: number;
  parent_state_digest: string | null;
  entries: Record<string, HarnessStateEntryV3>;
  state_digest: string;
  source_candidate_id: string | null;
}

interface ActiveStatePointerV3 {
  project_id: string;
  version: number;
  state_digest: string;
  decision_id: string;
}

interface CandidateDecisionV3 {
  decision_id: string;
  candidate_id: string;
  result: "promoted" | "rejected";
  reason: string;
  validation_evidence_refs: ArtifactRefV0B[];
  prior_active_digest: string;
  next_active_digest: string;
}
```

### 9.3 规则

- version file 和 payload 以 digest 命名，write-once；
- promotion 先完整写入/重读 candidate version，再以 temp + rename 更新 `active.json`；
- apply 前必须核对 Candidate 的 expected base version/digest 等于当前 active；否则 stale reject；
- store corrupt、digest mismatch 或 active 指向缺失 version 时 fail closed，不静默回到 empty/base；
- V3 明确采用 single-writer；不加 lock service、数据库或并发 merge；
- rollback 不生成 inverse edits，不删除 version；它创建新的 immutable decision，并把 active pointer 回绑到已接受旧 digest；
- Run 在开始时 snapshot active pointer 与 bound entries，结束后 Inspector 复核 Manifest 中的 digest，不受后续 pointer 变化影响。

## 10. Reusing the V2 A/B substrate for intervention validation

### 10.1 新增的只是薄 comparator adapter

建议引入一个 V3-specific `InterventionValidationSeedV3`：

```ts
interface InterventionValidationSeedV3 {
  seed_id: string;
  source_kind: "recovery_seed" | "task_baseline";
  source_ref: ArtifactRefV0B;
  workspace_snapshot_digest: string;
  task_digest: string;
  verifier_digest: string;
  tool_profile_digest: string;
  hard_budget_digest: string;
  base_state_digest: string;
  candidate_state_digest: string;
}
```

它复用 V2 的 Workspace snapshot、copy isolation、`JsonlSessionRepo`、execution port、Verifier、Artifact/Journal/Inspector 原语，但不修改 V2 contracts 或 `executeRecoveryCandidateFromSeedV2()`。

### 10.2 Fairness

两臂必须：

- 来自同一个 frozen Workspace snapshot；
- 使用相同 task、instruction、model/provider profile、Tool profile、Verifier、budget 和 hard constraints；
- 使用完全相同 Session policy；V3 首版建议两臂都从 fresh Session 开始；
- A 绑定 accepted base active state；B 绑定 staged Candidate state；
- Manifest 与 payload proof 证明 State 是唯一 treatment delta。

Hard-failure Case 可以引用 V2 RecoverySeed 的 failed Workspace/Failure Packet；ordinary/inefficient-success Case 可以引用 clean task baseline。两者通过同一个 snapshot-based comparator 运行，不建设两套 Eval Runtime。

### 10.3 Promotion comparison

```text
1. evidence / identity / authority / hard budget valid
2. external Verifier correctness
3. frozen regression set
4. structural pathology count
5. tool calls
6. provider calls
7. cost/time (diagnostic unless a materiality rule was predeclared)
```

决策：

| Base A | Candidate B | Decision |
|---|---|---|
| fail | pass | promote，前提是 regression/authority 全通过 |
| pass | fail | reject |
| fail | fail | reject |
| pass | pass | 仅当 B 在冻结的可解释 vector 上严格改善且不退化时 promote；tie/no material improvement 则 reject |

不能使用 V2 的固定 strategy-order secondary tie-break。真实模型单次运行中的微小 cost/time 差异默认只报告，不足以单独 Promote；若未来要用，必须在 Charter/Case 前冻结 materiality rule。

## 11. Minimal applicability and selective binding

### 11.1 Schema

```ts
interface ApplicabilityV3 {
  task_kind: string[];          // small controlled enum frozen by Charter
  failure_class?: string[];     // controlled diagnosis/failure IDs
  verifier_id?: string[];       // exact IDs, optional
}
```

`project_id` 由 state store 隔离，不重复放入每条 entry。匹配规则：

- 有值的维度之间为 AND；
- 同一维度内值为 OR；
- 不做 embedding、LLM ranking、相似度或 learned router；
- 初次 Run 只有 task context，因此只能使用 `task_kind` / `verifier_id`；
- Failure 后的 recovery/subsequent Run 才可使用 `failure_class`；
- prompt addenda 按 `entry_id` 确定性排序；
- 多个 adaptive Skill 同时 match 时 fail closed；
- 无匹配时明确记录 empty binding，而不是隐式加载全部 state。

### 11.2 Binding evidence

每个 Run Manifest 至少记录：

```text
project_id
active_state_version
active_state_digest
binding_context_digest
bound_entry_ids
bound_entry_digests
composed_prompt_digest
bound_skill_source/wrapper digest (if any)
```

Inspector 重算匹配与 composition，验证 irrelevant state 未绑定，并确认 Run 开始后 pointer 变化不会改变已冻结 binding。

这足以证明 selective reuse，不需要 Experience Router。

## 12. Minimal three-Goal implementation plan

### 12.1 Goal 1 — Evidence → Candidate State

**Question**：Harness 如何从执行证据形成一个安全、可审计、尚未生效的 Harness State Candidate？

一个 implementation Goal 内完成：

1. 三类 Trigger 的最小、可重算 projection；
2. Diagnosis / Lesson 与 immutable evidence provenance；
3. deterministic fixture producer 与薄的 bounded model-backed producer；
4. host-side exact schema / authority validation；
5. unified `RefinementCandidate` / `HarnessEdit`；
6. `prompt_addendum` / `adaptive_skill` 两种真实 State adapter；
7. immutable staged Candidate State；accepted base 与 active state 均不改变。

模型只有 proposal authority；Harness 独占 validation 与 staging。Goal 1 不实现 Promotion、active binding 或 Curator platform。

**Exit**：三类 Trigger 各有最小支持；其中 structural trigger 至少有一个真实 frozen-check repeated-failure pattern；两种 State 均可从 deterministic 与 bounded model-backed proposal 形成可审计 staged state；authority target 不可表达；accepted base byte-identical；Candidate 尚未 active。

### 12.2 Goal 2 — Validate → Promote / Reject / Rollback

**Question**：一个 staged Candidate 凭什么成为正式 Harness State？

一个 implementation Goal 内完成：

1. 基于 V2 substrate 的 symmetric intervention comparator；
2. Base/Candidate 相同 task/workspace/model/tools/verifier/hard constraints/session policy；
3. external Verifier、frozen regression 与 structural/usage comparison；
4. good Candidate Promote、bad/no-improvement Candidate Reject；
5. write-once version、atomic active pointer、fail-closed load；
6. stale-base reject、pointer rollback；
7. Inspector 重算与完整 evidence lineage。

**Exit**：Harness State 是唯一 treatment delta；至少证明 `good → promoted`、`bad → rejected`、`promoted → rollback`；accepted V0–V2 authority plane 无变化。

### 12.3 Goal 3 — Selective Reuse & Portfolio Closure

**Question**：已晋级经验如何在后续 Run 中正确、选择性复用？

一个 implementation Goal 内完成：

1. production-facing Run-start state load/freeze/binding；
2. project-persistent active state 与 applicability matcher；
3. irrelevant-state non-binding；
4. Manifest/Inspector 的 active-state version/digest/binding lineage；
5. 约 3–5 个 behavioral/regression Cases；
6. subsequent Run 消费 promoted state；
7. bounded real representative closures；
8. V3 final closeout 与准确 Portfolio claims/limitations。

真实证据软目标是两个闭环，最好分别覆盖 `prompt_addendum` 和 `adaptive_skill`。若第二个闭环被模型噪声、成本或已有 hard stop 明确阻塞，最低一个真实闭环加 explicit limitation 即可正常收口；不得扩成大型 real Eval。

### 12.4 精简治理

- 本报告之后只需要一个 `V3_VERSION_CHARTER.md`；Charter 接受后作为三个 implementation Goals 的共同执行合同，不默认再建每 Goal Contract。
- 三个 Goal 是代码依赖边界，不是 Stage/Gate/Readiness/R1/R2 文档层。
- 每个 Goal 使用一个新的顶层 Dedicated Implementation Session，不以 Main 的 subagent 替代；普通返修返回原 Goal Session。`session separation != governance layer`。
- 普通 compile/test/fixture/schema/path/adapter defect 返回原 Session 修复并跑 focused tests，不创建 Amendment/R1/R2。
- independent audit 不是默认步骤；只有 active-state authority/promotion boundary 出现具体高风险 finding、accepted core contract 被触碰或用户要求时，才做一次 focused audit。
- Goal 1 的 bounded model-backed proposal 可由 Goal 1 Session在独立授权下完成；Goal 3 的真实 behavioral closure 需先冻结实现 baseline，再由新的 no-source-edit Execution Session 执行。这是 source/outcome 权限隔离，不是新 Goal 或 Stage。
- Portfolio claim 获得代码、tests、evidence 支持后立即停止。

## 13. Tests and behavioral/regression cases

### 13.1 Mechanism tests

应使用 focused tests 覆盖：

1. 两种 kind 的 create/update/delete schema validation；
2. 任一 invalid edit 导致 Candidate 整体拒绝，active state byte-identical；
3. accepted base prompt、Verifier、fixtures 和 core contracts bytes 不变；
4. candidate/state content digest 与 version increment；
5. stale expected-base candidate reject；
6. write-once version、active pointer replacement 和 reopen；
7. corrupt/missing/digest-mismatch state fail closed；
8. pointer rollback 保留所有旧 versions/decisions；
9. prompt canonical order、size bound、composition digest；
10. adaptive Skill diagnostics、name/frontmatter、collision、escape、link/hardlink 与 Windows path checks；
11. A/B seed/workspace/session/task/verifier/budget identity 相同，State 是唯一 delta；
12. both-pass/no-material-improvement 不 Promote；
13. Opportunity→Diagnosis→Lesson→Candidate→Validation→Decision evidence refs 完整；
14. deterministic applicability match、irrelevant non-binding、multiple-Skill fail closed；
15. Inspector 可重算 state/version/binding/decision lineage。

现有便宜且高价值的回归应继续运行：V0 evidence/verifier/session tests、V1 Skill/fairness tests、V2 recovery/Inspector tests。无需每次跑大型外部 benchmark。

### 13.2 约 3–5 个 behavioral/regression cases

推荐恰好五个；若三个核心 Case 已同时覆盖后两项，可收缩到三个：

1. **hard failure → prompt addendum**：Base fail，Candidate pass，Promote；subsequent relevant Run 绑定并 pass。
2. **inefficient success → adaptive Skill**：两者 pass，Candidate 明确减少预冻结的结构/tool/provider 指标，Promote；不以微小 cost 差独立决定。
3. **structural recovery pathology**：Recovery 已发生但未改善；Candidate 要么改善并 Promote，要么有证据地 Reject，证明不是强行晋级。
4. **prior-pass regression**：Candidate 不得使已通过的相关/held-out Case 失败。
5. **irrelevant task negative**：promoted state 不匹配且不绑定；随后可用 pointer rollback 证明恢复旧 active state。

不要求 10+ Cases、统计显著性、SWE-bench、blind evaluation 或 Prime Verifiers integration。

其中 Faux Provider / fixtures 负责便宜、稳定的机制和回归覆盖；真实 Pi/Provider evidence 的软目标是两个 representative closures，分别覆盖 prompt addendum 与 adaptive Skill。最低接受线是一个真实闭环加明确 limitation，不能是零真实闭环的 Portfolio closeout。

## 14. Non-goals, risks and hard stops

### 14.1 Non-goals

- Memory、runtime policy、budget/Verifier/selector/security adaptation；
- LLM Router、embedding retrieval、ranking model、Curator platform、Experience DB；
- auto-refine/auto-publish、长期 continual evolution；
- RLM、daemon、persistent IPython、persistent subagent；
- Pi Core 修改、private import、SDK/Extension/RPC 路线切换；
- 第二套 Agent Loop、Trace、Branch、Verifier、Replay 或 Eval runtime；
- production database、multi-writer coordination、distributed lock、OS sandbox；
- large benchmark、统计 superiority 或通用“自进化算法” claim；
- 回头补做或扩展已关闭的 V2-B Negative。

### 14.2 主要风险与最小处理

| 风险 | 最小处理 |
|---|---|
| prompt/skill 只记住原 Case | related/prior-pass/irrelevant regression + applicability |
| State 与 Session 同时变化导致无法归因 | V3 A/B 两臂固定相同 Session policy |
| Candidate 放宽评价标准 | schema 无 authority targets；Verifier/Promotion/Manifest digest 冻结 |
| State store 损坏 | fail closed；immutable versions；active pointer 校验 |
| 并发 stale apply | single-writer + expected base digest；不建 merge service |
| 多 Skill 冲突 | 首版最多一个 match，多个时 fail closed |
| 实际模型噪声导致错误 Promotion | deterministic mechanism first；单次微小 cost/time 不单独决定 |
| `.runs` 被清理 | 披露为 prototype operational persistence；不伪称 production durability |
| adaptive Skill 变成可执行插件 | 首版只允许 Pi Markdown instruction Skill，无 callable/code payload |

### 14.3 Hard stops

出现以下情况停止并回到 Main/用户决策：

1. 必须修改 Pi Core、private import 或切换 SDK/Extension/RPC 才能接入两种 State；
2. 无法让 Base/Candidate 的唯一 treatment delta 保持为 Harness State；
3. adaptive schema 必须允许修改 Verifier、Promotion rule、hard budget/security 或 evidence authority；
4. 无法实现 fail-closed state load、immutable version 或可核验 active binding；
5. prompt_addendum 与 adaptive_skill 实际退化成同一个字符串注入路径；
6. 需要第三种 State、Router、Experience Platform 才能完成当前 claim；
7. 出现无法解释的 material regression；
8. 同一核心 State/lifecycle 设计连续两次实质失败；
9. 需要重写 accepted V0–V2 core contracts，而不是添加 adapter。

普通 TypeScript、fixture、schema、path、prompt wording、focused test 或小 adapter defect 不属于 hard stop。

## 15. Effect on the existing roadmap and recommended next step

### 15.1 对既有规划的实质影响

外部输入没有改变长期主线：V3 仍是 evidence-grounded diagnosis → typed intervention → validation → promotion/rejection → regression/reuse。

它对旧规划产生了合理收缩：

- 从 broad Curator + 多种 Policy 候选，收敛为一个 proposal port 和两种 State；
- 从 T1/T2/T3/T4 的固定重实验表，收敛为约 3–5 个能覆盖相关、prior-pass 和 irrelevant 的轻量 Case；
- 将原 V4 的部分 selective routing 下沉为 deterministic applicability binding，但没有下沉 Router；
- 将 Prime 的 editable state 机制转化为更严格的 external-validation lifecycle；
- 将 V2 “A/B reuse”纠正为 substrate reuse + thin symmetric comparator。

这不是削弱核心能力。相反，它保留了 V3 最有价值的 Portfolio 区分：**适配不只生成 Skill；它可以改变两种 typed Harness State，但不能自行改变成功标准。**

### 15.2 建议下一步

本报告已由用户总体接受并加入 binding calibrations。下一步只起草并审查 `V3_VERSION_CHARTER.md`。Charter 需要冻结：

1. 是否接受两种且仅两种 State；
2. 是否接受 V3-specific symmetric intervention comparator，而非原样 V2 controller；
3. V3 applicability 的最小 deterministic semantics 与 controlled-value boundary；exact field/enum 可由实现决定；
4. prototype persistence 的行为边界；exact stateRoot path 不在 Charter 写死；
5. bounded model-backed Candidate Producer 的 proposal-only authority；
6. 三个 implementation Goals 的 scope、Exit 与 hard stops；
7. 真实闭环软目标 2、最低 1 + limitation；
8. behavioral Case 数量范围（3–5）及必须覆盖的行为，不提前写死 fixture identity；
9. V3 的 Portfolio claims 和 hard stops。

在 Charter 被接受前，不创建 V3 Contract、不激活 Goal、不修改源码、不调用模型、不创建 state store、不提交 Git。

## Relevant files / symbols

### Workbench

- `docs/reports/V2_CLOSEOUT.md` — V2 最终 disposition 与 claim boundary。
- `docs/reports/V2_B_CLOSEOUT.md` — real A/B 与 Negative limitation。
- `workbench/src/prompts/base.ts` — `SYSTEM_PROMPT`、`SYSTEM_PROMPT_SHA256`。
- `workbench/src/skill/runtime-v1.ts` — `expectedSkillIdentityV1()`、`loadExactOneSkillV1()`。
- `workbench/src/pi/pi-adapter-v1.ts` — `runTreatmentProbeV1()`、`payloadDeltaProofV1()`。
- `workbench/src/pi/pi-run-handle-v1.ts` / `pi-run-handle-v2b.ts` — Direct AgentHarness composition、Provider/Tool/usage evidence。
- `workbench/src/run-v2.ts` — `prepareAndFreezeRecoverySeedV2()`、`executeRecoveryCandidateFromSeedV2()`、`executeRecoveryGroupFromSeedV2()`。
- `workbench/src/contracts/v2-types.ts` — `RecoverySeedV2A`、`CandidatePathV2A`、`SelectionDecisionV2A`。
- `workbench/src/recovery/selector-v2.ts` — `selectCandidateV2A()`。
- `workbench/src/verifier/runner.ts` — `runExternalVerifierV0B()`。
- `workbench/src/evidence/artifacts.ts` — `writeOnceJson()`、`writeOnceBytes()`、ArtifactRef validation。
- `workbench/src/evidence/journal.ts` — `JournalWriterV0B` 与 Tool lifecycle closure。
- `workbench/src/inspect-v1.ts` / `inspect-v2.ts` — fairness、usage、recovery、lineage、selection recomputation。
- `workbench/tests/v1a-deterministic.test.ts` — public Skill identity、payload treatment、Manifest/guardrails。
- `workbench/tests/v2a-recovery.test.ts` / `v2a-post-audit.test.ts` — Session/Workspace isolation、selector、tamper resistance。

### Pinned Pi

- `.upstream/pi/packages/agent/src/harness/skills.ts` — `loadSkills()`、`formatSkillInvocation()`、frontmatter/diagnostics。
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — `createTurnState()`、`skill()`、`setResources()`。
- `.upstream/pi/packages/agent/test/harness/skills.test.ts`、`resource-formatting.test.ts`、`agent-harness.test.ts` — public behavior evidence。

### Pinned Prime Agent

- `packages/coding-agent/src/core/refinement/refinement.ts` — typed state、proposal/apply、persistence、history、rollback、stale baseline。
- `packages/coding-agent/src/core/system-prompt.ts` — state reinjection。
- `packages/coding-agent/src/core/agent-session.ts` — apply 后 Session/prompt integration。
- `packages/coding-agent/test/refinement.test.ts` — CRUD、atomic file replace、corrupt-state fallback、history、planning、rollback tests。
- `packages/coding-agent/test/system-prompt.test.ts` — state prompt composition tests。
