// 이벤트 트래킹 (PRD §7) — dataLayer 표준, GA4/GTM 연결 시 그대로 수집됨
export function track(event, props = {}) {
  if (typeof window === "undefined") return;
  (window.dataLayer = window.dataLayer || []).push({ event, ...props });
}
