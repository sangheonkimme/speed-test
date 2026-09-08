import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { guides } from "@/content/guides";
import { SiteFooter } from "./SiteFooter";

/*
 * 회귀 방지: 예전에는 내부 링크가 ResultPanel(측정 완료 후에만 렌더되는 클라이언트 트리)
 * 안에만 있어서 크롤러가 받는 홈 HTML의 <a> 태그가 0개였다. 가이드 문서 전체가
 * 홈에서 도달 불가였고 사이트맵으로만 발견됐다.
 * 이 테스트는 링크가 측정 상태와 무관하게 항상 렌더되는 것을 강제한다.
 */
describe("사이트 푸터", () => {
  it("모든 가이드 문서로 가는 링크를 조건 없이 렌더한다", () => {
    render(<SiteFooter />);

    for (const g of guides) {
      const link = screen.getByRole("link", { name: g.title });
      expect(link).toHaveAttribute("href", `/guide/${g.slug}`);
    }
  });

  it("가이드 목록·방법론·소개·개인정보 페이지로 연결된다", () => {
    render(<SiteFooter />);

    const expected = {
      "가이드 전체 보기": "/guide",
      "측정 방법론": "/methodology",
      "서비스 소개": "/about",
      "개인정보 처리방침": "/privacy",
    };

    for (const [name, href] of Object.entries(expected)) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });
});

/*
 * LLMO: 서비스명과 도메인이 가시 텍스트에서 함께 나와야 모델이 둘을 하나의 엔티티로 묶는다.
 * 이전에는 도메인이 canonical·JSON-LD·OG 이미지 안에만 있어 본문에는 한 번도 없었다.
 */
describe("엔티티 표기", () => {
  it("푸터가 서비스명과 도메인을 함께 노출한다", () => {
    const { container } = render(<SiteFooter />);
    expect(container.textContent).toContain("스피드체크(speed-value.com)");
  });
});
