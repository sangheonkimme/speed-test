import { describe, expect, it } from "vitest";
import { fmtSpeed } from "@/lib/logic.js";

// 속도 표기 규칙을 고정하는 characterization test
describe("fmtSpeed", () => {
  it("null/비유한 값은 대시로 표기한다", () => {
    expect(fmtSpeed(null)).toEqual({ v: "–", u: "Mbps" });
    expect(fmtSpeed(undefined)).toEqual({ v: "–", u: "Mbps" });
    expect(fmtSpeed(NaN)).toEqual({ v: "–", u: "Mbps" });
    expect(fmtSpeed(Infinity)).toEqual({ v: "–", u: "Mbps" });
  });

  it("0 이하는 0 Mbps로 표기한다", () => {
    expect(fmtSpeed(0)).toEqual({ v: "0", u: "Mbps" });
    expect(fmtSpeed(-1)).toEqual({ v: "0", u: "Mbps" });
  });

  it("1Mbps 미만은 Kbps로 전환하고 최소 1Kbps를 보장한다", () => {
    expect(fmtSpeed(0.5)).toEqual({ v: "500", u: "Kbps" });
    expect(fmtSpeed(0.0004)).toEqual({ v: "1", u: "Kbps" });
    expect(fmtSpeed(0.9994)).toEqual({ v: "999", u: "Kbps" });
  });

  it("10Mbps 미만은 소수 1자리 Mbps로 표기한다", () => {
    expect(fmtSpeed(1)).toEqual({ v: "1.0", u: "Mbps" });
    expect(fmtSpeed(9.94)).toEqual({ v: "9.9", u: "Mbps" });
    expect(fmtSpeed(5.55)).toEqual({ v: "5.5", u: "Mbps" });
  });

  it("10Mbps 이상은 정수 Mbps로 반올림한다", () => {
    expect(fmtSpeed(10)).toEqual({ v: "10", u: "Mbps" });
    expect(fmtSpeed(123.6)).toEqual({ v: "124", u: "Mbps" });
    expect(fmtSpeed(950.4)).toEqual({ v: "950", u: "Mbps" });
  });
});
