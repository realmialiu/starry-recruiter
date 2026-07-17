import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { STYLES, Pip, Field } from "../StarryRecruiter";
import { useAuth } from "../auth/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) return setError("Please choose a username.");
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    const result = signup({ username, email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/login", { replace: true, state: { justSignedUp: true } });
  };

  return (
    <div className="gr" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 18 }}>
      <style>{STYLES}</style>
      <div className="win" style={{ maxWidth: 420, width: "100%" }}>
        <div className="win-bar pink">⋆ STARRY.EXE — new save<span className="win-dots"><span>_</span><span>▢</span><span>x</span></span></div>
        <div className="win-body" style={{ padding: 22 }}>
          <div className="row gap10" style={{ marginBottom: 14 }}>
            <Pip size={44} />
            <div><h1 style={{ fontSize: 24 }}>Create your account</h1><div className="muted" style={{ fontSize: 12.5 }}>a cozy night-sky for recruiting</div></div>
          </div>
          <form onSubmit={submit}>
            <Field label="Username">
              <input className="input" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Email">
              <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
            </Field>
            <Field label="Password">
              <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </Field>
            <Field label="Confirm password">
              <input className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            </Field>
            {error && <div className="mono" style={{ color: "var(--rose)", fontSize: 14, marginBottom: 10 }}>{error}</div>}
            <button className="pbtn" type="submit" style={{ width: "100%", justifyContent: "center" }}>Start my sky ⋆</button>
          </form>
          <p className="faint" style={{ fontSize: 12, textAlign: "center", marginTop: 14 }}>
            Already have an account? <Link to="/login" style={{ color: "var(--grape)", fontWeight: 700 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
