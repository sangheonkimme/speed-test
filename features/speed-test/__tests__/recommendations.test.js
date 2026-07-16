import { describe, expect, it } from "vitest";
import { commerce, verdict } from "@/lib/logic.js";

// 커머스 추천 노출 조건을 고정하는 characterization test
describe("commerce", () => {
  const slow = verdict(50); // 느림
  const good = { ping: 10, jitter: 1 };

  it("정상 판정이면 아무것도 추천하지 않는다", () => {
    expect(
      commerce(verdict(100), { ping: 100, jitter: 50 }, { connType: "WiFi" }),
    ).toEqual([]);
  });

  it("WiFi 환경에서 느리면 mesh를 추천한다", () => {
    const list = commerce(slow, good, { connType: "WiFi" });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "mesh",
      tag: "쿠팡 파트너스 · 제휴 링크",
      icon: "wifi",
      title: "방마다 느리다면 메시 와이파이",
      desc: "Wi-Fi 환경에서 속도가 낮게 측정됐어요",
    });
  });

  it("셀룰러 표기(혼합 포함)도 mesh 조건에 해당한다", () => {
    expect(commerce(slow, good, { connType: "WiFi/셀룰러" })[0].id).toBe(
      "mesh",
    );
    expect(commerce(slow, good, { connType: "셀룰러" })[0].id).toBe("mesh");
  });

  it("유선 환경이면 mesh를 추천하지 않는다", () => {
    expect(commerce(slow, good, { connType: "유선" })).toEqual([]);
  });

  it("env가 없으면 mesh를 추천하지 않는다", () => {
    expect(commerce(slow, good, null)).toEqual([]);
  });

  it("핑 30ms 이상이면 gaming을 추천한다", () => {
    const list = commerce(slow, { ping: 30, jitter: 0 }, null);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: "gaming",
      tag: "제휴 링크",
      icon: "fire",
      title: "핑·지터 잡는 게이밍 회선",
      desc: "게임 적합도가 낮게 나왔어요",
    });
  });

  it("지터 8ms 이상이면 gaming을 추천한다", () => {
    expect(commerce(slow, { ping: 0, jitter: 8 }, null)[0].id).toBe("gaming");
  });

  it("핑 30ms 미만·지터 8ms 미만이면 gaming을 추천하지 않는다", () => {
    expect(commerce(slow, { ping: 29.9, jitter: 7.9 }, null)).toEqual([]);
  });

  it("WiFi 저속 + 높은 핑이면 mesh, gaming 순으로 둘 다 추천한다", () => {
    const list = commerce(slow, { ping: 80, jitter: 20 }, { connType: "WiFi" });
    expect(list.map((r) => r.id)).toEqual(["mesh", "gaming"]);
  });
});
