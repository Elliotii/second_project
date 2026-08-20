# V3.7 Goal 3B Zero-Access Configuration Freeze Preparation Report

```yaml
status: CANDIDATE_READY_FOR_FOCUSED_READ_ONLY_AUDIT
prepared_on: 2026-08-21
candidate_commit: SELF_RESOLVED_BY_COMMIT_CONTAINING_THIS_REPORT
real_access_authorized: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Result

The third and final canonical registry entry is prepared as
`v37-real-recovery-promote-retain`. It reuses the accepted Goal 3A product path and the
frozen `parse-duration` / `clampRetries` content. Without the separately supplied four
Host execution ports and exact construction authorization, ProductService loads the Case
but marks it unavailable and rejects workflow creation before any workflow or Run begins.

## Frozen identities

| Identity | Value |
|---|---|
| Project | `v37-real-recovery-project` |
| Manifest digest | `a1464d12cb1dd509b4b300282fcdb5ebdf59fdf52f55d9bcd49e49aa5bbb262d` |
| Registration digest | `1e6a74edc68954e044815322ec65c2e163e2258c00b63527d29b0ea12a6dd52a` |
| Follow-up profile digest | `436dfa8d1f58e1a7c25e0fc4643ece1c3fd8768835c804b42c950bff9b42444c` |
| Registry index digest | `78fef3c0354afaca0983af2fb636e82ed22e691f2fefb2d29f309b8792fbdc10` |
| Candidate-proposal authority | `e3945b699b9140d374514e20faf3c14b35e778c707a4f6e47ed0b657e8f61150` |
| Regression authority | `3a7e7e603d6e071922b83ba1789aa2056134163a1b3edb04a8af902613bb49da` |

Primary access maxima are `1/48/48/48`; follow-up maxima are `1/24/24/24` for
Credential/network/external-Provider/real-model counters. These are ceilings, not
predicted observations or permission to dispatch.

## Changed files

1. `workbench/config/v37/g3a/registered-cases/manifests/v37-real-recovery-promote-retain.v1.json`
2. `workbench/config/v37/g3a/registered-cases/envelopes/v37-real-recovery-promote-retain.r1.json`
3. `workbench/config/v37/g3a/follow-up-execution-profiles/v37-real-recovery-promote-retain.v1.json`
4. `workbench/config/v37/g3a/registered-cases/registry-v1.json`
5. `workbench/tests/v37g3a-authority.test.ts`
6. `workbench/tests/v37g3a-http-ui.test.ts`
7. `workbench/tests/v37g3a-product.test.ts`
8. `docs/reports/V3_7_G3B_CONFIGURATION_FREEZE_PREPARATION_REPORT.md`
9. `CURRENT_STATE.md`

The Product test helper now replaces the single real registry slot during local
simulation instead of appending an impossible fourth entry. No production source,
loader, deterministic Manifest/Envelope/profile, fixture or Pi file changed.

## Verification

- Focused configuration/maxima/API tests: 7/7 PASS in 35.9 seconds.
- Strict TypeScript: PASS, zero diagnostics.
- Canonical JSON/digest validation and loader reopen: PASS.
- Real Case is registered but unavailable without matching construction authority: PASS.
- `git diff --check`: PASS.
- Actual Credential/external-network/Provider/model operations: `0/0/0/0`.

No complete G3A, G1/G2, V2, V3, V3.6 or demo matrix was run. The focused checks exposed
no shared-regression evidence requiring expansion.

## Unverified and next action

- Real Provider/model availability, Credential resolution, price, cost accounting,
  Docker execution and end-to-end outcome remain unverified and unauthorized.
- Freeze this Candidate commit/tree, run one independent focused read-only configuration
  audit, and only after PASS create the no-source-edit Execution Prompt pinned to the
  accepted configuration baseline.
