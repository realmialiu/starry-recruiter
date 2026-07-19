/* ---------- flower sprite ---------- */
export default function Flower({ shape = "bloom", color = "#F4A9CC", size = 20, dim }) {
  const st = { width: size, height: size, display: "block", opacity: dim ? .55 : 1,
    filter: dim ? "none" : "drop-shadow(0 0 1.5px rgba(255,255,255,.55))" };
  if (shape === "sprout") return ( /* tiny 4-point spark — prep / expected */
    <svg viewBox="0 0 16 16" style={st}><path d="M8 2 L9.1 6.9 L14 8 L9.1 9.1 L8 14 L6.9 9.1 L2 8 L6.9 6.9 Z" fill={color} stroke="var(--ink)" strokeWidth=".5" strokeLinejoin="round" /></svg>);
  if (shape === "sun") return ( /* bright nova — the "landed the job" star */
    <svg viewBox="0 0 16 16" style={st}>
      {[...Array(8)].map((_, i) => { const a = i * 45 * Math.PI / 180; return <rect key={i} x={8 + Math.cos(a) * 5.5 - .7} y={8 + Math.sin(a) * 5.5 - .7} width="1.4" height="1.4" fill={color} opacity=".85" />; })}
      <path d="M8 1.1 L9.8 6 L14.7 6.2 L10.7 9.4 L12.2 14.2 L8 11 L3.8 14.2 L5.3 9.4 L1.3 6.2 L6.2 6 Z" fill={color} stroke="var(--ink)" strokeWidth=".6" strokeLinejoin="round" />
      <circle cx="8" cy="7.1" r="1.7" fill="#FFF7D6" /></svg>);
  if (shape === "dot") return <span style={{ width: size * .5, height: size * .5, borderRadius: "50%", background: color, display: "inline-block" }} />;
  return ( /* classic 5-point star */
    <svg viewBox="0 0 16 16" style={st}><path d="M8 1.5 L9.7 6.1 L14.6 6.3 L10.6 9.3 L12 14 L8 11.1 L4 14 L5.4 9.3 L1.4 6.3 L6.3 6.1 Z" fill={color} stroke="var(--ink)" strokeWidth=".6" strokeLinejoin="round" /><circle cx="8" cy="7" r="1.35" fill="#FFF9E8" opacity=".9" /></svg>);
}
