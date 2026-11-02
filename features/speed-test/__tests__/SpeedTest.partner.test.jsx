import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpeedTest } from "../index.js";
import * as engine from "../engine";

// 제휴 주소가 채워진 상태. 비어 있을 때 숨는 동작은 SpeedTest.test.jsx가 확인한다.
vi.mock("../config", async (importOriginal) => ({
  ...(await importOriginal()),
  PARTNER_URL: "https://partner.example/compare",
  COMMERCE_URLS: { mesh: "https://link.example/mesh", gaming: "" },
}));

vi.mock("../engine", () => ({
  measurePing: vi.fn(),
  measureDownload: vi.fn(),
  measureUpload: vi.fn(),
  detectEnvironment: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  engine.detectEnvironment.mockResolvedValue({
    device: "PC",
    connType: "WiFi/유선",
    isp: "KT",
    region: "Gyeonggi-do",
  });
  // 핑 40ms → 게이밍 추천 조건도 충족하지만 주소가 비어 있으므로 카드가 없어야 한다
  engine.measurePing.mockResolvedValue({ ping: 40, jitter: 3, samples: [] });
  engine.measureDownload.mockResolvedValue({ mbps: 50, bytes: 1, durationMs: 1, loadedLatency: null });
  engine.measureUpload.mockReturnValue(new Promise(() => {}));
  vi.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("제휴 주소가 있을 때 결과 화면", () => {
  it("느린 결과에 근거 없는 수치 없이 요금제 비교 CTA를 보여주고, 누르면 제휴 주소로 연다", async () => {
    const user = userEvent.setup();
    render(<SpeedTest />);

    await user.click(await screen.findByText("현금 사은품 비교하기"));
    expect(screen.getByText("회선이 원인이라면 요금제를 비교해 보세요")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/최대 \d+배/);

    const opened = new URL(window.open.mock.calls[0][0]);
    expect(opened.origin + opened.pathname).toBe("https://partner.example/compare");
    expect(opened.searchParams.get("isp")).toBe("KT");
    expect(opened.searchParams.get("mbps")).toBe("50");
  });

  it("?cta=weak이면 weak CTA variant를 보여준다", async () => {
    window.history.replaceState(null, "", "/?cta=weak");
    render(<SpeedTest />);

    expect(await screen.findByText("비교하기")).toBeInTheDocument();
    expect(screen.getByText("현재 통신사·측정 속도 기준 현금 사은품 비교 · 광고")).toBeInTheDocument();
    expect(screen.queryByText("현금 사은품 비교하기")).not.toBeInTheDocument();
  });

  it("주소가 있는 추천 카드만 보여주고, 누르면 그 주소로 연다", async () => {
    const user = userEvent.setup();
    render(<SpeedTest />);

    await user.click(await screen.findByText("방마다 느리다면 메시 와이파이"));
    expect(window.open).toHaveBeenCalledWith("https://link.example/mesh", "_blank", "noopener");
    expect(screen.queryByText("핑·지터 잡는 게이밍 회선")).not.toBeInTheDocument();
  });
});
