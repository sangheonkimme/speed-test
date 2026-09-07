import Link from 'next/link';
import { guides } from '@/content/guides';
import { SITE_URL, WEBSITE_ID, breadcrumbJsonLd, orgRef } from '@/content/site';

export const metadata = {
  title: '인터넷 속도 가이드',
  description:
    '인터넷이 느릴 때 점검법, 와이파이 측정 요령, 요금제 선택 기준까지 — 실측 기반으로 정리한 인터넷 속도 가이드.',
  alternates: { canonical: '/guide' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '인터넷 속도 가이드' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: '인터넷 속도 가이드',
      description: metadata.description,
      url: `${SITE_URL}/guide`,
      inLanguage: 'ko',
      isPartOf: { '@id': WEBSITE_ID },
      publisher: orgRef,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: guides.length,
        itemListElement: guides.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: g.title,
          url: `${SITE_URL}/guide/${g.slug}`,
        })),
      },
    },
    breadcrumbJsonLd(trail),
  ],
};

export default function GuideIndexPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">인터넷 속도 가이드</span>
      </nav>
      <h1 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>인터넷 속도 가이드</h1>
      <p>
        측정만 하고 끝나지 않도록, 느린 원인을 찾고 해결하는 방법을 정리했습니다.
        모든 가이드는 <Link href="/methodology">공개된 측정 방법론</Link>과 서비스별 공식 권장 대역폭을 근거로 작성합니다.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {guides.map((g) => (
          <article key={g.slug} className="card">
            <h2 style={{ fontSize: 17 }}>
              <Link href={`/guide/${g.slug}`}>{g.title}</Link>
            </h2>
            <p style={{ margin: '6px 0 0' }}>{g.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
