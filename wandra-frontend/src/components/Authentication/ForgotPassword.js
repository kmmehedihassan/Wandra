import React, { useState } from "react";
import { apiFetch } from "../../api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Asks the backend to email a reset link. The reply is the same whether or not
// the email has an account, so we always show the same confirmation.
const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailPattern.test(email.trim())) return setError("Enter the email address you registered with");
    setSending(true);
    setError("");
    try {
      const data = await apiFetch("/auth/password/reset", { method: "POST", body: { email: email.trim() } });
      setSent(data.detail);
    } catch (err) {
      setError(err.status === 429 ? "Too many reset requests. Please wait a while and try again." : err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div>
        <div className="alert alert-success" role="status">{sent}</div>
        <p className="muted small mt-2">The link expires in 1 hour. Didn't get it? Check your spam folder or try again.</p>
        <div className="chip-row mt-2">
          <button type="button" className="btn btn-outline" onClick={() => setSent("")}>Send again</button>
          <button type="button" className="btn btn-primary" onClick={onBack}>Back to log in</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="muted small mt-0">Enter your account's email and we'll send you a link to choose a new password.</p>
      <div className="field">
        <label className="field-label" htmlFor="forgot-email">Email address</label>
        <input
          id="forgot-email"
          type="email"
          className={`input${error ? " is-invalid" : ""}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          autoComplete="email"
          autoFocus
        />
        {error && <span className="field-error">{error}</span>}
      </div>
      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={sending}>
        {sending ? "Sending…" : "Send reset link"}
      </button>
      <button type="button" className="btn btn-ghost btn-block mt-1" onClick={onBack}>
        Back to log in
      </button>
    </form>
  );
};

export default ForgotPassword;
