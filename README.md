# 스피드체크 (SpeedCheck)

fast.com UX + Ookla 수익 구조의 한국형 인터넷 속도 측정 서비스. PRD v1.0 Phase 1(MVP) 범위 구현.

## 스택

- Next.js (App Router) + React — SEO를 위한 서버 렌더링
- 측정 엔진: 자체 구현 (`lib/engine.js`) — Cloudflare Speed 엔드포인트(서울 PoP), HTTPS 멀티스트림
- 디자인: `design/SpeedCheck.dc.html` 시안 기반 (Wanted 디자인 시스템 토큰)

## 실행

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 프로덕션 빌드
```

## 배포 (Vercel)

```bash
npx vercel --prod
```

배포 후 실제 도메인을 `NEXT_PUBLIC_SITE_URL` 환경변수로 설정하면 sitemap/robots/OG URL에 반영됨.

## 구조

```
app/
  layout.jsx     # SEO 메타데이터, 폰트, viewport
  page.jsx       # 서버 컴포넌트 — JSON-LD(WebApplication+FAQ), SEO 콘텐츠
  globals.css    # 디자인 시안 스타일
  robots.js      # robots.txt
  sitemap.js     # sitemap.xml
components/
  SpeedTest.jsx  # 클라이언트 컴포넌트 — 측정 UI 전체
lib/
  engine.js      # 측정 엔진 (핑/지터/다운로드/업로드/환경감지)
  logic.js       # 판정·등급·적합도·커머스 규칙 + 이벤트 트래킹
design/          # 디자인 시안 원본 (배포와 무관)
```

## 운영 전 교체 필요

- `components/SpeedTest.jsx`의 `PARTNER_URL` — 제휴 대리점 계약 후 아웃링크 설정 (FR-10)
- 광고 슬롯 2개 — AdSense/애드핏 승인 후 실제 태그 삽입 (FR-12)
- GA4/GTM — `dataLayer` 이벤트 9종이 이미 push되므로 GTM 스니펫만 추가하면 수집 시작 (PRD §7)
- 측정 방법론·개인정보 처리방침 페이지 (푸터 링크 연결)
