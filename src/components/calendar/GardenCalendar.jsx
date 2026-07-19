import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, Trash2, Search, X, Moon } from "lucide-react";
import { ymd, today, sameDay, addDays, addMonths, startOfMonth, monthMatrix, fmtTime, parseYMD, MONTHS, MON_SHORT, DOW } from "../../utils/dates";
import { expandEvents } from "../../utils/recurrence";
import { TRACKS } from "../../data/tracks";
import { bloomHex } from "../../data/blooms";
import { CATEGORIES, catOf } from "../../data/categories";
import Flower from "../sprites/Flower";
import Empty from "../ui/Empty";
import GardenBeds from "./GardenBeds";

/* ---------- the garden (calendar) ---------- */
export default function GardenCalendar({ data, setModal, onBulkDelete, sunToday }) {
  const [cursor, setCursor] = useState(today());
  const [view, setView] = useState("garden");
  const [selMode, setSelMode] = useState(false);
  const [sel, setSel] = useState(() => new Set());
  const [q, setQ] = useState("");
  const [catF, setCatF] = useState("all");
  const toggleSel = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const exitSel = () => { setSelMode(false); setSel(new Set()); };
  const ql = q.trim().toLowerCase();
  const matchEv = (ev) => (catF === "all" || ev.cat === catF) && (!ql || `${ev.title} ${ev.location || ""} ${ev.notes || ""}`.toLowerCase().includes(ql));
  const matchWin = (w) => catF === "all" && (!ql || `${w.company} ${w.program || ""} ${w.expectedLabel || ""}`.toLowerCase().includes(ql));
  const matchFoc = (f) => catF === "all" && (!ql || (f.label || "").toLowerCase().includes(ql));

  const dropByDay = useMemo(() => {
    const m = {};
    data.windows.forEach((w) => { const exp = w.expected || w.start; if (exp) (m[exp] = m[exp] || []).push({ w, kind: "expected" }); if (w.actual) (m[w.actual] = m[w.actual] || []).push({ w, kind: "actual" }); });
    return m;
  }, [data.windows]);

  const dayItems = (d, byDay) => {
    const evs = (byDay[ymd(d)] || []).map((o) => ({ kind: "ev", o }));
    const marks = (dropByDay[ymd(d)] || []).filter((m) => matchWin(m.w));
    return [...marks.filter((m) => m.kind === "actual").map((m) => ({ kind: "actual", m })), ...evs, ...marks.filter((m) => m.kind === "expected").map((m) => ({ kind: "expected", m }))];
  };
  const bloomFor = (it, i, sz = 15) => {
    if (it.kind === "ev") {
      const c = catOf(it.o.ev.cat), seld = sel.has(it.o.ev.id);
      const sub = it.o.ev.allDay ? "" : (it.o.ev.start ? fmtTime(it.o.ev.start) : "");
      return (<button key={"e" + i} className={"ev-chip" + (seld ? " sel" : "")} title={it.o.ev.title}
        onClick={(e) => { e.stopPropagation(); selMode ? toggleSel(it.o.ev.id) : setModal({ type: "event", data: it.o.ev }); }}>
        {selMode && <span className={"tick sm" + (seld ? " on" : "")}>{seld && <Check size={10} />}</span>}
        <Flower shape={c.shape} color={bloomHex(it.o.ev.color)} size={sz} />
        <span className="ev-t">{it.o.ev.title}</span>{sub && <span className="ev-sub">{sub}</span>}</button>);
    }
    if (it.kind === "actual") {
      const landed = data.companies.some((c) => c.name.toLowerCase() === (it.m.w.company || "").toLowerCase() && c.stage === "Offer");
      return (<button key={"a" + i} className="ev-chip" title={`${it.m.w.company} opens${landed ? " · landed!" : ""}`}
        onClick={(e) => { e.stopPropagation(); setModal({ type: "window", data: it.m.w }); }}>
        <Flower shape={landed ? "sun" : "bloom"} color={landed ? "#F5D25E" : TRACKS[it.m.w.track]?.color} size={landed ? sz + 2 : sz} />
        <span className="ev-t">{it.m.w.company}{landed ? " ✦" : ""}</span><span className="ev-sub">opens</span></button>);
    }
    return (<button key={"x" + i} className="ev-chip dim" title={`${it.m.w.company} · expected`}
      onClick={(e) => { e.stopPropagation(); setModal({ type: "window", data: it.m.w }); }}>
      <Flower shape="sprout" color={TRACKS[it.m.w.track]?.color} size={sz} dim />
      <span className="ev-t">{it.m.w.company}</span><span className="ev-sub">exp.</span></button>);
  };

  const monthGarden = () => {
    const weeks = monthMatrix(cursor.getFullYear(), cursor.getMonth());
    const occ = expandEvents(data.events.filter(matchEv), weeks[0][0], weeks[5][6]);
    const byDay = {}; occ.forEach((o) => { const k = ymd(o.date); (byDay[k] = byDay[k] || []).push(o); });
    return (
      <div className="garden-inner">
        <GardenBeds monthStart={startOfMonth(cursor)} windows={data.windows.filter(matchWin)} focus={data.focus.filter(matchFoc)}
          onWin={(w) => setModal({ type: "window", data: w })} onFocus={(f) => setModal({ type: "focus", data: f })} />
        <div className="dow-row">{DOW.map((d) => <div key={d} className="dow">{d[0]}</div>)}</div>
        <div className="plots">
          {weeks.flat().map((d) => {
            const inM = d.getMonth() === cursor.getMonth(); const isT = sameDay(d, today());
            const items = dayItems(d, byDay);
            return (
              <div key={ymd(d)} className={"plot" + (inM ? "" : " out") + (isT ? " today" : "")}
                onClick={() => !selMode && setModal({ type: "event", data: { date: ymd(d) } })}>
                <div className="row between" style={{ width: "100%" }}>
                  {isT && sunToday ? <Moon size={13} color="var(--yellow)" fill="var(--yellow)" /> : <span />}<button className="plot-n" title="See this day" onClick={(e) => { e.stopPropagation(); setModal({ type: "day", date: ymd(d) }); }}>{d.getDate()}</button>
                </div>
                <div className="blooms">
                  {items.slice(0, 3).map((it, i) => bloomFor(it, i))}
                  {items.length > 3 && <button className="more" onClick={(e) => { e.stopPropagation(); setModal({ type: "day", date: ymd(d) }); }}>+{items.length - 3} more</button>}
                </div>
              </div>);
          })}
        </div>
        <div className="grass" />
      </div>);
  };

  const weekGarden = () => {
    const start = addDays(cursor, -cursor.getDay()); const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const occ = expandEvents(data.events.filter(matchEv), days[0], days[6]); const byDay = {}; occ.forEach((o) => { const k = ymd(o.date); (byDay[k] = byDay[k] || []).push(o); });
    return (
      <div className="garden-inner">
        <div className="plots">
          {days.map((d) => { const isT = sameDay(d, today()); const items = dayItems(d, byDay);
            return <div key={ymd(d)} className={"plot" + (isT ? " today" : "")} style={{ minHeight: 220 }} onClick={() => !selMode && setModal({ type: "event", data: { date: ymd(d) } })}>
              <div className="row between" style={{ width: "100%" }}><span className="dow" style={{ fontSize: 7 }}>{DOW[d.getDay()]}</span><span className="plot-n">{d.getDate()}</span></div>
              <div className="blooms" style={{ alignContent: "flex-start" }}>{items.map((it, i) => bloomFor(it, i, 16))}</div>
            </div>; })}
        </div><div className="grass" />
      </div>);
  };

  const listView = () => {
    const all = [...data.events].filter(matchEv).sort((a, b) => (a.date + (a.start || "")) < (b.date + (b.start || "")) ? -1 : 1);
    const ids = all.map((e) => e.id); const allSel = ids.length > 0 && ids.every((i) => sel.has(i));
    return (
      <div style={{ padding: "12px 14px 16px" }}>
        <div className="row gap10 wrap" style={{ marginBottom: 10 }}>
          <span className={"tick" + (allSel ? " on" : "")} style={{ cursor: "pointer" }} onClick={() => setSel(allSel ? new Set() : new Set(ids))}>{allSel && <Check size={13} />}</span>
          <span style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600 }}>{sel.size ? `${sel.size} picked` : `${all.length} stars`}</span>
          <div className="right row gap8">{sel.size > 0 && <button className="pbtn ghost sm" onClick={() => setSel(new Set())}>Clear</button>}
            <button className="pbtn danger sm" disabled={!sel.size} onClick={() => { onBulkDelete(sel); setSel(new Set()); }}><Trash2 size={13} /> Delete {sel.size || ""}</button></div>
        </div>
        {all.length === 0 ? <Empty title="No stars yet" sub="Add an event to your sky." /> :
          <div className="card" style={{ padding: 6 }}>{all.map((ev) => { const d = parseYMD(ev.date), past = d < today(), seld = sel.has(ev.id); const c = catOf(ev.cat);
            return <div key={ev.id} className="list-row" style={{ opacity: past ? .5 : 1 }} onClick={() => setModal({ type: "event", data: ev })}>
              <span className={"tick" + (seld ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggleSel(ev.id); }}>{seld && <Check size={13} />}</span>
              <Flower shape={c.shape} color={bloomHex(ev.color)} size={22} />
              <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}{ev.recur && ev.recur !== "none" ? <span className="faint" style={{ fontWeight: 600 }}> · repeats</span> : null}</div><div className="faint mono" style={{ fontSize: 14 }}>{c.label}{ev.location ? " · " + ev.location : ""}</div></div>
              <div style={{ textAlign: "right", flex: "0 0 auto" }}><div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 13 }}>{MON_SHORT[d.getMonth()]} {d.getDate()}</div><div className="faint mono" style={{ fontSize: 13 }}>{ev.allDay ? "all day" : (ev.start ? fmtTime(ev.start) : "")}</div></div>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={(e) => { e.stopPropagation(); onBulkDelete(new Set([ev.id])); }}><Trash2 size={13} /></button>
            </div>; })}</div>}
      </div>);
  };

  const title = view === "week" ? `Week of ${MON_SHORT[addDays(cursor, -cursor.getDay()).getMonth()]} ${addDays(cursor, -cursor.getDay()).getDate()}`
    : view === "list" ? "All stars" : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="sky">
      <div className="sky-top">
        <div className="row gap8">
          <button className="icon-btn" onClick={() => setCursor(view === "week" ? addDays(cursor, -7) : addMonths(cursor, -1))}><ChevronLeft size={16} /></button>
          <button className="icon-btn" onClick={() => setCursor(view === "week" ? addDays(cursor, 7) : addMonths(cursor, 1))}><ChevronRight size={16} /></button>
          <h2 style={{ fontSize: 19 }}>{title}</h2>
          <button className="pbtn ghost sm" onClick={() => setCursor(today())}>Today</button>
        </div>
        <div className="row gap8 wrap">
          <button className={"pbtn sm " + (selMode ? "grape" : "ghost")} onClick={() => selMode ? exitSel() : setSelMode(true)}><Check size={13} /> {selMode ? "Done" : "Pick"}</button>
          <div className="seg">{[["garden", "Sky"], ["week", "Week"], ["list", "All"]].map(([k, l]) => <button key={k} className={view === k ? "on" : ""} onClick={() => { setView(k); exitSel(); }}>{l}</button>)}</div>
        </div>
      </div>
      <div className="sky-tools">
        <div className="row gap6" style={{ flex: 1, minWidth: 150 }}>
          <Search size={14} color="rgba(255,255,255,.9)" />
          <input className="sky-search" style={{ flex: 1, minWidth: 0 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stars & firms…" />
          {q && <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setQ("")}><X size={13} /></button>}
        </div>
        <select className="sky-search" value={catF} onChange={(e) => setCatF(e.target.value)}>
          <option value="all">All kinds</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      {view === "garden" && monthGarden()}
      {view === "week" && weekGarden()}
      {view === "list" && listView()}
    </div>);
}
