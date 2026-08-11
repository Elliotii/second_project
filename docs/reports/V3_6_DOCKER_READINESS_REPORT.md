# V3.6 Docker Readiness Report

```yaml
status: closed_passed
gate: V3_6_DOCKER_READINESS_GATE
completed_on: 2026-08-11
selected_backend: docker_engine_linux_container_via_docker_desktop_wsl2
docker_desktop_version: 4.85.0
docker_desktop_build: 235549
docker_client_version: 29.6.2
docker_server_version: 29.6.2
context: desktop-linux
platform: linux/amd64
wsl_kernel: 6.6.87.2-microsoft-standard-WSL2
image_reference: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
raw_evidence: .runs/v3-6/readiness/readiness-evidence.json
raw_evidence_sha256: fb9662b476ba84b6c556290847f8e1a2d5eb6054dc54e3adf39af37b15b5bcf5
credential_reads: 0
provider_model_calls: 0
host_command_fallback: 0
pi_changes: 0
disposition: PASS_V3_6_DOCKER_READINESS
```

## 1. Result

The selected Docker Desktop WSL2 backend is operational on the current Windows host and is suitable for the frozen V3.6 Goal 2 profile. Docker Desktop was installed from Docker Inc.'s WinGet manifest. The 625,139,632-byte installer matched manifest SHA-256 `5417cedc1aeb16b488b8084025246b64a5e9da4d71388f324b107140dfe00699` and had a valid Docker Inc. Authenticode signature.

The first WinGet Delivery Optimization transfer made no progress, so Main replaced only the transport with Windows BITS against the same official URL and verified the same manifest hash before launching the interactive installer. Docker installed per-user under `%LOCALAPPDATA%/Programs/DockerDesktop`; this installation layout is Host configuration, not browser-visible authority.

The first image transfer ended with a CloudFront `EOF`; an infrastructure-only repeat of the same image completed from cached layers. No second image, backend or fallback was introduced. The resulting immutable image identity is:

```text
node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
```

Formal execution must use that digest with `--pull never`; the mutable tag is not runtime authority.

## 2. Frozen Goal 2 profile

```yaml
network_mode: none
root_filesystem: read_only
tmpfs: /tmp:rw,noexec,nosuid,nodev,size=67108864
user: 65532:65532
cpus: 0.5
memory_bytes: 536870912
memory_swap_bytes: 536870912
pids_limit: 64
nofile: 1024:1024
cap_drop: ALL
no_new_privileges: true
pull_policy: never
wall_timeout_ms: 30000
combined_output_budget_bytes: 65536
workspace_mount_destination: /workspace
workspace_mount_count: 1
workspace_mount_mode: rw_single_managed_copy
container_lifecycle: one_disposable_container_per_registered_command
```

The only bind source in the readiness run was a new link-free ignored managed workspace under `.runs/v3-6/readiness/`. Registered Source, `.git`, Host home, project `.runs`, Credential, Harness State, Verifier, Authority and Docker socket were not mounted.

## 3. Observed evidence

| Check | Result |
|---|---|
| Windows client / Linux server | client and server `29.6.2`; `linux/amd64`; Docker Desktop WSL2 kernel |
| exact image / no pull at run | digest-only reference succeeded with `--pull never` |
| network | `none`; inside container only loopback was present |
| root and temp | root write rejected; bounded `/tmp` tmpfs write succeeded |
| identity | process UID/GID `65532:65532`, not root |
| resource/security inspect | CPU, memory/swap, PID, nofile, cap-drop and no-new-privileges matched the frozen values |
| mounts | exactly one RW bind at `/workspace`; managed output bytes returned to Host |
| output and exit | stdout/stderr preserved; exit `0` and deliberate exit `7` mapped exactly |
| descendants and timeout primitive | container had init, parent and child process rows; whole-container kill produced exit `137` |
| cleanup | every exact container was removed; matching remainder count `0` |
| drift/unavailable | all-zero digest with `--pull never` failed before container creation |

Raw `docker version`, `docker info`, image inspect, container inspect, terminal state, process table and cleanup evidence are retained only in the ignored evidence file named above.

## 4. Boundary and limitations

This Gate proves that the selected backend can enforce the frozen profile on this host. It does not by itself implement the Goal 2 executor, output truncation, immutable backend evidence, ChangeSet, Apply/Discard, WebUI or real model path; those remain Goal 2 work and tests. It also does not claim protection from Docker daemon, Docker Desktop VM, host-kernel or administrator compromise.

The Docker CLI path is Host-only configuration. Current Codex processes predate the installation and therefore must explicitly include `%LOCALAPPDATA%/Programs/DockerDesktop/resources/bin` or use the absolute CLI path; this path must never enter a browser-safe projection.

No Goal 2 implementation, Credential read, Provider/model call, real-model call or Pi change occurred during readiness.
