import { Sparkles } from "lucide-react";
import { rankFor, nextRank } from "../../data/gamification";
import Pip from "../sprites/Pip";

/* ---------- game strip ---------- */
export default function GameStrip({ profile }) {
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
