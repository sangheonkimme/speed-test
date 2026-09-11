import { describe, expect, it } from "vitest";
import { gradeTable, usageTable, paramTable } from "./home";
import { grade, usages } from "@/features/speed-test/domain/assessment";
import { CFG } from "@/features/speed-test/config";

/*
 * 홈이 공개하는 판정 기준표가 실제 코드 동작과 어긋나지 않게 잠근다.
 * 화면이 사실 아닌 것을 말하면 인용 신뢰도 잃고 사용자도 속인다.
 * 임계값을 바꿀 일이 있으면 content/home.js 의 표도 같이 고쳐야 이 테스트가 통과한다.
 */
describe("홈 판정 기준표", () => {
  it("등급 표의 경계값이 grade()와 일치한다", () => {
    const rowLabel = (dl) => grade(dl)[0];

    expect(rowLabel(500)).toBe(gradeTable.rows[0][1]);
    expect(rowLabel(499)).toBe(gradeTable.rows[1][1]);
    expect(rowLabel(100)).toBe(gradeTable.rows[1][1]);
    expect(rowLabel(99)).toBe(gradeTable.rows[2][1]);
    expect(rowLabel(50)).toBe(gradeTable.rows[2][1]);
    expect(rowLabel(49)).toBe(gradeTable.rows[3][1]);
    expect(rowLabel(20)).toBe(gradeTable.rows[3][1]);
    expect(rowLabel(19)).toBe(gradeTable.rows[4][1]);
    expect(rowLabel(5)).toBe(gradeTable.rows[4][1]);
    expect(rowLabel(4)).toBe(gradeTable.rows[5][1]);
  });

  it("용도별 표의 순서가 usages()의 항목 순서와 일치한다", () => {
    const names = usages(100, 20, 5).map((u) => u.name);
    expect(usageTable.rows.map((r) => r[0])).toEqual(names);
  });

  it("용도별 표의 '좋음' 경계값이 usages()와 일치한다", () => {
    const lv = (dl, ping, jitter) => usages(dl, ping, jitter).map((u) => u.level);

    // 웹서핑 5Mbps / 스트리밍 50Mbps / 화상회의 10Mbps+핑60 / 게임 핑30+지터10
    expect(lv(5, 20, 5)[0]).toBe("좋음");
    expect(lv(4, 20, 5)[0]).toBe("보통");
    expect(lv(50, 20, 5)[1]).toBe("좋음");
    expect(lv(49, 20, 5)[1]).toBe("보통");
    expect(lv(10, 59, 5)[2]).toBe("좋음");
    expect(lv(10, 60, 5)[2]).toBe("보통");
    expect(lv(100, 29, 9)[3]).toBe("좋음");
    expect(lv(100, 29, 10)[3]).toBe("보통");
  });

  it("측정 파라미터 표가 CFG 실제값과 일치한다", () => {
    const value = (label) => paramTable.rows.find((r) => r[0] === label)[1];

    expect(value("다운로드 측정 상한")).toBe(`${CFG.dlMaxDurationMs / 1000}초`);
    expect(value("다운로드 병렬 스트림")).toBe(`${CFG.dlStreams}개`);
    expect(value("업로드 병렬 스트림")).toBe(`${CFG.ulStreams}개`);
    expect(value("속도 샘플링 간격")).toBe(`${CFG.sampleIntervalMs}ms`);
    const windowSec = (CFG.convergeWindow * CFG.sampleIntervalMs) / 1000;
    expect(value("조기 종료 조건")).toBe(
      `${CFG.convergeMinMs / 1000}초 경과 후, 최근 ${windowSec}초 구간과 직전 ${windowSec}초 구간의 ` +
        `속도 중앙값 차이가 ${CFG.convergeEpsilon * 100}% 이내이고 하락 중이 아닐 때`,
    );
    expect(value("최종값 산출")).toBe(`측정 마지막 ${CFG.finalWindowMs / 1000}초 구간 샘플의 중앙값`);
    expect(value("핑 측정 방식")).toBe(`워밍업 1회 후 순차 ${CFG.pingCount}회 (최대 ${CFG.pingBudgetMs / 1000}초)`);
  });
});
