# V1-A Main-Review Bounded Correction Prompt

```yaml
status: authorized_for_original_v1_a_implementation_session
issued_by: current_main_session
user_authorized: true
date: 2026-08-03
goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
stage: main_review_bounded_correction
execution_owner: original_dedicated_v1_a_implementation_session
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
pre_correction_source_digest: ed0d95bf3900ca7c4499d26cb67523879adcddf7a6ede73c08a211bcda348e86
pre_correction_workbench_digest: eaa09a6c2a2707f4b46fefc7c42a86ab5c0a673604815ca6e7620c034dbcf28c
pre_correction_fixture_digest: b02c28789d59dd3d9f287e98f3e139253265b9214a9cbccccee19eb65f78bf88
candidate_commit_authorized: false
focused_independent_audit_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
git_stage_or_commit_authorized: false
```

## 1. Role and authority

You are the **original dedicated V1-A Implementation Session**. The Main
Session completed a bounded review and issued:

```text
REQUEST_BOUNDED_V1_A_CORRECTION
```

This correction is governed by the already accepted
`docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`. It does not
authorize a new Goal, Contract amendment, Candidate Commit, independent audit,
real-model call, external Provider call, credential read, network access,
dependency installation, Pi modification, SDK/RPC/Extension route, V1-B, or
V2/V3 work.

Before changing anything, completely read:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`;
5. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`;
6. `docs/reports/V1_A_CLOSEOUT_DRAFT.md`;
7. `docs/reports/V1_A_MAIN_REVIEW_REPORT.md`;
8. `.runs/v1-a/evidence/EVIDENCE_INDEX.md`;
9. this Prompt.

Local source, tests, and observed commands outrank report prose.

## 2. Correction-entry Gate

Proceed only if:

1. root `HEAD` remains exactly
   `c9f91057db60cf61dab0d3aa305564d498c89cd6`;
2. no file is staged and all implementation changes are attributable to the
   original V1-A candidate, plus Main-Session-created review/governance files;
3. the pre-correction source, Workbench and fixture digests match those in the
   YAML header, or every difference is explained before editing;
4. `CURRENT_STATE.md`, Charter, Contract and control rule remain byte-identical
   to the Control Baseline;
5. `.upstream/pi` remains exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
6. no new Candidate Commit, audit, credential, network, dependency, real-model,
   Pi-patch or private-import authority exists;
7. accepted V0 evidence and user-controlled `reference/` inputs remain
   unchanged.

If any condition fails, stop and write a bounded
`docs/reports/V1_A_PAUSE_REPORT.md`. Do not normalize control state.

## 3. Evidence that must be preserved

Preserve:

- public emitted Pi imports and `AgentHarness.skill()` route;
- one initial Turn/request and no Skill preload Turn;
- B/C initial treatment semantics and C-only single-child ceiling;
- zero real/external Provider calls, network calls and credential reads;
- zero dependency install, Pi patch and private import;
- strict TypeScript and accepted V0 regressions;
- protected input byte identity;
- ignored append-oriented evidence history;
- control-file and Git-authority boundaries.

Do not overwrite prior evidence. Regenerated correction evidence must identify
the previous evidence as pre-correction rather than silently rewriting its
meaning.

## 4. Binding findings and corrections

### V1A-MR-001 — Experiment identity, membership and denominator

Correct the typed experiment and aggregation boundary so that:

1. every planned cell is accountable in a final aggregate;
2. missing cells are rejected unless represented by an explicit, typed,
   pre-authorized paused-before-execution disposition;
3. duplicates, undeclared retries/replacements and mixed revisions fail closed;
4. all required Task, Skill, Strategy, Verifier, model, prompt, Tool,
   Workbench, Pi and Workspace identities/digests are non-placeholder and are
   cross-checked between Manifest and Run evidence;
5. treatment-caused invalids remain in the corresponding arm's comparison and
   guardrail denominator, while only explicitly allowed treatment-independent
   infrastructure/evidence invalids may be excluded;
6. output exposes planned, observed, comparable, excluded-infrastructure,
   treatment-invalid, passed and paused counts per Strategy without ambiguous
   denominator naming;
7. a C child is legal only after a valid failed initial Verifier result with
   `recovery_eligible: true`, budget available, no prior child and exact
   ordinal/lineage evidence;
8. a pass, invalid, cancelled, infrastructure error, evidence-invalid result,
   exhausted budget or non-C Strategy can never be accepted with a child;
9. read-only aggregation does not mutate Manifest or raw results.

Replace placeholder zero digests in the deterministic Manifest with actual
bounded input identities. Avoid self-referential digest cycles; document the
exact digest domain for each field. V1-B Pilot membership remains future scope.

Add focused negative tests for every rejected case named by Contract Section
12.3 and deterministic matrix 17.4, including the Main Session counterexamples.

### V1A-MR-002 — Actual Provider payload and actual Measurement Verifier

Correct the treatment probe so that:

1. the public Faux Provider boundary captures a deterministic, reasoning-safe
   projection of the actual model-visible request/context, including System
   Prompt, messages and Tool definitions;
2. B/C byte equality is calculated from that actual captured projection;
3. A/B expected delta proves that only the public Pi Skill wrapper/body/input
   differs while other model-visible fields are identical;
4. common context equality is not derived solely from preselected constants;
5. the same real deterministic external Measurement Verifier path executes
   after each settled initial Attempt;
6. C intervention consumes that actual typed Verifier result;
7. event ordering is recorded at actual operation boundaries rather than by
   appending an unverified completion label;
8. Verifier source, hidden acceptance and host experiment/policy identities do
   not enter model-visible context;
9. A/B never recover and C creates at most one same-Session child only from an
   eligible valid failure.

Reuse the accepted V0 external Verifier/runtime boundary where practical. Do
not build a second general verifier framework.

### V1A-MR-003 — Executable Task pack and behavioral calibration

Turn the four Task candidates into bounded executable fixtures:

1. each Workspace must contain the minimum files required for its declared
   public check to run without install or network;
2. Task identity must freeze source, instruction, writable paths, protected
   paths, public check and external Verifier identity;
3. the external deterministic Verifier must remain outside Agent Workspace and
   execute behavioral checks rather than source-substring matching;
4. unmodified source must deterministically fail the intended acceptance;
5. reviewed reference patch must deterministically pass the external Verifier;
6. repeated Verifier execution must preserve outcome and exit behavior;
7. public checks must be identical across A/B/C and useful without revealing
   hidden acceptance;
8. at least the four Contract task roles must be represented: normal bounded
   fix, hidden edge case stronger than public check, public-check-dependent
   defect, and scope/protected-shortcut guardrail;
9. editing protected config/tests or bypassing the intended API must be
   rejected or classified invalid;
10. calibration must fail for the Main Session's nonsolution counterexample.

Use the existing bounded Tool Profile and external Verifier runner. Do not add
dependencies, arbitrary shell, Git, network, LLM Judge or a general benchmark
framework.

### V1A-MR-004 — Provider profile and fail-before-identity authority

Correct the future V1-B composition seam so that:

1. the tracked candidate profile aligns with the Charter's carried-forward
   fixed `deepseek-v4-flash` route, explicitly marked for V1-B preflight
   revalidation;
2. missing, denied, malformed or already-consumed authority/dependencies fail
   before calling the factory or creating any formal runtime identity;
3. tests prove the factory, credential resolver and transport remain untouched
   on denied/default/dry-run paths;
4. an authorized injected fake path consumes one authority exactly once and
   cannot retry or reuse it;
5. the composition factory cannot demonstrate success by ignoring a denied
   authority;
6. credential values remain absent from domain data, evidence, errors and logs;
7. alternate model, fallback, retry and registry enumeration remain disabled;
8. all correction execution uses non-secret fake dependencies and records zero
   real/external Provider, network and credential-read counts.

Reuse the accepted V0-C authority/profile boundary where useful. Do not call or
research the live API during this correction.

### V1A-MR-005 — Exact Skill identity, source drift and root path

Correct the Skill boundary so that:

1. exactly one expected Skill named `reliability-completion` is accepted;
2. description is non-empty and parent/source location is exact;
3. source digest/size and public Pi wrapper digest are compared with a frozen
   expected `SkillRefV1` rather than merely calculated after loading;
4. name, path, source or wrapper drift fails closed before Agent execution;
5. the configured Skill root itself, as well as every descendant, is rejected
   for symlink/junction/reparse/hardlink/escape/alias conditions as applicable;
6. Windows case and separator aliases are normalized and tested without
   weakening canonical containment;
7. loader diagnostics, missing/invalid description, invalid name/parent,
   duplicate/collision, dangling/root link, external escape and relative
   resources have focused rejection tests;
8. the catalog remains hidden, `disable-model-invocation: true`, self-contained
   and public-Pi-formatted.

Do not implement discovery, reload, multiple Skills, registry/cache or a
general Skill platform.

## 5. Bounded verification

Run the narrowest focused tests proving V1A-MR-001 through V1A-MR-005, then:

1. strict TypeScript;
2. the complete V1-A deterministic suite;
3. the full applicable Workbench V0/V1 regression suite;
4. actual Task public-check and external-Verifier calibration for all four
   fixtures, including repeatability and protected-shortcut rejection;
5. public emitted Pi Skill import/one-turn smoke;
6. zero-call Provider authority probes;
7. source/fixture/protected-input identity and secret/reasoning scan.

Record exact commands, working directories, exit codes, counts and durations.
Green tests must enforce the Contract semantics rather than merely preserve the
pre-correction assertions.

## 6. Evidence and report updates

Update:

- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`;
- `.runs/v1-a/evidence/EVIDENCE_INDEX.md`;
- Source Inventory and Control-Baseline-to-corrected-candidate Source Delta;
- actual Manifest/digest validation evidence;
- actual payload-equality and Verifier-ordering evidence;
- Task calibration evidence;
- Provider authority evidence;
- exact-one Skill/path/drift evidence;
- commands, exit codes, test counts and scans.

Include this correction matrix:

| Finding | Source correction | Test/evidence | Result | Remaining limitation |
| --- | --- | --- | --- | --- |
| V1A-MR-001 | | | | |
| V1A-MR-002 | | | | |
| V1A-MR-003 | | | | |
| V1A-MR-004 | | | | |
| V1A-MR-005 | | | | |

Do not describe Gates A-I or DoD as passed until regenerated evidence actually
proves the corrected semantics. Preserve prior artifacts as pre-correction
evidence. Keep `CURRENT_STATE_UPDATE_PROPOSAL` advisory only.

## 7. Pause conditions

Stop and write `docs/reports/V1_A_PAUSE_REPORT.md` if:

1. the correction-entry Gate fails;
2. any correction requires a Contract, Charter, ADR or control-state change;
3. any correction requires a Pi patch/private import, SDK/RPC/Extension route,
   dependency install, external download, credential read, network request or
   real/external Provider call;
4. actual B/C model-visible payload equality cannot be demonstrated;
5. the real external Verifier cannot be integrated after settled Attempt
   without changing the accepted V1 architecture;
6. treatment-caused invalids cannot remain accountable without changing the
   accepted comparison semantics;
7. executable Task calibration requires arbitrary shell, hidden answer
   exposure, external service or Agent-visible Verifier source;
8. fail-before-runtime-identity authority cannot be enforced by the bounded
   V1 composition;
9. accepted V0 behavior or evidence protections regress;
10. work expands into V1-B execution, multiple recovery paths, Skill
    effectiveness, SDK/Extension compatibility, V2/V3 or a general platform.

## 8. Required return and stop point

Return:

1. updated Implementation Report and Closeout Draft;
2. completed five-finding correction matrix;
3. exact changed source/fixture/test paths and symbols;
4. focused and full commands/results;
5. final Source, Workbench and Fixture digests;
6. exact Task calibration and Verifier evidence;
7. exact payload/treatment evidence;
8. Experiment rejection/denominator evidence;
9. Provider/credential/network/model counters;
10. Pi/root HEAD and status;
11. protected-file identity result;
12. updated Evidence Index and `CURRENT_STATE_UPDATE_PROPOSAL`;
13. proposed inputs for the later focused independent audit.

Then stop. Do not stage or commit, modify control state, launch the audit,
accept V1-A, draft V1-B, or call a real model.

The next permitted sequence is:

```text
original V1-A Implementation Session returns corrected candidate
→ Main Session performs lightweight bounded re-review
→ user separately authorizes Candidate Commit and focused audit
```
