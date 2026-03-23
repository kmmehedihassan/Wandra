import React, {useState, useEffect} from "react";
import CreditCardForm from "./CreditCardForm";
import HotelCartItem from "./HotelCartItem";
import TourCartItem from "./TourCartItem";
import "./cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
      setCart(JSON.parse(window.localStorage.getItem("Cart") || "[]"));
  }, [cart]);
  
  return (
    <div className="cart-main-cont">
      <div className="cart-left-section">
        <div className="cart-heading">MY SHOPPING CART</div>

        <div className="cart-item-summary">
          <div className="cart-info-title">ORDER SUMMARY</div>
          {/* <HotelCartItem /> */}

          {cart.map((cartdata) =>
            cartdata.type === "tour" ? (
              <TourCartItem
                id={cartdata.id}
                name={cartdata.name}
                date={cartdata.checkin}
                ticket={cartdata.ticket}
                price={cartdata.price}
              />
            ) : (
              <HotelCartItem
                id={cartdata.id}
                name={cartdata.name}
                checkin={cartdata.checkin}
                checkout={cartdata.checkout}
                roomtype={cartdata.roomtype}
                totalrooms={cartdata.totalrooms}
                price={cartdata.price}
                days={cartdata.days}
              />
            )
          )}
          {Object.keys(cart).length === 0 && (
            <h2 style={{ margin: "50px 240px", color: "#222" }}>
              Your cart is empty!
            </h2>
          )}
        </div>
        <div className="cart-order-summary">
          <div className="cart-total">ORDER TOTAL:</div>

          <div className="cart-total-price">
            {JSON.parse(window.localStorage.getItem("CartTotal"))} BDT
          </div>
        </div>
      </div>
      <CreditCardForm />
    </div>
  );
};

export default Cart;
