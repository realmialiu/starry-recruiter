import { BLOOMS } from "../../data/blooms";

export default function BloomPicker({ value, onChange }) {
  return <div className="row gap8 wrap">{BLOOMS.map((b) => <button key={b.id} className={"swatch" + (value === b.id ? " on" : "")} style={{ background: b.hex }} onClick={() => onChange(b.id)} title={b.id} />)}</div>;
}
