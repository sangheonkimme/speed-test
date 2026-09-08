import { AD_SLOTS } from "../config";

/**
 * 광고 지면.
 *
 * ⚠️ AdSense 정책: "게시자 콘텐츠가 없는 화면"과 "아직 준비 중인 화면"에는 게재 광고를
 * 둘 수 없다. 이전에는 실제 광고 유닛 없이 "광고 영역" 플레이스홀더를 그렸고, 그중 하나는
 * 측정 진행 중(= 준비 중인 화면)에 렌더됐다. 2026-09-08 심사에서 이 두 가지가
 * 정책 위반으로 지적됐다.
 *
 * 그래서 이 컴포넌트는 **실제 광고 유닛 ID가 설정된 지면만** 렌더한다.
 * 설정이 없으면 아무것도 그리지 않는다 — 빈 회색 박스는 콘텐츠가 아니다.
 */
export function AdSlot({ placement }) {
  const slot = AD_SLOTS[placement];
  if (!slot) return null;

  return (
    <div className={`ad-wrap ad-${placement}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
