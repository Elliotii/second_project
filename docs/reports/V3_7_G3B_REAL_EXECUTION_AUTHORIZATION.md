# V3.7 Goal 3B Real Execution Authorization

```yaml
status: AUTHORIZED_BY_USER_2026_08_21
user_direction: 授权_继续
execution_owner: /root/v37_g3b_real_execution
execution_baseline_commit: cad4db45421b239b61cb7b3b3052bc8d4167cd4b
execution_baseline_tree: 6b80cb326969c4255ea2c0616ff20e2ca5e150dc
execution_prompt_sha256: 89477cf94887647f131c5b5124c3f8f96c0f383b1af344eee8c972cf4695b7c7
case_id: v37-real-recovery-promote-retain
provider: deepseek
model: deepseek-v4-flash
credential_resolver_invocations_max: 1
provider_requests_max: 105
cost_usd_hard_max: 1.40
retry: 0
fallback: 0
replacement: 0
rerun_after_dispatch: 0
```

## Authority

The user explicitly authorizes the single frozen Goal 3B real execution described by
`V3_7_GOAL_3B_REAL_EXECUTION_PROMPT.md`. This authority permits only the Host-side
DeepSeek traffic, one opaque resolution of the existing Host Credential source, and the
registered Docker `network=none` follow-up command within the frozen per-unit/global
budgets.

The dispatch handoff may name
`D:/AI/AI_Projects/project2/.env.g005` only as an opaque Credential-file path for
`createDeferredCredentialFileResolverV35`. Main and the execution parent shell must not
open, print, hash, size, copy or summarize its value and must not enumerate the
environment.

After any Provider dispatch, Tool/command side effect or unit artifact, an error is final
for this execution identity. No retry, replacement, rerun, task swap, Candidate
reproposal or result hunting is authorized. The fresh Session must return one truthful
execution report without source/configuration/control edits or Git commit.

This authorization does not predetermine PASS. A legal negative path must close
`closed_incomplete`; failure of an accepted production bridge must be reported for Main
disposition.
