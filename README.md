# 스피드체크 (SpeedCheck)

fast.com UX + Ookla 수익 구조의 한국형 인터넷 속도 측정 서비스. PRD v1.0 Phase 1(MVP) 범위 구현.

## 스택

- Next.js App Router + React — SEO 콘텐츠는 서버 렌더링
- 측정 엔진: `features/speed-test/engine/` — Cloudflare Speed 엔드포인트(서울 PoP), HTTPS 멀티스트림
- 테스트/품질: Vitest, React Testing Library, ESLint, Next.js production build
- 디자인: `design/SpeedCheck.dc.html` 시안 기반 (Wanted 디자인 시스템 토큰)

## 실행 및 품질 검사

```bash
npm install
npm run dev         # http://localhost:3000
npm run lint        # ESLint
npm run test        # Vitest 전체 테스트
npm run test:watch  # Vitest watch mode
npm run build       # 프로덕션 빌드
npm run check       # lint + test + build
```

## 배포 (Vercel)

```bash
npx vercel --prod
```

배포 후 실제 도메인을 `NEXT_PUBLIC_SITE_URL` 환경변수로 설정하면 sitemap/robots/OG URL에 반영됩니다.

## 구조와 책임

```text
app/
  layout.jsx       # 메타데이터, 폰트, viewport
  page.jsx         # 서버 컴포넌트: JSON-LD 및 SEO 콘텐츠
  globals.css      # 공통 UI, 반응형, 접근성 스타일
  robots.js
  sitemap.js
content/
  faq.js           # 화면 FAQ와 JSON-LD가 공유하는 단일 콘텐츠 소스
features/
  speed-test/
    index.js       # feature 공개 API
    SpeedTest.jsx  # client 화면 조립 및 사용자 액션
    analytics.js   # dataLayer adapter
    config.js      # 측정/제휴 설정
    components/    # props 기반 표현 컴포넌트
    domain/        # 판정, 추천, 표시 형식의 순수 규칙
    engine/        # 핑/전송/환경 감지 브라우저 인프라
    hooks/         # 측정 상태 머신, orchestration, toast lifecycle
    __tests__/     # domain/engine/hook/component 회귀 테스트
```

`app`은 `features/speed-test/index.js`의 공개 API만 사용합니다. feature 내부 의존성은 화면 → hook/domain → engine 방향으로 유지하며, leaf UI 컴포넌트는 측정 엔진이나 analytics를 직접 호출하지 않습니다.

`design/`은 `.gitignore` 대상인 로컬 디자인 시안 디렉터리이며 빌드·배포 코드에 포함되지 않습니다.

## 운영 전 교체 필요

- `features/speed-test/config.js`의 `PARTNER_URL` — 제휴 대리점 계약 후 아웃링크 설정 (FR-10)
- 광고 슬롯 2개 — AdSense/애드핏 승인 후 실제 태그 삽입 (FR-12)
- GA4/GTM — `dataLayer` 이벤트가 이미 push되므로 GTM 스니펫 추가 후 수집
- 측정 방법론·개인정보 처리방침 페이지 (푸터 링크 연결)
