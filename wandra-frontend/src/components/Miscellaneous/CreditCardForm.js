import React, { useState } from "react";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/es/styles-compiled.css";
import emailjs from "@emailjs/browser";
import validateInfo from "../../validateInfo";
import { cartTotal, checkout, formatBDT, getUser } from "../../store";

// Optional booking-confirmation email. Configure these in .env to enable it.
const EMAILJS = {
  service: process.env.REACT_APP_EMAILJS_SERVICE_ID,
  template: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
};

const formatCardNumber = (value) =>
  value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const CreditCardForm = ({ cart, onPaid }) => {
  const [values, setValues] = useState({ cardName: "", cardNumber: "", cardExpiration: "", cardSecurityCode: "" });
  const [focus, setFocus] = useState("");
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") value = formatCardNumber(value);
    if (name === "cardExpiration") value = formatExpiry(value);
    if (name === "cardSecurityCode") value = value.replace(/\D/g, "").slice(0, 4);
    setValues({ ...values, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setPayError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateInfo(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    if (cart.length === 0) return;
    setPaying(true);
    setPayError("");
    let result;
    try {
      // Card details stay in the browser; the server only confirms the cart.
      result = await checkout();
    } catch (err) {
      setPayError(err.message);
      setPaying(false);
      return;
    }
    const user = getUser();
    if (EMAILJS.service && EMAILJS.template && EMAILJS.publicKey && user) {
      emailjs
        .send(EMAILJS.service, EMAILJS.template, { user_name: user.username, res_email: user.email }, EMAILJS.publicKey)
        .catch(() => {});
    }
    setPaying(false);
    onPaid(result.total);
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label className="field-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        className={`input${errors[name] ? " is-invalid" : ""}`}
        value={values[name]}
        onChange={handleChange}
        onFocus={() => setFocus(name === "cardSecurityCode" ? "cvc" : name === "cardExpiration" ? "expiry" : name === "cardName" ? "name" : "number")}
        {...props}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card-preview">
        <Cards
          cvc={values.cardSecurityCode}
          expiry={values.cardExpiration.replace("/", "")}
          focused={focus}
          name={values.cardName}
          number={values.cardNumber}
        />
      </div>
      {field("cardName", "Name on card", { autoComplete: "cc-name" })}
      {field("cardNumber", "Card number", { inputMode: "numeric", autoComplete: "cc-number", placeholder: "1234 5678 9012 3456" })}
      <div className="field-row mt-2">
        {field("cardExpiration", "Expiry", { inputMode: "numeric", autoComplete: "cc-exp", placeholder: "MM/YY" })}
        {field("cardSecurityCode", "CVC", { inputMode: "numeric", autoComplete: "cc-csc", placeholder: "123" })}
      </div>
      {payError && <div className="alert alert-error mt-2" role="alert">{payError}</div>}
      <button type="submit" className="btn btn-primary btn-block mt-3" disabled={paying}>
        {paying ? "Processing…" : `Pay ${formatBDT(cartTotal(cart))}`}
      </button>
      <p className="muted small mt-1 mb-0" style={{ textAlign: "center" }}>
        Demo checkout — no real payment is taken.
      </p>
    </form>
  );
};

export default CreditCardForm;
