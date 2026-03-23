import React, {useState, useEffect} from "react";
import BookedHotel from "./BookedHotel";
import BookedTour from "./BookedTour";
import "./myBookings.css";

const MyBookings = () => {

  const [booklist, setBooklist] = useState([]);
  
  useEffect(() => {
      setBooklist(JSON.parse(window.localStorage.getItem("Booklist") || "[]"));
  }, [booklist]);

  return (
    <div className="booking-container">
      <label className="view-prof-title">MY BOOKINGS</label>
      {booklist.map((bookdata) =>
        bookdata.type === "tour" ? (
          <BookedTour
            id={bookdata.id}
            name={bookdata.name}
            date={bookdata.checkin}
            ticket={bookdata.ticket}
            price={bookdata.price}
            status={bookdata.status}
          />
        ) : (
          <BookedHotel
            id={bookdata.id}
            name={bookdata.name}
            checkin={bookdata.checkin}
            checkout={bookdata.checkout}
            roomtype={bookdata.roomtype}
            totalrooms={bookdata.totalrooms}
            price={bookdata.price}
            status={bookdata.status}
          />
        )
      )}
      {Object.keys(booklist).length === 0 && (
        <h4 style={{ margin: "150px 100px", color: "#222" }}>
          You do not have any bookings!
        </h4>
      )}
    </div>
  );
};

export default MyBookings;

