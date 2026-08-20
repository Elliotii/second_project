# V3.7 Goal 3A Implementation Report

## Status

- **Fact:** Initial Candidate `71dd205e5fea6610d855ababb16dd17d265d83e7` / tree `e1a71cc0858b9f1b23fb54b49e0467e6702f94ed` failed Main preliminary review and remains unamended.
- **Fact:** Authorized Correction round 1 implements only findings `V37-G3A-MAIN-P1-001` through `V37-G3A-MAIN-P2-008` and their necessary deterministic tests.
- **Fact:** The corrected implementation is ready for a new single Candidate handoff. This report does not freeze an audit Candidate, accept Goal 3A, start audit, update control state, or unlock Goal 3B.
- **Fact:** The pre-existing user-owned untracked file `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` was not read, modified, staged, or committed by this Session.

## Delivered behavior

- **Fact:** Product Case discovery comes from the loader-owned, bounded, canonical Host registry. Primary and follow-up execution implementations are Host-constructor ports; the two frozen deterministic adapters remain defaults, while a temporary ignored third registration proved the same service path without product-source modification.
- **Fact:** Post-Primary routing is derived from the referenced formal terminal outcome, not Case ID. Missing, invalid, contradictory, or drifted terminal evidence fails closed.
- **Fact:** Primary dispatch first validates the registered Task JSON, instruction bytes, ordinary source tree, and Verifier bytes against their frozen digests.
- **Fact:** Regression receipts retain the immutable accepted State version and promotion Decision. Two workflows can complete sequentially against a shared State store and both reopen after restart.
- **Fact:** Production workflow IDs use UUID-backed Host identities; deterministic ID injection remains available only through construction-time test ports.
- **Fact:** Workflow journal descendants reject links/reparse points on create, append, and reopen. Formal JSON artifacts must be ordinary singly linked files.
- **Fact:** Registry/config JSON must equal canonical stable JSON plus one terminal newline. The loader fingerprint binds `hash.ts`, both V3.7 contract files, the frozen v1 registry validator, and the G3A loader.
- **Fact:** A completed accepted workflow reopens read-only after a later disabled envelope, preserves its formal artifact/admission/Assessment identities and bytes, and rejects every action.
- **Fact:** The malformed workflow timeline CSS string is corrected and covered by a deterministic quote/declaration-balance guard.
- **Fact:** Browser/API callers cannot inject execution ports or authority. No real Provider, model, Credential, network, Docker, or external command path was added.

## Frozen configuration identities

| Case | Manifest body digest | Registration digest | Registry trust-root digest | Initial State digest |
|---|---|---|---|---|
| `v37-det-primary-pass` | `944ba37fef0491a46005e9bb8c76c11af92a7d3d2f230529fc575306439a2e09` | `b80d6448fdb540b497f94a3430c2097fca8c9dbfd604b1b6bc4294ae7ab2ec1b` | `1139bd550b1a1576e11631ef397b4d552949964fd8f237d4838d481f11a25bcf` | `722571254791053dd7d232bc76c1f4f9c8f92c61eacaf9d5bf91e708fb8a12b0` |
| `v37-det-recovery-promote-retain` | `863775b324f34993fcaf16955e69b5c1a6fc33696ab715c6b03df862326f713b` | `bd9ef4d147169aa598d42338d38e9d38c9af082b532ed39e72fd58bb235a2cf1` | `310a121802b7f94ac9d0ca6451ae76d5ff5751be95a3aa836f7edebb163b068c` | `2e5954a9680a28667105ec93792d7a987b0b52890bc31d9bc239d75e9632a5f8` |

- **Fact:** Loader contract fingerprint: `b46604ca05faa4906d69cb33df6ba8c07fc16d0cc39710c4dd2dbf02b0c7d23e`.
- **Fact:** Registry index and all frozen configuration/fixture bytes are unchanged. The trust-root digests changed only because the accepted loader semantic-source inventory is now complete.

## Correction changed files

- Runtime/authority: `workbench/src/v37/host-registry-v37g3a.ts`, `product-service-v37g3a.ts`, `registered-follow-up-v37g3a.ts`, and `workflow-journal-v37g3a.ts`.
- Read/UI: `workbench/src/read-model/workflow-v37g3a.ts` and `workbench/src/webui/static/styles.css`.
- Tests: `workbench/tests/v37g3a-authority.test.ts`, `v37g3a-product.test.ts`, and `v37g3a-http-ui.test.ts`.
- Reports: this report, `V3_7_G3A_CLOSEOUT_DRAFT.md`, and `V3_7_G3A_CORRECTION_1_REPORT.md`.

## Verification

All commands ran from `workbench/` without installation and were run serially where suites share ignored `.runs/` roots.

| Command | Result |
|---|---|
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts tests/v37g3a-product.test.ts tests/v37g3a-http-ui.test.ts` | PASS, 18/18 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts tests/v37g2-runtime-effective-followup.test.ts` | PASS, 25/25 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts` | PASS, 11/11 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts` | PASS, 19/19 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts` | PASS, 10/10 |
| `npm run typecheck` | Environment limitation: unavailable because the fixed worktree-local `.runs/v0-a/pi/node_modules/typescript/bin/tsc` path does not exist |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | PASS, zero TypeScript errors using the Prompt-authorized existing compiler |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/start-v37g3a-demo.ts --smoke --port 0` | PASS; loopback start/stop; project commands 0; Docker project commands 0 |
| `git diff --check` | PASS |

## Accepted v1 byte inventory

- **Fact:** The focused authority test recalculated and matched all thirteen frozen v1 SHA-256 values. No frozen v1 source or configuration file changed.

## Access and scope accounting

- Credential reads: `0`.
- External network calls: `0`.
- External Provider calls: `0`.
- Real-model calls: `0`.
- Docker/project-command executions: `0`.
- Dependency installations: `0`.
- Pi reads or changes: `0`.
- Schema 2, retry, fallback, replacement, third Recovery, real Case configuration, Goal 3B work, control-state edits, tags, and pushes: `0`.

## Environment qualifications and unverified items

- **Fact:** The Windows Host exercised junction and hardlink rejection deterministically. Ordinary directory-symlink creation remains unavailable under local privileges; the same reparse-point check covers it.
- **Fact:** The exact project typecheck wrapper is unavailable only because its ignored fixed compiler path is absent; the authorized existing compiler passed.
- **Unverified:** Main rereview, Candidate freeze, independent focused audit, Goal 3A acceptance, real Case freeze, Goal 3B, and real execution remain outside this Session.

## Implementation conclusion

- **Recommendation:** Main should verify the new single Candidate commit/tree and allowlist. If preliminary review passes, freeze it for the required fresh independent read-only focused audit. Goal 3B remains locked until Goal 3A acceptance.
