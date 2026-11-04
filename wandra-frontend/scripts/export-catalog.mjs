// Export tour/hotel/room prices and stock from the frontend catalog to the
// backend (wandra-backend/djangoApi/TripsApp/catalog.json).
//
//   npm run export-catalog
//   cd ../wandra-backend/djangoApi && python manage.py sync_catalog
//
// The backend uses this data to price the cart and check availability, so run
// it whenever you change prices, rooms or tours in src/components/Database.
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const db = resolve(here, "../src/components/Database");
const out = resolve(here, "../../wandra-backend/djangoApi/TripsApp/catalog.json");

// The CRA sources use ESM syntax in .js files; copy them to .mjs to import.
const tmp = mkdtempSync(join(tmpdir(), "wandra-catalog-"));
copyFileSync(join(db, "data.js"), join(tmp, "data.mjs"));
copyFileSync(join(db, "SingleHotel.js"), join(tmp, "rooms.mjs"));
const data = await import(pathToFileURL(join(tmp, "data.mjs")));
const rooms = await import(pathToFileURL(join(tmp, "rooms.mjs")));
rmSync(tmp, { recursive: true, force: true });

const hotelOf = (roomId) => (roomId <= 3 ? 1 : Math.floor(roomId / 10));
const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const catalog = {
  destinations: data.gridData.map((d) => ({ id: d.id, name: d.name, image: d.link })),
  tours: data.tourCardData.map((t) => ({ id: t.id, title: t.title, price: t.price, image: t.img })),
  hotels: data.hotel_list.map((h) => ({ id: h.id, name: h.name, price: h.price, image: h.src })),
  rooms: rooms.HotelRoomData.map((room) => {
    const hotel = hotelOf(room.id);
    const stock = rooms.HOTEL_INVENTORY.find((i) => i.roomid === room.id && i.hotelid === hotel);
    return {
      id: room.id,
      hotel,
      name: titleCase(room.type),
      price: room.price,
      adults: room.Adult,
      children: room.children,
      quantity: stock ? stock.roomquantity : 10,
    };
  }),
};

writeFileSync(out, JSON.stringify(catalog, null, 1) + "\n");
console.log(`Wrote ${catalog.destinations.length} destinations, ${catalog.tours.length} tours, ${catalog.hotels.length} hotels, ${catalog.rooms.length} rooms to ${out}`);
