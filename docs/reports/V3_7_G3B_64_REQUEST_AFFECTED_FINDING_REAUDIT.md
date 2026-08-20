# V3.7 Goal 3B 64-Request Affected-Finding Re-audit

```yaml
status: PASS_V3_7_G3B_64_REQUEST_AFFECTED_FINDING_REAUDIT
audited_on: 2026-08-21
candidate_commit: 86edd40c2b8349dfdeed5c081c78cf0a4590b246
candidate_tree: b8d1a1faabf81ab63a48fb105fed30e9749184b7
audit_mode: independent_read_only_static_affected_findings
residual_findings: none
```

The independent re-audit confirmed that v1 workflow reopen uses the frozen v1 registry
and accepted legacy loader fingerprint only under explicit historical-read-only loading;
new and writable work remains on v2. V3.6 schema 2 validates against 24 requests and
schema 3 against 64. The v2 follow-up profile and deterministic/real budget IDs are now
represented by exact TypeScript unions.

Configuration/bridge identities and `64/192/448` relationships were unchanged by the
correction. The auditor did not rerun tests or TypeScript and did not touch the isolated
untracked user report. Main's narrow `1/1` reopen result and TypeScript PASS were not
duplicated.
