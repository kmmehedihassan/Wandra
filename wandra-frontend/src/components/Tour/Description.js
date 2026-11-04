import React from "react";
import { Link, useParams } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import BookTour from "./BookTour";
import Error from "../../pages/Error";
import { PageHero, Gallery, SaveButton, Stars } from "../Layout/Shared";
import { galleryFor, getDestination, getTour } from "../Database/catalog";
import Reviews, { ReviewBadge } from "../Reviews/Reviews";
import { useReviewSummary } from "../../store";

const Description = () => {
  const { id } = useParams();
  const summary = useReviewSummary();
  const tour = getTour(id);
  if (!tour) return <Error />;
  const destination = tour.destinationId ? getDestination(tour.destinationId) : null;

  return (
    <>
      <PageHero eyebrow={tour.category} title={tour.title} image={tour.img} tall>
        <div className="hero-meta">
          <Stars value={tour.rating} />
          <ReviewBadge summary={summary.tours[tour.id]} className="on-dark" />
          <span>
            <MdOutlinePlace /> {tour.name}, {tour.location}
          </span>
          <SaveButton kind="tour" id={tour.id} name={tour.title} />
        </div>
      </PageHero>
      <div className="container-w section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/tours">Tours</Link> <span>/</span> {tour.title}
        </nav>
        <div className="layout-aside">
          <div>
            <h2 className="section-title">About this tour</h2>
            <p className="lead">{tour.description}</p>
            <dl className="detail-list mt-3">
              <dt>Type</dt>
              <dd>{tour.category}</dd>
              <dt>Departure</dt>
              <dd>{tour.time}</dd>
              <dt>Duration</dt>
              <dd>{tour.dur} night{tour.dur === 1 ? "" : "s"}</dd>
              <dt>Best month</dt>
              <dd>{tour.month}</dd>
              <dt>What to bring</dt>
              <dd>{tour.req}</dd>
              <dt>Included</dt>
              <dd>{tour.inc}</dd>
              <dt>Not included</dt>
              <dd>{tour.ninc}</dd>
            </dl>
            {destination && (
              <p className="mt-3">
                Learn more about <Link to={`/destinations/${destination.id}`}>{destination.name}</Link> before you go.
              </p>
            )}
            <Gallery images={tour.destinationId ? galleryFor(tour.destinationId) : []} title="Photos" />
            <Reviews kind="tour" id={tour.id} name={tour.title} />
          </div>
          <aside className="sticky-card">
            <BookTour tour={tour} />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Description;
