import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { TRACKS } from "../../data/tracks";
import { rankFor } from "../../data/gamification";
import { STYLES } from "../../styles/starryStyles";
import Field from "../ui/Field";
import Pip from "../sprites/Pip";

/* ---------- onboarding ---------- */
export default function Onboarding({ profiles, onCreate, onPick }) {
  const [name, setName] = useState(""); const [grad, setGrad] = useState("2029"); const [tracks, setTracks] = useState(["IB", "Consulting", "PM"]);
  const toggle = (t) => setTracks((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  return (
    <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 18 }}>
      <style>{STYLES}</style>
      <div className="win" style={{ maxWidth: 440, width: "100%" }}>
        <div className="win-bar pink">⋆ STARRY.EXE — new save<span className="win-dots"><span>_</span><span>▢</span><span>x</span></span></div>
        <div className="win-body" style={{ padding: 22 }}>
          <div className="row gap10" style={{ marginBottom: 4 }}><Pip size={44} /><div><h1 style={{ fontSize: 24 }}>Start your sky</h1><div className="muted" style={{ fontSize: 12.5 }}>a cozy night-sky for recruiting</div></div></div>
          {profiles.length > 0 && <div style={{ margin: "16px 0" }}><label className="label">Continue a save</label><div className="col gap6">{profiles.map((p) => (
            <button key={p.id} className="link-card" style={{ textAlign: "left" }} onClick={() => onPick(p.id)}><div style={{ width: 32, height: 32, borderRadius: 9, border: "2px solid var(--ink)", background: "var(--grape)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pixelify Sans'", fontWeight: 700 }}>{p.name[0]?.toUpperCase()}</div><div className="grow"><div style={{ fontWeight: 800 }}>{p.name}</div><div className="faint mono" style={{ fontSize: 13 }}>Lv.{rankFor(p.xp || 0).lv} · Class of {p.gradClass}</div></div><ChevronRight size={16} className="faint" /></button>))}</div>
            <div className="row gap8" style={{ margin: "14px 0 2px", color: "var(--ink-faint)", fontSize: 12 }}><div className="grow" style={{ height: 2, background: "var(--line)" }} /> or start a new one <div className="grow" style={{ height: 2, background: "var(--line)" }} /></div></div>}
          <Field label="Your name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" /></Field>
          <Field label="Graduating class"><input className="input" value={grad} onChange={(e) => setGrad(e.target.value)} /></Field>
          <Field label="Tracks you're chasing"><div className="row gap8 wrap">{Object.keys(TRACKS).map((k) => <button key={k} className="chip" style={{ padding: "7px 12px", cursor: "pointer", background: tracks.includes(k) ? TRACKS[k].color : "#fff", color: tracks.includes(k) ? "#fff" : "var(--ink-soft)" }} onClick={() => toggle(k)}>{tracks.includes(k) && <Check size={12} />} {TRACKS[k].name}</button>)}</div></Field>
          <button className="pbtn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={!name.trim() || !tracks.length} onClick={() => onCreate({ name: name.trim(), gradClass: grad.trim() || "2029", tracks })}>Start my sky ⋆</button>
          <p className="faint" style={{ fontSize: 11, textAlign: "center", marginTop: 10 }}>Saved on this device. No account needed.</p>
        </div>
      </div>
    </div>);
}
