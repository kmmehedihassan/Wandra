import React from "react";
import "./searchTour.css";
import { useState } from "react";
import { GoSearch } from "react-icons/go";
import { MdOutlinePlace } from "react-icons/md";
import Rating from "@mui/material/Rating";
import TourDropdown from "./TourDropdown";
import Slider from "@mui/material/Slider";
import { tourCardData } from "../Database/data";

const SearchTour = ({ search, setSearch, setSearchResults }) => {
  const [searchTour, setSearchTour] = useState("");
  const [tourDestination, setTourDestination] = useState("");

  const [selected, setSelected] = useState("Month");

  const [value, setValue] = useState([0, 30000]);

  const rangeSelector = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearch = () => {
    setSearch("");
    const filteredResults = tourCardData.filter((post) => {
      if (tourDestination === "") {
        if(selected.includes("Month")){
            
          return (
            post.price >= value[0] &&
            post.price <= value[1] &&
            post.rating >= rating
          );
        }
        else {
          return(
            
            post.price >= value[0] &&
            post.price <= value[1] &&
            post.rating >= rating &&
             post.month.toLowerCase().includes(selected.toLowerCase()) 
          );
        }
      } else {
        if(selected.includes("Month")){
        return (
          post.location.toLowerCase().includes(tourDestination.toLowerCase()) &&
          post.price > value[0] &&
          post.price < value[1] 
          // post.month.toLowerCase().includes(selected.toLowerCase()) 
        );
        }
        else{
          return (
            post.location.toLowerCase().includes(tourDestination.toLowerCase()) &&
            post.price > value[0] &&
            post.price < value[1] &&
            post.month.toLowerCase().includes(selected.toLowerCase()) 
          );
        }
      }
    });
    setSearchResults(filteredResults);
  };

  const [rating, setRating] = useState(0);

  return (
    <>
      <div className="search-tour-container">
        <label className="search-tour-title">Find Tour</label>
        <div className="search-tour-items">
          <GoSearch color="#ff681a" />
          <input
            type="text"
            placeholder="Search Tour"
            className="input-search-tour"
            value={search}
            onChange={(e) => {
              setSearchTour(e.target.value);
              setSearch(e.target.value);
              console.log(search);
            }}
          />
        </div>
        <div className="search-tour-items">
          <MdOutlinePlace color="#ff681a" />
          <input
            type="text"
            placeholder="Where to?"
            className="input-tour-destination"
            onChange={(e) => setTourDestination(e.target.value)}
          />
        </div>

        <TourDropdown selected={selected} setSelected={setSelected} />

        <div className="tour-price-range">
          <Slider
            value={value}
            onChange={rangeSelector}
            valueLabelDisplay="auto"
            min={0}
            max={30000}
            step={1000}
            sx={{
              width: 190,
              color: "#ff681a",
            }}
          />
          <label className="tour-price-range-label">
            Price Range: {value[0]} - {value[1]} BDT
          </label>
        </div>

        <div className="search-tour-rating">
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newRating) => {
              setRating(newRating);
            }}
          />
          <span className="search-tour-rating-label"> & Up</span>
        </div>
        <button className="tour-search-btn" onClick={handleSearch}>
          SEARCH
        </button>
      </div>
    </>
  );
};

export default SearchTour;
