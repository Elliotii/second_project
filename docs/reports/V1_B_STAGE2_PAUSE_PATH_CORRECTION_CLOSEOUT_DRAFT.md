# V1-B P1-004 One-time Micro-correction Closeout Draft

Status: `READY_FOR_MAIN_SESSION_P1_004_REAUDIT`

## Closeout result

**Fact.** The user-authorized one-time micro-correction closes the implementation
side of P1-004 using only `inspect-v1.ts` and `v1b-stage1.test.ts`. No producer,
schema, product, CLI, Manifest or control path changed.

The Inspector now preserves the existing write-ahead `0 -> 1` reservation and
accepts exactly two real Stage-2 external snapshots after reservation:

- `0 / 0 / 0` when the awaited reservation hook prevents dispatch;
- `1 / 1 / 1` when dispatch may have occurred.

It rejects partial/mixed tuples and the coherently rehashed `0 -> 0 + 1/1/1`
forgery. Both valid states retain credential count 1, the complete pending
65,536-token/USD0.10 reservation and full conservative charge. Stage-1 remains
exact zero-access.

## Verification summary

| Check | Result |
|---|---|
| Exact code/test delta | PASS; two files, +26/-1 |
| Strict TypeScript | PASS; exit 0 |
| V1-B focused tests | PASS; 31/31 |
| P1-002/P1-003 regressions | PASS |
| Sequential V1-A/V0-C regressions | PASS; 42/42 |
| Actual credential/network/Provider/model access | PASS; 0/0/0/0 |
| Corrected source digest proposal | `b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92` |

## Evidence and ownership

Authoritative additive evidence:

`C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/stage1/p1-004-micro-correction-authoritative-20260805T160148369/`

**Fact.** No historical evidence was overwritten or deleted. No file was staged
or committed. Candidate `c360ebc4af9ef941252e6aff99638eca00b161e0`
remains rejected.

**Recommendation.** Main Session should review this exact micro-delta, create a
new Candidate only if satisfied, and return it for a P1-004-only re-audit plus
mandatory regressions. Acceptance, control state, final replacement Manifest,
Execution Baseline and any Stage 2 authority remain Main Session decisions.

No fourth correction is authorized. Work stops here.
