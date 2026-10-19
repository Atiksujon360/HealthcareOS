import type { MetadataRoute } from 'next';
import { publicEnv } from '../config/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
    sitemap: `${publicEnv.appUrl}/sitemap.xml`,
  };
}
