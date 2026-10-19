import type { Metadata } from 'next';
import '../index.css';
import { publicEnv } from '../config/env';

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: { default: 'HealthcareOS', template: '%s | HealthcareOS' },
  description: 'HealthcareOS clinical operations workspace for connected care teams.',
  applicationName: publicEnv.appName,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: publicEnv.appName,
    title: publicEnv.appName,
    description: 'HealthcareOS clinical operations workspace for connected care teams.',
  },
  twitter: { card: 'summary' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
