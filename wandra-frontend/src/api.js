// Central place for talking to the Django backend.
// Set REACT_APP_API_URL (e.g. in .env) to point at a deployed backend.
export const API_BASE = (
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export function getToken() {
  return window.localStorage.getItem("authToken");
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Token ${token}` } : { ...extra };
}

// Store the session returned by /auth/login or /auth/register.
// `userdata` keeps the shape the rest of the app already reads.
export function saveSession({ token, user }) {
  window.localStorage.setItem("authToken", token);
  window.localStorage.setItem("isAuthenticated", true);
  window.localStorage.setItem(
    "userdata",
    JSON.stringify({ username: user.username, useremail: user.email })
  );
  window.dispatchEvent(new Event("wandra:store"));
}

const SESSION_KEYS = ["authToken", "isAuthenticated", "userdata"];

export async function logout() {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch (e) {
      // Ignore network errors; the local session is cleared regardless.
    }
  }
  // Only end the session; keep the user's saved bookings and profile.
  SESSION_KEYS.forEach((key) => window.localStorage.removeItem(key));
  window.dispatchEvent(new Event("wandra:store"));
}

// Turn a DRF error response into a single readable message.
export function errorMessage(data, fallback = "Something went wrong. Try again!") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  return typeof first === "string" ? first : fallback;
}
