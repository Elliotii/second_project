# V3 Goal 1 Bounded Real Proposal Execution Prompt

```yaml
status: authorized_execution_prompt
execution_owner: original_top_level_v3_goal_1_implementation_session
candidate_baseline_commit: 07b81a4cf392854bbbde041f3dafae13b52a768f
candidate_baseline_tree: cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authorized_external_requests: 1
authorized_real_model_calls: 1
provider: deepseek
model: deepseek-v4-flash
hard_cost_cap_usd: 0.20
goal_2_authorized: false
goal_3_authorized: false
pi_modification_authorized: false
source_modification_authorized: false
git_commit_authorized: false
```

你是原 V3 Goal 1 顶层 Implementation Session。Main 已有限验收零调用实现，并创建上方精确 Candidate Baseline。现在只执行一次有界真实 model-backed proposal，验证 Goal 1 的真实 `Evidence -> Opportunity -> Diagnosis/Lesson -> RefinementCandidate -> staged_inactive Harness State` 路径。你不接受 Goal 1，也不进入 Goal 2/3。

## 1. Gate R：真实访问前的只读预检

在读取 Credential 或联网前：

1. 完整重读 `AGENTS.md`、`CURRENT_STATE.md`、`docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`、`docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`、`docs/reports/V3_G1_CLOSEOUT_DRAFT.md`，以及 Goal 1 的 V3 源码和 focused tests。
2. 核验当前 HEAD/tree 精确等于：
   - commit `07b81a4cf392854bbbde041f3dafae13b52a768f`
   - tree `cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d`
3. 核验 tracked/index clean；核验固定 Pi source 和 emitted cache 都是 `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean。读取 Pi 内文件前遵守其 `AGENTS.md`。
4. 运行 strict TypeScript 和 `npm --prefix workbench run v3g1:test`；必须仍分别 PASS 和 13/13、零跳过。
5. 核验 Credential 文件仅存在于 `D:/AI/AI_Projects/project2/.env.g005`。本步只检查存在性，不读取内容。
6. 建立 ignored、write-once 的 `.runs/v3-g1/real-proposal/<execution-id>/`；保存 preflight、精确命令/exit code、候选基线身份和 authority counters。真实 dispatch 前 counters 必须全为 0。

任一步不满足，立即停止；不得读取 Credential、联网、修源码、重试或放宽 Gate。

## 2. 冻结唯一输入

只使用一个 `hard_failure` ImprovementOpportunity。它必须通过当前实现的 `evidenceDigestV3`、`validateFrozenEvidenceV3` 和 `projectImprovementOpportunityV3` 从以下已接受 V2 事实的最小 typed evidence 确定性生成，不由模型生成：

- `evidence_id`: `v2b-controlled-seed-evidence`
- `source_run_ids`: [`v2b-r2-real-20260807-02-primary-positive`]
- validity: integrity/terminal/lineage 均为 true，attribution 为 `verifier`
- outcome: status `failed`，verifier_status `failed`
- task context: `typescript-maintenance` / `verifier-failure`
- evidence ref: tracked `docs/reports/V2_B_CLOSEOUT.md` 的真实 `ArtifactRefV0B`

这与 focused test 的 accepted V2 controlled-Seed projection 一致；它不重开或重写 V2。把 FrozenEvidence、ImprovementOpportunity、完整 model-facing input、各自 canonical digest 和字节数在 dispatch 前写入 ignored evidence。`expected_base_state_digest` 固定为当前 Goal 1 accepted-base identity（预期 `0c667c4b193b4de106107e5dd47782b634920c172a80ba6233509239c9184eb8`），但必须由现有可信代码重算并验证，不可只相信本 Prompt。

## 3. 唯一真实请求边界

- opaque 读取既有 `.env.g005` Credential；不得打印、返回、散列、比较、测量或持久化 secret。
- 只允许向 `https://api.deepseek.com/chat/completions` 发出一次请求，只允许 `deepseek-v4-flash`，不允许 fallback、retry、replacement、第二个模型、第二条 State path 或 tool call。
- 优先复用仓库现有固定 DeepSeek provider/profile 或既有 Workbench transport；可在 `.runs/v3-g1/runtime/` 写 ignored runner，但不得新增或修改 tracked source、依赖或 fixture。
- model-facing input 上限 64 KiB，模型输出上限 32 KiB；`max_tokens` 不超过 4096。若 profile 支持，关闭额外 thinking/reasoning；不要为本次调用增加推理链治理。
- 真实请求前记录不含 secret 的 request projection、最坏成本检查和计数器。硬成本上限 USD 0.20；若无法在 dispatch 前证明上限内，停止。
- 模型只拥有 proposal authority。提示模型仅返回一个纯 JSON object，不得使用 Markdown fence、解释文字或隐藏字段；只提出一个 `prompt_addendum` edit，不得提出 Skill、Verifier、Outcome、active pointer、promotion、routing、tool、budget 或其他 authority 改动。
- JSON 必须精确符合 `RefinementProposalV3`：顶层仅 `schema_version`、`proposal_id`、`evidence_digest`、`expected_base_state_digest`、`diagnosis`、`lesson`、`edits`；`diagnosis.evidence_refs` 必须原样等于 frozen opportunity；`diagnosis.pattern_id` 必须为 `hard_failure`；`lesson.applicability` 与 edit applicability 必须一致；`edits` 必须恰好一个 `prompt_addendum`。

响应必须按原始 JSON 解析。不得剥离 fence、修补字段、再次询问模型或人工重写 proposal。Provider/infrastructure 错误、非 JSON、schema/identity/size/authority 失败都要保留事实后立即停止，不得 retry。

## 4. Host 验证与 inactive staging

把原始 parsed object 交给 `createBoundedModelBackedProducerV3`；Harness 必须自行验证 exact keys、input/output caps、evidence identity、base freshness、evidence refs、applicability、edit authority，并生成 host-derived Candidate identity/digest。

只有 Candidate 合法时，调用 `stageCandidateStateV3`：

- State root 必须位于 Agent tool Workspace 和 accepted-base authority 之外的 Goal-local host-only ignored 目录；
- accepted base prompt/Skill/Verifier/Outcome/active pointer/protected files 的 bytes 不得改变；
- State 必须为 `staged_inactive`，随后通过 `loadStagedStateV3` 重新加载并相等；
- 不运行 Goal 2 comparator，不 promote/reject，不写 active binding，不 rollback，不执行后续 task/regression。

## 5. Authority、报告与停止点

本次最多：Credential read 1、network request 1、external Provider call 1、real model call 1。成功或失败都不得追加 Case、路径、调用、预算或架构。不得修改 Pi、切换 SDK/Extension/RPC、安装依赖、修改 source/test/fixture/Manifest/control state、stage 或 commit Git。

真实执行后唯一允许的 tracked 修改是：

- `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_G1_CLOSEOUT_DRAFT.md`

报告与 ignored Evidence Index 至少记录：精确 baseline、冻结输入/digests/bytes、sanitized request、原始响应的安全副本、usage/cost、解析与 host validation 结果、Candidate/State identities、State manifest、reload 结果、authority counters、protected hashes、Pi 状态、命令与 exit codes。不得泄露 secret 或未授权 reasoning payload。

成功条件：恰好一次真实请求产生合法 evidence-linked `prompt_addendum` Candidate，成功写为可重载的 `staged_inactive` State；所有 authority/protected boundaries 保持不变。成功时建议：

`PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE_PENDING_MAIN_ACCEPTANCE`

失败时按具体事实返回有界 Pause/Fail；不得把“模型给了响应”当作成功。最后在报告中提交结构化 `CURRENT_STATE_UPDATE_PROPOSAL`，但不得修改 `CURRENT_STATE.md`。完成后停止，等待 Main 有限验收和正式收口。
