/* categories = star kinds */
export const CATEGORIES = [
  { id: "coffee", label: "Coffee chat", shape: "bloom", color: "pink" },
  { id: "info", label: "Info session", shape: "bloom", color: "blue" },
  { id: "insight", label: "Insight / diversity event", shape: "bloom", color: "purple" },
  { id: "deadline", label: "Application deadline", shape: "sun", color: "yellow" },
  { id: "interview", label: "Interview / superday", shape: "bloom", color: "rose" },
  { id: "prep", label: "Prep / study", shape: "sprout", color: "mint" },
  { id: "other", label: "Other", shape: "bloom", color: "peri" },
];
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[6];
