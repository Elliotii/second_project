# V3.7 Charter 本轮修订摘要

本轮对 `V3_7_CHARTER.md` 完成了两项有界修订，并同步更新相关引用、用户审查决策和最终 stop-state。

## 1. 跨 Goal State scope / identity contract

- 在 Charter §4.5 加入跨 Goal V3 State Store scope contract。
- 使用仓库现有 identity 表达 State scope：Host 解析后的规范 `stateRoot` 配置位置、`project_id`、`immutableBasePromptSha256`（即 `runtime_base_prompt_digest`）以及初始 accepted State 的 `state_digest`。
- 保留现有 `ActiveStateIdentityV3` 和 `expected_base_state_digest` 作为活动 State 与 Candidate Base 的点位 identity，不引入新的 `StateRoot` 类型、Store 或持久化层。
- 冻结以下跨 Goal invariant：

  ```text
  Goal 1 Candidate Base State scope
  = Regression publication target State scope
  = Goal 2 follow-up runtime binding State scope
  ```

- Candidate applicability 只能过滤该 scope 内的适用条目，不能选择或重定义另一 scope。
- cross-scope Candidate、Promotion、Binding 或 Follow-up 必须 fail closed。
- Goal 2 follow-up 必须重新打开同一 State Store lineage，不得临时创建、克隆或切换到另一 lineage。

## 2. Registration Runtime Trust Anchor

- 在 Charter §4.2 加入 Registration Runtime Trust Anchor。
- 正式 runtime trust root 是绑定到 baseline 的 Host registry 定义，由以下内容共同组成：
  - accepted repository commit/tree，或 Charter 明确允许的冻结 Host configuration baseline；
  - exact registry location；
  - loader contract/fingerprint；
  - 获准的 Manifest Body 与 Registration Envelope digests。
- Main Session 聊天结论、文字批准及 `approval_policy_id` 字符串本身不构成 Runtime Authority。
- Browser confirmation、caller-supplied digest、Session narrative、人工填写的 approval 字段及 submission package 内附带的 approval record 均不能成为 trust anchor。
- Runtime 和 Inspector 必须从正式 trust root 重新加载 Manifest Body 与 Registration Envelope，并重算 digest 和 envelope chain。
- Package 中的 Manifest、Envelope 或 approval 信息只能作为待核对引用，不能提供 Authority。
- Goal 1 Implementation Prompt 后续必须冻结 exact registry location、loader entry point、accepted repository/configuration baseline、allowed digest inventory 和 trust-root verification procedure。
- 本修订不引入通用签名系统、PKI、Runtime Attestation 或新的 Authority Store。

## 3. 同步引用与状态

- Manifest 和 workflow registration identity 增加对 `state_store_scope_digest` 与 `registry_trust_root_digest` 的绑定。
- Goal 1 的注册 loader、Inspector 和 Candidate Base/applicability 规则改为引用上述唯一 trust root 与 State scope contract。
- Goal 2 的 State loading、frozen binding、Bound Follow-up Evidence 和 G2 canonical normalization 改为携带并核验同一 `state_store_scope_digest`。
- `Decisions requiring user review before implementation` 和最终 stop-state YAML 已同步加入两项精确决策：
  - baseline-bound Host registry 是唯一 Registration Runtime Trust Anchor；
  - Goal 1 Base、Regression publication 与 Goal 2 binding 共用一个跨 Goal State Store scope。

## 4. 边界确认

- 未发现新的 Blocking Conflict。
- 未改变 Goal 1、Goal 2、Goal 3A、Goal 3B 的结构。
- 未改变其他 Bridge、Audit、Correction、预算或真实验收规则。
- 未修改业务源码或测试源码。
- 未开始 Goal 1，未生成 Goal 1 Implementation Prompt。
- 未执行 Provider/model 调用或 Credential 读取。
- 未 commit、tag 或 push。

