import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiFillStar, AiOutlineHeart, AiOutlineStar } from "react-icons/ai";
import { isSaved, toggleWishlist, useWishlist } from "../../store";
import { BsStarHalf } from "react-icons/bs";
import manifest from "../../imageManifest.json";

/* ---------- Images ---------- */
// Photos in /public/images have WebP copies in several widths (see
// scripts/optimize-images.mjs). Anything else (e.g. uploads) is used as is.
export function imageInfo(src) {
  return manifest[src] || null;
}

// Best WebP copy for a CSS background of roughly `width` pixels.
export function backgroundUrl(src, width = 1600) {
  const info = imageInfo(src);
  if (!info) return src;
  const pick = info.srcset.find(([, w]) => w >= width) || info.srcset[info.srcset.length - 1];
  return pick[0];
}

export function Img({ src, alt = "", sizes = "(max-width: 720px) 100vw, 420px", className = "", eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const info = imageInfo(src);
  if (!info) {
    return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} decoding="async" {...rest} />;
  }
  return (
    <img
      src={info.srcset[Math.min(1, info.srcset.length - 1)][0]}
      srcSet={info.srcset.map(([url, w]) => `${url} ${w}w`).join(", ")}
      sizes={sizes}
      width={info.w}
      height={info.h}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`img-fade${loaded ? " is-loaded" : ""} ${className}`.trim()}
      style={{ backgroundColor: info.color }}
      onLoad={() => setLoaded(true)}
      {...rest}
    />
  );
}

export function PageHero({ title, subtitle, eyebrow, image, tall = false, children }) {
  const info = image ? imageInfo(image) : null;
  return (
    <section
      className={`page-hero${tall ? " tall" : ""}`}
      style={image ? { backgroundImage: `url("${backgroundUrl(image)}")`, backgroundColor: info ? info.color : undefined } : undefined}
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
          <button key={src} type="button" className="gallery-item" onClick={() => setOpen(src)} aria-label="Open photo">
            <Img src={src} sizes="(max-width: 560px) 50vw, 260px" />
          </button>
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
          <Img src={open} sizes="90vw" eager />
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

// Scroll to the top when the route changes, or to #anchor when the URL has one.
export function useScrollTop(pathname, hash = "") {
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        clearInterval(timer);
        if (el) el.scrollIntoView({ block: "start" });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);
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
