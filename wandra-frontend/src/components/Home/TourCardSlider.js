import React from "react";
import "./tourCardSlider.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md"; 
import Rating from "@mui/material/Rating";
import { Link, useHistory } from "react-router-dom";

const TourCardSlider = (props) => {
  const slideLeft = () => {
    var slider = document.getElementById("slider2");
    slider.scrollLeft = slider.scrollLeft - 580;
  };

  const slideRight = () => {
    var slider = document.getElementById("slider2");
    slider.scrollLeft = slider.scrollLeft + 580;
  };

  const history = useHistory();

  const sliderClick = (slider) => {
    // alert("tour slide clicked");
    history.push("/tours");
  };

  return (
    <>
      <div id="card-slider-top2">
        <h1 id="slider-title2">{props.title}</h1>
        <MdChevronLeft
          size={30}
          className="slider-icon left"
          onClick={slideLeft}
        />
        <MdChevronRight
          size={30}
          className="slider-icon right"
          onClick={slideRight}
        />
      </div>
      <div id="main-slider-container2">
        <div id="slider2">
          {props.slides.sort((a, b) => b.rating - a.rating).map((slide, index) => {
            return (
              <div className="slider-card2" key={index}>
                <Link
                  to={{
                    pathname: `/tours/${slide.id}`,
                    state: { stateParam: true },
                  }}
                >
                  <div className="slider-card-image-parent2">
                    <div
                      className="slider-card-image2"
                      style={{
                        backgroundImage: `url(${slide.img})`,
                        backgroundSize: "cover",
                      }}
                    ></div>
                  </div>
                </Link>

                {/* <div className="slider-card-image-parent2">
                  <div
                    className="slider-card-image2"
                    style={{
                      backgroundImage: `url(${slide.img})`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </div> */}
                <div className="tour-slide-summary">
                  <div className="sum-up">
                    <div className="float-left tour-slide-title">
                      {slide.title}
                    </div>
                    <div className="float-right">
                      <Rating
                        className="tour-rating"
                        name="half-rating-read"
                        defaultValue={slide.rating}
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="sum-down">
                    <div className="float-left tour-card-location">
                      {slide.location}
                    </div>
                    <div className="float-right tour-card-price">
                      {slide.price} BDT
                    </div>
                  </div>
                </div>
                {/* <p className="slider-card-title2">{slide.title}</p>
                <p className="slider-card-description2">{slide.description}</p> */}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default TourCardSlider;
