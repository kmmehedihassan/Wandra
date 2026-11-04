import React, { useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { MdOutlinePlace } from "react-icons/md";
import { PageHero, EmptyState } from "../Layout/Shared";
import { getDestinations, toursForDestination } from "../Database/catalog";
import "./destination.css";

const Destinations = () => {
  const location = useLocation();
  const history = useHistory();
  const [search, setSearch] = useState(new URLSearchParams(location.search).get("q") || "");
  const destinations = useMemo(getDestinations, []);

  const results = destinations.filter((d) =>
    `${d.name} ${d.region}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const updateSearch = (value) => {
    setSearch(value);
    history.replace(value ? `/destinations?q=${encodeURIComponent(value)}` : "/destinations");
  };

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title="Explore Bangladesh"
        subtitle="Beaches, mangrove forests, tea gardens and hill tracts — find your next adventure."
        image="/images/two.jpg"
      />
      <section className="container-w section">
        <div className="section-head">
          <div>
            <h2 className="section-title">{results.length} destinations</h2>
            <p className="section-sub">Pick a place to see things to know, photos and tours.</p>
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

        {results.length === 0 ? (
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
                <Link key={d.id} to={`/destinations/${d.id}`} className="media-card dest-card">
                  <div className="media-card-img">
                    <img src={d.image} alt="" loading="lazy" />
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
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default Destinations;
