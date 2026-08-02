# V1 Skill / Runtime Comparison — Bounded Precontract Research

```yaml
status: research_complete_pending_main_session_review
date: 2026-07-31
session_role: dedicated_read_only_precontract_research_session
root_HEAD_verified: 62a2c962e896d3f406dec43d260daeaa6904da0c
pi_HEAD_verified: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal_verified: null
real_model_calls: 0
external_network_calls: 0
dependency_installs: 0
pi_changes: 0
git_commits: 0
final_recommendation: READY_WITH_BINDING_CORRECTIONS
```

## 1. Executive recommendation

**Fact.** The pinned Direct `@earendil-works/pi-agent-core` route already has
the public pieces required for a project-owned Skill treatment:

```text
public load/format exports
→ AgentHarness resources
→ AgentHarness.skill(name, taskInstruction)
→ one normal Agent turn
→ Session/Event/Tool lifecycle
```

The route does not require a Pi Core patch, private import, the
`pi-coding-agent` application package, SDK, RPC, WSL, or a new Skill platform.

**Fact.** V0 deliberately left `skill_refs` empty, fixed
`comparison_group_id` to `null`, hard-coded three V0-C strategies in the CLI,
and kept the successful real-provider composition in ignored UAT material.
Consequently, V1 is not “only add one Markdown file.” It needs a small,
tracked experiment substrate and one bounded tracked real-provider
composition before repeated trials are credible.

**Recommendation.** Preserve exactly three product strategies:

```text
A  Baseline
B  Skill-only
C  Skill + Runtime Control
```

Treat C's pre-recovery result as the analytical `C-initial` checkpoint, not a
fourth randomized arm. Only a valid, eligible failed C initial Attempt may
create one child Recovery Attempt. This cleanly identifies:

```text
A-initial vs B-initial       Skill content effect
B-initial vs C-initial       fairness/null check before intervention
C-initial vs C-final         bounded Recovery effect
B-final vs C-final           overall Runtime-Control increment
```

The external measurement Verifier must run identically after every initial
Attempt in A, B, and C. The Verifier is measurement infrastructure, not the C
treatment. The C treatment begins only when the host consumes a failed valid
Verifier result to decide and execute Recovery.

**Recommendation.** For the controlled V1 experiment, use a Pi-native,
application-explicit Skill invocation with:

```yaml
model_visible_catalog: false
disable_model_invocation: true
invocation: AgentHarness.skill(skill_name, task_instruction)
invocation_replaces_initial_prompt: true
relative_resources: none
```

This is more reproducible than autonomous discovery and more faithful to Pi's
public Skill route than manually concatenating an untyped prompt overlay.
It also avoids an extra “Skill preload” model turn: `skill(...)` replaces
`prompt(...)` for the initial Attempt. The intended treatment still increases
input bytes/tokens because the Skill wrapper and body enter the user message;
that overhead must be measured, not normalized away.

**Recommendation.** Split V1 into two execution Goals:

1. **V1-A:** deterministic Skill path, treatment isolation, experiment
   identity/aggregation, and bounded provider-composition boundary; zero real
   calls.
2. **V1-B:** freeze the task pack/protocol, then execute one bounded real
   three-arm Pilot.

Do not create V1-C by default. A later repeat/correction Goal is justified only
by a predeclared pause condition or a reviewed V1-B result.

**Final disposition: `READY_WITH_BINDING_CORRECTIONS`.** The route is not
blocked. Contract drafting should bind the invocation semantics, Verifier
decomposition, hidden-acceptance boundary, source identities, Pilot size and
budget below. In addition, the accepted Reference Acquisition Plan requires a
bounded Skill primary-source study before the V1 Skill Contract; the Main
Session must either authorize that separate source task or explicitly amend
the gate. This is a governance/provenance correction, not a Pi feasibility
blocker.

## 2. Verified repository, Pi, and V0 baseline

### 2.1 Repository and control state

**Fact.** Read-only verification produced:

```yaml
root_HEAD: 62a2c962e896d3f406dec43d260daeaa6904da0c
project_phase: v0_completed
project_status: V0_C_CLOSED_ACCEPTED
active_goal: null
next_goal:
  id: V1_SKILL_RUNTIME_COMPARISON
  status: candidate_not_authorized
```

The registered shared state remained:

```text
 M docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
 M workbench/README.md
 M workbench/package.json
?? docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_START_PROMPT.md
?? reference/
```

No pre-existing file was modified, staged, reverted, deleted, or committed by
this research Session.

### 2.2 Pinned Pi

**Fact.**

```yaml
path: .upstream/pi
HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
status: clean
package: "@earendil-works/pi-agent-core"
package_version: 0.82.1
pi_core_patch_count: 0
```

The package manifest exposes only the public roots `.` and `./node`
(`.upstream/pi/packages/agent/package.json`, `exports`). Skill and Harness
symbols are exported by the root source entry
(`.upstream/pi/packages/agent/src/index.ts`).

### 2.3 Accepted V0 evidence

**Fact.**

- V0-A, V0-B, and V0-C are closed and accepted
  (`CURRENT_STATE.md`; `docs/reports/V0_C_CLOSEOUT.md`).
- V0-C Implementation Baseline is
  `12db75aaea4db4afb774046cfcc94de772a2e90b`.
- The accepted real Run is
  `run-c3297fc5-bfd1-4bd1-b46c-3a636271a177`.
- It used five Provider/model calls, eight Tool calls, 16,625 tokens, and
  `$0.0012407808000000002`; its initial Verifier passed, so Recovery was not
  activated
  (`docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md`;
  `docs/reports/V0_C_CLOSEOUT.md`).
- G003 proved a deterministic same-Session failed-verifier-to-recovery
  mechanism; G006 and V0-C proved the real Provider/Tool/Session/Verifier
  route. None proves a Skill effect, Runtime-Control effect, real Recovery
  success, or statistical improvement.

## 3. Pi Skill public-path source map

### 3.1 Discovery and body loading

| Concern | Pinned Pi behavior | Source and test evidence |
| --- | --- | --- |
| Directory discovery | `loadSkills(env, dirs)` recursively searches directories. A directory containing `SKILL.md` becomes a Skill root and is not traversed further. Direct `.md` children are loaded only from each supplied root. Missing roots are skipped. | `.upstream/pi/packages/agent/src/harness/skills.ts`, `loadSkills`, `loadSkillsFromDirInternal`; `.upstream/pi/packages/agent/test/harness/skills.test.ts`, “loads SKILL.md files…”, “loads direct markdown children only from the root directory” |
| Ignore rules | `.gitignore`, `.ignore`, and `.fdignore` are accumulated during traversal. Hidden entries and `node_modules` are skipped. | `skills.ts`, `addIgnoreRules`, `prefixIgnorePattern`, `loadSkillsFromDirInternal` |
| Metadata | YAML frontmatter recognizes `name`, `description`, and `disable-model-invocation`. Description is required. Name defaults to the parent directory and is checked against lowercase/hyphen/length rules and parent-directory identity. | `skills.ts`, `SkillFrontmatter`, `loadSkillFromFile`, `validateName`, `validateDescription`; `skills.test.ts`, missing-description diagnostic |
| Body | Direct-core discovery reads and parses the entire file immediately into `Skill.content`. “Progressive” here means the body is kept out of the model-visible prompt until invocation; it is not lazy filesystem I/O. | `skills.ts`, `loadSkillFromFile`; `.upstream/pi/packages/agent/src/harness/types.ts`, `Skill.content` |
| Source attribution | `loadSourcedSkills` preserves an application-supplied source value without interpreting it. | `skills.ts`, `loadSourcedSkills`; `skills.test.ts`, “preserves source info…” and “attaches source info…” |
| Symlinks | The direct loader resolves a symlink's target kind and can traverse a symlinked directory. | `skills.ts`, `resolveKind`; `skills.test.ts`, “loads skills through symlinked directories” |

### 3.2 Deduplication and collision behavior

**Fact.** Direct `pi-agent-core` `loadSkills()` appends results from supplied
roots. It does not canonical-realpath deduplicate files and does not resolve
same-name collisions (`skills.ts`, `loadSkills`, `loadSourcedSkills`).

**Fact.** `AgentHarness.skill(name)` uses the first matching resource through
`Array.find(...)`; `AgentHarness` validates duplicate Tool names, but no
equivalent Skill-name validation is present
(`.upstream/pi/packages/agent/src/harness/agent-harness.ts`,
constructor, `skill`).

**Fact.** The separate `pi-coding-agent` application loader does canonical
path deduplication and first-wins name collision reporting
(`.upstream/pi/packages/coding-agent/src/core/skills.ts`, `loadSkills`,
`addSkills`; `.upstream/pi/packages/coding-agent/test/skills.test.ts`,
“collision handling”). Depending on that application loader would expand the
current Direct route and is unnecessary for V1.

**Recommendation.** V1's host should accept exactly one configured Skill
artifact, canonicalize it within an approved project-owned root, verify its
digest and metadata, reject links/escapes, and fail closed on zero, duplicate,
or same-name results. Do not build a general multi-source Skill registry.

### 3.3 Catalog projection and relative resources

**Fact.** `formatSkillsForSystemPrompt(skills)` filters out
`disableModelInvocation` Skills and emits only `name`, `description`, and
`filePath`; it does not emit the body
(`.upstream/pi/packages/agent/src/harness/system-prompt.ts`,
`formatSkillsForSystemPrompt`;
`.upstream/pi/packages/agent/test/harness/system-prompt.test.ts`).

**Fact.** `formatSkillInvocation(skill, additionalInstructions)` emits:

```text
<skill name="..." location="...">
References are relative to <dirname of filePath>.

<full body>
</skill>

<additional task instruction>
```

Evidence:
`.upstream/pi/packages/agent/src/harness/skills.ts`,
`formatSkillInvocation`;
`.upstream/pi/packages/agent/test/harness/resource-formatting.test.ts`.

**Fact.** `Skill.filePath` is specified as absolute and supplies the stable base
for relative references
(`.upstream/pi/packages/agent/src/harness/types.ts`, `Skill`).

**Recommendation.** The first Reliability Skill should be self-contained and
reference no relative files. This avoids granting the Agent read access to the
tracked Skill source outside its temporary Workspace. Relative-resource
support is not needed to answer V1's question.

### 3.4 Explicit invocation and turn effects

**Fact.** `AgentHarness.skill(name, additionalInstructions)`:

1. snapshots the same turn resources/context as `prompt()`;
2. finds a Skill by name;
3. formats the body and additional instructions;
4. passes the result to the same `executeTurn()` used by `prompt()`.

Evidence:
`.upstream/pi/packages/agent/src/harness/agent-harness.ts`,
`createTurnState`, `prompt`, `skill`, `executeTurn`.

**Fact.** `executeTurn()` creates one user message from that formatted string.
`runAgentLoop()` emits and persists the prompt message, then performs the
normal provider/tool loop. `handleAgentEvent(message_end)` appends messages to
the Session
(`.upstream/pi/packages/agent/src/agent-loop.ts`, `runAgentLoop`;
`.upstream/pi/packages/agent/src/harness/agent-harness.ts`,
`executeTurn`, `handleAgentEvent`).

**Inference.** When V1 calls:

```text
Baseline: harness.prompt(taskInstruction)
Skill:    harness.skill(skillName, taskInstruction)
```

both start one Agent turn. Skill invocation does not inherently add a separate
model call or Session cycle. It does increase the initial user-message bytes
and input tokens. Subsequent provider requests in the same Tool loop also
carry that user message in context, so cumulative input/cache behavior may
differ. If V1 first called `prompt(task)` and later called `skill(...)`, it
would add an entire second turn and confound the treatment; that design should
be rejected.

**Unconfirmed.** Existing Pi tests directly prove formatting, loading,
resource updates, Session persistence, and prompt execution, but no pinned
test directly exercises `AgentHarness.skill()` end to end. G003's emitted
public-import Gate dynamically checked `AgentHarness`, `Session`,
`JsonlSessionRepo`, and `NodeExecutionEnv`, not the exact Skill helper symbols
(`docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`, public import
Gate).

### 3.5 Public package and host responsibilities

**Fact.** The root source entry exports `AgentHarness`, `skills.ts`,
`system-prompt.ts`, and Harness types
(`.upstream/pi/packages/agent/src/index.ts`). The package root maps to
`dist/index.js` and `dist/index.d.ts`
(`.upstream/pi/packages/agent/package.json`).

**Recommendation.** V1-A must dynamically prove the emitted public package
exposes and can consume:

```text
AgentHarness
loadSkills or loadSourcedSkills
formatSkillInvocation
formatSkillsForSystemPrompt
Skill type declarations
AgentHarness.skill(...)
```

Host responsibilities remain:

- select approved Skill roots;
- canonicalize, deduplicate, and fail closed on collisions;
- fix source provenance, digest, byte size, and identity;
- decide model visibility versus explicit invocation;
- compose the system prompt; merely setting `resources.skills` does not
  automatically add catalog metadata;
- keep Tool/Workspace permissions outside the Skill;
- budget and record added bytes/tokens;
- reload/rebaseline only through a new experiment revision.

## 4. Mature Skill pattern versus Pi behavior

| Mature invariant | Pi Direct behavior | V1 adoption |
| --- | --- | --- |
| Catalog metadata is distinct from body | `formatSkillsForSystemPrompt` lists metadata; `formatSkillInvocation` injects body. The loader itself reads the body eagerly into host memory. | Adopt body/projection distinction; do not claim lazy I/O. |
| Visibility, invocation, permission, and execution differ | `disableModelInvocation` controls catalog visibility; application can still call `harness.skill`. Tool permissions remain in the Tool/Profile layer. | Use hidden + explicit invocation. Keep permissions and verifier outside the Skill. |
| Relative resources need a stable base | Invocation names the Skill file directory. | First Skill has no relative resources. |
| Host owns discovery, dedupe, reload | Direct loader does not supply collision policy. | Exact-one bounded loader; no registry/cache platform. |
| Source identity and trust must be explicit | `loadSourcedSkills` carries source values but does not interpret them. | Project-owned, tracked artifact with SHA-256 and attribution. |
| Existence does not imply correct selection | Direct visible metadata does not itself call `harness.skill`; Direct Harness has no autonomous SkillTool in this route. | V1 measures instruction-content effect, not Skill routing quality. |

The relevant mature reference is
`reference/cc-harness-knowledge/docs/CC_HARNESS_REFERENCE.md`, §16, and
`HARNESS_ENGINEERING_PLAYBOOK.md`, §4. It supports the invariants above but
does not prove Pi behavior. Pi behavior is established by the pinned paths in
§3.

**Fact.** The knowledge notes were sufficient for this bounded transfer. No
Claude Code implementation detail was needed to choose the Pi route, so the
unversioned/license-unverified `reference/src/` mirror was not used as a code
or behavior source.

## 5. V0-to-V1 product-surface delta

### 5.1 What already carries forward

| Existing V0 field/mechanism | V1 use | Evidence |
| --- | --- | --- |
| `strategy_id` on Run and Attempt | Names A/B/C without `baseline/candidate` schema branches | `workbench/src/contracts/v0c-types.ts`, `RunRecordV0C`, `AttemptRecordV0C`; `workbench/src/run-v0c.ts`, Run/Attempt construction |
| `parent_attempt_id`, `trigger`, `failure_packet_id` | Represents C's one child Recovery Attempt | `v0c-types.ts`, `AttemptRecordV0C`; `run-v0c.ts`, `evaluate` and child lineage validation |
| `completion_policy_id`, `recovery_mode`, `recovery_budget` | Separates observe-only B from bounded C | `v0c-types.ts`, `StrategySpecV0C`; `workbench/src/completion/controller-v0c.ts`, `decideCompletionV0C` |
| Initial/final verifier status and recovery fields | Supports C-initial/C-final outcome interpretation | `v0c-types.ts`, `OutcomeV0C`; `run-v0c.ts`, `outcomeFor` |
| Journal Attempt IDs and Verifier events | Supports measurement/intervention ordering | `v0c-types.ts`, `JOURNAL_EVENT_TYPES_V0C`; `workbench/src/evidence/journal-v0c.ts` |
| Per-Attempt and Run budgets | Supports equal initial allocations plus C child reserve | `v0c-types.ts`, `AttemptBudgetV0C`, `RunBudgetV0C`; `run-v0c.ts`, `attemptBudget`, `runBudget`, `hasChildReserve` |
| external execution-dependency seam | Allows a reviewed provider composition without putting credentials in tracked source | `workbench/src/product-surface-v0c.ts`, `runV0CProductSurface`; `workbench/src/pi/real-provider-route-v0c.ts`, `RealExecutionDependenciesV0C`; `workbench/tests/v0c-main-review-correction.test.ts`, authorized injected fake |
| Verifier outside Workspace | Same measurement oracle can score all arms | `workbench/src/contracts/preflight-v0c.ts`, external verifier path check; `workbench/src/run-v0c.ts`, `runExternalVerifierV0B` after settlement |

### 5.2 Binding V1 deltas

| Current V0 assumption | Evidence | Minimum V1 change |
| --- | --- | --- |
| `skill_refs` is typed as the empty tuple and preflight rejects any non-empty value | `workbench/src/contracts/v0c-types.ts`, `StrategySpecV0C`; `workbench/src/contracts/preflight-v0c.ts`, `preflightV0C` | Allow zero or one structured Skill reference with ID, source ref, digest, visibility, invocation mode, and byte/token projection. |
| Pi Adapter always uses static `SYSTEM_PROMPT` and `harness.prompt` | `workbench/src/pi/pi-adapter-v0c.ts`, `createPiRunHandleV0C`, `runAttempt` | Add an explicit initial invocation mode; B/C use `harness.skill`, A uses `harness.prompt`. Do not add a preload turn. |
| `comparison_group_id` is literally `null` in type and construction | `v0c-types.ts`, `RunRecordV0C`; `run-v0c.ts`, Run construction | Widen to `string | null`, or store membership in a separate immutable Experiment Manifest. Recommendation: both use the same `experiment_id`, with Run field optional and manifest authoritative. |
| There is no multi-Run experiment manifest or aggregator | `workbench/src/cli.ts` has only `run`/`inspect`; no tracked comparison source | Add one JSON Experiment Manifest and one read-only aggregation command/module. No database/dashboard. |
| CLI maps only three V0-C strategy IDs to fixed files | `workbench/src/cli.ts`, `v0cStrategies` | Resolve only the three accepted V1 strategy manifests from a bounded protocol, not a general registry. |
| Preflight accepts exactly one `test` command and V0-C-specific identity/limits | `workbench/src/contracts/preflight-v0c.ts`, `parseCommand`, constants and exact-field checks | Keep Node test-shaped tasks for the first Pilot, but make task/strategy/protocol identity V1-owned instead of editing V0-C historical semantics. |
| Base prompt digest is checked, but `base_prompt_id` is not checked against the exported constant | `preflight-v0c.ts`, strategy validation; `workbench/src/prompts/base.ts`, `SYSTEM_PROMPT_ID` | Validate both base prompt ID and digest. Keep identical bytes in A/B/C. |
| Source identity embeds old V0 control/baseline constants | `workbench/src/run-v0c.ts`, `CONTROL_BASELINE`, `V0B_IMPLEMENTATION_BASELINE`, Run construction | Record the exact V1 implementation baseline/project commit plus Workbench tree digest and protocol/task/strategy/Skill digests. |
| `network_calls` remains zero even on the externally composed real route, while Provider calls carry the useful evidence | `run-v0c.ts`, returned `network_calls`; accepted V0-C UAT reports five external Provider calls | Do not use `network_calls` as the Pilot denominator. Use Provider request/response evidence, usage, and cost. Correct or retire the misleading projection in V1-owned output. |
| The accepted real composition is ignored UAT-local source | `docs/reports/V0_C_CLOSEOUT.md`, §4 and provider seam conclusion; `workbench/README.md` | Track one bounded DeepSeek composition factory/adapter with injected credential resolution. Do not add a provider registry or credential platform. |
| `scenario` controls Faux behavior and appears in the product call | `workbench/src/run-v0c.ts`, `V0CRunScenario`; `workbench/src/cli.ts` | Keep scenario/fault injection test-only. A real Pilot protocol must not choose outcome-shaped scenarios. |

### 5.3 Minimum experiment identity and aggregation

**Recommendation.** Create one immutable, non-pair-specific manifest:

```yaml
schema_version: 1
experiment_id: v1-<uuid>
protocol_id: v1_skill_runtime_pilot_v1
protocol_sha256: <sha256>
task_set_sha256: <sha256>
strategy_ids:
  - v1_baseline
  - v1_skill_only
  - v1_skill_runtime_recover_once
model_profile_id: <fixed>
thinking_level: <fixed>
workbench_commit: <exact>
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
planned_cells:
  - task_id: <id>
    repetition: 1
    order_slot: 1
    strategy_id: <id>
    run_id: null_or_completed_id
    disposition: planned_or_terminal_or_invalid
```

Each Run remains independently identified and write-once. Aggregation reads
terminal evidence and validates identities; it never rewrites a Run. The
manifest is an experiment index, not a Pair object, database, scheduler, or
promotion system.

### 5.4 Bounded tracked real-provider composition

**Recommendation.** Repeated V1 trials require a tracked composition because
the accepted V0-C real path cannot be reproduced from tracked product source
alone. The minimum boundary is:

```text
one fixed model profile
+ one public Pi provider/AgentHarness handle factory
+ injected opaque credential resolution
+ frozen budget envelope
+ redacted usage projection
```

It must not:

- enumerate arbitrary providers;
- read or persist credentials in domain objects;
- parse a general `.env` registry;
- download model data or dependencies;
- add retry/fallback models;
- bypass the existing execution-authority and one-use boundary.

## 6. Fair treatment and Verifier decomposition

### 6.1 Three distinct concepts

```text
Measurement Verifier
  observes Workspace after every settled initial Attempt
  produces the same VerifierResult contract for A/B/C

Intervention / Completion Gate
  consumes a valid VerifierResult and policy/budget state
  decides stop or recover

Recovery Action
  only for eligible failed C initial Attempts
  creates one child Attempt in the same Session/Workspace
  supplies a bounded Failure Packet
```

Calling the measurement Verifier “Runtime Control” would confound scoring with
treatment. A and B need the same Verifier even though they stop after its
result.

### 6.2 Recommended arms

| Arm | Initial invocation | Initial measurement | Failed valid initial result | Final result |
| --- | --- | --- | --- | --- |
| A Baseline | `harness.prompt(task)` | same Verifier | stop; no feedback | initial result |
| B Skill-only | `harness.skill(skill, task)` | same Verifier | stop; no feedback | initial result |
| C Skill + Runtime | same Skill artifact and invocation as B | same Verifier | if eligible and reserve exists, one child Recovery | child Verifier result, otherwise initial result |

`C1` and `C2` are analytical stages of C:

```text
C1 = C initial Attempt + measurement + decision point
C2 = optional child Attempt after an eligible C1 failure
```

They should not become a fourth independent strategy or a large factorial.

### 6.3 Frozen equal conditions

For each task/repetition block, A/B/C must have identical:

- TaskSpec, instruction bytes, source tree, protected/writable paths;
- copied Workspace provider and initial digest;
- model, Provider, thinking level, stream options, temperature policy;
- base system prompt ID, digest, and bytes;
- Tool Profile, schemas, descriptions, permission/path policy;
- external measurement Verifier ID, digest, executable snapshot, timeout, and
  output cap;
- initial Attempt request, Tool, token, wall-time, and cost allocation;
- Pi commit and emitted package identity;
- Workbench implementation baseline and protocol;
- outcome precedence, terminal reasons, evidence scan, and invalid-run rules.

The single intended A→B difference is the exact Skill invocation wrapper/body.
The single intended B→C difference before the first Verifier is host-only
policy configuration; no policy ID, recovery reserve, or Failure Packet may
enter the initial model-visible payload.

Unavoidable differences that must be reported:

- B/C initial input bytes/tokens are larger than A;
- B/C Session user-message content contains the Skill wrapper/body;
- C reserves a possible child at Run level, while its initial Attempt
  allocation remains identical to B;
- C may consume extra calls/tokens/latency/cost only after a valid eligible
  failure;
- independent model runs remain nondeterministic even with matched inputs.

### 6.4 Dynamic fairness Gate for V1-A

With a one-response Faux Provider, capture and assert:

1. A uses one initial `prompt`; B and C each use one initial `skill`;
2. all have one initial Agent start, one Provider request, one settled event,
   and one user/assistant message pair;
3. no Skill preload turn exists;
4. B/C initial provider payloads are byte-equivalent;
5. A/B/C base system prompt and Tool schemas are byte-equivalent;
6. the only A/B model-visible delta is the formatted Skill wrapper/body;
7. strategy/policy/experiment IDs never enter model-visible context;
8. Session and Journal record Skill identity/digest without storing secrets;
9. all initial Attempts run the same measurement Verifier;
10. only C may create a child after a failed valid measurement.

## 7. Candidate Reliability Skill specification

This section specifies a candidate; it does not create the production Skill.

```yaml
candidate_skill:
  owner: project
  source: tracked_project_artifact
  format: SKILL.md
  source_count: 1
  relative_resources: forbidden_in_v1
  disable_model_invocation: true
  invocation: explicit_initial_AgentHarness_skill
  held_constant_between: [B, C]
  identity:
    - skill_id
    - source_ref
    - sha256
    - byte_length
    - projected_token_estimate
```

### 7.1 Target failures

- changing code before inspecting the bounded Workspace;
- omitting the task-declared public check;
- declaring completion despite a failed public check;
- editing tests, manifests, package configuration, or protected paths to make
  the task appear successful;
- making broad unrelated changes;
- failing to inspect the final change set.

### 7.2 Exact behavioral content

The final wording should instruct the Agent to:

1. read the task and inspect relevant Workspace files before editing;
2. identify writable and protected boundaries from the host-provided task;
3. make the smallest sufficient implementation change only in writable paths;
4. use only host-provided tools and command IDs;
5. run the task-declared public check after modification;
6. if that check fails, inspect the failure and continue repairing within the
   current initial Attempt and budget;
7. inspect `git_diff` or the host-provided final change projection;
8. never modify tests, verifier material, manifests, package files, or
   protected paths;
9. do not claim success while a declared check is failing or unrun;
10. report an honest bounded failure when the task cannot be completed.

### 7.3 What must remain outside the Skill

- hidden acceptance criteria and external Verifier implementation;
- formal Outcome and Failure Taxonomy;
- Tool/path permission enforcement;
- credential and Provider authority;
- Budget enforcement and terminalization;
- Recovery eligibility, Failure Packet, and child Attempt creation;
- evidence validation, aggregation, and policy promotion;
- any V2 routing or clean-Session recovery.

### 7.4 Visibility and protected information

**Fact.** A Skill is instruction content, not a security boundary. Preventing
the model from reading or changing something must be enforced by Workspace and
Tool policy.

**Fact.** V0 keeps the external Verifier outside the Workspace and blocks
writes to protected paths, but the current read Tool can read protected
Workspace files (`workbench/src/contracts/preflight-v0c.ts`, external Verifier
check; `workbench/src/pi/tool-profile.ts`, read/write path calls).

**Recommendation.**

- hidden Verifier and hidden acceptance material stay outside the Workspace
  for all arms;
- the Skill body contains no task-specific test, Verifier, or acceptance
  knowledge;
- public task checks may remain visible and read-only for all arms;
- tests and manifests remain protected from edits;
- do not claim that every protected file is unreadable unless V1-A adds and
  tests a separate read-visibility contract.

Making all tests invisible is a different treatment from “run the declared
check” and should not be silently introduced.

### 7.5 Forbidden claims

The Skill may not be described as:

- improving success rate before the Pilot;
- enforcing permissions or protecting files by itself;
- replacing the external Verifier;
- proving correct completion;
- choosing recovery routes;
- providing Claude Code feature parity;
- generally reusable outside the frozen task/profile without evidence.

## 8. Bounded task and Pilot design

### 8.1 Task pack

**Recommendation.** Use four project-owned micro TypeScript tasks, one from
each family:

1. normal bounded bug fix;
2. plausible edge-case omission where a public check is useful but the hidden
   external Verifier is stronger;
3. task where running the declared check is necessary to catch a realistic
   error;
4. scope-constrained task where editing protected configuration/tests would be
   an invalid shortcut.

Each task must:

- be solvable through the existing bounded local Tool Profile;
- require no install, network, Git commit, shell text, or external service;
- have one deterministic external Verifier outside the Workspace;
- have a reviewed reference solution used only to validate task solvability;
- have a stable initial source digest and explicit writable/protected paths;
- finish its public check and Verifier within existing bounded time limits;
- avoid ambiguous style-only acceptance and LLM judging.

Exclude:

- tasks selected after seeing arm results;
- tasks intentionally sabotaged only to force Recovery;
- trivial text replacements with near-certain success;
- dependency, environment, long-context, cancellation, Session-resume, or
  multi-path failures belonging to V2/V2.5;
- fixtures whose Verifier or hidden answer leaks through prompts, file names,
  Skill content, or Tool output.

### 8.2 Calibration

Before any Pilot call:

1. validate every Task/Skill/Strategy/Verifier digest;
2. apply the reviewed reference patch and prove the Verifier passes;
3. prove the unmodified source fails only where the task is intended to
   require work;
4. repeat each Verifier to check deterministic output/exit behavior;
5. run zero-call Faux treatment-isolation tests;
6. freeze the full task set and protocol before viewing real outcomes.

Do not use real arm outcomes to remove “too easy” or “too hard” tasks. If the
frozen set yields no natural failure/recovery opportunity, report that result
as inconclusive rather than chasing a failure.

### 8.3 Trial plan

```yaml
tasks: 4
repetitions_per_task: 2
strategies_per_repetition: 3
planned_initial_runs: 24
maximum_child_recovery_attempts: 8
maximum_started_attempts: 32
```

For each task/repetition, precompute and record a deterministic random
permutation of A/B/C. This reduces simple time/order bias without pretending
the Provider supports a reproducible model seed. Each Run starts from an
independent copied Workspace with the same source digest.

Two repetitions are deliberately descriptive, not statistically conclusive.
They are sufficient to reveal gross treatment differences, natural recovery
activation, invalid-run problems, and cost shape while keeping V1 subordinate
to V2.

## 9. Metrics, denominators, budgets, and interpretation

### 9.1 Metrics and denominators

| Metric | Numerator | Denominator |
| --- | --- | --- |
| Initial verified success by arm | valid initial Attempts whose first Verifier passed | valid initial Attempts in that arm |
| Final verified success by arm | terminal valid Runs whose final Verifier passed | terminal valid Runs in that arm |
| Skill delta | B initial success minus A initial success, reported as counts and percentage-point difference | matched valid task/repetition cells |
| Pre-intervention fairness check | B initial versus C initial outcomes and usage | matched valid B/C initial cells |
| Recovery trigger rate | eligible valid failed C initial Attempts | valid C initial Attempts |
| Recovery start rate | C child Attempts actually started | eligible failed C initial Attempts |
| Recovery success | C child Attempts whose final Verifier passed | valid started C child Attempts; also report per eligible trigger |
| Runtime final delta | C final success minus B final success | matched valid B/C cells |
| Declared-check execution | initial Attempts with a completed declared check Tool event | valid initial Attempts by arm |
| Protected/forbidden change | Runs with a confirmed forbidden mutation | all started Runs by arm |
| Invalid Run rate | terminal or nonterminal Runs classified invalid by frozen rules | all planned and all started Runs, reported separately |
| Usage | requests, Tools, input/output/cache/reasoning tokens, latency, cost | per valid Run, per Attempt, per task, and aggregate |

**Recommendation.** Use `initial_verification_failure_after_settled`, not
`false_completion`, as the automatic diagnostic. `settled` or
`assistant_final` does not prove that the model explicitly claimed success.
Only report False Completion if the Contract adds a predeclared, auditable
completion-claim annotation that does not use an LLM Judge.

Invalid/infrastructure/evidence Runs are not policy failures and do not enter
the success denominators. They remain visible in planned/started counts and
invalid-rate reporting. Reruns require a new Run ID and a predeclared
replacement rule; original evidence is never overwritten.

### 9.2 Recommended hard budgets

These are Contract inputs, not execution authorization:

```yaml
per_initial_attempt_all_arms:
  provider_requests_max: 8
  tool_calls_max: 12
  token_max: 65536
  agent_wall_time_ms_max: 300000
  cost_usd_max: 0.10

per_A_or_B_run:
  verifier_runs_max: 1
  recovery_attempts_max: 0
  cost_usd_max: 0.10

per_C_run:
  provider_requests_max: 16
  tool_calls_max: 24
  token_max: 131072
  verifier_runs_max: 2
  recovery_attempts_max: 1
  wall_time_ms_max: 900000
  cost_usd_max: 0.20

whole_pilot:
  planned_initial_runs: 24
  provider_requests_max: 256
  tool_calls_max: 384
  started_attempts_max: 32
  cost_usd_max: 2.00
  elapsed_execution_window_ms_max: 7200000
  alternate_model_fallback: false
  retry_same_run: false
```

The caps are intentionally much higher than the accepted V0-C observed cost,
so they act as safety stops rather than expected spend. The Main Session/user
must freeze the actual budget before execution.

### 9.3 Early-stop and pause rules

Stop before the next Provider call when:

- source, Skill, Task, strategy, Verifier, Pi, or Workbench identity drifts;
- B/C initial model-visible payloads differ beyond run identity that is not
  sent to the model;
- A/B/C initial Attempt budget or Tool/Verifier configuration differs;
- credentials, reasoning bodies, hidden acceptance, or verifier source enter
  model-visible/persisted evidence unexpectedly;
- invalid/infrastructure Runs reach 25% of started Runs or repeat for the same
  cause twice;
- any hard request, Tool, token, time, or cost budget is crossed;
- the Provider/model descriptor changes or a fallback/retry would be needed;
- a protected/hidden file becomes writable or a Verifier can be modified by
  the Agent;
- aggregation cannot prove exact experiment membership and source identity.

Do not early-stop because an arm is “winning,” all tasks pass, or Recovery is
not activated. Those are possible Pilot results.

### 9.4 Allowable result interpretations

**Positive Skill result:** B has more verified successes or materially better
check/scope behavior than A in this frozen Pilot. Claim only a descriptive
improvement on this task/model set.

**Positive Runtime result:** valid C failures naturally trigger bounded
Recovery and C-final exceeds C-initial/B-final within budget. Claim only that
the bounded mechanism produced useful additional recoveries in this Pilot.

**Negative result:** Skill or Runtime has no observed benefit, worsens outcomes,
or violates cost/scope guardrails. Keep the evidence and recommend narrowing,
revising, or rejecting that intervention.

**Inconclusive:** too few failures, mixed directions, high nondeterminism,
insufficient valid cells, or no natural Recovery activation. Do not expand the
task set post hoc to obtain a preferred result.

No V1 outcome supports a benchmark, production-SLA, model-wide, provider-wide,
or statistical-significance claim.

## 10. Proposed V1 Goal decomposition

### 10.1 V1-A — Deterministic Skill and fair experiment substrate

```yaml
decision_or_capability:
  prove one public Pi-native explicit Skill route and freeze fair three-arm
  experiment identities without model calls
owner_session: dedicated_V1_A_implementation_session
model_calls: 0
external_network: false
pi_core_patch: false
allowed_writes:
  - bounded Workbench V1 source/tests
  - one project-owned Skill candidate
  - bounded V1 task/protocol fixtures
  - V1-A report and ignored deterministic evidence
```

DoD:

- emitted public Skill symbols and `AgentHarness.skill` route dynamically pass;
- exact-one Skill loading, collision, link/escape, metadata, digest, and
  relative-resource policy pass;
- A/B/C initial treatment-isolation Gate in §6.4 passes;
- structured `skill_refs`, prompt/Skill/source identities, and
  `string | null` comparison membership are validated;
- one immutable Experiment Manifest and read-only aggregator reject missing,
  duplicate, drifted, invalid, or mixed-revision Runs;
- scenario/fault injection is test-only;
- one bounded tracked provider-composition boundary exists or its exact V1-B
  implementation contract is frozen, with zero credential/network use;
- all V0 regressions pass; no V1 effect claim.

Focused independent audit trigger:

- Skill body/prompt treatment isolation;
- experiment membership/source identity;
- hidden Verifier/protected path boundary;
- real-provider authority seam if tracked code is added.

The audit should be focused, not a general V0 re-audit.

Pause when public Skill consumption requires a private import/Pi patch, the
model-visible initial B/C payload cannot be made equivalent, hidden acceptance
leaks, or a general registry/platform becomes necessary.

### 10.2 V1-B — Frozen bounded real Pilot

```yaml
decision_or_capability:
  measure descriptive Skill and bounded Runtime increments on one frozen
  four-task, two-repetition Pilot
owner_session: fresh_dedicated_V1_B_execution_session
source_edit_authority_during_execution: false
model_calls: separately_authorized_with_hard_budget
external_network: provider_only_after_preflight_authorization
pi_core_patch: false
allowed_writes:
  - ignored Pilot Run/evidence roots
  - execution report and Closeout draft
```

V1-B should have two contract stages:

1. zero-call protocol/task/source/credential/budget preflight and frozen
   candidate baseline;
2. separately authorized real execution from that exact baseline.

DoD:

- all 24 planned initial cells are accounted for as terminal, invalid, or
  paused; no silent deletion/retry;
- same Task/model/base/Tool/Verifier/initial budget per matched block;
- at most one same-Session child only for eligible C failures;
- raw and aggregate metrics use the denominators in §9;
- cost/request/Tool/token/time/credential and evidence scans pass;
- conclusion is Promote/Revise/Reject/Inconclusive for the bounded Skill and
  Runtime interventions, not for Pi or the whole project.

Independent re-audit is not automatic if V1-B executes the frozen V1-A
candidate without source changes. Trigger a focused re-audit only if the
candidate, provider/secret boundary, Outcome/invalid rules, or aggregation
logic changes.

### 10.3 Why no default V1-C

V1-A already owns deterministic substrate and V1-B owns the bounded Pilot.
Creating a third Goal only for report generation would add governance without
a separate architecture decision. V1-C becomes justified only if:

- V1-B pauses on a correctable frozen-candidate defect;
- the user preauthorizes a bounded independent repeat after an inconclusive
  infrastructure-dominated Pilot;
- a result exposes one new decision that cannot be reviewed without a
  separately frozen experiment.

V2 clean-Session/multi-path recovery, Experience, routing, and task-scale
platform work remain outside all V1 Goals.

## 11. Explicit non-goals

- autonomous Skill discovery/selection quality;
- multi-source Skill registry, marketplace, cache, reload service, or Skill
  lifecycle platform;
- Claude Code Skill parity or copying from the unversioned mirror;
- arbitrary Provider registry or credential manager;
- dashboard, database, distributed runner, Eval SaaS, or paper benchmark;
- modifying Pi, SDK/RPC fallback, WSL, MCP, Multi-Agent, Worktree, container,
  or general sandbox;
- hidden-test generation, LLM Judge, or changing acceptance criteria between
  arms;
- more than one same-Session Recovery Attempt;
- V2 same-Session versus clean-Session route selection;
- V3 Experience extraction, Skill promotion, retirement, or routing;
- effect, statistical, production, or cross-model claims from deterministic
  fixtures or the bounded Pilot.

## 12. Risks and pause conditions

| Risk | Current status | Contract treatment |
| --- | --- | --- |
| Direct Skill duplicate/canonical identity | real host gap; no observed failure | exact-one fail-closed loader in V1-A |
| Skill invocation end-to-end not dynamically tested | `Unconfirmed` | public emitted Faux Gate before implementation acceptance |
| Skill wrapper adds tokens on every Tool-loop request | intended/unavoidable treatment cost | record message bytes and Provider usage; no extra preload turn |
| Visible catalog points outside Workspace | avoidable | hidden catalog + explicit invocation; self-contained body |
| Protected files are readable in V0 | current fact, not a Skill failure | external hidden verifier; public checks equal; no claim that all protected files are hidden |
| B/C initial drift | experiment-validity blocker | byte-level payload/system/tool comparison Gate |
| V0 real composition is untracked | reproducibility gap | one bounded tracked profile/factory, no registry |
| V0 `network_calls` projection is misleading | known evidence-shape issue | use Provider evidence; correct V1-owned projection |
| Pilot too small for statistics | accepted bounded scope | descriptive counts, matched cells, `INCONCLUSIVE` allowed |
| No natural Recovery activation | plausible outcome | report honestly; do not chase failure |
| Primary Skill paper not localized | accepted acquisition-plan gate | authorize bounded source study or explicitly amend/waive before Contract |

Research should pause and return to Main Session if any Contract proposal would
require:

- Pi private imports/Core patch;
- changing Verifier or acceptance criteria between arms;
- sending policy/experiment identity to the model in only one arm;
- exposing credentials, hidden acceptance, or verifier source;
- a general Skill/provider/eval platform;
- V2 recovery routes to make V1 interpretable.

## 13. Shortest user learning path

```text
Entry
  .upstream/pi/packages/agent/src/index.ts
  .upstream/pi/packages/agent/package.json

→ Core Symbol
  harness/skills.ts#loadSkills / loadSourcedSkills / formatSkillInvocation
  harness/types.ts#Skill / AgentHarnessResources
  harness/agent-harness.ts#AgentHarness.skill

→ Skill Context
  harness/system-prompt.ts#formatSkillsForSystemPrompt
  harness/agent-harness.ts#createTurnState / executeTurn
  agent-loop.ts#runAgentLoop

→ Session / Event
  harness/agent-harness.ts#handleAgentEvent
  workbench/src/session/evidence-session-v0c.ts
  workbench/src/evidence/journal-v0c.ts

→ Workbench Boundary
  workbench/src/contracts/preflight-v0c.ts
  workbench/src/pi/pi-adapter-v0c.ts
  workbench/src/completion/controller-v0c.ts
  workbench/src/run-v0c.ts
  workbench/src/product-surface-v0c.ts

→ Test
  .upstream/pi/packages/agent/test/harness/skills.test.ts
  .upstream/pi/packages/agent/test/harness/system-prompt.test.ts
  .upstream/pi/packages/agent/test/harness/resource-formatting.test.ts
  .upstream/pi/packages/agent/test/harness/agent-harness.test.ts
  workbench/tests/v0c-stage1.test.ts
  workbench/tests/v0c-main-review-correction.test.ts
```

The key lesson is:

```text
Skill file exists
≠ Skill metadata is model-visible
≠ Skill body entered this turn
≠ Tool action is permitted
≠ external task outcome passed
```

## 14. Contract-drafting inputs

The V1 Contract should freeze:

1. two Goals only: V1-A and V1-B;
2. project-owned exact-one Skill artifact and source/digest identity;
3. `disable-model-invocation: true`, self-contained body, explicit initial
   `AgentHarness.skill`, and no preload turn;
4. A/B/C strategy manifests and exact model-visible treatment differences;
5. same external measurement Verifier for all initial Attempts;
6. C-initial as an analytical checkpoint, not a fourth arm;
7. one same-Session child only after a valid eligible C failure;
8. equal initial Attempt budgets; C child reserve remains host-only;
9. structured Skill refs, validated base prompt ID+digest, exact V1 source
   identity, and optional experiment membership;
10. immutable Experiment Manifest and read-only aggregation;
11. one bounded tracked DeepSeek composition with external credential
    injection and no fallback/registry;
12. four tasks × two repetitions × three strategies;
13. ordering, denominators, invalid replacement rules, hard budgets, and
    pause rules from §§8–9;
14. hidden Verifier outside Workspace, public checks equal across arms, and
    protected files not writable;
15. focused V1-A candidate audit before any V1-B real call;
16. descriptive claims only and explicit `INCONCLUSIVE`;
17. primary-source acquisition-plan disposition before formal Contract;
18. no V2/V3 or platform expansion.

Minimum V1-A source tests should include:

- emitted public Skill import and explicit invocation;
- loader metadata/body/ignore/link/collision/digest cases;
- no-extra-turn Session/provider accounting;
- A/B/C initial byte-level treatment isolation;
- all-arm measurement-Verifier ordering;
- B stop versus C conditional child;
- experiment membership and aggregate rejection;
- provider seam zero-call and authority-consumption tests;
- V0 regression suite.

## 15. Unresolved user decisions

```yaml
user_decisions_required:
  - decision: freeze_V1_skill_invocation_semantics
    evidence: Pi public AgentHarness.skill replaces prompt in one normal turn; visible catalog is not required for explicit invocation and Direct core has no autonomous SkillTool selection in this route
    options:
      - hidden_project_skill_plus_explicit_initial_invocation
      - visible_catalog_plus_explicit_initial_invocation
      - project_owned_prompt_overlay_with_separate_skill_identity
    recommendation: hidden_project_skill_plus_explicit_initial_invocation
    consequence: cleanly measures instruction content with one initial turn; visible selection/routing remains a later question

  - decision: resolve_primary_skill_source_gate
    evidence: accepted REFERENCE_ACQUISITION_PLAN schedules a SkillOS-or-equivalent primary-source study before the V1 Skill Contract; this Session had no network/download authority
    options:
      - authorize_one_bounded_primary_source_research_session
      - explicitly_amend_or_waive_the_gate_based_on_local_Pi_and_Harness_evidence
    recommendation: authorize_one_bounded_primary_source_research_session_only_for_content_selection_execution_evaluation_invariants
    consequence: preserves the accepted provenance plan without delaying Pi feasibility or expanding into a Skill platform

  - decision: freeze_hidden_acceptance_and_public_test_boundary
    evidence: V0 keeps the Verifier outside Workspace and blocks protected writes, but public protected files can still be read
    options:
      - hidden_external_verifier_plus_visible_read_only_public_checks
      - add_a_new_read_visibility_contract_for_all_tests
    recommendation: hidden_external_verifier_plus_visible_read_only_public_checks
    consequence: all arms can follow the same declared check while hidden acceptance remains uncontaminated

  - decision: authorize_minimal_tracked_real_provider_composition_in_V1
    evidence: V0 proved the dependency seam and one real UAT, but the working composition is ignored UAT-local material
    options:
      - one_fixed_DeepSeek_profile_and_injected_credential_factory
      - keep_composition_external_and_accept_non_turnkey_repeated_runs
      - build_general_provider_registry
    recommendation: one_fixed_DeepSeek_profile_and_injected_credential_factory
    consequence: repeated Pilot runs become reproducible without introducing a registry or credential platform

  - decision: freeze_V1_pilot_scale_and_budget
    evidence: V0-C one real Run cost about 0.00124 USD, but V1 needs matched repeated cells and possible recovery
    options:
      - four_tasks_times_two_repetitions_times_three_arms_with_2_USD_cap
      - smaller_three_task_smoke_without_effect_decision
      - larger_six_to_ten_task_pilot
    recommendation: four_tasks_times_two_repetitions_times_three_arms_with_2_USD_cap
    consequence: yields bounded descriptive evidence and natural recovery opportunities while keeping V2 as the Portfolio North Star

  - decision: require_focused_V1_A_candidate_audit
    evidence: V1-A changes treatment isolation, experiment identity, hidden-acceptance boundaries, and possibly the tracked provider seam
    options:
      - one_focused_independent_audit_before_real_calls
      - main_session_review_only
      - full_general_reaudit
    recommendation: one_focused_independent_audit_before_real_calls
    consequence: protects causal/evidence validity without repeating the heavy V0 audits
```

## 16. Final disposition

```yaml
disposition: READY_WITH_BINDING_CORRECTIONS
route_blocked: false
pi_core_patch_required: false
private_import_required: false
pi_coding_agent_dependency_required: false
recommended_goal_count: 2
recommended_next_control_action:
  - main_session_reviews_this_report
  - user_resolves_section_15
  - bounded_primary_source_gate_is_executed_or_explicitly_amended
  - main_session_drafts_V1_A_and_V1_B_contract_boundaries
implementation_authorized_by_this_report: false
real_model_calls_authorized_by_this_report: 0
```

