/* ---------- centralized persistence layer ----------
   All app data (profiles, save-files, settings, etc.) is namespaced per
   logged-in user, so User A never sees User B's data on a shared device.
   Reads the auth session directly (rather than importing AuthContext) to
   avoid a circular dependency between the storage layer and the app. */

const SESSION_KEY = "auth_session";
const APP_PREFIX = "starry";

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.email || "guest";
  } catch {
    return "guest";
  }
}

function namespacedKey(key) {
  return `${APP_PREFIX}:${getCurrentUserId()}:${key}`;
}

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(namespacedKey(key));
      return raw != null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(namespacedKey(key), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(namespacedKey(key));
    } catch {
      /* ignore */
    }
  },
};
