import { useState } from "react";
import { Plus, CircleDot, Edit3, Pin, Coffee } from "lucide-react";
import { relDay, parseYMD } from "../../utils/dates";
import { useTracks } from "../../context/TracksContext";
import { STAGES, stageColor } from "../../data/stages";
import { catOf } from "../../data/categories";
import { bloomHex } from "../../data/blooms";
import Win from "../ui/Win";
import Empty from "../ui/Empty";
import Flower from "../sprites/Flower";

/* ---------- roster (companies) ---------- */
export default function Roster({ data, setModal, update, advanceStage }) {
  const { tracks } = useTracks();
  const [sel, setSel] = useState(null);
  const co = sel ? data.companies.find((c) => c.id === sel) : null;
  const coW = co ? data.windows.filter((w) => w.company.toLowerCase() === co.name.toLowerCase()) : [];
  const coE = co ? data.events.filter((e) => e.companyId === co.id) : [];
  const coC = co ? data.chats.filter((c) => c.company?.toLowerCase() === co.name.toLowerCase()) : [];
  const Card = (c) => (<div key={c.id} className="card" style={{ padding: 13, cursor: "pointer", borderColor: sel === c.id ? tracks[c.track]?.color : "var(--ink)" }} onClick={() => setSel(sel === c.id ? null : c.id)}>
    <div className="row between"><span className="chip" style={{ background: tracks[c.track]?.soft, color: tracks[c.track]?.color }}>{tracks[c.track]?.short}</span><span className="chip" style={{ background: stageColor(c.stage) + "26", color: stageColor(c.stage) }}><CircleDot size={11} /> {c.stage}</span></div>
    <div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 18, marginTop: 9 }}>{c.name}</div>{c.role && <div className="muted" style={{ fontSize: 12.5 }}>{c.role}</div>}</div>);
  return (
    <div>
      <div className="pagehead"><h1>Roster</h1><button className="pbtn" onClick={() => setModal({ type: "company", data: {} })}><Plus size={15} /> Add firm</button></div>
      {data.companies.length === 0 ? <Win title="ROSTER.DIR"><Empty shape="bloom" title="Your roster's empty" sub="Add a firm to track its drops & status." /></Win>
        : sel ? <div className="co-split"><div className="col gap12">{data.companies.map(Card)}</div>
          {co && <Win title={`🏢 ${co.name}`}>
            <div className="row between" style={{ marginBottom: 8 }}><div className="muted">{co.role} · {tracks[co.track]?.name}</div><button className="pbtn ghost sm" onClick={() => setModal({ type: "company", data: co })}><Edit3 size={13} /> Edit</button></div>
            <label className="label">Pipeline</label><div className="row gap6 wrap" style={{ marginBottom: 10 }}>{STAGES.slice(0, 7).map((s) => <button key={s} className="chip" style={{ cursor: "pointer", background: co.stage === s ? stageColor(s) : "#fff", color: co.stage === s ? "#fff" : "var(--ink-soft)" }} onClick={() => advanceStage(co.id, s)}>{s}</button>)}</div>
            {co.notes && <div style={{ background: "var(--paper2)", borderRadius: 10, padding: "9px 12px", fontSize: 13, marginBottom: 10 }}>{co.notes}</div>}
            <label className="label">Application drops</label>{coW.length ? coW.map((w) => <div key={w.id} className="list-row" onClick={() => setModal({ type: "window", data: w })}><Pin size={13} color={tracks[w.track]?.color} /><div className="grow">{w.program || "Application"}</div><span className="faint mono">{w.expectedLabel}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>None.</div>}
            <label className="label" style={{ marginTop: 8 }}>Stars (events)</label>{coE.length ? coE.map((e) => <div key={e.id} className="list-row" onClick={() => setModal({ type: "event", data: e })}><Flower shape={catOf(e.cat).shape} color={bloomHex(e.color)} size={18} /><div className="grow">{e.title}</div><span className="faint mono">{relDay(parseYMD(e.date))}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>No events linked.</div>}
            <label className="label" style={{ marginTop: 8 }}>Coffee chats</label>{coC.length ? coC.map((c) => <div key={c.id} className="list-row" onClick={() => setModal({ type: "coffee", data: c })}><Coffee size={13} color="var(--pink)" /><div className="grow">{c.person} · {c.role}</div><span className="faint">{c.status}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>No chats logged.</div>}
          </Win>}
        </div> : <div className="co-grid">{data.companies.map(Card)}</div>}
    </div>);
}
