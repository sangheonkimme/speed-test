# 애널리틱스 구조 & GTM 이벤트 연동 가이드

## 구조 (왜 GTM을 쓰나)

```
우리 코드 ──push──▶ dataLayer ──감시──▶ GTM(규칙) ──전송──▶ GA4(저장·리포트)
```

- 코드에 박힌 건 GTM 스니펫 하나 (`app/layout.jsx`, `NEXT_PUBLIC_GTM_ID` 있을 때만 로드)
- 코드는 `dataLayer`에 이벤트를 밀어넣기만 하고, 어디로 보낼지 모른다 (`features/speed-test/analytics.js`)
- GTM은 중계기: 대시보드에서 규칙(트리거+태그)만 추가하면 **코드 배포 없이** 수집 대상을 바꾼다
- 나중에 애드센스 전환·카카오 픽셀 등을 붙일 때도 GTM에서만 작업

## 현재 상태

| 항목 | 상태 |
|---|---|
| GTM 스니펫 (코드) | ✅ `NEXT_PUBLIC_GTM_ID` 환경변수로 활성화 |
| GA4 페이지뷰 수집 | ✅ "GA4 기본" Google 태그 (All Pages) |
| 커스텀 이벤트 → GA4 | ❌ **미설정** — 아래 작업 필요 |

## 코드가 push하는 이벤트 (PRD §7)

| 이벤트 | 발생 시점 | 주요 파라미터 | 사업적 의미 |
|---|---|---|---|
| `test_started` | 측정 자동 시작 | device, conn | 방문 대비 측정 시작률 |
| `test_completed` | 업로드까지 완료 | down, up, ping, jitter, isp, region, durationMs | **측정 완료율 ≥90% 가드레일** |
| `test_abandoned` | 측정 실패/중단 | atSec, error | 이탈 지점 분석 |
| `verdict_shown` | 판정 노출 | verdict, variant | CTA 노출 분모 |
| `compare_cta_click` | 리드젠 CTA 클릭 | verdict, variant | **핵심 KPI: CTA CTR** |
| `commerce_click` | 커머스 추천 클릭 | type | 커머스 전환 |
| `result_shared` | 결과 공유 | channel | 바이럴 루프 |
| `ad_impression` | 광고 슬롯 노출 | slot | RPM 분모 |
| `lead_submitted` / `lead_converted` | (예정) 자체 폼 도입 시 | partner, leadId | 리드젠 v1.5 |

## GTM 연동 절차 (커스텀 이벤트 → GA4)

이벤트 8종을 GA4로 넘기는 규칙. **태그는 1개면 된다** (이벤트 이름을 변수로 전달).

1. **변수 준비**: GTM → 변수 → 기본 제공 변수 구성 → `Event` 체크
2. **트리거 생성**: 트리거 → 새로 만들기
   - 유형: **맞춤 이벤트**
   - 이벤트 이름: `test_started|test_completed|test_abandoned|verdict_shown|compare_cta_click|commerce_click|result_shared|ad_impression`
   - **"정규 표현식 일치 사용" 체크** ← 핵심
   - 이름: `SpeedCheck 이벤트`
3. **데이터 영역 변수 생성** (파라미터 전달용): 변수 → 새로 만들기 → 유형 "데이터 영역 변수"
   - `dlv - down` (변수 이름 `down`), 같은 방식으로 `up`, `ping`, `jitter`, `isp`, `region`, `verdict`, `variant`, `channel`, `slot`, `type`, `durationMs`
4. **태그 생성**: 태그 → 새로 만들기
   - 유형: **Google 애널리틱스: GA4 이벤트**
   - 측정 ID: `G-XXXXXXXXXX`
   - 이벤트 이름: `{{Event}}` (dataLayer 이벤트 이름 그대로 전달)
   - 이벤트 파라미터: 위에서 만든 변수들 매핑 (예: `down` → `{{dlv - down}}`)
   - 트리거: `SpeedCheck 이벤트`
   - 이름: `GA4 - SpeedCheck 이벤트`
5. **미리보기로 검증**: GTM 우측 상단 미리보기 → 사이트 접속 → 측정 완료 → Tag Assistant에서 `test_completed`에 태그 발동 확인
6. **제출 → 게시**

## GA4 쪽 마무리

- 관리 → 데이터 표시 → **주요 이벤트(전환)**: `compare_cta_click` 전환 지정 (리드젠 KPI)
- 맞춤 측정기준 등록(이벤트 범위): `verdict`, `variant`, `isp`, `region`, `channel`, `slot` — 등록해야 보고서에서 분해 가능
- 보고서 확인 경로: 참여도 → 이벤트 (수집 후 24~48시간 지연, 실시간은 즉시)

## 검증 체크리스트

- [ ] GA4 실시간에 페이지뷰 표시
- [ ] GTM 미리보기에서 8종 이벤트에 태그 발동
- [ ] GA4 실시간 이벤트에 `test_completed` 표시
- [ ] `compare_cta_click` 전환 지정 완료
