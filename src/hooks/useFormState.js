import { useState } from "react";

/* Shared form-state hook: replaces the repeated
     const [f, setF] = useState(initial);
     const set = (k, v) => setF(p => ({ ...p, [k]: v }));
   pattern used across the modal forms (EventModal, WindowModal, FocusModal,
   CompanyModal, CoffeeModal, SimpleLinkModal, TaskModal, PhaseModal). */
export function useFormState(initial) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return [f, set, setF];
}
