import { Coffee, Trash2 } from "lucide-react";
import { uid, ymd, today } from "../../utils/dates";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function CoffeeModal({ data, companies, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), person: data.person || "", company: data.company || "", role: data.role || "", date: data.date || ymd(today()), status: data.status || "requested", notes: data.notes || "" });
  return (<Modal title={<><Coffee size={15} /> {editing ? "Edit chat" : "Log a coffee chat"}</>} tone="pink" onClose={onClose}>
    <div className="two"><Field label="Person"><input className="input" autoFocus value={f.person} onChange={(e) => set("person", e.target.value)} placeholder="Analyst name" /></Field><Field label="Company"><input className="input" value={f.company} onChange={(e) => set("company", e.target.value)} list="co-dl" /><datalist id="co-dl">{companies.map((c) => <option key={c.id} value={c.name} />)}</datalist></Field></div>
    <div className="two"><Field label="Their role"><input className="input" value={f.role} placeholder="2nd-year Analyst" onChange={(e) => set("role", e.target.value)} /></Field><Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field></div>
    <Field label="Status"><div className="seg">{[["requested", "Requested"], ["scheduled", "Scheduled"], ["done", "Done"], ["follow-up", "Follow up"]].map(([k, l]) => <button key={k} className={f.status === k ? "on" : ""} onClick={() => set("status", k)}>{l}</button>)}</div></Field>
    <Field label="Talking points / notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Questions to ask, what you learned, thank-you sent?" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn pink right" onClick={() => f.person.trim() && onSave(f)}>{editing ? "Save" : "Log ⋆"}</button></div>
  </Modal>);
}
