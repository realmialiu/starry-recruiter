import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { STYLES, Pip, Field } from "../StarryRecruiter";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const result = login({ email, password, remember });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  return (
    <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 18 }}>
      <style>{STYLES}</style>
      <div className="win" style={{ maxWidth: 420, width: "100%" }}>
        <div className="win-bar pink">⋆ STARRY.EXE — sign in<span className="win-dots"><span>_</span><span>▢</span><span>x</span></span></div>
        <div className="win-body" style={{ padding: 22 }}>
          <div className="row gap10" style={{ marginBottom: 14 }}>
            <Pip size={44} />
            <div><h1 style={{ fontSize: 24 }}>Welcome back</h1><div className="muted" style={{ fontSize: 12.5 }}>log in to your sky</div></div>
          </div>
          <form onSubmit={submit}>
            <Field label="Email">
              <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
            </Field>
            <Field label="Password">
              <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>
            <label className="row gap8" style={{ fontSize: 13, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            {error && <div className="mono" style={{ color: "var(--rose)", fontSize: 14, marginBottom: 10 }}>{error}</div>}
            <button className="pbtn" type="submit" style={{ width: "100%", justifyContent: "center" }}>Log in ⋆</button>
          </form>
          <p className="faint" style={{ fontSize: 12, textAlign: "center", marginTop: 14 }}>
            New here? <Link to="/signup" style={{ color: "var(--grape)", fontWeight: 700 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
