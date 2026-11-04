import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import SearchItem from "../searchItem/SearchItem";
import { PageHero, EmptyState } from "../../Layout/Shared";
import { getDestinations, getHotels } from "../../Database/catalog";
import "../hotel.css";

const SORTS = {
  recommended: { label: "Top rated", fn: (a, b) => b.ratings - a.ratings },
  priceAsc: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  priceDesc: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  stars: { label: "Stars: high to low", fn: (a, b) => b.star - a.star || b.ratings - a.ratings },
};

const EMPTY = { search: "", destination: "", min: "", max: "", stars: 0 };

const List = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    ...EMPTY,
    search: params.get("q") || "",
    destination: params.get("destination") || "",
  });
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const hotels = useMemo(getHotels, []);
  const destinations = useMemo(
    () => getDestinations().filter((d) => hotels.some((h) => h.destinationId === d.id)),
    [hotels]
  );

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters(EMPTY);

  const min = filters.min === "" ? 0 : Number(filters.min);
  const max = filters.max === "" ? Infinity : Number(filters.max);
  const priceError = filters.min !== "" && filters.max !== "" && min > max;

  const results = hotels
    .filter((h) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !`${h.name} ${h.category} ${h.location}`.toLowerCase().includes(q)) return false;
      if (filters.destination && h.destinationId !== Number(filters.destination)) return false;
      if (!priceError && (h.price < min || h.price > max)) return false;
      if (filters.stars && h.star < filters.stars) return false;
      return true;
    })
    .sort(SORTS[sort].fn);

  const activeCount = Object.keys(EMPTY).filter((k) => filters[k] !== EMPTY[k]).length;

  return (
    <>
      <PageHero
        eyebrow="Hotels"
        title="Places to stay"
        subtitle="Beach resorts, hill cottages and city hotels — compare rooms and book in a few clicks."
        image="/images/sayeman.jpg"
      />
      <div className="container-w section">
        <div className="layout-sidebar">
          <aside className={`card card-pad filters sticky-card${showFilters ? " is-open" : ""}`}>
            <div className="row-between">
              <h2 className="card-title mb-0">Filters</h2>
              {activeCount > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
                  Reset
                </button>
              )}
            </div>
            <div className="field mt-2">
              <label className="field-label" htmlFor="hotel-q">Search</label>
              <div className="input-icon">
                <BiSearch />
                <input id="hotel-q" className="input" placeholder="Hotel or city" value={filters.search} onChange={(e) => set("search", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="hotel-dest">Destination</label>
              <select id="hotel-dest" className="select" value={filters.destination} onChange={(e) => set("destination", e.target.value)}>
                <option value="">Anywhere</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <span className="field-label">Price per night (৳)</span>
              <div className="field-row">
                <input className="input" type="number" min={0} placeholder="Min" aria-label="Minimum price" value={filters.min} onChange={(e) => set("min", e.target.value)} />
                <input className="input" type="number" min={0} placeholder="Max" aria-label="Maximum price" value={filters.max} onChange={(e) => set("max", e.target.value)} />
              </div>
              {priceError && <span className="field-error">Minimum is higher than maximum</span>}
            </div>
            <div className="field">
              <span className="field-label">Hotel class</span>
              <div className="chip-row">
                {[0, 3, 4, 5].map((s) => (
                  <button key={s} type="button" className={`chip${filters.stars === s ? " is-active" : ""}`} onClick={() => set("stars", s)}>
                    {s === 0 ? "Any" : `${s}★ +`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="results-bar">
              <span className="muted">
                <strong className="results-count">{results.length}</strong> of {hotels.length} hotels
              </span>
              <div className="results-bar-actions">
                <button type="button" className="btn btn-outline btn-sm filters-toggle" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? "Hide filters" : `Filters${activeCount ? ` (${activeCount})` : ""}`}
                </button>
                <label className="sort-select">
                  <span className="visually-hidden">Sort by</span>
                  <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                    {Object.entries(SORTS).map(([key, s]) => (
                      <option key={key} value={key}>{s.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {results.length === 0 ? (
              <EmptyState title="No hotels match your filters" text="Try another destination or a wider price range." onAction={reset} actionLabel="Reset filters" />
            ) : (
              results.map((hotel) => <SearchItem key={hotel.id} hotel={hotel} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default List;
