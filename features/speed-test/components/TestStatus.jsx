export function TestStatus({ phase, done, progress, phaseCap, gradeTitle, gradeSubtitle, onRestart }) {
  if (phase === "error") return (
    <div className="status">
      <div><div className="grade-t" role="alert">측정에 실패했어요</div><div className="grade-s">네트워크 연결을 확인해 주세요</div><button className="btn btn-md btn-outline-assist restart" onClick={onRestart}>다시 시도하기</button></div>
    </div>
  );

  if (!done) return (
    <div className="status">
      <div><div className="measuring-line">측정 중<span className="dots"><span /><span /><span /></span></div><div className="pbar"><div style={{ width: `${Math.min(100, progress).toFixed(0)}%` }} /></div><div className="pcap">{phaseCap}</div></div>
    </div>
  );

  return (
    <div className="status">
      <div><div className="grade-t">{gradeTitle}</div><div className="grade-s">{gradeSubtitle}</div><button className="btn btn-md btn-outline-assist restart" onClick={onRestart}>다시 측정하기</button></div>
    </div>
  );
}
