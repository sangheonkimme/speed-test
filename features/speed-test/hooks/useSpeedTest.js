"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import * as defaultEngine from "../engine";
import { track } from "../analytics";

// phase: idle | measuring | done | error
export const initialState = {
  phase: "idle",
  bigNum: 0,
  progress: 0,
  phaseCap: "국내 서버(서울) · 다중 스트림 측정",
  subsVisible: false,
  pingVal: null,
  jitterVal: null,
  upLive: null,
  env: null,
  result: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return {
        ...initialState,
        phase: "measuring",
        phaseCap: "국내 서버 · 다중 스트림 측정",
        env: state.env, // 환경 정보는 재측정 사이에도 유지
      };
    case "ENV_DONE":
      return { ...state, env: action.env };
    case "PING_DONE":
      return {
        ...state,
        pingVal: action.ping,
        jitterVal: action.jitter,
        subsVisible: true,
      };
    case "DOWNLOAD_PROGRESS":
      return { ...state, bigNum: action.mbps, progress: action.progress };
    case "DOWNLOAD_DONE":
      return {
        ...state,
        phase: "done",
        bigNum: action.result.down,
        progress: 100,
        result: action.result,
      };
    case "UPLOAD_PROGRESS":
      return { ...state, upLive: action.mbps };
    case "UPLOAD_DONE":
      return {
        ...state,
        result: state.result ? { ...state.result, up: action.mbps } : state.result,
      };
    case "FAIL":
      return {
        ...state,
        phase: "error",
        phaseCap: "측정에 실패했어요 — 네트워크 연결을 확인해 주세요",
      };
    default:
      return state;
  }
}

// 측정 상태 머신 + orchestration. UI는 반환된 state/start만 사용한다.
// engine 주입은 테스트용이며 production에서는 기본 엔진을 쓴다.
export function useSpeedTest({ engine = defaultEngine, autoStart = true } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const engineRef = useRef(engine); // 렌더마다 새 객체가 와도 start를 안정적으로 유지
  const runIdRef = useRef(0);
  const abortRef = useRef(null);
  const envRef = useRef(null);

  const start = useCallback(async () => {
    const eng = engineRef.current;
    // 이전 run 무효화: run id 교체 + abort — 늦은 콜백이 상태를 덮어쓰지 못한다
    const runId = ++runIdRef.current;
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const live = () => runIdRef.current === runId && !ac.signal.aborted;
    const safeDispatch = (action) => {
      if (live()) dispatch(action);
    };

    safeDispatch({ type: "START" });
    track("test_started", {
      device: envRef.current?.device,
      conn: envRef.current?.connType,
    });
    const t0 = performance.now();

    // 환경 감지 (병렬, FR-4)
    eng
      .detectEnvironment({ signal: ac.signal })
      .then((e) => {
        if (!live()) return;
        envRef.current = e;
        safeDispatch({ type: "ENV_DONE", env: e });
      })
      .catch(() => {
        // 환경 정보는 부가 정보 — 실패해도 측정은 계속
      });

    try {
      // 핑(병렬 버스트) + 다운로드 동시 시작 — 접속 즉시 수치 표시 (fast.com 방식)
      const pingPromise = eng
        .measurePing(5, undefined, { signal: ac.signal })
        .then((p) => {
          safeDispatch({ type: "PING_DONE", ping: p.ping, jitter: p.jitter });
          return p;
        })
        .catch(() => ({ ping: 0, jitter: 0 }));

      const dl = await eng.measureDownload(
        ({ mbps, elapsedMs }) => {
          // 속도감 있는 진행률: 지수 ease-out — 3초 ~66%, 5초 ~84%, 7초 ~92%, 완료 시 100%
          const frac = Math.min(0.97, 1 - Math.exp(-elapsedMs / 2800));
          safeDispatch({ type: "DOWNLOAD_PROGRESS", mbps, progress: frac * 100 });
        },
        null,
        { signal: ac.signal },
      );
      const pingRes = await pingPromise;
      if (!live()) return;

      // 다운로드 완료 = 결과 화면 즉시 표시
      const r = {
        down: dl.mbps,
        up: null,
        ping: pingRes.ping,
        jitter: pingRes.jitter,
        loadedLatency: dl.loadedLatency,
      };
      safeDispatch({ type: "DOWNLOAD_DONE", result: r });

      // 업로드 — 백그라운드 측정 후 채워넣기
      const ul = await eng.measureUpload(
        ({ mbps }) => safeDispatch({ type: "UPLOAD_PROGRESS", mbps }),
        { signal: ac.signal },
      );
      if (!live()) return;
      safeDispatch({ type: "UPLOAD_DONE", mbps: ul.mbps });
      track("test_completed", {
        down: r.down,
        up: ul.mbps,
        ping: r.ping,
        jitter: r.jitter,
        isp: envRef.current?.isp,
        region: envRef.current?.region,
        locationSource: envRef.current?.locationSource,
        locationAccuracy: envRef.current?.locationAccuracy,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e) {
      if (!live()) return; // 취소는 실패가 아니다
      safeDispatch({ type: "FAIL" });
      track("test_abandoned", {
        atSec: Math.round((performance.now() - t0) / 1000),
        error: String(e),
      });
    }
  }, []);

  // 이후의 모든 상태 갱신을 무효화하고 진행 중 측정을 중단
  const invalidate = useCallback(() => {
    runIdRef.current++;
    if (abortRef.current) abortRef.current.abort();
  }, []);

  // 자동 시작 (FR-1) — StrictMode 재마운트 시 이전 run은 cleanup에서 중단된다
  useEffect(() => {
    if (autoStart) start();
    return invalidate;
    // autoStart는 마운트 시점 옵션 — 이후 변경은 의도적으로 무시
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, invalidate]);

  return { ...state, start };
}
