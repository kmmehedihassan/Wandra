import React from "react";
import { Link } from "react-router-dom";
import "./tourCard.css";
import Rating from "@mui/material/Rating";

const TourCard = ({
    id,
    img,
    title,
    name,
    location,
    rating,
    description,
    price,
    category,
}) => {
    return (
        <div className="tour-card-container">
            <Link to={{ pathname: `/tours/${id}`, state: { stateParam: true } }}>
                <div className="tour-card-img">
                    <img src={img} alt="tour" />
                </div>
            </Link>
            <div className="tour-card-section">
                <div className="tour-card-title">
                    {title}
                    <Rating
                        className="tour-rating"
                        name="half-rating-read"
                        value={rating}
                        precision={0.5}
                        readOnly
                    />
                </div>
                <div className="tour-card-location">
                    {name}, {location}
                </div>

                <div className="tour-card-desc">{description}</div>
                <div className="tour-card-price-content">
                    <span className="tour-card-price">{price} BDT </span>
                    <span clasName="tour-misc-label">/ per person</span>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
