import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuide, guideUpdated } from '@/content/guides';
import { SITE_URL, breadcrumbJsonLd, orgRef } from '@/content/site';
import { GuideTable } from '@/app/_components/GuideTable';

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `/guide/${guide.slug}` },
    openGraph: {
      type: 'article',
      title: guide.title,
      description: guide.description,
      url: `/guide/${guide.slug}`,
      // 가이드 페이지에 og:image가 없던 문제 보완. 루트 OG 이미지를 공용으로 쓴다.
      images: ['/opengraph-image'],
      publishedTime: guide.date,
      modifiedTime: guideUpdated(guide),
    },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // 화면의 빵부스러기 UI와 동일한 내용이어야 한다 — 가시 텍스트에 없는 구조화 데이터는 스팸 신호다.
  const trail = [
    { name: '홈', url: '/' },
    { name: '인터넷 속도 가이드', url: '/guide' },
    { name: guide.title },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        datePublished: guide.date,
        // 사이트맵 lastmod와 같은 소스(guideUpdated) — 두 값은 영구히 일치한다.
        dateModified: guideUpdated(guide),
        image: `${SITE_URL}/opengraph-image`,
        inLanguage: 'ko',
        mainEntityOfPage: `${SITE_URL}/guide/${guide.slug}`,
        // 전역에서 한 번 선언된 Organization을 참조한다 (페이지마다 새로 선언하면 엔티티가 분열된다).
        author: orgRef,
        publisher: orgRef,
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      breadcrumbJsonLd(trail),
    ],
  };

  const related = (guide.related || []).map(getGuide).filter(Boolean);

  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <Link href="/guide">인터넷 속도 가이드</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{guide.title}</span>
      </nav>
      <article>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.35 }}>{guide.title}</h1>

        {/*
          직답 문단 — 답변엔진은 페이지를 요약하지 않고 답이 되는 문장을 추출한다.
          문맥 없이 단독으로 사실을 말해야 하므로 지시어("위에서 말한", "이것은")를 쓰지 않는다.
        */}
        {guide.lead && (
          <p className="lead">
            <strong>결론부터:</strong> {guide.lead}
          </p>
        )}

        <p>{guide.description}</p>

        {guide.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {s.table && <GuideTable {...s.table} />}
          </section>
        ))}

        {/* 측정 CTA — 글 유입을 측정으로 전환 */}
        <div className="card" style={{ marginTop: 28, textAlign: 'center', padding: 28 }}>
          <h2 style={{ fontSize: 18 }}>지금 내 인터넷 속도는?</h2>
          <p style={{ margin: '6px 0 16px' }}>
            설치·가입 없이 접속하면 바로 측정됩니다. 다운로드·업로드·핑·지터까지 한 번에.
          </p>
          <Link href="/" className="btn btn-lg btn-solid-primary" style={{ display: 'inline-flex' }}>
            무료 속도 측정하기
          </Link>
        </div>

        <h2>자주 묻는 질문</h2>
        {guide.faq.map((f) => (
          <div key={f.q}>
            <h3 style={{ fontSize: 15, margin: '18px 0 6px' }}>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        {related.length > 0 && (
          <>
            <h2>함께 보면 좋은 글</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug} style={{ margin: '6px 0' }}>
                  <Link href={`/guide/${r.slug}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </div>
  );
}
