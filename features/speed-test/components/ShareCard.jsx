export function ShareCard({ location, speed, grade, onShare }) {
  return (
    <section className="card compact-card"><div className="share-card"><div className="loc">{location}</div><div className="n">{speed.v}<small> {speed.u}</small></div><div className="rank">{grade}</div></div><div className="share-btns"><div className="grow"><button className="btn btn-md btn-solid-primary btn-full" onClick={() => onShare("native")}>결과 공유</button></div><button className="btn btn-md btn-outline-assist" onClick={() => onShare("url")}>URL</button></div></section>
  );
}
