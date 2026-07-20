import { Sprout, Trash2 } from "lucide-react";
import { uid, ymd, today, addDays } from "../../utils/dates";
import { useTracks } from "../../context/TracksContext";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";
import BloomPicker from "../ui/BloomPicker";

export default function FocusModal({ data, onSave, onDelete, onClose }) {
  const { tracks } = useTracks();
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), label: data.label || "", color: data.color || "mint", start: data.start || ymd(today()), end: data.end || ymd(addDays(today(), 30)), track: data.track || "" });
  return (
    <Modal title={<><Sprout size={15} /> {editing ? "Edit focus row" : "What to focus on"}</>} tone="leaf" onClose={onClose}>
      <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>A stretch of time to focus on — "study IB technicals" in October, "casing" Feb–May.</p>
      <Field label="Focus on"><input className="input" autoFocus value={f.label} placeholder="Study IB technicals" onChange={(e) => set("label", e.target.value)} /></Field>
      <div className="two"><Field label="From"><input type="date" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="To"><input type="date" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>
      <Field label="Track (optional)"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}><option value="">General</option>{Object.keys(tracks).map((k) => <option key={k} value={k}>{tracks[k].name}</option>)}</select></Field>
      <Field label="Row color"><BloomPicker value={f.color} onChange={(v) => set("color", v)} /></Field>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.label.trim() && onSave(f)}>{editing ? "Save" : "Add row"}</button></div>
    </Modal>);
}
