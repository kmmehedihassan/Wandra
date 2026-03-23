import React from 'react'

import './Booking.css'
// style={{width: "30%"}}

const Booking = () => {
  return (
    <div className="side_container">
      <div className="form">
        <div className="form-text">
          <h1>Plan a tour here</h1>
        </div>
        <div className="main-form">
          {/* <form action="index.php" method="get"> */}
          <form>
            <div>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                required
              ></input>
            </div>
            <div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
              ></input>
            </div>
            <div>
              <input
                type="number"
                name="prson"
                id="person"
                placeholder="No. of persons"
                required
              ></input>
            </div>
            {/* <div>
                    <span>What time ?</span>
                    <input type="text" name="time" id="time" placeholder="Time" required></input>
                </div> */}
            <div>
              <input
                type="date"
                name="date1"
                id="date1"
                placeholder="Arrival-date"
                required
              ></input>
            </div>
            <div>
              <input
                type="date"
                name="date2"
                id="date2"
                placeholder="Departure-date"
                required
              ></input>
            </div>
            <div>
              <input
                type="number"
                name="number"
                id="number"
                placeholder="Phone no."
                required
              ></input>
            </div>
            <div id="submit">
              <input type="search" value="SEARCH" id="submit"></input>
            </div>
          </form>
        </div>
        <p class="form-text">Please login to book a tour</p>
      </div>
    </div>
  );
}

export default Booking
