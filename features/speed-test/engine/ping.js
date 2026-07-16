import { DOWN, CFG } from "../config";
import { median, meanDeviation } from "./statistics";
import { resolveDeps } from "./transfer";

// ---------- 핑 / 지터 (FR-2) ----------
// 병렬 버스트: 측정 시작 순간(다운로드 포화 전)에 동시 발사 — 대기 시간 최소화
export async function measurePing(count = CFG.pingCount, onSample, options = {}) {
  const deps = resolveDeps(options.deps);
  const { signal } = options;
  const tasks = Array.from({ length: count }, async (_, i) => {
    const t0 = deps.now();
    try {
      const res = await deps.fetch(DOWN(0) + `&r=${deps.random()}`, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) return null; // 서버 오류 응답은 유효 샘플이 아님
      const rtt = deps.now() - t0;
      if (onSample) onSample({ rtt, idx: i, total: count });
      return rtt;
    } catch {
      return null; // 개별 실패(네트워크·중단)는 무시하고 남은 샘플로 계산
    }
  });
  const rtts = (await Promise.all(tasks)).filter((v) => v != null);
  if (signal && signal.aborted)
    throw new DOMException("ping aborted", "AbortError");
  if (!rtts.length) throw new Error("ping failed");
  return {
    ping: Math.round(median(rtts)),
    jitter: Math.round(meanDeviation(rtts) * 10) / 10,
    samples: rtts,
  };
}
