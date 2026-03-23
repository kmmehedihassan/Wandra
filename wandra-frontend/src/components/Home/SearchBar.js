import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import "./searchBar.css";
import { IconContext } from "react-icons/lib";
import { BiSearch } from "react-icons/bi";
import { ImCross } from "react-icons/im";
import Dropdown from "./Dropdown";

function SearchBar({ placeholder }) {
  const [selected, setSelected] = useState("Destination");
  const [searchData, setSearchData] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchData(value);
    return;
  };

  const handleClick = () => {
    setSearchData("");
    return;
  };

  const history = useHistory();
  const params = useParams();

  const handleSearch = (e) => {
    e.preventDefault();
    if (selected === "Blog") {
      history.push("/blog?q=" + searchData);
    } else if (selected === "Destination") {
      history.push("/destinations?q=" + searchData);
    } else if (selected === "Tour") {
      history.push("/tours?q=" + searchData);
    }
  };

  useEffect(() => {
    const param = new URL(window.location.href).searchParams.get("q");
    if (param) console.log(param);
  }, [params]);

  console.log(selected);
  return (
    <IconContext.Provider value={{ color: "grey", size: "1.2rem" }}>
      <div className="search">
        <div className="searchInputs">
          <BiSearch id="search-icn" />
          <form onSubmit={handleSearch}>
            <input
              id="search-bar"
              type="text"
              name="search"
              placeholder={placeholder}
              value={searchData}
              onChange={handleChange}
            />
          </form>
          {searchData !== "" && (
            <span id="clearSearch" onClick={handleClick}>
              <ImCross color="white" size="0.5rem" />
            </span>
          )}
          <div id="divider">|</div>
          <Dropdown selected={selected} setSelected={setSelected} />
        </div>
      </div>
    </IconContext.Provider>
  );
}

export default SearchBar;
