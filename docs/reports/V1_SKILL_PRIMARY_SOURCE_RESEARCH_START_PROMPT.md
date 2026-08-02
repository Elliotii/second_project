# V1 Skill Primary-Source Research — Start Prompt

```yaml
status: research_authorized
date: 2026-07-31
session_role: dedicated_primary_source_research_session
active_goal_created: false
V1_charter_creation_authorized: false
V1_contract_creation_authorized: false
implementation_authorized: false
external_web_research_authorized: true
primary_PDF_download_authorized: true
maximum_primary_sources: 2
repository_clone_authorized: false
real_Workbench_model_calls_authorized: 0
workbench_changes_authorized: false
pi_changes_authorized: false
git_commit_authorized: false
allowed_reference_write:
  - reference/papers/v1-skill-primary-source/
allowed_report_write:
  - docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
```

## 1. Role and decision boundary

You are a dedicated primary-source research Session for V1 of:

```text
Agent Harness Reliability Workbench
```

Answer one bounded question:

> What primary-source invariants about Skill content, selection, invocation /
> execution, and independent evaluation must bind V1-A, and which Skill
> lifecycle ideas are explicitly not needed?

Your report is advisory. The Main Session owns source acceptance, V1 Version
Scope, Contract drafting, architecture decisions, and user discussion.

Complete the authorized local source package and one report, then stop. Do not
create a Version Charter or Goal Contract and do not implement anything.

## 2. Current authority and baseline

Verify before research:

```yaml
expected_root_HEAD: 62a2c962e896d3f406dec43d260daeaa6904da0c
expected_project_phase: v0_completed
expected_active_goal: null
expected_pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
```

The shared checkout contains registered Main-Session changes and V1 research
files. Treat all of them as pre-existing; do not modify, stage, revert, delete,
or commit them:

```text
M docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
M workbench/README.md
M workbench/package.json
?? docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_START_PROMPT.md
?? docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md
?? docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_MAIN_REVIEW.md
?? reference/
```

The authorized target
`reference/papers/v1-skill-primary-source/` was absent immediately before this
prompt was created. If it already contains unrelated user files when your turn
begins, stop without overwriting them and report the conflict.

## 3. Mandatory reading

Read completely, in order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. the files in `CURRENT_STATE.md.required_reading` that govern V0 closeout,
   V1 continuity, references, and Session ownership;
4. `docs/第二项目_Codex交接包_2026-07-30/REFERENCE_ACQUISITION_PLAN.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/06_参考资料清单与本地化计划.yaml`;
6. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md`;
7. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_MAIN_REVIEW.md`;
8. the Skill sections of:
   - `docs/reports/CC_HARNESS_PATTERN_MAP.md`;
   - `docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md`;
   - `reference/cc-harness-knowledge/docs/CC_HARNESS_REFERENCE.md`;
   - `reference/cc-harness-knowledge/docs/HARNESS_ENGINEERING_PLAYBOOK.md`.

Before inspecting `.upstream/pi`, read every applicable Pi `AGENTS.md`
completely. Pi behavior must still be proved from pinned Pi source/tests; an
external paper cannot override it.

Use `reference/src/` only if the local knowledge notes and primary source leave
a concrete implementation ambiguity that could change the V1 decision. Do not
copy from it; its version/license provenance remains unverified.

## 4. PDF and source-handling requirements

Use the available PDF skill for source PDFs.

For each selected paper:

1. identify the canonical primary page first;
2. prefer the official publisher, DOI landing page, arXiv, OpenReview, or
   author/project page over mirrors and summaries;
3. download the original PDF only from a canonical or clearly attributable
   primary location;
4. record exact title, authors, canonical URL, DOI/arXiv/OpenReview ID, version,
   publication/update date, retrieval date, access/license note, byte length,
   and SHA-256;
5. extract the complete text with `pdftotext`, `pdfplumber`, or `pypdf`;
6. render and visually inspect the title page and every page containing a
   figure/table/equation that materially supports the project mapping;
7. verify page count and that the downloaded PDF opens cleanly;
8. do not modify, optimize, regenerate, or re-export the source PDF.

Use `tmp/pdfs/` only for temporary extraction/rendering and remove all temporary
files before closeout. The accepted project localization path overrides the
PDF skill's general `output/pdf/` convention because these are source records,
not generated deliverables.

## 5. Source selection

### 5.1 Primary target

First determine whether a canonical, relevant primary source identifiable as
“SkillOS” exists and actually addresses at least three of:

```text
Skill content representation
Skill selection/retrieval
Skill invocation or execution
Skill evaluation
Skill update/promotion/retirement
```

Do not choose it merely because its title contains “Skill”. Verify authorship,
date, stable identifier, and actual content.

### 5.2 Equivalent source rule

If canonical SkillOS identity is ambiguous, unavailable, non-primary, or not
relevant enough, select one equivalent primary research source that best
answers the bounded V1 question. Record why it replaced SkillOS.

### 5.3 Optional second source

Use a second primary source only if the first cannot clearly distinguish both:

```text
content/selection/execution
and
independent environment-level evaluation
```

The second source may be an official Agent Skills specification or another
primary paper, but it counts toward the maximum of two. Do not add surveys,
blogs, vendor marketing, secondary explainers, repositories, benchmark suites,
or unrelated long-horizon/Experience papers.

## 6. Research questions

For each selected source answer:

1. What exact object is called a Skill?
2. Is a Skill content, metadata, executable code, a trajectory, parameters, or
   a bundle?
3. Who selects it: host, model, router, retrieval system, or human?
4. How does it enter execution/context?
5. Is selection quality separable from content quality?
6. How is outcome evaluated, and is the evaluator independent of the Skill or
   acting model?
7. What prevents evaluation leakage, overfitting, self-confirmation, or
   post-hoc task selection?
8. What lifecycle mechanisms exist, and why are they not required for V1?
9. Which claims are supported by the paper's actual experiments, task count,
   baselines, models, and limitations?
10. Which invariants transfer to this project, and which do not?

Then compare the primary-source result with the already verified project route:

```text
Pi project-owned SKILL.md
→ hidden catalog
→ host-explicit AgentHarness.skill(skill, task)
→ same initial Tool/Workspace/Verifier contract
→ B stops after measurement
→ only C may consume a failed valid result and recover once
```

The research must explicitly decide whether the primary source changes any
Main-Session binding correction. Do not change Pi facts based on a paper.

## 7. Allowed files and exact structure

Create at most two source subdirectories:

```text
reference/papers/v1-skill-primary-source/<short-source-id>/
  source.pdf          # only when an original PDF exists
  SOURCE.yaml
  PROJECT_MAPPING.md
```

If the optional second source is an official web specification with no original
PDF, do not fabricate or print one. Save only `SOURCE.yaml` and
`PROJECT_MAPPING.md`, with the canonical URL and retrieval/access note. Do not
save a full copyrighted HTML copy.

Create exactly one synthesis report:

```text
docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
```

No other persistent files are allowed.

`SOURCE.yaml` must include:

```yaml
source_role:
title:
authors:
canonical_url:
identifier:
version:
publication_or_update_date:
retrieved_at:
license_or_access_note:
source_kind:
pdf:
  present:
  origin_url:
  sha256:
  bytes:
  pages:
```

`PROJECT_MAPPING.md` must include:

- exact paper/spec sections, figures, tables, and page references;
- Problem / Design Goal / Invariant / Failure Mode / Applicability Boundary;
- supported and unsupported claims;
- mapping to Pi symbols and V1 experiment arms;
- adopt / reject / defer decisions;
- one-page-equivalent concise conclusion.

## 8. Synthesis report requirements

`V1_SKILL_PRIMARY_SOURCE_MAPPING.md` must contain:

1. Executive conclusion;
2. source-selection audit, including SkillOS identity result;
3. source metadata and integrity table;
4. paper/spec evidence with section/page/figure/table references;
5. content / selection / invocation-execution / evaluation matrix;
6. comparison with Pi public Skill behavior;
7. comparison with the proposed V1 A/B/C treatment;
8. evaluation-validity and leakage implications;
9. exact Contract invariants supported by primary evidence;
10. ideas rejected or deferred to V3/V4;
11. whether any Main-Session binding correction changes;
12. shortest user reading path through the selected source;
13. unresolved decisions;
14. final disposition:

```text
PRIMARY_SOURCE_GATE_SATISFIED
PRIMARY_SOURCE_GATE_SATISFIED_WITH_CORRECTIONS
MORE_PRIMARY_SOURCE_RESEARCH_REQUIRED
PRIMARY_SOURCE_GATE_BLOCKED
```

Label material claims as `Fact`, `Inference`, `Recommendation`, or
`Unconfirmed`. Cite primary web sources with normal Markdown links and local
PDFs according to the PDF skill. Do not use search-result pages as citations.

## 9. Prohibited actions

Do not:

- modify any existing project or reference file;
- create or edit V1 Charter, Contract, `CURRENT_STATE.md`, ADR, governance,
  Workbench, fixture, test, Skill implementation, Pi, or `.runs/`;
- clone or download a repository;
- download more than two primary sources;
- use a real Workbench Provider/model or inspect credentials;
- install dependencies unless a required PDF inspection tool is absent; if it
  is absent, stop and report instead of installing because dependency install
  is not authorized;
- use an LLM-generated summary as primary evidence;
- copy long copyrighted passages;
- turn this into a broad literature review, Skill marketplace study, autonomous
  Skill generation study, V3 lifecycle design, or benchmark comparison;
- stage or commit Git.

## 10. Pause conditions

Stop and report within the single synthesis report if:

1. root/Pi/V0 identity materially differs from the expected baseline;
2. the authorized target directory contains unrelated user files;
3. no canonical primary source can be verified;
4. the only candidate requires paywall circumvention or unauthorized access;
5. more than two sources would be required;
6. required PDF inspection tools are unavailable;
7. source evidence contradicts a binding V1 assumption in a way requiring a
   new architecture decision;
8. an unrelated process changes a shared tracked file during research.

## 11. Completion response

Return:

- synthesis report path;
- selected source identities and canonical links;
- final disposition;
- whether SkillOS was accepted or replaced;
- exact V1 invariants changed or confirmed;
- exact files created;
- confirmation of zero Workbench model calls, zero repository clones, zero Pi /
  Workbench changes, and zero Git staging/commit.

Then stop and wait for Main Session review.
