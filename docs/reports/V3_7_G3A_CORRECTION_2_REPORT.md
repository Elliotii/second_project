# V3.7 Goal 3A Correction Round 2 Report

## Status

- **Fact:** Final ordinary Correction round 2 addresses only residual `V37-G3A-MAIN-P1-001` under `V3_7_G3A_CORRECTION_2_AUTHORIZATION.md`.
- **Fact:** Initial Candidate `71dd205e5fea6610d855ababb16dd17d265d83e7` and Correction-1 Candidate `1843a683b958c06147bb17d95f4ed1cc1156ffaf` remain preserved and unamended.
- **Fact:** Goal 3A remains pending Main rereview and independent focused audit; Goal 3B remains locked.

## Bounded correction

- Primary terminal acceptance now loads the frozen workflow, Task instance and global Primary Run binding, requires canonical ordinary stored bytes and exact returned/stored equality, and validates the registered execution declaration and exact access expectation.
- V2 terminals pass the independent `inspectRunV2A` path with exact Task, execution mode, real-access authorization and counters. G3A Primary-pass terminals pass exact-key, Task, workspace Source, Verifier, Outcome and recomputed-digest validation.
- The same Primary validation is rerun from the Read Model before deriving a stage, so a malformed, contradictory, substituted or coherently rehashed-invalid terminal cannot become or remain authoritative.
- G3A now owns a versioned follow-up Provider/access profile union without modifying frozen v1 types. Frozen profiles remain exact zero-access. A later external profile declares exact nonnegative Primary and follow-up observations.
- Future real-declared Cases require both exact Host execution ports and a separate construction-only authorization bound to Case, Manifest, follow-up profile, and both expected counter tuples. Browser/configuration input cannot supply that authorization.
- Follow-up execution and recomputation compare Runtime counters to the Host-loaded follow-up expectation rather than hardcoded zero values.

## Deterministic evidence

- The Main ignored malformed-terminal repro now fails at construction because frozen Case ports cannot be overridden; no Primary receipt can be produced.
- Focused tests prove config-only and ports-only future real Cases remain unavailable, coherently rehashed malformed terminals receive no receipt, and matching Host ports plus explicit construction authority traverse ordinary create/action/read handlers with simulated nonzero formal counters.
- Test instrumentation observed zero Credential reads, network calls, external Provider calls and real-model calls. No real access was performed.
- All thirteen accepted v1 file hashes remain exact. Configuration and fixture bytes are unchanged.

## Verification

| Command | Result |
|---|---|
| G3A authority/Product/HTTP focused suite | PASS, 19/19 |
| Accepted G1/G2 regression suite | PASS, 25/25 |
| V2 regression suite | PASS, 11/11 |
| V3 regression suite | PASS, 19/19 |
| V3.6 Product/HTTP/change-handoff suite | PASS, 10/10 |
| Authorized existing TypeScript compiler with `--noEmit` | PASS, zero errors |
| Exact `npm run typecheck` | Environment limitation: fixed worktree-local compiler path absent |
| G3A demo smoke | PASS; loopback start/stop, project commands 0, Docker commands 0 |

## Scope and access accounting

- Changed paths are limited to the twelve-path Correction-2 allowlist.
- Credential reads: `0`.
- External network calls: `0`.
- External Provider calls: `0`.
- Real-model calls: `0`.
- Dependency installations, Pi changes, configuration/fixture changes, control-state edits, audit, acceptance, Goal 3B work, tags and pushes: `0`.

## Handoff

- **Recommendation:** Create exactly one Correction-2 Candidate commit, then return to Main for a new preliminary rereview. Only a passing Main rereview may freeze the audit Candidate and start a fresh independent read-only focused audit.
