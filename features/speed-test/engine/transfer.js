/* 공통 전송 인프라 — 의존성 주입 기본값, abort 전파, 샘플러 수명 관리 */

// fetch·clock·timer를 주입 가능하게 하되 production 기본값은 브라우저 전역
export function resolveDeps(overrides = {}) {
  return {
    fetch: (...args) => globalThis.fetch(...args),
    now: () => performance.now(),
    setInterval: (...args) => globalThis.setInterval(...args),
    clearInterval: (...args) => globalThis.clearInterval(...args),
    random: () => Math.random(),
    ...overrides,
  };
}

// 부모 AbortSignal 하나로 스트림별 fetch controller를 일괄 중단
export function createAbortRegistry(signal) {
  const controllers = new Set();
  let aborted = Boolean(signal && signal.aborted);
  const abortAll = () => {
    aborted = true;
    for (const c of controllers) {
      try {
        c.abort();
      } catch {
        // 이미 중단된 controller는 무시
      }
    }
    controllers.clear();
  };
  if (signal) {
    if (signal.aborted) abortAll();
    else signal.addEventListener("abort", abortAll, { once: true });
  }
  return {
    get aborted() {
      return aborted;
    },
    register() {
      const ctrl = new AbortController();
      if (aborted) ctrl.abort();
      else controllers.add(ctrl);
      return ctrl;
    },
    unregister(ctrl) {
      controllers.delete(ctrl);
    },
    abortAll,
    dispose() {
      if (signal) signal.removeEventListener("abort", abortAll);
      controllers.clear();
    },
  };
}

// 주기 샘플러: onTick(finish)이 finish()를 호출하거나 signal이 중단될 때까지 반복.
// 어떤 경로로 끝나든 interval은 정확히 한 번 정리된다.
export function runSampler({ intervalMs, onTick, deps, signal }) {
  let iv = null;
  let settled = false;
  let resolveDone;
  const done = new Promise((resolve) => {
    resolveDone = resolve;
  });
  const finish = () => {
    if (settled) return;
    settled = true;
    if (iv != null) deps.clearInterval(iv);
    if (signal) signal.removeEventListener("abort", finish);
    resolveDone();
  };
  if (signal && signal.aborted) {
    finish();
    return { done, stop: finish };
  }
  if (signal) signal.addEventListener("abort", finish, { once: true });
  iv = deps.setInterval(() => onTick(finish), intervalMs);
  return { done, stop: finish };
}
