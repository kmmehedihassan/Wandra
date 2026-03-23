import React from "react";
import "./myBookings.css";
import emailjs from "@emailjs/browser";

const BookedTour = ({ id, name, date, ticket, price, status }) => {

  const removeFromCart = (itemid) => {
    let obj = JSON.parse(window.localStorage.getItem("Booklist"));
    console.log(obj);
    //obj = obj.filter((item) => item.id !== itemid);
    obj = obj.map((item) => {
      if (item.id === itemid) {
        return { ...item, status: "cancelled" };
      }

      return item;
    });
    console.log("after", obj);
    window.localStorage.setItem("Booklist", JSON.stringify(obj));
    alert(
      "Your booking has been cancelled. We will contact with you soon for the refund."
    );
    ////////////////// email send ////////////////////

    var templateParams = {
      user_name: JSON.parse(
        window.localStorage.getItem("userdata")
      ).username.toString(),
      res_email: JSON.parse(
        window.localStorage.getItem("userdata")
      ).useremail.toString(),
    };

    emailjs
      .send(
        "service_8h8dopm",
        "template_w1s15tc",
        templateParams,
        "O1-P6q-7AAzb86MXG"
      )
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
          //alert("Booking successful");
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
    // let cartTotal = JSON.parse(window.localStorage.getItem("CartTotal"));
    // cartTotal = cartTotal - price * totalrooms;
    // window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));
  };

  return (
    <div className="hotel-book-item-con">
      <div className="tour-book-identifier">Tour</div>
      <div className="book-section">
        <div className="book-name">{name}</div>
        <div className="book-attribute">date: 21/11/22 </div>
        <div className="book-attribute">Total tickets: {ticket}</div>
      </div>
      <div className="book-section-2">
        <div className="book-price">{price * ticket} bdt </div>
        {(status === "cancelled" && (
          <div className="book-cancelled">cancelled</div>
        )) ||
          (status === "completed" && (
            <div className="book-completed">completed</div>
          )) ||
          (status === "inprogress" && (
            <div>
              <div className="book-cancel" onClick={() => removeFromCart(id)}>cancel</div>
              <div className="book-reschedule">reschedule</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default BookedTour;
