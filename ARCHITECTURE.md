# HealthcareOS architecture

HealthcareOS uses the Next.js App Router with strict TypeScript. The current application is a client-side demo workspace backed by typed mock data; it is not yet connected to a production database or identity provider.

## Boundaries

- `src/app`: App Router entrypoints, layouts, route metadata, loading, errors, robots, sitemap, and manifest.
- `src/features`: business capabilities. A feature owns its components, hooks, services, schemas, and domain types as it is modularized.
- `src/components`: shared presentation. `layout` contains shell-level UI; reusable primitives belong in `components/ui`.
- `src/providers`: cross-cutting React providers. Keep feature state out of global providers unless multiple capabilities genuinely share it.
- `src/config`: validated, non-secret application configuration and policy constants.
- `src/lib`: framework-independent utilities, validation, safe errors, and logging.
- `src/server`: server-only integrations, repositories, and privileged operations when real backends are introduced.
- `src/types`: shared contracts that are genuinely cross-feature.
- `src/tests`: executable regression tests and test fixtures. Browser tests should live in a separate `tests/` tree when Playwright is introduced.

## Rendering rules

Server Components are the default. A Client Component is justified when it needs React state, effects, browser APIs, or event handlers. `HealthcareApp` is currently a deliberate client boundary because the existing demo shell and feature workflows are interactive and stateful.

## Data and security rules

The role switcher is demo navigation, not authorization. Real protected routes must enforce authorization on the server and must not rely on client visibility. Secrets and patient data must remain server-side. API inputs and external responses require runtime validation before entering domain logic. Error responses must expose safe messages and log only non-sensitive context.

## Adding a feature

1. Add a folder under `src/features/<capability>`.
2. Keep domain types and validation close to that feature.
3. Put server-only access in `src/server` or a feature service that is never imported by a Client Component.
4. Expose a small page/container boundary from `src/app`.
5. Add unit tests for domain rules and an interaction regression test for important workflows.
6. Add localized strings to the existing translation contract rather than hard-coding user-facing copy.

## Known limitations

- Authentication, persistence, API routes, and production authorization are not implemented yet.
- Existing feature screens remain large and are being decomposed incrementally to reduce UI regression risk.
- Existing mock records are demo data and must not be treated as clinical production data.
- SEO is disabled globally because the current root is an application workspace, not a verified public marketing site.
- No regulatory compliance claim is made. Privacy, retention, audit, consent, and operational controls require a real backend and formal review.
