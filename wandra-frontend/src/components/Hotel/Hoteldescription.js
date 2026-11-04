import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import { BiUser } from "react-icons/bi";
import { MdCheck, MdChildCare } from "react-icons/md";
import Error from "../../pages/Error";
import { PageHero, Gallery, SaveButton, Stars, Stepper } from "../Layout/Shared";
import { getDestination, getHotel, hotelGallery, roomsForHotel } from "../Database/catalog";
import { HOTEL_INVENTORY } from "../Database/SingleHotel";
import Reviews, { ReviewBadge } from "../Reviews/Reviews";
import { addDays, addToCart, fetchHotelAvailability, formatBDT, localISODate, useReviewSummary } from "../../store";
import "./hotel.css";

const isoDay = (offset = 0) => localISODate(offset);

const nightsBetween = (from, to) => {
  if (!from || !to) return 0;
  const ms = new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`);
  return Math.round(ms / 86400000);
};

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Hoteldescription = () => {
  const { id } = useParams();
  const history = useHistory();
  const hotel = getHotel(id);
  const [dates, setDates] = useState({ checkin: isoDay(1), checkout: isoDay(2) });
  const [qty, setQty] = useState({});
  const [error, setError] = useState("");
  const summary = useReviewSummary();
  const [submitting, setSubmitting] = useState(false);
  const [live, setLive] = useState(null); // { roomId: roomsLeft } for the chosen dates
  const hotelId = hotel ? hotel.id : null;

  useEffect(() => {
    setLive(null);
    if (!hotelId || nightsBetween(dates.checkin, dates.checkout) < 1) return undefined;
    let active = true;
    fetchHotelAvailability(hotelId, dates.checkin, dates.checkout)
      .then((left) => active && setLive(left))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [hotelId, dates.checkin, dates.checkout]);

  // Never keep more rooms selected than are free for the new dates.
  useEffect(() => {
    if (!live) return;
    setQty((current) => {
      const next = { ...current };
      Object.keys(next).forEach((roomId) => {
        if (live[roomId] !== undefined && next[roomId] > live[roomId]) next[roomId] = live[roomId];
      });
      return next;
    });
  }, [live]);

  if (!hotel) return <Error />;

  const destination = hotel.destinationId ? getDestination(hotel.destinationId) : null;
  const amenities = (hotel.amenities || []).flatMap((group) => Object.values(group)).filter(Boolean);
  const rooms = roomsForHotel(hotel.id).map((room) => {
    const stock = HOTEL_INVENTORY.find((i) => i.roomid === room.id && i.hotelid === hotel.id);
    const total = stock ? stock.roomquantity : 10;
    return { ...room, available: live && live[room.id] !== undefined ? live[room.id] : total };
  });

  const nights = nightsBetween(dates.checkin, dates.checkout);
  const selected = rooms.filter((r) => (qty[r.id] || 0) > 0);
  const subtotal = selected.reduce((sum, r) => sum + r.price * qty[r.id], 0);
  const total = subtotal * Math.max(nights, 0);

  const changeDate = (key, value) => {
    const next = { ...dates, [key]: value };
    // Keep check-out after check-in.
    if (key === "checkin" && nightsBetween(value, next.checkout) < 1) {
      next.checkout = addDays(value, 1);
    }
    setDates(next);
    setError("");
  };

  const handleBook = async () => {
    if (!dates.checkin || !dates.checkout) return setError("Choose your check-in and check-out dates.");
    if (dates.checkin < isoDay(0)) return setError("Check-in can't be in the past.");
    if (nights < 1) return setError("Check-out must be at least one night after check-in.");
    if (selected.length === 0) return setError("Select at least one room.");
    setSubmitting(true);
    try {
      await addToCart(
      selected.map((r) => ({
        type: "hotel",
        refId: hotel.id,
        name: hotel.name,
        image: hotel.src,
        roomid: r.id,
        roomtype: titleCase(r.type),
        price: r.price,
        totalrooms: qty[r.id],
        checkin: dates.checkin,
        checkout: dates.checkout,
        days: nights,
      }))
      );
      history.push("/cart");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero eyebrow={hotel.category} title={hotel.name} image={hotel.src} tall>
        <div className="hero-meta">
          <Stars value={hotel.star} />
          <span>
            <MdOutlinePlace /> {hotel.category} · {hotel.dist}
          </span>
          <span className="score">{hotel.ratings}</span>
          <ReviewBadge summary={summary.hotels[hotel.id]} className="on-dark" />
          <SaveButton kind="hotel" id={hotel.id} name={hotel.name} />
        </div>
      </PageHero>
      <div className="container-w section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/hotels">Hotels</Link> <span>/</span> {hotel.name}
        </nav>
        <div className="layout-aside">
          <div>
            <h2 className="section-title">About the hotel</h2>
            <p className="lead">{hotel.description}</p>
            <dl className="detail-list mt-3">
              <dt>Hotel class</dt>
              <dd>{hotel.star}-star</dd>
              <dt>Location</dt>
              <dd>
                {destination && destination.name === hotel.category ? (
                  <Link to={`/destinations/${destination.id}`}>{destination.name}</Link>
                ) : (
                  <>
                    {hotel.category}
                    {destination && (
                      <>
                        {" "}· near <Link to={`/destinations/${destination.id}`}>{destination.name}</Link>
                      </>
                    )}
                  </>
                )}
              </dd>
              <dt>Highlights</dt>
              <dd>{hotel.highlights}</dd>
              <dt>Facilities</dt>
              <dd>{hotel.features}</dd>
              <dt>Services</dt>
              <dd>{hotel.service}</dd>
            </dl>
            {amenities.length > 0 && (
              <section className="mt-4">
                <h2 className="section-title">Amenities</h2>
                <ul className="amenity-list mt-2">
                  {amenities.map((a) => (
                    <li key={a}>
                      <MdCheck aria-hidden="true" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-4">
              <h2 className="section-title">Choose your rooms</h2>
              <p className="section-sub">Prices are per room, per night.</p>
              <div className="room-list mt-2">
                {rooms.map((room) => (
                  <div key={room.id} className={`room-card${qty[room.id] ? " is-selected" : ""}`}>
                    <div>
                      <h3 className="room-name">{titleCase(room.type)}</h3>
                      <div className="room-meta">
                        <span><BiUser /> {room.Adult} adult{room.Adult === 1 ? "" : "s"}</span>
                        {room.children > 0 && <span><MdChildCare /> {room.children} child{room.children === 1 ? "" : "ren"}</span>}
                        <span className={room.available === 0 ? "field-error" : undefined}>
                          {room.available === 0 ? "Sold out for these dates" : `${room.available} left${live ? " for these dates" : ""}`}
                        </span>
                      </div>
                    </div>
                    <div className="room-actions">
                      <span className="price">
                        {formatBDT(room.price)} <small>/ night</small>
                      </span>
                      <Stepper
                        value={qty[room.id] || 0}
                        min={0}
                        max={room.available}
                        onChange={(v) => {
                          setQty({ ...qty, [room.id]: v });
                          setError("");
                        }}
                        label={`${room.type} rooms`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Gallery images={hotelGallery(hotel)} title="Photos" />
            <Reviews kind="hotel" id={hotel.id} name={hotel.name} />
          </div>

          <aside className="sticky-card">
            <div className="card card-pad">
              <div className="price">
                from {formatBDT(hotel.price)} <small>/ night</small>
              </div>
              <div className="field-row mt-2">
                <div className="field">
                  <label className="field-label" htmlFor="checkin">Check-in</label>
                  <input id="checkin" type="date" className="input" min={isoDay(0)} value={dates.checkin} onChange={(e) => changeDate("checkin", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="checkout">Check-out</label>
                  <input id="checkout" type="date" className="input" min={dates.checkin || isoDay(1)} value={dates.checkout} onChange={(e) => changeDate("checkout", e.target.value)} />
                </div>
              </div>

              <div className="mt-2">
                {selected.length === 0 ? (
                  <p className="muted small mb-0">Select rooms on the left to see your total.</p>
                ) : (
                  selected.map((r) => (
                    <div key={r.id} className="summary-line">
                      <span>
                        {qty[r.id]} × {titleCase(r.type)}
                      </span>
                      <span>{formatBDT(r.price * qty[r.id])}</span>
                    </div>
                  ))
                )}
                {nights > 0 && (
                  <div className="summary-line">
                    <span>Nights</span>
                    <span>× {nights}</span>
                  </div>
                )}
                <div className="summary-total">
                  <span>Total</span>
                  <span className="price">{formatBDT(total)}</span>
                </div>
              </div>
              {error && <div className="alert alert-error mt-2" role="alert">{error}</div>}
              <button type="button" className="btn btn-primary btn-block mt-2" onClick={handleBook} disabled={submitting}>
                {submitting ? "Adding…" : "Add to cart"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Hoteldescription;
