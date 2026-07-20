import { Trash2 } from "lucide-react";
import { useFormState } from "../../hooks/useFormState";
import { bloomHex, bloomIdFromHex } from "../../data/blooms";
import Modal from "../ui/Modal";
import Field from "../ui/Field";
import BloomPicker from "../ui/BloomPicker";

export default function TrackModal({ data, canDelete, onSave, onDelete, onClose }) {
  const editing = !!data.key; const t = data.track || {};
  const [f, set] = useFormState({ name: t.name || "", short: t.short || "", bloom: t.color ? bloomIdFromHex(t.color) : "grape" });
  const short = (f.short.trim() || f.name.trim()).slice(0, 6);
  return (
    <Modal title={editing ? "Edit track" : "New track"} tone="leaf" onClose={onClose}>
      <Field label="Track name"><input className="input" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Product Management" /></Field>
      <Field label="Short label"><input className="input" value={f.short} onChange={(e) => set("short", e.target.value)} placeholder={f.name.slice(0, 4) || "PM"} maxLength={6} /></Field>
      <Field label="Color"><BloomPicker value={f.bloom} onChange={(v) => set("bloom", v)} /></Field>
      <div className="row gap10">
        {editing && canDelete && <button className="pbtn danger" onClick={() => onDelete(data.key)}><Trash2 size={14} /> Delete</button>}
        <button className="pbtn right" disabled={!f.name.trim()} onClick={() => onSave(data.key, { name: f.name.trim(), short, color: bloomHex(f.bloom), soft: bloomHex(f.bloom) + "33" })}>{editing ? "Save" : "Add track"}</button>
      </div>
    </Modal>);
}
