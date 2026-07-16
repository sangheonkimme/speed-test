# SpeedCheck 프로젝트 구조 리팩토링 구현 계획

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 현재 동작과 화면을 유지하면서 563줄짜리 UI 컴포넌트와 288줄짜리 측정 엔진의 책임을 분리하고, 테스트 가능한 feature 중심 구조로 전환한다.

**Architecture:** Next.js App Router의 서버/클라이언트 경계는 유지한다. `app/page.jsx`는 SEO 및 서버 렌더링만 담당하고, 속도 측정 기능은 `features/speed-test/` 아래에 UI·상태 관리·도메인 규칙·브라우저 인프라를 계층별로 배치한다. 리팩토링 전 characterization test를 먼저 추가하고, 각 단계에서 공개 API와 사용자 동작을 보존한다.

**Tech Stack:** Next.js 15, React 19, JavaScript/JSX, CSS, Vitest, React Testing Library, ESLint

---

## 1. 현재 상태와 핵심 진단

### 조사한 현재 구조

```text
app/
  globals.css             # 146줄, 전체 스타일
  layout.jsx              # 메타데이터·폰트·viewport
  page.jsx                # FAQ + JSON-LD + SEO 본문
  robots.js
  sitemap.js
components/
  SpeedTest.jsx           # 563줄, 상태·비동기 흐름·UI·공유·CTA·광고가 한 파일
lib/
  engine.js               # 288줄, 통계·핑·다운로드·업로드·환경 감지가 한 파일
  logic.js                # 93줄, 판정·표시·추천·분석 이벤트가 혼재
index.html                # Next.js 앱과 별개의 레거시 정적 파일
```

- 추적 파일은 16개이며, 별도 테스트·lint·format 스크립트가 없다.
- Git 작업 트리는 조사 시점에 깨끗하고 `main`은 `origin/main`과 일치한다.
- `components/SpeedTest.jsx`는 측정 orchestration, 13개 이상의 상태, toast, tracking, 공유, CTA, 전체 화면 렌더링을 모두 담당한다.
- `lib/engine.js`는 순수 통계 함수와 브라우저 API(`fetch`, `performance`, `crypto`, `navigator`)가 결합되어 단위 테스트가 어렵다.
- `lib/logic.js`는 순수 도메인 규칙과 `window.dataLayer` 부수효과를 함께 export한다.
- `catch (e) {}`가 여러 곳에 있어 실패 원인 관찰이 어렵고, `SpeedTest`의 최상위 `catch`는 오류 문구만 바꾸고 `phase`를 `error`로 전환하지 않는다.
- 비동기 작업 취소와 언마운트 정리가 완전하지 않다. 재측정/이탈 시 진행 중인 측정이 UI 상태를 다시 갱신할 가능성을 구조적으로 차단해야 한다.
- CSS에 반응형 media query가 없고 `.col-main { min-width: 330px }`라서 320px 폭에서 가로 overflow 위험이 있다.
- `index.html`은 Git에 추적되지만 Next.js 런타임 진입점이 아니므로 중복 구현 여부 확인 후 제거 후보이다.

### 이번 리팩토링의 비목표

- 측정 알고리즘 임계값, 스트림 수, Cloudflare endpoint 자체 변경
- UI 전면 재디자인
- TypeScript 전환
- 실제 광고·제휴 링크·GA4 도입
- 새로운 데이터 저장 백엔드 도입

## 2. 목표 구조

```text
app/
  globals.css
  layout.jsx
  page.jsx
  robots.js
  sitemap.js
content/
  faq.js
features/
  speed-test/
    index.js
    SpeedTest.jsx                 # 얇은 화면 조립 컴포넌트
    config.js                     # endpoint, 측정 설정, CTA 설정
    analytics.js                  # dataLayer adapter
    components/
      SpeedGauge.jsx
      TestStatus.jsx
      MetricsPanel.jsx
      ResultPanel.jsx
      UsageCard.jsx
      ConversionCta.jsx
      ShareCard.jsx
      CommerceRecommendations.jsx
      AdSlot.jsx
      FooterLinks.jsx
      StatusIcon.jsx
    hooks/
      useSpeedTest.js             # 측정 상태와 orchestration
      useToast.js
    engine/
      statistics.js               # median, meanDeviation
      ping.js
      transfer.js                 # 공통 sampler/abort 도우미
      download.js
      upload.js
      environment.js
      index.js                    # 안정적인 공개 API
    domain/
      assessment.js               # verdict, grade, usages
      recommendations.js          # commerce
      format.js                   # fmtSpeed
    __tests__/
      statistics.test.js
      assessment.test.js
      recommendations.test.js
      format.test.js
      useSpeedTest.test.jsx
      SpeedTest.test.jsx
vitest.config.mjs
eslint.config.mjs
```

`app/`는 라우팅/SEO, `features/speed-test`는 기능, `engine`은 브라우저 측정 인프라, `domain`은 순수 규칙으로 역할을 구분한다. 외부에서는 `features/speed-test/index.js`만 import하도록 public boundary를 둔다.

---

## 3. 단계별 구현 계획

### Task 1: 리팩토링 안전망과 품질 명령 추가

**Objective:** 기존 동작을 고정할 테스트·lint 기반을 먼저 만든다.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.mjs`
- Create: `vitest.setup.js`
- Create: `eslint.config.mjs`

**Steps:**
1. dev dependency로 `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `eslint`, `eslint-config-next`를 설치한다.
2. `package.json`에 다음 스크립트를 추가한다.
   - `lint`: `eslint .`
   - `test`: `vitest run`
   - `test:watch`: `vitest`
   - `check`: `npm run lint && npm run test && npm run build`
3. `vitest.config.mjs`에 `@/` alias, `jsdom`, setup file, `features/**/*.test.{js,jsx}` include를 설정한다.
4. `vitest.setup.js`에서 `@testing-library/jest-dom/vitest`를 import하고 테스트 후 DOM cleanup을 설정한다.
5. ESLint flat config에서 Next core-web-vitals 규칙과 테스트 전역을 설정하고 `.next`, `node_modules`, `design`을 ignore한다.
6. `npm run lint`, `npm run test`, `npm run build`를 각각 실행해 baseline을 기록한다. 기존 lint 오류는 구조 변경과 섞지 말고 이 Task 안에서 최소 수정한다.

**Expected verification:** 세 명령이 exit code 0. 테스트가 아직 없으면 Vitest는 `--passWithNoTests`를 임시 사용하지 말고 Task 2까지 한 커밋으로 묶는다.

**Commit:** `chore: add refactoring quality gates`

### Task 2: 순수 로직 characterization test 작성

**Objective:** 현재 임계값과 표시 규칙을 변경 없이 고정한다.

**Files:**
- Create: `features/speed-test/__tests__/assessment.test.js`
- Create: `features/speed-test/__tests__/recommendations.test.js`
- Create: `features/speed-test/__tests__/format.test.js`
- Test source initially: `lib/logic.js`

**Steps:**
1. `verdict`의 PC 경계값 20/85Mbps와 모바일 경계값 15/60Mbps를 경계 바로 아래·같음·바로 위 케이스로 테스트한다.
2. `grade`의 5/20/50/100/500Mbps 경계와 반환 tuple 문구를 고정한다.
3. `usages`에서 다운로드·핑·지터 조합별 `좋음/보통/나쁨`을 검증한다.
4. `commerce`가 정상 판정에서는 빈 배열, WiFi 저속에서는 mesh, 높은 ping/jitter에서는 gaming 추천을 반환하는지 검증한다.
5. `fmtSpeed`가 `null`, 0, 1Mbps 미만 Kbps, 소수 Mbps, 10Mbps 이상을 현재 규칙대로 포맷하는지 검증한다.
6. `npm test -- features/speed-test/__tests__/{assessment,recommendations,format}.test.js`를 실행한다.

**Expected verification:** 모든 characterization test PASS; 제품 로직 출력은 변경되지 않음.

**Commit:** `test: characterize speed test domain rules`

### Task 3: `lib/logic.js`를 domain과 analytics로 분리

**Objective:** 순수 비즈니스 규칙과 브라우저 부수효과를 분리한다.

**Files:**
- Create: `features/speed-test/domain/assessment.js`
- Create: `features/speed-test/domain/recommendations.js`
- Create: `features/speed-test/domain/format.js`
- Create: `features/speed-test/analytics.js`
- Modify: Task 2 테스트 import
- Modify temporarily: `components/SpeedTest.jsx:10`
- Delete after imports migrate: `lib/logic.js`

**Steps:**
1. 테스트 import를 새 모듈 경로로 먼저 바꾸고 FAIL을 확인한다.
2. `verdict/grade/usages`, `commerce`, `fmtSpeed`, `track`을 책임별 파일로 이동한다. 함수 body와 반환 문구는 바꾸지 않는다.
3. `track`은 `window` 유무를 검사하는 현재 동작을 유지하되 analytics adapter로 격리한다.
4. `components/SpeedTest.jsx` import를 새 경로로 교체한다.
5. 참조가 0건인지 검색한 뒤 `lib/logic.js`를 제거한다.
6. `npm run test && npm run build`를 실행한다.

**Expected verification:** characterization test와 production build PASS; 화면 출력/이벤트 이름 변경 없음.

**Commit:** `refactor: separate domain rules from analytics`

### Task 4: 엔진 설정과 통계 유틸리티 추출

**Objective:** 엔진의 순수 계산부를 독립적으로 테스트 가능하게 만든다.

**Files:**
- Create: `features/speed-test/config.js`
- Create: `features/speed-test/engine/statistics.js`
- Create: `features/speed-test/__tests__/statistics.test.js`
- Modify: `lib/engine.js`

**Steps:**
1. `median`, `meanDeviation`의 빈 배열, 홀수/짝수 배열, 정렬되지 않은 입력 테스트를 먼저 작성해 FAIL을 확인한다.
2. Cloudflare base URL, chunk URL factory, 측정 파라미터 `CFG`, partner URL을 `config.js`로 이동한다.
3. `median`과 `meanDeviation`을 `statistics.js`로 이동하고 export한다.
4. 기존 엔진이 새 config/statistics 모듈을 import하도록 바꾼다.
5. `npm test -- statistics.test.js`와 전체 test/build를 실행한다.

**Expected verification:** 통계 테스트 PASS; 엔진의 측정 상수와 계산 결과 동일.

**Commit:** `refactor: extract speed engine configuration and statistics`

### Task 5: 측정 엔진을 기능별 모듈로 분리하고 취소 계약 추가

**Objective:** 핑·다운로드·업로드·환경 감지를 독립 모듈로 만들고 생명주기를 명시적으로 관리한다.

**Files:**
- Create: `features/speed-test/engine/ping.js`
- Create: `features/speed-test/engine/transfer.js`
- Create: `features/speed-test/engine/download.js`
- Create: `features/speed-test/engine/upload.js`
- Create: `features/speed-test/engine/environment.js`
- Create: `features/speed-test/engine/index.js`
- Create: `features/speed-test/__tests__/engine.test.js`
- Modify temporarily: `components/SpeedTest.jsx:4-9`
- Delete after migration: `lib/engine.js`

**Steps:**
1. `fetch`, clock, timers를 module 내부 전역에 직접 고정하지 말고 기본값을 가진 dependency parameter로 주입 가능하게 설계한다. production 호출 API는 단순하게 유지한다.
2. fake fetch/fake timer를 사용해 ping 실패 필터링, median/jitter, download progress, timeout, upload progress, abort를 검증하는 실패 테스트를 작성한다.
3. 공통 abort controller 등록/해제와 sampler 종료 로직을 `transfer.js`로 추출한다.
4. `measurePing`, `measureDownload`, `measureUpload`, `detectEnvironment`를 각 파일로 이동한다.
5. public API는 `engine/index.js`에서 재-export한다.
6. 모든 `fetch`에서 `res.ok`를 확인하고, 의도적으로 무시하는 오류와 사용자에게 전달할 오류를 구분한다. 빈 `catch`는 abort 여부를 확인하거나 최소한 명시적 주석/return을 둔다.
7. 각 측정 함수가 선택적 `AbortSignal`을 받고 interval과 fetch를 `finally`에서 정리하도록 한다.
8. 기존 컴포넌트 import를 `features/speed-test/engine`으로 변경하고 `lib/engine.js`를 제거한다.
9. 전체 test/build를 실행한다.

**Expected verification:** 엔진 테스트 PASS; 종료/abort 후 남은 timer 0개; 공개 함수 이름과 결과 shape 유지.

**Commit:** `refactor: split measurement engine and add cancellation`

### Task 6: 측정 orchestration을 `useSpeedTest` hook으로 이동

**Objective:** UI 렌더링과 비동기 측정 상태 머신을 분리한다.

**Files:**
- Create: `features/speed-test/hooks/useSpeedTest.js`
- Create: `features/speed-test/hooks/useToast.js`
- Create: `features/speed-test/__tests__/useSpeedTest.test.jsx`
- Modify: `components/SpeedTest.jsx:87-260`

**Steps:**
1. mock engine으로 자동 시작, 다운로드 완료, 백그라운드 업로드 완료, 실패, 재측정, 언마운트 취소를 검증하는 hook 테스트를 먼저 작성한다.
2. `phase`를 `idle | measuring | done | error`의 명시적인 상태로 관리한다. 현재 오류 시 무한 measuring처럼 보이는 문제를 `error` 전환과 재시도 가능 UI로 고정한다.
3. 13개 이상의 개별 state를 `useReducer` 기반 state machine으로 통합한다. action 예: `START`, `PING_DONE`, `DOWNLOAD_PROGRESS`, `DOWNLOAD_DONE`, `UPLOAD_PROGRESS`, `UPLOAD_DONE`, `ENV_DONE`, `FAIL`.
4. 실행마다 새 `AbortController`와 run id를 만들고, 이전 실행 또는 unmount 이후의 state update를 무시한다.
5. `useToast`가 timeout 생성·교체·cleanup만 담당하도록 이동한다.
6. `SpeedTest.jsx`는 hook에서 state/derived values/actions를 받아 렌더링만 하도록 축소한다.
7. StrictMode에서 자동 측정이 중복 실행되지 않는지 테스트한다.
8. 전체 test/build를 실행한다.

**Expected verification:** hook 테스트 PASS; error 상태와 재시도 동작 존재; unmount/restart 시 이전 run이 결과를 덮어쓰지 않음.

**Commit:** `refactor: move measurement workflow into useSpeedTest`

### Task 7: UI를 표현 컴포넌트로 분해

**Objective:** `SpeedTest.jsx`를 150줄 안팎의 조립 컴포넌트로 축소한다.

**Files:**
- Create: `features/speed-test/components/StatusIcon.jsx`
- Create: `features/speed-test/components/SpeedGauge.jsx`
- Create: `features/speed-test/components/TestStatus.jsx`
- Create: `features/speed-test/components/MetricsPanel.jsx`
- Create: `features/speed-test/components/UsageCard.jsx`
- Create: `features/speed-test/components/ConversionCta.jsx`
- Create: `features/speed-test/components/ShareCard.jsx`
- Create: `features/speed-test/components/CommerceRecommendations.jsx`
- Create: `features/speed-test/components/AdSlot.jsx`
- Create: `features/speed-test/components/FooterLinks.jsx`
- Create: `features/speed-test/components/ResultPanel.jsx`
- Create: `features/speed-test/SpeedTest.jsx`
- Create: `features/speed-test/index.js`
- Create: `features/speed-test/__tests__/SpeedTest.test.jsx`
- Modify: `app/page.jsx:1,52`
- Delete: `components/SpeedTest.jsx`

**Steps:**
1. 기존 화면의 주요 상태를 DOM 관점에서 고정하는 component test를 작성한다: 측정 중, 결과 표시, 업로드 pending, 느림 CTA strong/weak, 정상 CTA 미노출, 공유 fallback, 오류/재시도.
2. 화면 덩어리를 props 기반 표현 컴포넌트로 한 개씩 추출한다. 표현 컴포넌트는 engine/analytics를 직접 import하지 않는다.
3. inline style 중 정적 값은 semantic class로 이동하고, progress width/ring color처럼 동적인 값만 inline style로 남긴다.
4. `SpeedTest.jsx`는 hook 호출, derived view model, 섹션 조립만 담당하게 한다.
5. `features/speed-test/index.js`에서 `SpeedTest`를 named export한다.
6. `app/page.jsx`가 public entrypoint만 import하도록 변경하고 기존 `components/SpeedTest.jsx`를 제거한다.
7. 전체 test/build를 실행한다.

**Expected verification:** component tests PASS; `features/speed-test/SpeedTest.jsx` 약 150줄 이하; leaf component는 각각 한 가지 UI 책임만 가짐.

**Commit:** `refactor: decompose speed test interface by responsibility`

### Task 8: SEO 콘텐츠를 단일 소스로 분리

**Objective:** FAQ 문구와 JSON-LD 생성의 중복 책임을 줄인다.

**Files:**
- Create: `content/faq.js`
- Modify: `app/page.jsx:3-43,54-71`
- Create: `app/page.test.jsx` 또는 JSON-LD helper 단위 테스트

**Steps:**
1. FAQ 배열을 `content/faq.js`로 이동한다.
2. JSON-LD 생성 코드를 작은 순수 helper로 추출하거나 page module의 상수로 유지하되 FAQ source는 하나만 사용한다.
3. FAQ 수와 JSON-LD `mainEntity` 수, 질문/답변 일치를 테스트한다.
4. `app/page.jsx`가 서버 컴포넌트로 유지되고 client directive가 추가되지 않았는지 확인한다.
5. 전체 test/build를 실행한다.

**Expected verification:** 렌더링 FAQ와 structured data가 동일 source를 사용; server/client boundary 유지.

**Commit:** `refactor: centralize seo faq content`

### Task 9: CSS 구조와 모바일 안정성 정리

**Objective:** 분해된 컴포넌트에 맞춰 스타일을 정리하고 작은 화면 overflow를 제거한다.

**Files:**
- Modify: `app/globals.css`
- Optional create if 분리가 실제 탐색성을 높일 때만: `features/speed-test/speed-test.css`

**Steps:**
1. 기존 class를 Header, Gauge, Metrics, Results, CTA, Share, Commerce, Ad, Footer 순으로 재정렬한다.
2. Task 7에서 제거한 inline static style을 class로 이동한다.
3. `@media (max-width: 480px)`에서 `.wrap` padding, `.col-main/.col-rail` min-width, result layout, CTA weak layout을 조정한다.
4. 320px, 375px, 768px, 1024px viewport에서 가로 overflow가 없는지 확인한다.
5. 애니메이션에 `prefers-reduced-motion: reduce` 대응을 추가한다.
6. 키보드 focus-visible 스타일과 icon-only가 아닌 버튼 label/ARIA를 검토한다.
7. production build와 component test를 실행한다.

**Expected verification:** `document.documentElement.scrollWidth <= window.innerWidth`가 각 viewport에서 성립; 기존 desktop layout 유지.

**Commit:** `refactor: organize styles and harden responsive layout`

### Task 10: 레거시·문서·최종 검증 정리

**Objective:** 새 구조를 문서화하고 사용되지 않는 파일을 안전하게 제거한다.

**Files:**
- Modify: `README.md:27-49`
- Delete if no unique behavior: `index.html`
- Verify only: `.gitignore`, `design/`

**Steps:**
1. `index.html`의 기능/카피가 Next.js 구현에 모두 반영됐는지 diff 관점으로 확인한다. unique requirement가 없을 때만 삭제하고, 있으면 issue/TODO로 옮긴 후 삭제한다.
2. README 구조 트리를 목표 구조로 갱신하고 각 계층의 책임, test/lint/check 명령을 기록한다.
3. `design/`은 현재 `.gitignore` 대상이므로 배포 코드가 아님을 README에 명확히 한다.
4. 제거된 `components/SpeedTest.jsx`, `lib/engine.js`, `lib/logic.js` import가 남아 있지 않은지 검색한다.
5. `npm run check`를 실행한다.
6. `git status --short`, `git diff --check`, `git diff --stat`으로 의도한 파일만 변경됐고 whitespace 오류가 없는지 확인한다.
7. 브라우저에서 첫 진입 자동 측정 → 다운로드 결과 → 업로드 완료 → 재측정 → 공유 fallback → 느림 CTA → 오류 후 재시도 흐름을 수동 smoke test한다.

**Expected verification:** lint/test/build 전부 PASS; dead import 0건; production 화면의 핵심 흐름 정상.

**Commit:** `docs: finalize speed test feature architecture`

---

## 4. 권장 실행 순서와 커밋 전략

1. **Safety net:** Task 1–2
2. **순수 로직 분리:** Task 3–4
3. **브라우저 인프라 분리:** Task 5
4. **상태 관리 분리:** Task 6
5. **UI 분해:** Task 7
6. **SEO/CSS/정리:** Task 8–10

각 Task를 독립 커밋으로 유지한다. 파일 이동과 동작 변경을 같은 커밋에 과도하게 섞지 않는다. 특히 오류 상태 개선은 Task 6 테스트로 명시해 단순 이동과 구분한다.

## 5. 전체 검증 체크리스트

### 자동 검증

```bash
npm run lint
npm run test
npm run build
git diff --check
```

### 기능 회귀

- 첫 방문 시 자동 측정은 한 번만 시작한다.
- 다운로드 수치와 진행률이 갱신된다.
- 핑/지터가 표시되고 업로드는 결과 화면에서 후속 갱신된다.
- 다시 측정 시 이전 run의 값이 새 결과를 덮어쓰지 않는다.
- 네트워크 실패 시 오류 상태와 재시도 버튼이 보인다.
- 정상 결과에는 전환 CTA가 없고 느림/매우 느림 결과에는 variant별 CTA가 보인다.
- native share 미지원 시 clipboard fallback과 toast가 동작한다.
- 기존 GA4 dataLayer 이벤트 이름과 payload key가 유지된다.
- FAQ와 JSON-LD 내용이 일치한다.

### 반응형/접근성

- 320/375/768/1024px에서 가로 스크롤이 없다.
- 버튼을 키보드로 탐색할 수 있고 focus가 시각적으로 보인다.
- 측정값과 toast의 live region이 과도하게 반복 안내되지 않는다.
- reduced-motion 환경에서 blink/rise/transition이 비활성화된다.

## 6. 위험, 트레이드오프, 열린 질문

### 위험

- **측정 정확도 회귀:** 엔진 파일 이동 중 timer/byte 누계/수렴 조건이 바뀔 수 있다. Task 5에서는 알고리즘 변경 없이 dependency injection과 cleanup만 추가한다.
- **StrictMode 중복 실행:** mount/unmount 재실행을 단순 ref 하나로만 막으면 개발/production 동작이 달라질 수 있다. run id + abort + 테스트로 보장한다.
- **과도한 파일 분할:** 작은 컴포넌트까지 지나치게 쪼개지 않는다. 재사용성이 아니라 한 가지 변경 이유가 있는 경우에만 추출한다.
- **CSS 전역 충돌:** 이번 범위에서는 CSS Modules 전환까지 하지 않고 semantic prefix 또는 기존 class를 유지해 변경량을 제한한다.

### 열린 질문(구현 전에 제품 결정 필요)

1. 오류 화면에서 자동 재시도 없이 사용자 재시도만 제공할지, 제한된 자동 재시도를 추가할지?
2. `index.html`에 아직 Next.js 앱으로 이관되지 않은 디자인/기능이 있는지?
3. 엔진 endpoint와 측정 설정을 환경변수로 운영 조정할 필요가 있는지? 필요 없다면 `config.js` 상수로 유지한다(YAGNI).
4. 모바일 320px 지원을 공식 최소 viewport로 볼지? 이 계획은 안전한 기본값으로 320px을 포함한다.

## 7. 완료 기준

- `SpeedTest.jsx`가 orchestration과 대형 JSX를 더 이상 함께 소유하지 않는다.
- engine/domain/analytics/UI의 import 방향이 단방향이고 `app`은 feature public API만 사용한다.
- 핵심 도메인 경계값, 측정 lifecycle, 주요 화면 상태에 자동 테스트가 있다.
- lint/test/build가 하나의 `npm run check`로 통과한다.
- 현재 제품 동작과 SEO를 보존하면서 오류 처리·취소·모바일 overflow가 개선된다.
