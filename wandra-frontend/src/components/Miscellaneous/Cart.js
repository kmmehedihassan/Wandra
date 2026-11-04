import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BiCalendar, BiUser } from "react-icons/bi";
import { MdOutlineHotel, MdOutlineTour } from "react-icons/md";
import CreditCardForm from "./CreditCardForm";
import { EmptyState } from "../Layout/Shared";
import { cartTotal, formatBDT, formatDate, lineTotal, openAuthModal, removeFromCart, useCart, useUser } from "../../store";
import "./cart.css";

export function BookingSummary({ item }) {
  const isTour = item.type === "tour";
  return (
    <>
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div>
          <span className="badge">{isTour ? <MdOutlineTour /> : <MdOutlineHotel />} {isTour ? "Tour" : "Hotel"}</span>
          <h3 className="cart-item-title">
            <Link to={`/${isTour ? "tours" : "hotels"}/${item.refId}`}>{item.name}</Link>
          </h3>
        </div>
        <span className="cart-item-price">{formatBDT(lineTotal(item))}</span>
      </div>
      <div className="cart-item-meta">
        {isTour ? (
          <>
            <span><BiCalendar /> {formatDate(item.checkin)}</span>
            <span><BiUser /> {item.ticket} ticket{Number(item.ticket) > 1 ? "s" : ""} × {formatBDT(item.price)}</span>
          </>
        ) : (
          <>
            <span><BiCalendar /> {formatDate(item.checkin)} → {formatDate(item.checkout)} ({item.days} night{Number(item.days) > 1 ? "s" : ""})</span>
            <span>{item.totalrooms} × {item.roomtype} · {formatBDT(item.price)}/night</span>
          </>
        )}
      </div>
    </>
  );
}

const Cart = () => {
  const cart = useCart();
  const user = useUser();
  const [paidTotal, setPaidTotal] = useState(null);
  const total = cartTotal(cart);

  if (paidTotal !== null) {
    return (
      <div className="container-w section">
        <div className="card card-pad cart-success">
          <span className="eyebrow">Payment received</span>
          <h1>You're all set! 🎉</h1>
          <p className="muted">
            We received {formatBDT(paidTotal)} and confirmed your booking. You'll find the details in your dashboard.
          </p>
          <div className="chip-row" style={{ justifyContent: "center" }}>
            <Link to="/dashboard?tab=bookings" className="btn btn-primary">View my bookings</Link>
            <Link to="/tours" className="btn btn-outline">Keep exploring</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-w section">
      <h1 className="section-title">Your cart</h1>
      <p className="section-sub">
        {cart.length === 0 ? "Nothing here yet." : `${cart.length} item${cart.length > 1 ? "s" : ""} ready to book.`}
      </p>

      {cart.length === 0 ? (
        <div className="card mt-3">
          <EmptyState title="Your cart is empty" text="Find a tour or a hotel and add it to your cart." actionTo="/tours" actionLabel="Browse tours" />
        </div>
      ) : (
        <div className="layout-aside mt-3">
          <div className="cart-list">
            {cart.map((item) => (
              <article key={item.id} className="card cart-item">
                {item.image && <img className="cart-item-img" src={item.image} alt="" />}
                <div className="cart-item-body">
                  <BookingSummary item={item} />
                  <div className="mt-1">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="sticky-card">
            <div className="card card-pad">
              <h2 className="card-title">Order summary</h2>
              {cart.map((item) => (
                <div key={item.id} className="summary-line">
                  <span className="cart-summary-name">{item.name}</span>
                  <span>{formatBDT(lineTotal(item))}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>Total</span>
                <span className="price">{formatBDT(total)}</span>
              </div>
              <div className="mt-3">
                {user ? (
                  <CreditCardForm onPaid={setPaidTotal} />
                ) : (
                  <div className="alert alert-error" style={{ background: "var(--brand-soft)", color: "var(--ink-2)" }}>
                    <p className="mb-0">Log in to complete your booking. Your cart will be kept.</p>
                    <button type="button" className="btn btn-primary btn-block mt-2" onClick={() => openAuthModal("login")}>
                      Log in to check out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
