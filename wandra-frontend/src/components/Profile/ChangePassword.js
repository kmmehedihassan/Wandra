import React, { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { apiFetch, saveSession } from "../../api";
import { notify } from "../../store";

const EMPTY = { current: "", next: "", repeat: "" };

const ChangePassword = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", form: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.current) next.current = "Enter your current password";
    if (form.next.length < 8 || !/[a-zA-Z]/.test(form.next) || !/\d/.test(form.next))
      next.next = "Use at least 8 characters with letters and numbers";
    if (form.repeat !== form.next) next.repeat = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const session = await apiFetch("/auth/password", {
        method: "POST",
        body: { current_password: form.current, new_password: form.next },
      });
      saveSession(session); // the server issued a new token; other devices are signed out
      setForm(EMPTY);
      notify("Password changed. You've been signed out on other devices.", "success");
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, autoComplete) => (
    <div className="field">
      <label className="field-label" htmlFor={`pw-${name}`}>{label}</label>
      <input
        id={`pw-${name}`}
        name={name}
        type={show ? "text" : "password"}
        className={`input${errors[name] ? " is-invalid" : ""}`}
        value={form[name]}
        onChange={handleChange}
        autoComplete={autoComplete}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 440 }}>
      <h1 className="card-title">Change password</h1>
      <p className="muted small mt-0">Changing your password signs you out on your other devices.</p>
      {field("current", "Current password", "current-password")}
      {field("next", "New password", "new-password")}
      {field("repeat", "Confirm new password", "new-password")}
      <button type="button" className="btn btn-ghost btn-sm mt-1" onClick={() => setShow(!show)}>
        {show ? <BsEyeSlash /> : <BsEye />} {show ? "Hide passwords" : "Show passwords"}
      </button>
      {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
      <div className="mt-3">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Change password"}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
