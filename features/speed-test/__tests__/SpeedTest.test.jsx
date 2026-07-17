import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpeedTest } from "../index.js";
import * as engine from "../engine";

vi.mock("../engine", () => ({
  measurePing: vi.fn(),
  measureDownload: vi.fn(),
  measureUpload: vi.fn(),
  detectEnvironment: vi.fn(),
}));

const pending = () => new Promise(() => {});

beforeEach(() => {
  vi.clearAllMocks();
  engine.detectEnvironment.mockResolvedValue({
    device: "PC",
    connType: "WiFi/유선",
    isp: "KT",
    region: "Gyeonggi-do",
    city: "Goyang-si",
    locationSource: "ip",
    locationAccuracy: "approximate",
  });
  engine.measurePing.mockResolvedValue({ ping: 20, jitter: 3.2, samples: [] });
  engine.measureDownload.mockResolvedValue({
    mbps: 120,
    bytes: 1e8,
    durationMs: 4000,
    loadedLatency: 30,
  });
  engine.measureUpload.mockReturnValue(pending()); // 기본: 업로드 진행 중
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("SpeedTest 화면", () => {
  it("자동화 환경에서는 자동 측정을 건너뛰고 수동 시작 버튼을 제공한다", async () => {
    const webdriverDescriptor = Object.getOwnPropertyDescriptor(navigator, "webdriver");
    Object.defineProperty(navigator, "webdriver", {
      configurable: true,
      value: true,
    });
    const user = userEvent.setup();

    try {
      render(<SpeedTest />);

      const startButton = screen.getByRole("button", { name: "측정 시작하기" });
      expect(engine.measureDownload).not.toHaveBeenCalled();

      await user.click(startButton);
      expect(engine.measureDownload).toHaveBeenCalledTimes(1);
    } finally {
      if (webdriverDescriptor) {
        Object.defineProperty(navigator, "webdriver", webdriverDescriptor);
      } else {
        delete navigator.webdriver;
      }
    }
  });

  it("헤더에는 시·군·구 대신 IP 기준 광역 지역 추정값만 표시한다", async () => {
    render(<SpeedTest />);

    expect(
      await screen.findByText("KT · IP 기준 Gyeonggi-do 추정 · WiFi/유선"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Goyang-si/)).not.toBeInTheDocument();
  });

  it("측정 중 상태를 표시한다", async () => {
    engine.measureDownload.mockReturnValue(pending());
    render(<SpeedTest />);

    expect(await screen.findByText("측정 중")).toBeInTheDocument();
    expect(
      screen.getByText("Cloudflare 엣지 · 다중 스트림 측정"),
    ).toBeInTheDocument();
    expect(screen.queryByText("다시 측정하기")).not.toBeInTheDocument();
  });

  it("다운로드 완료 시 결과를 보여주고 업로드는 pending으로 표시한다", async () => {
    render(<SpeedTest />);

    expect(
      await screen.findAllByText("4K 스트리밍도 여유로워요"),
    ).toHaveLength(2);
    expect(screen.getByText("용도별 적합도")).toBeInTheDocument();
    expect(screen.getByText("다시 측정하기")).toBeInTheDocument();
    expect(screen.getByText("업로드")).toBeInTheDocument();
    expect(screen.getByText(/…/)).toBeInTheDocument(); // 업로드 값 대기
    expect(screen.getByText("지연(핑)")).toBeInTheDocument();
  });

  it("업로드가 끝나면 값을 채워넣는다", async () => {
    engine.measureUpload.mockResolvedValue({ mbps: 8.4, durationMs: 8000 });
    render(<SpeedTest />);

    expect(await screen.findByText("8.4")).toBeInTheDocument();
    expect(screen.queryByText(/…/)).not.toBeInTheDocument();
  });

  it("느린 결과에는 strong CTA와 맞춤 추천을 보여준다", async () => {
    engine.measureDownload.mockResolvedValue({
      mbps: 50,
      bytes: 1,
      durationMs: 1,
      loadedLatency: null,
    });
    render(<SpeedTest />);

    expect(
      await screen.findByText("현금 사은품 비교하기"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("방마다 느리다면 메시 와이파이"),
    ).toBeInTheDocument();
  });

  it("?cta=weak이면 weak CTA variant를 보여준다", async () => {
    window.history.replaceState(null, "", "/?cta=weak");
    engine.measureDownload.mockResolvedValue({
      mbps: 50,
      bytes: 1,
      durationMs: 1,
      loadedLatency: null,
    });
    render(<SpeedTest />);

    expect(await screen.findByText("비교하기")).toBeInTheDocument();
    expect(screen.getByText("현재 통신사·측정 속도 기준 현금 사은품 비교 · 광고")).toBeInTheDocument();
    expect(screen.queryByText(/Gyeonggi-do 기준/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("현금 사은품 비교하기"),
    ).not.toBeInTheDocument();
  });

  it("정상 결과에는 전환 CTA가 없다", async () => {
    render(<SpeedTest />);

    await screen.findByText("다시 측정하기");
    expect(
      screen.queryByText("현금 사은품 비교하기"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("비교하기")).not.toBeInTheDocument();
    expect(screen.queryByText("측정 결과 맞춤 추천")).not.toBeInTheDocument();
  });

  it("native share 미지원이면 clipboard fallback과 toast가 동작한다", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<SpeedTest />);

    await user.click(await screen.findByText("결과 공유"));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("내 인터넷 속도");
    expect(writeText.mock.calls[0][0]).toContain("KT");
    expect(writeText.mock.calls[0][0]).not.toContain("Gyeonggi-do");
    expect(writeText.mock.calls[0][0]).not.toContain("Goyang-si");
    expect(
      await screen.findByText("결과가 복사됐어요 — 붙여넣어 공유하세요"),
    ).toBeInTheDocument();
  });

  it("측정 실패 시 오류 상태와 재시도 버튼을 보여준다", async () => {
    engine.measureDownload.mockRejectedValueOnce(new Error("network dead"));
    const user = userEvent.setup();
    render(<SpeedTest />);

    expect(await screen.findByText("측정에 실패했어요")).toBeInTheDocument();
    expect(screen.queryByText("측정 중")).not.toBeInTheDocument();

    // 재시도 → 기본 mock이 성공하므로 결과 화면 도달
    await user.click(screen.getByText("다시 시도하기"));
    expect(await screen.findByText("다시 측정하기")).toBeInTheDocument();
  });
});
