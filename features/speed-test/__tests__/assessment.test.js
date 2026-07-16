import { describe, expect, it } from "vitest";
import { verdict, grade, usages } from "@/lib/logic.js";

// 현재 판정 규칙을 그대로 고정하는 characterization test — 임계값 변경 금지
describe("verdict", () => {
  describe("PC 기준 (느림 20Mbps, 정상 85Mbps)", () => {
    it("85Mbps 이상은 정상", () => {
      expect(verdict(85).text).toBe("정상");
      expect(verdict(85.1).text).toBe("정상");
      expect(verdict(1000).text).toBe("정상");
    });
    it("85Mbps 바로 아래는 느림", () => {
      expect(verdict(84.9).text).toBe("느림");
    });
    it("20Mbps 이상 85Mbps 미만은 느림", () => {
      expect(verdict(20).text).toBe("느림");
      expect(verdict(20.1).text).toBe("느림");
    });
    it("20Mbps 미만은 매우 느림", () => {
      expect(verdict(19.9).text).toBe("매우 느림");
      expect(verdict(0).text).toBe("매우 느림");
    });
  });

  describe("모바일 기준 (느림 15Mbps, 정상 60Mbps)", () => {
    it("60Mbps 이상은 정상", () => {
      expect(verdict(60, true).text).toBe("정상");
      expect(verdict(60.1, true).text).toBe("정상");
    });
    it("60Mbps 바로 아래는 느림", () => {
      expect(verdict(59.9, true).text).toBe("느림");
    });
    it("15Mbps 이상 60Mbps 미만은 느림", () => {
      expect(verdict(15, true).text).toBe("느림");
      expect(verdict(15.1, true).text).toBe("느림");
    });
    it("15Mbps 미만은 매우 느림", () => {
      expect(verdict(14.9, true).text).toBe("매우 느림");
    });
  });

  it("판정별 색상/배경을 유지한다", () => {
    expect(verdict(100)).toEqual({
      text: "정상",
      color: "#00BF40",
      bg: "rgba(0,191,64,0.12)",
    });
    expect(verdict(50)).toEqual({
      text: "느림",
      color: "#FF9F00",
      bg: "rgba(255,159,0,0.14)",
    });
    expect(verdict(10)).toEqual({
      text: "매우 느림",
      color: "#FF4242",
      bg: "rgba(255,66,66,0.12)",
    });
  });
});

describe("grade", () => {
  it("500Mbps 이상은 기가급", () => {
    expect(grade(500)).toEqual([
      "기가급 속도예요 — 뭘 해도 여유",
      "대용량 다운로드·동시 사용까지 쾌적해요",
    ]);
    expect(grade(499.9)[0]).toBe("4K 스트리밍도 여유로워요");
  });
  it("100Mbps 이상은 4K 여유", () => {
    expect(grade(100)).toEqual([
      "4K 스트리밍도 여유로워요",
      "여러 기기 동시 사용까지 쾌적해요",
    ]);
    expect(grade(99.9)[0]).toBe("4K 스트리밍까지 무난해요");
  });
  it("50Mbps 이상은 4K 무난", () => {
    expect(grade(50)).toEqual([
      "4K 스트리밍까지 무난해요",
      "여러 기기가 동시에 4K를 보면 빠듯할 수 있어요",
    ]);
    expect(grade(49.9)[0]).toBe("HD 시청은 충분해요");
  });
  it("20Mbps 이상은 HD 충분", () => {
    expect(grade(20)).toEqual([
      "HD 시청은 충분해요",
      "4K·대용량 다운로드는 답답할 수 있어요",
    ]);
    expect(grade(19.9)[0]).toBe("웹서핑 위주로 쓸 만해요");
  });
  it("5Mbps 이상은 웹서핑 위주", () => {
    expect(grade(5)).toEqual([
      "웹서핑 위주로 쓸 만해요",
      "고화질 영상은 버퍼링이 생길 수 있어요",
    ]);
    expect(grade(4.9)[0]).toBe("기본 사용도 버거워요");
  });
  it("5Mbps 미만은 기본 사용도 버거움", () => {
    expect(grade(0)).toEqual([
      "기본 사용도 버거워요",
      "웹서핑·영상까지 자주 끊길 수 있어요",
    ]);
  });
});

describe("usages", () => {
  const byName = (list, name) => list.find((u) => u.name === name);

  it("항목 이름과 순서를 유지한다", () => {
    expect(usages(100, 10, 1).map((u) => u.name)).toEqual([
      "웹서핑 · SNS",
      "HD · 4K 스트리밍",
      "화상회의",
      "온라인 게임",
    ]);
  });

  it("고속·저지연이면 모두 좋음", () => {
    for (const u of usages(100, 10, 1)) {
      expect(u).toMatchObject({ level: "좋음", tone: "ok" });
    }
  });

  it("웹서핑: 5Mbps 좋음 / 2Mbps 보통 / 미만 나쁨", () => {
    expect(byName(usages(5, 100, 50), "웹서핑 · SNS").level).toBe("좋음");
    expect(byName(usages(2, 100, 50), "웹서핑 · SNS").level).toBe("보통");
    expect(byName(usages(1.9, 100, 50), "웹서핑 · SNS").level).toBe("나쁨");
  });

  it("스트리밍: 50Mbps 좋음 / 25Mbps 보통 / 미만 나쁨", () => {
    expect(byName(usages(50, 100, 50), "HD · 4K 스트리밍").level).toBe("좋음");
    expect(byName(usages(25, 100, 50), "HD · 4K 스트리밍").level).toBe("보통");
    expect(byName(usages(24.9, 100, 50), "HD · 4K 스트리밍").level).toBe(
      "나쁨",
    );
  });

  it("화상회의: 10Mbps+핑 60ms 미만 좋음 / 4Mbps 이상 보통 / 그 외 나쁨", () => {
    expect(byName(usages(10, 59.9, 0), "화상회의").level).toBe("좋음");
    expect(byName(usages(10, 60, 0), "화상회의").level).toBe("보통");
    expect(byName(usages(4, 100, 0), "화상회의").level).toBe("보통");
    expect(byName(usages(3.9, 10, 0), "화상회의").level).toBe("나쁨");
  });

  it("게임: 핑 30ms·지터 10ms 미만 좋음 / 핑 60ms 미만 보통 / 그 외 나쁨", () => {
    expect(byName(usages(100, 29.9, 9.9), "온라인 게임").level).toBe("좋음");
    expect(byName(usages(100, 29.9, 10), "온라인 게임").level).toBe("보통");
    expect(byName(usages(100, 30, 5), "온라인 게임").level).toBe("보통");
    expect(byName(usages(100, 60, 5), "온라인 게임").level).toBe("나쁨");
  });

  it("tone 매핑을 유지한다 (좋음=ok, 보통=warn, 나쁨=bad)", () => {
    expect(byName(usages(5, 100, 50), "웹서핑 · SNS").tone).toBe("ok");
    expect(byName(usages(2, 100, 50), "웹서핑 · SNS").tone).toBe("warn");
    expect(byName(usages(1, 100, 50), "웹서핑 · SNS").tone).toBe("bad");
  });
});
