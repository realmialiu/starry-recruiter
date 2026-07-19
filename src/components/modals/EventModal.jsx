import { Flower2, Check, Bell, Trash2, Copy } from "lucide-react";
import { uid, ymd, today } from "../../utils/dates";
import { CATEGORIES, catOf } from "../../data/categories";
import { useFormState } from "../../hooks/useFormState";
import Modal from "../ui/Modal";
import Field from "../ui/Field";
import Flower from "../sprites/Flower";
import BloomPicker from "../ui/BloomPicker";
import { bloomHex } from "../../data/blooms";

export default function EventModal({ data, companies, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, set] = useFormState({ id: data.id || uid(), title: data.title || "", cat: data.cat || "coffee", color: data.color || catOf(data.cat || "coffee").color,
    date: data.date || ymd(today()), endDate: data.endDate || "", allDay: data.allDay ?? false, start: data.start || "10:00", end: data.end || "11:00",
    location: data.location || "", notes: data.notes || "", notify: data.notify ?? true, companyId: data.companyId || "", recur: data.recur || "none", recurUntil: data.recurUntil || "" });
  return (
    <Modal title={<><Flower2 size={15} /> {editing ? "Edit this star" : "Add a star"}</>} onClose={onClose}>
      <Field label="What is it?"><input className="input" autoFocus value={f.title} placeholder="Coffee chat with…" onChange={(e) => set("title", e.target.value)} /></Field>
      <div className="two">
        <Field label="Star kind"><select className="select" value={f.cat} onChange={(e) => { set("cat", e.target.value); set("color", catOf(e.target.value).color); }}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></Field>
        <Field label="Company (optional)"><select className="select" value={f.companyId} onChange={(e) => set("companyId", e.target.value)}><option value="">—</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      </div>
      <Field label="Star color"><div className="row gap10 wrap" style={{ alignItems: "center" }}><Flower shape={catOf(f.cat).shape} color={bloomHex(f.color)} size={30} /><BloomPicker value={f.color} onChange={(v) => set("color", v)} /></div></Field>
      <div className="two"><Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
        <Field label="Through (multi-day)"><input type="date" className="input" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field></div>
      <label className="row gap8" style={{ marginBottom: 10, cursor: "pointer", fontWeight: 700 }} onClick={() => set("allDay", !f.allDay)}><span className={"tick" + (f.allDay ? " on" : "")}>{f.allDay && <Check size={13} />}</span> All-day</label>
      {!f.allDay && <div className="two"><Field label="Start"><input type="time" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="End"><input type="time" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>}
      <div className="two"><Field label="Repeat"><select className="select" value={f.recur} onChange={(e) => set("recur", e.target.value)}><option value="none">One-time</option><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option></select></Field>
        {f.recur !== "none" ? <Field label="Until"><input type="date" className="input" value={f.recurUntil} onChange={(e) => set("recurUntil", e.target.value)} /></Field> : <Field label="Where"><input className="input" value={f.location} placeholder="Zoom, campus…" onChange={(e) => set("location", e.target.value)} /></Field>}</div>
      {f.recur !== "none" && <Field label="Where"><input className="input" value={f.location} placeholder="Zoom, campus…" onChange={(e) => set("location", e.target.value)} /></Field>}
      <Field label="Notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Talking points, prep, recruiter…" /></Field>
      <label className="row gap8" style={{ marginBottom: 14, cursor: "pointer", fontWeight: 700 }} onClick={() => set("notify", !f.notify)}><span className={"tick" + (f.notify ? " on" : "")}>{f.notify && <Check size={13} />}</span><Bell size={14} /> Remind me (shows in Upcoming)</label>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}{editing && <button className="pbtn ghost" onClick={() => onSave({ ...f, id: uid(), title: (f.title || "Event") + " (copy)" })}><Copy size={14} /> Duplicate</button>}<button className="pbtn right" onClick={() => f.title.trim() && onSave(f)}>{editing ? "Save" : "Add star ⋆"}</button></div>
    </Modal>);
}
