const DEFAULT_APP_URL = 'http://localhost:3000';

function normalizeUrl(value: string | undefined): string {
  const candidate = value || DEFAULT_APP_URL;
  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}

/** Public configuration only. Secrets must never be imported by Client Components. */
export const publicEnv = Object.freeze({
  appUrl: normalizeUrl(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL),
  appName: 'HealthcareOS',
});
