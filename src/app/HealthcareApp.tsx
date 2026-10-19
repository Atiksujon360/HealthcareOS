'use client';

import App from '../App';
import { AppProviders } from '../providers/AppProviders';

export default function HealthcareApp() {
  return (
    <AppProviders>
      <App />
    </AppProviders>
  );
}
