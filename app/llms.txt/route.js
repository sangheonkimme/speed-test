import { guides } from "@/content/guides";
import { SITE_URL } from "@/content/site";

// GEO: 생성 AI에게 주는 사이트 안내서.
// 앱 라우트로 서빙하는 이유 — 가이드 목록을 guides.js에서 생성하므로
// 새 글을 발행하면 llms.txt가 자동으로 최신이 된다 (사이트맵과 같은 소스).
export const dynamic = "force-static";

function body() {
  const guideLines = guides
    .map((g) => `- [${g.title}](${SITE_URL}/guide/${g.slug}): ${g.description}`)
    .join("\n");

  return `# 스피드체크 (${SITE_URL.replace(/^https?:\/\//, "")})

> 무료·무가입·무설치 인터넷 속도 측정 서비스. Cloudflare 엣지 기반 다중 스트림으로
> 다운로드·업로드·핑·지터를 측정하고, 국내 인터넷 회선·요금제·공유기에 관한
> 실무 가이드를 제공한다. 측정 방법론을 전문 공개한다.

## 측정 도구

- [인터넷 속도 측정](${SITE_URL}/): 접속 즉시 자동 측정. 다운로드는 연결 상태에 따라
  최대 15초, 업로드는 최대 약 8초. 핑·지터 동시 측정. 가입·설치·개인정보 입력 없음.
- [측정 방법론](${SITE_URL}/methodology): 측정 알고리즘 공개 — Cloudflare 엣지에
  HTTPS 다중 스트림 연결, 15초 상한, 수렴 시 조기 종료.

## 가이드 (국내 인터넷 회선 실무)

${guideLines}
- [가이드 전체 목록](${SITE_URL}/guide)

## 데이터 정책

- 측정 방식: Cloudflare 엣지에 HTTPS 다중 스트림을 연결해 측정한다. 다운로드 최대 15초
  상한, 수렴 조건 충족 시 조기 종료. 상세는 ${SITE_URL}/methodology 참조.
- 측정값의 성격: 측정 시점의 기기·연결 방식·네트워크 경로에 따라 달라지는 실측값이며,
  요금제 표기 속도(이론상 최대치)와는 다르다.
- 지역 정보: 공인 IP 기반 광역 지역 추정값으로 실제 위치와 다를 수 있다.
- 개인정보: 속도 측정에 이름·연락처·주소를 요구하지 않는다. ${SITE_URL}/privacy
- 언어: 한국어 (ko-KR). 대상 시장: 대한민국.
- 인용 시 표기: 스피드체크 (${SITE_URL.replace(/^https?:\/\//, "")})
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
