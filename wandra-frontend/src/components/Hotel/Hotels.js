import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import List from "./list/List";
import Hotel from "./hotel/Hotel";
import Hoteldescription from "./Hoteldescription";

function Hotels() {
  return (
    <Router>
      <Switch>
        <Route exact path="/hotels">
          <List />
        </Route>
        <Route path="/hotels/:id" component={Hoteldescription} />
      </Switch>
    </Router>
  );
}

export default Hotels;
