import React from "react";
import { BookingSummary } from "../Miscellaneous/Cart";
import { EmptyState } from "../Layout/Shared";
import { cancelBooking, formatDate, localISODate, useBookings } from "../../store";

const STATUS = {
  confirmed: { label: "Confirmed", className: "badge-success" },
  cancelled: { label: "Cancelled", className: "badge-danger" },
  completed: { label: "Completed", className: "badge-neutral" },
};

const MyBookings = () => {
  const bookings = [...useBookings()].reverse();
  const today = localISODate(0);

  const statusOf = (b) => {
    if (b.status === "cancelled") return "cancelled";
    const end = b.type === "hotel" ? b.checkout : b.checkin;
    return end && end < today ? "completed" : "confirmed";
  };

  const handleCancel = (b) => {
    if (window.confirm(`Cancel your booking for ${b.name}? We'll contact you about the refund.`)) cancelBooking(b.id);
  };

  return (
    <>
      <h1 className="card-title">My bookings</h1>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" text="When you book a tour or hotel it will show up here." actionTo="/tours" actionLabel="Find a tour" />
      ) : (
        <div className="booking-list">
          {bookings.map((b) => {
            const status = statusOf(b);
            return (
              <article key={b.id} className={`booking-item${status === "cancelled" ? " is-cancelled" : ""}`}>
                <BookingSummary item={b} />
                <div className="row-between mt-1">
                  <span className="muted small">Booked {formatDate(b.bookedAt)}</span>
                  <div className="chip-row" style={{ alignItems: "center" }}>
                    <span className={`badge ${STATUS[status].className}`}>{STATUS[status].label}</span>
                    {status === "confirmed" && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleCancel(b)}>
                        Cancel
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
