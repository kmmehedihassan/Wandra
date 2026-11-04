// Small client-side store for the session, cart and bookings.
// Everything lives in localStorage; components subscribe through the hooks
// below so the navbar badge, cart and dashboard update immediately.
import { useEffect, useState } from "react";

const EVENT = "wandra:store";

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}

function useStoreValue(getter) {
  const [value, setValue] = useState(getter);
  useEffect(() => {
    const update = () => setValue(getter());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [getter]);
  return value;
}

export function notifyStoreChanged() {
  window.dispatchEvent(new Event(EVENT));
}

/* ---------- Session ---------- */
export function getUser() {
  if (!window.localStorage.getItem("authToken")) return null;
  const data = read("userdata", null);
  if (!data || !data.username) return null;
  return { username: String(data.username), email: String(data.useremail || "") };
}

export function useUser() {
  return useStoreValue(getUser);
}

/* ---------- Login modal ---------- */
// Any component can ask the navbar to open the login/register modal.
export function openAuthModal(tab = "login") {
  window.dispatchEvent(new CustomEvent("wandra:auth", { detail: tab }));
}

/* ---------- Cart ---------- */
export function lineTotal(item) {
  if (item.type === "tour") return Number(item.price) * Number(item.ticket || 0);
  return Number(item.price) * Number(item.totalrooms || 0) * Number(item.days || 1);
}

export function getCart() {
  const cart = read("Cart", []);
  return Array.isArray(cart) ? cart : [];
}

export function useCart() {
  return useStoreValue(getCart);
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + lineTotal(item), 0);
}

function nextId() {
  const id = (Number(read("ItemId", 0)) || 0) + 1;
  window.localStorage.setItem("ItemId", JSON.stringify(id));
  return id;
}

export function addToCart(items) {
  const list = Array.isArray(items) ? items : [items];
  const cart = getCart();
  list.forEach((item) => cart.push({ ...item, id: nextId(), status: "inprogress" }));
  write("Cart", cart);
}

export function removeFromCart(id) {
  write("Cart", getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  write("Cart", []);
}

/* ---------- Bookings (per user) ---------- */
function bookingKey(username) {
  return `Bookings:${username}`;
}

export function getBookings() {
  const user = getUser();
  if (!user) return [];
  const list = read(bookingKey(user.username), []);
  return Array.isArray(list) ? list : [];
}

export function useBookings() {
  return useStoreValue(getBookings);
}

export function addBookings(items) {
  const user = getUser();
  if (!user) return;
  const bookedAt = new Date().toISOString();
  const next = [...getBookings(), ...items.map((item) => ({ ...item, bookedAt }))];
  write(bookingKey(user.username), next);
}

export function cancelBooking(id) {
  const user = getUser();
  if (!user) return;
  const next = getBookings().map((b) => (b.id === id ? { ...b, status: "cancelled" } : b));
  write(bookingKey(user.username), next);
}

/* ---------- Profile (per user) ---------- */
export function getProfile() {
  const user = getUser();
  if (!user) return {};
  return read(`Profile:${user.username}`, {});
}

export function useProfile() {
  return useStoreValue(getProfile);
}

export function saveProfile(profile) {
  const user = getUser();
  if (!user) return;
  write(`Profile:${user.username}`, profile);
}

/* ---------- Formatting ---------- */
export function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-US")}`;
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// YYYY-MM-DD in the user's local time zone (toISOString would use UTC).
export function localISODate(offsetDays = 0, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
