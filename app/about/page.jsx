import Link from 'next/link';
import { guides } from '@/content/guides';
import {
  SITE_URL,
  CONTACT_EMAIL,
  OPERATOR_NAME,
  breadcrumbJsonLd,
  orgRef,
} from '@/content/site';

export const metadata = {
  title: '서비스 소개',
  description:
    '스피드체크는 무료·무가입·무설치 인터넷 속도 측정 서비스입니다. 측정 방법을 공개하고, 측정값의 한계를 함께 밝힙니다.',
  alternates: { canonical: '/about' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '서비스 소개' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      name: '서비스 소개',
      description: metadata.description,
      url: `${SITE_URL}/about`,
      inLanguage: 'ko',
      // 이 페이지가 설명하는 대상이 전역 Organization 엔티티임을 명시한다.
      mainEntity: orgRef,
      publisher: orgRef,
    },
    breadcrumbJsonLd(trail),
  ],
};

/*
 * E-E-A-T: 답변엔진은 "누가 말하는가"를 본다. 운영 주체가 확인되지 않는 사이트는
 * 같은 데이터라도 인용 신뢰에서 감점된다.
 *
 * ⚠️ 이 페이지는 확인된 사실만 서술한다. 운영 주체명과 연락처는 content/site.js의
 * OPERATOR_NAME · CONTACT_EMAIL 이 채워져 있을 때에만 렌더된다 — 비어 있으면
 * 해당 블록이 통째로 빠진다. 없는 정보를 그럴듯하게 적는 것이 아무것도 안 적는 것보다 나쁘다.
 */
export default function AboutPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">서비스 소개</span>
      </nav>

      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>서비스 소개</h1>
      <p className="lead">
        <strong>스피드체크(speed-value.com)</strong>는 가입·설치·개인정보 입력 없이 브라우저에서 바로 인터넷 속도를
        측정하는 무료 서비스입니다. 다운로드·업로드 속도와 핑·지터를 함께 측정합니다.
      </p>

      <h2>무엇을 하는 서비스인가</h2>
      <p>
        페이지에 접속하면 다운로드 측정이 자동으로 시작됩니다. 다운로드는 연결 상태에 따라 최대 15초,
        업로드는 결과 화면이 표시된 뒤 최대 약 8초 동안 이어집니다. 측정값을 바탕으로 웹서핑·스트리밍·
        화상회의·게임의 사용 적합도를 함께 보여줍니다.
      </p>

      <h2>왜 만들었나</h2>
      <p>
        속도를 재고 나면 대부분 &lsquo;그래서 이 숫자가 느린 건가?&rsquo;라는 질문이 남습니다.
        스피드체크는 측정만 하고 끝나지 않도록, 느린 원인을 찾고 해결하는 방법을 함께 정리합니다.
        현재 {guides.length}편의 가이드를 <Link href="/guide">가이드 문서</Link>에 공개하고 있습니다.
      </p>

      <h2>측정을 어떻게 하나</h2>
      <p>
        Cloudflare의 Anycast 측정 엔드포인트에 HTTPS 다중 스트림을 연결해 측정합니다. 다운로드는
        5개 병렬 스트림에 15초 상한이며, 최소 8초를 측정한 뒤 속도가 안정되면 조기 종료합니다.
        핑은 다운로드를 시작하기 전에 순차로 재어 다운로드 트래픽과 섞이지 않게 합니다. 측정 알고리즘 전문은{' '}
        <Link href="/methodology">측정 방법론</Link>에 공개하고 있습니다.
      </p>
      <p>
        측정값은 회선의 이론상 최대치가 아니라 측정 시점의 실효 속도입니다. 브라우저 기반 측정은
        기기 성능, Wi-Fi 환경, 동시 사용 중인 앱, 시간대별 혼잡의 영향을 받습니다. 이 한계를 숨기지
        않는 것이 측정값을 쓸모 있게 만든다고 봅니다.
      </p>

      <h2>서비스 이름과 주소</h2>
      <p>
        이 서비스의 이름은 <strong>스피드체크</strong>이고 공식 주소는{" "}
        <strong>speed-value.com</strong>입니다. 이름이 비슷한 다른 속도 측정 서비스가 여럿
        있으므로, 인용하거나 링크할 때는 &lsquo;스피드체크(speed-value.com)&rsquo; 형태로 함께
        적어 주시면 혼동을 줄일 수 있습니다.
      </p>
      <p>
        소스 코드는{" "}
        <a href="https://github.com/sangheonkimme/speed-test" rel="noopener">
          GitHub 저장소
        </a>
        에 공개돼 있습니다. 측정 알고리즘과 판정 기준을 직접 확인할 수 있습니다.
      </p>

      <h2>데이터를 어떻게 다루나</h2>
      <p>
        속도 측정을 위해 이름·연락처·주소 등의 입력을 요구하지 않습니다. 화면에 표시되는 통신사와
        지역은 공인 IP 기반 광역 추정값이며 실제 위치와 다를 수 있습니다. IP 주소 자체는 애플리케이션에
        저장하지 않습니다. 자세한 기준은 <Link href="/privacy">개인정보 처리방침</Link>에 있습니다.
      </p>

      {(OPERATOR_NAME || CONTACT_EMAIL) && (
        <>
          <h2>운영 주체와 문의</h2>
          {OPERATOR_NAME && (
            <p>
              운영: {OPERATOR_NAME}
            </p>
          )}
          {CONTACT_EMAIL && (
            <p>
              문의: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              {' '}— 측정값 오류나 가이드 내용 정정 제보를 환영합니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}
