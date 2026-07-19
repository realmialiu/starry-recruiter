import { Plus } from "lucide-react";
import { relDay, parseYMD } from "../../utils/dates";
import Win from "../ui/Win";
import Empty from "../ui/Empty";

/* ---------- chats ---------- */
export default function Chats({ data, setModal }) {
  const groups = { requested: "Requested", scheduled: "Scheduled", "follow-up": "Needs follow-up", done: "Done" };
  return (
    <div>
      <div className="pagehead"><h1>☕ Coffee chats</h1><button className="pbtn pink" onClick={() => setModal({ type: "coffee", data: {} })}><Plus size={15} /> Log chat</button></div>
      {data.chats.length === 0 ? <Win title="☕ ALLIES"><Empty shape="bloom" title="No chats yet" sub="Log every networking conversation & keep your talking points here." /></Win>
        : <div className="col gap16">{Object.entries(groups).map(([k, label]) => { const list = data.chats.filter((c) => c.status === k).sort((a, b) => a.date < b.date ? 1 : -1); if (!list.length) return null;
          return <Win key={k} title={`${label} · ${list.length}`} tone={k === "done" ? "leaf" : k === "follow-up" ? "yellow" : "pink"} bodyStyle={{ padding: 10 }}>
            {list.map((c) => <div key={c.id} className="list-row" onClick={() => setModal({ type: "coffee", data: c })}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--pink)", border: "2px solid var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pixelify Sans'", fontWeight: 700, flex: "0 0 auto" }}>{c.person[0]?.toUpperCase()}</div>
              <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{c.person} {c.company && <span className="muted" style={{ fontWeight: 600 }}>· {c.company}</span>}</div><div className="faint mono" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role}{c.notes ? " — " + c.notes : ""}</div></div>
              <span className="faint" style={{ fontSize: 12 }}>{relDay(parseYMD(c.date))}</span></div>)}
          </Win>; })}</div>}
    </div>);
}
