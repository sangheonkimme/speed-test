import Link from 'next/link';
import { SITE_URL, breadcrumbJsonLd, orgRef } from '@/content/site';

export const metadata = {
  title: '개인정보 처리방침',
  description: '스피드체크의 속도 측정 및 방문 분석 정보 처리 기준을 안내합니다.',
  alternates: { canonical: '/privacy' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '개인정보 처리방침' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: '개인정보 처리방침',
      description: metadata.description,
      url: `${SITE_URL}/privacy`,
      inLanguage: 'ko',
      publisher: orgRef,
    },
    breadcrumbJsonLd(trail),
  ],
};

export default function PrivacyPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">개인정보 처리방침</span>
      </nav>
      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>개인정보 처리방침</h1>
      <p>시행일: 2026년 7월 17일</p>

      <h2>1. 이용자가 직접 입력하는 개인정보</h2>
      <p>
        스피드체크는 회원가입 없이 이용하는 서비스로, 속도 측정을 위해 이름·연락처·주소 등의 입력을 요구하지 않습니다.
      </p>

      <h2>2. 측정 과정에서 처리되는 정보</h2>
      <p>
        측정 시 브라우저가 전송하는 IP 주소를 기반으로 통신사(ISP)와 광역 지역을 추정해 화면에 표시합니다.
        IP 주소 자체는 스피드체크 애플리케이션에 저장하지 않습니다. 측정값, 통신사, 광역 지역 추정값,
        기기 유형과 연결 방식은 결과 표시와 서비스 품질 분석을 위해 처리될 수 있습니다.
      </p>

      <h2>3. 쿠키 및 유사 기술</h2>
      <p>
        서비스 품질 파악을 위해 Google Tag Manager와 Google Analytics 같은 방문 분석 도구를 사용할 수 있습니다.
        이 과정에서 측정 이벤트, 브라우저·기기 정보와 쿠키 또는 유사 식별자가 분석 사업자의 정책에 따라 처리될 수 있습니다.
        향후 광고(Google AdSense 등)가 도입되면 광고 사업자의 쿠키 사용에 대한 고지를 이 문서에 갱신합니다.
      </p>

      <h2>4. 외부 서비스</h2>
      <p>
        속도 측정 요청은 Cloudflare의 측정 엔드포인트로 전송되며, 방문 분석을 활성화한 경우 분석 이벤트가 Google로 전송될 수 있습니다.
        각 외부 서비스에서의 정보 처리는 해당 사업자의 개인정보 처리방침을 따릅니다.
        향후 요금제 비교 등 개인정보 입력이 필요한 기능이 추가될 경우, 해당 시점에 별도의 동의 절차와 함께 이 방침을 개정합니다.
      </p>

      <h2>5. 문의</h2>
      <p>개인정보 관련 문의는 사이트 운영자에게 연락해 주세요. 문의 채널은 준비 중입니다.</p>

      <h2>측정값을 서버에 저장하지 않습니다</h2>
      <p>
        속도 측정은 이용자의 브라우저에서 이루어지고, 결과는 화면에 표시하기 위해 처리됩니다. 현재
        스피드체크는 측정값을 서버에 저장해 두지 않습니다. 앞으로 지역·통신사별 평균을 제공하기 위해
        측정값을 집계해 보관하게 되면, 그 전에 이 방침을 먼저 갱신하고 무엇을 어떤 형태로 보관하는지
        밝히겠습니다.
      </p>

      <h2>외부 서비스와 처리 위탁</h2>
      <p>
        서비스를 운영하기 위해 다음 외부 서비스를 이용합니다. 속도 측정 요청은 Cloudflare의 측정
        엔드포인트로 전송되고, 사이트 자체는 Vercel의 호스팅 환경에서 제공됩니다. 방문 분석과 광고를
        사용하는 경우 Google의 서비스를 통해 처리됩니다. 각 서비스에서의 정보 처리는 해당 사업자의
        개인정보 처리방침을 따릅니다.
      </p>

      <h2>이용자가 할 수 있는 선택</h2>
      <p>
        스피드체크는 회원가입이 없으므로 저장된 계정 정보가 없습니다. 방문 분석과 광고에 쓰이는 쿠키는
        브라우저 설정에서 차단하거나 삭제할 수 있고, 광고 사업자가 제공하는 설정 화면에서 개인 맞춤
        광고를 끌 수도 있습니다. 쿠키를 차단해도 속도 측정 기능은 그대로 이용할 수 있습니다.
      </p>

      <h2>문의</h2>
      <p>
        개인정보 처리에 관한 문의는 <Link href="/contact">문의하기</Link>로 받습니다. 이 방침이 바뀌면
        이 페이지의 시행일을 갱신하고, 바뀐 내용은 게시한 시점부터 적용됩니다.
      </p>
    </div>
  );
}
