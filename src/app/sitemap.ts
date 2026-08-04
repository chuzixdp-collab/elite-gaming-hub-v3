import type { MetadataRoute } from 'next';

/**
 * Elite Gaming Hub — Sitemap
 * Route: /sitemap.xml
 *
 * Generated via Next.js App Router Metadata Route.
 * All public-facing pages are listed below. Internal/auth-gated
 * views (dashboard, wallet, admin panel) are intentionally excluded
 * because the site is a single-page client-routed Next.js app
 * (views are toggled via Zustand navigation, not URL paths).
 *
 * Since the application uses a single root page (`/`) with client-side
 * view switching, we expose the main entry point plus public
 * deep-linkable views via query parameters where applicable.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elite-gaming-hub-v3.netlify.app';
  const lastModified = new Date();
  const changeFrequency: 'daily' = 'daily';
  const monthlyChange: 'monthly' = 'monthly';

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?view=store`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?view=tournaments`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?view=contact-us`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?view=privacy-policy`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/?view=terms-conditions`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/?view=refund-policy`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/?view=login`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/?view=signup`,
      lastModified,
      changeFrequency: monthlyChange,
      priority: 0.5,
    },
  ];
}
