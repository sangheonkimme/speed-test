import { guides, guideUpdated } from '@/content/guides';
import { SITE_URL } from '@/content/site';

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
      // Article JSON-LD의 dateModified와 같은 소스를 쓴다 — 두 값이 어긋나면 신선도 신호가 깨진다.
      lastModified: new Date(guideUpdated(g)),
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
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
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
