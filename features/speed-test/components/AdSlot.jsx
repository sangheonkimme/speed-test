export function AdSlot({ placement }) {
  const measuring = placement === "measuring";
  return <div className={`ad-wrap ad-${placement}`}><div className="ad"><span className="tag">광고</span><span className="ph">{measuring ? "광고 영역 · 측정 스트림 우선(지연 로드)" : "광고 영역"}</span></div></div>;
}
