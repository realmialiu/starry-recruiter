import { uid } from "./dates";
import { MONTHS, endOfMonth } from "./dates";

/* ---------- smart-add parser ---------- */
export const MONTH_IDX = { jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11 };
export const SEASON = { spring:{m:2,span:2}, summer:{m:5,span:2}, fall:{m:8,span:2}, autumn:{m:8,span:2}, winter:{m:11,span:2} };
export function guessTrack(t) {
  t = t.toLowerCase();
  if (/consult|casing|case comp|kickstart|bcg|bain|mckinsey|deloitte|strategy&|oliver wyman/.test(t)) return "Consulting";
  if (/\bpm\b|product manag|apm|rpm|associate product/.test(t)) return "PM";
  if (/\bib\b|invest|banking|markets|s&t|analyst|goldman|morgan|jpm|evercore|lazard|moelis|first forward|entrepreneurial/.test(t)) return "IB";
  return null;
}
export function parseExpected(raw) {
  const s = raw.toLowerCase(); const ym = s.match(/20\d\d/); const year = ym ? +ym[0] : new Date().getFullYear() + 1;
  const early = /early/.test(s), late = /late/.test(s), mid = /mid/.test(s); const day = early ? 5 : late ? 25 : mid ? 15 : 1;
  for (const k in MONTH_IDX) if (new RegExp(`\\b${k}\\b`).test(s)) { const m = MONTH_IDX[k]; return { label: `${MONTHS[m]} ${year}`, expected: new Date(year, m, day), start: new Date(year, m, 1), end: endOfMonth(new Date(year, m, 1)) }; }
  for (const k in SEASON) if (new RegExp(`\\b${k}\\b`).test(s)) { const { m, span } = SEASON[k]; return { label: `${k[0].toUpperCase() + k.slice(1)} ${year}`, expected: new Date(year, m + 1, 1), start: new Date(year, m, 1), end: endOfMonth(new Date(year, m + span, 1)) }; }
  return { label: `${year}`, expected: new Date(year, 5, 1), start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
}
export function smartParse(block, fallback) {
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
