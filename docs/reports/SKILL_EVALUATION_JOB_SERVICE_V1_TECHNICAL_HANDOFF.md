# Skill Evaluation Job Service V1 technical handoff

Date: 2026-09-23  
Baseline: `603207f20436b1c31f67c3234936a9636f1d5c13`  
Branch: `codex/skill-evaluation-job-service`

## What was added

The new layer turns the existing frozen Evaluation workflow into a loopback-only,
asynchronous backend service:

```text
HTTP API -> immutable Job request/Spec snapshot -> BullMQ/Redis
         -> bounded Worker -> isolated runner -> workbench evaluation run
         -> Run/Verifier/Mapping/Analysis artifacts -> validated Job terminal -> HTTP
```

The HTTP process never waits for a full Evaluation. Redis and BullMQ coordinate queue
ownership, global concurrency, Worker locks and stalled delivery. The filesystem Job
Store is the durable evidence authority. The Evaluation child continues to own Pi,
Workspace, tools, External Verifier, Thin Mapping, Analysis and report production.

## Component responsibilities

| Component | Responsibility | Explicit non-responsibility |
|---|---|---|
| `api.ts` | Allowlisted submission, status/result lookup, integrity-checked Artifact streaming, Redis health | Agent execution, Credential access |
| `job-store.ts` | Atomic immutable request/Spec/receipt/terminal records and idempotency index | Distributed transactions |
| BullMQ/Redis | Waiting/active state, Worker claim, locks, stalled detection, global concurrency | Authoritative Evaluation outcome |
| `worker.ts` | Envelope validation, Credential profile resolution, dispatch, reconciliation, timeout and terminal validation | Rewriting Formal Evaluation semantics |
| `evaluation-job-child.ts` | Separate-process adapter to canonical `workbench evaluation run`, bounded streaming logs | Queue policy or HTTP |
| `process-supervisor.ts` | Supported-host descendant enumeration/termination and truthful cleanup result | General cross-platform supervisor |
| `result-validation.ts` | Validate actual Mapping/Analysis/Report/Run references before exposing success | Trusting a queue ACK as evaluation success |

## Queue, concurrency and backpressure

- Worker-local concurrency and BullMQ global concurrency are separate configuration.
- The deployment starting point is two Worker processes, each `concurrency=1`, with
  global concurrency `2`; none of these values is hardcoded as a permanent maximum.
- One Frozen Evaluation still executes its Planned Runs serially through the existing
  evaluator.
- Additional HTTP submissions wait in Redis. The service does not respond by spawning
  unbounded Agents.
- The fake capacity test exercised concurrency `1/2/4/8` and a 100-Job batch. It measures
  service scheduling only, not real Coding Agent throughput.

## State and failure consistency

Submission hashes the exact public payload plus a private Spec snapshot. Reusing the
same idempotency key with the same payload returns the same Job; a different payload is
rejected. Queue data contains identifiers and digests, not paths, commands or secrets.

Each Job has one V1 Attempt and one or more launch reservations used only for safe
reconciliation. Before dispatch, a dead launch may be cleaned and reclaimed. After a
persisted `dispatch.json`, missing terminal evidence is side-effect-ambiguous; redelivery
therefore produces `uncertain_requires_review` instead of spawning again. `attempts=1`
is a policy choice, not an exactly-once claim.

Timeout cleanup records the runner PID, a random launch identity and observed descendants.
The Windows implementation checks identities before terminating the tree and reports
whether cleanup was actually confirmed. Unconfirmed cleanup is never presented as
complete.

The queue may say `completed` because its processor returned, while the Job terminal says
`execution_failed`, `artifact_invalid`, `timed_out_cleanup_complete` or
`uncertain_requires_review`. API consumers must use the Job terminal reason.

## Credentials, logs and artifacts

Clients submit a registered Spec ID only. They cannot supply local paths, commands,
environment variables or credentials. A Worker-private registry maps a profile ID to one
ordinary non-link Credential file. The Worker validates it, passes only the private file
path to the runner, and deletes that handoff variable before starting Workbench. The
formal evaluator uses one cached opaque resolver; it does not fall back to
`process.env.DEEPSEEK_API_KEY`.

stdout/stderr are drained continuously into bounded files. Truncation limits stored bytes
without blocking or killing the evaluator. Credential redaction spans chunk boundaries.
Original Pi sessions, traces and Evaluation artifacts remain separate from the small
HTTP-facing log projection.

Successful public Artifact references record path, SHA-256 and byte count. Every GET
rechecks ordinary-file identity, size and digest. The real Credential scan covered 70
files plus both Redis Jobs with zero matches.

## Existing versus new capability

Existing and reused:

- `workbench evaluation run` and its frozen Plan/binding rules;
- `runCodingTask()`, Direct Pi, Workspace tools and External Verifier;
- Thin Mapping, Analysis State and Markdown/HTML/PDF report generation;
- Artifact schemas and legal task-failure behavior.

New in this Goal:

- registered Evaluation Spec allowlist and executor-integrity snapshot;
- asynchronous HTTP submit/status/result/Artifact surface;
- BullMQ scheduling with configurable local/global concurrency;
- filesystem Job/Attempt/launch evidence, idempotency and redelivery reconciliation;
- separate Worker/runner processes, timeouts, descendant cleanup and bounded logs;
- Worker-only Credential profiles and deterministic fake/Faux/capacity tests.

Not supported or not claimed:

- exactly-once model/tool side effects;
- automatic retry after dispatch, automatic Analysis retry or result hunting;
- cross-machine scheduling, durable HA control plane or automatic scaling;
- multi-tenant auth, arbitrary uploads/commands, frontend or public-network exposure;
- production throughput inferred from fake Jobs;
- a successful real-model Analysis/report in the 2026-09-23 smoke: real Coding Runs,
  Verifiers and Mapping passed, but the existing Analysis invocation exhausted its
  bounded lifecycle without persisting State.

## Interview-ready engineering decisions

1. **Why BullMQ and a filesystem store?** BullMQ already solves queue ownership, locks,
   stalled detection and concurrency; existing Evaluation artifacts are file-based and
   authoritative. The service avoids inventing a second scheduler or migrating frozen
   evidence into a new database.
2. **Why separate Job completion from task outcome?** A verifier failure can be a valid
   evaluated result, while a missing Mapping or Analysis State is an infrastructure or
   protocol failure. Queue completion cannot express that distinction by itself.
3. **How is duplicate work handled?** Submission de-duplication prevents identical
   enqueue calls; immutable dispatch evidence prevents unsafe re-spawn after side effects.
   Ambiguity is surfaced rather than hidden behind an exactly-once claim.
4. **Why `concurrency=1` per Worker initially?** It gives simple per-process isolation.
   More Worker processes and a configurable global limit scale execution without making
   one Worker supervise many heavy Evaluations. It is a deployment default, not an
   architecture ceiling.
5. **What did real execution reveal?** A deep Windows output root produced a 286-character
   command working directory and `ENOENT/ENOTCONN`. Moving only the configurable Job root
   to a short path fixed the process boundary. This became an explicit Windows deployment
   requirement instead of a hidden test-only assumption.

See `workbench/config/evaluation-service/README.md` for startup commands and
`docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_CLOSEOUT.md` for exact evidence.
