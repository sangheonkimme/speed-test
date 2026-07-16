import { describe, expect, it } from "vitest";
import { faq, createFaqJsonLd } from "./faq";

describe("FAQ structured data", () => {
  it("렌더링 FAQ와 JSON-LD의 질문/답변을 같은 순서로 유지한다", () => {
    const entities = createFaqJsonLd(faq).mainEntity;

    expect(entities).toHaveLength(faq.length);
    expect(entities.map((entity) => ({
      q: entity.name,
      a: entity.acceptedAnswer.text,
    }))).toEqual(faq);
  });
});
