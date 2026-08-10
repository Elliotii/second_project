# Post-V3.5 Product Smoke and Maintenance Closeout

Status: CLOSED_AND_ACCEPTED

## 1. Scope and authority

This post-closeout maintenance slice tested the accepted V3.5 product surface without
reopening V3.5 or starting V3.6/V4. User authority covered:

- a docs-only Planning Baseline;
- zero-call real-product-path enablement;
- one focused audit and bounded hit corrections;
- a frozen Execution Baseline;
- one real two-Turn cross-process Product Smoke journey;
- ordinary startup maintenance;
- final reports and this Closeout commit.

Pi Core modification, SDK/Extension/RPC switching, extra tasks, retry, fallback,
replacement, Skill treatment, Git push and new Harness capability were never authorized.

## 2. Commit and review chain

- V3.5 accepted product baseline: e4e64d148d07ea5ed189365486fecbb525b78af9
- Planning Baseline: 2256de499c0412a610719d4c40df83c16680cf30
- initial Enablement candidate: c9c9e42175fe854ed9d0a431598042e96f64d7bb
- authority/evidence correction: 2ce81ebf74bafe6d3819218cee32fc021cabe9f6
- post-audit correction: 2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7
- audited Execution Baseline: 0c6032409c08f0eebcfacf69dafe341e1219fdf7
- ordinary explicit-port maintenance: 0fa4d79a56df01b00f1a674f3b915d2886b6f7a0
- pinned Pi: 027a5847901b5dde30270abaa1041046cd2b4b55

The focused audit first found two bounded P1 defects: unauthenticated semantic
prior-Run order and wall-time limits that were not one hard deadline. Both were returned
to the original Implementation Session, corrected, and closed by hit-only re-audit with
AUDIT_PASS_AFTER_HIT_ONLY_REVIEW.

## 3. Accepted objective result

Disposition:

    ACCEPT_POST_V3_5_REAL_CROSS_PROCESS_PRODUCT_SMOKE

One frozen install-free Node task completed through the local HTTP/WebUI product surface:

- one persistent Pi Session;
- two distinct real DeepSeek V4 Flash Runs;
- full stop of server process 1 and listener;
- fresh server process 2 reopening the same Session;
- authenticated prior Session prefix and provider-observed context equality;
- exact continuation marker recovered without appearing in the follow-up prompt;
- both external Verifiers and Outcomes passed;
- final public tests passed 4/4;
- no retry, fallback, replacement, extra Task or Skill treatment.

Whole-journey observed usage was:

- Credential reads: 2
- Provider/network/real-model calls: 11
- Tool calls: 14
- combined tokens: 27,588
- cost: USD 0.0009625336
- enforced Run wall time: 25,450 ms

Both direct server PIDs were stopped and the final loopback listener count was zero.

## 4. Final verification

After the ordinary startup parser maintenance, Main observed:

- strict TypeScript: pass;
- Post-V3.5 enablement tests: 11/11 pass;
- V3.5 Goal 3 focused tests: 6/6 pass;
- tracked diff check: pass;
- pinned Pi HEAD: exact;
- pinned Pi status: clean;
- no additional Credential/network/Provider/model access;
- no real journey rerun.

## 5. Files and evidence

Formal tracked reports:

- docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_PLAN.md
- docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_REPORT.md
- docs/reports/POST_V3_5_REAL_PRODUCT_PATH_FOCUSED_AUDIT_REPORT.md
- docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_REPORT.md
- this Closeout

The raw Journey was copied without mutation to the canonical project-root ignored path:

    D:/AI/AI_Projects/project2/.runs/post-v3-5-product-smoke/final-journey

Robocopy transferred all 33 files, and a read-only mirror comparison returned code 0.
The evidence contains the frozen Authority, host Manifest, Session JSONL, two Run
Manifests, Verifier/Outcome artifacts, process evidence, safe HTTP observations and final
Workspace. Credentials are not present.

## 6. Claims and limitations

Allowed claim:

The project has demonstrated one bounded, real, two-Turn coding-agent product journey
through a thin local Workbench, including process restart, persistent Pi Session
continuation, authenticated evidence, external verification, bounded usage and safe
inspection.

Not allowed:

- broad task/model generality;
- in-flight crash recovery or exactly-once external side effects;
- production security or remote/multi-user readiness;
- statistical policy effectiveness;
- automatic continual evolution;
- V3.6/V4 readiness;
- subjective usability without separate user feedback.

The accepted V3/V3.5 architecture and authority boundaries remain unchanged. No
CURRENT_STATE architecture rewrite is required for this post-closeout maintenance slice.
