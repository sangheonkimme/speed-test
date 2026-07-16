import { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSpeedTest } from "../hooks/useSpeedTest.js";
import { useToast } from "../hooks/useToast.js";

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  promise.catch(() => {}); // 테스트에서 늦게 reject해도 unhandled 경고 없게
  return { promise, resolve, reject };
}

// 각 측정 단계를 테스트에서 직접 resolve/reject할 수 있는 mock engine
function createMockEngine() {
  const runs = [];
  return {
    runs,
    downloads: () => runs.filter((r) => r.type === "download"),
    uploads: () => runs.filter((r) => r.type === "upload"),
    detectEnvironment: vi.fn(async () => ({
      device: "PC",
      connType: "WiFi/유선",
      isp: "KT",
      region: "서울",
    })),
    measurePing: vi.fn(async () => ({ ping: 20, jitter: 3.2, samples: [] })),
    measureDownload: vi.fn((onProgress, onLoadedLatency, options = {}) => {
      const d = deferred();
      runs.push({ type: "download", onProgress, signal: options.signal, d });
      return d.promise;
    }),
    measureUpload: vi.fn((onProgress, options = {}) => {
      const d = deferred();
      runs.push({ type: "upload", onProgress, signal: options.signal, d });
      return d.promise;
    }),
  };
}

const flush = () => act(async () => {});

describe("useSpeedTest", () => {
  it("마운트 시 자동으로 측정을 시작한다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    expect(result.current.phase).toBe("measuring");
    expect(engine.measureDownload).toHaveBeenCalledTimes(1);
    expect(engine.measurePing).toHaveBeenCalledTimes(1);
    expect(result.current.pingVal).toBe(20);
    expect(result.current.jitterVal).toBe(3.2);
    expect(result.current.env?.isp).toBe("KT");
  });

  it("다운로드 완료 시 결과 화면으로 전환하고 업로드는 백그라운드로 채운다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    act(() => engine.downloads()[0].onProgress({ mbps: 42, elapsedMs: 1000 }));
    expect(result.current.bigNum).toBe(42);
    expect(result.current.progress).toBeGreaterThan(0);

    await act(async () =>
      engine.downloads()[0].d.resolve({
        mbps: 96.5,
        bytes: 1e8,
        durationMs: 4000,
        loadedLatency: 31,
      }),
    );

    expect(result.current.phase).toBe("done");
    expect(result.current.result).toMatchObject({
      down: 96.5,
      up: null,
      ping: 20,
      jitter: 3.2,
      loadedLatency: 31,
    });
    expect(result.current.progress).toBe(100);

    act(() => engine.uploads()[0].onProgress({ mbps: 8, elapsedMs: 500 }));
    expect(result.current.upLive).toBe(8);

    await act(async () =>
      engine.uploads()[0].d.resolve({ mbps: 12.3, durationMs: 8000 }),
    );
    expect(result.current.result.up).toBe(12.3);
    expect(result.current.phase).toBe("done");
  });

  it("측정 실패 시 error 상태로 전환한다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    await act(async () =>
      engine.downloads()[0].d.reject(new Error("network dead")),
    );
    expect(result.current.phase).toBe("error");
  });

  it("error 상태에서 start()로 재시도할 수 있다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();
    await act(async () => engine.downloads()[0].d.reject(new Error("boom")));
    expect(result.current.phase).toBe("error");

    await act(async () => {
      result.current.start(); // 진행 중 promise를 기다리지 않는다 (측정은 계속 pending)
    });
    expect(result.current.phase).toBe("measuring");
    expect(engine.measureDownload).toHaveBeenCalledTimes(2);
  });

  it("재측정 시 이전 run을 중단하고 이전 run의 결과가 새 상태를 덮어쓰지 않는다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    // run 1: 다운로드까지 완료, 업로드는 진행 중
    await act(async () =>
      engine.downloads()[0].d.resolve({
        mbps: 50,
        bytes: 1,
        durationMs: 1,
        loadedLatency: null,
      }),
    );
    expect(result.current.phase).toBe("done");

    // run 2 시작 → run 1은 중단되어야 한다
    await act(async () => {
      result.current.start();
    });
    expect(result.current.phase).toBe("measuring");
    expect(result.current.result).toBeNull();
    expect(engine.downloads()[0].signal.aborted).toBe(true);
    expect(engine.uploads()[0].signal.aborted).toBe(true);

    // run 1의 늦은 콜백/완료는 무시된다
    act(() => engine.downloads()[0].onProgress({ mbps: 999, elapsedMs: 99 }));
    await act(async () =>
      engine.uploads()[0].d.resolve({ mbps: 999, durationMs: 1 }),
    );
    expect(result.current.bigNum).not.toBe(999);
    expect(result.current.result).toBeNull();

    // run 2는 정상 완료된다
    await act(async () =>
      engine.downloads()[1].d.resolve({
        mbps: 70,
        bytes: 1,
        durationMs: 1,
        loadedLatency: null,
      }),
    );
    await act(async () =>
      engine.uploads()[1].d.resolve({ mbps: 11, durationMs: 1 }),
    );
    expect(result.current.result).toMatchObject({ down: 70, up: 11 });
  });

  it("늦게 끝난 이전 환경 조회가 현재 run의 analytics 환경을 덮어쓰지 않는다", async () => {
    window.dataLayer = [];
    const engine = createMockEngine();
    const environments = [deferred(), deferred(), deferred()];
    engine.detectEnvironment = vi.fn((options = {}) => {
      const next = environments[engine.detectEnvironment.mock.calls.length - 1];
      next.signal = options.signal;
      return next.promise;
    });
    const { result } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    await act(async () => {
      result.current.start();
    });
    expect(environments[0].signal.aborted).toBe(true);
    expect(environments[1].signal.aborted).toBe(false);

    await act(async () =>
      environments[1].resolve({
        device: "모바일",
        connType: "셀룰러",
        isp: "KT",
        region: "서울",
      }),
    );
    await act(async () =>
      environments[0].resolve({
        device: "PC",
        connType: "유선",
        isp: "OLD",
        region: "과거",
      }),
    );

    await act(async () => {
      result.current.start();
    });
    const started = window.dataLayer.filter((item) => item.event === "test_started");
    expect(started.at(-1)).toMatchObject({ device: "모바일", conn: "셀룰러" });
  });

  it("언마운트 시 진행 중인 측정을 중단한다", async () => {
    const engine = createMockEngine();
    const { unmount } = renderHook(() => useSpeedTest({ engine }));
    await flush();

    expect(engine.downloads()[0].signal.aborted).toBe(false);
    unmount();
    expect(engine.downloads()[0].signal.aborted).toBe(true);
  });

  it("StrictMode에서 활성 측정은 하나뿐이다", async () => {
    const engine = createMockEngine();
    const { result } = renderHook(() => useSpeedTest({ engine }), {
      wrapper: StrictMode,
    });
    await flush();

    // mount → cleanup → remount: 첫 run은 중단, 두 번째 run만 활성
    const downloads = engine.downloads();
    expect(downloads).toHaveLength(2);
    expect(downloads[0].signal.aborted).toBe(true);
    expect(downloads[1].signal.aborted).toBe(false);

    await act(async () =>
      downloads[1].d.resolve({
        mbps: 88,
        bytes: 1,
        durationMs: 1,
        loadedLatency: null,
      }),
    );
    expect(result.current.phase).toBe("done");
    expect(result.current.result.down).toBe(88);
  });
});

describe("useToast", () => {
  it("메시지를 표시하고 시간이 지나면 지운다", async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useToast());
      act(() => result.current.toast("복사됐어요"));
      expect(result.current.toastMsg).toBe("복사됐어요");

      act(() => vi.advanceTimersByTime(2200));
      expect(result.current.toastMsg).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("연속 호출 시 이전 타이머를 교체한다", async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useToast());
      act(() => result.current.toast("첫 번째"));
      act(() => vi.advanceTimersByTime(2000));
      act(() => result.current.toast("두 번째"));
      act(() => vi.advanceTimersByTime(2000));
      expect(result.current.toastMsg).toBe("두 번째"); // 아직 2200ms 안 지남
      act(() => vi.advanceTimersByTime(300));
      expect(result.current.toastMsg).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("언마운트 시 타이머를 정리한다", () => {
    vi.useFakeTimers();
    try {
      const { result, unmount } = renderHook(() => useToast());
      act(() => result.current.toast("남은 타이머"));
      unmount();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
