import { describe, expect, it } from "vitest";
import { median, meanDeviation } from "../engine/statistics.js";

describe("median", () => {
  it("빈 배열은 0", () => {
    expect(median([])).toBe(0);
  });

  it("홀수 길이는 중앙 원소", () => {
    expect(median([3])).toBe(3);
    expect(median([1, 2, 100])).toBe(2);
  });

  it("짝수 길이는 중앙 두 값의 평균", () => {
    expect(median([1, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it("정렬되지 않은 입력도 정렬해 계산하고 원본을 변형하지 않는다", () => {
    const arr = [9, 1, 5];
    expect(median(arr)).toBe(5);
    expect(arr).toEqual([9, 1, 5]);
  });
});

describe("meanDeviation", () => {
  it("원소가 2개 미만이면 0", () => {
    expect(meanDeviation([])).toBe(0);
    expect(meanDeviation([42])).toBe(0);
  });

  it("중앙값 기준 절대 편차의 평균을 반환한다", () => {
    // median([10, 20, 30]) = 20 → (10 + 0 + 10) / 3
    expect(meanDeviation([10, 20, 30])).toBeCloseTo(20 / 3);
    // median([1, 1, 1]) = 1 → 편차 0
    expect(meanDeviation([1, 1, 1])).toBe(0);
  });

  it("정렬되지 않은 입력도 동일하게 계산한다", () => {
    expect(meanDeviation([30, 10, 20])).toBeCloseTo(20 / 3);
  });
});
