import { Pin, Trash2 } from "lucide-react";
import { uid, ymd, today, addDays } from "../../utils/dates";
import { TRACKS } from "../../data/tracks";
import { STAGES } from "../../data/stages";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function WindowModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), company: data.company || "", program: data.program || "", track: data.track || "IB", expectedLabel: data.expectedLabel || "",
    expected: data.expected || data.start || ymd(today()), actual: data.actual || "", start: data.start || ymd(today()), end: data.end || ymd(addDays(today(), 30)), status: data.status || "Interested" });
  return (
    <Modal title={<><Pin size={15} /> {editing ? "Edit application drop" : "New application drop"}</>} tone="pink" onClose={onClose}>
      <div className="two"><Field label="Company"><input className="input" autoFocus value={f.company} onChange={(e) => set("company", e.target.value)} /></Field><Field label="Program"><input className="input" value={f.program} placeholder="Sophomore SA…" onChange={(e) => set("program", e.target.value)} /></Field></div>
      <div className="two"><Field label="Track"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].name}</option>)}</select></Field>
        <Field label="Status"><select className="select" value={f.status} onChange={(e) => set("status", e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <div className="two"><Field label="Expected drop"><input type="date" className="input" value={f.expected} onChange={(e) => set("expected", e.target.value)} /></Field><Field label="Expected (label)"><input className="input" value={f.expectedLabel} placeholder="Expected April 2027" onChange={(e) => set("expectedLabel", e.target.value)} /></Field></div>
      <Field label="Actual open date — once confirmed (optional)"><input type="date" className="input" value={f.actual} onChange={(e) => set("actual", e.target.value)} /></Field>
      <p className="faint" style={{ fontSize: 11.5, marginTop: -4, marginBottom: 12 }}>Expected shows as a faint spark; set an actual date and it becomes a real star.</p>
      <div className="two"><Field label="Season opens"><input type="date" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="Season closes"><input type="date" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn pink right" onClick={() => f.company.trim() && onSave(f)}>{editing ? "Save" : "Add drop"}</button></div>
    </Modal>);
}
