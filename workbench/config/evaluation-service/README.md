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

## Thin HTTP client

The client is only a scriptable caller for the HTTP API. It does not read Credentials,
run an Evaluation directly, maintain queue state, or cancel Jobs.

```powershell
Set-Location "$env:EVALUATION_SERVICE_PROJECT_ROOT\workbench"
$base = 'http://127.0.0.1:4317'

npm run evaluation-service:client -- specs --base-url $base
npm run evaluation-service:client -- submit --base-url $base --spec registered-spec-id `
  --idempotency-key caller-stable-key-001
npm run evaluation-service:client -- status --base-url $base --job '<64-hex-job-id>'
npm run evaluation-service:client -- wait --base-url $base --job '<64-hex-job-id>' `
  --timeout-ms 2700000 --poll-ms 1000
npm run evaluation-service:client -- result --base-url $base --job '<64-hex-job-id>'
npm run evaluation-service:client -- artifact --base-url $base --job '<64-hex-job-id>' `
  --name report_markdown --output 'D:\fresh-output\evaluation-report.md'
```

Repeat `--idempotency-key` to submit multiple independent Jobs for one registered Spec,
and repeat `--job` for `status`, `wait`, or `result`. Each independent submission must
use its own stable key. Multi-key submission calls the existing POST route once per key;
if a later call fails, the error preserves any earlier accepted Job IDs rather than
pretending the sequence was atomic. The client prints one machine-readable JSON object
to stdout on success and a bounded JSON error to stderr on failure.

Exit codes are deliberately small and distinct: `0` means the requested operation
succeeded (including a completed Evaluation whose Coding Run has a legal
`TASK_FAILURE`); `2` is invalid client usage; `3` is only a local `wait` timeout; `4`
is an HTTP/service failure; `5` is a terminal or inconsistent Job failure; and `6` is
an Artifact lookup, integrity, or fresh-output failure. A `wait` timeout, terminal
exit, or stopped Codex caller never sends cancellation and does not change the
background Job. Keep the Job ID and query it later.

Artifact download first reads formal result metadata, refuses to overwrite an existing
path, and checks the downloaded byte count, SHA-256, and response digest before creating
the output file.

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

The Formal Spec's `analysis_request_timeout_ms` is passed to Pi/OpenAI SDK as the
Provider request timeout. In the currently pinned SDK transport it covers `fetch()`
until response headers are received; it is not a complete-SSE-body or Analysis wall-time
deadline. The outer registered `job_timeout_ms` remains a separate evaluator-process
deadline. Do not infer a full stream timeout from the Analysis request value.

Long streaming Provider requests must also be validated on the deployment network path.
In one Windows validation series, concurrent Analysis succeeded when routed directly,
while some Clash TUN/proxy paths returned a headers-after-stream `terminated` error. This
is an observed deployment limitation, not proof of a single proxy or Provider root cause.
The service does not switch system proxy settings, silently retry model requests, or
hard-code direct routing.

Each Analysis writes the content-free `review/analysis-provider-requests.json` diagnostic.
It records request ordinals, observed dispatch/header/message-end timestamps, allowlisted
request IDs, status/stop reason, numeric usage, content block counts/byte lengths, and the
`update_state` emitted/executed/persisted/accepted lifecycle. It never records prompts,
response or thinking text, Tool arguments, Credentials, or arbitrary response headers.
Failure terminals publish this file through the same size/SHA-256 checked Artifact route
when it exists. A missing header event is reported as unobserved evidence, not proof that
the network never received response headers.

## Result and recovery boundary

BullMQ may redeliver. A delivery that has not crossed the persisted dispatch boundary
can be reclaimed. Once dispatch or side effects may have occurred, a missing terminal
is finalized as `uncertain_requires_review`; the Worker does not blindly spawn a second
Evaluation. V1 does not claim exactly-once effects, cross-host scheduling, automatic
cross-restart recovery, or automatic Analysis retries.

## Verified V1 delivery scope

The V1 backend completion acceptance used two independent Worker processes with local
concurrency one and BullMQ global concurrency two. Two new formal HTTP Jobs overlapped
in evaluator, Coding Run, and Blind Analysis intervals; both completed through Verifier,
Mapping, formal Analysis State, and Markdown/HTML/PDF report generation. The focused
zero-model suite also covers idempotency conflicts, stalled redelivery protection,
timeout cleanup, Redis-degraded reads, Artifact tamper rejection, Credential isolation,
and two-fake-Job concurrent path isolation.

This is evidence for one Windows host, real concurrency two, and the validated direct
Provider network path. It is not evidence of production high availability, exactly-once
side effects, arbitrary crash recovery, cross-machine scheduling, real concurrency four
or eight, or reliability on every proxy/TUN path.
