import React from "react";
import "./destinationCardSlider.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useHistory } from "react-router-dom";


const DestinationCardSlider = (props) => {
  const slideLeft = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 580;
  };

  const slideRight = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 580;
  };
  const history = useHistory();
  const handleslideclick = () => {
    history.push("/destinations");
  };

  return (
    <>
      <div id="card-slider-top">
        <h1 id="slider-title">{props.title}</h1>
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
      <div id="main-slider-container">
        <div id="slider">
          {props.slides.map((slide, index) => {
            return (
              <div
                className="slider-card"
                key={index}
                onClick={() => handleslideclick()}
              >
                <div className="slider-card-image-parent">
                  <div
                    className="slider-card-image"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </div>
                <p className="slider-card-title">{slide.title}</p>
                <p className="slider-card-description">{slide.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default DestinationCardSlider;
