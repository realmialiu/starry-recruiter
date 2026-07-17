import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "auth_users";
const SESSION_KEY = "auth_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function readSession() {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Not cryptographically secure — this app has no backend, so this only
// avoids storing raw passwords in plain text in localStorage.
function hashPassword(password) {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (h << 5) - h + password.charCodeAt(i);
    h |= 0;
  }
  return `${h}:${btoa(unescape(encodeURIComponent(password))).slice(0, 8)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readSession();
    if (session?.email) {
      const users = loadUsers();
      const found = users.find((u) => u.email === session.email);
      if (found) setUser({ username: found.username, email: found.email });
    }
    setLoading(false);
  }, []);

  const signup = useCallback(({ username, email, password }) => {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = { username: username.trim(), email: normalizedEmail, password: hashPassword(password) };
    saveUsers([...users, newUser]);
    return { ok: true };
  }, []);

  const login = useCallback(({ email, password, remember }) => {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === normalizedEmail);
    if (!found || found.password !== hashPassword(password)) {
      return { ok: false, error: "Incorrect email or password." };
    }
    const session = { email: found.email };
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.removeItem(SESSION_KEY);
    }
    setUser({ username: found.username, email: found.email });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
