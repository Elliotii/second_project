# V1-C Current Official DeepSeek Provider Checkpoint

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
checkpoint_date: 2026-08-06
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
real_provider_or_model_call: false
```

## Official current facts

**Fact.** DeepSeek's official Models & Pricing page still lists
`deepseek-v4-flash`, the OpenAI-format base URL `https://api.deepseek.com`,
1M context, maximum 384K output, Tool Calls and thinking/non-thinking modes.
The prices per one million tokens remain USD 0.0028 cache-hit input, USD 0.14
cache-miss input and USD 0.28 output:
[Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/).

**Fact.** The official Chat Completion schema still exposes
`POST /chat/completions`, accepts `deepseek-v4-flash`,
`thinking.type: disabled`, function tools and streamed usage. The usage object
contains prompt, completion, prompt-cache-hit, prompt-cache-miss and total token
fields:
[Create Chat Completion](https://api-docs.deepseek.com/api/create-chat-completion).

**Fact.** The pinned emitted Pi provider descriptor was inspected locally,
without credentials or a Provider/network call:

```json
{"api":"openai-completions","provider":"deepseek","id":"deepseek-v4-flash","name":"DeepSeek V4 Flash","baseUrl":"https://api.deepseek.com","reasoning":true,"input":["text"],"cost":{"input":0.14,"output":0.28,"cacheRead":0.0028,"cacheWrite":0},"contextWindow":1000000,"maxTokens":384000}
```

Its model, base URL, prices, context and output ceiling match the official checkpoint. The Workbench remains
fixed to no fallback, no retry and `thinkingLevel: "off"`; no adapter, Provider/model or Manifest change is required.

## Limit

This checkpoint proves only current schema/profile compatibility. It does not prove Credential validity,
account balance, network reachability, successful model execution or known usage in the next real response.
Any unknown usage/cost or profile drift during Canary must pause without retry or replacement.
