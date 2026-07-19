import Flower from "../sprites/Flower";

export default function Empty({ shape = "sprout", title, sub }) {
  return (
    <div className="empty"><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Flower shape={shape} color="var(--purple)" size={40} /></div>
      <div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, color: "var(--ink)", fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 12.5 }}>{sub}</div></div>);
}
