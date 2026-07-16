/* 측정 샘플 통계 — 순수 함수 */

export function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function meanDeviation(arr) {
  if (arr.length < 2) return 0;
  const med = median(arr);
  return arr.reduce((acc, v) => acc + Math.abs(v - med), 0) / arr.length;
}
