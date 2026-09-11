import Link from 'next/link';
import { SITE_URL, breadcrumbJsonLd, orgRef } from '@/content/site';

export const metadata = {
  title: '측정 방법론',
  description:
    '스피드체크가 인터넷 속도를 측정하는 방식 — Cloudflare 엣지 기반 HTTPS 다중 스트림, 15초 상한, 수렴 시 조기 종료.',
  alternates: { canonical: '/methodology' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '측정 방법론' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TechArticle',
      headline: '측정 방법론',
      description: metadata.description,
      url: `${SITE_URL}/methodology`,
      mainEntityOfPage: `${SITE_URL}/methodology`,
      inLanguage: 'ko',
      author: orgRef,
      publisher: orgRef,
    },
    breadcrumbJsonLd(trail),
  ],
};

export default function MethodologyPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">측정 방법론</span>
      </nav>
      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>측정 방법론</h1>
      <p>스피드체크는 측정 방식을 투명하게 공개합니다.</p>

      <h2>측정 서버</h2>
      <p>
        Cloudflare의 Anycast 속도 측정 엔드포인트를 사용합니다. 일반적으로 네트워크에서 가까운 Cloudflare 엣지에
        연결되지만, 실제 접속 서버와 네트워크 경로는 통신사 라우팅과 접속 환경에 따라 달라질 수 있습니다.
      </p>

      <h2>다운로드 속도</h2>
      <p>
        HTTPS 병렬 다중 스트림(5개)으로 데이터를 내려받으며, 파일 크기를 점진적으로 키워 회선 대역폭을 포화시킵니다.
        200ms 간격으로 순간 속도를 샘플링하고, 최근 샘플의 중앙값을 실시간 표시합니다.
        측정 상한은 15초입니다. 8초가 지난 뒤, 최근 2초 구간과 그 직전 2초 구간의 속도
        중앙값 차이가 5% 이내이고 하락 중이 아닐 때 조기 종료합니다. 순간 속도는 샘플마다
        흔들리는 게 정상이므로 개별 샘플이 아니라 구간 중앙값을 비교합니다. 최종값은 측정
        마지막 4초 구간 샘플의 중앙값입니다.
      </p>

      <h2>업로드 속도</h2>
      <p>
        측정 서버로 데이터를 전송하는 방식이며 3개 병렬 스트림을 사용합니다.
        느린 회선에서도 정확히 측정되도록 전송 단위를 128KB에서 시작해 회선 속도에 따라 최대 8MB까지 조정합니다.
        다운로드 결과 표시 후 백그라운드에서 약 8초간 측정됩니다.
      </p>

      <h2>지연(핑)과 지터</h2>
      <p>
        다운로드를 시작하기 전에, 소요 시간이 짧은 요청을 순차적으로 최대 8회 보내 왕복
        시간(RTT)을 측정합니다. 요청을 동시에 보내면 서로 줄을 서면서 RTT가 왜곡되므로
        순차로 보냅니다. 첫 요청 1회는 연결 수립 시간이 섞일 수 있어 결과에서 제외합니다. 느린 회선에서 다운로드 시작이 늦어지지 않도록 총 1.8초의 예산을
        두고, 예산을 넘기면 최소 4개 표본만 확보하고 중단합니다.
        핑은 RTT의 중앙값, 지터는 연속한 RTT 사이 차이의 평균입니다.
        다운로드가 회선을 채운 상태의 지연은 이와 별개로 측정합니다 — 유휴 상태의 지연과
        부하 중 지연은 다른 값이므로 섞지 않습니다.
      </p>

      <h2>오차 요인</h2>
      <p>
        브라우저 기반 측정은 기기 성능, Wi-Fi 환경, 동시 사용 중인 앱, 시간대별 혼잡의 영향을 받습니다.
        정확한 값이 필요하면 유선(랜선) 연결 상태에서 다른 사용을 멈추고 2~3회 반복 측정한 값을 참고하세요.
        측정값은 회선의 이론상 최대치가 아니라 측정 시점의 실효 속도입니다.
      </p>

      <h2>표시 기준</h2>
      <p>
        1Mbps 미만은 Kbps 단위로 표시합니다. 등급 라벨과 용도별 적합도는 스트리밍·화상회의·게임 서비스의
        공개 권장 대역폭을 기준으로 한 절대 속도 판정이며, 향후 실측 데이터가 축적되면 지역·통신사 평균 비교를 제공할 예정입니다.
      </p>
    </div>
  );
}
