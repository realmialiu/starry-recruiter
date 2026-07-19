import { useEffect } from "react";

export default function Modal({ title, tone = "grape", onClose, children, wide }) {
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className={"modal" + (wide ? " wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className={"win-bar " + (tone === "grape" ? "" : tone)}>{title}<span className="win-dots"><button className="win-dots-x" onClick={onClose} style={{ all: "unset", cursor: "pointer" }}><span style={{ width: 14, height: 14, border: "2px solid var(--ink)", background: "#fff", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--ink)", fontFamily: "'Press Start 2P'" }}>x</span></button></span></div>
        <div style={{ padding: "18px 20px" }}>{children}</div>
      </div>
    </div>);
}
