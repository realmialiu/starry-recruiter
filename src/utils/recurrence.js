import { parseYMD, addDays, addMonths } from "./dates";

/* ---------- recurrence + lane packing ---------- */
export function expandEvents(events, rStart, rEnd) {
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
export function packLanes(items) {
  const lanes = []; const sorted = [...items].sort((a, b) => a.s - b.s);
  for (const it of sorted) { let placed = false; for (let i = 0; i < lanes.length; i++) { if (lanes[i][lanes[i].length - 1].e < it.s) { lanes[i].push(it); it.lane = i; placed = true; break; } } if (!placed) { it.lane = lanes.length; lanes.push([it]); } }
  return { items: sorted, laneCount: Math.max(1, lanes.length) };
}
