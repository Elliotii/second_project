# V3.7 Goal 3B 64-Request Correction Main Review

```yaml
status: PASS_V3_7_G3B_64_REQUEST_CORRECTION_MAIN_REVIEW
reviewed_on: 2026-08-21
configuration_candidate_commit: ca33885f4691f00ab9ab90643f8ed5fbc0825bb8
configuration_candidate_tree: ae12fd560f1d6dc802648a682eb5d94f96335f80
corrected_candidate_commit: 86edd40c2b8349dfdeed5c081c78cf0a4590b246
corrected_candidate_tree: b8d1a1faabf81ab63a48fb105fed30e9749184b7
real_access: false
```

Main accepts the corrected Candidate for successor freeze. Versioned v2 configuration
and new Run schemas carry the 64-request profiles; historical v1 and legacy Run schemas
retain their prior bytes and budget semantics. The bridge binds the exact configuration
Candidate and reconciles Primary, Recovery, Regression and follow-up at 64 requests,
with Group 192, Sequence 448 and Candidate proposal 1.

The initial focused audit failed historical workflow reopen, V3.6 schema-2 budget
interpretation and two v2 type declarations. Correction `86edd40...` closes those
findings with Host-owned read-only v1 loading, schema-specific 24/64 validation and exact
v2 type unions. Main ran only the new historical reopen test (`1/1 PASS`) and the project
TypeScript check (`PASS`). No 64-cap, full-product or external test was rerun.

The prior rejected real workflow and `V3_7_FINAL_CLOSEOUT.md` remain unchanged. This
review accepts only the zero-access successor implementation Candidate.
