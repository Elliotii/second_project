# V1-B Stage 2 Current Official Provider Checkpoint

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
checkpoint_date: 2026-08-05
checkpoint_timezone: Asia/Hong_Kong
gate: Contract_Gate_L
disposition: PASS_CURRENT_OFFICIAL_PROVIDER_CHECKPOINT
provider: deepseek
model: deepseek-v4-flash
endpoint: https://api.deepseek.com/chat/completions
thinking_level: off
fallback: false
retry: false
credential_profile: DEEPSEEK_API_KEY
credential_value_read_or_recorded_by_main_session: false
```

## Official current facts

**Fact.** DeepSeek's official current Models & Pricing page lists
`deepseek-v4-flash` and `deepseek-v4-pro`, OpenAI-format base URL
`https://api.deepseek.com`, one-million-token context, maximum 384K output,
Tool Calls support and both thinking/non-thinking modes. For
`deepseek-v4-flash`, the displayed prices per one million tokens are USD 0.0028
cache-hit input, USD 0.14 cache-miss input and USD 0.28 output:
[Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/).

**Fact.** The official Chat Completion schema accepts model
`deepseek-v4-flash`, supports `thinking.type: disabled`, function tools and
stream usage. Its usage object includes prompt, completion, cache-hit,
cache-miss and total token fields:
[Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion).

**Fact.** The frozen Workbench profile remains
`deepseek-v4-flash` at `https://api.deepseek.com/chat/completions`, with no
alternate model, fallback or retry. The pinned emitted Pi provider descriptor
was inspected without a credential or network call and reported:

```json
{"api":"openai-completions","provider":"deepseek","id":"deepseek-v4-flash","name":"DeepSeek V4 Flash","baseUrl":"https://api.deepseek.com","reasoning":true,"input":["text"],"cost":{"input":0.14,"output":0.28,"cacheRead":0.0028,"cacheWrite":0},"contextWindow":1000000,"maxTokens":384000}
```

The descriptor's model, base URL, context, output ceiling and billable price
fields match the official checkpoint. The Workbench explicitly uses
`thinkingLevel: "off"`; no model/profile change is required.

## Budget suitability

**Inference.** Pi exposes known token and computed USD cost values on settled
assistant messages, while V1-B rejects unknown/non-finite/negative usage and
reserves before every Provider request. The current official prices therefore
remain sufficient for the existing fail-closed per-attempt, per-Run and
whole-Pilot budget design.

The profile checkpoint does not prove account balance, credential validity,
network reachability or a successful request. Those remain Stage 2 Gate M and
the first-cell observations. No credential value was printed, serialized or
included in this report.

## Decision

`PASS_CURRENT_OFFICIAL_PROVIDER_CHECKPOINT`.

No descriptor, pricing, usage-schema or fallback drift requiring user choice
was observed. If the first live response exposes unknown usage/cost, a different
model/descriptor, fallback need or any budget-accounting mismatch, Stage 2 must
pause under the accepted exit conditions; it must not select a replacement
model or retry the cell.
