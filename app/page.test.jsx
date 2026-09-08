import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/features/speed-test", () => ({
  SpeedTest: () => <div data-testid="speed-test" />,
}));

/*
 * 회귀 방지: 이 콘텐츠는 예전에 <details> 안에 접혀 있었고, 그 결과 클릭 없이 보이는
 * 텍스트가 563자(대부분 UI 라벨)뿐이라 AdSense 심사에서
 * "게시자 콘텐츠가 없는 화면"으로 정책 위반 판정을 받았다.
 */
describe("홈 게시자 콘텐츠", () => {
  it("접는 UI 없이 본문이 그대로 노출된다", () => {
    const { container } = render(<Home />);

    expect(container.querySelector("details")).toBeNull();
    expect(screen.getByText("측정 결과를 읽는 법")).toBeInTheDocument();
    expect(screen.getByText("자주 묻는 질문")).toBeInTheDocument();
  });

  it("판정 기준을 표로 공개한다", () => {
    const { container } = render(<Home />);

    const captions = [...container.querySelectorAll("caption")].map((c) => c.textContent);
    expect(captions).toContain("다운로드 속도 등급 기준");
    expect(captions).toContain("용도별 적합도 판정 기준");
    expect(captions).toContain("측정 파라미터");
  });

  it("본문 분량이 최소 기준을 넘는다", () => {
    const { container } = render(<Home />);
    const text = container.textContent.replace(/\s+/g, " ").trim();

    // AdSense "최소 콘텐츠 요건" 대응 — 접혀 있던 시절 홈의 노출 텍스트는 563자였다.
    expect(text.length).toBeGreaterThan(2500);
  });

  it("측정 완료 시간을 실제 구현보다 짧게 단정하지 않는다", () => {
    const { container } = render(<Home />);
    const structuredData = JSON.parse(
      container.querySelector('script[type="application/ld+json"]').textContent,
    );

    expect(structuredData["@graph"][0].description).not.toContain("3초 안에");
    expect(structuredData["@graph"][0].description).toContain("한 번에 확인");
  });
});
