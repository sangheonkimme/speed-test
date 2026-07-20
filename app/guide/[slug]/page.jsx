import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuide } from '@/content/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://speedcheck.vercel.app';

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
    },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        datePublished: guide.date,
        inLanguage: 'ko',
        mainEntityOfPage: `${SITE_URL}/guide/${guide.slug}`,
        author: { '@type': 'Organization', name: '스피드체크' },
        publisher: { '@type': 'Organization', name: '스피드체크' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const related = (guide.related || []).map(getGuide).filter(Boolean);

  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p><Link href="/guide">← 가이드 목록</Link></p>
      <article>
        <h1 style={{ fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.35 }}>{guide.title}</h1>
        <p>{guide.description}</p>

        {guide.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
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
