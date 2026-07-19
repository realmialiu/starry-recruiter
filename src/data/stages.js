export const STAGES = ["Interested", "Networking", "Applied", "OA / HireVue", "1st Round", "Superday / Final", "Offer", "Rejected", "Withdrawn"];
export const stageColor = (s) => ({
  "Interested": "#B7ADC9", "Networking": "#C9A3F0", "Applied": "#8FBEEC", "OA / HireVue": "#F3C64E",
  "1st Round": "#EEA65A", "Superday / Final": "#9B7FE0", "Offer": "#7FC98E", "Rejected": "#E39A9A", "Withdrawn": "#CFC7DA",
}[s] || "#B7ADC9");
