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
const remote = { cart: null, bookings: null, profile: null, wishlist: null };

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
    remote.profile = null;
    remote.wishlist = null;
    notifyStoreChanged();
    if (!username) return;
    let active = true;
    (async () => {
      try {
        await mergeGuestCart();
        if (active) await Promise.all([refreshCart(), refreshBookings(), refreshProfile(), refreshWishlist()]);
      } catch (err) {
        if (active && err.status !== 401) {
          remote.cart = remote.cart || [];
          remote.bookings = remote.bookings || [];
          remote.profile = remote.profile || {};
          remote.wishlist = remote.wishlist || [];
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

/* ---------- Profile (stored on the backend) ---------- */
export function getProfile() {
  return getUser() ? remote.profile || {} : {};
}

export function useProfile() {
  return useStoreValue(getProfile);
}

function isProfileLoaded() {
  return !getUser() || remote.profile !== null;
}

export function useProfileLoaded() {
  return useStoreValue(isProfileLoaded);
}

export async function refreshProfile() {
  if (!getUser()) return;
  remote.profile = await apiFetch("/auth/profile");
  notifyStoreChanged();
}

// Update some profile fields, e.g. { phone } or { avatar_id }. Throws ApiError.
export async function saveProfile(fields) {
  remote.profile = await apiFetch("/auth/profile", { method: "PATCH", body: fields });
  notifyStoreChanged();
  return remote.profile;
}

/* ---------- Image uploads ---------- */
// Downscale a photo in the browser before uploading (the server also resizes).
export function resizeImage(file, maxEdge = 1600) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We couldn't read that image. Try another one."));
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("We couldn't process that image."))), "image/jpeg", 0.85);
    };
    img.src = url;
  });
}

// Upload an image file; returns { id, url }. Throws ApiError or Error.
export async function uploadImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const blob = await resizeImage(file);
  const form = new FormData();
  form.append("file", blob, "photo.jpg");
  return apiFetch("/api/images/", { method: "POST", body: form });
}

/* ---------- Formatting ---------- */
export function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-US")}`;
}

// Show a date as "5 Nov 2026". Plain YYYY-MM-DD dates are calendar dates (no
// time zone shift); timestamps are shown in Bangladesh time.
export function formatDate(value) {
  if (!value) return "";
  const plain = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(plain ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: plain ? "UTC" : "Asia/Dhaka",
  });
}

// Trips happen in Bangladesh, so "today" is always Bangladesh's date — the
// same rule the server uses (TIME_ZONE=Asia/Dhaka) — whatever the device's
// time zone. Dates are YYYY-MM-DD strings.
export const TRIP_TIME_ZONE = "Asia/Dhaka";

const tripDateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TRIP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Add whole days to a YYYY-MM-DD date.
export function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Today's date in Bangladesh, optionally shifted by `offsetDays`.
export function localISODate(offsetDays = 0) {
  const today = tripDateFormat.format(new Date());
  return offsetDays ? addDays(today, offsetDays) : today;
}

/* ---------- Review summaries (average rating per tour/hotel) ---------- */
let reviewSummary = { tours: {}, hotels: {} };
let reviewSummaryRequested = false;

function getReviewSummary() {
  return reviewSummary;
}

export async function refreshReviewSummary() {
  try {
    reviewSummary = await apiFetch("/api/reviews/summary/");
    notifyStoreChanged();
  } catch (e) {
    // Ratings are a nice-to-have on list pages; ignore failures.
  }
}

// { tours: { [id]: {average, count} }, hotels: {...} }, loaded once per page load.
export function useReviewSummary() {
  useEffect(() => {
    if (!reviewSummaryRequested) {
      reviewSummaryRequested = true;
      refreshReviewSummary();
    }
  }, []);
  return useStoreValue(getReviewSummary);
}

/* ---------- Wishlist (saved destinations, tours and hotels) ---------- */
function getWishlist() {
  return getUser() ? remote.wishlist || [] : [];
}

export function useWishlist() {
  return useStoreValue(getWishlist);
}

function isWishlistLoaded() {
  return !getUser() || remote.wishlist !== null;
}

export function useWishlistLoaded() {
  return useStoreValue(isWishlistLoaded);
}

export async function refreshWishlist() {
  if (!getUser()) return;
  remote.wishlist = await apiFetch("/api/wishlist/");
  notifyStoreChanged();
}

export function isSaved(wishlist, kind, refId) {
  return wishlist.some((w) => w.kind === kind && w.refId === Number(refId));
}

// Save or unsave; updates immediately and rolls back if the server refuses.
export async function toggleWishlist(kind, refId) {
  if (!getUser()) {
    openAuthModal("login");
    return;
  }
  const id = Number(refId);
  const before = remote.wishlist || [];
  const saved = isSaved(before, kind, id);
  remote.wishlist = saved
    ? before.filter((w) => !(w.kind === kind && w.refId === id))
    : [{ id: `pending-${kind}-${id}`, kind, refId: id, createdAt: new Date().toISOString() }, ...before];
  notifyStoreChanged();
  try {
    if (saved) {
      await apiFetch(`/api/wishlist/${kind}/${id}/`, { method: "DELETE" });
    } else {
      const item = await apiFetch("/api/wishlist/", { method: "POST", body: { kind, refId: id } });
      remote.wishlist = (remote.wishlist || []).map((w) => (w.id === `pending-${kind}-${id}` ? item : w));
      notifyStoreChanged();
    }
  } catch (err) {
    remote.wishlist = before;
    notifyStoreChanged();
    notify(err.message, "error");
  }
}

/* ---------- Payment provider ---------- */
let paymentConfig = null;
let paymentConfigRequested = false;

function getPaymentConfig() {
  return paymentConfig;
}

// { provider: "sslcommerz" | "demo", sandbox } once loaded, else null.
export function usePaymentConfig() {
  useEffect(() => {
    if (paymentConfigRequested) return;
    paymentConfigRequested = true;
    apiFetch("/api/payments/config/")
      .then((data) => {
        paymentConfig = data;
        notifyStoreChanged();
      })
      .catch(() => {
        paymentConfig = { provider: "demo", sandbox: true };
        notifyStoreChanged();
      });
  }, []);
  return useStoreValue(getPaymentConfig);
}
