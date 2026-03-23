import React from "react";
import "./description.css";
import Descsubs from "./Descsubs";
import Gallery from "./Gallery";
import BookTour from "./BookTour";
import "../Destination/Header.css";
import { useState } from "react";
import { tour_details, tourCardData } from "../Database/data";
import { Link, useHistory, useParams } from "react-router-dom";

const Description = ({
  link,
  name,
  price,
  desc,
  type,
  time,
  dur,
  req,
  inc,
  ninc,
}) => {
  const { id } = useParams();
  console.log("THis id from description" + { id });
  const post = tour_details.find((post) => post.id.toString() === id);
  const tourFirstDetail = tourCardData.find(
    (post) => post.id.toString() === id
  );
  console.log(post);
  console.log(tourFirstDetail.img);

  // const [tourDetailsData,setTourDetailsData]=useState(tour_details);
  return (
    <div>
      <img
        className="image"
        src={"../../" + tourFirstDetail.img}
        alt="intro"
      ></img>
      <div className="main-container-tour ">
        <h1 className="title">{tourFirstDetail.title}</h1>
        <p className="para">{tourFirstDetail.price}Tk/per person</p>
        <p className="desc_box">{tourFirstDetail.description}</p>
        <div className="subs">
          <div className="each-row"><h6 className="point">Type</h6>
            <p className="detail-tour-desc">{tourFirstDetail.category}</p>
          </div>
          <div className="each-row"><h6 className="point">Departure time</h6>
            <p className="detail-tour-desc">{post.time}</p>
          </div>
          <div className="each-row"><h6 className="point">Duration</h6>
            <p className="detail-tour-desc">{post.dur} Nights</p>
          </div>
          <div className="each-row"><h6 className="point">Requirements</h6>
            <p className="detail-tour-desc">{post.req}</p>
          </div>
          <div className="each-row"><h6 className="point">Included</h6>
            <p className="detail-tour-desc">{post.inc}</p>
          </div>
          <div className="each-row"><h6 className="point">Not Included</h6>
            <p className="detail-tour-desc">{post.ninc}</p>
          </div>
        </div>
        <Gallery />
        <div className="book-tour-position">
          <BookTour />
        </div>
      </div>
    </div>
  );
};

export default Description;
