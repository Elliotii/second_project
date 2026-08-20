# V3.7 Goal 3B Configuration Freeze Focused Audit

```yaml
status: PASS_V3_7_G3B_CONFIGURATION_FREEZE_FOCUSED_AUDIT
audited_on: 2026-08-21
candidate_commit: f30914378dc90390afce7240b9755d7d24da0850
candidate_tree: 667504572064c00fa170ac5952d8ef0af4a595ad
candidate_parent: e05f261f967cb51da4bec2c2ef2408899d539acf
audit_mode: fresh_independent_read_only_focused
real_access_authorized: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Disposition

**Fact.** The immutable Candidate passes the frozen focused audit. No blocking or
correctable finding was observed. This PASS supports only zero-access configuration
freeze review; it does not freeze an Execution Prompt or authorize Credential, network,
Provider/model, Docker product or real-Case execution.

## Candidate boundary

**Fact.** Commit, tree and parent match the identities above. The Candidate has exactly
nine changed paths:

1. `CURRENT_STATE.md`
2. `docs/reports/V3_7_G3B_CONFIGURATION_FREEZE_PREPARATION_REPORT.md`
3. `workbench/config/v37/g3a/follow-up-execution-profiles/v37-real-recovery-promote-retain.v1.json`
4. `workbench/config/v37/g3a/registered-cases/envelopes/v37-real-recovery-promote-retain.r1.json`
5. `workbench/config/v37/g3a/registered-cases/manifests/v37-real-recovery-promote-retain.v1.json`
6. `workbench/config/v37/g3a/registered-cases/registry-v1.json`
7. `workbench/tests/v37g3a-authority.test.ts`
8. `workbench/tests/v37g3a-http-ui.test.ts`
9. `workbench/tests/v37g3a-product.test.ts`

**Fact.** Accepted deterministic Manifests, Envelopes and follow-up profiles are byte
unchanged. Production source, the registry loader and loader inventory, fixtures,
scripts and `.upstream/pi` have no Candidate delta. `git diff --check` passes.

## Configuration and authority findings

**Fact.** Canonical loader validation and independent digest recomputation pass for the
three-entry, ascending, maximum-sized registry. Manifest, registration-envelope chain,
follow-up profile and registry index resolve to:

| Identity | Observed value |
|---|---|
| Case / Project | `v37-real-recovery-promote-retain` / `v37-real-recovery-project` |
| Manifest | `a1464d12cb1dd509b4b300282fcdb5ebdf59fdf52f55d9bcd49e49aa5bbb262d` |
| Registration | `1e6a74edc68954e044815322ec65c2e163e2258c00b63527d29b0ea12a6dd52a` |
| Follow-up profile | `436dfa8d1f58e1a7c25e0fc4643ece1c3fd8768835c804b42c950bff9b42444c` |
| Registry index | `78fef3c0354afaca0983af2fb636e82ed22e691f2fefb2d29f309b8792fbdc10` |
| Candidate-proposal authority | `e3945b699b9140d374514e20faf3c14b35e778c707a4f6e47ed0b657e8f61150` |
| Regression authority | `3a7e7e603d6e071922b83ba1789aa2056134163a1b3edb04a8af902613bb49da` |

**Fact.** Primary content resolves to Task `v1-parse-duration`, Task file SHA-256
`d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec`,
instruction SHA-256 `cc4c17609f1031774e4be4bc0cc9d8afff671a11f019b2515c304d9a4a1be262`,
source-tree digest `5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa`
and Verifier SHA-256 `0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da`.
The one prompt-addendum content digest is
`1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f`.

**Fact.** Regression is `typescript-verifier-failure`, digest
`296ddaaeac5883c35a2ceb6fec4b3f18ad383af5e78083d3a801c1dea8e11c4e`.
State applicability is exactly `typescript-maintenance/verifier-failure`; State scope
digest is `1242aff9d7257b1cfd95d73ba977307884fd1a617fe735ec5abd1578c9a85419`.
The follow-up is `v37-g1-det-follow-up-clamp-retries`; its Task, Source and Verifier
SHA-256 values are respectively
`4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8`,
`77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11`
and `2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87`.

**Fact.** The real-declared identity is Provider `deepseek`, model
`deepseek-v4-flash`, execution-port kind `injected`. Primary access maxima are
`1/48/48/48`; follow-up maxima are `1/24/24/24` for Credential/network/external-
Provider/real-model counters. These are enforced as maxima under the accepted
counter-maxima semantics, while observed actual counters remain evidence-derived.

**Fact.** With neither the exact construction authorization nor all four Host execution
ports, the real Case loads and lists as `available_for_new_workflow: false`; workflow
creation rejects before workflow identity minting, journal creation, Primary binding,
Run dispatch or receipt persistence. Both accepted deterministic Cases remain available.
The loopback API projects the same unavailable state and does not gain Authority.

**Fact.** The Product test helper replaces the registry's sole `v37-real-*` slot and
re-sorts/re-digests the registry. It does not append a fourth entry. The max-three guard
and its negative coverage remain effective.

## Verification

Focused command, run once from `workbench/`:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="G3A registry|G3B zero-access|loopback API|G3B counter maxima" tests/v37g3a-authority.test.ts tests/v37g3a-http-ui.test.ts tests/v37g3a-product.test.ts
```

Result: **7 passed, 0 failed**, duration `38.6 s` reported by Node (`38.8 s` outer).
Coverage includes registry/configuration, unavailable real Case, loopback projection,
under-cap/at-cap maxima, Primary and follow-up fail-closed negatives, and deterministic
zero-access preservation.

Strict TypeScript command:

```text
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Result: **PASS**, zero diagnostics.

Diff/allowlist, canonical JSON/digest/chain, accepted deterministic-config immutability,
production-source/loader/fixture/Pi immutability and exact content-identity checks all
pass. Actual external operations were `0/0/0/0`.

## Not verified

- Credential resolution, external network and real Provider/model availability.
- Provider catalog freshness, current price and real cost accounting.
- Docker product execution and the seven-unit end-to-end outcome.
- The no-source-edit Execution Prompt, because it is a later control point.
- Full G3A, G1/G2, V2, V3, V3.6 and demo suites; they were intentionally not run, and
  the focused evidence did not justify broadening the audit.

## Next control point

**Recommendation.** Main may accept this zero-access configuration Candidate, freeze its
exact commit/tree as the configuration baseline, and prepare the no-source-edit Goal 3B
Execution Prompt. Real access and execution must remain separately locked pending a new
explicit user decision.
