import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating";
import TourCard from "./TourCard";
import { PageHero, EmptyState } from "../Layout/Shared";
import { getDestinations, getTours, MONTHS } from "../Database/catalog";
import { formatBDT } from "../../store";

const PRICE_MAX = 30000;
const SORTS = {
  recommended: { label: "Recommended", fn: (a, b) => b.rating - a.rating || a.price - b.price },
  priceAsc: { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  priceDesc: { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  rating: { label: "Rating: high to low", fn: (a, b) => b.rating - a.rating },
  name: { label: "Name (A–Z)", fn: (a, b) => a.title.localeCompare(b.title) },
};

const Tours = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initial = {
    search: params.get("q") || "",
    destination: params.get("destination") || "",
    month: "",
    price: [0, PRICE_MAX],
    rating: 0,
  };
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const tours = useMemo(getTours, []);
  const destinations = useMemo(
    () => getDestinations().filter((d) => tours.some((t) => t.destinationId === d.id)),
    [tours]
  );

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const reset = () => setFilters({ search: "", destination: "", month: "", price: [0, PRICE_MAX], rating: 0 });

  const results = tours
    .filter((t) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !`${t.title} ${t.name} ${t.location} ${t.category}`.toLowerCase().includes(q)) return false;
      if (filters.destination && t.destinationId !== Number(filters.destination)) return false;
      if (filters.month && t.month !== filters.month) return false;
      if (t.price < filters.price[0] || t.price > filters.price[1]) return false;
      if (filters.rating && t.rating < filters.rating) return false;
      return true;
    })
    .sort(SORTS[sort].fn);

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.destination ? 1 : 0) +
    (filters.month ? 1 : 0) +
    (filters.price[0] > 0 || filters.price[1] < PRICE_MAX ? 1 : 0) +
    (filters.rating ? 1 : 0);

  return (
    <>
      <PageHero
        eyebrow="Tours"
        title="Guided tours across Bangladesh"
        subtitle="Hand-picked trips with transport, meals and a local guide included."
        image="/images/three.jpg"
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
              <label className="field-label" htmlFor="tour-q">Search</label>
              <div className="input-icon">
                <BiSearch />
                <input id="tour-q" className="input" placeholder="Tour name or place" value={filters.search} onChange={(e) => set("search", e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tour-dest">Destination</label>
              <select id="tour-dest" className="select" value={filters.destination} onChange={(e) => set("destination", e.target.value)}>
                <option value="">Anywhere</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="tour-month">Month</label>
              <select id="tour-month" className="select" value={filters.month} onChange={(e) => set("month", e.target.value)}>
                <option value="">Any month</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <span className="field-label">Price per person</span>
              <div style={{ padding: "0 8px" }}>
                <Slider
                  value={filters.price}
                  onChange={(e, value) => set("price", value)}
                  min={0}
                  max={PRICE_MAX}
                  step={500}
                  getAriaLabel={(i) => (i === 0 ? "Minimum price" : "Maximum price")}
                  sx={{ color: "var(--brand)" }}
                />
              </div>
              <span className="muted small">
                {formatBDT(filters.price[0])} – {formatBDT(filters.price[1])}
              </span>
            </div>
            <div className="field">
              <span className="field-label">Minimum rating</span>
              <Rating value={filters.rating} onChange={(e, value) => set("rating", value || 0)} />
            </div>
          </aside>

          <div>
            <div className="results-bar">
              <span className="muted">
                <strong className="results-count">{results.length}</strong> of {tours.length} tours
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
              <EmptyState title="No tours match your filters" text="Try widening the price range or choosing another month." onAction={reset} actionLabel="Reset filters" />
            ) : (
              results.map((tour) => <TourCard key={tour.id} tour={tour} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tours;
