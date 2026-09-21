# Security Policy

## Supported release

Security review currently applies to the `Analysis Agent v2.1` release line based on product commit `09681da3e80728f91adfd54c8bc5c2c2abf75345` and its release-preparation commits.

## Reporting

Do not open a public issue containing credentials, private model payloads, raw Session content or exploitable details. Use the repository owner's private GitHub contact channel or GitHub private vulnerability reporting when available.

Include the affected commit, file or command, a minimal reproduction, impact, and whether any credential or external side effect may have occurred. Do not run real-provider reproductions without explicit authorization.

## Credential handling

- Never commit `.env`, `.env.*`, API keys, tokens or credential files.
- `.env.example` contains placeholders only.
- Generated `.runs/` evidence and local Pi runtime copies are intentionally ignored.
- Real model commands require an explicit caller-provided credential and may create external requests and cost.
- If a credential is accidentally committed, revoke or rotate it before rewriting Git history; removing it from the latest file is insufficient.

## Scope boundary

This project is a research and portfolio Workbench. It does not claim a production security boundary, hostile-code sandbox, multi-tenant isolation or unrestricted repository safety.
