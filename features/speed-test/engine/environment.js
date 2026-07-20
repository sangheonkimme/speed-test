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
  // Cloudflare meta의 로마자 광역 지역명 → 한글 표기
  const REGION_KO = {
    Seoul: "서울",
    Busan: "부산",
    Daegu: "대구",
    Incheon: "인천",
    Gwangju: "광주",
    Daejeon: "대전",
    Ulsan: "울산",
    "Sejong-si": "세종",
    Sejong: "세종",
    "Gyeonggi-do": "경기",
    "Gangwon-do": "강원",
    "Gangwon State": "강원",
    "Chungcheongbuk-do": "충북",
    "Chungcheongnam-do": "충남",
    "Jeollabuk-do": "전북",
    "Jeonbuk State": "전북",
    "Jeollanam-do": "전남",
    "Gyeongsangbuk-do": "경북",
    "Gyeongsangnam-do": "경남",
    "Jeju-do": "제주",
  };
  let isp = null,
    region = null,
    locationSource = null,
    locationAccuracy = null;
  try {
    const res = await deps.fetch(`${BASE}/meta`, { signal: options.signal });
    if (!res.ok) throw new Error(`meta request failed: ${res.status}`);
    const meta = await res.json();
    region = REGION_KO[meta.region] || meta.region || null;
    if (region) {
      locationSource = "ip";
      locationAccuracy = "approximate";
    }
    const org = (meta.asOrganization || "").toLowerCase();
    // 릴레이·프록시·VPN 감지: iCloud 비공개 릴레이(Cloudflare/Akamai 경유) 등은
    // 이용자 실제 ISP·지역이 아니므로 표기하지 않는다 (잘못된 정보 노출 방지)
    const isRelay =
      /cloudflare|akamai|apple|icloud|fastly|google llc|amazon|relay|vpn|proxy/.test(org);
    if (isRelay) {
      isp = null;
      region = null;
      locationSource = null;
      locationAccuracy = null;
    } else if (
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
