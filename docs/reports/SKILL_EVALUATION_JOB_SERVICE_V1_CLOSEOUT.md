# Skill Evaluation Job Service V1 closeout

Date: 2026-09-23  
Status: implementation complete; pending user review  
Disposition: `PASS_SERVICE_V1_WITH_REAL_CODING_AND_MAPPING_EVIDENCE_ANALYSIS_TERMINAL_PRESERVED`

## Outcome

The requested V1 service is implemented from the portable Analysis Agent v2.1 baseline
`603207f20436b1c31f67c3234936a9636f1d5c13` in the independent branch/worktree
`codex/skill-evaluation-job-service`. It provides the runnable chain:

```text
HTTP -> Redis/BullMQ -> independent Worker -> isolated canonical Evaluation process
     -> persistent status/result/Artifact references -> HTTP query
```

The implementation did not modify Pi Core, the Agent Loop, Frozen Formal18 evidence,
SWE-bench work, or the original stable line. No commit or merge was created.

The deterministic/Faux Definition of Done passed in full. The authorized real-model smoke
proved HTTP/queue dispatch, Direct Pi, Workspace tools, two completed Coding Runs, two
passed External Verifiers and the correct Thin Mapping. The existing Analysis invocation
then exhausted its bounded lifecycle without calling `update_state`; the Job truthfully
closed `execution_failed` and no Analysis State/report was fabricated. This is not claimed
as a successful real full Formal Evaluation.

## Implemented surface

- Native `node:http` loopback API for registered Specs, submission, status, result and
  integrity-checked Artifact retrieval.
- Redis/BullMQ queue with configurable Worker-local and queue-global concurrency.
- Independent Worker and Evaluation runner processes; independent per-Job directories.
- Immutable request and Spec snapshot, deterministic idempotency, queue receipt,
  Attempt/launch/dispatch/process/terminal evidence and content-addressed public artifacts.
- No blind re-spawn after dispatch; ambiguous crash/redelivery becomes
  `uncertain_requires_review`.
- Current-Windows process-tree timeout cleanup with explicit confirmed/unconfirmed result.
- Streaming bounded stdout/stderr with cross-chunk Credential redaction.
- Worker-private Credential profile registry and one cached formal evaluator resolver.
- Multiple small fake Specs, fixed two-Run Faux Formal assets, capacity runner, immutable
  small real Spec preparation and zero-call preflight.

## Verification record

| Verification | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm run evaluation-service:test` | 10/10 pass |
| Evaluation/Review/CLI focused regressions | 16/16 pass |
| Separate clean source-review pass | no actionable finding; limitations below retained |
| HTTP + real Redis + BullMQ + Worker integration | pass |
| Duplicate submission/key conflict | pass |
| Legal `TASK_FAILURE` separated from Job failure | pass |
| Execution failure, timeout and Redis unavailable | pass |
| Worker crash/stalled redelivery after dispatch | pass; no blind re-spawn |
| Nested-child timeout cleanup on this Windows host | pass |
| Credential leakage deterministic tests | pass |
| Actual Credential scan | 70 Artifact/log files and 2 Redis Jobs; 0 matches |
| Fixed two-Run Faux Formal service E2E | pass; Pi/tools/Verifier/Mapping/Analysis/reports, 0 real calls |
| Configured fake concurrency | requested/observed `1/1`, `2/2`, `4/4`, `8/8` |
| 100 fake Job batch | pass; no failures |

Capacity report:
`.runs/evaluation-service-capacity/capacity-20260922160538088-18dff44d/capacity-report.json`.

Observed fake throughput was 3.60, 6.85, 12.35 and 19.64 Jobs/s at configured concurrency
1, 2, 4 and 8. The 100-Job concurrency-8 batch observed 23.74 Jobs/s, submission latency
p50 274.93 ms / p95 277.26 ms, queue wait p50 2121 ms / p95 3681 ms, coordinator peak
RSS 207,761,408 bytes and 860,736 Artifact bytes. These are local fake-service mechanics,
not Coding Agent capacity or a production SLA.

## Authorized real execution

Frozen Spec: `small-real-two-run-v2`  
Runs: one `no_skill`, then one `with_skill`; no retries or replacements based on task
outcome  
Model: `deepseek/deepseek-v4-flash`  
Candidate SHA-256: `cd75889619cf15a7c3fe35c676cce2208276c2c93cd02ccab674bd576bf276ff`

Zero-call preflight reached the execution boundary with `real_model_calls=0` and
`credential_reads=0`.

### Initial operational Job

Job `24f8f5b45078e0b2cb69b9ec5214f50d7a6492dc2041fdfffc14479242170345`
used an overly deep Windows Job root. The first Agent edited the task correctly, then the
declared test process failed to spawn from a 286-character working directory with
`ENOENT/ENOTCONN`. No Run Manifest or Mapping existed. The Job closed
`execution_failed`; its evidence was retained. It recorded 4 model responses and cost
USD `0.000278208`.

### Operational replacement with short Job root

Job `232dc13b8eed5e6ef2c7ada5630639e792ef6a20e3736d95020f23df105630f1`
used `D:/AI/evalsvc-v2-r1` without changing the Frozen Plan:

| Plan | Run | Execution | Verifier | Requests | Cost USD |
|---|---|---|---|---:|---:|
| `small-real-no-skill` | `coding-task-20260922165031200-f6c26cb4` | completed | passed | 5 | 0.0002543072 |
| `small-real-with-skill` | `coding-task-20260922165035440-ce83c6f6` | completed | passed | 5 | 0.0002570008 |

Both modified only `src/subject.ts`, and the Thin Mapping includes both with attempt 1.
The subsequent Analysis session made 8 nonzero-usage requests and one final zero-usage
attempt recorded as `stopReason=error`, `errorMessage=terminated`. It cost USD
`0.0037867648`, did not persist State through `update_state`, and therefore produced no
authoritative Analysis State or reports. The service preserved stdout/stderr and closed
the Job `execution_failed` rather than treating queue completion as evaluation success.

Across the initial operational Job and its replacement, recorded spend was USD
`0.0045762808`: 23 Provider attempts were represented in sessions, 22 with nonzero usage
and one terminated with zero usage. No further real retries or re-analysis were run.

## Configurable parameters

The deployment controls Worker count externally and exposes Worker concurrency, global
concurrency, Redis URL/queue, jobs root, lock/stalled intervals, timeout cleanup grace and
reconciliation grace through environment configuration. The service does not lower or
replace registered model, Token, tool, request or task budgets. Spec-specific Job timeout
and log byte limits are registry data.

## Known limitations and truthful boundary

- V1 provides at-least-once delivery machinery with side-effect-aware fail-closed
  reconciliation, not exactly-once execution.
- It has no general cross-restart/cross-host recovery, distributed filesystem, HA API,
  automatic scaling, multi-tenant auth or production monitoring.
- The API binds only `127.0.0.1`; Redis is expected to be privately deployed. There is no
  public-network authentication layer.
- A dispatched Attempt with incomplete evidence can require manual review. V1 does not
  automatically retry Coding Runs or Analysis.
- The current Windows deployment needs a short jobs root for nested real Evaluations.
- Full real Analysis/report completion remains unverified because the authorized smoke
  reached the existing Analysis lifecycle terminal before `update_state`. Full zero-model
  Faux Analysis/report completion is verified.
- Fake capacity results must not be presented as real Agent concurrency or scale.

The final source-review pass separately inspected Job/Spec immutability, idempotency,
path containment, Redis connection ownership, Worker redelivery, process identity and
cleanup, bounded log behavior, result/Artifact validation and API exposure. It found no
new actionable defect after the Windows jobs-root correction. It did not convert the
known limitations above into unsupported guarantees.

## Deliverables

- Startup/configuration: `workbench/config/evaluation-service/README.md`
- Technical/interview handoff:
  `docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_TECHNICAL_HANDOFF.md`
- Source: `workbench/src/evaluation-service/`
- Tests: `workbench/tests/evaluation-service-*.test.ts`
- Capacity runner: `workbench/scripts/run-evaluation-service-capacity.ts`
- Small real preparation/preflight:
  `workbench/scripts/prepare-evaluation-service-small-spec.ts` and
  `workbench/scripts/preflight-evaluation-service-spec.ts`

## Remaining user decision

Review and accept the implementation as a service V1. A future successful real Analysis
smoke would be a new explicitly frozen execution/re-analysis contract; it is not required
to preserve the completed implementation or deterministic evidence and must not be
performed as an automatic retry of this result.
