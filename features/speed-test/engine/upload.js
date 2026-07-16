import { UP, CFG } from "../config";
import { median } from "./statistics";
import { resolveDeps, createAbortRegistry, runSampler } from "./transfer";

// ---------- 업로드 (FR-2) ----------
export async function measureUpload(onProgress, options = {}) {
  const deps = resolveDeps(options.deps);
  const registry = createAbortRegistry(options.signal);
  const start = deps.now();
  let totalBytes = 0;
  const speedSamples = [];
  const payload = new Uint8Array(CFG.ulChunkMax);
  crypto.getRandomValues(payload.subarray(0, 65536)); // 일부만 랜덤(성능)

  // 적응형 청크: 작게 시작 → 전송이 빠르면(0.5초 미만) 2배씩 확대
  async function runStream() {
    let size = CFG.ulChunkStart;
    while (!registry.aborted && deps.now() - start < CFG.ulMaxDurationMs) {
      const t0 = deps.now();
      const ctrl = registry.register();
      try {
        const res = await deps.fetch(UP + `?r=${deps.random()}`, {
          method: "POST",
          body: payload.subarray(0, size),
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (!res.ok) continue; // 서버가 거부한 청크는 누계에서 제외
        totalBytes += size;
        if (deps.now() - t0 < 500 && size < CFG.ulChunkMax)
          size = Math.min(CFG.ulChunkMax, size * 2);
      } catch {
        if (registry.aborted) break;
        // 개별 청크 실패는 무시하고 다음 반복에서 재시도
      } finally {
        registry.unregister(ctrl);
      }
    }
  }

  let lastBytes = 0;
  let lastT = start;
  const sampler = runSampler({
    intervalMs: CFG.sampleIntervalMs,
    deps,
    signal: options.signal,
    onTick: (finish) => {
      const t = deps.now();
      const dt = (t - lastT) / 1000;
      const mbps = ((totalBytes - lastBytes) * 8) / dt / 1e6;
      lastBytes = totalBytes;
      lastT = t;
      if (mbps > 0) speedSamples.push(mbps);
      if (onProgress && speedSamples.length) {
        onProgress({
          mbps: median(speedSamples.slice(-6)),
          elapsedMs: t - start,
        });
      }
      if (t - start >= CFG.ulMaxDurationMs) finish();
    },
  });

  const streams = Array.from({ length: CFG.ulStreams }, () => runStream());
  try {
    await sampler.done;
  } finally {
    registry.abortAll();
    sampler.stop();
  }
  await Promise.allSettled(streams);
  registry.dispose();

  const stable = speedSamples.slice(Math.floor(speedSamples.length * 0.3));
  return {
    mbps: Math.round(median(stable) * 10) / 10,
    durationMs: Math.round(deps.now() - start),
  };
}
