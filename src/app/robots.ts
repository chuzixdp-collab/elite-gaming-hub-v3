import type { MetadataRoute } from 'next';

/**
 * Elite Gaming Hub — robots.txt
 * Route: /robots.txt
 *
 * Generated via Next.js App Router Metadata Route.
 * Allows all major crawlers and points to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elite-gaming-hub-v3.netlify.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
