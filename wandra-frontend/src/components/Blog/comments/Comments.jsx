import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../api";
import { timeAgo } from "../post/Post";
import { notify, openAuthModal, useUser } from "../../../store";

const MAX = 1000;

export default function Comments({ postId, onCountChange }) {
  const user = useUser();
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    try {
      setComments(await apiFetch(`/api/posts/${postId}/comments/`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load, user]);

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return setFormError("Write a comment first.");
    setPosting(true);
    try {
      const comment = await apiFetch(`/api/posts/${postId}/comments/`, { method: "POST", body: { body: body.trim() } });
      setComments((list) => [...(list || []), comment]);
      onCountChange(1);
      setBody("");
      setFormError("");
    } catch (err) {
      setFormError(err.status === 429 ? "You're commenting a lot — please wait a bit and try again." : err.message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiFetch(`/api/posts/${postId}/comments/${id}/`, { method: "DELETE" });
      setComments((list) => list.filter((c) => c.id !== id));
      onCountChange(-1);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <section className="mt-4" aria-labelledby="comments-title">
      <h2 className="section-title" id="comments-title">
        Comments {comments && comments.length > 0 && <span className="muted">({comments.length})</span>}
      </h2>

      {user ? (
        <form className="comment-form mt-2" onSubmit={submit} noValidate>
          <span className="avatar" aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
          <div className="comment-form-body">
            <label htmlFor="comment-body" className="visually-hidden">Add a comment</label>
            <textarea
              id="comment-body"
              className="textarea"
              rows={3}
              maxLength={MAX}
              placeholder="Add a comment…"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setFormError("");
              }}
            />
            <div className="row-between mt-1">
              <span className="muted small">{body.length}/{MAX}</span>
              <button type="submit" className="btn btn-primary btn-sm" disabled={posting || !body.trim()}>
                {posting ? "Posting…" : "Post comment"}
              </button>
            </div>
            {formError && <div className="alert alert-error mt-1">{formError}</div>}
          </div>
        </form>
      ) : (
        <p className="muted">
          <button type="button" className="link-btn" onClick={() => openAuthModal("login")}>Log in</button> to join the conversation.
        </p>
      )}

      {error && <div className="alert alert-error mt-2">{error}</div>}
      {comments === null && !error && <div className="skeleton mt-2" />}
      {comments && comments.length === 0 && <p className="muted mt-2">No comments yet. Be the first!</p>}
      {comments && comments.length > 0 && (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-item">
              <span className="avatar" aria-hidden="true">{c.author.charAt(0).toUpperCase()}</span>
              <div className="comment-content">
                <div className="row-between">
                  <span>
                    <strong>{c.author}</strong> <span className="muted small">· {timeAgo(c.createdAt)}</span>
                  </span>
                  {c.canDelete && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(c.id)}>
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment-body">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
