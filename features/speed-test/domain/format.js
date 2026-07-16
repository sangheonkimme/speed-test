// 속도 표기 — 저속 회선은 Kbps 단위로 전환 (0으로 뭉개지지 않게)
export function fmtSpeed(mbps) {
  if (mbps == null || !isFinite(mbps)) return { v: "–", u: "Mbps" };
  if (mbps <= 0) return { v: "0", u: "Mbps" };
  if (mbps < 1)
    return { v: String(Math.max(1, Math.round(mbps * 1000))), u: "Kbps" };
  if (mbps < 10) return { v: mbps.toFixed(1), u: "Mbps" };
  return { v: String(Math.round(mbps)), u: "Mbps" };
}
