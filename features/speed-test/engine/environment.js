import { BASE } from "../config";
import { resolveDeps } from "./transfer";

// ---------- 환경 감지 (FR-4) ----------
export async function detectEnvironment(options = {}) {
  const deps = resolveDeps(options.deps);
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let connType;
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn && conn.type) {
    connType =
      { wifi: "WiFi", cellular: "셀룰러", ethernet: "유선" }[conn.type] ||
      conn.type;
  } else {
    connType = isMobile ? "WiFi/셀룰러" : "WiFi/유선";
  }

  // IP 기반 ISP·광역 지역 추정. city는 실제 접속 위치와 다를 수 있어 사용하지 않는다.
  let isp = null,
    region = null,
    locationSource = null,
    locationAccuracy = null;
  try {
    const res = await deps.fetch(`${BASE}/meta`, { signal: options.signal });
    if (!res.ok) throw new Error(`meta request failed: ${res.status}`);
    const meta = await res.json();
    region = meta.region || null;
    if (region) {
      locationSource = "ip";
      locationAccuracy = "approximate";
    }
    const org = (meta.asOrganization || "").toLowerCase();
    if (
      org.includes("korea telecom") ||
      org.includes("kt ") ||
      org === "kt" ||
      org.includes("kt corporation")
    )
      isp = "KT";
    else if (
      org.includes("sk broadband") ||
      org.includes("skb") ||
      org.includes("sk telecom")
    )
      isp = "SK브로드밴드";
    else if (
      org.includes("lg") ||
      org.includes("powercomm") ||
      org.includes("dacom")
    )
      isp = "LG유플러스";
    else isp = meta.asOrganization || "기타";
  } catch {
    // ISP·지역은 부가 정보 — 조회 실패 시 null로 두고 측정은 계속한다
  }

  return {
    device: isMobile ? "모바일" : "PC",
    connType,
    isp,
    region,
    locationSource,
    locationAccuracy,
  };
}
