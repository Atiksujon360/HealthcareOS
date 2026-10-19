# HealthcareOS

HealthcareOS is a Next.js App Router healthcare operations workspace prototype with doctor, patient, clinic, pharmacy, courier, specialist, assistant, CareLoop, billing, and admin demo workflows.

## Requirements

- Node.js compatible with the installed Next.js version
- npm

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Configuration

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_APP_URL` controls public URL generation and defaults to `http://localhost:3000`. Never place secrets in public environment variables or client modules.

## Project structure

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for module boundaries, rendering rules, security expectations, and the feature workflow.

## Deployment

Use `npm run build` during CI and start the production server with `npm run start`. Deployments must provide environment configuration through the platform secret manager. Do not deploy the current demo as a system of record for real clinical data.

## Scope and limitations

The current repository preserves its existing UI and demo interactions. Authentication, authorization, persistence, real API integrations, and compliance controls are not implemented. See [`SECURITY.md`](./SECURITY.md) before extending the application with sensitive data.
