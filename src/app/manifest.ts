import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HealthcareOS',
    short_name: 'HealthcareOS',
    description: 'HealthcareOS clinical operations workspace.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0F766E',
    icons: [],
  };
}
