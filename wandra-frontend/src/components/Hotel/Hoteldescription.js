import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { MdOutlinePlace } from "react-icons/md";
import { BiUser } from "react-icons/bi";
import { MdChildCare } from "react-icons/md";
import Error from "../../pages/Error";
import { PageHero, Gallery, Stars, Stepper } from "../Layout/Shared";
import { getDestination, getHotel, hotelGallery, roomsForHotel } from "../Database/catalog";
import { HOTEL_INVENTORY } from "../Database/SingleHotel";
import { addToCart, formatBDT, localISODate } from "../../store";
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

  if (!hotel) return <Error />;

  const destination = hotel.destinationId ? getDestination(hotel.destinationId) : null;
  const rooms = roomsForHotel(hotel.id).map((room) => {
    const stock = HOTEL_INVENTORY.find((i) => i.roomid === room.id && i.hotelid === hotel.id);
    return { ...room, available: stock ? stock.roomquantity : 10 };
  });

  const nights = nightsBetween(dates.checkin, dates.checkout);
  const selected = rooms.filter((r) => (qty[r.id] || 0) > 0);
  const subtotal = selected.reduce((sum, r) => sum + r.price * qty[r.id], 0);
  const total = subtotal * Math.max(nights, 0);

  const changeDate = (key, value) => {
    const next = { ...dates, [key]: value };
    // Keep check-out after check-in.
    if (key === "checkin" && nightsBetween(value, next.checkout) < 1) {
      next.checkout = localISODate(1, new Date(`${value}T00:00:00`));
    }
    setDates(next);
    setError("");
  };

  const handleBook = () => {
    if (!dates.checkin || !dates.checkout) return setError("Choose your check-in and check-out dates.");
    if (dates.checkin < isoDay(0)) return setError("Check-in can't be in the past.");
    if (nights < 1) return setError("Check-out must be at least one night after check-in.");
    if (selected.length === 0) return setError("Select at least one room.");
    addToCart(
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
                {hotel.category}
                {destination && (
                  <>
                    {" "}· near <Link to={`/destinations/${destination.id}`}>{destination.name}</Link>
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
                        <span>{room.available} left</span>
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
              <button type="button" className="btn btn-primary btn-block mt-2" onClick={handleBook}>
                Add to cart
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Hoteldescription;
