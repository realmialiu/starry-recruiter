import { createContext, useContext } from "react";

const TracksContext = createContext(null);

export function TracksProvider({ value, children }) {
  return <TracksContext.Provider value={value}>{children}</TracksContext.Provider>;
}

/* gives any component access to the user's live (customizable) track set
   without threading it through every page/modal prop list */
export function useTracks() {
  const ctx = useContext(TracksContext);
  if (!ctx) throw new Error("useTracks must be used within a TracksProvider");
  return ctx;
}
