# V3.7 Goal 3A Closeout Draft

## Draft disposition

- **Fact:** `IMPLEMENTATION_COMPLETE_CANDIDATE_PENDING_MAIN_REVIEW`.
- **Fact:** This is a Closeout draft only. Goal 3A is not accepted, no audit Candidate is frozen, and Goal 3B remains locked.

## Definition of Done evidence

| Contract item | Evidence | Draft result |
|---|---|---|
| Both deterministic Cases use production actions | Primary-pass terminal and full Recovery → admission → Candidate → regression/State → bound follow-up → retain workflow pass in `v37g3a-product.test.ts` | PASS |
| Multiple workflows isolate identity and artifacts | Cross-workflow isolation test plus Host-owned registration and workflow-scoped journal/artifact roots | PASS |
| Cross-Case and caller authority fail closed | Exact registry/caller-root tests and exact HTTP bodies/actions | PASS |
| Candidate and State come from current formal artifacts | Production service invokes accepted V3 producer, staging, symmetric validation and CAS publication; reopen verifies journal artifact references | PASS |
| Historical disabled workflow is read-only | Disabled-envelope test preserves accepted artifact bytes and rejects further action | PASS |
| Primary PASS exposes no learning path | Primary-pass product test terminates with zero Recovery/Evidence/Candidate actions | PASS |
| UI is non-authoritative and V3.6 remains intact | G3A HTTP/UI 3/3 and V3.6 regressions 10/10 | PASS |
| Accepted G1/G2, V2 and V3 remain intact | 25/25, 11/11 and 19/19 respectively | PASS |
| Strict TypeScript | Accepted equivalent compiler returns zero errors | PASS WITH ENVIRONMENT QUALIFICATION |
| Exact verification and unverified work reported | `V3_7_G3A_IMPLEMENTATION_REPORT.md` | PASS |
| Independent audit and Main acceptance | Not authorized to this implementation Session | PENDING |

## Verification summary

- G3A focused: 12/12 PASS.
- Accepted G1/G2: 25/25 PASS.
- V2: 11/11 PASS.
- V3: 19/19 PASS.
- V3.6 product/HTTP/change handoff: 10/10 PASS.
- Equivalent strict TypeScript: 0 errors.
- Demo smoke: PASS on loopback, zero project/Docker commands.
- Exact `npm run typecheck`: unavailable because `.runs/v0-a/pi/node_modules/typescript/bin/tsc` is absent; no install was authorized or performed.

## Allowlist and preserved baselines

- **Fact:** The Candidate delta is limited to the exact Goal 3A implementation allowlist. `workbench/src/webui/static/i18n.js` is allowed but unchanged.
- **Fact:** `CURRENT_STATE.md`, Charter, Amendment, Prompt, Pi, package/TypeScript configuration, old v1 implementation/configuration, and V2/V3 semantic modules are unchanged.
- **Fact:** All thirteen accepted v1 SHA-256 values match the frozen inventory recorded in the implementation report.
- **Fact:** The pre-existing untracked Case Evidence Audit report remains outside the Candidate.

## Remaining unverified work

- Native ordinary directory-symlink rejection on this Windows Host, because creation was denied with `EPERM`; hardlink and junction equivalents passed.
- Main preliminary review of the immutable Candidate.
- Fresh independent read-only focused audit after Main freezes the Candidate.
- Main Goal 3A acceptance and any subsequent Goal 3B planning/execution.
- All real Case, Provider, model, Credential, network, cost, Docker, and user unguided execution behavior; these are intentionally outside deterministic Goal 3A.

## Scope changes and decisions

- **Fact:** No scope expansion was used. No new product contract, state machine, compatibility layer, Schema 2, evaluation phase, broad hardening suite, retry, fallback, replacement, or third Recovery was introduced.
- **Fact:** No implementation-time user decision is required.
- **Recommendation:** Main should verify the single Candidate commit/tree and allowlist, then either return a bounded correction prompt or freeze it for the independent audit. Goal 3B must remain locked until Goal 3A is formally accepted.
