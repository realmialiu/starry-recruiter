import { Building2, Trash2 } from "lucide-react";
import { uid } from "../../utils/dates";
import { TRACKS } from "../../data/tracks";
import { STAGES } from "../../data/stages";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function CompanyModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), name: data.name || "", track: data.track || "IB", stage: data.stage || "Interested", role: data.role || "", notes: data.notes || "" });
  return (<Modal title={<><Building2 size={15} /> {editing ? "Edit firm" : "Add firm to roster"}</>} onClose={onClose}>
    <div className="two"><Field label="Company"><input className="input" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Role / program"><input className="input" value={f.role} placeholder="Summer Analyst" onChange={(e) => set("role", e.target.value)} /></Field></div>
    <div className="two"><Field label="Track"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].name}</option>)}</select></Field><Field label="Status"><select className="select" value={f.stage} onChange={(e) => set("stage", e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
    <Field label="Notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Recruiter contacts, referral, next steps…" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.name.trim() && onSave(f)}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}
