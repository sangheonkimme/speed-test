/* 측정 샘플 통계 — 순수 함수 */

export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * 지터 — 연속 샘플 간 차이의 평균 (RFC 3550 계열의 통상적 정의).
 *
 * 이전에는 중앙값 기준 평균절대편차를 썼는데, 표본이 적으면 이상치 하나가
 * 그 값의 1/n을 그대로 지터에 더한다. 실측 사례:
 * RTT [55, 56, 57, 58, 790] → 핑 57ms인데 지터 147.4ms가 나왔다.
 * 네트워크가 흔들린 게 아니라 계산이 무너진 것이다.
 *
 * 연속 차이 방식은 "값이 샘플마다 얼마나 널뛰는가"를 직접 재므로 정의에 부합한다.
 * ⚠️ 순차 측정이 전제다 — 병렬로 발사한 샘플에 쓰면 순서에 의미가 없어진다.
 */
export function consecutiveJitter(arr) {
  if (arr.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < arr.length; i++) sum += Math.abs(arr[i] - arr[i - 1]);
  return sum / (arr.length - 1);
}
