# Skill Evaluation Job Service V1：直连双 Analysis-only 复测

日期：2026-09-24
结论：`TWO_REVIEWS_HUMAN_REVIEW_READY / DIRECT_PATH_CONFIRMED / STOPPED_AFTER_ONE_PAIR`

## 1. 范围与身份

本轮按用户授权只执行一组两个并发 Analysis-only Review，复用与 TUIC 对照相同的 Frozen Plan、两份 Thin Mapping 和四个既有真实 Coding Run。没有新 Coding Run、HTTP Job、重试、源码修改、commit、merge 或 push。

- Workbench commit：`1662c6a5a761ac68189076bc895e95bb5d050f21`
- tree：`aae9a17f9e99ac24235399a466c66f648e233cf8`
- Frozen Plan：`.runs/evaluation-service-specs/small-real-v7-json-mode-1662c6a/frozen-plan.json`
- 模型：`deepseek/deepseek-v4-flash`
- Analysis request timeout：`300000 ms`
- 两份独立 dry-run：均 `ready`，0 Provider request
- 输出根：`D:\AI\analysis-only-direct-20260924-a`、`D:\AI\analysis-only-direct-20260924-b`
- 控制日志：`D:\AI\analysis-only-direct-control-20260924-01`

## 2. 直连路径核验

执行前快照：Clash mode 为 `rule`，配置中 TUN disabled；`Meta` adapter 不再为 Up，也不存在 Meta 默认路由。当前进程没有显式 HTTP(S) proxy 环境变量。

使用与 Review 相同的 Node 网络栈，对 `https://api.deepseek.com/` 发起无 Credential HEAD：返回 HTTP 401，证明能够直连到 Provider；请求前后 Clash service log 增加 0 字节、0 条 DeepSeek 记录。

两个 Review 的执行窗口为本地时间约 `22:20:46`–`22:22:59`。Clash 日志该窗口有其他应用流量，但 `api.deepseek.com` 记录为 0。窗口内唯一 warning 是 Review 开始前约 19 秒的无关 ChatGPT 规则节点连接超时，不涉及 DeepSeek。以上证据支持本轮 DeepSeek 请求未经过 Clash/TUN。

## 3. Review A

- Blind Analysis：`14:20:46.979Z` → `14:22:54.971Z`
- 7/7 请求 normal，正式 `update_state` 被执行和接纳
- controlled-unblind：`14:22:54.984Z` → `14:22:59.135Z`
- 1 次 JSON Mode 请求 normal/stop，正式 State 接纳
- 最终 phase：`human_review_ready`
- Provider 请求总数：8
- 最大单请求 headers-to-message-end：49,472 ms
- usage：20,237 input、28,915 output、23,022 reasoning tokens；USD `0.0111322344`
- State SHA-256：`50e29c108479e936a909867f345b8a5d4017c658b66dd6eef71e1eccac77b5c4`
- 报告：Markdown 13,828 bytes、HTML 19,030 bytes、PDF 137,958 bytes；PDF magic 合法

## 4. Review B

- Blind Analysis：`14:20:46.979Z` → `14:22:04.022Z`
- 7/7 请求 normal，正式 `update_state` 被执行和接纳
- controlled-unblind：`14:22:04.031Z` → `14:22:07.444Z`
- 1 次 JSON Mode 请求 normal/stop，正式 State 接纳
- 最终 phase：`human_review_ready`
- Provider 请求总数：8
- 最大单请求 headers-to-message-end：31,202 ms
- usage：15,658 input、16,996 output、12,548 reasoning tokens；USD `0.0071377264`
- State SHA-256：`a3a2f2214b7364081a4b466af2833522b7ffd564c3bcbe918bcc405e54b0b3b5`
- 报告：Markdown 10,763 bytes、HTML 14,804 bytes、PDF 130,360 bytes；PDF magic 合法

两条 State 的 controlled-unblind root 均严格包含 `alignments` 与 `follow_up_observations`。

## 5. 隔离、安全与清理

- 两个 Review 使用不同输出根和 Session ID；Plan、Mapping、Run 与历史 Job 未修改。
- 两个 Review 均由 CLI 报告 `human_review_ready`，各自 State 和三种报告齐全。
- 两个父进程与 loader 子进程均已退出，无残留 Review 进程。
- 对两个输出根和 control root 共 20 个文件扫描实际 Credential 值：0 命中。
- 本轮总记录费用：USD `0.0182699608`。

## 6. 结论边界

**Fact：** 在已证明绕过 Clash/TUN 的直连路径上，两条并发 Analysis-only Review 均完整成功，没有 `terminated`。

**Fact：** 上一轮 TUIC 对照为一成一败；失败流在 headers 后约 178.609 秒终止。本轮直连两个 Review 的最长单请求分别只有 49.472 秒和 31.202 秒，没有形成同样长的流。

**Inference：** 结果提高了“Clash/TUN/代理节点路径是故障贡献因素”的可信度，也说明 Workbench、JSON Mode 和两个并发 Analysis 本身可以同时成功。

**Unconfirmed：** 一组成功不能证明代理路径是唯一根因。因为模型输出具有非确定性，本轮没有产生接近 180 秒的直连请求，所以仍无法区分“代理路径导致长流断开”和“只有极长 Provider 响应才容易终止”。Provider/gateway 的随机故障也未被排除。

该结果只验证既有 Run/Mapping 上的 Analysis-only 链路，不等于一个新的 HTTP Job 从提交到报告完整成功。按授权在这一组结束后停止；是否用当前直连网络再执行完整双 HTTP Job，需要用户另行决定。
