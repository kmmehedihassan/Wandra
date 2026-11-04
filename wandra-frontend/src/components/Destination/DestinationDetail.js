import React from "react";
import { Link, useParams } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import Accordion from "./Accordion";
import Error from "../../pages/Error";
import { PageHero, Gallery, Stars } from "../Layout/Shared";
import { faqFor, galleryFor, getDestination, hotelsForDestination, toursForDestination } from "../Database/catalog";
import { formatBDT } from "../../store";
import "./destination.css";

const DestinationDetail = () => {
  const { id } = useParams();
  const destination = getDestination(id);
  if (!destination) return <Error />;

  const tours = toursForDestination(destination.id);
  const hotels = hotelsForDestination(destination.id);
  const faq = faqFor(destination.id);

  return (
    <>
      <PageHero eyebrow={destination.region} title={destination.name} image={destination.heroImage} tall />
      <div className="container-w section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/destinations">Destinations</Link> <span>/</span> {destination.name}
        </nav>
        <div className="layout-aside">
          <div>
            <h2 className="section-title">Overview</h2>
            <p className="lead">{destination.body}</p>

            {faq.length > 0 && (
              <section className="mt-4">
                <h2 className="section-title">Things to know</h2>
                <div className="accordion mt-2">
                  {faq.map((item) => (
                    <Accordion key={item.title} title={item.title} content={item.content} />
                  ))}
                </div>
              </section>
            )}

            <Gallery images={galleryFor(destination.id)} title="Photos" />
          </div>

          <aside className="stack sticky-card">
            <div className="card card-pad">
              <h3 className="card-title">Tours to {destination.name}</h3>
              {tours.length === 0 ? (
                <p className="muted mb-0">No guided tours yet — browse all tours for nearby trips.</p>
              ) : (
                <ul className="mini-list">
                  {tours.slice(0, 5).map((t) => (
                    <li key={t.id}>
                      <Link to={`/tours/${t.id}`}>{t.title}</Link>
                      <span className="mini-list-meta">
                        <Stars value={t.rating} size={13} /> · {formatBDT(t.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to={tours.length > 0 ? `/tours?destination=${destination.id}` : "/tours"} className="btn btn-primary btn-block mt-2">
                {tours.length > 0 ? "See all tours" : "Browse tours"}
              </Link>
            </div>

            <div className="card card-pad">
              <h3 className="card-title">Where to stay</h3>
              {hotels.length === 0 ? (
                <p className="muted mb-0">No partner hotels here yet.</p>
              ) : (
                <ul className="mini-list">
                  {hotels.slice(0, 4).map((h) => (
                    <li key={h.id}>
                      <Link to={`/hotels/${h.id}`}>{h.name}</Link>
                      <span className="mini-list-meta">
                        <MdOutlinePlace /> {h.category} · from {formatBDT(h.price)}/night
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to={hotels.length > 0 ? `/hotels?destination=${destination.id}` : "/hotels"} className="btn btn-outline btn-block mt-2">
                Browse hotels
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default DestinationDetail;
