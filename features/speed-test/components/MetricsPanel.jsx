import { fmtSpeed } from "../domain/format";

export function MetricsPanel({ upload, ping, jitter }) {
  const formattedUpload = upload == null ? null : fmtSpeed(upload);
  return (
    <div className="subs">
      <div className="sub"><div className="k">업로드</div><div className="v">{formattedUpload ? <>{formattedUpload.v} <small>{formattedUpload.u}</small></> : <>… <small>Mbps</small></>}</div></div>
      <div className="sub"><div className="k">지연(핑)</div><div className="v">{ping != null ? Math.round(ping) : "–"} <small>ms</small></div></div>
      <div className="sub"><div className="k">지터</div><div className="v">{jitter != null ? jitter.toFixed(1) : "–"} <small>ms</small></div></div>
    </div>
  );
}
