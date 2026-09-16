import Link from 'next/link';
import { SITE_URL, CONTACT_EMAIL, OPERATOR_NAME, breadcrumbJsonLd, orgRef } from '@/content/site';

export const metadata = {
  title: '문의하기',
  description:
    '스피드체크에 측정값 오류 제보, 가이드 내용 정정, 제휴·인용 문의를 보내는 방법을 안내합니다.',
  alternates: { canonical: '/contact' },
};

const trail = [
  { name: '홈', url: '/' },
  { name: '문의하기' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      name: '문의하기',
      description: metadata.description,
      url: `${SITE_URL}/contact`,
      inLanguage: 'ko',
      publisher: orgRef,
    },
    breadcrumbJsonLd(trail),
  ],
};

/*
 * 연락 수단이 있는 사이트가 신뢰 판정에서 유리하고, 실제로 측정값 오류 제보를 받는 창구가 필요하다.
 * 이메일이 content/site.js에 없으면 이 페이지를 만들 이유가 없으므로 안내 문구를 바꿔 렌더한다.
 */
export default function ContactPage() {
  return (
    <div className="wrap seo-sec" style={{ paddingBottom: 64 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="crumbs" aria-label="현재 위치">
        <Link href="/">홈</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">문의하기</span>
      </nav>

      <h1 style={{ fontSize: 24, letterSpacing: '-0.02em' }}>문의하기</h1>
      <p className="lead">
        측정값이 이상하거나 가이드 내용에 틀린 곳이 있다면 알려주세요. 제보를 확인해 고치고, 필요하면
        측정 방법론 문서에 반영합니다.
      </p>

      {CONTACT_EMAIL ? (
        <p>
          문의 메일: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {OPERATOR_NAME ? ` (운영: ${OPERATOR_NAME})` : null}
        </p>
      ) : (
        <p>현재 문의 창구를 준비 중입니다.</p>
      )}

      <h2>이런 문의를 받습니다</h2>

      <h3>측정값이 이상할 때</h3>
      <p>
        다른 속도 측정 서비스와 결과가 크게 다르거나, 같은 환경에서 잴 때마다 값이 크게 흔들린다면
        제보해 주세요. 알려주시면 도움이 되는 정보는 다음과 같습니다. 측정한 시각, 유선인지 와이파이인지,
        통신사와 요금제 표기 속도, 화면에 표시된 다운로드·업로드·핑·지터 값, 비교한 다른 서비스의 결과입니다.
      </p>
      <p>
        측정값은 회선뿐 아니라 기기 성능과 그 순간의 네트워크 상황에 영향을 받습니다. 그래서 값이 서로
        다른 것 자체가 곧 오류는 아닙니다. 다만 재현되는 차이라면 측정 방식의 문제일 수 있으므로 확인할
        가치가 있습니다. 측정이 어떻게 이루어지는지는 <Link href="/methodology">측정 방법론</Link>에
        전부 공개해 두었습니다.
      </p>

      <h3>가이드 내용 정정</h3>
      <p>
        통신사 정책과 요금 조건은 바뀝니다. 가이드에 지금은 맞지 않는 설명이 있다면 알려주세요. 어느 글의
        어느 대목인지와 함께 근거가 될 만한 출처를 주시면 확인이 빨라집니다. 고칠 때는 본문을 수정하고
        문서의 최종 수정일을 함께 갱신합니다.
      </p>

      <h3>인용·출처 표기</h3>
      <p>
        측정 방법론이나 가이드 내용을 인용하실 때는 별도 허락 없이 출처를 밝히고 사용하셔도 됩니다. 표기는
        &lsquo;스피드체크(speed-value.com)&rsquo; 형태로 링크와 함께 적어 주시면 됩니다. 자료 제공이나
        협업 문의도 같은 메일로 받습니다.
      </p>

      <h2>문의 전에 확인하면 좋은 것</h2>
      <p>
        측정값이 요금제보다 낮게 나오는 경우는 대부분 회선 자체보다 와이파이나 동시 사용 때문입니다. 유선
        연결 상태에서 다른 다운로드를 멈추고 2~3회 측정한 값을 비교해 보시면 원인이 어느 쪽인지 좁혀집니다.
        구체적인 점검 순서는{' '}
        <Link href="/guide/internet-suddenly-slow">인터넷이 갑자기 느려졌을 때 확인할 7가지</Link>에
        정리해 두었습니다.
      </p>

      <h2>답변에 대해</h2>
      <p>
        개인이 운영하는 서비스라 모든 메일에 답변을 드리지는 못합니다. 다만 측정값 오류와 내용 정정 제보는
        빠짐없이 확인하고 있습니다. 광고·홍보 목적의 대량 발송 메일에는 회신하지 않습니다.
      </p>
      <p>
        문의 메일에 담긴 내용은 문의 처리 목적으로만 사용합니다. 측정 과정에서 처리되는 정보는{' '}
        <Link href="/privacy">개인정보 처리방침</Link>에 별도로 정리해 두었습니다.
      </p>

      <h2>자주 들어오는 문의</h2>

      <h3>통신사를 추천해 주실 수 있나요</h3>
      <p>
        특정 통신사를 추천하지 않습니다. 같은 상품이라도 건물의 회선 상태와 실내 배선에 따라 실제 속도가
        달라져서, 어느 쪽이 빠르다고 단정할 근거가 없기 때문입니다. 대신 무엇을 기준으로 비교해야 하는지는{' '}
        <Link href="/guide/kt-sk-lg-internet-compare">통신사 비교 기준</Link>에 정리해 두었습니다.
      </p>

      <h3>측정 결과를 자료로 써도 되나요</h3>
      <p>
        개인적인 기록이나 통신사 문의용으로 쓰시는 것은 자유입니다. 다만 측정값은 그 순간의 실효 속도이고
        통신사가 정한 측정 조건과는 다르므로, 공식 절차에 제출할 때는 해당 조건을 함께 확인하셔야 합니다.
      </p>

      <h3>광고나 제휴 제안</h3>
      <p>
        제안 내용과 조건을 메일로 보내 주세요. 측정 화면을 가리거나 측정 결과를 왜곡하는 형태의 제안은
        받지 않습니다.
      </p>
    </div>
  );
}
