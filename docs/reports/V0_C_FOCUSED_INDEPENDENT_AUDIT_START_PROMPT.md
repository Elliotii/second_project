# V0-C Focused Independent Audit Start Prompt

```yaml
status: authorized_for_fresh_independent_audit_session
issued_by: current_main_session
user_authorized: true
date: 2026-07-31
goal: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
candidate_audit_baseline_commit: 930c549b402fce9ffa96847a673ad187c64f6094
candidate_workbench_digest: a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
audit_owner: fresh_independent_v0_c_audit_session
audit_scope: focused_risk_driven
source_repairs_authorized: false
git_stage_or_commit_authorized: false
current_state_modification_authorized: false
stage_2_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
```

## 1. Role

You are a **fresh independent V0-C Focused Audit Session**. You did not
implement or correct this candidate. Audit the immutable candidate at:

```text
930c549b402fce9ffa96847a673ad187c64f6094
```

The audit is advisory. You may inspect the committed candidate, run the bounded
commands below, create audit-local ignored probe evidence, and write exactly
one audit report. You must not repair source, alter control state, create a
commit, enter Stage 2, or call a real/external Provider.

## 2. Required reading

Before any test or probe, completely read:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`;
6. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`;
7. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
8. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
9. `docs/reports/V0_C_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
10. this Prompt.

Then read the exact candidate source and tests relevant to the audit scope. Do
not infer behavior from reports when source or observed output can decide it.

## 3. Gate A — immutable candidate identity

Before creating audit evidence or running tests, verify:

1. root `HEAD` equals
   `930c549b402fce9ffa96847a673ad187c64f6094`;
2. all tracked and staged files are clean;
3. the only expected pre-audit untracked project content is:
   - the registered user-owned `reference/` directory;
   - this audit Prompt;
4. the exact Workbench digest equals
   `a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f`;
5. `.upstream/pi` equals
   `027a5847901b5dde30270abaa1041046cd2b4b55` and is clean;
6. `CURRENT_STATE.md`, the formal Contract, Charter, control rule, ADRs and
   accepted historical Closeouts match the Candidate Commit;
7. no credential, `.env`, external network, real model, dependency install,
   Pi modification, private import, Candidate correction, or Stage 2 authority
   exists.

Known non-blocking byte fact:

- the reviewed digest intentionally preserves one extra EOF blank line in
  three newly tracked TypeScript files;
- after staging, `git diff --cached --check` therefore reported those three
  EOF blank-line warnings;
- do not edit them, and do not treat formatting alone as a reliability finding;
- the Implementation Report records why byte preservation was preferred over
  invalidating the five authoritative Run bindings.

If Gate A fails, write only
`docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md` with disposition
`PAUSE_V0_C_AUDIT`, list the mismatch, and stop.

## 4. Audit principles

- Use `Fact`, `Inference`, `Recommendation`, and `Unconfirmed`.
- Separate observed failure from design-hardening concern.
- A finding needs an exact source path/symbol plus a deterministic reproduction
  or a direct contradiction of a binding Contract invariant.
- Do not promote speculative crash/resume, general Provider, DLP, sandbox,
  V1/V2, or performance questions into findings.
- Do not repeat implementation-report conclusions without independent source
  and command checks.
- Use probe copies under `.runs/v0-c/audit/`; never mutate an authoritative Run.
- Do not modify Workbench, fixtures, tests, reports from the implementation
  Session, Pi, `reference/`, or project control files.

## 5. Focused audit scope

Audit only the following boundaries.

### A. Recovery eligibility and lineage

Verify:

- automatic child Recovery is limited to `public_external`;
- invalid evidence, invalid Verifier, infrastructure, user cancel and budget
  stop cannot allocate a child;
- one Recovery slot is consumed at most once;
- no ghost child ID and no ordinal 3;
- parent/child/run/strategy/Harness/Session/Workspace/Failure-Packet lineage is
  consistent;
- child cannot re-enter Recovery eligibility.

### B. Failure Packet before-child boundary

Verify:

- slot reservation precedes Packet work;
- Packet and Agent projection are persisted and ArtifactRef/digest/size checked;
- the shared accepted V0-B secret/reasoning scanner runs before child-ID
  allocation;
- match, scanner error, post-scan mutation, visibility mismatch, digest
  mismatch and oversize fail closed with no child;
- `failure_packet_created` represents scanned/validated evidence;
- full Verifier stdout/stderr, secrets, reasoning and hidden expected
  implementation never enter the Agent projection;
- the final integrated scan still covers Packet/projection/pre-child-scan
  evidence.

### C. Attempt/Run validation, budgets and terminalization

Verify:

- each settled evaluated Attempt has exactly one Verifier and one Attempt
  validation;
- one Run validation occurs after the final policy decision and before Outcome;
- cumulative request/Tool/Verifier/external-call/cost counters and Recovery
  truth agree with Attempt evidence;
- child-start reserve and one/two Attempt limits are enforced;
- the dynamic expected evidence set, terminal suffix and plan digest are
  consistent;
- exactly one Outcome, terminal Journal suffix, Index and terminal record exist;
- the terminal record is written last and binds Outcome/Index digests;
- V0-B audit protections `V0B-AUD-001` through `005` remain intact.

Two Main-Session hardening questions must receive explicit audit conclusions:

1. `executeV0CRun` creates the handle before entering its broad
   `try/finally`. Determine whether an exception from the lifecycle probe or
   `debugIdentity()` can leave a created handle unclosed. Classify it as a
   finding only if source and a bounded injected-handle probe demonstrate the
   cleanup violation; otherwise record it as no finding or unconfirmed.
2. `validateRunEvidenceV0C` receives Verifier IDs and expected paths from its
   caller. Determine whether the production writer independently establishes
   exactly-one Verifier relationships and closed Index completeness before
   committing `terminal.json`, rather than merely trusting caller-constructed
   arrays. Distinguish Inspector rejection after mutation from writer-side
   fail-closed guarantees.

### D. Dormant real-profile Product Surface

Verify without real calls:

- default/unauthorized real execution fails before Run/Workspace/Session,
  credential, Provider, Tool or Verifier side effects;
- execution authority is single-use;
- bounded injected fake dependencies reach the same formal
  Run/Attempt/Session/Verifier/Outcome orchestration;
- Provider identity and budget envelope remain inspectable;
- real/external Provider calls, credential reads and network calls remain zero;
- Stage 2 can provide an authorized factory/credential boundary without editing
  the committed Workbench source.

Do not research or test the live DeepSeek endpoint, authentication, model
availability, request schema, price or real response behavior.

## 6. Bounded commands

After Gate A passes, run only:

1. strict TypeScript;
2. the focused V0-C main-review correction tests;
3. the V0-C Stage 1 tests;
4. V0-B post-audit mutation tests;
5. one complete Workbench regression run;
6. read-only `inspect` of:
   - `run-0c752f20-1f14-46a8-b450-cdb30d3e682b`;
   - `run-bc97935e-884b-4524-acec-9d44cdf2b92e`;
   - `run-886cbdc1-2c06-4226-8f12-13c2b0d62576`;
7. narrowly scoped audit-local probe copies or injected-handle/validator probes
   only when required to decide the two hardening questions.

Do not rerun the full deterministic suite merely to create new authoritative
Runs. Do not overwrite historical or candidate evidence. Record commands,
working directory, UTC time, exit code and concise output under:

```text
.runs/v0-c/audit/
```

## 7. Finding severity

Use:

- `P1` — a reproducible violation can wrongly start Recovery, leak protected
  material, misclassify terminal Outcome, bypass budget/lineage, commit invalid
  terminal evidence, or make the frozen Stage 2 route unusable without source
  edits;
- `P2` — bounded integrity/cleanup weakness with concrete source and
  reproduction, but no demonstrated incorrect accepted Outcome;
- `P3` — non-blocking documentation or maintainability issue;
- `NOTE` — limitation already disclosed or a hardening idea without a
  reproduced Contract violation.

Formatting-only EOF warnings are not findings.

## 8. Required deliverable

Write exactly:

```text
docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md
```

It must contain:

1. exact Candidate SHA and Workbench digest;
2. Gate A results;
3. files/symbols inspected;
4. exact commands, exit codes and test counts;
5. findings ordered by severity, each with:
   - finding ID;
   - Fact/Inference label;
   - source path and symbol;
   - reproduction/evidence path;
   - violated Contract invariant;
   - bounded recommended correction;
6. explicit conclusions for the two Main-Session hardening questions;
7. V0B-AUD-001..005 regression matrix;
8. Provider/model/network/credential/dependency/Pi-patch counters;
9. remaining limitations and non-claims;
10. one disposition:

```yaml
- PASS_FOCUSED_V0_C_AUDIT
- REQUEST_V0_C_BOUNDED_CORRECTION
- PAUSE_V0_C_AUDIT
```

Use `PASS` only when there is no unresolved P1/P2 Contract violation. P3/NOTE
items may remain if they do not affect the frozen product boundary.

## 9. Prohibited actions

Do not:

- modify or repair source, fixtures, tests or implementation reports;
- modify or stage `CURRENT_STATE.md`, Contract, Charter, control rule, ADR or
  accepted Closeout;
- modify Pi or use a private Pi import;
- create a Git commit, branch, tag, stash, checkout or reset;
- install/download dependencies or access Registry/network;
- read `.env`, environment credentials or credential stores;
- call a real/external Provider or model;
- create a real UAT Run;
- enter Stage 2, V1 or V2;
- broaden the audit into general security, provider, durability or feature
  parity review.

## 10. Stop point

After the audit report and audit-local ignored evidence are complete, stop and
return the disposition to the Main Session and user. Do not fix any finding.

The only permitted next sequence is:

```text
fresh Audit Session returns report
→ Main Session verifies cited evidence
→ if findings: original V0-C Implementation Session receives bounded correction
→ if pass: user may separately authorize Implementation Baseline Commit
```
