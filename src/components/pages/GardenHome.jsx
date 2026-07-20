import { useMemo } from "react";
import { Wand2, Plus, Bell } from "lucide-react";
import { today, addDays, ymd, parseYMD, relDay, fmtTime } from "../../utils/dates";
import { expandEvents } from "../../utils/recurrence";
import { useTracks } from "../../context/TracksContext";
import { bloomHex } from "../../data/blooms";
import { catOf } from "../../data/categories";
import { XP } from "../../data/gamification";
import Win from "../ui/Win";
import Empty from "../ui/Empty";
import Flower from "../sprites/Flower";
import GameStrip from "./GameStrip";
import GardenCalendar from "../calendar/GardenCalendar";

/* ---------- home = the garden ---------- */
export default function GardenHome({ data, profile, setModal, setView, toggleTask, onBulkDelete }) {
  const { tracks } = useTracks();
  const t0 = today();
  const upcoming = useMemo(() => expandEvents(data.events, t0, addDays(t0, 120)).filter((o) => o.isStart)
    .sort((a, b) => (ymd(a.date) + (a.ev.start || "")) < (ymd(b.date) + (b.ev.start || "")) ? -1 : 1).slice(0, 5), [data.events]);
  const reminders = expandEvents(data.events, t0, addDays(t0, 21)).filter((o) => o.isStart && o.ev.notify);
  const tasks = data.tasks.filter((t) => !t.done).sort((a, b) => (a.due || "9") < (b.due || "9") ? -1 : 1);
  const drops = data.windows.map((w) => ({ w, d: parseYMD(w.actual || w.expected || w.start) })).filter((x) => x.d >= addDays(t0, -1)).sort((a, b) => a.d - b.d);
  const openBeds = data.windows.filter((w) => parseYMD(w.end) >= t0).length;
  const hour = new Date().getHours(); const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="pagehead">
        <div>
          <div className="mono" style={{ color: "var(--ink-soft)" }}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1>{greet}, {profile.name.split(" ")[0]} <span className="spark">⋆</span></h1>
          <div className="muted">Class of {profile.gradClass} · {profile.tracks.filter((t) => tracks[t]).map((t) => tracks[t].short).join(" · ")}</div>
        </div>
        <div className="row gap8 wrap">
          <button className="pbtn ghost" onClick={() => setModal({ type: "smart" })}><Wand2 size={15} /> Map the sky</button>
          <button className="pbtn" onClick={() => setModal({ type: "event", data: {} })}><Plus size={15} /> Add star</button>
        </div>
      </div>

      {!profile.settings?.calm && <GameStrip profile={profile} />}

      <div className="row gap12 wrap" style={{ marginBottom: 16 }}>
        {[["Drops", openBeds, "grape"], ["Coffee chats", data.chats.length, "pink"], ["Firms", data.companies.length, "blue"], ["Quests", tasks.length, "yellow"]].map(([l, n, c]) => (
          <div key={l} className="stat grow" style={{ minWidth: 110 }}><div className="big" style={{ color: `var(--${c})` }}>{n}</div><div className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{l}</div></div>))}
      </div>

      {reminders.length > 0 && <div className="win" style={{ marginBottom: 16, borderColor: "var(--yellow)" }}><div style={{ padding: "10px 14px", background: "var(--butter)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}><Bell size={15} /> {reminders.length} reminder{reminders.length > 1 ? "s" : ""} soon — {reminders.slice(0, 2).map((r) => `${r.ev.title} (${relDay(r.date)})`).join(", ")}{reminders.length > 2 ? "…" : ""}</div></div>}

      <div className="dash">
        <GardenCalendar data={data} setModal={setModal} onBulkDelete={onBulkDelete} sunToday />
        <div className="col gap16">
          <Win title="⋆ Upcoming" tone="pink" bodyStyle={{ padding: 12 }}>
            {upcoming.length === 0 ? <Empty shape="bloom" title="Nothing coming up" sub="Add a coffee chat or deadline." /> :
              <div className="col gap2">{upcoming.map((o, i) => { const c = catOf(o.ev.cat); return (
                <div key={i} className="list-row" style={{ padding: "7px 9px" }} onClick={() => setModal({ type: "event", data: o.ev })}>
                  <Flower shape={c.shape} color={bloomHex(o.ev.color)} size={20} />
                  <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.ev.title}</div><div className="faint mono" style={{ fontSize: 13 }}>{c.label}</div></div>
                  <div style={{ textAlign: "right", flex: "0 0 auto" }}><div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 12 }}>{relDay(o.date)}</div>{!o.ev.allDay && o.ev.start && <div className="faint mono" style={{ fontSize: 12 }}>{fmtTime(o.ev.start)}</div>}</div>
                </div>); })}</div>}
          </Win>
          <Win title="✓ Quests" tone="leaf" bodyStyle={{ padding: 12 }}>
            <div className="row between" style={{ marginBottom: 6 }}><span className="faint mono" style={{ fontSize: 14 }}>finish these today</span><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setModal({ type: "task", data: {} })}><Plus size={14} /></button></div>
            {tasks.length === 0 ? <Empty shape="sprout" title="All done ⋆" sub="Add a quest to keep shining." /> :
              <div className="col gap2">{tasks.slice(0, 7).map((t) => (
                <div key={t.id} className="list-row" style={{ padding: "7px 9px" }} onClick={() => setModal({ type: "task", data: t })}>
                  <span className="tick" onClick={(e) => { e.stopPropagation(); toggleTask(t); }} />
                  <div className="grow"><div style={{ fontWeight: 700 }}>{t.title}</div>{t.due && <div className="faint mono" style={{ fontSize: 13 }}>{relDay(parseYMD(t.due))}</div>}</div>
                  <span className="chip" style={{ background: "var(--soil)", fontSize: 11 }}>+{XP.task}</span>
                </div>))}</div>}
          </Win>
          <Win title="👀 Keep an eye out" tone="yellow" bodyStyle={{ padding: 12 }}>
            {drops.length === 0 ? <Empty shape="sun" title="Nothing on the radar" sub="Map the sky to add expected drops." /> :
              <div className="col gap2">{drops.slice(0, 6).map(({ w, d }) => { const conf = !!w.actual; return (
                <div key={w.id} className="list-row" style={{ padding: "7px 9px" }} onClick={() => setModal({ type: "window", data: w })}>
                  <Flower shape={conf ? "bloom" : "sprout"} color={tracks[w.track]?.color} size={20} dim={!conf} />
                  <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13, color: conf ? "var(--ink)" : "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.company}</div><div className="faint mono" style={{ fontSize: 13 }}>{conf ? "opens" : "expected"} · {w.expectedLabel || relDay(d)}</div></div>
                  <span className="chip" style={{ background: tracks[w.track]?.soft, color: tracks[w.track]?.color, fontSize: 11 }}>{tracks[w.track]?.short}</span>
                </div>); })}</div>}
          </Win>
        </div>
      </div>
    </div>);
}
