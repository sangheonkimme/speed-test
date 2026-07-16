export function StatusIcon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };

  if (name === "ok") return <svg {...common}><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" /><path d="m8 12.5 2.6 2.6L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === "warn") return <svg {...common}><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" /><path d="M12 7.5v5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16.3" r="1.15" fill="currentColor" /></svg>;
  if (name === "bad") return <svg {...common}><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".15" /><path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  if (name === "wifi") return <svg {...common}><path d="M2.5 9.2a14 14 0 0 1 19 0M5.5 12.6a9.5 9.5 0 0 1 13 0M8.6 15.9a5 5 0 0 1 6.8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="19" r="1.6" fill="currentColor" /></svg>;
  if (name === "fire") return <svg {...common}><path d="M12 3c1 3-3 4.5-3 8a3.5 3.5 0 0 0 7 .2c1.6 1.2 2.5 2.9 2.5 4.3A6.5 6.5 0 0 1 12 21a6.5 6.5 0 0 1-6.5-5.5C5.5 10.5 10.5 8.5 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
  return null;
}
