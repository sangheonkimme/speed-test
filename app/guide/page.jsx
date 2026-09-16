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

      <h2 style={{ fontSize: 17, marginTop: 36 }}>어떤 순서로 보면 되나</h2>
      <p>
        무엇이 문제인지 아직 모르겠다면{' '}
        <Link href="/guide/internet-suddenly-slow">인터넷이 갑자기 느려졌을 때 확인할 7가지</Link>부터
        보세요. 원인을 회선·공유기·기기 중 어디로 좁힐지 순서대로 짚습니다. 와이파이만 느린 것 같다면{' '}
        <Link href="/guide/wifi-speed-test-guide">와이파이 속도 측정, 제대로 하는 법</Link>으로 조건을
        맞춰 다시 재 보는 것이 먼저입니다.
      </p>
      <p>
        요금제를 바꿀지 고민 중이라면{' '}
        <Link href="/guide/internet-plan-speed-guide">100메가 vs 500메가 vs 1기가</Link>에서 실제로
        필요한 속도를 먼저 계산해 보세요. 속도를 올려도 체감이 그대로인 경우가 많습니다. 계약 조건을 따질
        때는 <Link href="/guide/internet-signup-gift-structure">현금 사은품의 구조</Link>와{' '}
        <Link href="/guide/internet-contract-penalty">약정 위약금 계산</Link>을 함께 보면 총 납부액이
        보입니다.
      </p>

      <h2 style={{ fontSize: 17 }}>이 가이드를 쓰는 원칙</h2>
      <p>
        측정으로 확인할 수 있는 것과 확인할 수 없는 것을 구분해서 씁니다. 예를 들어 &lsquo;어느 통신사가
        빠르다&rsquo;는 말은 쓰지 않습니다. 같은 상품이라도 건물의 회선 상태에 따라 달라져서, 자체 측정
        데이터로 뒷받침되기 전까지는 근거 없는 주장이기 때문입니다.
      </p>
      <p>
        요금제와 약정 조건은 수시로 바뀝니다. 지금은 맞지 않는 설명을 발견하시면{' '}
        <Link href="/contact">문의하기</Link>로 알려주세요. 확인해서 고치고 문서의 최종 수정일을 함께
        갱신합니다. 측정 자체가 어떻게 이루어지는지는{' '}
        <Link href="/methodology">측정 방법론</Link>에 전부 공개해 두었습니다.
      </p>
    </div>
  );
}
