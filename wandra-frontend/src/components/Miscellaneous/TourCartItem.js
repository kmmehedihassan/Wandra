import React from "react";
import "./cart.css";

const TourCartItem = ({
  id,
  name,
  date,
  ticket,
  price,
}) => {

  const removeFromCart = (itemid) => {
    let obj = JSON.parse(window.localStorage.getItem("Cart"));
    console.log(obj);
    obj = obj.filter((item) => item.id !== itemid);
    console.log('after', obj);
    window.localStorage.setItem("Cart", JSON.stringify(obj));
    let cartTotal = JSON.parse(window.localStorage.getItem("CartTotal"));
    cartTotal = cartTotal - price * ticket;
    window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));
  }

  return (
    <div className="hotel-cart-item-con">
      <div className="tour-cart-identifier">Tour</div>
      <div className="cart-section">
        <div className="cart-name">{name}</div>
        <div className="cart-attribute">date: 21/11/22 </div>
        <div className="cart-attribute">Total tickets: {ticket}</div>
      </div>
      <div className="cart-section-2">
        <div className="cart-price">{price * ticket} bdt </div>
        <div className="cart-remove" onClick={() => removeFromCart(id)}>remove</div>
      </div>
    </div>
  );
};

export default TourCartItem;
