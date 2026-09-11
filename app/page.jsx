import Link from 'next/link';
import { faq, createFaqJsonLd } from '@/content/faq';
import {
  metrics,
  gradeTable,
  usageTable,
  paramTable,
  prepSteps,
  readingResult,
} from '@/content/home';
import { guides } from '@/content/guides';
import { SpeedTest } from '@/features/speed-test';
import { GuideTable } from '@/app/_components/GuideTable';

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

/*
 * 홈의 서버 렌더링 콘텐츠.
 *
 * ⚠️ 이전에는 이 내용이 전부 <details> 안에 접혀 있어서, 클릭 없이 보이는 텍스트가
 * 563자(대부분 UI 라벨)에 불과했다. 2026-09-08 AdSense 심사에서
 * "게시자 콘텐츠가 없는 화면"으로 정책 위반 판정을 받았다.
 * 접는 UI로 되돌리지 말 것 — 측정 도구 아래에 읽을거리가 실제로 보여야 한다.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpeedTest />

      <section className="wrap seo-sec">
        <h2>측정 결과를 읽는 법</h2>
        <p>
          스피드체크는 접속하면 다운로드 측정을 자동으로 시작하고, 결과 화면이 표시된 뒤 업로드를
          이어서 측정합니다. 네 가지 지표가 각각 다른 것을 알려주므로, 숫자 하나만 보지 말고 용도에
          맞는 지표를 함께 보는 것이 좋습니다.
        </p>
        <GuideTable {...metrics} />

        <h2>{readingResult.h}</h2>
        {readingResult.p.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        <h2>속도 등급은 이렇게 나눕니다</h2>
        <p>
          측정이 끝나면 다운로드 속도에 따라 등급 라벨이 표시됩니다. 판정 기준을 공개하니 내 결과가
          어느 구간에 있는지 직접 확인할 수 있습니다.
        </p>
        <GuideTable {...gradeTable} />

        <h2>용도별 적합도는 이렇게 판정합니다</h2>
        <p>
          결과 화면의 &lsquo;웹서핑·스트리밍·화상회의·게임&rsquo; 적합도는 아래 기준으로 계산합니다.
          게임 판정에 다운로드 속도가 들어가지 않는 이유는, 게임이 요구하는 대역폭 자체는 크지 않고
          반응 속도가 핑과 지터에 좌우되기 때문입니다.
        </p>
        <GuideTable {...usageTable} />

        <h2>정확하게 측정하려면</h2>
        {prepSteps.map((s) => (
          <div key={s.h}>
            <h3>{s.h}</h3>
            <p>{s.p}</p>
          </div>
        ))}

        <h2>측정은 이렇게 이루어집니다</h2>
        <p>
          가까운 Cloudflare 엣지에 HTTPS 다중 스트림을 연결해 회선을 포화시키고, 일정 간격으로 순간
          속도를 샘플링합니다. 속도가 충분히 안정되면 상한 시간을 채우지 않고 조기 종료하지만,
          최소 8초는 측정합니다. 재방문이면 초반 몇 초가 실제 회선 속도보다 빠르게 흐르기 때문에,
          그 구간에서 끝내면 속도가 부풀려집니다.
        </p>
        <GuideTable {...paramTable} />
        <p>
          측정에 이름·연락처·주소 등의 입력을 요구하지 않습니다. 화면에 표시되는 통신사와 지역은 공인
          IP 기반 광역 추정값이며 실제 위치와 다를 수 있습니다. 자세한 기준은{' '}
          <Link href="/methodology">측정 방법론</Link>과{' '}
          <Link href="/privacy">개인정보 처리방침</Link>에 있습니다.
        </p>

        <h2>자주 묻는 질문</h2>
        {faq.map((item) => (
          <div key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        <h2>측정 결과가 기대와 다르다면</h2>
        <p>
          속도가 요금제에 못 미치거나 특정 상황에서만 느리다면, 원인별로 점검 순서가 다릅니다.
          아래 문서에 실제 확인 절차를 정리해 두었습니다.
        </p>
        <ul>
          {guides.slice(0, 5).map((g) => (
            <li key={g.slug} style={{ margin: '6px 0' }}>
              <Link href={`/guide/${g.slug}`}>{g.title}</Link> — {g.lead}
            </li>
          ))}
        </ul>
        <p>
          <Link href="/guide">가이드 전체 보기</Link>
        </p>
      </section>
    </>
  );
}
