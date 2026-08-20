# V3.7 Goal 3B Host Execution-Port Bridge Audit Remediation Affected-Finding Re-audit

```yaml
status: PASS_V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_AUDIT_REMEDIATION_AFFECTED_FINDING_REAUDIT
audited_on: 2026-08-21
candidate_commit: 4e86f0ecdaa1edc890ada922cfb4ce4e0b9c2227
candidate_tree: 820a212aeeeea3a8f094f8d3f81c3aa28fbaed3e
candidate_parent: a2eab56e0a3b98fb67137d4ec4dfce20256148e4
findings_reaudited:
  - V37-G3B-BRIDGE-AUDIT-P1-001
  - V37-G3B-BRIDGE-AUDIT-P1-002
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_execution: 0
pi_execution: 0
```

## Disposition

**Fact:** PASS. The frozen Candidate has the exact authorized three-path delta, its three
blobs remain byte-identical in the reviewed HEAD, and both affected P1 findings are
closed. No additional finding met the accepted must-fix threshold, and the audit was not
expanded beyond the frozen boundary.

## Affected findings

### V37-G3B-BRIDGE-AUDIT-P1-001 — closed

**Fact:** `Coordinator.reserve` in
`workbench/src/v37/real-execution-ports-v37g3b.ts` synchronously records the exact next
unit or group before an asynchronous Credential, Runtime, Provider, Tool, command or
receipt boundary. A duplicate sees the existing reservation and throws without invoking
`Coordinator.fail`, so it neither dispatches nor faults the legitimate first path.

**Fact:** Primary/Recovery holds one `primary_recovery` reservation while
`Coordinator.complete` records the ordered `primary`, `recovery_a` and `recovery_b`
logical units. Regression equivalently holds one indivisible group across Base and
Candidate. `SharedCredentialLease.resolve` caches the unresolved operation itself, so
concurrent callers share one Promise and the underlying opaque resolver can complete at
most once for the bridge.

**Fact:** The two barrier regressions in
`workbench/tests/v37g3b-real-execution-ports.test.ts` prove that concurrent Primary and
Candidate-stage duplicates are rejected before extra Credential/Runtime/Provider work or
receipt creation, while the first invocation completes and leaves the bridge usable.

### V37-G3B-BRIDGE-AUDIT-P1-002 — closed

**Fact:** Bridge construction and `inspect()` expose exactly two sanitized Runtime
composition identities: `v2b_primary_recovery` and `post_v35_later_stages`. Unit evidence
is bound to the corresponding identity, and one Coordinator reconciles all seven logical
units into one aggregate usage and real-access ledger.

**Fact:** The first composition remains owned and cached by public
`createRealExecutionPortV2B`; its pinned source uses `DEEPSEEK_FIXED_PROFILE_V1`, whose
Provider/model pair is `deepseek` / `deepseek-v4-flash`. The second remains owned and
cached by `createPostV35DeepSeekModelFactory`; its pinned
`GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3` resolves to the same Provider/model pair. Candidate,
both Regression arms and follow-up reuse that one Post-V3.5 Runtime. No public V2B seam
changed.

**Fact:** Both compositions obtain the opaque value through the same
`SharedCredentialLease`; the complete focused route observes exactly one test-local
resolver invocation and one aggregate ledger. The former inaccurate single-Runtime
claim is absent from the corrected implementation report.

## Preserved corrections and profile

**Fact:** The focused route and negative cases preserve all earlier checks:

- Candidate completion occurs only after exact JSON parsing, the 32 KiB stable-JSON
  boundary and `validateProposalAndBuildCandidateV3` validation.
- The actual Candidate request contains the exact Host-loaded template ID/content; the
  positive fake derives its proposal from that captured request.
- The registered daily profile remains `v36_daily_bounded_edit_v2`, with request `16` as
  the observation threshold and `24` as the hard maximum. Follow-up access maxima remain
  `1/24/24/24`.

## Verification

| Check | Result |
|---|---|
| Candidate commit/tree/parent and exact three-path allowlist | PASS |
| Candidate source/test/report blobs equal reviewed HEAD | PASS |
| `git diff --check` over Candidate delta | PASS |
| Bridge focused test | 10 passed, 0 failed |
| G3A/G3B authority test | 6 passed, 0 failed |
| strict TypeScript | PASS, zero diagnostics |
| Actual Credential/network/Provider/model operations | `0/0/0/0` |
| Docker/Pi execution | `0/0` |

Commands:

```text
node --experimental-test-module-mocks --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3b-real-execution-ports.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
git diff --check a2eab56e0a3b98fb67137d4ec4dfce20256148e4..4e86f0ecdaa1edc890ada922cfb4ce4e0b9c2227
```

No broad product, G3A, G1/G2, V2, V3, V3.6, Docker, Pi or real-execution suite was run.
The user-owned untracked evidence-audit report was neither read, modified nor staged.

## Handoff

**Recommendation:** Main may accept this affected-finding re-audit PASS and perform the
next control decision. This report does not accept Goal 3B, freeze an Execution Prompt or
authorize Credential, network, Provider/model, Docker or real execution.
