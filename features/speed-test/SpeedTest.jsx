"use client";

import { useEffect, useState } from "react";
import { track } from "./analytics";
import { PARTNER_URL } from "./config";
import { grade, verdict } from "./domain/assessment";
import { fmtSpeed } from "./domain/format";
import { commerce } from "./domain/recommendations";
import { useSpeedTest } from "./hooks/useSpeedTest";
import { useToast } from "./hooks/useToast";
import { AdSlot } from "./components/AdSlot";
import { MetricsPanel } from "./components/MetricsPanel";
import { ResultPanel } from "./components/ResultPanel";
import { SpeedGauge } from "./components/SpeedGauge";
import { TestStatus } from "./components/TestStatus";

export default function SpeedTest() {
  const test = useSpeedTest();
  const { toastMsg, toast } = useToast();
  const [ctaVariant, setCtaVariant] = useState("strong");
  const done = test.phase === "done" && test.result;
  const assessment = done ? verdict(test.result.down, test.env?.device === "모바일") : null;
  const [gradeTitle, gradeSubtitle] = done ? grade(test.result.down) : ["", ""];
  const hero = fmtSpeed(done ? test.result.down : test.bigNum);
  const showCta = Boolean(done && assessment?.text !== "정상");
  const recommendations = done ? commerce(assessment, test.result, test.env) : [];
  const envText = test.env
    ? [test.env.isp, test.env.region, test.env.connType].filter(Boolean).join(" · ")
    : "환경 확인 중…";

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("cta") === "weak") setCtaVariant("weak");
  }, []);

  useEffect(() => {
    if (!done) return;
    if (showCta) track("verdict_shown", { verdict: assessment.text, variant: ctaVariant });
    track("ad_impression", { slot: "result_bottom" });
  }, [done, showCta, assessment?.text, ctaVariant]);

  const handleCta = () => {
    track("compare_cta_click", { verdict: assessment?.text, variant: ctaVariant });
    if (!PARTNER_URL) return toast("제휴 대리점 연결 준비 중이에요");
    const url = new URL(PARTNER_URL);
    url.searchParams.set("region", test.env?.region || "");
    url.searchParams.set("isp", test.env?.isp || "");
    url.searchParams.set("mbps", Math.round(test.result.down));
    window.open(url.toString(), "_blank", "noopener");
  };

  const handleShare = async (channel) => {
    if (!test.result) return;
    const speed = fmtSpeed(test.result.down);
    const text = `내 인터넷 속도: ${speed.v}${speed.u} (${[test.env?.region, test.env?.isp].filter(Boolean).join(" · ")}) — 스피드체크에서 바로 측정했어요`;
    track("result_shared", { channel });
    if (channel === "native" && navigator.share) {
      try {
        await navigator.share({ title: "스피드체크", text, url: location.origin });
        return;
      } catch {
        // 공유 취소/실패 시 clipboard fallback을 시도한다.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${location.origin}`);
      toast("결과가 복사됐어요 — 붙여넣어 공유하세요");
    } catch {
      toast("복사에 실패했어요");
    }
  };

  const handleRecommendation = (type) => {
    track("commerce_click", { type });
    toast("제휴 준비 중이에요");
  };

  return (
    <div className="page">
      <header className="hdr">
        <div className="brand-group"><div className="logo"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff" /></svg></div><span className="brand">스피드체크</span></div>
        <div className="header-spacer" />
        <div className="env"><span className="dot" /><span>{envText}</span></div>
      </header>
      <main className="wrap">
        <h1 className="sr-only">인터넷 속도 측정 — 무료·무가입·무설치 스피드테스트</h1>
        <div className="hero">
          <SpeedGauge speed={hero} progress={test.progress} ringColor={done ? assessment.color : "var(--primary)"} />
          <TestStatus phase={test.phase} done={done} progress={test.progress} phaseCap={test.phaseCap} gradeTitle={gradeTitle} gradeSubtitle={gradeSubtitle} onRestart={test.start} />
        </div>
        {test.subsVisible && <MetricsPanel upload={done && test.result.up != null ? test.result.up : test.upLive} ping={test.pingVal} jitter={test.jitterVal} />}
        {!done && test.phase !== "error" && <AdSlot placement="measuring" />}
        {done && <ResultPanel result={test.result} env={test.env} gradeTitle={gradeTitle} recommendations={recommendations} ctaVariant={ctaVariant} showCta={showCta} onCtaClick={handleCta} onShare={handleShare} onRecommendation={handleRecommendation} />}
      </main>
      <div className={`toast${toastMsg ? " on" : ""}`} role="status">{toastMsg}</div>
    </div>
  );
}
