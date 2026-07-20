import { useState, useEffect } from "react";
import { Plus, Edit3, Settings } from "lucide-react";
import { useTracks } from "../../context/TracksContext";
import { seedTimelines } from "../../data/timelines";
import { bloomHex } from "../../data/blooms";
import Win from "../ui/Win";
import Empty from "../ui/Empty";

const TONES = ["", "yellow", "blue", "pink", "leaf"];

/* ---------- guide (editable timelines) ---------- */
export default function Guide({ profile, timelines, setTimelines, addFocus, setModal }) {
  const { tracks } = useTracks();
  const keys = Object.keys(tracks);
  const [active, setActive] = useState(profile.tracks.find((t) => tracks[t]) || keys[0]);
  const [arm, setArm] = useState(false);
  const phases = (timelines && timelines[active]) || [];
  useEffect(() => setArm(false), [active]);
  useEffect(() => { if (!tracks[active]) setActive(keys[0]); }, [tracks]);
  if (!active || !tracks[active]) return null;
  const tone = TONES[keys.indexOf(active) % TONES.length];
  return (
    <div>
      <div className="pagehead"><div><h1>Star map</h1><div className="muted">Your game plan for Class of {profile.gradClass} — edit anything</div></div><button className="pbtn" onClick={() => setModal({ type: "phase", data: { track: active, phase: {} } })}><Plus size={15} /> Add phase</button></div>
      <div className="row between wrap gap8" style={{ marginBottom: 16 }}>
        <div className="row gap6 wrap" style={{ alignItems: "center" }}>
          <div className="seg">{keys.map((k) => <button key={k} className={active === k ? "on" : ""} onClick={() => setActive(k)} style={active === k ? { color: tracks[k].color } : {}}>{tracks[k].name}</button>)}</div>
          <button className="icon-btn" title="Edit this track" style={{ width: 28, height: 28 }} onClick={() => setModal({ type: "track", data: { key: active, track: tracks[active] } })}><Settings size={13} /></button>
          <button className="icon-btn" title="Add a track" style={{ width: 28, height: 28 }} onClick={() => setModal({ type: "track", data: {} })}><Plus size={13} /></button>
        </div>
        <button className="pbtn ghost sm" style={arm ? { color: "var(--rose)" } : {}} onClick={() => { if (arm) { setTimelines(active, seedTimelines()[active] || []); setArm(false); } else setArm(true); }}>{arm ? "Click again to confirm" : "Reset to default"}</button>
      </div>
      <Win title={`${tracks[active].name} path`} tone={tone}>
        {phases.length === 0 ? <Empty shape="sprout" title="No phases" sub="Add one, or reset to defaults." /> : phases.map((p) => (
          <div key={p.id} className="tl-node"><span className="tl-dot" style={{ background: bloomHex(p.color) }} />
            <div className="row between wrap" style={{ gap: 8 }}><div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 16 }}>{p.phase}</div>
              <div className="row gap6"><button className="chip" style={{ cursor: "pointer", background: "var(--paper2)" }} onClick={() => addFocus(p.phase, active, p.color)}><Plus size={11} /> focus</button><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setModal({ type: "phase", data: { track: active, phase: p } })}><Edit3 size={12} /></button></div></div>
            <div className="muted mono" style={{ fontSize: 14, marginBottom: 4 }}>{p.when}</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>{p.tasks.map((t) => <li key={t.id}>{t.text}</li>)}</ul>
          </div>))}
        <p className="faint" style={{ fontSize: 11.5, marginTop: 6 }}>General guidance — dates shift every cycle & by firm. Confirm on each company's page.</p>
      </Win>
    </div>);
}
