# Security notes

HealthcareOS currently contains demo data and a client-side role switcher. The role switcher is not authentication or authorization and must not be used to protect real patient or administrative data.

## Current safeguards

- Strict TypeScript compilation.
- No credentials committed in `.env.example`.
- Global metadata prevents indexing of the current workspace.
- Basic security response headers are configured in `next.config.ts`.
- Error UI avoids exposing internal exception details.
- Logging utilities accept only explicitly safe scalar context.

## Required before production healthcare use

- Integrate a reviewed identity provider and server-side authorization policy.
- Use secure, HttpOnly, SameSite cookies and session rotation.
- Add CSRF protection appropriate to the authentication model.
- Add server-side request validation, rate limiting, audit trails, and privacy-safe observability.
- Replace mock data with a controlled backend and database access layer.
- Define retention, consent, breach response, backup, and access-review procedures.
- Perform a formal threat model and applicable legal/regulatory review.

Report suspected vulnerabilities privately to the repository maintainers. Do not include credentials or patient data in issues, logs, fixtures, or pull requests.
