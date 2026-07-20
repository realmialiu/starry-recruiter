import { Download, Upload, Check } from "lucide-react";
import { rankFor, nextRank } from "../../data/gamification";
import { useTracks } from "../../context/TracksContext";
import Win from "../ui/Win";
import Pip from "../sprites/Pip";

/* ---------- profile ---------- */
export default function Profile({ profile, data, setProfile, logout, exportSave, importSave }) {
  const { tracks } = useTracks();
  const xp = profile.xp || 0; const r = rankFor(xp); const nx = nextRank(xp);
  const chats = data.chats.length, applied = data.companies.filter((c) => !["Interested", "Networking"].includes(c.stage)).length, offers = data.companies.filter((c) => c.stage === "Offer").length;
  const badges = [
    { got: chats >= 1, ico: "☕", n: "First Sip", d: "1st coffee chat" }, { got: chats >= 10, ico: "🦋", n: "Social", d: "10 chats" },
    { got: data.companies.length >= 1, ico: "⭐", n: "First Firm", d: "1st firm" }, { got: applied >= 1, ico: "📮", n: "Applied", d: "1st application" },
    { got: (data.events.length >= 10), ico: "✨", n: "Sky Watcher", d: "10 stars lit" }, { got: offers >= 1, ico: "🌟", n: "Offer!", d: "landed a star" },
  ];
  const toggleCalm = () => setProfile((p) => ({ ...p, settings: { ...(p.settings || {}), calm: !(p.settings?.calm) } }));
  return (
    <div>
      <div className="pagehead"><h1>Character</h1></div>
      <Win title="⋆ YOUR SKY" bodyStyle={{ padding: 20 }}>
        <div className="row gap16 wrap">
          <div style={{ background: "var(--blush)", border: "3px solid var(--ink)", borderRadius: 14, padding: 12 }}><Pip mood="cheer" size={78} /></div>
          <div className="grow" style={{ minWidth: 200 }}>
            <div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 700, fontSize: 24 }}>{profile.name}</div>
            <div className="muted" style={{ marginBottom: 8 }}>Class of {profile.gradClass} · {profile.tracks.filter((t) => tracks[t]).map((t) => tracks[t].short).join(" · ")}</div>
            <span className="rankpill">LV.{r.lv} {r.name.toUpperCase()}</span>
            <div className="xpbar" style={{ marginTop: 10 }}><div className="xpfill" style={{ width: (nx ? Math.round(((xp - r.at) / (nx.at - r.at)) * 100) : 100) + "%" }} /></div>
            <div className="mono" style={{ color: "var(--ink-soft)", marginTop: 3 }}>{nx ? `${xp}/${nx.at} XP · ${nx.at - xp} to ${nx.name}` : `${xp} XP · fully lit ⋆`} · ⋆ {profile.streak?.count || 0}d streak</div>
          </div>
        </div>
      </Win>
      <Win title="🏅 BADGES" tone="yellow" style={{ marginTop: 16 }}>
        <div className="co-grid">{badges.map((b) => <div key={b.n} className={"badge" + (b.got ? "" : " locked")}><div style={{ fontSize: 26 }}>{b.ico}</div><div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600 }}>{b.n}</div><div className="faint" style={{ fontSize: 11.5 }}>{b.d}</div></div>)}</div>
      </Win>
      <Win title="⚙ SETTINGS" tone="blue" style={{ marginTop: 16 }}>
        <label className="row gap10" style={{ cursor: "pointer", fontWeight: 700, marginBottom: 6 }}><span className={"tick" + (profile.settings?.calm ? " on" : "")} onClick={toggleCalm}>{profile.settings?.calm && <Check size={13} />}</span> Calm mode <span className="faint" style={{ fontWeight: 600, fontSize: 12 }}>— hide XP, streak & game bits</span></label>
        <p className="faint" style={{ fontSize: 12 }}>Your sky is saved on this device. Recruiting is stressful enough — the game layer is here to cheer you on, never to shame you.</p>
        <div className="row gap8 wrap" style={{ marginTop: 12 }}>
          <button className="pbtn ghost sm" onClick={exportSave}><Download size={13} /> Export backup</button>
          <label className="pbtn ghost sm" style={{ cursor: "pointer" }}><Upload size={13} /> Import backup
            <input type="file" accept="application/json,.json" style={{ display: "none" }} onChange={(e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { importSave(JSON.parse(String(r.result))); } catch (_) { importSave(null); } }; r.readAsText(file); e.target.value = ""; }} /></label>
          <button className="pbtn ghost sm" onClick={logout}>Switch / log out</button>
        </div>
        <p className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>Export saves a .json backup of everything on this device — keep it somewhere safe, or import it on another device.</p>
      </Win>
    </div>);
}
