# Skill Evaluation Job Service configuration

`specs.json` is the API allowlist. Clients may submit only an enabled ID; they cannot
submit paths, commands, environment variables, or credentials. The checked-in fake
Specs are deterministic service tests and are not evidence of Coding Agent capacity.

Formal Specs use `executor.kind = "formal_cli"` and bind the frozen Plan, every task
config, the Workbench commit/tree, and relevant executor-file SHA-256 digests. Credential
profiles are a separate Worker-only file. Copy `credential-profiles.example.json` to a
private ignored location and point `EVALUATION_SERVICE_CREDENTIAL_REGISTRY` at it.

Deployment defaults are initial settings, not product ceilings: one execution per Worker,
global concurrency two. Add Worker processes or change the two environment values after
measuring CPU, memory, disk, process and Provider limits.

## Start locally

Prerequisites are Node.js 22.19 or newer, the checked-in Workbench dependencies, and a
reachable Redis. Start Redis however the host normally manages it. A disposable local
example is:

```powershell
docker run --rm -d --name skill-eval-redis -p 127.0.0.1:6379:6379 redis:7.4.7-alpine redis-server --save '' --appendonly no
```

Set the same public configuration for the API and every Worker. Set the Credential
registry only on Workers in a real deployment; it contains a profile ID and Credential
file path, never the secret value.

```powershell
$env:EVALUATION_SERVICE_PROJECT_ROOT = 'D:\path\to\project'
$env:EVALUATION_SERVICE_SPEC_REGISTRY = 'workbench\config\evaluation-service\specs.json'
$env:EVALUATION_SERVICE_JOBS_ROOT = 'D:\short\skill-eval-jobs'
$env:EVALUATION_SERVICE_REDIS_URL = 'redis://127.0.0.1:6379/0'
$env:EVALUATION_SERVICE_QUEUE = 'skill-evaluation-jobs-v1'
$env:EVALUATION_SERVICE_PORT = '4317'
$env:EVALUATION_SERVICE_WORKER_CONCURRENCY = '1'
$env:EVALUATION_SERVICE_GLOBAL_CONCURRENCY = '2'

# Worker process only, for formal_cli Specs:
$env:EVALUATION_SERVICE_CREDENTIAL_REGISTRY = 'D:\private\credential-profiles.json'

Set-Location "$env:EVALUATION_SERVICE_PROJECT_ROOT\workbench"
npm run evaluation-service:api
# Run in another process, once per desired Worker:
npm run evaluation-service:worker
```

On Windows, use a deliberately short absolute `EVALUATION_SERVICE_JOBS_ROOT`. A Job ID,
Attempt, Evaluation output and Coding Run workspace are nested below it; a deep worktree
root can exceed the effective child-process working-directory limit even when Node can
still create the files. This is a current deployment requirement, not an execution
concurrency limit.

Check health and submit only an allowlisted Spec ID:

```powershell
Invoke-RestMethod http://127.0.0.1:4317/health

$body = @{
  kind = 'formal_skill_evaluation'
  evaluation_spec_id = 'registered-spec-id'
  idempotency_key = 'caller-stable-key-001'
} | ConvertTo-Json

$job = Invoke-RestMethod -Method Post -ContentType 'application/json' `
  -Uri http://127.0.0.1:4317/v1/evaluation-jobs -Body $body
Invoke-RestMethod "http://127.0.0.1:4317$($job.status_url)"
Invoke-RestMethod "http://127.0.0.1:4317$($job.result_url)"
```

The result response supplies content-addressed Artifact URLs after terminalization. A
queue `completed` state is not enough by itself: the public terminal exists only after
the Worker validates the Evaluation result and referenced files.

## Runtime parameters

| Variable | Initial default | Meaning |
|---|---:|---|
| `EVALUATION_SERVICE_WORKER_CONCURRENCY` | `1` | Evaluations managed concurrently by one Worker process |
| `EVALUATION_SERVICE_GLOBAL_CONCURRENCY` | `2` | BullMQ queue-wide active Job limit |
| `EVALUATION_SERVICE_LOCK_DURATION_MS` | `120000` | BullMQ Worker lock duration |
| `EVALUATION_SERVICE_STALLED_INTERVAL_MS` | `30000` | BullMQ stalled check interval |
| `EVALUATION_SERVICE_KILL_GRACE_MS` | `10000` | Timeout cleanup grace for the recorded process tree |
| `EVALUATION_SERVICE_RECONCILIATION_GRACE_MS` | `5000` | Redelivery reconciliation grace |

These values do not alter the registered Evaluation's model, Token, tool, request or
task budgets. Capacity must be chosen from host resources and Provider limits. HTTP
request concurrency, active Evaluation Jobs and model request rate are separate limits.

## Result and recovery boundary

BullMQ may redeliver. A delivery that has not crossed the persisted dispatch boundary
can be reclaimed. Once dispatch or side effects may have occurred, a missing terminal
is finalized as `uncertain_requires_review`; the Worker does not blindly spawn a second
Evaluation. V1 does not claim exactly-once effects, cross-host scheduling, automatic
cross-restart recovery, or automatic Analysis retries.
