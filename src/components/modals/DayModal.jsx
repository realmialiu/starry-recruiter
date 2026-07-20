import { Calendar as CalIcon, Plus } from "lucide-react";
import { parseYMD, sameDay } from "../../utils/dates";
import { expandEvents } from "../../utils/recurrence";
import { useTracks } from "../../context/TracksContext";
import { bloomHex } from "../../data/blooms";
import { catOf } from "../../data/categories";
import Modal from "../ui/Modal";
import Empty from "../ui/Empty";
import Flower from "../sprites/Flower";
import { fmtTime } from "../../utils/dates";

/* ---------- day detail ---------- */
export default function DayModal({ date, data, setModal }) {
  const { tracks } = useTracks();
  const d = parseYMD(date);
  const evs = expandEvents(data.events, d, d).filter((o) => sameDay(o.date, d)).sort((a, b) => ((a.ev.start || "") < (b.ev.start || "") ? -1 : 1));
  const drops = data.windows.filter((w) => w.actual === date || w.expected === date || w.start === date);
  return (
    <Modal title={<><CalIcon size={15} /> {d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</>} tone="pink" onClose={() => setModal(null)}>
      {evs.length === 0 && drops.length === 0 ? <Empty title="A quiet night" sub="Nothing here yet — add a star below." /> :
        <div className="col gap2" style={{ marginBottom: 12 }}>
          {evs.map((o, i) => { const c = catOf(o.ev.cat); return (
            <div key={"e" + i} className="list-row" onClick={() => setModal({ type: "event", data: o.ev })}>
              <Flower shape={c.shape} color={bloomHex(o.ev.color)} size={20} />
              <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{o.ev.title}</div><div className="faint mono" style={{ fontSize: 13 }}>{c.label}{o.ev.location ? " · " + o.ev.location : ""}</div></div>
              <span className="faint mono" style={{ fontSize: 13 }}>{o.ev.allDay ? "all day" : (o.ev.start ? fmtTime(o.ev.start) : "")}</span>
            </div>); })}
          {drops.map((w, i) => (
            <div key={"w" + i} className="list-row" onClick={() => setModal({ type: "window", data: w })}>
              <Flower shape={w.actual === date ? "bloom" : "sprout"} color={tracks[w.track]?.color} size={20} dim={w.actual !== date} />
              <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{w.company}</div><div className="faint mono" style={{ fontSize: 13 }}>{w.actual === date ? "opens" : "expected"}{w.program ? " · " + w.program : ""}</div></div>
              <span className="chip" style={{ background: tracks[w.track]?.soft, color: tracks[w.track]?.color, fontSize: 11 }}>{tracks[w.track]?.short}</span>
            </div>))}
        </div>}
      <button className="pbtn pink" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal({ type: "event", data: { date } })}><Plus size={15} /> Add a star on this day</button>
    </Modal>);
}
