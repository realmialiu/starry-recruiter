import { useState } from "react";
import { Wand2, Check, Building2 } from "lucide-react";
import { useTracks } from "../../context/TracksContext";
import { smartParse } from "../../utils/smartParse";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function SmartAddModal({ onCommit, onClose }) {
  const { tracks } = useTracks();
  const [text, setText] = useState(""); const [fallback, setFallback] = useState(Object.keys(tracks)[0]); const [rows, setRows] = useState(null);
  const ex = `Bain\tFirst Forward\tUG (Class of 2029)\tExpected April 2027\nBain\tBEL: Building Entrepreneurial Leaders\tUG (Class of 2029)\tExpected February 2027\nBain\tConsulting Kickstart\tUG (Class of 2030)\tExpected Summer 2026`;
  return (
    <Modal title={<><Wand2 size={15} /> Map the sky (smart add)</>} tone="yellow" onClose={onClose} wide>
      {!rows ? <>
        <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>Paste rows from a recruiting site — I'll place each as a dated drop in your sky.</p>
        <Field label="Default track"><div className="seg">{Object.keys(tracks).map((k) => <button key={k} className={fallback === k ? "on" : ""} onClick={() => setFallback(k)}>{tracks[k].short}</button>)}</div></Field>
        <Field label="Paste here"><textarea className="textarea" style={{ minHeight: 140, fontFamily: "'VT323'", fontSize: 15 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={ex} /></Field>
        <div className="row gap10"><button className="pbtn ghost" onClick={() => setText(ex)}>Try example</button><button className="pbtn right" disabled={!text.trim()} onClick={() => setRows(smartParse(text, fallback))}>Sort →</button></div>
      </> : <>
        <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>Found {rows.length}. Set track, toggle "add to roster," untick any to skip.</p>
        <div className="col gap6" style={{ maxHeight: 320, overflow: "auto", marginBottom: 12 }}>{rows.map((r, i) => (
          <div key={r.id} className="row gap8 wrap" style={{ padding: "8px 10px", borderRadius: 10, background: "var(--paper2)" }}>
            <span className={"tick" + (r.include ? " on" : "")} style={{ cursor: "pointer" }} onClick={() => setRows((p) => p.map((x, j) => j === i ? { ...x, include: !x.include } : x))}>{r.include && <Check size={13} />}</span>
            <div className="grow" style={{ minWidth: 120 }}><div style={{ fontWeight: 800 }}>{r.company} {r.program && <span className="muted" style={{ fontWeight: 600 }}>· {r.program}</span>}</div><div className="faint mono" style={{ fontSize: 14 }}>{r.timing.label} · {r.eligibility || "—"}</div></div>
            <button className="chip" style={{ cursor: "pointer", background: r.addCompany ? "var(--stem)" : "#fff", color: r.addCompany ? "#fff" : "var(--ink-soft)" }} onClick={() => setRows((p) => p.map((x, j) => j === i ? { ...x, addCompany: !x.addCompany } : x))}>{r.addCompany ? <Check size={11} /> : <Building2 size={11} />} roster</button>
            <select className="select" style={{ width: 88, padding: "5px 7px" }} value={r.track} onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, track: e.target.value } : x))}>{Object.keys(tracks).map((k) => <option key={k} value={k}>{tracks[k].short}</option>)}</select>
          </div>))}</div>
        <div className="row gap10"><button className="pbtn ghost" onClick={() => setRows(null)}>← Back</button><button className="pbtn right" onClick={() => onCommit(rows.filter((r) => r.include))}>Add {rows.filter((r) => r.include).length} drops</button></div>
      </>}
    </Modal>);
}
