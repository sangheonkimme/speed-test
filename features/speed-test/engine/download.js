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
      if (speedSamples.length >= CFG.minSamplesBeforeConverge) {
        const w = speedSamples.slice(-CFG.convergeWindow).map((s) => s.mbps);
        const m = median(w);
        const maxDev = Math.max(...w.map((v) => Math.abs(v - m) / (m || 1)));
        if (maxDev < CFG.convergeEpsilon && t - start > 3000) finish();
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

  // 최종값: 안정 구간(후반 60%) 샘플 중앙값
  const stable = speedSamples
    .slice(Math.floor(speedSamples.length * 0.4))
    .map((s) => s.mbps);
  return {
    mbps: Math.round(median(stable) * 10) / 10,
    bytes: totalBytes,
    durationMs: Math.round(deps.now() - start),
    loadedLatency: loadedRtts.length ? Math.round(median(loadedRtts)) : null,
  };
}
