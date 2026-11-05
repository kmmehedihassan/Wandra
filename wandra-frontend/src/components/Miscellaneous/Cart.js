import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BiCalendar, BiUser } from "react-icons/bi";
import { MdOutlineHotel, MdOutlineTour } from "react-icons/md";
import CreditCardForm from "./CreditCardForm";
import SSLCommerzCheckout from "./SSLCommerzCheckout";
import { apiFetch } from "../../api";
import { EmptyState, Img } from "../Layout/Shared";
import { cartTotal, formatBDT, formatDate, lineTotal, openAuthModal, refreshBookings, refreshCart, removeFromCart, useCart, useCartLoaded, usePaymentConfig, useUser } from "../../store";
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
  const loaded = useCartLoaded();
  const config = usePaymentConfig();
  const location = useLocation();
  const history = useHistory();
  const [paidTotal, setPaidTotal] = useState(null);
  const [paidWith, setPaidWith] = useState("");
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null); // { tone, text } after returning from SSLCOMMERZ
  const total = cartTotal(cart);

  // Coming back from SSLCOMMERZ: /cart?payment=success|processing|failed|cancelled|refund|error&order=…
  const params = new URLSearchParams(location.search);
  const payment = params.get("payment");
  const orderRef = params.get("order");
  useEffect(() => {
    if (!payment || !user) return undefined;
    let active = true;
    let timer;
    const clearQuery = () => history.replace("/cart");
    const MESSAGES = {
      failed: { tone: "error", text: "The payment didn't go through and you weren't charged. Your cart is still here — please try again." },
      cancelled: { tone: "info", text: "You cancelled the payment. Your cart is still here whenever you're ready." },
      refund: { tone: "error", text: "We received your payment, but some items sold out in the meantime. We'll refund you in full — no action needed. Our team will contact you." },
      error: { tone: "error", text: "Something went wrong with the payment. If you were charged, contact us with your phone number and we'll sort it out." },
    };
    const check = async (attempt = 0) => {
      try {
        const order = await apiFetch(`/api/payments/orders/${orderRef}/`);
        if (!active) return;
        if (order.status === "paid") {
          await Promise.all([refreshCart(), refreshBookings()]);
          setPaidWith(order.paymentMethod);
          setPaidTotal(order.amount);
          clearQuery();
        } else if (order.status === "pending" && attempt < 10) {
          setNotice({ tone: "info", text: "Confirming your payment with SSLCOMMERZ…" });
          timer = setTimeout(() => check(attempt + 1), 3000);
        } else {
          setNotice(MESSAGES[order.status === "needs_refund" ? "refund" : order.status === "pending" ? "error" : "failed"]);
          clearQuery();
        }
      } catch (err) {
        if (active) setNotice(MESSAGES.error);
      }
    };
    if ((payment === "success" || payment === "processing") && orderRef) check();
    else {
      setNotice(MESSAGES[payment] || MESSAGES.error);
      refreshCart().catch(() => {});
      clearQuery();
    }
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [payment, orderRef, user, history]);

  const handleRemove = async (id) => {
    setRemoving(id);
    setError("");
    try {
      await removeFromCart(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(null);
    }
  };

  if (paidTotal !== null) {
    return (
      <div className="container-w section">
        <div className="card card-pad cart-success">
          <span className="eyebrow">Payment received</span>
          <h1>You're all set! 🎉</h1>
          <p className="muted">
            We received {formatBDT(paidTotal)}{paidWith ? ` (${paidWith.split("-")[0]})` : ""} and confirmed your booking. A confirmation email is on its way, and the details are in your dashboard.
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
        {!loaded ? "Loading your cart…" : cart.length === 0 ? "Nothing here yet." : `${cart.length} item${cart.length > 1 ? "s" : ""} ready to book.`}
      </p>
      {error && <div className="alert alert-error mt-2" role="alert">{error}</div>}
      {notice && (
        <div className={`alert ${notice.tone === "error" ? "alert-error" : "alert-info"} mt-2`} role={notice.tone === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      {!loaded ? (
        <div className="mt-3">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      ) : cart.length === 0 ? (
        <div className="card mt-3">
          <EmptyState headingLevel={2} title="Your cart is empty" text="Find a tour or a hotel and add it to your cart." actionTo="/tours" actionLabel="Browse tours" />
        </div>
      ) : (
        <div className="layout-aside mt-3">
          <div className="cart-list">
            {cart.map((item) => (
              <article key={item.id} className="card cart-item">
                {item.image && <Img className="cart-item-img" src={item.image} sizes="(max-width: 560px) 100vw, 140px" />}
                <div className="cart-item-body">
                  <BookingSummary item={item} />
                  <div className="mt-1">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleRemove(item.id)} disabled={removing === item.id}>
                      {removing === item.id ? "Removing…" : "Remove"}
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
                  config === null ? (
                    <div className="skeleton" />
                  ) : config.provider === "sslcommerz" ? (
                    <SSLCommerzCheckout cart={cart} sandbox={config.sandbox} />
                  ) : (
                    <CreditCardForm cart={cart} onPaid={setPaidTotal} />
                  )
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
