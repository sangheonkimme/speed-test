/* 측정 엔드포인트·파라미터·제휴 설정 — 값 변경은 제품 결정 사항 */

// 엔드포인트: Cloudflare Speed (Anycast, 서울 PoP)
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
  pingCount: 5,
  convergeWindow: 4, // 최근 N개 샘플로 수렴 판단
  convergeEpsilon: 0.05, // 5% 이내 변동이면 수렴
  minSamplesBeforeConverge: 6,
  sampleIntervalMs: 200,
};

// 제휴 아웃링크 (FR-10 v1): 계약 후 URL 교체
export const PARTNER_URL = "";
