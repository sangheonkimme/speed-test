import { StatusIcon } from "./StatusIcon";

export function UsageCard({ items }) {
  return (
    <section className="card usage-card">
      <h2>용도별 적합도</h2><div className="sub-t">지금 속도로 무엇까지 쾌적할까요?</div>
      {items.map((item) => <div className="usage-row" key={item.name}><span className={`ic tone-${item.tone}`}><StatusIcon name={item.tone} /></span><span className="n">{item.name}</span><span className={`lv tone-${item.tone}`}>{item.level}</span></div>)}
    </section>
  );
}
