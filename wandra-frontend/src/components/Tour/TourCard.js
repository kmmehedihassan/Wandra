import React from "react";
import { Link } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import { BiTimeFive } from "react-icons/bi";
import { Img, SaveButton, Stars } from "../Layout/Shared";
import { formatBDT, useReviewSummary } from "../../store";
import { ReviewBadge } from "../Reviews/Reviews";

const TourCard = ({ tour }) => {
  const summary = useReviewSummary();
  return (
  <article className="list-card">
    <Link to={`/tours/${tour.id}`} className="list-card-img" aria-label={tour.title}>
      <Img src={tour.img} sizes="(max-width: 720px) 100vw, 300px" />
    </Link>
    <div className="list-card-body">
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <h3 className="list-card-title">
          <Link to={`/tours/${tour.id}`}>{tour.title}</Link>
        </h3>
        <div className="chip-row" style={{ alignItems: "center", flexWrap: "nowrap" }}>
          <span className="badge">{tour.category}</span>
          <SaveButton kind="tour" id={tour.id} name={tour.title} />
        </div>
      </div>
      <div className="media-card-meta">
        <MdOutlinePlace /> {tour.name}, {tour.location}
        <span aria-hidden="true">·</span>
        <BiTimeFive /> {tour.dur} night{tour.dur === 1 ? "" : "s"}
        <span aria-hidden="true">·</span>
        {tour.month}
      </div>
      <div className="chip-row" style={{ alignItems: "center" }}>
        <Stars value={tour.rating} />
        <ReviewBadge summary={summary.tours[tour.id]} />
      </div>
      <p className="media-card-desc">{tour.description}</p>
      <div className="list-card-foot">
        <span className="price">
          {formatBDT(tour.price)} <small>/ person</small>
        </span>
        <Link to={`/tours/${tour.id}`} className="btn btn-primary btn-sm">
          View &amp; book
        </Link>
      </div>
    </div>
  </article>
  );
};

export default TourCard;
