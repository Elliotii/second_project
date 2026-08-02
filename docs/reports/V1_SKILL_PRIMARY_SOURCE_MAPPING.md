# V1 Skill Primary-Source Mapping

```yaml
status: research_complete_pending_main_session_review
date: 2026-07-31
session_role: dedicated_primary_source_research_session
active_goal_created: false
sources_selected: 1
maximum_sources_authorized: 2
final_disposition: PRIMARY_SOURCE_GATE_SATISFIED_WITH_CORRECTIONS
V1_charter_or_contract_created: false
implementation_performed: false
real_Workbench_model_calls: 0
repository_clones: 0
git_stage_or_commit: false
```

## 1. Executive conclusion

**Fact.** A canonical primary source identifiable as SkillOS exists:
[SkillOS: Learning Skill Curation for Self-Evolving Agents](https://arxiv.org/abs/2605.06614),
arXiv:2605.06614v1, submitted 7 May 2026. It directly covers all five candidate
dimensions: Skill content, retrieval, executor injection/use, downstream
evaluation, and insert/update/delete lifecycle. SkillOS is accepted rather
than replaced.

**Recommendation.** One source is sufficient. A second source would add scope
without changing the bounded V1 decision because SkillOS itself distinguishes
content/selection/execution and reports held-out environment or ground-truth
evaluation.

**Disposition: `PRIMARY_SOURCE_GATE_SATISFIED_WITH_CORRECTIONS`.** The current
V1 route remains sound:

```text
A Baseline
B Skill-only
C Skill + External Verifier / Runtime Control
```

The primary-source correction is interpretive, not architectural: SkillOS uses
training-time self-judged correctness and an external LLM content-quality Judge
in addition to downstream task outcomes. V1 must not call all of those signals
"independent evaluation." Its formal Outcome remains only the same external,
environment-level Measurement Verifier used by A/B/C. No existing Main-Session
binding correction changes.

**Inference.** V1's fixed Skill plus host-explicit invocation intentionally
removes retrieval and lifecycle quality from the treatment. The A-to-B contrast
is therefore the effect of the complete frozen Skill invocation treatment
(wrapper/body plus its token overhead), not a claim that Markdown body content
has been isolated from every representation effect.

## 2. Source-selection audit

### 2.1 Identity result

**Fact.** The canonical arXiv record supplies the title, 16 authors, stable
identifier, v1 submission date, PDF, source bundle, and license link. The paper
is a Google Cloud AI Research/UIUC/MIT collaboration. The abstract and full PDF
agree on the architecture: frozen Agent Executor, trainable Skill Curator,
external SkillRepo, grouped related-task streams, and Markdown Skills.

**Fact.** The arXiv page describes the main paper as 11 pages with six figures
and three tables; the downloaded v1 PDF contains 33 pages including references
and appendices. The PDF opened without encryption or parser error and yielded
complete text for all 33 pages.

### 2.2 Selection decision

SkillOS addresses:

1. content representation — single Markdown file with YAML metadata and body;
2. selection — fixed BM25 top-k retrieval;
3. invocation/execution — selected bodies enter a frozen executor prompt;
4. evaluation — held-out environment/ground-truth metrics plus explicitly
   separate training rewards;
5. lifecycle — curator insert/update/delete over related task streams.

The optional second-source rule is therefore not triggered.

## 3. Metadata, integrity, and PDF QA

| Field | Value |
| --- | --- |
| Canonical source | arXiv:2605.06614v1 |
| Version date | 2026-05-07 |
| Retrieved | 2026-07-31 |
| Source kind | Primary research preprint |
| Access / license | Public arXiv access; [arXiv non-exclusive distribution license 1.0](https://arxiv.org/licenses/nonexclusive-distrib/1.0/); no permissive code/data license inferred |
| PDF bytes | 7,031,485 |
| PDF SHA-256 | `e55b880b9564c63f5f791c02f423d41bd356eecc07002f85c6babfce72ee39c6` |
| PDF pages | 33 |
| Parser checks | Poppler metadata check and strict `pypdf` open; unencrypted; complete 33-page extraction |
| Visual checks | Title page and materially used pp. 2, 4-5, 7-8, 10-11, 21-25, and 31 rendered and inspected |

The localized original is
[SkillOS arXiv v1 PDF](../../reference/papers/v1-skill-primary-source/skillos-2605.06614/source.pdf);
its adjacent `SOURCE.yaml` is the integrity record.

## 4. Primary evidence

### 4.1 Content, metadata, and executable boundary

**Fact.** Section 3.1 and Figure 1(b) (pp. 2, 4) define each Skill as one
Markdown file containing YAML `name` and `description` frontmatter plus
Markdown instructions describing workflows, constraints, and reusable
heuristics. Appendix A's curator prompt (p. 19) additionally asks for atomic,
general, actionable, and faithful content.

**Fact.** Appendix D (p. 31) calls this a research simplification of the wider
`SKILL.md` paradigm: SkillOS omits scripts/resources and hierarchy, flattening
executable or compositional behavior into prose.

**Project implication.** V1 may use one self-contained project-owned
`SKILL.md`, but must not claim that SkillOS proves multi-file resources,
executable Skill code, or Pi resource safety. The existing decision to forbid
relative Skill resources in the first V1 experiment is reinforced.

### 4.2 Selection is separate from content

**Fact.** Section 3.1 and Algorithm 1 (pp. 4, 6) retrieve relevant Skills via
BM25 before the frozen executor acts. Table 4 (p. 25) fixes top-k at five.
Figure 6 (p. 11) measures usage rate, successful usage, repository coverage,
and Skills per example rather than equating repository existence with use.

**Inference.** SkillOS makes selection a separate component, but its results do
not cleanly identify a pure selector effect: the learned curator changes
content, metadata, and repository composition while BM25 stays fixed. Figure 6
supports observing actual use, not claiming retrieval causality.

**Project implication.** V1-A should keep a hidden catalog and host-explicitly
select exactly one frozen Skill. This deliberately measures fixed treatment
utility, not autonomous discovery or routing quality.

### 4.3 Invocation and execution

**Fact.** The executor is frozen while Skills change. Figures 9-11 (pp. 20-21)
place `{retrieved_skills}` into the executor prompt alongside task and current
state. The paper's executor then acts in ALFWorld/WebShop or produces a
reasoning answer.

**Applicability boundary.** SkillOS does not use Pi and does not prove
`AgentHarness.skill()`. It supports only the invariant that selected content
must enter the acting executor's context and that the executor can remain
fixed. V1 should use Pi's verified public format/turn route rather than copy
SkillOS prompts.

### 4.4 Evaluation and independence

SkillOS has three different feedback classes:

| Signal | Paper evidence | Independence assessment | V1 treatment |
| --- | --- | --- | --- |
| Curator correctness input | Section 3.1, p. 4; Figures 13-15, pp. 22-24: LLM-as-a-judge using the corresponding frozen executor backbone | Not independent of the acting executor | Do not use as formal Outcome |
| Content-quality reward | Equation 1, p. 5; Figure 12, p. 21: external Qwen3-32B judges abstraction/reusability/actionability/faithfulness | Separate model, but still an LLM proxy for likely future utility | Optional diagnostic only; not Outcome |
| Downstream task result | Section 4 and Appendix B.3, pp. 6-8 and 25-28: held-out environment or ground-truth metrics | Independent of Skill text and, for programmatic/ground-truth cases, independent of the acting model's self-claim | Required analogue: external Measurement Verifier |

**Fact.** ALFWorld success is whether the environment goal state is reached;
WebShop supplies programmatic purchase reward; AIME uses answer equivalence and
GPQA exact option match. All methods share frozen executor, retrieval budget,
step budget, decoding settings, and official held-out evaluation splits, and
the paper reports means and standard deviations over three seeds (Appendix
B.3.3, pp. 27-28).

**Fact.** The evaluated sets comprise 140 ALFWorld tasks, 500 WebShop test
instructions, 30 AIME24, 30 AIME25, and 198 GPQA-Diamond questions. Training
uses 3,553 ALFWorld tasks, 10,587 WebShop train instructions, and about 33,000
annotated DeepMath examples reduced to 20,000 grouped training instances
(Appendix B.3.1, pp. 25-26).

**Recommendation.** Freeze V1 experiment membership, task bytes, verifier,
model profile, budgets, and analysis before real Runs. The Verifier must ignore
the Agent's own completion claim and remain outside the writable Workspace.
Model-generated quality commentary may be retained as diagnostic evidence but
cannot determine success.

### 4.5 What the experiments support—and do not

**Fact.** Table 1 (p. 7) reports, for Qwen3-8B executor on ALFWorld, average
success of 61.2 for SkillOS versus 55.7 for the strongest listed external
baseline, while using 18.9 versus 20.1 steps. Table 2 (p. 8) reports gains on
WebShop and reasoning tasks across three frozen executor backbones. Table 3
(p. 10) drops ALFWorld success from 61.2 to 58.6 without content-quality reward
and to 57.3 without grouped task streams.

**Fact.** The paper compares No Memory, ReasoningBank, MemP, untrained
SkillOS-base, Gemini-2.5-Pro zero-shot curation, and RL-trained SkillOS. It
trains a Qwen3-8B curator with Qwen3-8B executor, and tests Qwen3-8B,
Qwen3-32B, Gemini-2.5-Pro, plus Gemini-3.1-Flash-Lite in Appendix C.

**Unsupported claim.** These results do not show that this project's fixed
Reliability Skill improves coding tasks, that host-explicit invocation beats
retrieval, or that Runtime Control beats Skill-only. They also do not isolate
the Markdown body from wrapper/token overhead.

## 5. Content / selection / execution / evaluation matrix

| Dimension | SkillOS | Proposed V1 | Contract implication |
| --- | --- | --- | --- |
| Content | Curator-mutated Markdown with metadata/body | One frozen tracked project-owned Skill | Digest, exact bytes, metadata, source identity, and self-contained body are immutable within an experiment revision |
| Selection | BM25 top-5 | Hidden catalog; host-explicit exact-one selection | Selection is deterministic and not a measured factor |
| Invocation | Retrieved bodies injected into executor prompt | Public `harness.skill(skill, task)` replaces initial `harness.prompt(task)` in B/C | Record exact wrapper/task payload; no preload Turn |
| Execution | Frozen executor plus same environment | Same model/tool/workspace/budget contract across A/B/C | Skill grants no Tool permission and changes no Verifier |
| Measurement | Held-out environment/ground-truth results; training also has LLM signals | Same external Verifier after every initial Attempt | Only the external Verifier produces formal Outcome |
| Intervention | Curator updates repository after tasks | Only C may consume a valid failed result and recover once | B stops after measurement; C initial/final are one strategy's checkpoints |
| Lifecycle | Insert/update/delete and future-task learning | None in V1 | Defer to V3/V4 |

## 6. Comparison with pinned Pi public Skill behavior

External primary evidence does not establish Pi facts. The following Pi facts
remain sourced only from commit
`027a5847901b5dde30270abaa1041046cd2b4b55`:

| Pi behavior | Pinned source symbol | Relevant pinned test | V1 use |
| --- | --- | --- | --- |
| Public Skill/Harness exports | `.upstream/pi/packages/agent/src/index.ts` exports `AgentHarness`, loaders, formatters, and types; package root is defined by `.upstream/pi/packages/agent/package.json` | G003 public emitted-import Gate; exact Skill end-to-end call remains untested | V1-A must dynamically prove emitted public Skill call |
| Loading and metadata/body parsing | `.upstream/pi/packages/agent/src/harness/skills.ts`: `loadSkillFromFile`, `loadSkills`, `loadSourcedSkills` | `.upstream/pi/packages/agent/test/harness/skills.test.ts` | Host requires exact-one, fixed source/digest, and fails closed on every diagnostic |
| Catalog projection | `.upstream/pi/packages/agent/src/harness/system-prompt.ts`: `formatSkillsForSystemPrompt` | `.upstream/pi/packages/agent/test/harness/system-prompt.test.ts` | Catalog hidden; metadata visibility is not invocation |
| Body invocation wrapper | `.upstream/pi/packages/agent/src/harness/skills.ts`: `formatSkillInvocation` | `.upstream/pi/packages/agent/test/harness/resource-formatting.test.ts` | Freeze full Windows-normalized wrapper bytes |
| One normal turn | `.upstream/pi/packages/agent/src/harness/agent-harness.ts`: `skill`, `createTurnState`, `executeTurn`; `.upstream/pi/packages/agent/src/agent-loop.ts`: `runAgentLoop` | No pinned direct end-to-end `AgentHarness.skill()` test | B/C use `skill()` instead of adding a preload Turn |

**Unconfirmed.** The paper adds no evidence about Pi loader diagnostics,
Windows path projection, public emitted-package cold import, or Session
persistence. Main Session's deterministic V1-A Gates remain necessary.

## 7. Comparison with V1 A/B/C

| Arm/checkpoint | Frozen initial behavior | Measurement | What may consume the result | Claim boundary |
| --- | --- | --- | --- | --- |
| A Baseline | `harness.prompt(task)` | Same external Verifier | Nothing; stop | Baseline task result |
| B Skill-only | Frozen exact-one Skill via `harness.skill(skill, task)` | Same external Verifier | Nothing; stop | Fixed Skill-treatment result |
| C initial | Byte-identical Skill artifact and invocation contract to B | Same external Verifier | Only eligibility/budget gate | Treatment-isolation checkpoint, not fourth arm |
| C final | Optional one child Recovery after valid eligible failure | Same Verifier contract | Nothing further | Bounded Runtime-Control increment |

**Recommendation.** Preserve payload-identity evidence for B/C initial. A
versus B is the primary Skill-treatment comparison; B versus C initial is a
treatment-isolation/randomness diagnostic, not a required null statistical
result. C initial and final remain checkpoints of one arm.

## 8. Evaluation validity and leakage implications

### Required controls

- Freeze Experiment Manifest membership before Runs and cross-check every Run
  identity against it.
- Freeze source/task/strategy/Skill/model/verifier/budget digests and exact
  initial payloads.
- Keep Verifier and acceptance criteria outside the Agent-writable Workspace.
- Use identical measurement before any arm-specific intervention.
- Preserve treatment-caused invalids as guardrail failures; exclude only
  treatment-independent infrastructure invalids under a predeclared taxonomy.
- Do not choose tasks, denominators, or pooled comparisons after seeing
  outcomes.

### Remaining limitations

**Inference.** A bounded real Pilot cannot establish broad statistical
generality. It can establish that the treatment is executable, fairly
identified, and has observed outcomes on frozen tasks. Promotion thresholds,
task count, repetitions, and cost remain user decisions after V1-A.

**Unconfirmed.** SkillOS does not report a factorial experiment that fully
separates metadata quality, BM25 selection, Skill body, and prompt overhead.
V1 should therefore describe B as the fixed Skill invocation treatment rather
than overclaiming a body-only causal effect.

## 9. Contract invariants supported by primary evidence

1. `skill_source_identity`, Skill bytes, digest, metadata, and experiment
   revision are immutable for all cells in one experiment.
2. The host chooses exactly one approved Skill; autonomous discovery/routing
   is disabled and not a V1 outcome.
3. Loading fails closed on every Pi diagnostic, zero/multiple results, links,
   escapes, collisions, or digest mismatch.
4. Windows path projection and complete Pi invocation-wrapper bytes have a
   deterministic public-package Gate.
5. B and C initial payload identity is proved byte-for-byte; the Skill replaces
   the initial prompt path and does not add a preload Turn.
6. A/B/C share model profile, base prompt, task bytes, tools, Workspace,
   initial budget, and external Measurement Verifier.
7. Experiment membership is mandatory, immutable, and manifest-cross-checked.
8. A and B stop after measurement; only C can consume a valid eligible failed
   Verifier result under one bounded reserve.
9. Formal Outcome is external environment evidence, never the Agent's
   completion claim or a Skill/content self-rating.
10. Treatment-caused invalids remain attributable guardrail failures under a
    predeclared taxonomy.
11. A tracked provider composition boundary must exist before V1-B freeze;
    credentials remain external and V1-A makes zero real calls.

## 10. Rejected or deferred ideas

| Idea | Decision | Timing/reason |
| --- | --- | --- |
| BM25/dense/learned Skill retrieval | Reject for V1 | Would turn selection into another factor; V1 uses host-explicit selection |
| Automatic Skill creation/update/delete | Defer | V3 Experience/curation loop, after fixed-Skill value is understood |
| Skill promotion/retirement/rollback | Defer | V3/V4 requires related-task/regression evidence and governance |
| RL curator and grouped task training | Reject for V1 | High complexity, different research question, not needed for A/B/C |
| Multi-file/hierarchical/executable Skills | Defer | Paper itself lists these as limitations/future work; first Skill is self-contained |
| Joint curator/executor optimization | Reject | Confounds executor and treatment; substantially increases cost |
| Model self-judgment as Outcome | Reject | Not independent environment evidence |
| Skill marketplace/registry/platform | Reject | No V1 problem requires it |

These decisions preserve V2 bounded multi-path recovery as the Portfolio North
Star while keeping Skill lifecycle in V3/V4.

## 11. Main-Session binding-correction audit

| Binding correction | Changed? | Primary-source effect |
| --- | --- | --- |
| Pi loader diagnostics fail closed | No | Paper does not address Pi diagnostics; keep source-derived Gate |
| Windows Skill path normalization | No | Paper does not address Pi path formatting; keep deterministic wrapper Gate |
| B/C initial is payload-identity Gate, not null-equivalence test | No | Strongly consistent with paper's shared-condition comparisons |
| Experiment membership mandatory and manifest-cross-checked | No | Reinforced by fixed held-out task suites and predeclared settings |
| Tracked provider composition before V1-B freeze | No | Operational project boundary, outside paper scope |
| Treatment-caused invalids remain in guardrails | No | Consistent with outcome attribution; paper does not supply this taxonomy |
| V1-B waits for V1-A acceptance | No | Research supports separation before real Pilot |
| Pilot scale/cost are user decisions | No | Paper scale is not transferable to this project budget |

**Additional wording correction.** Separate `training_signal` /
`diagnostic_judge` from `formal_external_outcome` in V1 documents. This does not
change the three-arm route or add a Goal.

## 12. Shortest user reading path

Read only these portions of the localized SkillOS v1 PDF:

```text
Figure 1 + section 3.1, pp. 2 and 4
  -> content, selector, executor, curator boundaries

Equation 1 + section 3.2, pp. 5-6
  -> delayed task outcome versus auxiliary signals

Tables 1-2 + setup, pp. 7-8
  -> actual models, baselines, and observed outcomes

Figure 6, p. 11
  -> existence versus actual Skill use

Figures 12-15, pp. 21-24
  -> content Judge and self-judgment are distinct signals

Appendix B.3, pp. 25-28
  -> task counts, held-out splits, common conditions, metrics

Appendix D, pp. 30-31
  -> BM25, flat Markdown, and frozen-executor limitations
```

## 13. Unresolved decisions

The primary-source Gate itself leaves no further source-selection decision.
Main Session/user still own, and this research does not silently decide:

- V1 Version Scope and any V1-A Contract;
- final Reliability Skill content and claims;
- V1-B Pilot task count, repetitions, order, cost, and model profile;
- Failure Taxonomy and promotion thresholds;
- whether C is run after V1-B evidence or remains deferred.

## 14. Final disposition

```text
PRIMARY_SOURCE_GATE_SATISFIED_WITH_CORRECTIONS
```

SkillOS is accepted as the single primary source. It confirms the project's
content/selection/execution/evaluation separation, frozen-executor comparison,
and downstream outcome discipline. It does not alter any Main-Session binding
correction. The only added binding language is to distinguish training-time
self/content Judges from the formal external environment-level Outcome.
