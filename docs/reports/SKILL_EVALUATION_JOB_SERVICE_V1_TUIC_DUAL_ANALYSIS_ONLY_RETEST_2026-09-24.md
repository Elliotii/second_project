# Skill Evaluation Job Service V1：TUIC 双 Analysis-only 复测

日期：2026-09-24
结论：`ONE_REVIEW_PASS / ONE_REVIEW_PROVIDER_TERMINATED / STOPPED_WITHOUT_RETRY`

## 1. 范围与身份

本轮按用户授权只执行一组两个并发 Analysis-only Review，复用现有 Frozen Plan、两份 Thin Mapping 和四个已完成且 Verifier passed 的真实 Coding Run。没有新 Coding Run、HTTP Job、自动重试、源码修改、commit、merge 或 push。

- Workbench commit：`1662c6a5a761ac68189076bc895e95bb5d050f21`
- tree：`aae9a17f9e99ac24235399a466c66f648e233cf8`
- Frozen Plan：`.runs/evaluation-service-specs/small-real-v7-json-mode-1662c6a/frozen-plan.json`
- 模型：`deepseek/deepseek-v4-flash`
- Analysis request timeout：`300000 ms`
- 两份独立 dry-run：均 `ready`，0 Provider request
- 输出根：`D:\AI\analysis-only-tuic-20260924-a`、`D:\AI\analysis-only-tuic-20260924-b`
- 控制日志：`D:\AI\analysis-only-tuic-control-20260924-01`

## 2. TUIC 路径核验

执行前后读取 Clash Verge 的本地 profile 选择状态，只记录非敏感类型结论：当前 `GLOBAL` 指向代理选择组，该组叶子节点标记为 TUIC；`profiles.yaml` SHA-256 为 `99e8a3d5c4570acc5a5ec372f4fd6cf51dc85372e00e5b0babd32c921756e757`，最后修改时间早于本次 Review。

运行时 `Meta` adapter 为 Up 且具有默认路由。Clash service 日志在本地时间 `22:07:12.075` 和 `22:07:12.078` 记录两条从 TUN 地址到 `api.deepseek.com:443` 的 `GLOBAL` TCP 连接，与两个 Review 同时开始对应。相关时段没有 Clash warn/error/fatal、reload、reset 或 timeout 记录；该日志不记录连接关闭原因，因此不能据此排除代理或网络单流故障。

## 3. Review A：完整成功

- Blind Analysis：`14:07:11.898Z` → `14:09:59.094Z`
- 8/8 请求为 normal；最后一次请求正常输出并执行 `update_state`
- 最后请求：headers 后约 56.963 秒完成；43,400 thinking bytes
- controlled-unblind：`14:09:59.104Z` → `14:10:03.560Z`
- JSON Mode 请求正常 stop；正式 State 接纳
- 最终 phase：`human_review_ready`
- State SHA-256：`68a321efd3813e1166f5652ec924c65ec924205c50d1ac633daf83dc490e3f3a`
- controlled root keys：`alignments`、`follow_up_observations`
- 报告：Markdown 12,683 bytes、HTML 17,251 bytes、PDF 130,468 bytes；PDF magic 合法
- 总调用：9 次；16,784 input、37,255 output、30,619 reasoning tokens；USD `0.0130599952`

## 4. Review B：Blind Analysis Provider 失败

- Blind Analysis：`14:07:11.899Z` → `14:11:21.333Z`
- 前 8 次请求 normal；第 9 次失败
- 第 9 次：dispatch `14:08:22.224Z`，HTTP 200 headers `14:08:22.723Z`，message end `14:11:21.332Z`
- classification：`stream_error_after_headers`
- stop/error：`error / terminated`
- headers 后持续约 178.609 秒；收到 92,181 thinking bytes 和 3 个 `read_evidence` ToolCall block
- 没有 `update_state` emitted/executed/persisted/accepted
- 没有 Analysis State 或报告
- 已记账正常响应：9,907 input、13,880 output、12,350 reasoning tokens；USD `0.005517092`

CLI 正确返回 `analysis_provider_error`，没有用“State 未持久化”覆盖 Provider 错误。

## 5. 隔离、安全与清理

- 两个 Review 使用不同输出根和 Session ID，原 Plan、Mapping、Run 与历史 Job 未修改。
- A 的 State/三份报告可读；B 的失败诊断完整保留。
- 两个 Review 及其 loader 子进程均已退出，无残留 Analysis 进程。
- 对两个输出根和 control root 共 14 个文件扫描实际 Credential 值：0 命中。

## 6. 结论边界

**Fact：** TUIC 路径下没有复现“两条流在同一绝对时刻同时终止”。A 在 B 仍运行时已经完整到达 `human_review_ready`。

**Fact：** TUIC 没有消除单条长流 `terminated`；B 仍在收到 HTTP 200 headers 和大量流式内容后失败。

**Inference：** “原 gRPC 单底层连接同时带走两条流”作为对上次双流同时失败的解释被削弱，但尚未被否定。当前结果更强调长时间、大量 reasoning 流自身在 Provider/gateway/代理/网络路径中的脆弱性。

**Unconfirmed：** B 的约 178.6 秒 headers-to-end 接近 180 秒，是值得关注的新时间特征，但当前没有逐 chunk 时间、底层 socket cause、Provider request ID 或外部 timeout 配置，不能断言命中了 180 秒 idle/lifetime 限制。Clash 日志也没有对应关闭事件。

本轮只是 Analysis-only 网络路径诊断，不是完整 HTTP 双 Job E2E。结果为一成一败，不能宣称 TUIC 已修复问题，也不能更新原失败 Job。按授权停止，不进行第二轮、完整双 Job 或配置调优。
