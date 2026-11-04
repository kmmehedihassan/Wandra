import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { MdOutlinePlace, MdOutlineTour, MdOutlineHotel } from "react-icons/md";
import { RiShieldCheckLine } from "react-icons/ri";
import { sliderImage } from "./sliderImage";
import { Img, SaveButton, Stars, backgroundUrl, imageInfo } from "../Layout/Shared";
import { getDestinations, getTours } from "../Database/catalog";
import { formatBDT } from "../../store";
import "./home.css";

const SEARCH_TARGETS = {
  tours: { label: "Tours", path: "/tours" },
  destinations: { label: "Destinations", path: "/destinations" },
  hotels: { label: "Hotels", path: "/hotels" },
  blog: { label: "Blog", path: "/blog" },
};

const FEATURES = [
  { Icon: MdOutlinePlace, title: "12 destinations", text: "From coral islands to tea gardens and hill tracts." },
  { Icon: MdOutlineTour, title: "Guided tours", text: "Transport, meals and local guides included." },
  { Icon: MdOutlineHotel, title: "Hand-picked hotels", text: "Compare rooms and book for the dates you need." },
  { Icon: RiShieldCheckLine, title: "Easy changes", text: "Manage or cancel bookings from your dashboard." },
];

const Home = () => {
  const history = useHistory();
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState("tours");

  // Auto-advance the slideshow, unless the user asked for reduced motion.
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setSlide((s) => (s + 1) % sliderImage.length), 6000);
    return () => clearInterval(t);
  }, []);

  const destinations = useMemo(() => getDestinations().slice(0, 8), []);
  const tours = useMemo(
    () =>
      // The best-rated tour from each destination.
      getTours()
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .filter((t, i, all) => all.findIndex((x) => x.destinationId === t.destinationId) === i)
        .slice(0, 4),
    []
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    history.push(`${SEARCH_TARGETS[target].path}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <>
      <section className="home-hero">
        {sliderImage.map((s, i) => (
          <div key={s.urls} className={`home-hero-bg${i === slide ? " is-visible" : ""}`} style={{ backgroundImage: i === slide || i === (slide + 1) % sliderImage.length ? `url("${backgroundUrl(s.urls)}")` : undefined, backgroundColor: (imageInfo(s.urls) || {}).color }} aria-hidden="true" />
        ))}
        <div className="container-w home-hero-inner">
          <span className="eyebrow">Discover Bangladesh</span>
          <h1>Your next journey starts here</h1>
          <p className="home-hero-quote" key={slide}>“{sliderImage[slide].description}”</p>

          <form className="home-search" onSubmit={handleSearch} role="search">
            <label className="home-search-input">
              <BiSearch size={20} />
              <span className="visually-hidden">Search</span>
              <input placeholder="Where do you want to go?" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label className="home-search-select">
              <span className="visually-hidden">Search in</span>
              <select value={target} onChange={(e) => setTarget(e.target.value)}>
                {Object.entries(SEARCH_TARGETS).map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="home-hero-dots" aria-label="Background image">
            {sliderImage.map((s, i) => (
              <button key={s.urls} type="button" className={i === slide ? "is-active" : ""} aria-label={`Show image ${i + 1}`} aria-pressed={i === slide} onClick={() => setSlide(i)} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-w home-features">
        {FEATURES.map(({ Icon, title, text }) => (
          <div key={title} className="home-feature">
            <span className="home-feature-icon"><Icon size={22} /></span>
            <div>
              <strong>{title}</strong>
              <p className="muted small mb-0">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="container-w section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Destinations</span>
            <h2 className="section-title">Explore Bangladesh</h2>
          </div>
          <Link to="/destinations" className="btn btn-outline btn-sm">View all</Link>
        </div>
        <div className="grid-cards">
          {destinations.map((d) => (
            <div key={d.id} className="card-wrap">
              <Link to={`/destinations/${d.id}`} className="media-card">
                <div className="media-card-img">
                  <Img src={d.image} />
                </div>
                <div className="media-card-body">
                  <h3 className="media-card-title">{d.name}</h3>
                  <span className="media-card-meta"><MdOutlinePlace /> {d.region}</span>
                </div>
              </Link>
              <SaveButton kind="destination" id={d.id} name={d.name} overlay />
            </div>
          ))}
        </div>
      </section>

      <section className="container-w section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Tours</span>
            <h2 className="section-title">Popular tours</h2>
          </div>
          <Link to="/tours" className="btn btn-outline btn-sm">View all</Link>
        </div>
        <div className="grid-cards">
          {tours.map((t) => (
            <div key={t.id} className="card-wrap">
            <Link to={`/tours/${t.id}`} className="media-card">
              <div className="media-card-img">
                <Img src={t.img} />
              </div>
              <div className="media-card-body">
                <h3 className="media-card-title">{t.title}</h3>
                <span className="media-card-meta"><MdOutlinePlace /> {t.name}, {t.location}</span>
                <Stars value={t.rating} size={14} />
                <div className="media-card-foot">
                  <span className="price">{formatBDT(t.price)} <small>/ person</small></span>
                  <span className="badge badge-neutral">{t.dur} night{t.dur === 1 ? "" : "s"}</span>
                </div>
              </div>
            </Link>
            <SaveButton kind="tour" id={t.id} name={t.title} overlay />
            </div>
          ))}
        </div>
      </section>

      <section className="container-w section">
        <div className="home-cta">
          <div>
            <h2>Been somewhere amazing?</h2>
            <p>Share your story on the Wandra blog and help other travellers plan their trip.</p>
          </div>
          <Link to="/blog" className="btn btn-primary">Read the blog</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
