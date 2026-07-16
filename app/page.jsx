import { SpeedTest } from '@/features/speed-test';

const faq = [
  {
    q: '인터넷 속도 측정은 어떻게 하나요?',
    a: '스피드체크에 접속하면 별도 설치나 가입 없이 즉시 다운로드 속도 측정이 자동으로 시작됩니다. 첫 수치가 수 초 안에 표시되고 다운로드 결과는 보통 5~7초면 확인할 수 있습니다. 업로드는 결과 화면에서 이어서 측정됩니다.',
  },
  {
    q: '측정 결과가 요금제 속도보다 느린 이유는 무엇인가요?',
    a: '와이파이 공유기 성능·위치, 동시 접속 기기 수, 시간대별 혼잡, 노후 회선 등이 원인일 수 있습니다. 유선(랜선) 연결로 재측정해 보면 공유기 문제인지 회선 문제인지 구분할 수 있습니다.',
  },
  {
    q: '정확한 측정을 위한 팁이 있나요?',
    a: '다른 다운로드·스트리밍을 잠시 멈추고, 가능하면 유선 연결 상태에서 2~3회 반복 측정한 값을 참고하세요. 스피드체크는 국내 서버 기준 다중 스트림으로 측정해 해외 서버 측정으로 인한 과소 측정을 방지합니다.',
  },
  {
    q: '측정 데이터는 어떻게 사용되나요?',
    a: '이름·연락처 등 개인정보는 수집하지 않습니다. 측정값은 개인 식별자 없이 처리되며, 향후 지역·통신사 단위의 비식별 품질 통계로만 활용됩니다.',
  },
];

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
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
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
        <h2>인터넷 속도 측정, 왜 스피드체크인가요?</h2>
        <p>
          스피드체크는 접속 즉시 자동으로 측정을 시작하는 무료 인터넷 속도 테스트입니다.
          앱 설치나 회원가입 없이 다운로드·업로드 속도, 지연(핑), 지터까지 한 번에 확인하고,
          웹서핑·스트리밍·화상회의·게임 등 용도별 적합도로 내 인터넷 상태를 진단할 수 있습니다.
        </p>
        <h2>KT · SK브로드밴드 · LG유플러스 속도 비교</h2>
        <p>
          측정 시 IP 기반으로 통신사(KT, SK브로드밴드, LG유플러스)와 시·군·구 수준의 지역을 자동 인식합니다.
          정밀 위치는 수집하지 않으며, 측정값은 개인 식별자 없이 처리됩니다.
        </p>
        {faq.map((f) => (
          <div key={f.q}>
            <h2>{f.q}</h2>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </>
  );
}
