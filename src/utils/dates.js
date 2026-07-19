/* ---------- id + date utils ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseYMD = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
export const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const sameDay = (a, b) => ymd(a) === ymd(b);
export const daysInMonth = (d) => endOfMonth(d).getDate();
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const MON_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
export function monthMatrix(y, m) {
  const first = new Date(y, m, 1); const start = addDays(first, -first.getDay());
  const weeks = [];
  for (let w = 0; w < 6; w++) { const row = []; for (let d = 0; d < 7; d++) row.push(addDays(start, w * 7 + d)); weeks.push(row); }
  return weeks;
}
export const fmtTime = (t) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}${m ? ":" + pad(m) : ""}${ap}`; };
export function relDay(d) {
  const diff = Math.round((parseYMD(ymd(d)) - today()) / 86400000);
  if (diff === 0) return "today"; if (diff === 1) return "tomorrow"; if (diff === -1) return "yesterday";
  if (diff > 1 && diff < 7) return `in ${diff}d`; if (diff < 0) return `${-diff}d ago`;
  return `${MON_SHORT[d.getMonth()]} ${d.getDate()}`;
}
