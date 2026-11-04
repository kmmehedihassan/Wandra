import React, { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight, HiOutlineX } from "react-icons/hi";
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
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {items}
    </span>
  );
}

// Keep Tab focus inside `ref` while active, and restore focus afterwards.
export function useFocusTrap(ref, active) {
  // Remember what had focus *before* the dialog rendered (autoFocus inside the
  // dialog runs before effects), so it can be restored on close.
  const previousRef = useRef(null);
  if (active && previousRef.current === null && typeof document !== "undefined") {
    previousRef.current = document.activeElement;
  }
  useEffect(() => {
    if (!active || !ref.current) {
      previousRef.current = null;
      return undefined;
    }
    const previous = previousRef.current;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const onKey = (e) => {
      if (e.key !== "Tab" || !ref.current) return;
      const items = [...ref.current.querySelectorAll(selector)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    if (!ref.current.contains(document.activeElement)) {
      const target = ref.current.querySelector("[autofocus], input, button");
      if (target) target.focus();
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [ref, active]);
}

export function Gallery({ images, title = "Gallery" }) {
  const [index, setIndex] = useState(null);
  const dialogRef = useRef(null);
  const open = index !== null;
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const count = images.length;
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, images]);

  if (!images || images.length === 0) return null;
  const step = (delta) => (e) => {
    e.stopPropagation();
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  return (
    <section className="mt-4">
      <h2 className="section-title">{title}</h2>
      <p className="section-sub mb-0">Be our guest and see it for yourself</p>
      <div className="gallery mt-2">
        {images.map((src, i) => (
          <button key={src} type="button" className="gallery-item" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1} of ${images.length}`}>
            <Img src={src} sizes="(max-width: 560px) 50vw, 260px" />
          </button>
        ))}
      </div>
      {open && (
        <div className="lightbox" onClick={() => setIndex(null)} role="dialog" aria-modal="true" aria-label={`${title}: photo ${index + 1} of ${images.length}`} ref={dialogRef}>
          <Img src={images[index]} sizes="90vw" eager onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lightbox-btn lightbox-close" aria-label="Close" onClick={() => setIndex(null)}>
            <HiOutlineX size={22} />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" className="lightbox-btn lightbox-prev" aria-label="Previous photo" onClick={step(-1)}>
                <HiChevronLeft size={28} />
              </button>
              <button type="button" className="lightbox-btn lightbox-next" aria-label="Next photo" onClick={step(1)}>
                <HiChevronRight size={28} />
              </button>
            </>
          )}
          <span className="lightbox-count" aria-live="polite">
            {index + 1} / {images.length}
          </span>
        </div>
      )}
    </section>
  );
}

export function EmptyState({ title, text, actionTo, actionLabel, onAction, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return (
    <div className="empty-state">
      <Heading className="empty-state-title">{title}</Heading>
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
