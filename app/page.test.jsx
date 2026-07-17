import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/features/speed-test", () => ({
  SpeedTest: () => <div data-testid="speed-test" />,
}));

describe("하단 상세 설명", () => {
  it("기본으로 접혀 있고 사용자가 요약을 눌러 펼칠 수 있다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    const details = container.querySelector("details.seo-details");

    expect(details).toBeInTheDocument();
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("속도 측정 안내 및 자주 묻는 질문")).toBeInTheDocument();
    expect(screen.getByText("스피드체크에서는 무엇을 측정하나요?")).toBeInTheDocument();
    expect(screen.queryByText("KT · SK브로드밴드 · LG유플러스 속도 비교")).not.toBeInTheDocument();

    const structuredData = JSON.parse(
      container.querySelector('script[type="application/ld+json"]').textContent,
    );
    expect(structuredData["@graph"][0].description).not.toContain("3초 안에");
    expect(structuredData["@graph"][0].description).toContain("한 번에 확인");

    await user.click(screen.getByText("속도 측정 안내 및 자주 묻는 질문"));
    expect(details).toHaveAttribute("open");
  });
});
