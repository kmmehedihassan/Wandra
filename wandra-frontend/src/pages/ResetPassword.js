import React, { useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { apiFetch, saveSession } from "../api";
import { notify, openAuthModal } from "../store";

// Opened from the link in the password-reset email: /reset-password?uid=…&token=…
const ResetPassword = () => {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", repeat: "" });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expired, setExpired] = useState(!uid || !token);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", form: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Use at least 8 characters with letters and numbers";
    if (form.repeat !== form.password) next.repeat = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const session = await apiFetch("/auth/password/reset/confirm", {
        method: "POST",
        body: { uid, token, new_password: form.password },
      });
      saveSession(session);
      notify("Your password has been reset and you're logged in.", "success");
      history.replace("/dashboard");
    } catch (err) {
      if (/invalid or has expired/i.test(err.message)) setExpired(true);
      else setErrors({ form: err.message });
      setSaving(false);
    }
  };

  return (
    <section className="container-w section" style={{ maxWidth: 520 }}>
      <div className="card card-pad">
        {expired ? (
          <>
            <h1 className="card-title">{uid && token ? "This link has expired" : "This reset link isn't valid"}</h1>
            <p className="muted">
              Reset links work once and expire after an hour. Request a new one and use the latest email we send.
            </p>
            <div className="chip-row">
              <button type="button" className="btn btn-primary" onClick={() => openAuthModal("forgot")}>
                Send a new link
              </button>
              <Link to="/" className="btn btn-outline">Back to home</Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h1 className="card-title">Choose a new password</h1>
            <p className="muted small mt-0">You'll be logged in, and signed out on your other devices.</p>
            {[
              ["password", "New password"],
              ["repeat", "Confirm new password"],
            ].map(([name, label]) => (
              <div className="field" key={name}>
                <label className="field-label" htmlFor={`reset-${name}`}>{label}</label>
                <input
                  id={`reset-${name}`}
                  name={name}
                  type={show ? "text" : "password"}
                  className={`input${errors[name] ? " is-invalid" : ""}`}
                  value={form[name]}
                  onChange={handleChange}
                  autoComplete="new-password"
                  autoFocus={name === "password"}
                />
                {errors[name] && <span className="field-error">{errors[name]}</span>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={() => setShow(!show)}>
              {show ? <BsEyeSlash /> : <BsEye />} {show ? "Hide passwords" : "Show passwords"}
            </button>
            {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={saving}>
              {saving ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ResetPassword;
