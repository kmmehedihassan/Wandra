// Lookups that tie the static catalog together (destinations ↔ tours ↔ hotels).
import { accordiondata, destinationData, gridData, hotel_list, tourCardData, tour_details } from "./data";
import { HotelRoomData } from "./SingleHotel";

// Photo sets in /public/images, keyed by destination id.
const GALLERY_SETS = {
  1: ["st", 9, "jpg"],
  2: ["su", 9, { 4: "jpeg", 5: "jpeg", 9: "jpeg", default: "jpg" }],
  3: ["c", 9, "jpeg"],
  4: ["g", 9, "jpeg"],
  5: ["sr", 9, "jpeg"],
  6: ["t", 9, "jpeg"],
  7: ["k", 9, "jpeg"],
  8: ["s", 9, "jpeg"],
  9: ["a", 9, "jpeg"],
  10: ["m", 8, "jpeg"],
  11: ["r", 9, "jpeg"],
  12: ["n", 9, "jpeg"],
};

// Words that identify each destination in tour/hotel data (which uses
// inconsistent spellings like "Cox'sBazar" or "Sajek").
const DESTINATION_KEYWORDS = {
  1: ["martin"],
  2: ["sundarban"],
  3: ["cox"],
  4: ["guthia", "ghutia"],
  5: ["srimangal", "sreemangal"],
  6: ["tanguar"],
  7: ["kuakata"],
  8: ["sajek"],
  9: ["ahsan"],
  10: ["amiakhum"],
  11: ["ratargul"],
  12: ["nilgiri", "bandarban"],
};

const REGIONS = {
  1: "Chittagong",
  2: "Khulna",
  3: "Chittagong",
  4: "Barisal",
  5: "Sylhet",
  6: "Sylhet",
  7: "Barisal",
  8: "Chittagong",
  9: "Dhaka",
  10: "Bandarban",
  11: "Sylhet",
  12: "Bandarban",
};

// Approximate map positions [latitude, longitude].
const COORDINATES = {
  1: [20.6237, 92.3234], // St. Martin's Island
  2: [21.9497, 89.1833], // Sundarbans (Karamjal, near Mongla)
  3: [21.4272, 92.0058], // Cox's Bazar
  4: [22.8660, 90.2780], // Guthia Mosque, Barisal
  5: [24.3065, 91.7296], // Srimangal
  6: [25.1500, 91.0667], // Tanguar Haor
  7: [21.8167, 90.1206], // Kuakata
  8: [23.3820, 92.2938], // Sajek Valley
  9: [23.7086, 90.4060], // Ahsan Manzil, Dhaka
  10: [21.6900, 92.6000], // Amiakhum waterfall
  11: [25.0040, 91.9330], // Ratargul swamp forest
  12: [21.9130, 92.3380], // Nilgiri, Bandarban
};

const HOTEL_GALLERY = [
  "/images/sayeman.jpg",
  "/images/hotel.jpeg",
  "/images/long.jpg",
  "/images/cox.jpeg",
  "/images/tulip.jpg",
  "/images/dusai.jpg",
  "/images/palace.jpg",
  "/images/runmoy.jpg",
  "/images/convention.jpeg",
];

const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

export function galleryFor(destinationId) {
  const set = GALLERY_SETS[destinationId];
  if (!set) return [];
  const [prefix, count, ext] = set;
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const e = typeof ext === "string" ? ext : ext[n] || ext.default;
    return `/images/${prefix}${n}.${e}`;
  });
}

export function hotelGallery(hotel) {
  return [hotel.src, ...HOTEL_GALLERY.filter((src) => src !== hotel.src)].slice(0, 9);
}

export function destinationIdFor(text) {
  const t = norm(text);
  const match = Object.entries(DESTINATION_KEYWORDS).find(([, words]) => words.some((w) => t.includes(w)));
  return match ? Number(match[0]) : null;
}

export function getDestinations() {
  return gridData.map((g) => {
    const detail = destinationData.find((d) => d.id === g.id) || {};
    return {
      id: g.id,
      name: g.name,
      image: g.link,
      heroImage: detail.link || g.link,
      body: detail.body || "",
      region: REGIONS[g.id] || "",
      position: COORDINATES[g.id] || null,
    };
  });
}

export function getDestination(id) {
  return getDestinations().find((d) => d.id === Number(id)) || null;
}

export function faqFor(destinationId) {
  const entry = accordiondata.find((a) => a.id === destinationId);
  return entry ? entry.acc_content : [];
}

export function getTours() {
  return tourCardData.map((t) => {
    const detail = tour_details.find((d) => d.id === t.id) || {};
    return { ...t, ...detail, type: t.category, destinationId: destinationIdFor(`${t.name} ${t.title}`) };
  });
}

export function getTour(id) {
  return getTours().find((t) => t.id === Number(id)) || null;
}

export function toursForDestination(destinationId) {
  return getTours().filter((t) => t.destinationId === destinationId);
}

export function getHotels() {
  return hotel_list.map((h) => ({
    ...h,
    destinationId: destinationIdFor(`${h.location} ${h.category} ${h.name}`),
  }));
}

export function getHotel(id) {
  return getHotels().find((h) => h.id === Number(id)) || null;
}

export function hotelsForDestination(destinationId) {
  return getHotels().filter((h) => h.destinationId === destinationId);
}

// Room types for a hotel: ids 1-3 belong to hotel 1, ids N1-N3 to hotel N.
export function roomsForHotel(hotelId) {
  const id = Number(hotelId);
  return HotelRoomData.filter((room) => (id === 1 ? room.id <= 3 : Math.floor(room.id / 10) === id));
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
