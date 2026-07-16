import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  measurePing,
  measureDownload,
  measureUpload,
  detectEnvironment,
} from "../engine/index.js";

// fake timer 기반 가짜 지연 — fetch가 시간에 묶여 진행되도록 한다
const tick = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 요청한 크기만큼 한 번에 내려주는 ReadableStream 대역
const makeBody = (chunks) => {
  let i = 0;
  return {
    getReader: () => ({
      read: async () =>
        i < chunks.length
          ? { done: false, value: chunks[i++] }
          : { done: true, value: undefined },
      releaseLock: () => {},
    }),
  };
};

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "performance",
    ],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("measurePing", () => {
  it("실패한 샘플을 걸러내고 median/jitter를 계산한다", async () => {
    const latencies = [10, 20, 30, null, null];
    let call = 0;
    const fetchImpl = vi.fn(async () => {
      const lat = latencies[call++];
      if (lat == null) throw new TypeError("network error");
      await tick(lat);
      return { ok: true };
    });

    const onSample = vi.fn();
    const promise = measurePing(5, onSample, { deps: { fetch: fetchImpl } });
    await vi.advanceTimersByTimeAsync(100);
    const res = await promise;

    expect(res.ping).toBe(20);
    expect(res.jitter).toBeCloseTo(6.7, 1);
    expect(res.samples).toHaveLength(3);
    expect(onSample).toHaveBeenCalledTimes(3);
  });

  it("HTTP 오류 응답은 샘플에서 제외한다", async () => {
    let call = 0;
    const fetchImpl = vi.fn(async () => {
      const mine = call++;
      await tick(10);
      return { ok: mine !== 0 }; // 첫 요청만 5xx
    });
    const promise = measurePing(3, null, { deps: { fetch: fetchImpl } });
    await vi.advanceTimersByTimeAsync(50);
    const res = await promise;
    expect(res.samples).toHaveLength(2);
  });

  it("모든 샘플이 실패하면 오류를 던진다", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("offline");
    });
    await expect(
      measurePing(3, null, { deps: { fetch: fetchImpl } }),
    ).rejects.toThrow("ping failed");
  });
});

describe("measureDownload", () => {
  // 일정 속도 응답: 스트림당 100ms에 250KB → 수렴 후 조기 종료
  const steadyFetch = () =>
    vi.fn(async (url) => {
      if (url.includes("bytes=0")) {
        await tick(20);
        return { ok: true, body: makeBody([]) };
      }
      await tick(100);
      return { ok: true, body: makeBody([new Uint8Array(250000)]) };
    });

  it("progress를 보고하고 수렴 시 15초 전에 종료한다", async () => {
    const onProgress = vi.fn();
    const onLoadedLatency = vi.fn();
    const promise = measureDownload(onProgress, onLoadedLatency, {
      deps: { fetch: steadyFetch() },
    });
    await vi.advanceTimersByTimeAsync(20000);
    const res = await promise;

    expect(res.mbps).toBeGreaterThan(0);
    expect(res.bytes).toBeGreaterThan(0);
    expect(res.durationMs).toBeLessThan(15000); // 수렴 조기 종료
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress.mock.calls[0][0].mbps).toBeGreaterThan(0);
    expect(onLoadedLatency).toHaveBeenCalledWith(20);
    expect(res.loadedLatency).toBe(20);
    expect(vi.getTimerCount()).toBe(0); // interval 누수 없음
  });

  it("수렴하지 않으면 15초 상한에서 종료한다", async () => {
    let call = 0;
    const fetchImpl = vi.fn(async (url) => {
      if (url.includes("bytes=0")) {
        await tick(20);
        return { ok: true, body: makeBody([]) };
      }
      await tick(100);
      // 톱니형 크기 램프(주기 ≈ 0.8초) — 샘플 창마다 속도가 달라져 수렴을 막는다
      const size = 100000 * (1 + (call++ % 40));
      return { ok: true, body: makeBody([new Uint8Array(size)]) };
    });

    const promise = measureDownload(null, null, { deps: { fetch: fetchImpl } });
    await vi.advanceTimersByTimeAsync(20000);
    const res = await promise;

    expect(res.durationMs).toBeGreaterThanOrEqual(15000);
    expect(res.durationMs).toBeLessThan(16000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("AbortSignal 중단 시 timer를 정리하고 즉시 반환한다", async () => {
    const ac = new AbortController();
    const promise = measureDownload(null, null, {
      signal: ac.signal,
      deps: { fetch: steadyFetch() },
    });
    await vi.advanceTimersByTimeAsync(1000);
    ac.abort();
    await vi.advanceTimersByTimeAsync(500);
    const res = await promise;

    expect(res.durationMs).toBeLessThan(2000);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("measureUpload", () => {
  const uploadFetch = () =>
    vi.fn(async () => {
      await tick(200);
      return { ok: true };
    });

  it("progress를 보고하고 8초 상한에서 종료한다", async () => {
    const onProgress = vi.fn();
    const promise = measureUpload(onProgress, {
      deps: { fetch: uploadFetch() },
    });
    await vi.advanceTimersByTimeAsync(10000);
    const res = await promise;

    expect(res.mbps).toBeGreaterThan(0);
    expect(res.durationMs).toBeGreaterThanOrEqual(8000);
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress.mock.calls[0][0].mbps).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("AbortSignal 중단 시 timer를 정리하고 즉시 반환한다", async () => {
    const ac = new AbortController();
    const promise = measureUpload(null, {
      signal: ac.signal,
      deps: { fetch: uploadFetch() },
    });
    await vi.advanceTimersByTimeAsync(1000);
    ac.abort();
    await vi.advanceTimersByTimeAsync(500);
    await promise;

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("detectEnvironment", () => {
  it("meta 응답으로 ISP·지역을 매핑한다", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        region: "Seoul",
        city: "Gangnam",
        asOrganization: "Korea Telecom",
      }),
    }));
    const env = await detectEnvironment({ deps: { fetch: fetchImpl } });
    expect(env.device).toBe("PC"); // jsdom 기본 UA는 데스크톱
    expect(env.isp).toBe("KT");
    expect(env.region).toBe("Seoul Gangnam");
  });

  it("meta 조회 실패 시 isp/region 없이 환경만 반환한다", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("offline");
    });
    const env = await detectEnvironment({ deps: { fetch: fetchImpl } });
    expect(env.isp).toBeNull();
    expect(env.region).toBeNull();
    expect(env.device).toBe("PC");
    expect(env.connType).toBeTruthy();
  });

  it("HTTP 오류 응답도 조용히 무시한다", async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 503 }));
    const env = await detectEnvironment({ deps: { fetch: fetchImpl } });
    expect(env.isp).toBeNull();
    expect(env.region).toBeNull();
  });
});
