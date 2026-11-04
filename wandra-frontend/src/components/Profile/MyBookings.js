import React, { useState } from "react";
import { BookingSummary } from "../Miscellaneous/Cart";
import { EmptyState } from "../Layout/Shared";
import { cancelBooking, formatDate, localISODate, notify, useBookings, useBookingsLoaded } from "../../store";

const STATUS = {
  upcoming: { label: "Confirmed", className: "badge-success" },
  ongoing: { label: "In progress", className: "badge" },
  cancelled: { label: "Cancelled", className: "badge-danger" },
  completed: { label: "Completed", className: "badge-neutral" },
};

const MyBookings = () => {
  const bookings = useBookings(); // newest first, from the server
  const loaded = useBookingsLoaded();
  const [cancelling, setCancelling] = useState(null);
  const today = localISODate(0);

  const statusOf = (b) => {
    if (b.status === "cancelled") return "cancelled";
    const end = b.type === "hotel" ? b.checkout : b.checkin;
    if (end < today || (b.type === "tour" && b.checkin < today)) return "completed";
    if (b.checkin <= today) return "ongoing";
    return "upcoming";
  };

  const handleCancel = async (b) => {
    if (!window.confirm(`Cancel your booking for ${b.name}? We'll contact you about the refund.`)) return;
    setCancelling(b.id);
    try {
      await cancelBooking(b.id);
      notify("Your booking was cancelled.", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <>
      <h1 className="card-title">My bookings</h1>
      {!loaded ? (
        <>
          <div className="skeleton" />
          <div className="skeleton" />
        </>
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" text="When you book a tour or hotel it will show up here." actionTo="/tours" actionLabel="Find a tour" />
      ) : (
        <div className="booking-list">
          {bookings.map((b) => {
            const status = statusOf(b);
            return (
              <article key={b.id} className={`booking-item${status === "cancelled" ? " is-cancelled" : ""}`}>
                <BookingSummary item={b} />
                <div className="row-between mt-1">
                  <span className="muted small">
                    Booked {formatDate(b.bookedAt)} · Ref {String(b.reference).slice(0, 8).toUpperCase()}
                  </span>
                  <div className="chip-row" style={{ alignItems: "center" }}>
                    <span className={`badge ${STATUS[status].className}`}>{STATUS[status].label}</span>
                    {status === "upcoming" && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(b)} disabled={cancelling === b.id}>
                        {cancelling === b.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MyBookings;
