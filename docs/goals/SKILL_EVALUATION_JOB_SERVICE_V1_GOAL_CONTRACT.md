# Skill Evaluation Job Service V1 Goal Contract

Status: accepted and activated by the user's 2026-09-22 implementation direction  
Implementation owner: current Codex task in the dedicated worktree below  
Owner deviation: the user explicitly directed this task to implement directly; no separate implementation task is used  
Control baseline: `603207f20436b1c31f67c3234936a9636f1d5c13`  
Worktree: `D:/AI/AI_Projects/project2-worktrees/skill-evaluation-job-service`  
Branch: `codex/skill-evaluation-job-service`

## Objective

Add one runnable `formal_skill_evaluation` asynchronous service without changing the frozen Formal Evaluation semantics:

```text
HTTP submission -> Redis/BullMQ -> bounded Worker -> isolated Evaluation process
  -> existing Evaluation artifacts -> HTTP status/result/artifact references
```

## Required scope

- registered immutable Evaluation Specs only;
- native Node HTTP submit/status/result/artifact and live/ready endpoints;
- BullMQ queue, configurable Worker concurrency and configurable global concurrency;
- persistent Job, Attempt, launch, process-terminal and Job-terminal evidence;
- deterministic idempotent submission and conflict rejection;
- no automatic re-execution after an Attempt may have produced side effects;
- streaming bounded logs whose truncation never blocks or terminates Evaluation;
- current-platform process-tree timeout cleanup with truthful uncertain fallback;
- fake evaluator mechanism, concurrency, fault and capacity tests;
- adapter to the canonical `workbench evaluation run` leaf CLI;
- Worker-owned Credential profile resolution with no secret in HTTP, Redis, public artifacts or logs;
- multiple registered small Specs; Formal Evaluation Run order remains frozen and serial;
- concise startup, implementation and interview handoff documentation.

## Boundaries

- Do not change Pi Core, Agent Loop, Formal Evaluation outcome semantics, Formal18 artifacts or SWE-bench code.
- Do not add a frontend, arbitrary uploads/paths/commands/environment, multi-tenancy, complex authorization, automatic scaling or a general recovery platform.
- Redis/BullMQ coordinates work; persisted filesystem artifacts remain result authority.
- `attempts: 1`, Job ID de-duplication and BullMQ locks are not exactly-once guarantees.
- Docker is optional for V1 except where useful to run Redis locally.
- Worker count and concurrency are deployment configuration, not a business constant.

## Real-access gate

Implementation, fake/Faux tests and deterministic regressions authorize zero Credential reads, external Provider requests and real-model calls. Before any real-model E2E, report the exact small Frozen Evaluation, planned Run count, expected request/token/cost envelope and obtain separate explicit user authorization.

## Required verification

1. Strict TypeScript and focused existing Workbench regressions.
2. Real Redis/BullMQ integration for HTTP, status/result/artifacts, duplicate/conflict, failure, timeout and Redis unavailable behavior.
3. Configured concurrency `1`, `2`, `4`, and `8` with fake work; observed active count must not exceed the configured value.
4. A reproducible 100-1,000 lightweight fake Job capacity run, scaled to the host without changing product defaults.
5. Worker-crash/redelivery reconciliation and nested-child timeout cleanup on the supported host.
6. Fixed/Faux Evaluation adapter E2E with no external model call.
7. One separately authorized small real Formal Evaluation E2E, or a truthful stop if its real-execution gate is not authorized or containment cannot be proved.

## Stop conditions

Stop real execution if process cleanup cannot be verified, a Credential can enter Redis/HTTP/public logs, canonical Evaluation semantics would need a broad rewrite, or scope expands beyond the bounded service. Ordinary implementation/test defects are corrected within this Goal.

## Deliverables

- runnable API and Worker plus example configuration;
- source and automated tests;
- reproducible verification record and `docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_CLOSEOUT.md`;
- updated current-state truth and concise technical/interview handoff.
