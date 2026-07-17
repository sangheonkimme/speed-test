import { usages } from "../domain/assessment";
import { fmtSpeed } from "../domain/format";
import { AdSlot } from "./AdSlot";
import { CommerceRecommendations } from "./CommerceRecommendations";
import { ConversionCta } from "./ConversionCta";
import { FooterLinks } from "./FooterLinks";
import { ShareCard } from "./ShareCard";
import { UsageCard } from "./UsageCard";

export function ResultPanel({ result, env, gradeTitle, recommendations, ctaVariant, showCta, onCtaClick, onShare, onRecommendation }) {
  return (
    <>
      <div className="results">
        <div className="col-main">
          <UsageCard items={usages(result.down, result.ping, result.jitter)} />
          {showCta && <ConversionCta variant={ctaVariant} onClick={onCtaClick} />}
        </div>
        <div className="col-rail">
          <ShareCard location={env?.isp || "내 통신사"} speed={fmtSpeed(result.down)} grade={gradeTitle} onShare={onShare} />
          <CommerceRecommendations items={recommendations} onSelect={onRecommendation} />
        </div>
      </div>
      <AdSlot placement="bottom" />
      <FooterLinks />
    </>
  );
}
