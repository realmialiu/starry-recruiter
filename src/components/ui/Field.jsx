export default function Field({ label, children }) {
  return <div className="field"><label className="label">{label}</label>{children}</div>;
}
