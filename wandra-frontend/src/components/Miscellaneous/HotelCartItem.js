import { differenceInDays } from "date-fns";
import React from "react";
import "./cart.css";

const HotelCartItem = ({
  id,
  name,
  checkin,
  checkout,
  roomtype,
  totalrooms,
  price,
  days,
}) => {

  const removeFromCart = (itemid) => {
    let obj = JSON.parse(window.localStorage.getItem("Cart"));
    obj = obj.filter((item) => item.id !== itemid);
    window.localStorage.setItem("Cart", JSON.stringify(obj));
    let cartTotal = JSON.parse(window.localStorage.getItem("CartTotal"));
    console.log("cart before: ", cartTotal);
    cartTotal = cartTotal - price * totalrooms * days;
    console.log("cart after: ", cartTotal);
    window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));
  };

  return (
    <div className="hotel-cart-item-con">
      <div className="cart-identifier">HOTEL</div>
      <div className="cart-section">
        <div className="cart-name">{name}</div>
        <div className="cart-attribute">
          date: {checkin} - {checkout}{" "}
        </div>
        <div className="cart-attribute">Room Type: {roomtype}</div>
        <div className="cart-attribute">Total rooms: {totalrooms}</div>
      </div>
      <div className="cart-section-2">
        <div className="cart-price">{price * totalrooms * days} bdt </div>
        <div className="cart-remove" onClick={() => removeFromCart(id)}>
          remove
        </div>
      </div>
    </div>
  );
};

export default HotelCartItem;
