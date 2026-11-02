import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GuidePage from "./page";
import { guides, guideUpdated } from "@/content/guides";
import { OPERATOR_NAME } from "@/content/site";

const renderGuide = async (slug) => render(await GuidePage({ params: Promise.resolve({ slug }) }));

const articleLd = (container) => {
  const raw = container.querySelector('script[type="application/ld+json"]').textContent;
  return JSON.parse(raw)["@graph"].find((n) => n["@type"] === "Article");
};

/*
 * 2026-11 애드센스 "가치가 별로 없는 콘텐츠" 거절 문구가 "지속적인 큐레이션"을 따로 짚었다.
 * 그때 가이드에는 작성자도 날짜도 화면에 없었다. 누가 언제 쓰고 고쳤는지를 화면과
 * 구조화 데이터에 같은 값으로 보여 준다.
 */
describe("가이드 작성자·날짜 표기", () => {
  it.each(guides.map((g) => g.slug))("%s — 화면의 작성자·날짜가 구조화 데이터와 같다", async (slug) => {
    const guide = guides.find((g) => g.slug === slug);
    const { container } = await renderGuide(slug);

    const byline = container.querySelector("p.byline");
    expect(byline).not.toBeNull();
    const times = [...byline.querySelectorAll("time")].map((t) => t.getAttribute("dateTime"));

    const ld = articleLd(container);
    expect(times[0]).toBe(ld.datePublished);
    expect(ld.dateModified).toBe(guideUpdated(guide));
    // 고친 적이 있으면 최종 수정일을 보여 주고, 없으면 발행일만 보여 준다
    expect(times).toEqual(
      ld.dateModified === ld.datePublished ? [ld.datePublished] : [ld.datePublished, ld.dateModified],
    );

    if (OPERATOR_NAME) {
      expect(ld.author).toMatchObject({ "@type": "Person", name: OPERATOR_NAME });
      expect(byline.querySelector('a[href="/about#operator"]').textContent).toBe(OPERATOR_NAME);
    }
  });

  it("날짜를 한국어로 읽기 쉽게 표시한다", async () => {
    await renderGuide("internet-suddenly-slow");
    expect(screen.getByText("2026년 7월 18일")).toBeInTheDocument();
    expect(screen.getByText("2026년 9월 16일")).toBeInTheDocument();
  });
});
