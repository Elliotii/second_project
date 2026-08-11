# V3.6 Goal 2 Closeout — Bounded Execution, Change Handoff and Product Acceptance

```yaml
status: closed_accepted
date: 2026-08-11
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
disposition: PASS_V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_REAL_PRODUCT_ACCEPTANCE
accepted_by: Main_Session_under_user_authorized_Full_Ownership_Mandate
control_baseline: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
corrected_implementation_commit: 5ec7d2b0e81e54e2c8a73200e39f45ba631b244f
focused_audit_baseline: dfb63ee6d1b1c6a7cd79944d2318c60eab821e21
focused_audit_disposition: PASS_V3_6_G2_FOCUSED_AUDIT
execution_baseline: 781e95211e7cc6beb572c50ec18e36e0a952b1f9
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
```

## Result

Goal 2 is accepted. The deterministic implementation and the one frozen real product
Journey jointly answer the Contract question:

- registered project commands execute only through the digest-pinned Docker backend;
- the Agent edits only a link-free `managed_session_copy`;
- settled workspace bytes become an immutable, content-addressed ChangeSet;
- browser/model input cannot mint Host execution or Source-write authority;
- Apply/Discard/Export are Host-controlled and revalidate lineage, preimages, scope,
  protected paths, links and blobs;
- the real Journey completed two Turns in one pinned persistent Session, passed the
  frozen external Verifier and applied one authenticated file to registered Source.

This is a bounded product-closure result, not a general sandbox-security or
arbitrary-project-compatibility claim.

## Deterministic evidence

- Main accepted the corrected implementation at
  `5ec7d2b0e81e54e2c8a73200e39f45ba631b244f`.
- Strict TypeScript passed.
- Goal 2 focused tests passed 15/15 with zero remaining `v36g2-*` containers.
- The complete affected V3/V3.5/Post-V3.5/V3.6 regression set passed 79/79, with zero
  failures and zero skips.
- Focused independent audit disposition was `PASS_V3_6_G2_FOCUSED_AUDIT` with no
  findings. Docker runtime evidence was Main-assisted because the audit task sandbox did
  not expose the Docker named pipe; source/evidence inspection remained independent.
- Execution Baseline is
  `781e95211e7cc6beb572c50ec18e36e0a952b1f9`, tree
  `6a54c220d7286560d6e4e0ea52f34c39fb5718ae`.

## Real product evidence

The only authorized Journey used DeepSeek V4 Flash and the frozen dependency-free
duration-parser Case.

| Field | Result |
|---|---|
| Session | `v36-session-0e495322-26c4-47f5-aebb-8fcfce20090d` |
| Runs | `v36-run-36f129e7-82dd-43cf-b357-e8a74645ab0b`, `v36-run-bc42cccf-fa1e-42b2-ab46-427f6e6fe81c` |
| Terminal state | both `settled` |
| Turn 2 prior context | 13 messages; authenticated digest matched provider-observed digest |
| Provider / Tool | 11 requests / 10 calls |
| Tokens / cost | 53,597 / USD `0.0025941608` |
| Credential reads | 2 |
| Verifier | 3/3 passed |
| ChangeSet | one `modify`, digest `c5fff219d7459b98982a5e4f52c8c427ffa159c171e0d95ed546707c012e237d` |
| Host Apply | `applied`, receipt digest `4f755fb65a9d4e62b415fa38639865f73535951601f8555a37093420842077cd` |
| Retry / fallback / replacement | 0 / 0 / 0 |
| Docker leftovers | 0 |

The full evidence and exact commands are in
`docs/reports/V3_6_G2_REAL_PRODUCT_ACCEPTANCE_REPORT.md`; raw artifacts remain ignored at
`.runs/v3-6/g2-real/journey-20260811-01/`.

Two pre-dispatch mechanical launch failures are preserved rather than hidden:

1. PowerShell blocked `npm.ps1` before npm or the product started; `npm.cmd` was used.
2. A Windows `NODE_OPTIONS` path was rejected before the preload, Credential, Provider,
   Docker, Source or evidence roots were touched; the same frozen inputs were launched
   with the correct `file:///` URL.

Neither was a post-dispatch retry or replacement.

## Source, authority and secret boundaries

- The real Execution Session edited no tracked project source or control state and made
  no commit.
- Registered Source began from the frozen three-file fixture. Only
  `src/parse-duration.js` changed, through Host Apply after Verifier PASS.
- Credential values were never printed, hashed, sized, persisted or committed.
- Fixed Pi remained clean at `027a5847901b5dde30270abaa1041046cd2b4b55`.
- No alternate backend, Host command fallback, Pi patch, SDK/Extension/RPC route, extra
  Case, retry, fallback or replacement was used.

## Limitations

Goal 2 does not prove arbitrary untrusted-code security, protection from Docker/Host
compromise, process-crash durability between mutation and receipt persistence,
multi-file atomicity, automatic rollback, exactly-once Tool effects, arbitrary-project
compatibility, multi-backend portability or statistical coding effectiveness.

## Final decision

All Contract exit criteria are supported by deterministic evidence and the single frozen
real Journey. Goal 2 is formally closed and no further Goal 2 Credential, network,
Provider/model or real-execution authority remains.
