import { DOWN, CFG } from "../config";
import { median, consecutiveJitter } from "./statistics";
import { resolveDeps } from "./transfer";

// ---------- 핑 / 지터 (FR-2) ----------
//
// ⚠️ 순차 측정이다. 이전에는 5발을 동시에 쐈는데(병렬 버스트), 요청들이 서로 큐를
// 만들어 RTT가 벌어지고 그 왜곡이 그대로 지터로 잡혔다. 지터가 핑보다 큰 값이
// 나오던 원인이다. 병렬로 되돌리지 말 것 — consecutiveJitter도 순서를 전제한다.
//
// 느린 회선에서는 순차 측정이 오래 걸리므로 총 예산(pingBudgetMs)을 둔다.
// 예산을 넘겨도 최소 pingMinSamples는 확보하고, 그 뒤로는 남은 샘플을 포기한다.
export async function measurePing(count = CFG.pingCount, onSample, options = {}) {
  const deps = resolveDeps(options.deps);
  const { signal } = options;
  const rtts = [];
  const started = deps.now();

  for (let i = 0; i < count; i++) {
    if (signal && signal.aborted) break;
    // 최소 표본을 채웠고 예산을 넘겼으면 다운로드 시작을 더 늦추지 않는다
    if (rtts.length >= CFG.pingMinSamples && deps.now() - started > CFG.pingBudgetMs) break;

    const t0 = deps.now();
    try {
      const res = await deps.fetch(DOWN(0) + `&r=${deps.random()}`, {
        cache: "no-store",
        signal,
      });
      if (!res.ok) continue; // 서버 오류 응답은 유효 샘플이 아니다
      const rtt = deps.now() - t0;
      rtts.push(rtt);
      if (onSample) onSample({ rtt, idx: i, total: count });
    } catch {
      // 개별 실패(네트워크·중단)는 버리고 남은 샘플로 계산한다
    }
  }

  if (signal && signal.aborted)
    throw new DOMException("ping aborted", "AbortError");
  if (!rtts.length) throw new Error("ping failed");

  return {
    ping: Math.round(median(rtts)),
    jitter: Math.round(consecutiveJitter(rtts) * 10) / 10,
    samples: rtts,
  };
}
