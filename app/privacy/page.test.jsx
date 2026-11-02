import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./page";

/*
 * 2026-11 애드센스 재거절 시점에 이 페이지는
 * - "문의 채널은 준비 중입니다"(문의 페이지가 이미 있는데도)와 "문의하기로 받습니다"가 함께 있었고
 * - 광고 코드가 이미 들어가 있는데 "향후 광고가 도입되면 고지하겠다"고 적혀 있었다.
 * 애드센스 정책은 Google 광고 쿠키 고지와 거부 방법 안내를 개인정보 처리방침에 요구한다.
 */
describe("개인정보 처리방침", () => {
  it("미완성·미래형 문구가 없다", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).not.toMatch(/준비 중|향후 광고/);
  });

  it("Google 광고 쿠키 사용과 거부 방법을 고지한다", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).toMatch(/Google 애드센스/);
    expect(container.textContent).toMatch(/방문한 기록을 바탕으로 광고/);
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("https://adssettings.google.com");
    expect(hrefs).toContain("https://www.aboutads.info/choices/");
  });

  it("문의 절은 하나이고, 시행일은 개정 이력의 맨 위 날짜와 같다", () => {
    const { container } = render(<PrivacyPage />);
    const h2 = [...container.querySelectorAll("h2")].map((h) => h.textContent);
    expect(h2.filter((t) => t.includes("문의"))).toHaveLength(1);

    const effective = container.querySelector("p time").getAttribute("dateTime");
    const firstRevision = container.querySelector("ul:last-of-type li time").getAttribute("dateTime");
    expect(effective).toBe(firstRevision);
  });
});
