import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

describe("사이트 메타데이터", () => {
  it("측정 완료 시간을 실제 구현보다 짧게 단정하지 않는다", () => {
    expect(metadata.title.default).not.toContain("3초");
    expect(metadata.description).not.toContain("수 초 안에");
    expect(metadata.description).toContain("한 번에 확인");
  });
});
