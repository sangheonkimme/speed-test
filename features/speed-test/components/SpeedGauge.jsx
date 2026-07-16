const RING_CIRCUMFERENCE = 779.11;

export function SpeedGauge({ speed, progress, ringColor }) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(100, progress) / 100);
  return (
    <div className="gauge">
      <svg viewBox="0 0 280 280" aria-hidden="true">
        <circle cx="140" cy="140" r="124" fill="none" stroke="var(--fill-10)" strokeWidth="15" />
        <circle className="ring-fg" cx="140" cy="140" r="124" fill="none" stroke={ringColor} strokeWidth="15" strokeLinecap="round" strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={offset} transform="rotate(-90 140 140)" />
      </svg>
      <div className="center">
        <div className="num" aria-live="polite">{speed.v}</div>
        <div className="unit">{speed.u} · 다운로드</div>
      </div>
    </div>
  );
}
