/* 측정 엔드포인트·파라미터·제휴 설정 — 값 변경은 제품 결정 사항 */

// 엔드포인트: Cloudflare Speed Anycast. 실제 접속 엣지와 경로는 네트워크 상황에 따라 달라진다.
export const BASE = "https://speed.cloudflare.com";
export const DOWN = (bytes) => `${BASE}/__down?bytes=${bytes}`;
export const UP = `${BASE}/__up`;

// 측정 파라미터
export const CFG = {
  dlMaxDurationMs: 15000, // FR-3: 다운로드 상한 15초
  dlStreams: 5, // 병렬 스트림 수
  dlChunkSizes: [1e5, 1e6, 1e7, 2.5e7, 5e7], // 점진적 확대
  ulMaxDurationMs: 8000,
  ulStreams: 3,
  ulChunkStart: 131072, // 128KB 시작 — 느린 회선에서도 샘플 확보
  ulChunkMax: 8e6, // 빠른 회선은 8MB까지 적응형 확대
  sampleIntervalMs: 200,

  // ── 핑 (FR-2) ──────────────────────────────────────────────────────────
  // 순차 측정한다. 병렬 버스트는 요청들이 서로 큐를 만들어 RTT를 왜곡하고,
  // 그 왜곡이 지터로 잡힌다. 느린 회선에서 다운로드 시작이 밀리지 않도록 총 예산을 둔다.
  pingCount: 8, // 이와 별도로 워밍업 1회를 먼저 보내고 결과는 버린다
  pingMinSamples: 4, // 예산을 넘겨도 최소 이만큼은 확보한다
  pingBudgetMs: 1800,

  // ── 다운로드 수렴 판정 ─────────────────────────────────────────────────
  // ⚠️ 이 값들을 줄이면 과대 측정이 재발한다.
  // 재방문이면 커넥션이 데워져 있어(HTTP/2 재사용·cwnd 성장·경로 버퍼) 초반 몇 초가
  // 지속 가능 속도보다 훨씬 빠르게 흐른다. 그 구간은 "안정적"이라 짧은 창으로 보면
  // 수렴으로 오판하고, 버스트 속도가 최종값으로 확정된다.
  // 실측 재현: 조기 종료 3초·창 4샘플일 때 3.5Mbps 회선을 40Mbps로 보고(11.4배).
  convergeWindow: 10, // 구간 길이(샘플 수). 10 × 200ms = 2초 구간 두 개의 중앙값을 비교한다
  convergeEpsilon: 0.05, // 두 구간 중앙값 차이가 5% 이내면 수렴
  minSamplesBeforeConverge: 20, // 2초 구간 두 개를 비교하려면 최소 20샘플
  convergeMinMs: 8000, // 이 시간 전에는 조기 종료하지 않는다. 약 7초 안에 끝나는 초기 버스트는 구조적으로 걸러진다
  trendGuardRatio: 0.85, // 최근 창이 직전 창의 85% 미만이면 하락 중 → 수렴으로 보지 않는다
  finalWindowMs: 4000, // 최종값은 마지막 N ms 샘플에서 뽑는다 (버스트 구간 배제)
};

// 광고 유닛 ID — AdSense 승인 후 실제 슬롯 ID를 채운다.
// 비어 있으면 AdSlot이 아무것도 렌더하지 않는다 (빈 플레이스홀더는 정책 위반 소지).
// 측정 진행 중 화면("아직 준비 중인 화면")에는 지면을 두지 않는다 — measuring 키를 부활시키지 말 것.
export const AD_SLOTS = {
  bottom: "", // 결과 화면 하단. 승인 후 슬롯 ID 입력
};

// 제휴 아웃링크 (FR-10 v1): 계약 후 URL 교체
export const PARTNER_URL = "";
