import { Check, Trash2 } from "lucide-react";
import { uid } from "../../utils/dates";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function TaskModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), title: data.title || "", due: data.due || "", done: data.done || false });
  return (<Modal title={<><Check size={15} /> {editing ? "Edit quest" : "New quest"}</>} tone="leaf" onClose={onClose}>
    <Field label="Quest"><input className="input" autoFocus value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Send thank-you to…" /></Field>
    <Field label="Due (optional)"><input type="date" className="input" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.title.trim() && onSave(f)}>{editing ? "Save" : "Add quest"}</button></div>
  </Modal>);
}
