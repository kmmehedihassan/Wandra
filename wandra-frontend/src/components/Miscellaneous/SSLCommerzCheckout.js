import React, { useState } from "react";
import { apiFetch } from "../../api";
import { cartTotal, formatBDT, useProfile, useUser } from "../../store";

// Billing details, then a redirect to SSLCOMMERZ's secure payment page
// (bKash, Nagad, Rocket, cards). Card/wallet details never touch our server.
const SSLCommerzCheckout = ({ cart, sandbox }) => {
  const user = useUser();
  const profile = useProfile();
  const [form, setForm] = useState({
    name: [profile.firstname, profile.lastname].filter(Boolean).join(" ") || (user ? user.username : ""),
    phone: profile.phone || "",
    address: profile.address || "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [starting, setStarting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "", form: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter the name for the booking";
    if (!/^\+?[\d\s-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (!form.address.trim()) next.address = "Enter your address";
    if (!form.city.trim()) next.city = "Enter your city";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStarting(true);
    try {
      const { url } = await apiFetch("/api/payments/start/", {
        method: "POST",
        body: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(), city: form.city.trim() },
      });
      window.location.assign(url); // SSLCOMMERZ's hosted payment page
    } catch (err) {
      setErrors({ form: err.message });
      setStarting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label className="field-label" htmlFor={`bill-${name}`}>{label}</label>
      <input
        id={`bill-${name}`}
        name={name}
        className={`input${errors[name] ? " is-invalid" : ""}`}
        value={form[name]}
        onChange={handleChange}
        {...props}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="checkout-title">Billing details</h3>
      {field("name", "Full name", { autoComplete: "name" })}
      {field("phone", "Mobile number", { type: "tel", autoComplete: "tel", placeholder: "+880 1XXX XXXXXX" })}
      {field("address", "Address", { autoComplete: "street-address" })}
      {field("city", "City", { autoComplete: "address-level2", placeholder: "Dhaka" })}
      {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={starting}>
        {starting ? "Opening secure payment…" : `Pay ${formatBDT(cartTotal(cart))}`}
      </button>
      <p className="muted small mt-1 mb-0 pay-note">
        You'll pay on SSLCOMMERZ's secure page with bKash, Nagad, Rocket or a card.
        {sandbox && <span className="badge badge-neutral mt-1">Test mode — no real money is charged</span>}
      </p>
    </form>
  );
};

export default SSLCommerzCheckout;
