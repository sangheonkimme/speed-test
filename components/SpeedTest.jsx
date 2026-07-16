"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  measurePing,
  measureDownload,
  measureUpload,
  detectEnvironment,
} from "@/features/speed-test/engine";
import {
  verdict,
  grade,
  usages,
} from "@/features/speed-test/domain/assessment";
import { commerce } from "@/features/speed-test/domain/recommendations";
import { fmtSpeed } from "@/features/speed-test/domain/format";
import { track } from "@/features/speed-test/analytics";
import { PARTNER_URL } from "@/features/speed-test/config";

const RING_C = 779.11;

const TONE = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" };

function Icon({ name }) {
  switch (name) {
    case "ok":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" />
          <path
            d="m8 12.5 2.6 2.6L16 9.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warn":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" />
          <path
            d="M12 7.5v5.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="16.3" r="1.15" fill="currentColor" />
        </svg>
      );
    case "bad":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" />
          <path
            d="m9 9 6 6M15 9l-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "wifi":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M2.5 9.2a14 14 0 0 1 19 0M5.5 12.6a9.5 9.5 0 0 1 13 0M8.6 15.9a5 5 0 0 1 6.8 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
      );
    case "fire":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c1 3-3 4.5-3 8a3.5 3.5 0 0 0 7 .2c1.6 1.2 2.5 2.9 2.5 4.3A6.5 6.5 0 0 1 12 21a6.5 6.5 0 0 1-6.5-5.5C5.5 10.5 10.5 8.5 12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function SpeedTest() {
  const [phase, setPhase] = useState("measuring"); // measuring | done | error
  const [bigNum, setBigNum] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phaseCap, setPhaseCap] = useState(
    "국내 서버(서울) · 다중 스트림 측정",
  );
  const [subsVisible, setSubsVisible] = useState(false);
  const [pingVal, setPingVal] = useState(null);
  const [jitterVal, setJitterVal] = useState(null);
  const [upLive, setUpLive] = useState(null);
  const [env, setEnv] = useState(null);
  const [result, setResult] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [ctaVariant, setCtaVariant] = useState("strong");

  const runningRef = useRef(false);
  const envRef = useRef(null);
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const run = useCallback(async () => {
    if (runningRef.current) {
      toast("아직 측정을 마무리하는 중이에요");
      return;
    }
    runningRef.current = true;

    setPhase("measuring");
    setResult(null);
    setBigNum(0);
    setProgress(0);
    setSubsVisible(false);
    setPingVal(null);
    setJitterVal(null);
    setUpLive(null);

    track("test_started", {
      device: envRef.current?.device,
      conn: envRef.current?.connType,
    });
    const t0 = performance.now();

    // 환경 감지 (병렬, FR-4)
    detectEnvironment().then((e) => {
      envRef.current = e;
      setEnv(e);
    });

    try {
      // 핑(병렬 버스트) + 다운로드 동시 시작 — 접속 즉시 수치 표시 (fast.com 방식)
      setPhaseCap("국내 서버 · 다중 스트림 측정");
      const pingPromise = measurePing(5)
        .then((p) => {
          setPingVal(p.ping);
          setJitterVal(p.jitter);
          setSubsVisible(true);
          return p;
        })
        .catch(() => ({ ping: 0, jitter: 0 }));

      const dl = await measureDownload(({ mbps, elapsedMs }) => {
        setBigNum(mbps);
        // 속도감 있는 진행률: 지수 ease-out — 3초 ~66%, 5초 ~84%, 7초 ~92%, 완료 시 100%
        const frac = Math.min(0.97, 1 - Math.exp(-elapsedMs / 2800));
        setProgress(frac * 100);
      });
      setBigNum(dl.mbps);
      const pingRes = await pingPromise;

      // 다운로드 완료 = 결과 화면 즉시 표시
      const r = {
        down: dl.mbps,
        up: null,
        ping: pingRes.ping,
        jitter: pingRes.jitter,
        loadedLatency: dl.loadedLatency,
      };
      setResult(r);
      setProgress(100);
      setPhase("done");

      // 3) 업로드 — 백그라운드 측정 후 채워넣기
      const ul = await measureUpload(({ mbps }) => setUpLive(mbps));
      setResult((prev) => (prev ? { ...prev, up: ul.mbps } : prev));
      track("test_completed", {
        down: r.down,
        up: ul.mbps,
        ping: r.ping,
        jitter: r.jitter,
        isp: envRef.current?.isp,
        region: envRef.current?.region,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e) {
      setPhaseCap("측정에 실패했어요 — 네트워크 연결을 확인해 주세요");
      track("test_abandoned", {
        atSec: Math.round((performance.now() - t0) / 1000),
        error: String(e),
      });
    } finally {
      runningRef.current = false;
    }
  }, [toast]);

  // 자동 시작 (FR-1) — StrictMode 이중 실행 가드는 runningRef가 담당
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cta") === "weak") setCtaVariant("weak");
    run();
    return () => clearTimeout(toastTimer.current);
  }, [run]);

  // ---------- 파생값 ----------
  const done = phase === "done" && result;
  const v = done ? verdict(result.down, env?.device === "모바일") : null;
  const [gradeT, gradeS] = done ? grade(result.down) : ["", ""];
  const ringColor = done && v ? v.color : "var(--primary)";
  const envText = env
    ? [env.isp, env.region, env.connType].filter(Boolean).join(" · ")
    : "환경 확인 중…";
  const ispName = env?.isp || "내 통신사";
  const cm = done ? commerce(v, result, env) : [];
  const hero = fmtSpeed(done ? result.down : bigNum);
  const showCTA = done && v && v.text !== "정상";

  useEffect(() => {
    if (showCTA)
      track("verdict_shown", { verdict: v.text, variant: ctaVariant });
    if (done) track("ad_impression", { slot: "result_bottom" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // ---------- 액션 ----------
  const ctaClick = () => {
    track("compare_cta_click", { verdict: v?.text, variant: ctaVariant });
    if (!PARTNER_URL) {
      toast("제휴 대리점 연결 준비 중이에요");
      return;
    }
    const u = new URL(PARTNER_URL);
    u.searchParams.set("region", env?.region || "");
    u.searchParams.set("isp", env?.isp || "");
    u.searchParams.set("mbps", result ? Math.round(result.down) : "");
    window.open(u.toString(), "_blank", "noopener");
  };

  const share = async (channel) => {
    if (!result) return;
    const f = fmtSpeed(result.down);
    const text = `내 인터넷 속도: ${f.v}${f.u} (${[env?.region, env?.isp].filter(Boolean).join(" · ")}) — 스피드체크에서 바로 측정했어요`;
    track("result_shared", { channel });
    if (channel === "native" && navigator.share) {
      try {
        await navigator.share({
          title: "스피드체크",
          text,
          url: location.origin,
        });
        return;
      } catch (e) {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${location.origin}`);
      toast("결과가 복사됐어요 — 붙여넣어 공유하세요");
    } catch (e) {
      toast("복사에 실패했어요");
    }
  };

  return (
    <div className="page">
      <header className="hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div className="logo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff" />
            </svg>
          </div>
          <span className="brand">스피드체크</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="env">
          <span className="dot" />
          <span>{envText}</span>
        </div>
      </header>

      <div className="wrap">
        <h1 className="sr-only">
          인터넷 속도 측정 — 무료·무가입·무설치 스피드테스트
        </h1>

        {/* HERO */}
        <div className="hero">
          <div className="gauge">
            <svg viewBox="0 0 280 280" aria-hidden="true">
              <circle
                cx="140"
                cy="140"
                r="124"
                fill="none"
                stroke="var(--fill-10)"
                strokeWidth="15"
              />
              <circle
                className="ring-fg"
                cx="140"
                cy="140"
                r="124"
                fill="none"
                stroke={ringColor}
                strokeWidth="15"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - Math.min(100, progress) / 100)}
                transform="rotate(-90 140 140)"
              />
            </svg>
            <div className="center">
              <div className="num" aria-live="polite">
                {hero.v}
              </div>
              <div className="unit">{hero.u} · 다운로드</div>
            </div>
          </div>

          <div className="status">
            {!done ? (
              <div>
                <div className="measuring-line">
                  측정 중
                  <span className="dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="pbar">
                  <div
                    style={{ width: `${Math.min(100, progress).toFixed(0)}%` }}
                  />
                </div>
                <div className="pcap">{phaseCap}</div>
              </div>
            ) : (
              <div>
                <div className="grade-t">{gradeT}</div>
                <div className="grade-s">{gradeS}</div>
                <button
                  className="btn btn-md btn-outline-assist restart"
                  onClick={run}
                >
                  다시 측정하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SUB METRICS */}
        {subsVisible && (
          <div className="subs">
            <div className="sub">
              <div className="k">업로드</div>
              <div className="v">
                {(() => {
                  const u = done && result.up != null ? result.up : upLive;
                  if (u == null)
                    return (
                      <>
                        … <small>Mbps</small>
                      </>
                    );
                  const f = fmtSpeed(u);
                  return (
                    <>
                      {f.v} <small>{f.u}</small>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="sub">
              <div className="k">지연(핑)</div>
              <div className="v">
                {pingVal != null ? Math.round(pingVal) : "–"} <small>ms</small>
              </div>
            </div>
            <div className="sub">
              <div className="k">지터</div>
              <div className="v">
                {jitterVal != null ? jitterVal.toFixed(1) : "–"}{" "}
                <small>ms</small>
              </div>
            </div>
          </div>
        )}

        {/* AD SLOT 1: 측정 중 하단 (FR-12, 지연 로드) */}
        {!done && (
          <div className="ad-wrap ad-measuring">
            <div className="ad">
              <span className="tag">광고</span>
              <span className="ph">
                광고 영역 · 측정 스트림 우선(지연 로드)
              </span>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {done && (
          <>
            <div className="results">
              <div className="col-main">
                <section className="card" style={{ paddingBottom: 8 }}>
                  <h2>용도별 적합도</h2>
                  <div className="sub-t">지금 속도로 무엇까지 쾌적할까요?</div>
                  {usages(result.down, result.ping, result.jitter).map((u) => (
                    <div className="usage-row" key={u.name}>
                      <span className="ic" style={{ color: TONE[u.tone] }}>
                        <Icon name={u.tone} />
                      </span>
                      <span className="n">{u.name}</span>
                      <span className="lv" style={{ color: TONE[u.tone] }}>
                        {u.level}
                      </span>
                    </div>
                  ))}
                </section>

                {/* 전환 CTA (FR-9: 느림 이하일 때만) */}
                {showCTA && ctaVariant === "strong" && (
                  <section className="cta-strong">
                    <div className="eyebrow">측정 결과 기반 추천</div>
                    <div className="t">이 요금제면 최대 2배 빨라져요</div>
                    <div className="d">
                      방금 측정한 속도 기준 추천이에요. 지금 개통 시 현금
                      사은품을 비교해 보세요.
                    </div>
                    <button
                      className="btn btn-lg btn-solid-white btn-full"
                      onClick={ctaClick}
                    >
                      현금 사은품 비교하기
                    </button>
                    <div className="legal">
                      측정 지역·현재 통신사·속도가 제휴 대리점에 전달돼요 · 광고
                    </div>
                  </section>
                )}
                {showCTA && ctaVariant === "weak" && (
                  <section className="cta-weak">
                    <div className="grow">
                      <div className="t">더 빠른 요금제가 궁금하다면</div>
                      <div className="d">
                        {env?.region || "내 지역"} 기준 현금 사은품 비교 · 광고
                      </div>
                    </div>
                    <button
                      className="btn btn-md btn-outline-primary"
                      onClick={ctaClick}
                    >
                      비교하기
                    </button>
                  </section>
                )}
              </div>

              <div className="col-rail">
                {/* 공유 카드 (FR-8) */}
                <section className="card" style={{ padding: 20 }}>
                  <div className="share-card">
                    <div className="loc">
                      {[env?.region, ispName].filter(Boolean).join(" · ")}
                    </div>
                    <div className="n">
                      {fmtSpeed(result.down).v}
                      <small> {fmtSpeed(result.down).u}</small>
                    </div>
                    <div className="rank">{gradeT}</div>
                  </div>
                  <div className="share-btns">
                    <div className="grow">
                      <button
                        className="btn btn-md btn-solid-primary btn-full"
                        onClick={() => share("native")}
                      >
                        결과 공유
                      </button>
                    </div>
                    <button
                      className="btn btn-md btn-outline-assist"
                      onClick={() => share("url")}
                    >
                      URL
                    </button>
                  </div>
                </section>

                {/* 커머스 추천 (FR-13) */}
                {cm.length > 0 && (
                  <section className="card" style={{ padding: 20 }}>
                    <h2 style={{ fontSize: 15, marginBottom: 2 }}>
                      측정 결과 맞춤 추천
                    </h2>
                    <div
                      className="sub-t"
                      style={{ fontSize: 12.5, marginBottom: 14 }}
                    >
                      문제 진단에 근거한 제품이에요
                    </div>
                    <div className="cmr">
                      {cm.map((c) => (
                        <button
                          className="cm"
                          key={c.id}
                          onClick={() => {
                            track("commerce_click", { type: c.id });
                            toast("제휴 준비 중이에요");
                          }}
                        >
                          <div className="ic">
                            <Icon name={c.icon} />
                          </div>
                          <div className="b">
                            <div className="tag">{c.tag}</div>
                            <div className="t">{c.title}</div>
                            <div className="d">{c.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* AD SLOT 2: 결과 최하단 (FR-12) */}
            <div className="ad-wrap ad-bottom">
              <div className="ad">
                <span className="tag">광고</span>
                <span className="ph">광고 영역</span>
              </div>
            </div>

            <div className="foot">
              측정은 언제나 무료·무가입·무설치예요 · 개인정보는 수집하지 않아요
              <br />
              <a href="#" onClick={(e) => e.preventDefault()}>
                측정 방법론
              </a>{" "}
              ·{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                개인정보 처리방침
              </a>{" "}
              ·{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                제휴 링크 고지
              </a>
            </div>
          </>
        )}
      </div>

      <div className={`toast${toastMsg ? " on" : ""}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
