/* ---------- mascot sprite ---------- */
export default function Pip({ mood = "idle", size = 52 }) {
  const cheer = mood === "cheer";
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} style={{ display: "block" }}>
      <ellipse cx="22" cy="41" rx="10" ry="2" fill="rgba(59,46,85,.12)" />
      {[[7, 9], [37, 8], [36, 27], [8, 29]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 2.6}L${x + .9} ${y - .6}L${x + 2.8} ${y}L${x + .9} ${y + .6}L${x} ${y + 2.6}L${x - .9} ${y + .6}L${x - 2.8} ${y}L${x - .9} ${y - .6}Z`} fill={i % 2 ? "var(--yellow)" : "var(--pink)"} stroke="var(--ink)" strokeWidth=".5" />
      ))}
      <circle cx="22" cy="21" r="13" fill="#FFF3C6" stroke="var(--ink)" strokeWidth="1.7" />
      <circle cx="14.5" cy="16" r="2" fill="#F3E2A2" /><circle cx="30" cy="26" r="2.6" fill="#F3E2A2" /><circle cx="28.5" cy="14" r="1.4" fill="#F3E2A2" />
      <circle cx="18.4" cy="21" r="1.3" fill="var(--ink)" /><circle cx="25.6" cy="21" r="1.3" fill="var(--ink)" />
      {cheer ? <path d="M18 24Q22 27.6 26 24" stroke="var(--ink)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        : <path d="M18.6 24.2Q22 25.9 25.4 24.2" stroke="var(--ink)" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
      <circle cx="16.5" cy="23" r="1.2" fill="var(--blush)" /><circle cx="27.5" cy="23" r="1.2" fill="var(--blush)" />
    </svg>);
}
