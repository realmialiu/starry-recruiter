import { Trash2 } from "lucide-react";
import { uid } from "../../utils/dates";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";

export default function SimpleLinkModal({ kind, data, onSave, onDelete, onClose }) {
  const editing = !!data.id; const isDoc = kind === "doc"; const nameKey = isDoc ? "name" : "label";
  const [f, set] = useFormState({ id: data.id || uid(), label: data.label || "", name: data.name || "", url: data.url || "", kind: data.kind || "Resume" });
  return (<Modal title={editing ? "Edit" : isDoc ? "Add document" : "Add quick link"} tone="blue" onClose={onClose}>
    <Field label={isDoc ? "Document name" : "Label"}><input className="input" autoFocus value={f[nameKey]} onChange={(e) => set(nameKey, e.target.value)} placeholder={isDoc ? "Resume — IB v4" : "GitHub repo"} /></Field>
    {isDoc && <Field label="Type"><select className="select" value={f.kind} onChange={(e) => set("kind", e.target.value)}>{["Resume", "Cover letter", "Coffee-chat notes", "Talking points", "Transcript", "Other"].map((k) => <option key={k}>{k}</option>)}</select></Field>}
    <Field label={isDoc ? "Drive / doc link" : "URL"}><input className="input" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn blue right" onClick={() => f[nameKey].trim() && f.url.trim() && onSave(f)}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}
