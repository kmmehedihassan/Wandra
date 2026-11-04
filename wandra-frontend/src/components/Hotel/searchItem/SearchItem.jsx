import React from "react";
import { Link } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import { Img, SaveButton, Stars } from "../../Layout/Shared";
import { formatBDT, useReviewSummary } from "../../../store";
import { ReviewBadge } from "../../Reviews/Reviews";

const SearchItem = ({ hotel }) => {
  const summary = useReviewSummary();
  return (
  <article className="list-card">
    <Link to={`/hotels/${hotel.id}`} className="list-card-img" aria-label={hotel.name}>
      <Img src={hotel.src} sizes="(max-width: 720px) 100vw, 300px" />
    </Link>
    <div className="list-card-body">
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div>
          <h3 className="list-card-title">
            <Link to={`/hotels/${hotel.id}`}>{hotel.name}</Link>
          </h3>
          <div className="chip-row" style={{ alignItems: "center" }}>
            <Stars value={hotel.star} size={14} />
            <ReviewBadge summary={summary.hotels[hotel.id]} />
          </div>
        </div>
        <div className="chip-row" style={{ alignItems: "center", flexWrap: "nowrap" }}>
          <span className="score" title="Guest rating">{hotel.ratings}</span>
          <SaveButton kind="hotel" id={hotel.id} name={hotel.name} />
        </div>
      </div>
      <div className="media-card-meta">
        <MdOutlinePlace /> {hotel.category} · {hotel.dist}
      </div>
      <p className="media-card-desc">{hotel.highlights}. {hotel.desc}</p>
      <div className="chip-row">
        {String(hotel.features || "")
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean)
          .map((f) => (
            <span key={f} className="badge badge-neutral">{f}</span>
          ))}
        {hotel.service && <span className="badge badge-success">{hotel.service}</span>}
      </div>
      <div className="list-card-foot">
        <span className="price">
          from {formatBDT(hotel.price)} <small>/ night</small>
        </span>
        <Link to={`/hotels/${hotel.id}`} className="btn btn-primary btn-sm">
          See rooms
        </Link>
      </div>
    </div>
  </article>
  );
};

export default SearchItem;
