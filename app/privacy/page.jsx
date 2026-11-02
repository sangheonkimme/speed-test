import Link from 'next/link';
import { SITE_URL, CONTACT_EMAIL, breadcrumbJsonLd, orgRef, koDate } from '@/content/site';

export const metadata = {
  title: '개인정보 처리방침',
  description:
    '스피드체크가 속도 측정, 방문 분석, 광고 과정에서 어떤 정보를 처리하고 무엇을 저장하지 않는지, 이용자가 고를 수 있는 선택을 안내합니다.',
  alternates: { canonical: '/privacy' },
};

/*
 * 개정 이력. 맨 위가 현재 시행 중인 판이다. 내용을 바꾸면 여기에 한 줄을 더하고,
 * 바뀐 것이 무엇인지 적는다 — 시행일만 바꾸고 이력을 남기지 않으면 무엇이 달라졌는지 알 수 없다.
 */
const REVISIONS = [
  { date: '2026-11-02', note: 'Google 광고 쿠키 고지와 거부 방법을 명시하고, 흩어져 있던 항목을 하나의 번호 체계로 정리' },
  { date: '2026-09-16', note: '측정값 비보관, 외부 서비스, 이용자 선택 항목 추가' },
  { date: '2026-07-17', note: '최초 시행' },
];
const EFFECTIVE = REVISIONS[0].date;

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
      dateModified: EFFECTIVE,
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
      <p>
        시행일: <time dateTime={EFFECTIVE}>{koDate(EFFECTIVE)}</time>
      </p>

      <h2>1. 이용자가 직접 입력하는 개인정보</h2>
      <p>
        스피드체크는 회원가입 없이 이용하는 서비스로, 속도 측정을 위해 이름·연락처·주소 등의 입력을 요구하지
        않습니다. 저장된 계정 정보도 없습니다.
      </p>

      <h2>2. 측정 과정에서 처리되는 정보</h2>
      <p>
        측정을 시작하면 브라우저가 Cloudflare의 측정 서버에 접속하고, Cloudflare가 돌려주는 정보로 통신사와
        광역 지역(시·도)을 추정해 화면에 표시합니다. 시·군·구 단위 위치는 화면에 표시하지 않습니다.
      </p>
      <p>
        측정은 이용자의 브라우저 안에서 이루어지고, 다운로드·업로드·핑·지터 값은 결과를 화면에 보여 주는
        데에만 쓰입니다. 스피드체크는 측정값과 IP 주소를 자체 서버에 저장하지 않습니다. 측정이 끝나고 페이지를
        닫으면 결과는 남지 않습니다.
      </p>

      <h2>3. 방문 분석</h2>
      <p>
        어떤 기능이 쓰이는지 파악하기 위해 Google 태그 관리자와 Google 애널리틱스를 사용합니다. 이 과정에서
        페이지 방문, 측정 시작·완료 같은 이벤트, 브라우저·기기 정보가 쿠키 또는 유사한 식별자와 함께 Google로
        전송될 수 있습니다. 이렇게 전송되는 정보로 이용자 개인을 식별하지 않으며, 분석은 전체 이용 흐름을
        보는 데에만 씁니다.
      </p>

      <h2>4. 광고와 쿠키</h2>
      <p>
        이 사이트는 Google 애드센스 광고 코드를 사용합니다. Google을 비롯한 제3자 광고 공급업체는 쿠키를
        사용해, 이용자가 이 사이트나 다른 웹사이트를 방문한 기록을 바탕으로 광고를 게재합니다. Google은 광고
        쿠키를 사용하므로 Google과 그 파트너가 이 사이트 및 다른 사이트 방문 기록에 기반한 광고를 이용자에게
        보여 줄 수 있습니다.
      </p>
      <p>
        개인 맞춤 광고는{' '}
        <a href="https://adssettings.google.com" rel="noopener" target="_blank">
          Google 광고 설정
        </a>
        에서 끌 수 있습니다. 제3자 공급업체의 맞춤 광고 쿠키는{' '}
        <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">
          aboutads.info
        </a>
        에서 거부할 수 있습니다. Google이 파트너 사이트에서 정보를 어떻게 쓰는지는{' '}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">
          Google의 안내
        </a>
        에 정리돼 있습니다.
      </p>
      <p>
        광고는 측정이 끝난 결과 화면에만 둘 수 있고, 측정이 진행 중인 화면에는 두지 않습니다.
      </p>

      <h2>5. 외부 서비스</h2>
      <p>서비스를 운영하는 데 다음 외부 서비스를 이용합니다.</p>
      <ul>
        <li>Cloudflare — 속도 측정 요청을 받고, 통신사·광역 지역 추정에 쓰는 정보를 돌려줍니다.</li>
        <li>Vercel — 사이트를 호스팅합니다. 접속 시 일반적인 서버 접속 기록이 남을 수 있습니다.</li>
        <li>Google — 방문 분석(3항)과 광고(4항)를 처리합니다.</li>
        <li>jsDelivr — 화면에 쓰는 글꼴 파일을 내려받습니다.</li>
      </ul>
      <p>각 서비스에서의 정보 처리는 해당 사업자의 개인정보 처리방침을 따릅니다.</p>

      <h2>6. 이용자가 할 수 있는 선택</h2>
      <p>
        방문 분석과 광고에 쓰이는 쿠키는 브라우저 설정에서 차단하거나 삭제할 수 있고, 4항의 설정 화면에서
        맞춤 광고를 끌 수도 있습니다. 쿠키를 차단해도 속도 측정 기능은 그대로 이용할 수 있습니다.
      </p>

      <h2>7. 방침을 바꾸는 경우</h2>
      <p>
        지역·통신사별 평균을 보여 주기 위해 측정값을 모아 보관하게 되거나, 요금제 비교처럼 이용자가 정보를
        입력해야 하는 기능을 더하게 되면, 그 기능을 켜기 전에 이 방침을 먼저 고쳐 무엇을 어떤 형태로
        처리하는지 밝힙니다. 이용자의 입력이 필요한 경우에는 별도의 동의를 받습니다.
      </p>
      <p>방침이 바뀌면 시행일을 갱신하고, 아래 개정 이력에 바뀐 내용을 남깁니다.</p>

      <h2>8. 문의</h2>
      {CONTACT_EMAIL && (
        <p>
          개인정보 처리에 관한 문의 메일: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      )}
      <p>
        문의 유형별 안내는 <Link href="/contact">문의하기</Link>에 정리해 두었습니다.
      </p>

      <h2>개정 이력</h2>
      <ul>
        {REVISIONS.map((r) => (
          <li key={r.date}>
            <time dateTime={r.date}>{koDate(r.date)}</time> — {r.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
