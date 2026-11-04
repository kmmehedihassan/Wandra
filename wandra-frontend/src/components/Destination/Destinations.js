import React, { Suspense, lazy, useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { MdOutlinePlace } from "react-icons/md";
import { PageHero, EmptyState, Img, SaveButton } from "../Layout/Shared";
import { getDestinations, toursForDestination } from "../Database/catalog";
import "./destination.css";

const DestinationMap = lazy(() => import("./DestinationMap"));

const Destinations = () => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const [search, setSearch] = useState(params.get("q") || "");
  const view = params.get("view") === "map" ? "map" : "grid";
  const destinations = useMemo(getDestinations, []);

  const results = destinations.filter((d) =>
    `${d.name} ${d.region}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const updateUrl = (q, v) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (v === "map") next.set("view", "map");
    const qs = next.toString();
    history.replace(`/destinations${qs ? `?${qs}` : ""}`);
  };

  const updateSearch = (value) => {
    setSearch(value);
    updateUrl(value, view);
  };

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Explore Bangladesh"
        subtitle="Beaches, mangrove forests, tea gardens and hill tracts — find your next adventure."
        image="/images/seven.jpg"
      />
      <section className="container-w section">
        <div className="section-head">
          <div>
            <h2 className="section-title">{results.length} destinations</h2>
            <p className="section-sub">Pick a place to see things to know, photos and tours.</p>
          </div>
          <div className="chip-row" style={{ alignItems: "center" }}>
          <div className="view-switch" role="group" aria-label="View">
            {["grid", "map"].map((v) => (
              <button key={v} type="button" className={view === v ? "is-active" : ""} aria-pressed={view === v} onClick={() => updateUrl(search, v)}>
                {v === "grid" ? "Grid" : "Map"}
              </button>
            ))}
          </div>
          <label className="input-icon dest-search">
            <BiSearch />
            <span className="visually-hidden">Search destinations</span>
            <input
              className="input"
              placeholder="Search destinations or regions"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </label>
          </div>
        </div>

        {results.length > 0 && view === "map" ? (
          <Suspense fallback={<div className="skeleton" style={{ height: 520 }} />}>
            <DestinationMap destinations={results} />
            <p className="muted small mt-1">Tap a pin to see the destination. Locations are approximate.</p>
          </Suspense>
        ) : results.length === 0 ? (
          <EmptyState
            title="No destinations match your search"
            text="Try another name, such as Sajek or Kuakata."
            onAction={() => updateSearch("")}
            actionLabel="Clear search"
          />
        ) : (
          <div className="grid-cards">
            {results.map((d) => {
              const tours = toursForDestination(d.id).length;
              return (
                <div key={d.id} className="card-wrap">
                  <Link to={`/destinations/${d.id}`} className="media-card dest-card">
                    <div className="media-card-img">
                      <Img src={d.image} />
                    </div>
                    <div className="media-card-body">
                      <h3 className="media-card-title">{d.name}</h3>
                      <span className="media-card-meta">
                        <MdOutlinePlace /> {d.region}
                      </span>
                      <div className="media-card-foot">
                        <span className="badge badge-neutral">
                          {tours > 0 ? `${tours} tour${tours > 1 ? "s" : ""}` : "Self-guided"}
                        </span>
                        <span className="link-arrow">Explore →</span>
                      </div>
                    </div>
                  </Link>
                  <SaveButton kind="destination" id={d.id} name={d.name} overlay />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default Destinations;
