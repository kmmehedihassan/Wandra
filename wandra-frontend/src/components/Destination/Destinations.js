import {React, useEffect, useState} from "react";
import { BrowserRouter as Router, Switch, Route, useLocation } from "react-router-dom";
import Grid from "./Grid";
import Header from "./Header";
import Title from "./Title";
import Full from "./Full";
import Topbar from "../Blog/topbar/Topbar";
import { gridData } from "../Database/data";

const Destinations = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  useEffect(() => {
    const filteredResults = gridData.filter(
      (grid) =>
        grid.name.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredResults);
  }, [search]);

  const [searchUpdate, setSearchUpdate] = useState(true);

  const handleDefaultSearch = () => {
    if (term != null) {
      setSearch(term);
    }
    setSearchUpdate(false);
  };

  const location = useLocation();
  console.log("This is from posts Blog " + location.search);
  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get("q");

  return (
    <Router>
      {searchUpdate && handleDefaultSearch()}
  

      <Switch>
        <Route exact path="/destinations">
          {/* <Header /> */}
          <Topbar search={search} setSearch={setSearch} />
          <Grid grids={searchResults} />
        </Route>
        <Route path="/destinations/:id">
          <Full />
        </Route>
      </Switch>
    </Router>
  );
};

export default Destinations;
