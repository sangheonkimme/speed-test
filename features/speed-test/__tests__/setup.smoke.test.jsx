import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// 테스트 하네스(jsdom + RTL + jest-dom) 자체가 동작하는지 고정하는 smoke test
describe("test harness", () => {
  it("renders into jsdom and supports jest-dom matchers", () => {
    render(<main aria-label="smoke">스피드체크</main>);
    expect(screen.getByLabelText("smoke")).toBeInTheDocument();
    expect(screen.getByLabelText("smoke")).toHaveTextContent("스피드체크");
  });
});
