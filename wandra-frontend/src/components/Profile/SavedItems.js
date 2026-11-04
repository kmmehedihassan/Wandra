import React from "react";
import { Link } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import { EmptyState, SaveButton } from "../Layout/Shared";
import { getDestination, getHotel, getTour } from "../Database/catalog";
import { formatBDT, useWishlist, useWishlistLoaded } from "../../store";

const GROUPS = [
  { kind: "destination", title: "Destinations" },
  { kind: "tour", title: "Tours" },
  { kind: "hotel", title: "Hotels" },
];

// Turn a wishlist entry into what the card needs (from the frontend catalog).
function describe(item) {
  if (item.kind === "destination") {
    const d = getDestination(item.refId);
    return d && { to: `/destinations/${d.id}`, name: d.name, image: d.image, meta: d.region };
  }
  if (item.kind === "tour") {
    const t = getTour(item.refId);
    return t && { to: `/tours/${t.id}`, name: t.title, image: t.img, meta: `${t.name} · from ${formatBDT(t.price)}` };
  }
  const h = getHotel(item.refId);
  return h && { to: `/hotels/${h.id}`, name: h.name, image: h.src, meta: `${h.category} · from ${formatBDT(h.price)}/night` };
}

const SavedItems = () => {
  const wishlist = useWishlist();
  const loaded = useWishlistLoaded();

  if (!loaded) {
    return (
      <>
        <h1 className="card-title">Saved</h1>
        <div className="skeleton" />
      </>
    );
  }

  const entries = wishlist.map((item) => ({ item, info: describe(item) })).filter((e) => e.info);

  return (
    <>
      <h1 className="card-title">Saved</h1>
      {entries.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          text="Tap the heart on any destination, tour or hotel to keep it here for later."
          actionTo="/destinations"
          actionLabel="Explore destinations"
        />
      ) : (
        GROUPS.map(({ kind, title }) => {
          const group = entries.filter((e) => e.item.kind === kind);
          if (group.length === 0) return null;
          return (
            <section key={kind} className="mt-2">
              <h2 className="saved-group-title">
                {title} <span className="muted">({group.length})</span>
              </h2>
              <ul className="saved-list">
                {group.map(({ item, info }) => (
                  <li key={`${item.kind}-${item.refId}`} className="saved-item">
                    <Link to={info.to} className="saved-link">
                      <img src={info.image} alt="" loading="lazy" />
                      <div>
                        <strong>{info.name}</strong>
                        <span className="muted small"><MdOutlinePlace /> {info.meta}</span>
                      </div>
                    </Link>
                    <SaveButton kind={item.kind} id={item.refId} name={info.name} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
};

export default SavedItems;
