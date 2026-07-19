import { Plus, X, Trash2 } from "lucide-react";
import { uid } from "../../utils/dates";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";
import BloomPicker from "../ui/BloomPicker";

export default function PhaseModal({ data, onSave, onDelete, onClose }) {
  const p = data.phase || {}; const editing = !!p.id;
  const [f, set] = useFormState({ id: p.id || uid(), phase: p.phase || "", when: p.when || "", color: p.color || "purple", tasks: p.tasks && p.tasks.length ? p.tasks.map((t) => ({ ...t })) : [{ id: uid(), text: "" }] });
  return (<Modal title={editing ? "Edit phase" : "Add phase"} tone="leaf" onClose={onClose}>
    <Field label="Phase name"><input className="input" autoFocus value={f.phase} onChange={(e) => set("phase", e.target.value)} placeholder="Sharpen your shine" /></Field>
    <Field label="When (label)"><input className="input" value={f.when} onChange={(e) => set("when", e.target.value)} placeholder="Oct 2026 – Feb 2027" /></Field>
    <Field label="Color"><BloomPicker value={f.color} onChange={(v) => set("color", v)} /></Field>
    <Field label="To-dos"><div className="col gap6">{f.tasks.map((t) => (<div key={t.id} className="row gap8"><input className="input" value={t.text} onChange={(e) => set("tasks", f.tasks.map((x) => x.id === t.id ? { ...x, text: e.target.value } : x))} placeholder="Add a to-do…" /><button className="icon-btn" onClick={() => set("tasks", f.tasks.filter((x) => x.id !== t.id))}><X size={14} /></button></div>))}<button className="pbtn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => set("tasks", [...f.tasks, { id: uid(), text: "" }])}><Plus size={13} /> Add to-do</button></div></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(data.track, f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" disabled={!f.phase.trim()} onClick={() => onSave(data.track, { id: f.id, phase: f.phase.trim(), when: f.when.trim(), color: f.color, tasks: f.tasks.map((t) => ({ id: t.id, text: t.text.trim() })).filter((t) => t.text) })}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}
