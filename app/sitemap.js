import { guides } from '@/content/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://speedcheck.vercel.app';

export default function sitemap() {
  const guideEntries = [
    {
      url: `${SITE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...guides.map((g) => ({
      url: `${SITE_URL}/guide/${g.slug}`,
      lastModified: new Date(g.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];

  return [
    ...guideEntries,
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
