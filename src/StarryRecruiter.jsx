import { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Building2, Coffee, Compass, FileText, Star, Wand2,
} from "lucide-react";

/* ⋆｡ﾟ  STARRY RECRUITER — a cozy pixel night-sky for internship recruiting
   The calendar is a night sky: each day is a patch of sky, each event is a star.
   You light stars up by applying / finishing events, and landing the job earns
   the brightest stars of all (XP). Persists per save-file via window.storage
   with an in-memory fallback so it never crashes.

   This file is the thin root/App component. The bulk of the implementation
   (date utils, static data tables, the smart-add parser, recurrence/lane
   logic, styles, sprites, shared UI primitives, calendar views, modals and
   pages) lives under src/utils, src/data, src/styles, src/hooks and
   src/components — see those directories for the decomposed pieces. */

/* ---------- storage ----------
   Persists to localStorage via the centralized storage service, namespaced
   per logged-in user. Kept as an async-looking interface since all call
   sites already `await` these calls. */
import { storage } from "./services/storage";
const store = {
  async get(k) { return storage.get(k, null); },
  async set(k, v) { storage.set(k, v); },
};

import { uid, ymd, today, addDays, parseYMD } from "./utils/dates";
import { seedTimelines } from "./data/timelines";
import { seedTracks } from "./data/tracks";
import { rankFor } from "./data/gamification";
import { XP } from "./data/gamification";
import { STYLES } from "./styles/starryStyles";
import { TracksProvider } from "./context/TracksContext";

import Flower from "./components/sprites/Flower";
import Pip from "./components/sprites/Pip";
import Field from "./components/ui/Field";

import GardenHome from "./components/pages/GardenHome";
import Roster from "./components/pages/Roster";
import Chats from "./components/pages/Chats";
import Guide from "./components/pages/Guide";
import Shed from "./components/pages/Shed";
import Profile from "./components/pages/Profile";
import Onboarding from "./components/pages/Onboarding";

import EventModal from "./components/modals/EventModal";
import WindowModal from "./components/modals/WindowModal";
import FocusModal from "./components/modals/FocusModal";
import SmartAddModal from "./components/modals/SmartAddModal";
import CompanyModal from "./components/modals/CompanyModal";
import CoffeeModal from "./components/modals/CoffeeModal";
import SimpleLinkModal from "./components/modals/SimpleLinkModal";
import TaskModal from "./components/modals/TaskModal";
import PhaseModal from "./components/modals/PhaseModal";
import DayModal from "./components/modals/DayModal";
import TrackModal from "./components/modals/TrackModal";

/* Re-exported for src/pages/Login.jsx and src/pages/SignUp.jsx, which reuse
   the pixel-window styling & shared UI primitives outside the app shell. */
export { STYLES, Pip, Field };

/* ---------- root ---------- */
const BLANK = { events: [], windows: [], focus: [], companies: [], chats: [], tasks: [], docs: [], links: [] };

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [profile, setProfileState] = useState(null);
  const [data, setData] = useState(BLANK);
  const [view, setView] = useState("home");
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const dTimer = useRef(null), pTimer = useRef(null);
  const ensureTL = (d) => ({ ...d, timelines: d.timelines || seedTimelines(), tracks: d.tracks || seedTracks() });

  const pushToast = (ico, title, sub) => { const id = uid(); setToasts((t) => [...t, { id, ico, title, sub }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400); };

  // profile setter keeps the profiles list in sync
  const setProfile = useCallback((updater) => setProfileState((prev) => {
    const np = typeof updater === "function" ? updater(prev) : updater;
    setProfiles((list) => list.map((x) => x.id === np.id ? np : x));
    return np;
  }), []);
  const award = (amt, ico, title) => { setProfile((p) => ({ ...p, xp: (p.xp || 0) + amt })); pushToast(ico, title, `+${amt} XP`); };

  useEffect(() => { (async () => {
    const list = (await store.get("profiles")) || []; const act = await store.get("active_profile");
    setProfiles(list);
    if (act && list.find((p) => p.id === act)) {
      let p = list.find((x) => x.id === act);
      const d = (await store.get("pdata:" + act)) || BLANK;
      // daily streak / check-in
      const td = ymd(today()); const s = p.streak || { count: 0, last: null };
      if (s.last !== td) { const gap = s.last ? Math.round((parseYMD(td) - parseYMD(s.last)) / 86400000) : 999; p = { ...p, streak: { count: gap === 1 ? (s.count || 0) + 1 : 1, last: td }, xp: (p.xp || 0) + XP.checkin }; setTimeout(() => pushToast("🌙", "Welcome back!", `+${XP.checkin} XP · day ${gap === 1 ? (s.count || 0) + 1 : 1}`), 500); }
      setActiveId(act); setProfileState(p); setProfiles((l) => l.map((x) => x.id === p.id ? p : x)); setData(ensureTL({ ...BLANK, ...d }));
    }
    setLoaded(true);
  })(); }, []);

  useEffect(() => { if (!activeId || !loaded) return; clearTimeout(dTimer.current); dTimer.current = setTimeout(() => store.set("pdata:" + activeId, data), 350); }, [data, activeId, loaded]);
  useEffect(() => { if (!loaded || profiles.length === 0) return; clearTimeout(pTimer.current); pTimer.current = setTimeout(() => store.set("profiles", profiles), 350); }, [profiles, loaded]);

  const createProfile = async (info) => {
    const np = { id: uid(), ...info, xp: 0, streak: { count: 1, last: ymd(today()) }, settings: {} };
    const list = [...profiles, np]; setProfiles(list); await store.set("profiles", list);
    await store.set("active_profile", np.id); const fresh = ensureTL(BLANK); await store.set("pdata:" + np.id, fresh);
    setActiveId(np.id); setProfileState(np); setData(fresh); setView("home");
  };
  const pickProfile = async (id) => { const p = profiles.find((x) => x.id === id); const d = (await store.get("pdata:" + id)) || BLANK; await store.set("active_profile", id); setActiveId(id); setProfileState(p); setData(ensureTL({ ...BLANK, ...d })); setView("home"); };
  const logout = async () => { await store.set("active_profile", null); setActiveId(null); setProfileState(null); setData(BLANK); };

  const update = useCallback((key, arr) => setData((d) => ({ ...d, [key]: arr })), []);
  const upsert = (key, item, isNew) => setData((d) => { const arr = d[key]; const i = arr.findIndex((x) => x.id === item.id); return { ...d, [key]: i === -1 ? [...arr, item] : arr.map((x) => x.id === item.id ? item : x) }; });
  const remove = (key, id) => setData((d) => ({ ...d, [key]: d[key].filter((x) => x.id !== id) }));
  const bulkDeleteEvents = (idSet) => setData((d) => ({ ...d, events: d.events.filter((e) => !idSet.has(e.id)) }));

  const saveEvent = (f) => { const isNew = !data.events.some((e) => e.id === f.id); upsert("events", f); if (isNew) award(XP.plant, "⭐", "A star appeared"); setModal(null); };
  const saveChat = (f) => { const isNew = !data.chats.some((e) => e.id === f.id); upsert("chats", f); if (isNew) award(XP.chat, "☕", "Chat logged"); setModal(null); };
  const saveCompany = (f) => { const isNew = !data.companies.some((e) => e.id === f.id); upsert("companies", f); if (isNew) award(XP.company, "⭐", "Firm added"); setModal(null); };
  const toggleTask = (t) => { const done = !t.done; upsert("tasks", { ...t, done }); if (done) award(XP.task, "✓", "Quest complete"); };
  const advanceStage = (id, stage) => { const co = data.companies.find((c) => c.id === id); update("companies", data.companies.map((x) => x.id === id ? { ...x, stage } : x)); if (co && co.stage !== stage) { if (stage === "Offer") award(XP.offer, "🌟", "You landed it — brightest star!"); else if (["Superday / Final", "1st Round", "OA / HireVue", "Applied"].includes(stage)) award(XP.stage, "✨", `Rose to ${stage}`); } };

  const slugify = (name) => name.trim().replace(/[^a-zA-Z0-9]+/g, "") || "Track";
  const uniqueKey = (base, existing) => { let k = base, i = 2; while (existing[k]) { k = base + i; i++; } return k; };
  const addTrack = (info) => setData((d) => { const tracks = { ...(d.tracks || seedTracks()) }; const key = uniqueKey(slugify(info.name), tracks); tracks[key] = { name: info.name, short: info.short, color: info.color, soft: info.soft }; return { ...d, tracks }; });
  const renameTrack = (key, info) => setData((d) => { const tracks = { ...(d.tracks || seedTracks()) }; if (!tracks[key]) return d; tracks[key] = { ...tracks[key], ...info }; return { ...d, tracks }; });
  const deleteTrack = (key) => {
    setData((d) => {
      const tracks = { ...(d.tracks || seedTracks()) };
      if (Object.keys(tracks).length <= 1 || !tracks[key]) return d;
      delete tracks[key];
      const fallback = Object.keys(tracks)[0];
      const timelines = { ...(d.timelines || seedTimelines()) }; delete timelines[key];
      const swap = (arr) => arr.map((x) => (x.track === key ? { ...x, track: fallback } : x));
      return { ...d, tracks, timelines, companies: swap(d.companies), windows: swap(d.windows), focus: swap(d.focus) };
    });
    setProfile((p) => { const list = (p.tracks || []).filter((t) => t !== key); return { ...p, tracks: list.length ? list : Object.keys((data.tracks || seedTracks())).filter((k) => k !== key) }; });
  };
  const setTimelines = (track, phases) => setData((d) => ({ ...d, timelines: { ...(d.timelines || seedTimelines()), [track]: phases } }));
  const upsertPhase = (track, phase) => setData((d) => { const tl = { ...(d.timelines || seedTimelines()) }; const arr = [...(tl[track] || [])]; const i = arr.findIndex((x) => x.id === phase.id); tl[track] = i === -1 ? [...arr, phase] : arr.map((x) => x.id === phase.id ? phase : x); return { ...d, timelines: tl }; });
  const removePhase = (track, id) => setData((d) => { const tl = { ...(d.timelines || seedTimelines()) }; tl[track] = (tl[track] || []).filter((x) => x.id !== id); return { ...d, timelines: tl }; });
  const commitSmart = (rows) => {
    setData((d) => { const windows = [...d.windows], companies = [...d.companies];
      rows.forEach((r) => { windows.push({ id: uid(), company: r.company, program: r.program, track: r.track, expectedLabel: r.timing.label, expected: ymd(r.timing.expected), actual: "", start: ymd(r.timing.start), end: ymd(r.timing.end), status: "Interested" });
        if (r.addCompany && !companies.some((c) => c.name.toLowerCase() === r.company.toLowerCase())) companies.push({ id: uid(), name: r.company, track: r.track, stage: "Interested", role: r.program || "", notes: "" }); });
      return { ...d, windows, companies }; });
    if (rows.length) award(rows.length * 8, "🌌", `${rows.length} drop${rows.length > 1 ? "s" : ""} mapped`);
    setModal(null);
  };
  const addFocusFromTimeline = (label, track, color) => { upsert("focus", { id: uid(), label, track, color, start: ymd(today()), end: ymd(addDays(today(), 45)) }); setView("home"); };
  const exportSave = () => { try { const payload = { app: "StarryRecruiter", version: 1, exportedAt: new Date().toISOString(), profile, data }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `starry-${(profile?.name || "save").replace(/\\s+/g, "-").toLowerCase()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1200); pushToast("💾", "Backup saved", "downloaded a .json"); } catch (e) { pushToast("⚠️", "Export failed", "try again"); } };
  const importSave = (obj) => { if (!obj || typeof obj !== "object" || !obj.data) { pushToast("⚠️", "Import failed", "not a valid backup"); return; } setData(ensureTL({ ...BLANK, ...obj.data })); if (obj.profile) setProfile((p) => ({ ...p, ...obj.profile, id: p.id })); pushToast("📥", "Backup loaded", "your sky is restored"); };

  const trackCtx = { tracks: data.tracks || seedTracks(), addTrack, renameTrack, deleteTrack };

  if (!loaded) return <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><style>{STYLES}</style><div style={{ textAlign: "center" }}><Pip size={64} /><div className="pixel spark" style={{ fontSize: 11, marginTop: 10 }}>LOADING...</div></div></div>;
  if (!profile) return <TracksProvider value={trackCtx}><Onboarding profiles={profiles} onCreate={createProfile} onPick={pickProfile} /></TracksProvider>;

  const NAV = [["home", "Sky", Home], ["roster", "Roster", Building2], ["chats", "Chats", Coffee], ["guide", "Guide", Compass], ["shed", "Files", FileText], ["me", "Me", Star]];

  return (
    <TracksProvider value={trackCtx}>
    <div className="gr">
      <style>{STYLES}</style>
      <div className="shell">
        <aside className="side">
          <div className="brand"><Flower shape="bloom" color="var(--pink)" size={26} /><span className="logo">Starry</span></div>
          {NAV.map(([k, l, Ico]) => <button key={k} className={"nav" + (view === k ? " active" : "")} onClick={() => setView(k)}><Ico size={16} /> {l}</button>)}
          <div className="grow" />
          <button className="pbtn pink" style={{ justifyContent: "center", marginBottom: 8 }} onClick={() => setModal({ type: "smart" })}><Wand2 size={14} /> Map the sky</button>
          <div className="row gap8" style={{ padding: "8px 6px 0", borderTop: "2px solid var(--line)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, border: "2px solid var(--ink)", background: "var(--grape)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pixelify Sans'", fontWeight: 700, fontSize: 13 }}>{profile.name[0]?.toUpperCase()}</div>
            <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div><div className="faint mono" style={{ fontSize: 12 }}>Lv.{rankFor(profile.xp || 0).lv} {rankFor(profile.xp || 0).name}</div></div>
          </div>
        </aside>

        <main className="main">
          {view === "home" && <GardenHome data={data} profile={profile} setModal={setModal} setView={setView} toggleTask={toggleTask} onBulkDelete={bulkDeleteEvents} />}
          {view === "roster" && <Roster data={data} setModal={setModal} update={update} advanceStage={advanceStage} />}
          {view === "chats" && <Chats data={data} setModal={setModal} />}
          {view === "guide" && <Guide profile={profile} timelines={data.timelines} setTimelines={setTimelines} addFocus={addFocusFromTimeline} setModal={setModal} />}
          {view === "shed" && <Shed data={data} setModal={setModal} />}
          {view === "me" && <Profile profile={profile} data={data} setProfile={setProfile} logout={logout} exportSave={exportSave} importSave={importSave} />}
        </main>
      </div>

      <nav className="tabbar">{NAV.map(([k, l, Ico]) => <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}><Ico size={18} /> {l}</button>)}</nav>

      <div className="toast-wrap">{toasts.map((t) => <div key={t.id} className="toast"><div className="ico">{t.ico}</div><div><div className="t">{t.title}</div><div className="mono" style={{ fontSize: 14, color: "var(--stem)" }}>{t.sub}</div></div></div>)}</div>

      {modal?.type === "event" && <EventModal data={modal.data} companies={data.companies} onSave={saveEvent} onDelete={(id) => { remove("events", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "window" && <WindowModal data={modal.data} onSave={(f) => { upsert("windows", f); setModal(null); }} onDelete={(id) => { remove("windows", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "focus" && <FocusModal data={modal.data} onSave={(f) => { upsert("focus", f); setModal(null); }} onDelete={(id) => { remove("focus", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "smart" && <SmartAddModal onCommit={commitSmart} onClose={() => setModal(null)} />}
      {modal?.type === "company" && <CompanyModal data={modal.data} onSave={saveCompany} onDelete={(id) => { remove("companies", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "coffee" && <CoffeeModal data={modal.data} companies={data.companies} onSave={saveChat} onDelete={(id) => { remove("chats", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "doc" && <SimpleLinkModal kind="doc" data={modal.data} onSave={(f) => { upsert("docs", f); setModal(null); }} onDelete={(id) => { remove("docs", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "link" && <SimpleLinkModal kind="link" data={modal.data} onSave={(f) => { upsert("links", f); setModal(null); }} onDelete={(id) => { remove("links", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "task" && <TaskModal data={modal.data} onSave={(f) => { upsert("tasks", f); setModal(null); }} onDelete={(id) => { remove("tasks", id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "day" && <DayModal date={modal.date} data={data} setModal={setModal} />}
      {modal?.type === "phase" && <PhaseModal data={modal.data} onSave={(track, phase) => { upsertPhase(track, phase); setModal(null); }} onDelete={(track, id) => { removePhase(track, id); setModal(null); }} onClose={() => setModal(null)} />}
      {modal?.type === "track" && <TrackModal data={modal.data} canDelete={Object.keys(data.tracks || seedTracks()).length > 1} onSave={(key, info) => { if (key) renameTrack(key, info); else addTrack(info); setModal(null); }} onDelete={(key) => { deleteTrack(key); setModal(null); }} onClose={() => setModal(null)} />}
    </div>
    </TracksProvider>);
}
