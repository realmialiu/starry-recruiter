import { uid } from "../utils/dates";

/* ---------- planting guide (editable timelines) ---------- */
export const TIMELINES = {
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
export const seedTimelines = () => { const o = {}; for (const k in TIMELINES) o[k] = TIMELINES[k].map((p) => ({ id: uid(), phase: p.phase, when: p.when, color: p.color, tasks: p.tasks.map((t) => ({ id: uid(), text: t })) })); return o; };
