import valid from "card-validator";

// Validate the demo payment form. Returns { fieldName: message } for each problem.
export default function validateInfo(values) {
  const errors = {};
  if (!values.cardName.trim()) errors.cardName = "Enter the name on the card";
  else if (!valid.cardholderName(values.cardName).isValid) errors.cardName = "Enter a valid cardholder name";

  const digits = values.cardNumber.replace(/\s+/g, "");
  if (!digits) errors.cardNumber = "Enter the card number";
  else if (!valid.number(digits).isValid) errors.cardNumber = "This card number isn't valid";

  if (!values.cardExpiration.trim()) errors.cardExpiration = "Enter the expiry date";
  else if (!valid.expirationDate(values.cardExpiration).isValid) errors.cardExpiration = "Use MM/YY and a future date";

  const card = valid.number(digits).card;
  const cvvLength = card && card.code ? card.code.size : 3;
  if (!values.cardSecurityCode.trim()) errors.cardSecurityCode = "Enter the security code";
  else if (!valid.cvv(values.cardSecurityCode, cvvLength).isValid) errors.cardSecurityCode = `Enter the ${cvvLength}-digit code`;

  return errors;
}
