// 결과 기반 커머스 추천 (FR-13 프리뷰) — 정상 판정이면 미노출
export function commerce(v, r, env) {
  if (v.text === "정상") return [];
  const list = [];
  if (env && /WiFi|셀룰러/i.test(env.connType || ""))
    list.push({
      id: "mesh",
      tag: "쿠팡 파트너스 · 제휴 링크",
      icon: "wifi",
      title: "방마다 느리다면 메시 와이파이",
      desc: "Wi-Fi 환경에서 속도가 낮게 측정됐어요",
    });
  if (r.ping >= 30 || r.jitter >= 8)
    list.push({
      id: "gaming",
      tag: "제휴 링크",
      icon: "fire",
      title: "핑·지터 잡는 게이밍 회선",
      desc: "게임 적합도가 낮게 나왔어요",
    });
  return list;
}
