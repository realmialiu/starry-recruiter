/* ---------- starry palettes ---------- */
export const DEFAULT_TRACKS = {
  IB: { name: "Investment Banking", color: "#9B7FE0", soft: "#EDE6FB", short: "IB" },
  Consulting: { name: "Consulting", color: "#EEA65A", soft: "#FBEEDD", short: "Con" },
  PM: { name: "Product Management", color: "#7FB4E8", soft: "#E6F1FB", short: "PM" },
};

/* users can rename/delete/add tracks — this returns a fresh, independent
   copy to seed a profile's editable track set */
export const seedTracks = () => JSON.parse(JSON.stringify(DEFAULT_TRACKS));
