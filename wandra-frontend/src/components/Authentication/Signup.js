import React, { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { API_BASE, errorMessage, saveSession } from "../../api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fields = [
  { name: "username", label: "Username", type: "text", autoComplete: "username" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "repeatPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
];

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "", repeatPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, values = form) => {
    const value = values[name];
    if (name === "username" && !value.trim()) return "Username is required";
    if (name === "email") {
      if (!value.trim()) return "Email address is required";
      if (!emailPattern.test(value.trim())) return "Enter a valid email address";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 8 || !/[a-zA-Z]/.test(value) || !/\d/.test(value))
        return "Use at least 8 characters with letters and numbers";
    }
    if (name === "repeatPassword" && value !== values.password) return "Passwords do not match";
    return "";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", form: "" });
  };

  const handleBlur = (e) => {
    if (form[e.target.name]) setErrors({ ...errors, [e.target.name]: validateField(e.target.name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    fields.forEach(({ name }) => {
      const message = validateField(name);
      if (message) next[name] = message;
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrors({ form: errorMessage(data, "Registration failed. Try again!") });
        return;
      }
      saveSession(data); // signed in straight away; the navbar closes the modal
    } catch (err) {
      setErrors({ form: "Could not reach the server. Try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {fields.map(({ name, label, type, autoComplete }) => {
        const isPassword = type === "password";
        return (
          <div className="field" key={name}>
            <label className="field-label" htmlFor={`reg-${name}`}>{label}</label>
            <div className={isPassword ? "password-wrap" : undefined}>
              <input
                id={`reg-${name}`}
                name={name}
                type={isPassword && showPassword ? "text" : type}
                className={`input${errors[name] ? " is-invalid" : ""}`}
                value={form[name]}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete={autoComplete}
                autoFocus={name === "username"}
              />
              {name === "password" && (
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </button>
              )}
            </div>
            {errors[name] && <span className="field-error">{errors[name]}</span>}
          </div>
        );
      })}
      {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
};

export default Signup;
