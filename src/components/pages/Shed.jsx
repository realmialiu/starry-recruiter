import { Plus, FileText, Link2, ExternalLink, Edit3 } from "lucide-react";
import Win from "../ui/Win";
import Empty from "../ui/Empty";

/* ---------- shed (docs + links) ---------- */
export default function Shed({ data, setModal }) {
  return (
    <div>
      <div className="pagehead"><h1>Files</h1></div>
      <Win title="📄 DOCUMENTS" tone="blue" style={{ marginBottom: 16 }}>
        <div className="row between" style={{ marginBottom: 8 }}><span className="faint" style={{ fontSize: 12 }}>Paste Drive links (resumes, talking points). Live sync isn't available in-sandbox — a tidy clickable index.</span><button className="pbtn ghost sm" onClick={() => setModal({ type: "doc", data: {} })}><Plus size={13} /> Add</button></div>
        {data.docs.length === 0 ? <Empty shape="bloom" title="No documents" sub="Add your resume & talking-point docs." /> :
          <div className="co-grid">{data.docs.map((d) => <div key={d.id} className="link-card" onClick={() => setModal({ type: "doc", data: d })}><FileText size={17} color="var(--grape)" /><div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div><div className="faint mono" style={{ fontSize: 13 }}>{d.kind}</div></div><a href={d.url} target="_blank" rel="noreferrer" className="icon-btn" onClick={(e) => e.stopPropagation()}><ExternalLink size={14} /></a></div>)}</div>}
      </Win>
      <Win title="🔗 QUICK LINKS" tone="leaf">
        <div className="row between" style={{ marginBottom: 8 }}><span className="faint" style={{ fontSize: 12 }}>Repos, trackers, portals — anything you open constantly.</span><button className="pbtn ghost sm" onClick={() => setModal({ type: "link", data: {} })}><Plus size={13} /> Add</button></div>
        {data.links.length === 0 ? <Empty shape="sprout" title="No quick links" sub="Add your tracker or a repo." /> :
          <div className="co-grid">{data.links.map((l) => <a key={l.id} className="link-card" href={l.url} target="_blank" rel="noreferrer"><Link2 size={16} color="var(--stem)" /><div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.label}</div><div className="faint mono" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.url.replace(/^https?:\/\//, "")}</div></div><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={(e) => { e.preventDefault(); setModal({ type: "link", data: l }); }}><Edit3 size={12} /></button></a>)}</div>}
      </Win>
    </div>);
}
