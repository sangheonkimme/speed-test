import { StatusIcon } from "./StatusIcon";

export function CommerceRecommendations({ items, onSelect }) {
  if (!items.length) return null;
  return (
    <section className="card compact-card commerce-card"><h2>측정 결과 맞춤 추천</h2><div className="sub-t">문제 진단에 근거한 제품이에요</div><div className="cmr">{items.map((item) => <button className="cm" key={item.id} onClick={() => onSelect(item.id)}><span className="ic"><StatusIcon name={item.icon} /></span><span className="b"><span className="tag">{item.tag}</span><span className="t">{item.title}</span><span className="d">{item.desc}</span></span></button>)}</div></section>
  );
}
