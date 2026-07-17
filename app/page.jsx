import { faq, createFaqJsonLd } from '@/content/faq';
import { SpeedTest } from '@/features/speed-test';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: '스피드체크',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      description: '무료·무가입·무설치 인터넷 속도 측정. 다운로드·업로드·핑·지터를 한 번에 확인.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
      inLanguage: 'ko',
    },
    createFaqJsonLd(faq),
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpeedTest />
      {/* SEO 콘텐츠 (서버 렌더링 — FR-16 기반) */}
      <section className="wrap seo-sec">
        <details className="seo-details">
          <summary>속도 측정 안내 및 자주 묻는 질문</summary>
          <div className="seo-content">
            <h2>스피드체크에서는 무엇을 측정하나요?</h2>
            <p>
              페이지에 접속하면 다운로드 측정이 자동으로 시작됩니다. 다운로드·업로드 속도와 핑·지터를 확인하고,
              측정값을 바탕으로 웹서핑·스트리밍·화상회의·게임의 사용 적합도를 함께 보여줍니다.
              결과는 측정 시점의 기기, 연결 방식과 네트워크 상황에 따라 달라질 수 있습니다.
            </p>
            {faq.map((item) => (
              <div key={item.q}>
                <h2>{item.q}</h2>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </details>
      </section>
    </>
  );
}
