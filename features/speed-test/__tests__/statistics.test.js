import { describe, expect, it } from "vitest";
import { median, consecutiveJitter } from "../engine/statistics.js";

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

describe("consecutiveJitter", () => {
  it("샘플이 2개 미만이면 0", () => {
    expect(consecutiveJitter([])).toBe(0);
    expect(consecutiveJitter([42])).toBe(0);
  });

  it("연속 샘플 간 차이의 평균을 낸다", () => {
    expect(consecutiveJitter([10, 20, 30])).toBe(10);
    expect(consecutiveJitter([50, 50, 50])).toBe(0);
  });

  it("이상치 하나에 무너지지 않는다", () => {
    // 옛 방식(중앙값 기준 평균절대편차)은 이 샘플에서 지터 147.4ms를 냈다.
    // 핑이 57ms인데 지터가 그 2.6배로 나오던 실제 사례다.
    const spike = [55, 56, 57, 58, 790];
    const jitter = consecutiveJitter(spike);
    expect(jitter).toBeLessThan(200);
    // 스파이크 자체는 반영하되(진짜 변동이므로) 핑 대비 터무니없는 값이 되진 않는다
    expect(jitter).toBeGreaterThan(0);
  });

  it("순서가 바뀌면 값이 달라진다 — 순차 측정이 전제다", () => {
    expect(consecutiveJitter([10, 20, 30])).not.toBe(consecutiveJitter([10, 30, 20]));
  });
});
