# V3.7 Goal 3A Implementation Report

## Status

- **Fact:** Dedicated zero-access implementation completed from parent commit `5db8fcc2e1f15f35caed1e2a22ab9d222a4708f5` and tree `ace00451046f1fab20e05e6f304e651d3cff0651`.
- **Fact:** The implementation is ready for Candidate handoff. This report does not freeze an audit Candidate, accept Goal 3A, start audit, or unlock Goal 3B.
- **Fact:** The pre-existing user-owned untracked file `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` was not read, modified, staged, or committed by this Session.

## Delivered behavior

- **Fact:** A module-owned Schema-1 G3A Host registry contains exactly two canonical Cases: `v37-det-primary-pass` and `v37-det-recovery-promote-retain`. It accepts at most the Amendment-authorized third later entry, rejects caller-selected registry authority, and derives each Case trust root independently of unrelated registry entries or ordering.
- **Fact:** Workflow registration binds Primary Run identity before execution. All workflow actions reopen the frozen registration and formal artifact chain; receipt or referenced-artifact drift fails closed.
- **Fact:** `v37-det-primary-pass` executes its registered task and external verifier locally, terminates `passed`, and exposes no Recovery, Evidence, Candidate, Regression, follow-up, or assessment action.
- **Fact:** `v37-det-recovery-promote-retain` uses the accepted V2 deterministic controller for Primary/Recovery, the existing V3 Candidate and symmetric regression/State publication paths, the accepted V3.6 bound follow-up runtime, and an additive G3A adapter into the unchanged G2 assessment decision.
- **Fact:** Multiple workflows remain isolated. Disabled registration blocks new mutation while an already accepted workflow reopens read-only with its accepted historical artifacts preserved.
- **Fact:** The loopback application exposes exact Host-owned actions. Browser request bodies cannot supply Task, Source, Verifier, Candidate, State, decision, runtime, registration, or artifact authority. Existing V3.6 routes and bilingual product controls remain available.
- **Fact:** A deterministic zero-access demo entry point starts only on `127.0.0.1` and reports zero project-command and Docker-command executions in smoke mode.

## Frozen configuration and source identities

| Case | Manifest body digest | Registration digest | Registry trust-root digest | Initial State digest |
|---|---|---|---|---|
| `v37-det-primary-pass` | `944ba37fef0491a46005e9bb8c76c11af92a7d3d2f230529fc575306439a2e09` | `b80d6448fdb540b497f94a3430c2097fca8c9dbfd604b1b6bc4294ae7ab2ec1b` | `9ce6f5c2957e6e167179c057b2e407db1720d1df08e025b0e7c7f4630943146f` | `722571254791053dd7d232bc76c1f4f9c8f92c61eacaf9d5bf91e708fb8a12b0` |
| `v37-det-recovery-promote-retain` | `863775b324f34993fcaf16955e69b5c1a6fc33696ab715c6b03df862326f713b` | `bd9ef4d147169aa598d42338d38e9d38c9af082b532ed39e72fd58bb235a2cf1` | `370f66684191ae265f89191e3f1b48de04db9f74580746c8e484730bdd6ad4fc` | `2e5954a9680a28667105ec93792d7a987b0b52890bc31d9bc239d75e9632a5f8` |

- **Fact:** Registry index digest: `c7a10d388123a056a8e467d7d5eb34b2e211a59d64f0a24912006c4dabbd04c8`.
- **Fact:** Primary-pass Task SHA-256: `9f223770a36e3377d20e5a4e5c03ddef062f3133630335782884df9bda4d2f45`; Source tree digest: `1fc19532be18b1f82c90457e68e92de6742ca1f3a93e971e005de9c2b7297c68`; verifier source SHA-256: `0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da`.
- **Fact:** Recovery Case retains the accepted Task digest `d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec`, Source tree digest `5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa`, and verifier source SHA-256 `0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da`.

## Changed files

- Configuration: `workbench/config/v37/g3a/registered-cases/registry-v1.json`; both files below each of `registered-cases/manifests/`, `registered-cases/envelopes/`, and `follow-up-execution-profiles/` for `v37-det-primary-pass` and `v37-det-recovery-promote-retain`.
- Primary-pass fixture: `workbench/fixtures/v37g3a/primary-pass/instruction.md`, `task.json`, `workspace/package.json`, `workspace/src/subject.ts`, and `workspace/test/public.test.mjs`.
- Contracts and G3A Host modules: `workbench/src/contracts/v37g3a-types.ts`, `workbench/src/v37/host-registry-v37g3a.ts`, `workflow-registration-v37g3a.ts`, `registered-recovery-v37g3a.ts`, `candidate-v37g3a.ts`, `follow-up-execution-profile-v37g3a.ts`, `registered-follow-up-v37g3a.ts`, `workflow-journal-v37g3a.ts`, and `product-service-v37g3a.ts`.
- Read/product integration: `workbench/src/read-model/workflow-v37g3a.ts`, `workbench/src/inspect-v37g3a.ts`, `workbench/src/state/state-feedback-g2.ts`, `workbench/src/webui/application-v37g3a.ts`, and `workbench/src/webui/server-v36g1.ts`.
- Static/demo: `workbench/src/webui/static/index.html`, `app.js`, `styles.css`, and `workbench/scripts/start-v37g3a-demo.ts`. `i18n.js` was not changed.
- Tests: `workbench/tests/v37g3a-authority.test.ts`, `v37g3a-product.test.ts`, and `v37g3a-http-ui.test.ts`.
- Reports: this report and `docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md`.

## Verification

All commands ran from `workbench/` without installation.

| Command | Result |
|---|---|
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts tests/v37g3a-product.test.ts tests/v37g3a-http-ui.test.ts` | PASS, 12/12 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts tests/v37g2-runtime-effective-followup.test.ts` | PASS, 25/25 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts` | PASS, 11/11 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts` | PASS, 19/19 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts` | PASS, 10/10 |
| `npm run typecheck` | Environment limitation: did not start because the worktree-local fixed path `.runs/v0-a/pi/node_modules/typescript/bin/tsc` does not exist |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | PASS, 0 TypeScript errors using the already accepted equivalent compiler |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/start-v37g3a-demo.ts --smoke --port 0` | PASS; loopback start/stop; project commands 0; Docker project commands 0 |
| `git diff --check` | PASS |

## Accepted v1 byte inventory

The focused authority test recalculated and matched every frozen SHA-256:

```text
cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b  workbench/config/v37/registered-cases/registry-v1.json
39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2  workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3  workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9  workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
df4c46a90377723cdd0d968b703bbeff6b013825783be7a6581aa40657785bd3  workbench/src/contracts/v37-types.ts
9c837ada3ef20b48764b00b6ec95966de646691d76723f553ab849d4da9fa79b  workbench/src/v37/host-registry-v37.ts
615775449f6244486f40600de237e3c7ffed9b80b0e719d11ca12d2d2cceea8c  workbench/src/v37/workflow-registration-v37.ts
4f9ca29c83cc4a6f2c787fea8fee9dc3a002ac8158635de29b404aa334db250d  workbench/src/v37/registered-recovery-v37.ts
2e72c05ba5e0e66dbcd64d4740dfbc836ebc4d4a8e7a51fd15f3969621888036  workbench/src/v37/candidate-v37.ts
f9d6db8b165ab8804c2bbca99cd4732dd59792beaa3042f474599f333c7f142f  workbench/src/v37/follow-up-execution-profile-v37.ts
bc181c4079d571db867ba61daeef59347e7af4d60bf9559795c52c452fa5f6f4  workbench/src/v37/registered-follow-up-v37.ts
52aa75137b96e743660875b6efb7a1d4f680e0c8847991c9187c3b5a81f05c89  workbench/src/inspect-v37g1.ts
187f70395b893a2e130f6856fe2b266c74fa9745e42c7229d3675a5b1d9cd4a1  workbench/src/inspect-v37g2.ts
```

## Access and scope accounting

- Credential reads: `0`.
- External network calls: `0`.
- External Provider calls: `0`.
- Real-model calls: `0`.
- Docker product/project-command executions: `0`.
- Dependency installations: `0`.
- Pi reads or changes: `0`.
- Schema 2, retry, fallback, replacement, third Recovery, real Case configuration, Goal 3B work, control-state edits, tags, and pushes: `0`.

## Environment qualifications and unverified items

- **Fact:** Windows denied creation of an ordinary directory symlink with `EPERM`; therefore the ordinary-symlink branch could not be exercised on this Host. The equivalent intermediate junction rejection and hardlink rejection both passed, and the implementation checks both symlink and junction reparse points.
- **Fact:** The exact `npm run typecheck` wrapper is unavailable because its ignored worktree-local compiler path is absent. The Prompt-authorized already accepted equivalent compiler passed with zero errors; no dependency was installed or copied.
- **Unverified:** Independent focused audit, Main preliminary review/acceptance, real Case freeze, Goal 3B, and real execution remain outside this Session.

## Implementation conclusion

- **Recommendation:** Freeze the resulting single Candidate commit/tree for Main preliminary review. If Main passes it, start the Charter-required fresh independent read-only focused audit. Do not unlock Goal 3B before Goal 3A acceptance.
