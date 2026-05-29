/* ──────────────────────────────────────────────
   MioAssist — Auth helpers (localStorage only)
────────────────────────────────────────────── */

const USERS_KEY = "mio_users";
const SESSION_KEY = "mio_session";

// ── helpers ──────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── API ──────────────────────────────────────

export function register(data) {
  const users = getUsers();
  if (users.find((u) => u.correo === data.correo)) {
    return { ok: false, error: "Ya existe una cuenta con ese correo." };
  }
  const user = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
  saveUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function login(correo, contrasena, remember) {
  const users = getUsers();
  const user = users.find((u) => u.correo === correo && u.contrasena === contrasena);
  if (!user) return { ok: false, error: "Correo o contraseña incorrectos." };
  if (remember) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  return { ok: true, user };
}

export function getSession() {
  try {
    const ls = localStorage.getItem(SESSION_KEY);
    if (ls) return JSON.parse(ls);
    const ss = sessionStorage.getItem(SESSION_KEY);
    if (ss) return JSON.parse(ss);
  } catch {}
  return null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function updateProfile(updates) {
  const session = getSession();
  if (!session) return;
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === session.id);
  if (idx === -1) return;
  const updated = { ...users[idx], ...updates };
  users[idx] = updated;
  saveUsers(users);
  // update whichever storage has the session
  if (localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }
  return updated;
}