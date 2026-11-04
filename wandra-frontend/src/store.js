// Small client-side store for the session, cart and bookings.
// Components subscribe through the hooks below so the navbar badge, cart and
// dashboard update immediately.
import { useEffect, useState } from "react";
import { apiFetch } from "./api";

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

/* ---------- Notices ---------- */
// Short messages shown as a toast (see components/Layout/Toast.js).
export function notify(message, tone = "info") {
  window.dispatchEvent(new CustomEvent("wandra:notice", { detail: { message, tone } }));
}

/* ---------- Cart & bookings ----------
 * Logged-in users: the cart and bookings live on the backend and are cached here.
 * Guests: the cart is kept in localStorage and moved into the account at login.
 */
const GUEST_CART = "Cart";
const remote = { cart: null, bookings: null };

export function lineTotal(item) {
  if (item.total !== undefined && item.total !== null) return Number(item.total);
  if (item.type === "tour") return Number(item.price) * Number(item.ticket || 0);
  return Number(item.price) * Number(item.totalrooms || 0) * Number(item.days || 1);
}

function guestCart() {
  const cart = read(GUEST_CART, []);
  return Array.isArray(cart) ? cart : [];
}

export function getCart() {
  if (getUser()) return remote.cart || [];
  return guestCart();
}

export function useCart() {
  return useStoreValue(getCart);
}

function isCartLoaded() {
  return !getUser() || remote.cart !== null;
}

export function useCartLoaded() {
  return useStoreValue(isCartLoaded);
}

export function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + lineTotal(item), 0);
}

function nextId() {
  const id = (Number(read("ItemId", 0)) || 0) + 1;
  window.localStorage.setItem("ItemId", JSON.stringify(id));
  return id;
}

function toPayload(item) {
  return item.type === "tour"
    ? { type: "tour", refId: item.refId, quantity: Number(item.ticket), checkin: item.checkin, contact: item.contact }
    : { type: "hotel", roomid: item.roomid, quantity: Number(item.totalrooms), checkin: item.checkin, checkout: item.checkout };
}

function setRemoteCart(data) {
  remote.cart = data.items;
  notifyStoreChanged();
}

export async function refreshCart() {
  if (!getUser()) return;
  setRemoteCart(await apiFetch("/api/cart/"));
}

// Add one or more lines. Logged in: validated by the server (price and
// availability); throws ApiError with a readable message if a line is refused.
export async function addToCart(items) {
  const list = Array.isArray(items) ? items : [items];
  if (getUser()) {
    for (const item of list) {
      setRemoteCart(await apiFetch("/api/cart/", { method: "POST", body: toPayload(item) }));
    }
    return;
  }
  write(GUEST_CART, [...guestCart(), ...list.map((item) => ({ ...item, id: `guest-${nextId()}` }))]);
}

export async function removeFromCart(id) {
  if (getUser()) {
    setRemoteCart(await apiFetch(`/api/cart/${id}/`, { method: "DELETE" }));
    return;
  }
  write(GUEST_CART, guestCart().filter((item) => item.id !== id));
}

// Move the guest cart into the account after logging in.
async function mergeGuestCart() {
  const items = guestCart();
  if (items.length === 0) return;
  const refused = [];
  for (const item of items) {
    try {
      await apiFetch("/api/cart/", { method: "POST", body: toPayload(item) });
    } catch (err) {
      if (err.status === 0) throw err; // offline: keep the guest cart for next time
      refused.push(`${item.name}: ${err.message}`);
    }
  }
  write(GUEST_CART, []);
  if (refused.length) notify(`Some items couldn't be moved to your cart. ${refused.join(" ")}`, "error");
}

export function getBookings() {
  return getUser() ? remote.bookings || [] : [];
}

export function useBookings() {
  return useStoreValue(getBookings);
}

function isBookingsLoaded() {
  return !getUser() || remote.bookings !== null;
}

export function useBookingsLoaded() {
  return useStoreValue(isBookingsLoaded);
}

export async function refreshBookings() {
  if (!getUser()) return;
  remote.bookings = await apiFetch("/api/bookings/");
  notifyStoreChanged();
}

// Book everything in the cart. Returns { reference, total, bookings }.
export async function checkout() {
  const data = await apiFetch("/api/checkout/", { method: "POST" });
  remote.cart = [];
  remote.bookings = [...data.bookings, ...(remote.bookings || [])];
  notifyStoreChanged();
  return data;
}

export async function cancelBooking(id) {
  const updated = await apiFetch(`/api/bookings/${id}/cancel/`, { method: "POST" });
  remote.bookings = (remote.bookings || []).map((b) => (b.id === id ? updated : b));
  notifyStoreChanged();
}

// Keep the cached cart/bookings in step with the session. Used once in App.
export function useSessionSync() {
  const user = useUser();
  const username = user ? user.username : null;
  useEffect(() => {
    remote.cart = null;
    remote.bookings = null;
    notifyStoreChanged();
    if (!username) return;
    let active = true;
    (async () => {
      try {
        await mergeGuestCart();
        if (active) await Promise.all([refreshCart(), refreshBookings()]);
      } catch (err) {
        if (active) {
          remote.cart = remote.cart || [];
          remote.bookings = remote.bookings || [];
          notifyStoreChanged();
          notify(err.message, "error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [username]);
}

export async function fetchHotelAvailability(hotelId, checkin, checkout) {
  const data = await apiFetch(
    `/api/availability/hotels/${hotelId}/?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`
  );
  return Object.fromEntries(data.rooms.map((r) => [r.roomid, r.left]));
}

export async function fetchTourAvailability(tourId, date) {
  const data = await apiFetch(`/api/availability/tours/${tourId}/?date=${encodeURIComponent(date)}`);
  return data.left;
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
