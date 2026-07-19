import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Plus, X, ChevronLeft, ChevronRight, Check, Trash2, Bell, Coffee, Building2,
  Compass, FileText, Link2, Sprout, Flower2, Sun, Leaf, Droplets, Calendar as CalIcon,
  Home, Target, Pin, Edit3, Wand2, Star, Moon, Settings as Cog, Sparkles, ExternalLink, CircleDot,
  Search, Filter, Download, Upload, Copy
} from "lucide-react";

/* ⋆｡ﾟ  STARRY RECRUITER — a cozy pixel night-sky for internship recruiting
   The calendar is a night sky: each day is a patch of sky, each event is a star.
   You light stars up by applying / finishing events, and landing the job earns
   the brightest stars of all (XP). Persists per save-file via window.storage
   with an in-memory fallback so it never crashes. */

/* ---------- storage ----------
   Persists to localStorage via the centralized storage service, namespaced
   per logged-in user. Kept as an async-looking interface since all call
   sites already `await` these calls. */
import { storage } from "./services/storage";
const store = {
  async get(k) { return storage.get(k, null); },
  async set(k, v) { storage.set(k, v); },
};

/* ---------- id + date utils ---------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYMD = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const sameDay = (a, b) => ymd(a) === ymd(b);
const daysInMonth = (d) => endOfMonth(d).getDate();
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MON_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function monthMatrix(y, m) {
  const first = new Date(y, m, 1); const start = addDays(first, -first.getDay());
  const weeks = [];
  for (let w = 0; w < 6; w++) { const row = []; for (let d = 0; d < 7; d++) row.push(addDays(start, w * 7 + d)); weeks.push(row); }
  return weeks;
}
const fmtTime = (t) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}${m ? ":" + pad(m) : ""}${ap}`; };
function relDay(d) {
  const diff = Math.round((parseYMD(ymd(d)) - today()) / 86400000);
  if (diff === 0) return "today"; if (diff === 1) return "tomorrow"; if (diff === -1) return "yesterday";
  if (diff > 1 && diff < 7) return `in ${diff}d`; if (diff < 0) return `${-diff}d ago`;
  return `${MON_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/* ---------- starry palettes ---------- */
const TRACKS = {
  IB: { name: "Investment Banking", color: "#9B7FE0", soft: "#EDE6FB", short: "IB" },
  Consulting: { name: "Consulting", color: "#EEA65A", soft: "#FBEEDD", short: "Con" },
  PM: { name: "Product Management", color: "#7FB4E8", soft: "#E6F1FB", short: "PM" },
};
/* star colors — pastel pink / purple / yellow / blue */
const BLOOMS = [
  { id: "pink", hex: "#F48FB6" }, { id: "rose", hex: "#EE8FA8" }, { id: "purple", hex: "#C9A3F0" },
  { id: "grape", hex: "#9B7FE0" }, { id: "peri", hex: "#A9A7F0" }, { id: "blue", hex: "#8FBEEC" },
  { id: "yellow", hex: "#F3C64E" }, { id: "mint", hex: "#7FC98E" },
];
const bloomHex = (id) => (BLOOMS.find((b) => b.id === id) || BLOOMS[0]).hex;

/* categories = star kinds */
const CATEGORIES = [
  { id: "coffee", label: "Coffee chat", shape: "bloom", color: "pink" },
  { id: "info", label: "Info session", shape: "bloom", color: "blue" },
  { id: "insight", label: "Insight / diversity event", shape: "bloom", color: "purple" },
  { id: "deadline", label: "Application deadline", shape: "sun", color: "yellow" },
  { id: "interview", label: "Interview / superday", shape: "bloom", color: "rose" },
  { id: "prep", label: "Prep / study", shape: "sprout", color: "mint" },
  { id: "other", label: "Other", shape: "bloom", color: "peri" },
];
const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[6];

const STAGES = ["Interested", "Networking", "Applied", "OA / HireVue", "1st Round", "Superday / Final", "Offer", "Rejected", "Withdrawn"];
const stageColor = (s) => ({
  "Interested": "#B7ADC9", "Networking": "#C9A3F0", "Applied": "#8FBEEC", "OA / HireVue": "#F3C64E",
  "1st Round": "#EEA65A", "Superday / Final": "#9B7FE0", "Offer": "#7FC98E", "Rejected": "#E39A9A", "Withdrawn": "#CFC7DA",
}[s] || "#B7ADC9");

/* ---------- gamification ---------- */
const RANKS = [
  { lv: 1, name: "Stargazer", at: 0 }, { lv: 2, name: "Wisher", at: 100 }, { lv: 3, name: "Comet", at: 300 },
  { lv: 4, name: "Nova", at: 600 }, { lv: 5, name: "Constellation", at: 1000 }, { lv: 6, name: "Supernova", at: 1500 },
  { lv: 7, name: "Galaxy", at: 2200 }, { lv: 8, name: "Starlight Legend", at: 3000 },
];
const rankFor = (xp) => { let r = RANKS[0]; for (const x of RANKS) if (xp >= x.at) r = x; return r; };
const nextRank = (xp) => RANKS.find((x) => x.at > xp) || null;
const XP = { checkin: 5, task: 10, company: 5, chat: 30, thanks: 15, prep: 20, apply: 40, stage: 100, offer: 250, plant: 8 };

/* ---------- smart-add parser ---------- */
const MONTH_IDX = { jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11 };
const SEASON = { spring:{m:2,span:2}, summer:{m:5,span:2}, fall:{m:8,span:2}, autumn:{m:8,span:2}, winter:{m:11,span:2} };
function guessTrack(t) {
  t = t.toLowerCase();
  if (/consult|casing|case comp|kickstart|bcg|bain|mckinsey|deloitte|strategy&|oliver wyman/.test(t)) return "Consulting";
  if (/\bpm\b|product manag|apm|rpm|associate product/.test(t)) return "PM";
  if (/\bib\b|invest|banking|markets|s&t|analyst|goldman|morgan|jpm|evercore|lazard|moelis|first forward|entrepreneurial/.test(t)) return "IB";
  return null;
}
function parseExpected(raw) {
  const s = raw.toLowerCase(); const ym = s.match(/20\d\d/); const year = ym ? +ym[0] : new Date().getFullYear() + 1;
  const early = /early/.test(s), late = /late/.test(s), mid = /mid/.test(s); const day = early ? 5 : late ? 25 : mid ? 15 : 1;
  for (const k in MONTH_IDX) if (new RegExp(`\\b${k}\\b`).test(s)) { const m = MONTH_IDX[k]; return { label: `${MONTHS[m]} ${year}`, expected: new Date(year, m, day), start: new Date(year, m, 1), end: endOfMonth(new Date(year, m, 1)) }; }
  for (const k in SEASON) if (new RegExp(`\\b${k}\\b`).test(s)) { const { m, span } = SEASON[k]; return { label: `${k[0].toUpperCase() + k.slice(1)} ${year}`, expected: new Date(year, m + 1, 1), start: new Date(year, m, 1), end: endOfMonth(new Date(year, m + span, 1)) }; }
  return { label: `${year}`, expected: new Date(year, 5, 1), start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
}
function smartParse(block, fallback) {
  const rows = [];
  block.split(/\n+/).forEach((line) => {
    const t = line.trim(); if (!t) return;
    let cols = (t.includes("\t") ? t.split(/\t+/) : t.split(/\s{2,}/)).map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) { const em = t.match(/expected.*/i); if (em) rows.push({ company: t.slice(0, em.index).trim(), program: "", eligibility: "", timing: parseExpected(em[0]), track: guessTrack(t) || fallback, include: true, addCompany: true, id: uid() }); return; }
    const expCol = cols.find((c) => /expected|20\d\d|spring|summer|fall|winter|autumn/i.test(c)) || cols[cols.length - 1];
    const rest = cols.slice(1).filter((c) => c !== expCol);
    rows.push({ company: cols[0], program: rest[0] || "", eligibility: rest.slice(1).join(" · "), timing: parseExpected(expCol), track: guessTrack(cols[0] + " " + (rest[0] || "")) || fallback, include: true, addCompany: true, id: uid() });
  });
  return rows;
}

/* ---------- planting guide (editable timelines) ---------- */
const TIMELINES = {
  IB: [
    { phase: "Chart your map", when: "Now – Summer 2026", color: "mint", tasks: ["Lock in accounting fundamentals (3-statement linkages).", "Build a clean 1-page resume; get it reviewed 2–3x.", "Start a target list: bulge brackets, elite boutiques, MM.", "Send your first 5 cold emails."] },
    { phase: "Catch the early light", when: "Aug 2026 – Jan 2027", color: "purple", tasks: ["Apply to sophomore / diversity insight programs (GS, MS, JPM, Evercore).", "Most diversity apps drop late summer–fall.", "Attend info sessions & log every recruiter."] },
    { phase: "Sharpen your shine", when: "Oct 2026 – Feb 2027", color: "peri", tasks: ["Drill valuation: DCF, comps, precedents.", "Learn LBO mechanics + accretion/dilution.", "Be able to walk through each cold."] },
    { phase: "Build your constellation", when: "Nov 2026 – Apr 2027", color: "pink", tasks: ["15–20 coffee chats/month.", "Convert chats into referrals.", "Keep a talking-points doc per person."] },
    { phase: "Sophomore-summer launch", when: "Jan – Apr 2027", color: "yellow", tasks: ["Sophomore SA / off-cycle apps open — apply day-one.", "HireVues + technical/behavioral rounds."] },
    { phase: "Junior 2028 SA (early!)", when: "Spring – Summer 2027", color: "rose", tasks: ["Junior SA apps open extremely early.", "Have story, technicals, referrals ready.", "Be interview-ready before apps drop."] },
  ],
  Consulting: [
    { phase: "Chart your map", when: "Now – Summer 2026", color: "mint", tasks: ["Resume tuned for impact + leadership.", "Read up on the case interview structure.", "Target list: MBB + T2."] },
    { phase: "Line up your launches", when: "Aug 2026 – Jan 2027", color: "purple", tasks: ["Apply to sophomore programs (BCG, Bain, McKinsey insight days).", "Bain First Forward, BEL, Kickstart — log drop windows.", "Attend recruiting events."] },
    { phase: "Sharpen your casing", when: "Feb – May 2027", color: "peri", tasks: ["2–3 live cases/week with partners.", "Market sizing, profitability, M&A drills.", "Sharpen your 'so what' synthesis."] },
    { phase: "Build your constellation", when: "Nov 2026 – Jun 2027", color: "pink", tasks: ["Coffee chats with consultants across levels.", "Attend affinity events.", "Track referral offers."] },
    { phase: "Junior 2028 launch", when: "Jan – Aug 2027", color: "yellow", tasks: ["Junior internship apps open rolling.", "Behavioral + case rounds through summer/fall."] },
  ],
  PM: [
    { phase: "Chart your map", when: "Now – Summer 2026", color: "mint", tasks: ["Resume showing shipped projects / impact.", "Start a portfolio / teardown doc.", "Target list: APM/PM internship programs."] },
    { phase: "Build product sense", when: "Fall 2026 – Spring 2027", color: "peri", tasks: ["Practice product-sense & design questions.", "Basic analytics/SQL + metrics.", "Ship 1 side project or OSS contribution."] },
    { phase: "Line up your launches", when: "Aug 2026 – Feb 2027", color: "purple", tasks: ["Apply to sophomore/rotational & diversity PM programs.", "Many PM apps open in the fall — apply early."] },
    { phase: "Build your constellation", when: "Ongoing", color: "pink", tasks: ["Coffee chats with PMs & APMs.", "Referrals matter a lot for PM."] },
    { phase: "2027 & 2028 launches", when: "Fall 2026 – Spring 2028", color: "yellow", tasks: ["Behavioral + product + execution rounds.", "Prep take-homes & case-style interviews."] },
  ],
};
const seedTimelines = () => { const o = {}; for (const k in TIMELINES) o[k] = TIMELINES[k].map((p) => ({ id: uid(), phase: p.phase, when: p.when, color: p.color, tasks: p.tasks.map((t) => ({ id: uid(), text: t })) })); return o; };

/* ---------- recurrence + lane packing ---------- */
function expandEvents(events, rStart, rEnd) {
  const out = [];
  for (const ev of events) {
    const base = parseYMD(ev.date); const end = ev.endDate ? parseYMD(ev.endDate) : base;
    const span = Math.max(0, Math.round((end - base) / 86400000));
    const push = (start) => { for (let i = 0; i <= span; i++) { const d = addDays(start, i); if (d >= rStart && d <= rEnd) out.push({ ev, date: d, isStart: i === 0 }); } };
    if (!ev.recur || ev.recur === "none") { push(base); continue; }
    const until = ev.recurUntil ? parseYMD(ev.recurUntil) : addMonths(rEnd, 1);
    let cur = new Date(base), guard = 0;
    while (cur <= rEnd && cur <= until && guard < 500) {
      if (addDays(cur, span) >= rStart) push(cur);
      if (ev.recur === "weekly") cur = addDays(cur, 7); else if (ev.recur === "biweekly") cur = addDays(cur, 14); else if (ev.recur === "monthly") cur = addMonths(cur, 1); else break;
      guard++;
    }
  }
  return out;
}
function packLanes(items) {
  const lanes = []; const sorted = [...items].sort((a, b) => a.s - b.s);
  for (const it of sorted) { let placed = false; for (let i = 0; i < lanes.length; i++) { if (lanes[i][lanes[i].length - 1].e < it.s) { lanes[i].push(it); it.lane = i; placed = true; break; } } if (!placed) { it.lane = lanes.length; lanes.push([it]); } }
  return { items: sorted, laneCount: Math.max(1, lanes.length) };
}

/* ---------- styles ---------- */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&family=VT323&family=Nunito:wght@400;500;600;700;800&display=swap');
:root{
  --paper:#F3EEFB; --paper2:#ECE4F8; --card:#FFFFFF;
  --ink:#3B2E55; --ink-soft:#7E6E9E; --ink-faint:#B6A9CE;
  --line:#ECE3F7; --line2:#DBCCEF;
  --pink:#F4A9CC; --blush:#FBDCEC; --rose:#EE8FB2;
  --purple:#C3A3F0; --grape:#8E7CC0; --peri:#A9A7F0;
  --blue:#8FB8F0; --sky:#BFD8F5; --yellow:#F5D25E; --butter:#FBEBA6;
  --leaf:#B7A6E8; --stem:#8E7CC0; --soil:#ECE4F8; --soil2:#DEEBD8;
  --shadow:4px 4px 0 rgba(59,46,85,.85); --shadow-sm:3px 3px 0 rgba(59,46,85,.85);
}
*{box-sizing:border-box}
.gr{font-family:'Nunito',system-ui,sans-serif;color:var(--ink);min-height:100vh;font-size:14px;line-height:1.5;
  background:
   radial-gradient(900px 500px at 10% -8%, #E9DEFB 0%, transparent 58%),
   radial-gradient(820px 460px at 100% 0%, #DBE6FB 0%, transparent 55%),
   radial-gradient(720px 420px at 55% 108%, #FBE0EC 0%, transparent 60%),
   var(--paper);}
.gr button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.gr h1,.gr h2,.gr h3,.gr h4{font-family:'Pixelify Sans',sans-serif;font-weight:600;margin:0;line-height:1.15;letter-spacing:.3px}
.pixel{font-family:'Press Start 2P',monospace}
.mono{font-family:'VT323',monospace;font-size:1.15em}
.serif{font-family:'Pixelify Sans',sans-serif}
.muted{color:var(--ink-soft)} .faint{color:var(--ink-faint)}
.row{display:flex;align-items:center}.col{display:flex;flex-direction:column}
.gap4{gap:4px}.gap6{gap:6px}.gap8{gap:8px}.gap10{gap:10px}.gap12{gap:12px}.gap16{gap:16px}.gap18{gap:18px}.gap2{gap:2px}
.wrap{flex-wrap:wrap}.between{justify-content:space-between}.center{justify-content:center}
.grow{flex:1}.right{margin-left:auto}

/* window */
.win{background:var(--card);border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
.win-bar{display:flex;align-items:center;gap:8px;background:var(--grape);color:#fff;padding:8px 12px;
  border-bottom:3px solid var(--ink);font-family:'Pixelify Sans';font-weight:600;font-size:14px}
.win-bar.pink{background:var(--pink)}.win-bar.blue{background:var(--blue)}.win-bar.yellow{background:var(--yellow);color:var(--ink)}
.win-bar.leaf{background:var(--peri)}
.win-dots{margin-left:auto;display:flex;gap:5px}
.win-dots span{width:14px;height:14px;border:2px solid var(--ink);background:#fff;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;color:var(--ink);font-family:'Press Start 2P'}
.win-body{padding:16px 18px}

/* buttons */
.pbtn{font-family:'Pixelify Sans';font-weight:600;font-size:14px;color:#fff;background:var(--grape);border:3px solid var(--ink);
  border-radius:9px;padding:8px 15px;box-shadow:3px 3px 0 rgba(59,46,85,.85);display:inline-flex;align-items:center;gap:7px;white-space:nowrap;transition:.05s}
.pbtn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 rgba(59,46,85,.85)}
.pbtn.pink{background:var(--pink)}.pbtn.grape{background:var(--grape)}
.pbtn.ghost{background:#fff;color:var(--ink)}.pbtn.danger{background:var(--rose)}
.pbtn.blue{background:var(--blue)}
.pbtn.sm{font-size:12.5px;padding:6px 11px;border-width:2px;box-shadow:2px 2px 0 rgba(59,46,85,.85)}
.pbtn:disabled{opacity:.5}
.icon-btn{width:34px;height:34px;border-radius:9px;border:2px solid var(--ink);background:#fff;display:inline-flex;align-items:center;justify-content:center;color:var(--ink-soft);box-shadow:2px 2px 0 rgba(59,46,85,.55);transition:.05s}
.icon-btn:hover{color:var(--grape)}.icon-btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 rgba(59,46,85,.55)}

/* inputs */
.input,.select,.textarea{width:100%;font-family:'Nunito';font-size:14px;color:var(--ink);background:#fff;border:2.5px solid var(--line2);border-radius:9px;padding:9px 11px}
.input:focus,.select:focus,.textarea:focus{outline:none;border-color:var(--grape);box-shadow:0 0 0 3px var(--blush)}
.textarea{resize:vertical;min-height:80px;line-height:1.5}
.label{font-family:'Press Start 2P';font-size:8px;letter-spacing:.5px;color:var(--ink-soft);margin-bottom:7px;display:block;text-transform:uppercase}

/* chips + seg */
.chip{display:inline-flex;align-items:center;gap:5px;font-family:'Pixelify Sans';font-weight:600;font-size:12px;padding:2px 10px;border:2px solid var(--ink);border-radius:999px;background:#fff}
.seg{display:inline-flex;background:var(--paper2);border:2px solid var(--line2);border-radius:10px;padding:3px}
.seg button{padding:6px 11px;border-radius:7px;font-family:'Pixelify Sans';font-weight:600;font-size:12.5px;color:var(--ink-soft)}
.seg button.on{background:#fff;color:var(--grape);box-shadow:2px 2px 0 rgba(59,46,85,.35)}

/* shell */
.shell{display:grid;grid-template-columns:222px 1fr;min-height:100vh}
.side{border-right:3px solid var(--ink);background:rgba(255,255,255,.72);backdrop-filter:blur(6px);padding:16px 12px;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:5px}
.brand{display:flex;align-items:center;gap:8px;padding:4px 8px 14px}
.brand .logo{font-family:'Pixelify Sans';font-weight:700;font-size:20px}
.nav{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;font-family:'Pixelify Sans';font-weight:600;font-size:14px;color:var(--ink-soft);border:2px solid transparent}
.nav:hover{background:var(--paper2);color:var(--ink)}
.nav.active{background:#fff;color:var(--grape);border-color:var(--ink);box-shadow:2px 2px 0 rgba(59,46,85,.4)}
.main{padding:22px 26px 70px;max-width:1200px;width:100%}
.pagehead{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.pagehead h1{font-size:28px}

/* game strip */
.strip{display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#fff;border:3px solid var(--ink);border-radius:14px;box-shadow:var(--shadow);padding:12px 16px;margin-bottom:16px}
.rankpill{font-family:'Press Start 2P';font-size:9px;color:#fff;background:var(--grape);border:2px solid var(--ink);border-radius:7px;padding:6px 8px}
.xpwrap{flex:1;min-width:180px}
.xpbar{height:16px;border:3px solid var(--ink);border-radius:8px;background:#fff;padding:2px;box-shadow:var(--shadow-sm)}
.xpfill{height:100%;border-radius:4px;background:repeating-linear-gradient(90deg,var(--yellow) 0 7px,var(--butter) 7px 10px);transition:width .5s steps(10)}
.xplbl{font-family:'VT323';font-size:15px;color:var(--ink-soft);margin-top:3px}
.streak{font-family:'Pixelify Sans';font-weight:600;display:flex;align-items:center;gap:5px;color:var(--ink)}

/* the night sky (calendar) */
.sky{border:3px solid var(--ink);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;background:
  radial-gradient(2px 2px at 18% 16%, rgba(255,255,255,.85), transparent 60%),
  radial-gradient(2px 2px at 64% 26%, rgba(255,255,255,.75), transparent 60%),
  radial-gradient(1.6px 1.6px at 82% 12%, rgba(255,255,255,.8), transparent 60%),
  radial-gradient(1.6px 1.6px at 38% 40%, rgba(255,255,255,.65), transparent 60%),
  radial-gradient(2px 2px at 90% 48%, rgba(255,255,255,.7), transparent 60%),
  radial-gradient(1.4px 1.4px at 8% 52%, rgba(255,255,255,.6), transparent 60%),
  linear-gradient(180deg,#5B5390 0%, #7C6DAA 34%, #B98DB6 68%, #F4C9CC 100%)}
.sky-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;flex-wrap:wrap}
.sky-top h2{color:#fff;text-shadow:1px 1px 0 rgba(59,46,85,.45)}
.garden-inner{padding:10px 14px 0}
.dow-row{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:6px}
.dow{font-family:'Press Start 2P';font-size:8px;color:rgba(255,255,255,.85);text-align:center}
.plots{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.plot{position:relative;min-height:104px;border:2px solid rgba(255,255,255,.42);border-radius:10px;padding:4px;display:flex;flex-direction:column;
  background:linear-gradient(180deg, rgba(52,42,88,.34), rgba(92,76,140,.20));box-shadow:inset 0 0 14px rgba(35,26,64,.22);cursor:pointer;transition:.08s}
.plot:hover{border-color:var(--yellow);transform:translateY(-1px)}
.plot.out{opacity:.4}
.plot.today{border-color:var(--pink);box-shadow:0 0 0 3px var(--blush), inset 0 0 16px rgba(255,220,130,.28)}
.plot-n{font-family:'Pixelify Sans';font-weight:700;font-size:12px;color:#FBF3FF;align-self:flex-end;background:rgba(59,46,85,.5);border:1.5px solid rgba(255,255,255,.4);border-radius:5px;padding:0 5px;line-height:1.4}
.plot.today .plot-n{color:var(--ink);background:var(--pink);border-color:var(--ink)}
.blooms{flex:1;display:flex;flex-direction:column;align-content:flex-start;gap:2px;padding-top:3px;width:100%;overflow:hidden}
.bloom-btn{background:none;padding:0;line-height:0}
.ev-chip{display:flex;align-items:center;gap:4px;width:100%;padding:1px 5px;border-radius:6px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);cursor:pointer;text-align:left;min-height:19px;transition:.05s}
.ev-chip:hover{background:rgba(255,255,255,.34);transform:translateX(1px)}
.ev-chip.dim{opacity:.72;background:rgba(255,255,255,.07);border-style:dashed}
.ev-chip.sel{outline:2px solid var(--yellow);background:rgba(245,210,94,.3)}
.ev-t{flex:1;min-width:0;font-family:'Pixelify Sans';font-weight:600;font-size:11px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(59,46,85,.45)}
.ev-sub{font-family:'VT323';font-size:12px;color:rgba(255,255,255,.85);flex:0 0 auto}
.more{font-family:'Pixelify Sans';font-weight:600;font-size:10.5px;color:#fff;align-self:flex-start;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.32);border-radius:6px;padding:1px 7px;cursor:pointer}
.more:hover{background:rgba(255,255,255,.36)}
.tick.sm{width:14px;height:14px;border-width:2px;border-radius:4px;flex:0 0 auto}
.sky-tools{display:flex;gap:8px;align-items:center;padding:0 14px 10px;flex-wrap:wrap}
.sky-search{font-family:'Nunito';font-weight:600;font-size:13px;color:var(--ink);background:rgba(255,255,255,.94);border:2px solid var(--ink);border-radius:8px;padding:6px 10px;box-shadow:2px 2px 0 rgba(59,46,85,.4)}
.sky-search::placeholder{color:var(--ink-soft)}
.grass{height:20px;background:linear-gradient(180deg, rgba(255,222,150,.55), transparent);border-top:2px solid rgba(255,255,255,.4);margin-top:10px}

/* constellation lanes (drop windows + focus ranges) */
.beds{background:rgba(59,46,85,.26);border:2px dashed rgba(255,255,255,.36);border-radius:11px;padding:8px 10px;margin-bottom:10px}
.beds-title{font-family:'Press Start 2P';font-size:8px;color:rgba(255,255,255,.9);display:flex;align-items:center;gap:6px;margin:2px 2px 6px}
.bed-lane{position:relative}
.bed-bar{position:absolute;height:20px;border:2px solid var(--ink);border-radius:999px;font-family:'Pixelify Sans';font-weight:600;font-size:11px;color:#fff;display:flex;align-items:center;padding:0 8px;overflow:hidden;white-space:nowrap;cursor:pointer;box-shadow:2px 2px 0 rgba(59,46,85,.5)}

/* modal + toast */
.scrim{position:fixed;inset:0;background:rgba(40,30,64,.44);z-index:60;display:flex;align-items:flex-start;justify-content:center;padding:38px 14px;overflow:auto}
.modal{background:var(--card);border:3px solid var(--ink);border-radius:14px;box-shadow:var(--shadow);width:100%;max-width:520px;overflow:hidden;animation:pop .16s ease}
.modal.wide{max-width:720px}
@keyframes pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.field{margin-bottom:12px}.two{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.toast-wrap{position:fixed;top:16px;right:16px;z-index:80;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{pointer-events:auto;display:flex;align-items:center;gap:10px;background:#fff;border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow);padding:9px 13px;max-width:300px;animation:slidein .22s ease}
@keyframes slidein{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
.toast .ico{width:34px;height:34px;border:2px solid var(--ink);border-radius:8px;background:var(--blush);display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.toast .t{font-family:'Pixelify Sans';font-weight:600;font-size:13.5px}

/* misc */
.stat{border:3px solid var(--ink);border-radius:12px;background:#fff;box-shadow:var(--shadow-sm);padding:12px 14px}
.stat .big{font-family:'Pixelify Sans';font-weight:700;font-size:24px;line-height:1}
.list-row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;cursor:pointer}
.list-row:hover{background:var(--paper2)}
.tick{width:20px;height:20px;border-radius:6px;border:2.5px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;background:#fff}
.tick.on{background:var(--grape);border-color:var(--ink);color:#fff}
.dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto;border:1.5px solid rgba(59,46,85,.3)}
.swatch{width:26px;height:26px;border-radius:8px;border:2.5px solid transparent;cursor:pointer}
.swatch.on{border-color:var(--ink);transform:scale(1.08)}
.card{background:#fff;border:3px solid var(--ink);border-radius:12px;box-shadow:var(--shadow-sm)}
.empty{text-align:center;padding:30px 18px;color:var(--ink-soft)}
.tl-node{position:relative;padding:0 0 18px 24px;border-left:3px solid var(--line2);margin-left:8px}
.tl-node:last-child{border-left-color:transparent}
.tl-dot{position:absolute;left:-10px;top:2px;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--ink)}
.badge{border:3px solid var(--ink);border-radius:12px;background:#fff;box-shadow:var(--shadow-sm);padding:12px;text-align:center}
.badge.locked{filter:grayscale(1);opacity:.55}
.link-card{display:flex;align-items:center;gap:10px;padding:11px 13px;border:3px solid var(--ink);border-radius:11px;background:#fff;box-shadow:var(--shadow-sm);cursor:pointer;text-decoration:none;color:inherit}
.link-card:hover{transform:translateY(-1px)}
.co-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.co-split{display:grid;grid-template-columns:280px 1fr;gap:14px;align-items:start}
.dash{display:grid;grid-template-columns:1.5fr 1fr;gap:16px}
.spark{color:var(--yellow)}
.tabbar{display:none}
@media(max-width:860px){
  .shell{grid-template-columns:1fr}.side{display:none}.main{padding:16px 13px 90px}
  .two{grid-template-columns:1fr}.dash{grid-template-columns:1fr}.co-split{grid-template-columns:1fr}
  .plot{min-height:64px}
  .tabbar{display:flex;position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.96);border-top:3px solid var(--ink);padding:6px 4px calc(6px + env(safe-area-inset-bottom));justify-content:space-around;z-index:40}
  .tabbar button{display:flex;flex-direction:column;align-items:center;gap:2px;font-family:'Pixelify Sans';font-weight:600;font-size:9.5px;color:var(--ink-faint)}
  .tabbar button.on{color:var(--grape)}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ---------- flower + mascot sprites ---------- */
function Flower({ shape = "bloom", color = "#F4A9CC", size = 20, dim }) {
  const st = { width: size, height: size, display: "block", opacity: dim ? .55 : 1,
    filter: dim ? "none" : "drop-shadow(0 0 1.5px rgba(255,255,255,.55))" };
  if (shape === "sprout") return ( /* tiny 4-point spark — prep / expected */
    <svg viewBox="0 0 16 16" style={st}><path d="M8 2 L9.1 6.9 L14 8 L9.1 9.1 L8 14 L6.9 9.1 L2 8 L6.9 6.9 Z" fill={color} stroke="var(--ink)" strokeWidth=".5" strokeLinejoin="round" /></svg>);
  if (shape === "sun") return ( /* bright nova — the "landed the job" star */
    <svg viewBox="0 0 16 16" style={st}>
      {[...Array(8)].map((_, i) => { const a = i * 45 * Math.PI / 180; return <rect key={i} x={8 + Math.cos(a) * 5.5 - .7} y={8 + Math.sin(a) * 5.5 - .7} width="1.4" height="1.4" fill={color} opacity=".85" />; })}
      <path d="M8 1.1 L9.8 6 L14.7 6.2 L10.7 9.4 L12.2 14.2 L8 11 L3.8 14.2 L5.3 9.4 L1.3 6.2 L6.2 6 Z" fill={color} stroke="var(--ink)" strokeWidth=".6" strokeLinejoin="round" />
      <circle cx="8" cy="7.1" r="1.7" fill="#FFF7D6" /></svg>);
  if (shape === "dot") return <span style={{ width: size * .5, height: size * .5, borderRadius: "50%", background: color, display: "inline-block" }} />;
  return ( /* classic 5-point star */
    <svg viewBox="0 0 16 16" style={st}><path d="M8 1.5 L9.7 6.1 L14.6 6.3 L10.6 9.3 L12 14 L8 11.1 L4 14 L5.4 9.3 L1.4 6.3 L6.3 6.1 Z" fill={color} stroke="var(--ink)" strokeWidth=".6" strokeLinejoin="round" /><circle cx="8" cy="7" r="1.35" fill="#FFF9E8" opacity=".9" /></svg>);
}
function Pip({ mood = "idle", size = 52 }) {
  const cheer = mood === "cheer";
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} style={{ display: "block" }}>
      <ellipse cx="22" cy="41" rx="10" ry="2" fill="rgba(59,46,85,.12)" />
      {[[7, 9], [37, 8], [36, 27], [8, 29]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 2.6}L${x + .9} ${y - .6}L${x + 2.8} ${y}L${x + .9} ${y + .6}L${x} ${y + 2.6}L${x - .9} ${y + .6}L${x - 2.8} ${y}L${x - .9} ${y - .6}Z`} fill={i % 2 ? "var(--yellow)" : "var(--pink)"} stroke="var(--ink)" strokeWidth=".5" />
      ))}
      <circle cx="22" cy="21" r="13" fill="#FFF3C6" stroke="var(--ink)" strokeWidth="1.7" />
      <circle cx="14.5" cy="16" r="2" fill="#F3E2A2" /><circle cx="30" cy="26" r="2.6" fill="#F3E2A2" /><circle cx="28.5" cy="14" r="1.4" fill="#F3E2A2" />
      <circle cx="18.4" cy="21" r="1.3" fill="var(--ink)" /><circle cx="25.6" cy="21" r="1.3" fill="var(--ink)" />
      {cheer ? <path d="M18 24Q22 27.6 26 24" stroke="var(--ink)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        : <path d="M18.6 24.2Q22 25.9 25.4 24.2" stroke="var(--ink)" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
      <circle cx="16.5" cy="23" r="1.2" fill="var(--blush)" /><circle cx="27.5" cy="23" r="1.2" fill="var(--blush)" />
    </svg>);
}

/* ---------- shared UI ---------- */
export { STYLES, Flower, Pip };
export function Win({ title, tone = "", dots = true, children, style, bodyStyle }) {
  return (
    <div className="win" style={style}>
      <div className={"win-bar " + tone}>{title}{dots && <span className="win-dots"><span>_</span><span>▢</span><span>x</span></span>}</div>
      <div className="win-body" style={bodyStyle}>{children}</div>
    </div>);
}
function Modal({ title, tone = "grape", onClose, children, wide }) {
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className={"modal" + (wide ? " wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className={"win-bar " + (tone === "grape" ? "" : tone)}>{title}<span className="win-dots"><button className="win-dots-x" onClick={onClose} style={{ all: "unset", cursor: "pointer" }}><span style={{ width: 14, height: 14, border: "2px solid var(--ink)", background: "#fff", borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--ink)", fontFamily: "'Press Start 2P'" }}>x</span></button></span></div>
        <div style={{ padding: "18px 20px" }}>{children}</div>
      </div>
    </div>);
}
export const Field = ({ label, children }) => <div className="field"><label className="label">{label}</label>{children}</div>;
function BloomPicker({ value, onChange }) {
  return <div className="row gap8 wrap">{BLOOMS.map((b) => <button key={b.id} className={"swatch" + (value === b.id ? " on" : "")} style={{ background: b.hex }} onClick={() => onChange(b.id)} title={b.id} />)}</div>;
}
const Empty = ({ shape = "sprout", title, sub }) => (
  <div className="empty"><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Flower shape={shape} color="var(--purple)" size={40} /></div>
    <div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, color: "var(--ink)", fontSize: 15 }}>{title}</div>
    <div style={{ fontSize: 12.5 }}>{sub}</div></div>);

/* ---------- garden beds (drop windows + focus ranges) ---------- */
function GardenBeds({ monthStart, windows, focus, onWin, onFocus }) {
  const mEnd = endOfMonth(monthStart); const total = daysInMonth(monthStart);
  const build = (arr, kind) => packLanes(arr.map((x) => {
    const s = parseYMD(x.start), e = parseYMD(x.end);
    if (e < monthStart || s > mEnd) return null;
    const cs = s < monthStart ? monthStart : s, ce = e > mEnd ? mEnd : e;
    return { item: x, kind, s: cs.getDate() - 1, e: ce.getDate() - 1, clipL: s < monthStart, clipR: e > mEnd };
  }).filter(Boolean));
  const win = build(windows, "win"), foc = build(focus, "foc");
  const lane = (packed, label, onOpen) => packed.items.length === 0 ? null : (
    <div style={{ marginBottom: 6 }}>
      <div className="beds-title">{label === "win" ? <><Pin size={10} /> APPLICATION DROPS</> : <><Sparkles size={10} /> WHAT TO FOCUS ON</>}</div>
      <div className="bed-lane" style={{ height: packed.laneCount * 24 }}>
        {packed.items.map((it, i) => {
          const isWin = it.kind === "win"; const bg = isWin ? (TRACKS[it.item.track]?.color || "#9B7FE0") : bloomHex(it.item.color);
          return <div key={i} className="bed-bar" onClick={() => onOpen(it.item)} title={isWin ? it.item.expectedLabel : it.item.label}
            style={{ left: (it.s / total) * 100 + "%", width: `calc(${((it.e - it.s + 1) / total) * 100}% - 4px)`, top: it.lane * 24, background: bg,
              borderTopLeftRadius: it.clipL ? 4 : 999, borderBottomLeftRadius: it.clipL ? 4 : 999, borderTopRightRadius: it.clipR ? 4 : 999, borderBottomRightRadius: it.clipR ? 4 : 999 }}>
            {isWin ? `${it.item.company}${it.item.program ? " · " + it.item.program : ""}` : it.item.label}</div>;
        })}
      </div>
    </div>);
  if (win.items.length === 0 && foc.items.length === 0) return null;
  return <div className="beds">{lane(win, "win", onWin)}{lane(foc, "foc", onFocus)}</div>;
}

/* ---------- the garden (calendar) ---------- */
function GardenCalendar({ data, setModal, onBulkDelete, sunToday }) {
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

/* ---------- modals ---------- */
function EventModal({ data, companies, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, setF] = useState({ id: data.id || uid(), title: data.title || "", cat: data.cat || "coffee", color: data.color || catOf(data.cat || "coffee").color,
    date: data.date || ymd(today()), endDate: data.endDate || "", allDay: data.allDay ?? false, start: data.start || "10:00", end: data.end || "11:00",
    location: data.location || "", notes: data.notes || "", notify: data.notify ?? true, companyId: data.companyId || "", recur: data.recur || "none", recurUntil: data.recurUntil || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
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
      <label className="row gap8" style={{ marginBottom: 10, cursor: "pointer", fontWeight: 700 }}><span className={"tick" + (f.allDay ? " on" : "")}>{f.allDay && <Check size={13} />}</span> All-day</label>
      {!f.allDay && <div className="two"><Field label="Start"><input type="time" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="End"><input type="time" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>}
      <div className="two"><Field label="Repeat"><select className="select" value={f.recur} onChange={(e) => set("recur", e.target.value)}><option value="none">One-time</option><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option></select></Field>
        {f.recur !== "none" ? <Field label="Until"><input type="date" className="input" value={f.recurUntil} onChange={(e) => set("recurUntil", e.target.value)} /></Field> : <Field label="Where"><input className="input" value={f.location} placeholder="Zoom, campus…" onChange={(e) => set("location", e.target.value)} /></Field>}</div>
      {f.recur !== "none" && <Field label="Where"><input className="input" value={f.location} placeholder="Zoom, campus…" onChange={(e) => set("location", e.target.value)} /></Field>}
      <Field label="Notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Talking points, prep, recruiter…" /></Field>
      <label className="row gap8" style={{ marginBottom: 14, cursor: "pointer", fontWeight: 700 }}><span className={"tick" + (f.notify ? " on" : "")}>{f.notify && <Check size={13} />}</span><Bell size={14} /> Remind me (shows in Upcoming)</label>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}{editing && <button className="pbtn ghost" onClick={() => onSave({ ...f, id: uid(), title: (f.title || "Event") + " (copy)" })}><Copy size={14} /> Duplicate</button>}<button className="pbtn right" onClick={() => f.title.trim() && onSave(f)}>{editing ? "Save" : "Add star ⋆"}</button></div>
    </Modal>);
}
function WindowModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, setF] = useState({ id: data.id || uid(), company: data.company || "", program: data.program || "", track: data.track || "IB", expectedLabel: data.expectedLabel || "",
    expected: data.expected || data.start || ymd(today()), actual: data.actual || "", start: data.start || ymd(today()), end: data.end || ymd(addDays(today(), 30)), status: data.status || "Interested" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={<><Pin size={15} /> {editing ? "Edit application drop" : "New application drop"}</>} tone="pink" onClose={onClose}>
      <div className="two"><Field label="Company"><input className="input" autoFocus value={f.company} onChange={(e) => set("company", e.target.value)} /></Field><Field label="Program"><input className="input" value={f.program} placeholder="Sophomore SA…" onChange={(e) => set("program", e.target.value)} /></Field></div>
      <div className="two"><Field label="Track"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].name}</option>)}</select></Field>
        <Field label="Status"><select className="select" value={f.status} onChange={(e) => set("status", e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <div className="two"><Field label="Expected drop"><input type="date" className="input" value={f.expected} onChange={(e) => set("expected", e.target.value)} /></Field><Field label="Expected (label)"><input className="input" value={f.expectedLabel} placeholder="Expected April 2027" onChange={(e) => set("expectedLabel", e.target.value)} /></Field></div>
      <Field label="Actual open date — once confirmed (optional)"><input type="date" className="input" value={f.actual} onChange={(e) => set("actual", e.target.value)} /></Field>
      <p className="faint" style={{ fontSize: 11.5, marginTop: -4, marginBottom: 12 }}>Expected shows as a faint spark; set an actual date and it becomes a real star.</p>
      <div className="two"><Field label="Season opens"><input type="date" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="Season closes"><input type="date" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn pink right" onClick={() => f.company.trim() && onSave(f)}>{editing ? "Save" : "Add drop"}</button></div>
    </Modal>);
}
function FocusModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id;
  const [f, setF] = useState({ id: data.id || uid(), label: data.label || "", color: data.color || "mint", start: data.start || ymd(today()), end: data.end || ymd(addDays(today(), 30)), track: data.track || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={<><Sprout size={15} /> {editing ? "Edit focus row" : "What to focus on"}</>} tone="leaf" onClose={onClose}>
      <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>A stretch of time to focus on — "study IB technicals" in October, "casing" Feb–May.</p>
      <Field label="Focus on"><input className="input" autoFocus value={f.label} placeholder="Study IB technicals" onChange={(e) => set("label", e.target.value)} /></Field>
      <div className="two"><Field label="From"><input type="date" className="input" value={f.start} onChange={(e) => set("start", e.target.value)} /></Field><Field label="To"><input type="date" className="input" value={f.end} onChange={(e) => set("end", e.target.value)} /></Field></div>
      <Field label="Track (optional)"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}><option value="">General</option>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].name}</option>)}</select></Field>
      <Field label="Row color"><BloomPicker value={f.color} onChange={(v) => set("color", v)} /></Field>
      <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.label.trim() && onSave(f)}>{editing ? "Save" : "Add row"}</button></div>
    </Modal>);
}
function SmartAddModal({ onCommit, onClose }) {
  const [text, setText] = useState(""); const [fallback, setFallback] = useState("IB"); const [rows, setRows] = useState(null);
  const ex = `Bain\tFirst Forward\tUG (Class of 2029)\tExpected April 2027\nBain\tBEL: Building Entrepreneurial Leaders\tUG (Class of 2029)\tExpected February 2027\nBain\tConsulting Kickstart\tUG (Class of 2030)\tExpected Summer 2026`;
  return (
    <Modal title={<><Wand2 size={15} /> Map the sky (smart add)</>} tone="yellow" onClose={onClose} wide>
      {!rows ? <>
        <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>Paste rows from a recruiting site — I'll place each as a dated drop in your sky.</p>
        <Field label="Default track"><div className="seg">{Object.keys(TRACKS).map((k) => <button key={k} className={fallback === k ? "on" : ""} onClick={() => setFallback(k)}>{TRACKS[k].short}</button>)}</div></Field>
        <Field label="Paste here"><textarea className="textarea" style={{ minHeight: 140, fontFamily: "'VT323'", fontSize: 15 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={ex} /></Field>
        <div className="row gap10"><button className="pbtn ghost" onClick={() => setText(ex)}>Try example</button><button className="pbtn right" disabled={!text.trim()} onClick={() => setRows(smartParse(text, fallback))}>Sort →</button></div>
      </> : <>
        <p className="muted" style={{ marginTop: -4, marginBottom: 12, fontSize: 12.5 }}>Found {rows.length}. Set track, toggle "add to roster," untick any to skip.</p>
        <div className="col gap6" style={{ maxHeight: 320, overflow: "auto", marginBottom: 12 }}>{rows.map((r, i) => (
          <div key={r.id} className="row gap8 wrap" style={{ padding: "8px 10px", borderRadius: 10, background: "var(--paper2)" }}>
            <span className={"tick" + (r.include ? " on" : "")} style={{ cursor: "pointer" }} onClick={() => setRows((p) => p.map((x, j) => j === i ? { ...x, include: !x.include } : x))}>{r.include && <Check size={13} />}</span>
            <div className="grow" style={{ minWidth: 120 }}><div style={{ fontWeight: 800 }}>{r.company} {r.program && <span className="muted" style={{ fontWeight: 600 }}>· {r.program}</span>}</div><div className="faint mono" style={{ fontSize: 14 }}>{r.timing.label} · {r.eligibility || "—"}</div></div>
            <button className="chip" style={{ cursor: "pointer", background: r.addCompany ? "var(--stem)" : "#fff", color: r.addCompany ? "#fff" : "var(--ink-soft)" }} onClick={() => setRows((p) => p.map((x, j) => j === i ? { ...x, addCompany: !x.addCompany } : x))}>{r.addCompany ? <Check size={11} /> : <Building2 size={11} />} roster</button>
            <select className="select" style={{ width: 88, padding: "5px 7px" }} value={r.track} onChange={(e) => setRows((p) => p.map((x, j) => j === i ? { ...x, track: e.target.value } : x))}>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].short}</option>)}</select>
          </div>))}</div>
        <div className="row gap10"><button className="pbtn ghost" onClick={() => setRows(null)}>← Back</button><button className="pbtn right" onClick={() => onCommit(rows.filter((r) => r.include))}>Add {rows.filter((r) => r.include).length} drops</button></div>
      </>}
    </Modal>);
}
function CompanyModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id; const [f, setF] = useState({ id: data.id || uid(), name: data.name || "", track: data.track || "IB", stage: data.stage || "Interested", role: data.role || "", notes: data.notes || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (<Modal title={<><Building2 size={15} /> {editing ? "Edit firm" : "Add firm to roster"}</>} onClose={onClose}>
    <div className="two"><Field label="Company"><input className="input" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} /></Field><Field label="Role / program"><input className="input" value={f.role} placeholder="Summer Analyst" onChange={(e) => set("role", e.target.value)} /></Field></div>
    <div className="two"><Field label="Track"><select className="select" value={f.track} onChange={(e) => set("track", e.target.value)}>{Object.keys(TRACKS).map((k) => <option key={k} value={k}>{TRACKS[k].name}</option>)}</select></Field><Field label="Status"><select className="select" value={f.stage} onChange={(e) => set("stage", e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field></div>
    <Field label="Notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Recruiter contacts, referral, next steps…" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.name.trim() && onSave(f)}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}
function CoffeeModal({ data, companies, onSave, onDelete, onClose }) {
  const editing = !!data.id; const [f, setF] = useState({ id: data.id || uid(), person: data.person || "", company: data.company || "", role: data.role || "", date: data.date || ymd(today()), status: data.status || "requested", notes: data.notes || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (<Modal title={<><Coffee size={15} /> {editing ? "Edit chat" : "Log a coffee chat"}</>} tone="pink" onClose={onClose}>
    <div className="two"><Field label="Person"><input className="input" autoFocus value={f.person} onChange={(e) => set("person", e.target.value)} placeholder="Analyst name" /></Field><Field label="Company"><input className="input" value={f.company} onChange={(e) => set("company", e.target.value)} list="co-dl" /><datalist id="co-dl">{companies.map((c) => <option key={c.id} value={c.name} />)}</datalist></Field></div>
    <div className="two"><Field label="Their role"><input className="input" value={f.role} placeholder="2nd-year Analyst" onChange={(e) => set("role", e.target.value)} /></Field><Field label="Date"><input type="date" className="input" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field></div>
    <Field label="Status"><div className="seg">{[["requested", "Requested"], ["scheduled", "Scheduled"], ["done", "Done"], ["follow-up", "Follow up"]].map(([k, l]) => <button key={k} className={f.status === k ? "on" : ""} onClick={() => set("status", k)}>{l}</button>)}</div></Field>
    <Field label="Talking points / notes"><textarea className="textarea" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Questions to ask, what you learned, thank-you sent?" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn pink right" onClick={() => f.person.trim() && onSave(f)}>{editing ? "Save" : "Log ⋆"}</button></div>
  </Modal>);
}
function SimpleLinkModal({ kind, data, onSave, onDelete, onClose }) {
  const editing = !!data.id; const isDoc = kind === "doc"; const nameKey = isDoc ? "name" : "label";
  const [f, setF] = useState({ id: data.id || uid(), label: data.label || "", name: data.name || "", url: data.url || "", kind: data.kind || "Resume" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (<Modal title={editing ? "Edit" : isDoc ? "Add document" : "Add quick link"} tone="blue" onClose={onClose}>
    <Field label={isDoc ? "Document name" : "Label"}><input className="input" autoFocus value={f[nameKey]} onChange={(e) => set(nameKey, e.target.value)} placeholder={isDoc ? "Resume — IB v4" : "GitHub repo"} /></Field>
    {isDoc && <Field label="Type"><select className="select" value={f.kind} onChange={(e) => set("kind", e.target.value)}>{["Resume", "Cover letter", "Coffee-chat notes", "Talking points", "Transcript", "Other"].map((k) => <option key={k}>{k}</option>)}</select></Field>}
    <Field label={isDoc ? "Drive / doc link" : "URL"}><input className="input" value={f.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn blue right" onClick={() => f[nameKey].trim() && f.url.trim() && onSave(f)}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}
function TaskModal({ data, onSave, onDelete, onClose }) {
  const editing = !!data.id; const [f, setF] = useState({ id: data.id || uid(), title: data.title || "", due: data.due || "", done: data.done || false });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (<Modal title={<><Check size={15} /> {editing ? "Edit quest" : "New quest"}</>} tone="leaf" onClose={onClose}>
    <Field label="Quest"><input className="input" autoFocus value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Send thank-you to…" /></Field>
    <Field label="Due (optional)"><input type="date" className="input" value={f.due} onChange={(e) => set("due", e.target.value)} /></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" onClick={() => f.title.trim() && onSave(f)}>{editing ? "Save" : "Add quest"}</button></div>
  </Modal>);
}
function PhaseModal({ data, onSave, onDelete, onClose }) {
  const p = data.phase || {}; const editing = !!p.id;
  const [f, setF] = useState({ id: p.id || uid(), phase: p.phase || "", when: p.when || "", color: p.color || "purple", tasks: p.tasks && p.tasks.length ? p.tasks.map((t) => ({ ...t })) : [{ id: uid(), text: "" }] });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (<Modal title={editing ? "Edit phase" : "Add phase"} tone="leaf" onClose={onClose}>
    <Field label="Phase name"><input className="input" autoFocus value={f.phase} onChange={(e) => set("phase", e.target.value)} placeholder="Sharpen your shine" /></Field>
    <Field label="When (label)"><input className="input" value={f.when} onChange={(e) => set("when", e.target.value)} placeholder="Oct 2026 – Feb 2027" /></Field>
    <Field label="Color"><BloomPicker value={f.color} onChange={(v) => set("color", v)} /></Field>
    <Field label="To-dos"><div className="col gap6">{f.tasks.map((t) => (<div key={t.id} className="row gap8"><input className="input" value={t.text} onChange={(e) => set("tasks", f.tasks.map((x) => x.id === t.id ? { ...x, text: e.target.value } : x))} placeholder="Add a to-do…" /><button className="icon-btn" onClick={() => set("tasks", f.tasks.filter((x) => x.id !== t.id))}><X size={14} /></button></div>))}<button className="pbtn ghost sm" style={{ alignSelf: "flex-start" }} onClick={() => set("tasks", [...f.tasks, { id: uid(), text: "" }])}><Plus size={13} /> Add to-do</button></div></Field>
    <div className="row gap10">{editing && <button className="pbtn danger" onClick={() => onDelete(data.track, f.id)}><Trash2 size={14} /> Delete</button>}<button className="pbtn right" disabled={!f.phase.trim()} onClick={() => onSave(data.track, { id: f.id, phase: f.phase.trim(), when: f.when.trim(), color: f.color, tasks: f.tasks.map((t) => ({ id: t.id, text: t.text.trim() })).filter((t) => t.text) })}>{editing ? "Save" : "Add"}</button></div>
  </Modal>);
}

/* ---------- day detail ---------- */
function DayModal({ date, data, setModal }) {
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
              <Flower shape={w.actual === date ? "bloom" : "sprout"} color={TRACKS[w.track]?.color} size={20} dim={w.actual !== date} />
              <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700 }}>{w.company}</div><div className="faint mono" style={{ fontSize: 13 }}>{w.actual === date ? "opens" : "expected"}{w.program ? " · " + w.program : ""}</div></div>
              <span className="chip" style={{ background: TRACKS[w.track].soft, color: TRACKS[w.track].color, fontSize: 11 }}>{TRACKS[w.track].short}</span>
            </div>))}
        </div>}
      <button className="pbtn pink" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal({ type: "event", data: { date } })}><Plus size={15} /> Add a star on this day</button>
    </Modal>);
}

/* ---------- game strip ---------- */
function GameStrip({ profile }) {
  const xp = profile.xp || 0; const r = rankFor(xp); const nx = nextRank(xp);
  const lo = r.at, hi = nx ? nx.at : r.at; const pct = nx ? Math.round(((xp - lo) / (hi - lo)) * 100) : 100;
  const streak = profile.streak?.count || 0;
  return (
    <div className="strip">
      <Pip mood="idle" size={48} />
      <div className="xpwrap">
        <div className="row between" style={{ marginBottom: 4 }}><span className="rankpill">LV.{r.lv} {r.name.toUpperCase()}</span><span className="mono" style={{ color: "var(--ink-soft)" }}>{nx ? `${xp}/${hi} XP` : `${xp} XP · max ⋆`}</span></div>
        <div className="xpbar"><div className="xpfill" style={{ width: pct + "%" }} /></div>
      </div>
      <div className="streak"><Sparkles size={16} color="var(--yellow)" /> {streak}d</div>
    </div>);
}

/* ---------- home = the garden ---------- */
function GardenHome({ data, profile, setModal, setView, toggleTask, onBulkDelete }) {
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
          <div className="muted">Class of {profile.gradClass} · {profile.tracks.map((t) => TRACKS[t].short).join(" · ")}</div>
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
                  <Flower shape={conf ? "bloom" : "sprout"} color={TRACKS[w.track].color} size={20} dim={!conf} />
                  <div className="grow" style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13, color: conf ? "var(--ink)" : "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.company}</div><div className="faint mono" style={{ fontSize: 13 }}>{conf ? "opens" : "expected"} · {w.expectedLabel || relDay(d)}</div></div>
                  <span className="chip" style={{ background: TRACKS[w.track].soft, color: TRACKS[w.track].color, fontSize: 11 }}>{TRACKS[w.track].short}</span>
                </div>); })}</div>}
          </Win>
        </div>
      </div>
    </div>);
}

/* ---------- roster (companies) ---------- */
function Roster({ data, setModal, update, advanceStage }) {
  const [sel, setSel] = useState(null);
  const co = sel ? data.companies.find((c) => c.id === sel) : null;
  const coW = co ? data.windows.filter((w) => w.company.toLowerCase() === co.name.toLowerCase()) : [];
  const coE = co ? data.events.filter((e) => e.companyId === co.id) : [];
  const coC = co ? data.chats.filter((c) => c.company?.toLowerCase() === co.name.toLowerCase()) : [];
  const Card = (c) => (<div key={c.id} className="card" style={{ padding: 13, cursor: "pointer", borderColor: sel === c.id ? TRACKS[c.track].color : "var(--ink)" }} onClick={() => setSel(sel === c.id ? null : c.id)}>
    <div className="row between"><span className="chip" style={{ background: TRACKS[c.track].soft, color: TRACKS[c.track].color }}>{TRACKS[c.track].short}</span><span className="chip" style={{ background: stageColor(c.stage) + "26", color: stageColor(c.stage) }}><CircleDot size={11} /> {c.stage}</span></div>
    <div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 18, marginTop: 9 }}>{c.name}</div>{c.role && <div className="muted" style={{ fontSize: 12.5 }}>{c.role}</div>}</div>);
  return (
    <div>
      <div className="pagehead"><h1>Roster</h1><button className="pbtn" onClick={() => setModal({ type: "company", data: {} })}><Plus size={15} /> Add firm</button></div>
      {data.companies.length === 0 ? <Win title="ROSTER.DIR"><Empty shape="bloom" title="Your roster's empty" sub="Add a firm to track its drops & status." /></Win>
        : sel ? <div className="co-split"><div className="col gap12">{data.companies.map(Card)}</div>
          {co && <Win title={`🏢 ${co.name}`}>
            <div className="row between" style={{ marginBottom: 8 }}><div className="muted">{co.role} · {TRACKS[co.track].name}</div><button className="pbtn ghost sm" onClick={() => setModal({ type: "company", data: co })}><Edit3 size={13} /> Edit</button></div>
            <label className="label">Pipeline</label><div className="row gap6 wrap" style={{ marginBottom: 10 }}>{STAGES.slice(0, 7).map((s) => <button key={s} className="chip" style={{ cursor: "pointer", background: co.stage === s ? stageColor(s) : "#fff", color: co.stage === s ? "#fff" : "var(--ink-soft)" }} onClick={() => advanceStage(co.id, s)}>{s}</button>)}</div>
            {co.notes && <div style={{ background: "var(--paper2)", borderRadius: 10, padding: "9px 12px", fontSize: 13, marginBottom: 10 }}>{co.notes}</div>}
            <label className="label">Application drops</label>{coW.length ? coW.map((w) => <div key={w.id} className="list-row" onClick={() => setModal({ type: "window", data: w })}><Pin size={13} color={TRACKS[w.track].color} /><div className="grow">{w.program || "Application"}</div><span className="faint mono">{w.expectedLabel}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>None.</div>}
            <label className="label" style={{ marginTop: 8 }}>Stars (events)</label>{coE.length ? coE.map((e) => <div key={e.id} className="list-row" onClick={() => setModal({ type: "event", data: e })}><Flower shape={catOf(e.cat).shape} color={bloomHex(e.color)} size={18} /><div className="grow">{e.title}</div><span className="faint mono">{relDay(parseYMD(e.date))}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>No events linked.</div>}
            <label className="label" style={{ marginTop: 8 }}>Coffee chats</label>{coC.length ? coC.map((c) => <div key={c.id} className="list-row" onClick={() => setModal({ type: "coffee", data: c })}><Coffee size={13} color="var(--pink)" /><div className="grow">{c.person} · {c.role}</div><span className="faint">{c.status}</span></div>) : <div className="faint" style={{ fontSize: 12.5, padding: 4 }}>No chats logged.</div>}
          </Win>}
        </div> : <div className="co-grid">{data.companies.map(Card)}</div>}
    </div>);
}

/* ---------- chats ---------- */
function Chats({ data, setModal }) {
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

/* ---------- guide (editable timelines) ---------- */
function Guide({ profile, timelines, setTimelines, addFocus, setModal }) {
  const [active, setActive] = useState(profile.tracks[0] || "IB"); const [arm, setArm] = useState(false);
  const phases = (timelines && timelines[active]) || [];
  useEffect(() => setArm(false), [active]);
  return (
    <div>
      <div className="pagehead"><div><h1>Star map</h1><div className="muted">Your game plan for Class of {profile.gradClass} — edit anything</div></div><button className="pbtn" onClick={() => setModal({ type: "phase", data: { track: active, phase: {} } })}><Plus size={15} /> Add phase</button></div>
      <div className="row between wrap gap8" style={{ marginBottom: 16 }}>
        <div className="seg">{Object.keys(TRACKS).map((k) => <button key={k} className={active === k ? "on" : ""} onClick={() => setActive(k)} style={active === k ? { color: TRACKS[k].color } : {}}>{TRACKS[k].name}</button>)}</div>
        <button className="pbtn ghost sm" style={arm ? { color: "var(--rose)" } : {}} onClick={() => { if (arm) { setTimelines(active, seedTimelines()[active]); setArm(false); } else setArm(true); }}>{arm ? "Click again to confirm" : "Reset to default"}</button>
      </div>
      <Win title={`${TRACKS[active].name} path`} tone={active === "IB" ? "" : active === "Consulting" ? "yellow" : "blue"}>
        {phases.length === 0 ? <Empty shape="sprout" title="No phases" sub="Add one, or reset to defaults." /> : phases.map((p) => (
          <div key={p.id} className="tl-node"><span className="tl-dot" style={{ background: bloomHex(p.color) }} />
            <div className="row between wrap" style={{ gap: 8 }}><div style={{ fontFamily: "'Pixelify Sans'", fontWeight: 600, fontSize: 16 }}>{p.phase}</div>
              <div className="row gap6"><button className="chip" style={{ cursor: "pointer", background: "var(--paper2)" }} onClick={() => addFocus(p.phase, active, p.color)}><Plus size={11} /> focus</button><button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setModal({ type: "phase", data: { track: active, phase: p } })}><Edit3 size={12} /></button></div></div>
            <div className="muted mono" style={{ fontSize: 14, marginBottom: 4 }}>{p.when}</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>{p.tasks.map((t) => <li key={t.id}>{t.text}</li>)}</ul>
          </div>))}
        <p className="faint" style={{ fontSize: 11.5, marginTop: 6 }}>General guidance — dates shift every cycle & by firm. Confirm on each company's page.</p>
      </Win>
    </div>);
}

/* ---------- shed (docs + links) ---------- */
function Shed({ data, setModal }) {
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

/* ---------- profile ---------- */
function Profile({ profile, data, setProfile, logout, exportSave, importSave }) {
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
            <div className="muted" style={{ marginBottom: 8 }}>Class of {profile.gradClass} · {profile.tracks.map((t) => TRACKS[t].short).join(" · ")}</div>
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

/* ---------- onboarding ---------- */
function Onboarding({ profiles, onCreate, onPick }) {
  const [name, setName] = useState(""); const [grad, setGrad] = useState("2029"); const [tracks, setTracks] = useState(["IB", "Consulting", "PM"]);
  const toggle = (t) => setTracks((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);
  return (
    <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 18 }}>
      <style>{STYLES}</style>
      <div className="win" style={{ maxWidth: 440, width: "100%" }}>
        <div className="win-bar pink">⋆ STARRY.EXE — new save<span className="win-dots"><span>_</span><span>▢</span><span>x</span></span></div>
        <div className="win-body" style={{ padding: 22 }}>
          <div className="row gap10" style={{ marginBottom: 4 }}><Pip size={44} /><div><h1 style={{ fontSize: 24 }}>Start your sky</h1><div className="muted" style={{ fontSize: 12.5 }}>a cozy night-sky for recruiting</div></div></div>
          {profiles.length > 0 && <div style={{ margin: "16px 0" }}><label className="label">Continue a save</label><div className="col gap6">{profiles.map((p) => (
            <button key={p.id} className="link-card" style={{ textAlign: "left" }} onClick={() => onPick(p.id)}><div style={{ width: 32, height: 32, borderRadius: 9, border: "2px solid var(--ink)", background: "var(--grape)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pixelify Sans'", fontWeight: 700 }}>{p.name[0]?.toUpperCase()}</div><div className="grow"><div style={{ fontWeight: 800 }}>{p.name}</div><div className="faint mono" style={{ fontSize: 13 }}>Lv.{rankFor(p.xp || 0).lv} · Class of {p.gradClass}</div></div><ChevronRight size={16} className="faint" /></button>))}</div>
            <div className="row gap8" style={{ margin: "14px 0 2px", color: "var(--ink-faint)", fontSize: 12 }}><div className="grow" style={{ height: 2, background: "var(--line)" }} /> or start a new one <div className="grow" style={{ height: 2, background: "var(--line)" }} /></div></div>}
          <Field label="Your name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" /></Field>
          <Field label="Graduating class"><input className="input" value={grad} onChange={(e) => setGrad(e.target.value)} /></Field>
          <Field label="Tracks you're chasing"><div className="row gap8 wrap">{Object.keys(TRACKS).map((k) => <button key={k} className="chip" style={{ padding: "7px 12px", cursor: "pointer", background: tracks.includes(k) ? TRACKS[k].color : "#fff", color: tracks.includes(k) ? "#fff" : "var(--ink-soft)" }} onClick={() => toggle(k)}>{tracks.includes(k) && <Check size={12} />} {TRACKS[k].name}</button>)}</div></Field>
          <button className="pbtn" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={!name.trim() || !tracks.length} onClick={() => onCreate({ name: name.trim(), gradClass: grad.trim() || "2029", tracks })}>Start my sky ⋆</button>
          <p className="faint" style={{ fontSize: 11, textAlign: "center", marginTop: 10 }}>Saved on this device. No account needed.</p>
        </div>
      </div>
    </div>);
}

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
  const ensureTL = (d) => ({ ...d, timelines: d.timelines || seedTimelines() });

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

  if (!loaded) return <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><style>{STYLES}</style><div style={{ textAlign: "center" }}><Pip size={64} /><div className="pixel spark" style={{ fontSize: 11, marginTop: 10 }}>LOADING...</div></div></div>;
  if (!profile) return <Onboarding profiles={profiles} onCreate={createProfile} onPick={pickProfile} />;

  const NAV = [["home", "Sky", Home], ["roster", "Roster", Building2], ["chats", "Chats", Coffee], ["guide", "Guide", Compass], ["shed", "Files", FileText], ["me", "Me", Star]];

  return (
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
    </div>);
}
