# V2-A Line-byte Hit-specific Re-audit Report

```yaml
status: completed
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
session_role: fresh_hit_specific_independent_audit_session
candidate_audit_baseline_commit: de6d30c896079c6ae1164646ae55ead8e6a33c09
candidate_tree: 4dc5ca604f9b123e62568beef2fa49a612dd0e57
finding_reaudited: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
recommended_disposition: PASS_V2_A_P1_002_HIT_SPECIFIC_REAUDIT
source_repair_performed: false
control_state_changed: false
git_staged_or_committed: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## 1. Outcome

**Fact.** The assigned P1-002 line-byte finding is closed at Candidate commit
`de6d30c896079c6ae1164646ae55ead8e6a33c09`, tree
`4dc5ca604f9b123e62568beef2fa49a612dd0e57`. The current Inspector preserves
complete raw Session bytes and exact per-record bytes, enforces the pinned Pi
producer's LF-terminated non-empty record shape, compares Candidate A parent
entries and final Session prefix byte-exactly, and retains Candidate B's
no-parent/zero-history rule.

**Fact.** The previously passing coherent trailing-ASCII-space reproduction now
fails closed with both `final Session raw byte prefix` and `parent Session entry
bytes` errors. The committed fresh coherent regression passes, and all six new
authoritative Runs are source-bound, Inspector-valid and fingerprint read-only.

**Recommendation.** `PASS_V2_A_P1_002_HIT_SPECIFIC_REAUDIT`.

This is only the assigned hit-specific disposition. Main retains authority over
the complete Gate J disposition, V2-A final acceptance and every later control
point.

## 2. Gate A

Gate A passed before technical inspection:

- workspace: exactly
  `C:\Users\HUAWEI\.codex\worktrees\7675\project2`;
- HEAD: exactly `de6d30c896079c6ae1164646ae55ead8e6a33c09`;
- tree: exactly `4dc5ca604f9b123e62568beef2fa49a612dd0e57`;
- tracked and staged state: clean;
- initial untracked state: only
  `docs/reports/V2_A_LINE_BYTE_HIT_SPECIFIC_REAUDIT_SESSION_START_PROMPT.md`;
- shared read-only Pi: exactly
  `D:\AI\AI_Projects\project2\.upstream\pi` at
  `027a5847901b5dde30270abaa1041046cd2b4b55`, clean;
- `active_goal`: `V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`;
- final acceptance, V2-B, credentials, network, Provider/model calls,
  dependency installation and Pi changes: unauthorized.

No Gate A Pause Condition was hit.

## 3. Seven-question disposition

### 3.1 Complete raw and record bytes

**Fact - yes.** `workbench/src/inspect-v2.ts:43-48` defines
`ParsedSessionV2A.rawBytes` and `recordBytes`. `parseSession()` at `:277-300`
reads a `Buffer`, retains the full file and obtains exact record slices before
JSON decoding. It does not trim, filter or normalize newline bytes.

### 3.2 Fixed producer format and fail-closed parsing

**Fact - yes.** `parseSession()` requires a non-empty file ending in LF,
rejects a zero-byte record, and rejects CRLF record endings before JSON parsing
(`workbench/src/inspect-v2.ts:280-296`). Whitespace-only records also fail JSON
parsing. The pinned producer writes one `\n` after the header, leaf entries and
ordinary entries at
`D:\AI\AI_Projects\project2\.upstream\pi\packages\agent\src\harness\session\jsonl-storage.ts:217-280`
(`JsonlSessionStorage.create()`, `setLeafId()` and `appendEntry()`). Pi remained
at the pinned clean commit and was not modified.

### 3.3 Candidate A parent-entry equality

**Fact - yes.** `equalRecordBytes()` uses `Buffer.equals()` for equal-length
record arrays (`workbench/src/inspect-v2.ts:303-305`). Candidate A compares all
pre-run entry slices after the header against all frozen parent Session entry
slices and fails on any byte difference (`:594-602`).

### 3.4 Final Candidate exact prefix and later Attempt bytes

**Fact - yes.** The final Candidate Session must be longer than the complete
verified pre-run Session and its raw prefix must equal all pre-run bytes via
`Buffer.equals()` (`workbench/src/inspect-v2.ts:586-592`). The complete final
file is parsed into records; the additional records feed Attempt usage and
terminal derivation. Thus a valid Candidate contains additional parsed Attempt
records rather than a normalized or equal-length substitute.

### 3.5 Candidate B no-parent/zero-history

**Fact - yes.** Candidate B fails if its pre-run header contains
`parentSession` or if it has any pre-run entry (`workbench/src/inspect-v2.ts:603-605`).
The V2-A end-to-end suite passed this invariant.

### 3.6 Coherent trailing-space reproduction

**Fact - yes, fail closed.** The committed P1-002 family at
`workbench/tests/v2a-post-audit.test.ts:128-171` includes the coherent
`trailing-parent-entry-space` variant and requires a parent-entry or raw-prefix
byte error. The family passed. Reinspection of the preserved original
reproduction at
`.runs/v2-a/reaudit/p1-002-trailing-line-bytes-fresh-25480-1786013915811`
returned `integrity_valid: false` and explicitly reported both byte mismatches.

### 3.7 Six authoritative Runs

**Fact - yes.** All six Runs independently returned `integrity_valid: true`.
Each Manifest source digest equals the live `workbench/src` digest
`10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce`;
each before/after evidence fingerprint is equal and matches `SUMMARY.json`; and
each terminal real-access counter is `0/0/0/0`.

## 4. Commands and exit codes

| Command / check | Exit | Result |
|---|---:|---|
| Gate A workspace/HEAD/tree/status/Pi/active-goal assertions | 0 | Exact Candidate and Pi identities; tracked/staged clean; one authorized untracked Prompt |
| `npm run typecheck` | 0 | Strict TypeScript passed |
| `node --test tests/v2a-post-audit.test.ts` | 0 | 5/5 families passed, 0 failed/skipped; P1-002 includes five coherent variants |
| `npm run v2a:test` | 0 | 11/11 passed, 0 failed/skipped |
| Preserved trailing-space reproduction through current Inspector | 0 | Expected `integrity_valid: false`; parent-entry and final-prefix byte errors present |
| Read-only six-Run source/fingerprint/Inspector loop | 0 | 6/6 valid, live-source-bound and fingerprint read-only |
| Evidence identity and old-tree preservation loop | 0 | New root/Summary/Index identities matched; four prior evidence roots preserved |

No full V0/V1 suite, new tamper matrix, deterministic evidence regeneration or
real execution was run.

## 5. Evidence identity

```yaml
authoritative_root: .runs/v2-a/line-byte-corrected-evidence
workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
evidence_tree_digest: 194eff335f018e2138285a96d91d41fd4f5b84a945f3487378e952ab85abeb76
summary_sha256: c80d1cfdd4a6cbf5df116c8152dd7eac4ad417957b1a1a74cf8ed2ec9a3b75b2
evidence_index_sha256: 7bd586f35a0debf0f63da49e9143a8233d5fd41cdcb4203749359e7851b19f52
```

| Run ID | Fingerprint |
|---|---|
| `v2a-line-byte-corrected-authoritative-initial-pass` | `ca6ba2da31e7f5814f1d8096c17e7ab871497096d8711c5e0b307e50b84bb056` |
| `v2a-line-byte-corrected-authoritative-a-pass-b-fail` | `fa8bf72b91295dcf4aa802bb46285620ed96f79d299eb66fae2e3c8c5174ee17` |
| `v2a-line-byte-corrected-authoritative-a-fail-b-pass` | `b154f07b8f041ca81eadb21a3146ed5675d7a93bd07a30ab0f69c9e8238d46de` |
| `v2a-line-byte-corrected-authoritative-a-pass-b-pass` | `f2e4d00ce2ab7a7a485f46f81db169571667127e99d1a380c07cb8fa032e9642` |
| `v2a-line-byte-corrected-authoritative-a-fail-b-fail` | `87a010418ce7210707d98c9c80687d1283b33f3144feb4ab86d5bb214e8cad47` |
| `v2a-line-byte-corrected-authoritative-a-budget-b-pass` | `d86bea9d3cf6e354efd0fe23ce49f0fd7e7d566fc055200221cb0f45ee492751` |

Preserved prior evidence tree digests also matched the correction report:

- `evidence`: `ee5c2bc5edc0088dd779c0094ccbd2fc78b623b421307d9621126f7432c8e2ae`;
- `audit`: `dbd3c53c8056693c2c85548a210024d78157929516423d80e0dfad75fa7ef210`;
- `corrected-evidence`: `53a049a44bae86bac10f641a04175b63e2b4a8da298c387334de55fc5e98f9d0`;
- `reaudit`: `49def50919c32a38abc4fe25a01ec2d2c25419919f835bdc4e3ee855128766b1`.

## 6. Findings

```yaml
blocking_findings: []
non_blocking_findings: []
additional_observations: []
finding_disposition:
  V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION: closed
```

P1-001, P1-003, P1-004 and P1-005 were not reopened or re-audited.

## 7. Claims boundary

This report supports only the deterministic P1-002 claim that the current
Inspector validates exact Session record and prefix byte lineage for the fixed
Pi producer format, with the specified regression and six authoritative Runs.

It does not establish real Provider/model behavior, A/B effectiveness or
strategy superiority, statistical improvement, production durability,
in-flight crash recovery, exactly-once Tool behavior, SDK/Extension/RPC or
third-party integration, V2-B or V3 capability. It does not accept V2-A, pass
the complete Gate J on Main's behalf, modify control state, authorize any real
access or authorize a Pi change.

## 8. Recommended disposition and stop

`PASS_V2_A_P1_002_HIT_SPECIFIC_REAUDIT`

The fresh hit-specific Audit Session stops after this report and returns to
Main. V2-A final acceptance and V2-B remain unauthorized.
