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

  it("지역 정보가 IP 기반 광역 추정값이며 실제 위치와 다를 수 있음을 안내한다", () => {
    const dataUsage = faq.find((item) => item.q === "측정 데이터는 어떻게 사용되나요?");

    expect(dataUsage.a).toContain("IP 기반 광역 지역 추정값");
    expect(dataUsage.a).toContain("실제 위치와 다를 수");
    expect(dataUsage.a).not.toContain("시·군·구");
  });

  it("측정 시간과 서버 위치를 구현보다 강하게 단정하지 않는다", () => {
    const copy = faq.map((item) => `${item.q} ${item.a}`).join(" ");

    expect(copy).not.toContain("5~7초");
    expect(copy).not.toContain("국내 서버");
    expect(copy).not.toContain("과소 측정");
    expect(copy).toContain("최대 15초");
    expect(copy).toContain("Cloudflare 엣지");
  });
});
