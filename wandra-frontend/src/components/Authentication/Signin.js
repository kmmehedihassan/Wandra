import React, { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { API_BASE, errorMessage, saveSession } from "../../api";

const Signin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", form: "" });
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Username is required";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setErrors({ form: errorMessage(data, "Login unsuccessful. Try again!") });
        return;
      }
      saveSession(data); // the navbar closes the modal once the session exists
    } catch (err) {
      setErrors({ form: "Could not reach the server. Try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="login-user">Username</label>
        <input
          id="login-user"
          name="username"
          className={`input${errors.username ? " is-invalid" : ""}`}
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          autoFocus
        />
        {errors.username && <span className="field-error">{errors.username}</span>}
      </div>
      <div className="field">
        <label className="field-label" htmlFor="login-pass">Password</label>
        <div className="password-wrap">
          <input
            id="login-pass"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`input${errors.password ? " is-invalid" : ""}`}
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </button>
        </div>
        {errors.password && <span className="field-error">{errors.password}</span>}
      </div>
      {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
};

export default Signin;
