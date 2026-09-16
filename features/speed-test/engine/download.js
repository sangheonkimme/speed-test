import { DOWN, CFG } from "../config";
import { median } from "./statistics";
import { resolveDeps, createAbortRegistry, runSampler } from "./transfer";

// ---------- 다운로드 (FR-1, FR-3) ----------
// 병렬 스트림 + 점진적 파일 크기 확대. onProgress로 실시간 Mbps 전달.
export async function measureDownload(onProgress, onLoadedLatency, options = {}) {
  const deps = resolveDeps(options.deps);
  const registry = createAbortRegistry(options.signal);
  const start = deps.now();
  let totalBytes = 0;
  const speedSamples = []; // {t, mbps}

  // 로드 상태 지연(loaded latency): 다운로드 중 주기적 핑
  const loadedRtts = [];
  const loadedPinger = deps.setInterval(async () => {
    if (registry.aborted) return;
    const t0 = deps.now();
    const ctrl = registry.register();
    try {
      const res = await deps.fetch(DOWN(0) + `&r=${deps.random()}`, {
        cache: "no-store",
        signal: ctrl.signal,
      });
      if (!res.ok) return; // 오류 응답은 지연 샘플로 사용하지 않음
      loadedRtts.push(deps.now() - t0);
      if (onLoadedLatency) onLoadedLatency(Math.round(median(loadedRtts)));
    } catch {
      // 보조 지표라 실패 샘플은 버린다 (중단 포함)
    } finally {
      registry.unregister(ctrl);
    }
  }, 1500);

  // 스트림 1개: 점진적으로 큰 청크를 계속 받음
  async function runStream() {
    let sizeIdx = 0;
    while (!registry.aborted && deps.now() - start < CFG.dlMaxDurationMs) {
      const size =
        CFG.dlChunkSizes[Math.min(sizeIdx, CFG.dlChunkSizes.length - 1)];
      sizeIdx++;
      const ctrl = registry.register();
      try {
        const res = await deps.fetch(DOWN(size) + `&r=${deps.random()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) continue; // 오류 응답 본문은 측정에 포함하지 않음
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
          if (registry.aborted) {
            ctrl.abort();
            break;
          }
        }
      } catch {
        if (registry.aborted) break;
        // 개별 청크 실패는 무시하고 다음 반복에서 재시도
      } finally {
        registry.unregister(ctrl);
      }
    }
  }

  // 샘플러: 200ms마다 현재 속도 계산, 수렴 판단
  let lastBytes = 0;
  let lastT = start;
  const sampler = runSampler({
    intervalMs: CFG.sampleIntervalMs,
    deps,
    signal: options.signal,
    onTick: (finish) => {
      const t = deps.now();
      const dt = (t - lastT) / 1000;
      if (dt <= 0) return;
      const mbps = ((totalBytes - lastBytes) * 8) / dt / 1e6;
      lastBytes = totalBytes;
      lastT = t;
      if (mbps > 0) speedSamples.push({ t: t - start, mbps });

      // 실시간 추정치: 최근 샘플 중앙값 (FR-1: 3초 내 첫 수치)
      const recent = speedSamples.slice(-8).map((s) => s.mbps);
      const estimate = median(recent);
      if (onProgress && recent.length) {
        onProgress({ mbps: estimate, elapsedMs: t - start, bytes: totalBytes });
      }

      // 수렴 → 조기 종료 (FR-3)
      //
      // ⚠️ 안정적으로 보인다고 끝내면 안 된다. 데워진 커넥션의 초기 버스트도 "안정적"이다.
      // 그래서 세 조건을 모두 요구한다:
      //   ① convergeMinMs 경과 — 버스트가 꺼질 시간을 준다
      //   ② 최근 2초 구간과 직전 2초 구간의 중앙값 차이가 작다 (개별 샘플은 원래 흔들린다)
      //   ③ 하락 추세가 아니다 — 최근 창이 직전 창보다 뚜렷이 낮으면 아직 떨어지는 중이다
      if (
        speedSamples.length >= CFG.minSamplesBeforeConverge &&
        t - start > CFG.convergeMinMs
      ) {
        const w = speedSamples.slice(-CFG.convergeWindow).map((s) => s.mbps);
        const m = median(w);
        const prev = speedSamples
          .slice(-CFG.convergeWindow * 2, -CFG.convergeWindow)
          .map((s) => s.mbps);
        const prevMed = median(prev);
        const falling = prevMed > 0 && m / prevMed < CFG.trendGuardRatio;
        // 개별 200ms 샘플이 아니라 2초 구간 중앙값끼리의 안정을 본다.
        // 실제 회선의 순간 속도는 TCP·청크 단위 때문에 샘플마다 5% 넘게 흔들리는 게 정상이다.
        // 샘플별 편차로 판정하던 시절에는 조기 종료가 거의 걸리지 않아 매번 15초 상한을 채웠다
        // (2026-09-11 실측: 두 번 연속 14.9초 / 흔들림 시뮬레이션 0·5·20%에서 전부 15초).
        const settled = prevMed > 0 && Math.abs(m - prevMed) / prevMed < CFG.convergeEpsilon;
        if (settled && !falling) finish();
      }
      if (t - start >= CFG.dlMaxDurationMs) finish();
    },
  });

  const streams = Array.from({ length: CFG.dlStreams }, () => runStream());
  try {
    await sampler.done;
  } finally {
    registry.abortAll();
    deps.clearInterval(loadedPinger);
    sampler.stop();
  }
  await Promise.allSettled(streams);
  registry.dispose();

  if (totalBytes === 0 && !options.signal?.aborted) {
    throw new Error("download failed: no successful samples");
  }

  // 최종값: 마지막 finalWindowMs 구간의 중앙값.
  //
  // 이전에는 "후반 60% 샘플"을 썼는데, 측정 전체가 초기 버스트 안에서 끝나면
  // 후반 60%도 전부 버스트라 과대값을 그대로 반환했다. 시간 기준으로 자르면
  // 측정이 길어질수록 초기 구간이 확실히 빠진다.
  const elapsed = deps.now() - start;
  const cutoff = elapsed - CFG.finalWindowMs;
  const tail = speedSamples.filter((s) => s.t >= cutoff).map((s) => s.mbps);
  // 측정이 finalWindowMs보다 짧게 끝난 경우(오류·중단)에는 후반 절반으로 물러선다.
  const stable = tail.length
    ? tail
    : speedSamples.slice(Math.floor(speedSamples.length * 0.5)).map((s) => s.mbps);
  return {
    mbps: Math.round(median(stable) * 10) / 10,
    bytes: totalBytes,
    durationMs: Math.round(deps.now() - start),
    loadedLatency: loadedRtts.length ? Math.round(median(loadedRtts)) : null,
  };
}
