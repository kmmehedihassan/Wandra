import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { addToCart, fetchTourAvailability, formatBDT, getUser, localISODate } from "../../store";
import { Stepper } from "../Layout/Shared";

const today = () => localISODate(0);

const BookTour = ({ tour }) => {
  const history = useHistory();
  const user = getUser();
  const [form, setForm] = useState({
    name: user ? user.username : "",
    email: user ? user.email : "",
    phone: "",
    date: "",
  });
  const [tickets, setTickets] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [seatsLeft, setSeatsLeft] = useState(null);

  // Show live seat availability for the chosen date.
  useEffect(() => {
    setSeatsLeft(null);
    if (!form.date || form.date < today()) return undefined;
    let active = true;
    fetchTourAvailability(tour.id, form.date)
      .then((left) => active && setSeatsLeft(left))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [tour.id, form.date]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter the lead traveller's name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (!/^\+?[\d\s-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (!form.date) next.date = "Choose a travel date";
    else if (form.date < today()) next.date = "The date can't be in the past";
    if (!next.date && seatsLeft !== null && tickets > seatsLeft)
      next.date = seatsLeft === 0 ? "This tour is fully booked on that date" : `Only ${seatsLeft} seats left on that date`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addToCart({
      type: "tour",
      refId: tour.id,
      name: tour.title,
      image: tour.img,
      checkin: form.date,
      price: tour.price,
      ticket: tickets,
      contact: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
      });
      history.push("/cart");
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    id: `book-${name}`,
    name,
    value: form[name],
    onChange: handleChange,
    className: `input${errors[name] ? " is-invalid" : ""}`,
  });

  return (
    <form className="card card-pad" onSubmit={handleSubmit} noValidate>
      <div className="price">
        {formatBDT(tour.price)} <small>/ person</small>
      </div>
      <p className="muted small">{tour.dur} night{tour.dur === 1 ? "" : "s"} · best in {tour.month}</p>

      <div className="field">
        <label className="field-label" htmlFor="book-date">Travel date</label>
        <input type="date" min={today()} {...fieldProps("date")} />
        {errors.date ? (
          <span className="field-error">{errors.date}</span>
        ) : (
          seatsLeft !== null && (
            <span className={`small ${seatsLeft > 5 ? "muted" : "field-error"}`}>
              {seatsLeft === 0 ? "Fully booked on this date" : `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left on this date`}
            </span>
          )
        )}
      </div>
      <div className="field">
        <span className="field-label">Travellers</span>
        <div className="row-between">
          <span className="muted small">Tickets</span>
          <Stepper value={tickets} min={1} max={Math.max(1, Math.min(20, seatsLeft === null ? 20 : seatsLeft))} onChange={setTickets} label="Number of tickets" />
        </div>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="book-name">Lead traveller</label>
        <input autoComplete="name" {...fieldProps("name")} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="book-email">Email</label>
        <input type="email" autoComplete="email" {...fieldProps("email")} />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="book-phone">Phone</label>
        <input type="tel" autoComplete="tel" placeholder="+880 1XXX XXXXXX" {...fieldProps("phone")} />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <div className="summary-line mt-2">
        <span>
          {formatBDT(tour.price)} × {tickets} ticket{tickets > 1 ? "s" : ""}
        </span>
        <span>{formatBDT(tour.price * tickets)}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <span className="price">{formatBDT(tour.price * tickets)}</span>
      </div>
      {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
      <button type="submit" className="btn btn-primary btn-block mt-2" disabled={submitting || seatsLeft === 0}>
        {submitting ? "Adding…" : "Add to cart"}
      </button>
    </form>
  );
};

export default BookTour;
