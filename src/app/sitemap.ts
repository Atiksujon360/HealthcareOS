import type { MetadataRoute } from 'next';
import { publicEnv } from '../config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: publicEnv.appUrl, changeFrequency: 'monthly', priority: 0.5 }];
}
