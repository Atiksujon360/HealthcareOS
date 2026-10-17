# CareFlow Health / HealthcareOS

CareFlow Health is a React + TypeScript healthcare SaaS UI with doctor, patient, clinic, pharmacy, courier, and platform-admin workspaces.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Lucide icons
- Motion
- Shared React context and mock data for the current interactive prototype

## Run locally

Use Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Validation

```bash
npm run typecheck
npm run build
npm start
```

## Migration notes

- The existing feature screens, design tokens, role switcher, in-app view navigation, English/Bengali toggle, and prototype workflows are intentionally retained.
- The current app still uses in-memory state and mock data. Refreshing the page resets prototype state.
- This framework migration does not add production authentication, database persistence, a Spring Boot API, live medicine-provider integration, payment processing, or real clinical-signature infrastructure.
- Do not treat demo clinician credentials, example patient data, source labels, regulatory language, or medicine metadata as verified production data. Verify these before a real clinical deployment.
- `GEMINI_API_KEY` is documented as a server-only environment variable. Do not expose secrets through `NEXT_PUBLIC_*` variables.
