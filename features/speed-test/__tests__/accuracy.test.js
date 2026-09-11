import { describe, it, expect } from "vitest";
import { measureDownload } from "../engine/download";
import { measurePing } from "../engine/ping";

/*
 * 측정 정확도 회귀 테스트.
 *
 * 정답을 아는 가짜 회선에 엔진을 물려 보고값이 진값에서 벗어나지 않는지 확인한다.
 * 2026-09-09에 발견된 버그를 잡아 두기 위한 것이다 —
 * 재방문으로 커넥션이 데워진 상태에서 3.5Mbps 회선이 40Mbps로 보고됐다(11.4배).
 */

// 초기 버스트 후 지속 속도로 떨어지는 회선.
// 데워진 커넥션(HTTP/2 재사용·cwnd 성장·경로 버퍼)의 실제 거동을 모사한다.
function burstLink({ burstMbps, burstMs, sustainMbps }) {
  let credit = 0, last = Date.now(), delivered = 0;
  const t0 = Date.now();
  const bps = () => ((Date.now() - t0 < burstMs ? burstMbps : sustainMbps) * 1e6) / 8;
  return {
    async take(want) {
      for (;;) {
        const now = Date.now();
        credit += ((now - last) / 1000) * bps();
        last = now;
        if (credit >= 1) {
          const give = Math.min(want, Math.floor(credit));
          credit -= give; delivered += give;
          return give;
        }
        await new Promise((r) => setTimeout(r, 5));
      }
    },
    stats: () => ({ delivered, sec: (Date.now() - t0) / 1000 }),
  };
}

const fakeFetch = (link, rttMs = 40, jitterMs = 4) => async (url) => {
  const total = Number(/bytes=(\d+)/.exec(url)?.[1] ?? 0);
  if (total === 0) {
    await new Promise((r) => setTimeout(r, rttMs + Math.random() * jitterMs));
    return { ok: true, body: { getReader: () => ({ read: async () => ({ done: true }) }) } };
  }
  let sent = 0;
  return { ok: true, body: { getReader: () => ({
    async read() {
      if (sent >= total) return { done: true };
      const got = await link.take(Math.min(65536, total - sent));
      sent += got;
      return { done: false, value: new Uint8Array(got) };
    } }) } };
};

describe("다운로드 측정 정확도", () => {
  // 회귀: 조기 종료가 초기 버스트 구간에서 발동하면 버스트 속도가 최종값이 된다.
  for (const burstMs of [3000, 4000, 6000]) {
    it(`초기 버스트 ${burstMs}ms(40Mbps) 뒤 3.5Mbps로 떨어져도 과대 보고하지 않는다`, async () => {
      const link = burstLink({ burstMbps: 40, burstMs, sustainMbps: 3.5 });
      const dl = await measureDownload(null, null, { deps: { fetch: fakeFetch(link) } });
      // 버그가 있던 시절 이 값은 40Mbps(11.4배)였다.
      expect(dl.mbps).toBeLessThan(3.5 * 1.5);
      expect(dl.mbps).toBeGreaterThan(3.5 * 0.6);
    }, 40000);
  }

  it("안정적인 회선은 그대로 보고한다", async () => {
    const link = burstLink({ burstMbps: 25, burstMs: 0, sustainMbps: 25 });
    const dl = await measureDownload(null, null, { deps: { fetch: fakeFetch(link) } });
    expect(dl.mbps).toBeGreaterThan(25 * 0.8);
    expect(dl.mbps).toBeLessThan(25 * 1.2);
  }, 40000);
});

describe("핑·지터 정확도", () => {
  // 실제 앱은 핑을 다운로드보다 먼저 끝낸다(useSpeedTest). 그 조건에서 검증한다.
  it("유휴 상태에서 RTT를 정확히 재고 지터가 핑을 넘지 않는다", async () => {
    const link = burstLink({ burstMbps: 100, burstMs: 0, sustainMbps: 100 });
    const p = await measurePing(undefined, undefined, { deps: { fetch: fakeFetch(link, 40, 4) } });
    expect(p.ping).toBeGreaterThanOrEqual(38);
    expect(p.ping).toBeLessThanOrEqual(48);
    // 회귀: 예전 계산(중앙값 기준 평균절대편차 + 병렬 발사)에서는 지터가 핑을 넘었다.
    expect(p.jitter).toBeLessThan(p.ping);
  }, 20000);

  it("이상치 한 발이 지터를 지배하지 않는다", async () => {
    let n = 0;
    const spiky = async () => {
      // 6번째 요청만 800ms — 나머지는 40ms대
      const ms = ++n === 6 ? 800 : 40;
      await new Promise((r) => setTimeout(r, ms));
      return { ok: true, body: { getReader: () => ({ read: async () => ({ done: true }) }) } };
    };
    const p = await measurePing(undefined, undefined, { deps: { fetch: spiky } });
    // 스파이크는 진짜 변동이므로 반영되지만, 표본이 늘어 한 발이 값을 지배하지 못한다.
    // 예전에는 표본 5개 + 평균절대편차라 이런 스파이크 하나가 지터를 147ms로 만들었다.
    expect(p.ping).toBeLessThan(100);
    expect(p.jitter).toBeLessThan(300);
  }, 20000);

  it("예산을 넘기면 표본 수집을 멈춰 다운로드 시작을 지연시키지 않는다", async () => {
    const slow = async () => {
      await new Promise((r) => setTimeout(r, 500)); // RTT 500ms
      return { ok: true, body: { getReader: () => ({ read: async () => ({ done: true }) }) } };
    };
    const t0 = Date.now();
    const p = await measurePing(undefined, undefined, { deps: { fetch: slow } });
    const took = Date.now() - t0;
    expect(p.samples.length).toBeGreaterThanOrEqual(4); // 최소 표본은 확보
    expect(took).toBeLessThan(3500); // 8발 × 500ms = 4초를 다 쓰지 않는다
  }, 20000);
});

describe("측정 소요 시간", () => {
  /*
   * 승인된 측정 시간은 8~10초다. 순간 속도가 흔들리는 실전 회선에서도 15초 상한까지 가면 안 된다.
   * 회귀: 개별 200ms 샘플의 편차로 수렴을 판정하던 시절에는 흔들림이 5%만 넘어도
   * 조기 종료가 걸리지 않아 매번 15초를 채웠다 (2026-09-11 실측 14.9초 × 2회).
   */
  function noisyLink(mbps, noise) {
    let credit = 0, last = Date.now(), rate = mbps, switchedAt = 0;
    return {
      async take(want) {
        for (;;) {
          const now = Date.now();
          if (now - switchedAt >= 200) {
            rate = mbps * (1 + (Math.random() * 2 - 1) * noise);
            switchedAt = now;
          }
          credit += ((now - last) / 1000) * (rate * 1e6) / 8;
          last = now;
          if (credit >= 1) {
            const give = Math.min(want, Math.floor(credit));
            credit -= give;
            return give;
          }
          await new Promise((r) => setTimeout(r, 5));
        }
      },
    };
  }

  for (const noise of [0.1, 0.2]) {
    it(`순간 속도가 ±${noise * 100}% 흔들려도 10초 안에 정확히 끝난다`, async () => {
      const t = Date.now();
      const dl = await measureDownload(null, null, { deps: { fetch: fakeFetch(noisyLink(50, noise)) } });
      const sec = (Date.now() - t) / 1000;
      expect(sec).toBeGreaterThan(7.5); // 최소 측정 시간(8초)은 지킨다
      expect(sec).toBeLessThan(10.5); // 상한(15초)까지 끌지 않는다
      expect(dl.mbps).toBeGreaterThan(50 * 0.85);
      expect(dl.mbps).toBeLessThan(50 * 1.15);
    }, 30000);
  }
});
