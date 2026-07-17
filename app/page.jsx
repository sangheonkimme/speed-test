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
      description: '무료·무가입·무설치 인터넷 속도 측정. 다운로드·업로드·핑·지터를 3초 안에 확인.',
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
            <h2>인터넷 속도 측정, 왜 스피드체크인가요?</h2>
            <p>
              스피드체크는 접속 즉시 자동으로 측정을 시작하는 무료 인터넷 속도 테스트입니다.
              앱 설치나 회원가입 없이 다운로드·업로드 속도, 지연(핑), 지터까지 한 번에 확인하고,
              웹서핑·스트리밍·화상회의·게임 등 용도별 적합도로 내 인터넷 상태를 진단할 수 있습니다.
            </p>
            <h2>KT · SK브로드밴드 · LG유플러스 속도 비교</h2>
            <p>
              측정 시 공인 IP를 기반으로 통신사(KT, SK브로드밴드, LG유플러스)와 광역 지역을 추정합니다.
              이 정보는 실제 접속 위치와 다를 수 있으며, 시·군·구나 정밀 위치는 표시하거나 수집하지 않습니다.
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
