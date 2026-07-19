/* ---------- gamification ---------- */
export const RANKS = [
  { lv: 1, name: "Stargazer", at: 0 }, { lv: 2, name: "Wisher", at: 100 }, { lv: 3, name: "Comet", at: 300 },
  { lv: 4, name: "Nova", at: 600 }, { lv: 5, name: "Constellation", at: 1000 }, { lv: 6, name: "Supernova", at: 1500 },
  { lv: 7, name: "Galaxy", at: 2200 }, { lv: 8, name: "Starlight Legend", at: 3000 },
];
export const rankFor = (xp) => { let r = RANKS[0]; for (const x of RANKS) if (xp >= x.at) r = x; return r; };
export const nextRank = (xp) => RANKS.find((x) => x.at > xp) || null;
export const XP = { checkin: 5, task: 10, company: 5, chat: 30, thanks: 15, prep: 20, apply: 40, stage: 100, offer: 250, plant: 8 };
