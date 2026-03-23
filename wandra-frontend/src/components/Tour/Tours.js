import React from "react";
import { useLocation } from "react-router-dom";
import SearchTour from "../Tour/SearchTour";
import "./tours.css";
import { tourCardData } from "../Database/data";
import TourCard from "./TourCard";
import { useState, useEffect } from "react";

const Tours = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  
  const [searchUpdate, setSearchUpdate] = useState(true);
  
  const handleDefaultSearch = () => {
    if (term != null) {
      setSearch(term);
    }
    setSearchUpdate(false);
  };
  
  const location = useLocation();
  console.log("This is from tour " + location.search);
  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get("q");
  
  const [sortNameAsc, setSortNameAsc] = useState(true);
  const [sortPriceAsc, setSortPriceAsc] = useState(true);
  const [sortRatingAsc, setSortRatingAsc] = useState(true);
  
  const [sortName, setSortName] = useState(false);
  const [sortPrice, setSortPrice] = useState(false);
  const [sortRating, setSortRating] = useState(false);
  
  const switchSorting = (sortOn) => {
    // setSortName(false);
    // setSortPrice(false);
    // setSortRating(false);
    
    if (sortOn === "rating") {
      setSortRating(true);
      setSortRatingAsc(!sortRatingAsc);
    }
    if (sortOn === "price") {
      setSortPrice(true);
      setSortName(false);
      setSortRating(false);
      setSortPriceAsc(!sortPriceAsc);
    }
    if (sortOn === "name") {
      setSortName(true);
      setSortNameAsc(!sortNameAsc);
    }
    console.log( sortPriceAsc, sortRatingAsc, sortNameAsc);
    
  };
  
  useEffect(() => {
    const filteredResults = tourCardData.filter((post) =>
      post.title.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(filteredResults);
  }, [search, sortPrice]);

  return (
    <>
      {searchUpdate && handleDefaultSearch()}
      <div className="tour-top-container">
        Sort By:
        <div>
          <button
            className="tour-top-items"
            onClick={() => switchSorting("price")}
          >
            {sortPriceAsc && (
              <span className="tour-sort-text">Price Low to High</span>
            )}
            {!sortPriceAsc && (
              <span className="tour-sort-text">Price High to Low</span>
            )}
          </button>
        </div>
        <div>
          <button
            className="tour-top-items"
            onClick={() => switchSorting("rating")}
          >
            {sortRatingAsc && (
              <span className="tour-sort-text">Rating Low to High</span>
            )}
            {!sortRatingAsc && (
              <span className="tour-sort-text">Rating High to Low</span>
            )}
          </button>
        </div>
        <div>
          <button
            className="tour-top-items"
            onClick={() => switchSorting("name")}
          >
            {sortNameAsc && <span className="tour-sort-text">Name (A-Z)</span>}
            {!sortNameAsc && <span className="tour-sort-text">Name (Z-A)</span>}
          </button>
        </div>
      </div>
      <div className="tour-option">
        <SearchTour
          search={search}
          setSearch={setSearch}
          setSearchResults={setSearchResults}
        />

        {/* .sort(
                (a, b) =>
                  (sortPriceAsc && sortPrice && b.price - a.price) ||
                  (sortRatingAsc && sortRating && b.rating - a.rating) ||
                  (sortNameAsc && sortName && a.title > b.title ? 1 : -1)) */}

        <div className="tour-cards">
          {searchResults
            .sort(
              (a, b) =>
                (sortPriceAsc && sortPrice && b.price - a.price) ||
                (sortRatingAsc && sortRating && b.rating - a.rating) ||
                (sortNameAsc && sortName && a.title > b.title ? 1 : -1)
            )
            .map((tour) => (
              <TourCard
                id={tour.id}
                img={tour.img}
                title={tour.title}
                name={tour.name}
                location={tour.location}
                rating={tour.rating}
                description={tour.description}
                price={tour.price}
                category={tour.category}
              />
            ))}
          {Object.keys(searchResults).length === 0 && (
            <h2 style={{ margin: "100px 250px", color: "#222"}}>
              No match found!
            </h2>
          )}
        </div>
      </div>
    </>
  );
};

export default Tours;
