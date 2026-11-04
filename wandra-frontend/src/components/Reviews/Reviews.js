import React, { useCallback, useEffect, useState } from "react";
import Rating from "@mui/material/Rating";
import { apiFetch } from "../../api";
import { Stars } from "../Layout/Shared";
import { formatDate, notify, openAuthModal, refreshReviewSummary, useUser } from "../../store";
import "./reviews.css";

// Short "★ 4.6 · 12 reviews" label for cards and heroes.
export function ReviewBadge({ summary, className = "" }) {
  if (!summary || !summary.count) return null;
  return (
    <span className={`review-badge ${className}`}>
      ★ {summary.average.toFixed(1)} · {summary.count} review{summary.count === 1 ? "" : "s"}
    </span>
  );
}

const Reviews = ({ kind, id, name }) => {
  const user = useUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ rating: 0, text: "" });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await apiFetch(`/api/reviews/?${kind}=${id}`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [kind, id]);

  useEffect(() => {
    load();
  }, [load, user]);

  const startEdit = () => {
    const mine = data && data.myReview;
    setForm(mine ? { rating: mine.rating, text: mine.text } : { rating: 0, text: "" });
    setFormError("");
    setEditing(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) return setFormError("Choose a star rating.");
    if (form.text.trim().length < 10) return setFormError("Write at least a sentence (10 characters).");
    setSaving(true);
    try {
      await apiFetch("/api/reviews/", { method: "POST", body: { [kind]: id, rating: form.rating, text: form.text.trim() } });
      setEditing(false);
      notify("Thanks for your review!", "success");
      await Promise.all([load(), refreshReviewSummary()]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await apiFetch(`/api/reviews/${reviewId}/`, { method: "DELETE" });
      await Promise.all([load(), refreshReviewSummary()]);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <section className="mt-4" aria-labelledby="reviews-title">
      <div className="section-head">
        <div>
          <h2 className="section-title" id="reviews-title">Reviews</h2>
          {data && data.count > 0 ? (
            <div className="review-summary">
              <span className="review-average">{data.average.toFixed(1)}</span>
              <Stars value={data.average} />
              <span className="muted">
                {data.count} review{data.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="section-sub">No reviews yet.</p>
          )}
        </div>
        {data && data.canReview && !editing && (
          <button type="button" className="btn btn-outline btn-sm" onClick={startEdit}>
            {data.myReview ? "Edit your review" : "Write a review"}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {data === null && !error && <div className="skeleton" />}

      {data && !data.canReview && (
        <p className="muted small">
          {user ? (
            `Reviews come from travellers who completed a trip with Wandra. Book ${name} and you can review it afterwards.`
          ) : (
            <>
              Reviews come from travellers who completed a trip with Wandra.{" "}
              <button type="button" className="link-btn" onClick={() => openAuthModal("login")}>Log in</button> to review your past trips.
            </>
          )}
        </p>
      )}

      {editing && (
        <form className="card card-pad review-form" onSubmit={submit} noValidate>
          <div className="field">
            <span className="field-label" id="rating-label">Your rating</span>
            <Rating
              value={form.rating}
              onChange={(e, value) => {
                setForm({ ...form, rating: value || 0 });
                setFormError("");
              }}
              aria-labelledby="rating-label"
              size="large"
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="review-text">Your review</label>
            <textarea
              id="review-text"
              className="textarea"
              rows={4}
              maxLength={2000}
              value={form.text}
              onChange={(e) => {
                setForm({ ...form, text: e.target.value });
                setFormError("");
              }}
              placeholder={`What was ${name} like?`}
            />
          </div>
          {formError && <div className="alert alert-error mt-1">{formError}</div>}
          <div className="chip-row mt-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Post review"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      {data && data.reviews.length > 0 && (
        <ul className="review-list">
          {data.reviews.map((r) => (
            <li key={r.id} className="review-item">
              <div className="row-between">
                <div className="review-author">
                  <span className="avatar">{r.author.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{r.author}</strong>
                    <span className="muted small"> · {formatDate(r.createdAt)}</span>
                    <div><Stars value={r.rating} size={14} /></div>
                  </div>
                </div>
                {r.mine && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(r.id)}>
                    Delete
                  </button>
                )}
              </div>
              <p className="review-text">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Reviews;
