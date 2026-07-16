/* ============================================================
 * SpeedCheck 측정 엔진 (FR-1 ~ FR-4) — ES Module
 * - 브라우저 기반 HTTPS 멀티스트림 측정 (설치·가입 없음)
 * - 엔드포인트: Cloudflare Speed (Anycast, 서울 PoP)
 * - 자동 시작, 첫 추정치 3초 내, 상한 15초, 수렴 시 조기 종료
 * ============================================================ */

const BASE = "https://speed.cloudflare.com";
const DOWN = (bytes) => `${BASE}/__down?bytes=${bytes}`;
const UP = `${BASE}/__up`;

// 측정 파라미터
const CFG = {
  dlMaxDurationMs: 15000, // FR-3: 다운로드 상한 15초
  dlStreams: 5, // 병렬 스트림 수
  dlChunkSizes: [1e5, 1e6, 1e7, 2.5e7, 5e7], // 점진적 확대
  ulMaxDurationMs: 8000,
  ulStreams: 3,
  ulChunkStart: 131072, // 128KB 시작 — 느린 회선에서도 샘플 확보
  ulChunkMax: 8e6, // 빠른 회선은 8MB까지 적응형 확대
  pingCount: 5,
  convergeWindow: 4, // 최근 N개 샘플로 수렴 판단
  convergeEpsilon: 0.05, // 5% 이내 변동이면 수렴
  minSamplesBeforeConverge: 6,
  sampleIntervalMs: 200,
};

// ---------- 유틸 ----------
const now = () => performance.now();

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function meanDeviation(arr) {
  if (arr.length < 2) return 0;
  const med = median(arr);
  return arr.reduce((acc, v) => acc + Math.abs(v - med), 0) / arr.length;
}

// ---------- 핑 / 지터 (FR-2) ----------
// 병렬 버스트: 측정 시작 순간(다운로드 포화 전)에 동시 발사 — 대기 시간 최소화
export async function measurePing(count = CFG.pingCount, onSample) {
  const tasks = Array.from({ length: count }, async (_, i) => {
    const t0 = now();
    try {
      await fetch(DOWN(0) + `&r=${Math.random()}`, { cache: "no-store" });
      const rtt = now() - t0;
      if (onSample) onSample({ rtt, idx: i, total: count });
      return rtt;
    } catch (e) {
      return null; /* 개별 실패 무시 */
    }
  });
  const rtts = (await Promise.all(tasks)).filter((v) => v != null);
  if (!rtts.length) throw new Error("ping failed");
  return {
    ping: Math.round(median(rtts)),
    jitter: Math.round(meanDeviation(rtts) * 10) / 10,
    samples: rtts,
  };
}

// ---------- 다운로드 (FR-1, FR-3) ----------
// 병렬 스트림 + 점진적 파일 크기 확대. onProgress로 실시간 Mbps 전달.
export async function measureDownload(onProgress, onLoadedLatency) {
  const start = now();
  let totalBytes = 0;
  let aborted = false;
  const controllers = [];
  const speedSamples = []; // {t, mbps}

  // 로드 상태 지연(loaded latency): 다운로드 중 주기적 핑
  const loadedRtts = [];
  const loadedPinger = setInterval(async () => {
    if (aborted) return;
    const t0 = now();
    try {
      await fetch(DOWN(0) + `&r=${Math.random()}`, { cache: "no-store" });
      loadedRtts.push(now() - t0);
      if (onLoadedLatency) onLoadedLatency(Math.round(median(loadedRtts)));
    } catch (e) {}
  }, 1500);

  // 스트림 1개: 점진적으로 큰 청크를 계속 받음
  async function runStream() {
    let sizeIdx = 0;
    while (!aborted && now() - start < CFG.dlMaxDurationMs) {
      const size =
        CFG.dlChunkSizes[Math.min(sizeIdx, CFG.dlChunkSizes.length - 1)];
      sizeIdx++;
      const ctrl = new AbortController();
      controllers.push(ctrl);
      try {
        const res = await fetch(DOWN(size) + `&r=${Math.random()}`, {
          cache: "no-store",
          signal: ctrl.signal,
        });
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
          if (aborted) {
            ctrl.abort();
            break;
          }
        }
      } catch (e) {
        if (aborted) break;
      }
    }
  }

  // 샘플러: 200ms마다 현재 속도 계산, 수렴 판단
  const samplerDone = new Promise((resolve) => {
    let lastBytes = 0,
      lastT = start;
    const iv = setInterval(() => {
      const t = now();
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

      const finish = () => {
        clearInterval(iv);
        resolve();
      };

      // 수렴 → 조기 종료 (FR-3)
      if (speedSamples.length >= CFG.minSamplesBeforeConverge) {
        const w = speedSamples.slice(-CFG.convergeWindow).map((s) => s.mbps);
        const m = median(w);
        const maxDev = Math.max(...w.map((v) => Math.abs(v - m) / (m || 1)));
        if (maxDev < CFG.convergeEpsilon && t - start > 3000) finish();
      }
      if (t - start >= CFG.dlMaxDurationMs) finish();
    }, CFG.sampleIntervalMs);
  });

  const streams = Array.from({ length: CFG.dlStreams }, () => runStream());
  await samplerDone;
  aborted = true;
  controllers.forEach((c) => {
    try {
      c.abort();
    } catch (e) {}
  });
  clearInterval(loadedPinger);
  await Promise.allSettled(streams);

  // 최종값: 안정 구간(후반 60%) 샘플 중앙값
  const stable = speedSamples
    .slice(Math.floor(speedSamples.length * 0.4))
    .map((s) => s.mbps);
  return {
    mbps: Math.round(median(stable) * 10) / 10,
    bytes: totalBytes,
    durationMs: Math.round(now() - start),
    loadedLatency: loadedRtts.length ? Math.round(median(loadedRtts)) : null,
  };
}

// ---------- 업로드 (FR-2) ----------
export async function measureUpload(onProgress) {
  const start = now();
  let totalBytes = 0;
  let aborted = false;
  const speedSamples = [];
  const payload = new Uint8Array(CFG.ulChunkMax);
  crypto.getRandomValues(payload.subarray(0, 65536)); // 일부만 랜덤(성능)

  // 적응형 청크: 작게 시작 → 전송이 빠르면(0.5초 미만) 2배씩 확대
  async function runStream() {
    let size = CFG.ulChunkStart;
    while (!aborted && now() - start < CFG.ulMaxDurationMs) {
      const t0 = now();
      try {
        await fetch(UP + `?r=${Math.random()}`, {
          method: "POST",
          body: payload.subarray(0, size),
          cache: "no-store",
        });
        totalBytes += size;
        if (now() - t0 < 500 && size < CFG.ulChunkMax)
          size = Math.min(CFG.ulChunkMax, size * 2);
      } catch (e) {
        if (aborted) break;
      }
    }
  }

  const samplerDone = new Promise((resolve) => {
    let lastBytes = 0,
      lastT = start;
    const iv = setInterval(() => {
      const t = now();
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
      if (t - start >= CFG.ulMaxDurationMs) {
        clearInterval(iv);
        resolve();
      }
    }, CFG.sampleIntervalMs);
  });

  const streams = Array.from({ length: CFG.ulStreams }, () => runStream());
  await samplerDone;
  aborted = true;
  await Promise.allSettled(streams);

  const stable = speedSamples.slice(Math.floor(speedSamples.length * 0.3));
  return {
    mbps: Math.round(median(stable) * 10) / 10,
    durationMs: Math.round(now() - start),
  };
}

// ---------- 환경 감지 (FR-4) ----------
export async function detectEnvironment() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let connType;
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn && conn.type) {
    connType =
      { wifi: "WiFi", cellular: "셀룰러", ethernet: "유선" }[conn.type] ||
      conn.type;
  } else {
    connType = isMobile ? "WiFi/셀룰러" : "WiFi/유선";
  }

  // IP 기반 ISP·지역 (시·군·구 수준, 정밀 위치 수집 안 함)
  let isp = null,
    region = null;
  try {
    const meta = await fetch(`${BASE}/meta`).then((r) => r.json());
    region = [meta.region, meta.city].filter(Boolean).join(" ");
    const org = (meta.asOrganization || "").toLowerCase();
    if (
      org.includes("korea telecom") ||
      org.includes("kt ") ||
      org === "kt" ||
      org.includes("kt corporation")
    )
      isp = "KT";
    else if (
      org.includes("sk broadband") ||
      org.includes("skb") ||
      org.includes("sk telecom")
    )
      isp = "SK브로드밴드";
    else if (
      org.includes("lg") ||
      org.includes("powercomm") ||
      org.includes("dacom")
    )
      isp = "LG유플러스";
    else isp = meta.asOrganization || "기타";
  } catch (e) {}

  return { device: isMobile ? "모바일" : "PC", connType, isp, region };
}
