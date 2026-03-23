/*import React, { useRef } from "react";
import "../Tour/description.css";
import Gallery from "../Tour/Gallery";
import BookTour from "../Tour/BookTour";
import "../Destination/Header.css";
import "../Hotel/HotelDesc.css";
// import { useRef } from "react";
import { useState } from "react";
import { hotel_list, tourCardData } from "../Database/data";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  HotelRoomData,
  SingleHotel,
  HotelRoomState,
} from "../Database/SingleHotel";
import BookList from "../Hotel/BookHotel";
import { integerPropType } from "@mui/utils";
import { daysInWeek, formatRelative } from "date-fns";
import { useEffect } from "react";
import { format } from "date-fns";

const Hoteldescription = () => {
  let { UserName } = "Fahim";
  const history = useHistory();
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [booking, setBooking] = useState([
    {
      username: "Fahim",
      roomid: 1,
      hotelid: 1,
      roomquantity: 4,
      startdate: "2022-11-15",
      enddate: "2022-11-23",
    },
  ]);
  const { id } = useParams();
  console.log("THis id from hoteldescription" + { id });
  //   const post = tour_details.find((post) => post.id.toString() === id);
  const tourFirstDetail = hotel_list.find((post) => post.id.toString() === id);
  //   console.log(post);
  console.log(tourFirstDetail.img);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const { hotels, setHotels } = HotelRoomState();

  let cnt1 = Object.keys(
    hotels.filter((hotel) => hotel.hotelid === parseInt(id))
  ).length;

  const handleSubmitHotelBook = () => {
    // const cnt=HotelRoomData.length();
    // let cnt=Object.keys(HotelRoomData).length
    // console.log(refs.current[0].current.value+" "+cnt)
    // console.log(refs.current[2] ===undefined)
    let i = 0;
    let data;
    let tempdata = [];
    for (i = 0; i < length; i++) {
      console.log(
        refs.current[i].current.id + " of index in handlesubmit  " + i
      );
      // const datetime = format(new Date(), "YYYY-MM-DD");
      // console.log(datetime);
      data = {
        username: "Fahim",
        roomid: refs.current[i].current.id,
        hotelid: id,
        roomquantity: refs.current[i].current.value,
        startdate: date[0].startDate
          .toJSON()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("/"),
        enddate: date[0].endDate
          .toJSON()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("/"),
      };
      console.log(data);
      //tempdata = [...tempdata, data];
      // booking.forEach(book=>{
      //   console.log("This is the booking data "+ JSON.stringify(book))
      // })
      if (refs.current[i].current.value !== "") {
        tempdata = [...tempdata, data];

        //////////////////////
        const roomid = refs.current[i].current.id;
        let room = HotelRoomData.filter(room => {
          return room.id.toString() === roomid;
        });
        
        let itemid = JSON.parse(window.localStorage.getItem("ItemId")) || 0;
        itemid = itemid + 1;
        window.localStorage.setItem("ItemId", JSON.stringify(itemid));
        
        let obj = {
          id: itemid,
          type: "hotel",
          name: tourFirstDetail.name,
          roomtype: room[0].type,
          price: room[0].price,
          ticket: "",
          roomid: refs.current[i].current.id,
          hotelid: id,
          totalrooms: refs.current[i].current.value,
          checkin: date[0].startDate
            .toJSON()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          checkout: date[0].endDate
            .toJSON()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/"),
        };
        let cartTotal =
          JSON.parse(window.localStorage.getItem("CartTotal")) || 0;
        cartTotal = cartTotal + obj.price * obj.totalrooms;
        window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));

        //const datetime = format(new Date(), "YYYY-MM-DD");






        let cart = JSON.parse(window.localStorage.getItem("Cart") || "[]");
        cart.push(obj);
        window.localStorage.setItem("Cart", JSON.stringify(cart));
      }
      refs.current[i].current.value = "";
    }
    tempdata = [...booking, tempdata];
    setBooking(tempdata);
    console.log("This is the booking data" + JSON.stringify(booking));
    history.push("/cart");
  };
  // useEffect (()=>{
  //   console.log(booking);
  // }
  // , [booking])
  const ulRef = useRef(null);
  const [length, setLength] = useState(2);
  const [loading, setLoading] = useState(true);
  const refs = useRef([React.createRef(), React.createRef()]);

  function updateLength(value) {
    if (loading) setLength(value);
    refs.current = refs.current.splice(0, value);
    for (let i = 0; i < value; i++) {
      refs.current[i] = refs.current[i] || React.createRef();
    }
    refs.current = refs.current.map((item) => item || React.createRef());
    setLoading(false);
  }
  let cnt = Object.keys(HotelRoomData).length;
  console.log("Per hotel room lenght " + cnt1);
  const [inputValue, setInputValue] = useState(0);
  // updateLength(cnt)
  let GlobalCountForHotelRoom = 0;

  return (
    <>
      {loading && updateLength(cnt1)}
      <img
        className="image"
        src={"../../" + tourFirstDetail.src}
        alt="intro"
      ></img>
      <div className="SinglePageHotel">
        <div className="main-container-tour ">
          <h1 className="title">{tourFirstDetail.name}</h1>
          <p className="para">starts from {tourFirstDetail.price}Tk/Night</p>
          <p className="desc_box">{tourFirstDetail.description}</p>
          <div className="subs">
            <h6 className="point">Star</h6>
            <p className="detail-tour-desc">{tourFirstDetail.star}</p>
            <h6 className="point">Location</h6>
            <p className="detail-tour-desc">{tourFirstDetail.location}</p>
            <h6 className="point">Highlights</h6>
            <p className="detail-tour-desc">
              {tourFirstDetail.features} Nights
            </p>
            <div>
              {console.log(id)}
              {HotelRoomData.map((post, i) => {
                let hotelNum = id;
                let SingleHotelObj = hotels.filter((hotel) => {
                  return hotel.roomid === post.id;
                });
                SingleHotelObj = SingleHotelObj.filter((hotel) => {
                  return hotel.hotelid.toString() === id;
                });
                console.log(SingleHotelObj + " " + hotelNum + " " + i);
                if (SingleHotelObj.length > 0)
                  return (
                    <div className="HotelDesRoom">
                      <span className="">{post.type}</span>
                      <input
                        id={post.id}
                        ref={refs.current[GlobalCountForHotelRoom++]}
                        type="number"
                        // value={inputValue}
                        min={0}
                        max={SingleHotelObj[0].remaining}
                        className="lsOptionInput"
                        // value={e.current.value}
                        // onChange={(e)=>{setInputValue(e.target.value)}}
                        // placeholder={options.room}
                      />
                    </div>
                  );
              })}
            </div>

            <div className="SingleHotelGallary">
              <Gallery />
            </div>
          </div>
        </div>
      </div>
      <div className="book-tour-position">
        <BookList
          date={date}
          setDate={setDate}
          handleSubmit={handleSubmitHotelBook}
        />
      </div>
    </>
  );
};

export default Hoteldescription;
*/
import React, { useRef } from "react";
import "../Tour/description.css";
import Gallery from "../Tour/Gallery";
import BookTour from "../Tour/BookTour";
import "../Destination/Header.css";
import "../Hotel/HotelDesc.css";
// import { useRef } from "react";
import { useState } from "react";
import { hotel_list, tourCardData } from "../Database/data";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  HotelRoomData,
  SingleHotel,
  HotelRoomState,
} from "../Database/SingleHotel";
import BookList from "../Hotel/BookHotel";
import { integerPropType } from "@mui/utils";
import { daysInWeek, differenceInDays, formatRelative } from "date-fns";
import { useEffect } from "react";


const Hoteldescription = () => {
  let { UserName } = "Fahim";
  const history = useHistory();
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [booking, setBooking] = useState([
    {
      username: "Fahim",
      roomid: 1,
      hotelid: 1,
      roomquantity: 4,
      startdate: "2022-11-15",
      enddate: "2022-11-23",
    },
  ]);
  const { id } = useParams();
  console.log("THis id from hoteldescription" + { id });
  //   const post = tour_details.find((post) => post.id.toString() === id);
  const tourFirstDetail = hotel_list.find((post) => post.id.toString() === id);
  //   console.log(post);
  console.log(tourFirstDetail.img);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const { hotels, setHotels } = HotelRoomState();

  let cnt1 = Object.keys(
    hotels.filter((hotel) => hotel.hotelid === parseInt(id))
  ).length;
  const handleSubmitHotelBook = () => {
    // const cnt=HotelRoomData.length();
    // let cnt=Object.keys(HotelRoomData).length
    // console.log(refs.current[0].current.value+" "+cnt)
    // console.log(refs.current[2] ===undefined)
    let i = 0;
    let data;
    let tempdata = [""];
    for (i = 0; i < length; i++) {
      console.log(
        refs.current[i].current.id + " of index in handlesubmit  " + i
      );

      data = {
        username: "Fahim",
        roomid: refs.current[i].current.id,
        hotelid: id,
        roomquantity: refs.current[i].current.value,
        startdate: date[0].startDate
          .toJSON()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("/"),
        enddate: date[0].endDate
          .toJSON()
          .slice(0, 10)
          .split("-")
          .reverse()
          .join("/"),
      };
      console.log(data);
      if (refs.current[i].current.value !== "") {
        tempdata = [...tempdata, data];

        //////////////////////
        const roomid = refs.current[i].current.id;
        let room = HotelRoomData.filter((room) => {
          return room.id.toString() === roomid;
        });

        let itemid = JSON.parse(window.localStorage.getItem("ItemId")) || 0;
        itemid = itemid + 1;
        window.localStorage.setItem("ItemId", JSON.stringify(itemid));
        
        const d1 = date[0].startDate
        const d2 = date[0].endDate
        const diff = differenceInDays(d2,d1)+1
        let obj = {
          id: itemid,
          type: "hotel",
          name: tourFirstDetail.name,
          roomtype: room[0].type,
          price: room[0].price,
          ticket: "",
          roomid: refs.current[i].current.id,
          hotelid: id,
          totalrooms: refs.current[i].current.value,
          checkin: date[0].startDate
            .toJSON()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          checkout: date[0].endDate
            .toJSON()
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/"),
          status: "inprogress",
          days: diff,
        };


        let cartTotal =
          JSON.parse(window.localStorage.getItem("CartTotal")) || 0;
        cartTotal = cartTotal + obj.price * obj.totalrooms * diff;
        window.localStorage.setItem("CartTotal", JSON.stringify(cartTotal));

        //const datetime = format(new Date(), "YYYY-MM-DD");

        let cart = JSON.parse(window.localStorage.getItem("Cart") || "[]");
        if(obj.totalrooms !== "0")
          cart.push(obj);
        console.log("rooms",obj.totalrooms);
        window.localStorage.setItem("Cart", JSON.stringify(cart));
      }
      refs.current[i].current.value = "";
    }
    tempdata = [...booking, tempdata];
    setBooking(tempdata);
    console.log("This is the booking data" + JSON.stringify(booking));
    history.push("/cart");
  };
  // useEffect (()=>{
  //   console.log(booking);
  // }
  // , [booking])
  const ulRef = useRef(null);
  const [length, setLength] = useState(2);
  const [loading, setLoading] = useState(true);
  const refs = useRef([React.createRef(), React.createRef()]);

  function updateLength(value) {
    if (loading) setLength(value);
    refs.current = refs.current.splice(0, value);
    for (let i = 0; i < value; i++) {
      refs.current[i] = refs.current[i] || React.createRef();
    }
    refs.current = refs.current.map((item) => item || React.createRef());
    setLoading(false);
  }
  let cnt = Object.keys(HotelRoomData).length;
  console.log("Per hotel room lenght " + cnt1);
  const [inputValue, setInputValue] = useState(0);
  // updateLength(cnt)
  let GlobalCountForHotelRoom = 0;
  return (
    <>
      {loading && updateLength(cnt1)}
      <img
        className="image"
        src={"../../" + tourFirstDetail.src}
        alt="intro"
      ></img>
      <div className="SinglePageHotel">
        <div className="main-container-tour ">
          <h1 className="title">{tourFirstDetail.name}</h1>
          <p className="para">Starts from {tourFirstDetail.price} Tk/Night</p>
          <p className="desc_box">{tourFirstDetail.description}</p>
          <div className="subs">
            <div className="each-row">
              <h6 className="point">Star</h6>
              <p className="detail-tour-desc">{tourFirstDetail.star}</p>
            </div>
            <div className="each-row">
              <h6 className="point">Location</h6>
              <p className="detail-tour-desc">{tourFirstDetail.location}</p>
            </div>
            <div className="each-row">
              <h6 className="point">Highlights</h6>
              <p className="detail-tour-desc">
                {tourFirstDetail.features} Nights
              </p>
            </div>
            <div className="each-row">
              <h6 className="point">Room Types</h6>
              <div className="">
                {console.log(id)}
                {HotelRoomData.map((post, i) => {
                  let hotelNum = id;
                  let SingleHotelObj = hotels.filter((hotel) => {
                    return hotel.roomid === post.id;
                  });
                  SingleHotelObj = SingleHotelObj.filter((hotel) => {
                    return hotel.hotelid.toString() === id;
                  });
                  console.log(SingleHotelObj + " " + hotelNum + " " + i);
                  if (SingleHotelObj.length > 0)
                    return (
                      <div className="HotelDesRoom">
                        <span className="">{post.type} </span>
                        <input
                          id={post.id}
                          ref={refs.current[GlobalCountForHotelRoom++]}
                          type="number"
                          // value={inputValue}
                          min={0}
                          max={SingleHotelObj[0].roomquantity}
                          className="lsOptionInput right-align"
                          // value={e.current.value}
                          // onChange={(e)=>{setInputValue(e.target.value)}}
                          placeholder={options.room}
                        />{" "}
                        <br />
                        <p>
                          Adult
                          <span className="">
                            {" "}
                            &nbsp; &nbsp; &nbsp; &nbsp; {post.Adult}{" "}
                          </span>
                        </p>
                        <p>
                          children
                          <span className="">
                            {" "}
                            &nbsp; &nbsp; {post.children}{" "}
                          </span>
                        </p>
                        <p>
                          Price
                          <span className="">
                            {" "}
                            &nbsp; &nbsp; &nbsp; &nbsp; {post.price}{" "}
                          </span>
                        </p>{" "}
                      </div>
                    );
                })}
              </div>
            </div>

            <div className="SingleHotelGallary">
              <Gallery />
            </div>
          </div>
        </div>
      </div>
      <div className="book-tour-position">
        {/* <BookTour /> */}
        <BookList
          date={date}
          setDate={setDate}
          handleSubmit={handleSubmitHotelBook}
        />
      </div>
    </>
  );
};

export default Hoteldescription;