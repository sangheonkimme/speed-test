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
    expect(screen.getByText("인터넷 속도 측정, 왜 스피드체크인가요?")).toBeInTheDocument();

    await user.click(screen.getByText("속도 측정 안내 및 자주 묻는 질문"));
    expect(details).toHaveAttribute("open");
  });
});
