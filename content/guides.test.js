import { describe, expect, it } from "vitest";
import { guides, guideUpdated } from "./guides";

describe("가이드 콘텐츠", () => {
  it("모든 글이 직답 문장을 가진다", () => {
    // 답변엔진은 페이지를 요약하지 않고 답이 되는 문장을 추출한다.
    for (const g of guides) {
      expect(g.lead, `${g.slug}에 lead 없음`).toBeTruthy();
    }
  });

  it("직답 문장에 문맥 의존 지시어가 없다", () => {
    // 추출되어 단독으로 노출되므로 "위에서 말한" 같은 표현은 무의미해진다.
    for (const g of guides) {
      expect(g.lead).not.toMatch(/위에서|앞서 말한|이것은|아래에서 설명/);
    }
  });

  it("dateModified는 실제 수정일이며 발행일보다 앞서지 않는다", () => {
    // 내용 변경 없이 날짜만 올리는 조작을 막기 위해 updated가 없으면 date와 같아야 한다.
    for (const g of guides) {
      const updated = guideUpdated(g);
      expect(updated).toBe(g.updated || g.date);
      expect(new Date(updated).getTime()).toBeGreaterThanOrEqual(new Date(g.date).getTime());
    }
  });

  it("표는 헤더 수와 모든 행의 열 수가 일치한다", () => {
    for (const g of guides) {
      for (const s of g.sections) {
        if (!s.table) continue;
        const { headers, rows } = s.table;
        for (const row of rows) {
          expect(row.length, `${g.slug} / ${s.h} 열 수 불일치`).toBe(headers.length);
        }
      }
    }
  });
});
