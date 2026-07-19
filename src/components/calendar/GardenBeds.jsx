import { Pin, Sparkles } from "lucide-react";
import { parseYMD, endOfMonth, daysInMonth } from "../../utils/dates";
import { packLanes } from "../../utils/recurrence";
import { TRACKS } from "../../data/tracks";
import { bloomHex } from "../../data/blooms";

/* ---------- garden beds (drop windows + focus ranges) ---------- */
export default function GardenBeds({ monthStart, windows, focus, onWin, onFocus }) {
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
