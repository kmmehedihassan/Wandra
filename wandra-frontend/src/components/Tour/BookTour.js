import React from "react";
import "./searchTour.css";
import "./bookTour.css";
import { useState } from "react";
import { BiUser } from "react-icons/bi";
import { AiOutlineMail } from "react-icons/ai";
import { FiPhone } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi"
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { tour_details, tourCardData } from "../Database/data";
import { useHistory } from "react-router-dom";

const BookTour = () => {
    const [bookData, setBookData] = useState({
      name:"",
      email:"",
      phone: "",
      date: "",
      ticket: "",
    });

    const history = useHistory();

    const { id } = useParams();
    console.log("THis id from description" + { id });
    const post = tour_details.find((post) => post.id.toString() === id);
    const tourFirstDetail = tourCardData.find(
      (post) => post.id.toString() === id
    );

    const msg = `Your Tour has been successfully booked.                                                       Name: ${
      tourFirstDetail.title
    }                                                       Destination: ${
      tourFirstDetail.location
    }/n
    Duration: ${post.dur}
    Total cost for ${bookData.ticket} persons: ${
      Number(tourFirstDetail.price) * Number(bookData.ticket)
    }`;
    
    const handleSubmit = () => {
      let itemid = JSON.parse(window.localStorage.getItem("ItemId")) || 0;
      itemid = itemid + 1;
      window.localStorage.setItem("ItemId", JSON.stringify(itemid));

      let cartTotal = JSON.parse(window.localStorage.getItem("CartTotal")) || 0;
      cartTotal =
        cartTotal + Number(tourFirstDetail.price) * Number(bookData.ticket);
      window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));

      let obj = {
        id: itemid,
        type: "tour",
        name: tourFirstDetail.title,
        checkin: bookData.date,
        checkout: "",
        roomtype: "",
        totalrooms: "",
        price: tourFirstDetail.price,
        ticket: bookData.ticket,
        status: "inprogress",
      }

      let cart = JSON.parse(window.localStorage.getItem('Cart') || "[]");
      cart.push(obj);
      window.localStorage.setItem("Cart", JSON.stringify(cart));

      // let continfo = JSON.stringify({
      //   email: bookData.email,
      // });

      // window.localStorage.setItem("contactinfo", continfo);

      // var templateParams = {
      //   user_name: bookData.name,
      //   sender_email: "account@trekker.com",
      //   res_email: bookData.email,
      //   message: msg,
      // };
      
      console.log(bookData);  
    // emailjs
          //   .send(
          //     "service_8h8dopm",
          //     "template_bgg27nb",
          //     templateParams,
          //     "O1-P6q-7AAzb86MXG"
          //   )
          //   .then(
          //     function (response) {
          //       console.log("SUCCESS!", response.status, response.text);
          //       alert("Booking successful");
          //     },
          //     function (error) {
          //       console.log("FAILED...", error);
          //     }
          //   );
          history.push("/cart");
    };

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setBookData({ ...bookData, [name]: value });
        console.log("handle change:", bookData);
        return;
    };

    const [popover, setPopover] = useState(false);

    return (
      <>
        <div className="book-tour-container">
          <label className="search-tour-title">Book Tour</label>
          <div className="search-tour-items">
            <BiUser color="#ff681a" />
            <input
              type="text"
              placeholder="Name"
              name="name"
              className="search-tour-item"
              // value={bookData.name}
              onChange={handleChange}
            />
          </div>
          <div className="search-tour-items">
            <AiOutlineMail color="#ff681a" />
            <input
              type="email"
              placeholder="Email"
              name="email"
              className="search-tour-item"
              // value={bookData.email}
              onChange={handleChange}
            />
          </div>
          <div className="search-tour-items">
            <FiPhone color="#ff681a" />
            <input
              type="phone"
              placeholder="Phone"
              name="phone"
              className="search-tour-item"
              // value={bookData.phone}
              onChange={handleChange}
            />
          </div>
          {/* <div className="search-tour-items">
          <MdOutlinePlace color="#ff681a" />
          <input
            type="date"
            placeholder="MM/DD/YYYY"
            min={1}
            className="search-tour-item"
            onChange={handleChange}
          />
        </div> */}
          <div className="search-tour-items">
            <HiOutlineTicket color="#ff681a" />
            <input
              type="number"
              placeholder="Tickets"
              name="ticket"
              min={1}
              className="search-tour-item"
              // value={bookData.ticket}
              onChange={handleChange}
            />
          </div>

          {/* <Link
            to="/hotels"
            className="link-to-hotel"
            onMouseEnter={() => setPopover(true)}
            onMouseLeave={() => setPopover(false)}
          >
            <label className="txt-link-to-hotel">Include Accomodation</label>
            {popover && (
              <div className="hotel-popover-msg">
                You can include accomodation to the current tour. The overall
                tour price will be adjusted according to your hotel reservation.
              </div>
            )}
          </Link> */}

          <button className="tour-search-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </>
    );
};

export default BookTour;
