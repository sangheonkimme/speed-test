/* 판정·등급·적합도 로직 (디자인 시안 Component와 동일 기준) */

// 판정 3단계 (FR-7) — CTA 노출 로직의 입력값 (내부용, 화면 비교 지표 아님)
// 절대 속도(체감) 기준: 100Mbps 요금제가 제 속도를 내면 '정상'이어야 함.
// 지역×ISP 실측 평균 비교(FR-7)는 수집 데이터 축적 후 도입.
export function verdict(dl, isMobile = false) {
  const [ok, slow] = isMobile ? [60, 15] : [85, 20];
  if (dl >= ok)
    return { text: "정상", color: "#00BF40", bg: "rgba(0,191,64,0.12)" };
  if (dl >= slow)
    return { text: "느림", color: "#FF9F00", bg: "rgba(255,159,0,0.14)" };
  return { text: "매우 느림", color: "#FF4242", bg: "rgba(255,66,66,0.12)" };
}

// 등급 라벨 (FR-6) — 실사용 체감 기준 (넷플릭스 4K ≈ 15~25Mbps)
export function grade(dl) {
  if (dl >= 500)
    return [
      "기가급 속도예요 — 뭘 해도 여유",
      "대용량 다운로드·동시 사용까지 쾌적해요",
    ];
  if (dl >= 100)
    return ["4K 스트리밍도 여유로워요", "여러 기기 동시 사용까지 쾌적해요"];
  if (dl >= 50)
    return [
      "4K 스트리밍까지 무난해요",
      "여러 기기가 동시에 4K를 보면 빠듯할 수 있어요",
    ];
  if (dl >= 20)
    return ["HD 시청은 충분해요", "4K·대용량 다운로드는 답답할 수 있어요"];
  if (dl >= 5)
    return ["웹서핑 위주로 쓸 만해요", "고화질 영상은 버퍼링이 생길 수 있어요"];
  return ["기본 사용도 버거워요", "웹서핑·영상까지 자주 끊길 수 있어요"];
}

// 용도별 적합도 (FR-6) — 서비스 권장 대역폭 기준
export function usages(dl, ping, jitter) {
  const L = (lv) =>
    lv === 2
      ? { level: "좋음", tone: "ok" }
      : lv === 1
        ? { level: "보통", tone: "warn" }
        : { level: "나쁨", tone: "bad" };
  const web = dl >= 5 ? 2 : dl >= 2 ? 1 : 0;
  const strm = dl >= 50 ? 2 : dl >= 25 ? 1 : 0;
  const call = dl >= 10 && ping < 60 ? 2 : dl >= 4 ? 1 : 0;
  const game = ping < 30 && jitter < 10 ? 2 : ping < 60 ? 1 : 0;
  return [
    { name: "웹서핑 · SNS", ...L(web) },
    { name: "HD · 4K 스트리밍", ...L(strm) },
    { name: "화상회의", ...L(call) },
    { name: "온라인 게임", ...L(game) },
  ];
}
