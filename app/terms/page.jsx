import Link from 'next/link';
import { SITE_URL, CONTACT_EMAIL, OPERATOR_NAME, breadcrumbJsonLd, orgRef } from '@/content/site';

export const metadata = {
  title: '이용약관',
  description:
    '스피드체크 서비스 이용 조건 — 무료·무가입 이용, 측정값의 성격과 한계, 콘텐츠 인용 기준, 면책 범위를 안내합니다.',
  alternates: { canonical: '/terms' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '이용약관' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: '이용약관',
      description: metadata.description,
      url: `${SITE_URL}/terms`,
      inLanguage: 'ko',
      publisher: orgRef,
    },
    breadcrumbJsonLd(trail),
  ],
};

export default function TermsPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">이용약관</span>
      </nav>

      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>이용약관</h1>
      <p>시행일: 2026년 9월 16일</p>
      <p className="lead">
        스피드체크(speed-value.com)는 가입 없이 누구나 무료로 쓰는 인터넷 속도 측정 서비스입니다. 이
        문서는 서비스를 이용할 때 적용되는 조건과, 측정값을 어떻게 받아들여야 하는지를 정리한 것입니다.
      </p>

      <h2>1. 서비스 내용</h2>
      <p>
        스피드체크는 브라우저에서 인터넷 회선의 다운로드·업로드 속도와 지연(핑)·지터를 측정해 보여주고,
        측정값을 이해하는 데 필요한 가이드 문서를 제공합니다. 회원가입, 프로그램 설치, 이름·연락처 입력을
        요구하지 않습니다. 이용료는 없습니다.
      </p>

      <h2>2. 측정값의 성격과 한계</h2>
      <p>
        측정값은 측정한 그 순간에 브라우저가 실제로 주고받은 속도입니다. 회선의 이론상 최대치나 통신사가
        보장하는 속도가 아닙니다. 같은 회선이라도 기기 성능, 유선인지 무선인지, 동시에 실행 중인 다른
        기기와 프로그램, 시간대별 혼잡에 따라 값이 달라집니다.
      </p>
      <p>
        따라서 측정값을 계약 이행 여부나 손해액을 따지는 근거로 단독으로 쓰기에는 적합하지 않습니다.
        통신사에 회선 점검이나 요금 감면을 요청할 때는 통신사가 정한 측정 조건과 절차를 함께 확인하시기
        바랍니다. 측정이 어떤 방식으로 이루어지는지는{' '}
        <Link href="/methodology">측정 방법론</Link>에 공개해 두었습니다.
      </p>
      <p>
        가이드 문서의 내용은 일반적인 정보 제공을 목적으로 합니다. 통신사의 요금제와 약정 조건은 수시로
        바뀌므로, 실제 계약 전에는 해당 통신사의 공식 안내와 약관을 확인해야 합니다.
      </p>

      <h2>3. 이용자가 하지 말아야 할 것</h2>
      <p>
        서비스에 과도한 부하를 주는 자동 반복 요청, 측정 엔드포인트를 이 서비스의 화면이 아닌 용도로
        대량 호출하는 행위, 서비스 운영을 방해하거나 다른 이용자의 이용을 방해하는 행위는 삼가 주시기
        바랍니다. 이런 이용이 확인되면 접속을 제한할 수 있습니다.
      </p>

      <h2>4. 콘텐츠와 인용</h2>
      <p>
        이 사이트의 글과 도표에 대한 권리는 운영자에게 있습니다. 다만 출처를 밝히는 인용은 별도 허락 없이
        하셔도 됩니다. 표기는 &lsquo;스피드체크(speed-value.com)&rsquo; 형태로 원문 링크와 함께 적어
        주시면 됩니다. 전문을 그대로 복제해 게시하는 것은 삼가 주시기 바랍니다.
      </p>
      <p>
        측정 서버로는 Cloudflare의 속도 측정 엔드포인트를 이용합니다. 해당 서비스의 이용 조건은 각
        제공자의 정책을 따릅니다.
      </p>

      <h2>5. 광고</h2>
      <p>
        서비스 운영 비용을 충당하기 위해 광고를 게재할 수 있습니다. 광고는 측정 진행 화면을 가리지 않는
        위치에만 두는 것을 원칙으로 합니다. 광고 사업자의 쿠키 사용에 관한 사항은{' '}
        <Link href="/privacy">개인정보 처리방침</Link>에 정리합니다.
      </p>

      <h2>6. 면책</h2>
      <p>
        서비스는 있는 그대로 제공됩니다. 운영자는 서비스가 언제나 중단 없이 제공되거나, 측정값이 특정한
        정확도를 만족한다고 보장하지 않습니다. 측정값이나 가이드 내용을 근거로 한 이용자의 판단과 그
        결과에 대해서는 책임을 지지 않습니다. 다만 운영자의 고의나 중대한 과실로 발생한 손해에 대한
        책임까지 배제하지는 않습니다.
      </p>

      <h2>7. 약관 변경</h2>
      <p>
        서비스 내용이 바뀌면 이 약관을 개정할 수 있습니다. 개정할 때는 이 페이지의 시행일을 갱신합니다.
        변경된 약관은 게시한 시점부터 적용됩니다.
      </p>

      <h2>8. 문의</h2>
      <p>
        약관과 서비스 이용에 관한 문의는 <Link href="/contact">문의하기</Link>를 통해 받습니다.
        {CONTACT_EMAIL ? (
          <>
            {' '}
            메일 주소는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>입니다.
          </>
        ) : null}
        {OPERATOR_NAME ? ` 운영: ${OPERATOR_NAME}.` : null}
      </p>
    </div>
  );
}
