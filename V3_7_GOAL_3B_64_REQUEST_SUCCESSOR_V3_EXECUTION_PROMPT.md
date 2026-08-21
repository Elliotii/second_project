# V3.7 Goal 3B 64-Request Successor V3 Execution Prompt

> Status: `FROZEN_PENDING_EXACT_EXECUTION_BASELINE_RECORD`.

Main executes one fresh no-source-edit Identity 3 under the user's one-time retry
direction. Read `AGENTS.md`, `CURRENT_STATE.md`, `V3_7_CHARTER.md`,
`V3_7_G3B_64_REQUEST_SUCCESSOR_V3_CONTRACT.md`, the Identity 1 correction/audit records,
the Identity 2 execution/Main/audit records and this Prompt.

```yaml
execution_identity: v37-g3b-64-request-successor-v3
configuration_candidate_commit: ca33885f4691f00ab9ab90643f8ed5fbc0825bb8
configuration_candidate_tree: ae12fd560f1d6dc802648a682eb5d94f96335f80
corrected_candidate_commit: 8a246e439da6aea1f597eed8e4ab71e57dc1b500
corrected_candidate_tree: c177337c39aba11ec180a4f85fa31437406ea82e
execution_baseline_commit: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
execution_baseline_tree: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
```

Before workflow creation, verify clean tracked state, exact baseline commit/tree,
corrected-Candidate ancestry, this Prompt's Git blob/SHA-256 and exact frozen blobs:

| Frozen path | Git blob |
|---|---|
| real Manifest v2 | `f8caccb526fd32af0cb02bbd62659707c594cdae` |
| accepted Envelope v2 | `bafb6148785f80dd9ae7179c6429b2519228dd3d` |
| follow-up profile v2 | `3813f7b06cffa3ca9d563b7a8aaf3070fe09c621` |
| canonical registry v2 | `4aaaedfeb741a86bd51f33e11f6e836222f42b6f` |
| corrected Host bridge | `77ac7307f2b84508b270e8e77f223c725d3087de` |
| corrected Primary Inspector | `b59163fb72b9fcb2c1514e44b4f76aad1164542b` |

Repeat the accepted local Docker identity/image/zero-leftover checks without pulling.
Use only `deepseek` / `deepseek-v4-flash`, one opaque Credential lease,
`createRealExecutionPortBridgeV37G3B` and `createDeferredCredentialFileResolverV35`.

Create one fresh workflow and invoke each currently available action at most once in this
order: `run_primary`, `run_recovery`, `confirm_recovery_evidence`,
`request_recovery_admission`, `produce_candidate`, `run_regression`, `run_follow_up`,
`confirm_follow_up_evidence`, `request_follow_up_admission`, `assess_state`. Stop at the
first unavailable, negative or invalid stage. A Primary `no_recovery_needed` is final and
must not be forced into Recovery.

Persist only sanitized identifiers, counters, stages, digests and receipts. Never persist
or print Credential values, headers, environment contents, raw Provider payloads or model
text. Close the bridge and return a truthful report. No same-identity rerun or automatic
further successor is authorized.
