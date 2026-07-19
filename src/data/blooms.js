/* star colors — pastel pink / purple / yellow / blue */
export const BLOOMS = [
  { id: "pink", hex: "#F48FB6" }, { id: "rose", hex: "#EE8FA8" }, { id: "purple", hex: "#C9A3F0" },
  { id: "grape", hex: "#9B7FE0" }, { id: "peri", hex: "#A9A7F0" }, { id: "blue", hex: "#8FBEEC" },
  { id: "yellow", hex: "#F3C64E" }, { id: "mint", hex: "#7FC98E" },
];
export const bloomHex = (id) => (BLOOMS.find((b) => b.id === id) || BLOOMS[0]).hex;
