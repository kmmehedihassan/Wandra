import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiFillStar, AiOutlineHeart, AiOutlineStar } from "react-icons/ai";
import { isSaved, toggleWishlist, useWishlist } from "../../store";
import { BsStarHalf } from "react-icons/bs";

export function PageHero({ title, subtitle, eyebrow, image, tall = false, children }) {
  return (
    <section
      className={`page-hero${tall ? " tall" : ""}`}
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <div className="container-w page-hero-inner">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function Stars({ value = 0, size = 16 }) {
  const items = [];
  for (let i = 1; i <= 5; i += 1) {
    if (value >= i) items.push(<AiFillStar key={i} size={size} />);
    else if (value >= i - 0.5) items.push(<BsStarHalf key={i} size={size - 2} />);
    else items.push(<AiOutlineStar key={i} size={size} />);
  }
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {items}
    </span>
  );
}

export function Gallery({ images, title = "Gallery" }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!images || images.length === 0) return null;
  return (
    <section className="mt-4">
      <h2 className="section-title">{title}</h2>
      <p className="section-sub mb-0">Be our guest and see it for yourself</p>
      <div className="gallery mt-2">
        {images.map((src) => (
          <img key={src} src={src} alt="" loading="lazy" onClick={() => setOpen(src)} />
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
          <img src={open} alt="" />
        </div>
      )}
    </section>
  );
}

export function EmptyState({ title, text, actionTo, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
      {onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function Stepper({ value, min = 0, max = 99, onChange, label }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase">
        +
      </button>
    </div>
  );
}

// Scroll to the top whenever the route changes.
export function useScrollTop(dep) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dep]);
}

// Heart toggle for saving a destination, tour or hotel to the wishlist.
export function SaveButton({ kind, id, name, overlay = false }) {
  const wishlist = useWishlist();
  const saved = isSaved(wishlist, kind, id);
  return (
    <button
      type="button"
      className={`save-btn${saved ? " is-saved" : ""}${overlay ? " save-btn-overlay" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      title={saved ? "Saved" : "Save"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(kind, id);
      }}
    >
      {saved ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
    </button>
  );
}
