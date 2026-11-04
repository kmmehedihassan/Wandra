import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import Navbar from "./components/Navigation/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Home/HomeMain";
import Destinations from "./components/Destination/Destinations";
import DestinationDetail from "./components/Destination/DestinationDetail";
import Tours from "./components/Tour/Tours";
import Description from "./components/Tour/Description";
import List from "./components/Hotel/list/List";
import Hoteldescription from "./components/Hotel/Hoteldescription";
import Blog from "./components/Blog/Blog";
import SinglePost from "./components/Blog/singlePost/SinglePost";
import Write from "./components/Blog/write/Write";
import Cart from "./components/Miscellaneous/Cart";
import Dashboard from "./components/Profile/Dashboard";
import Error from "./pages/Error";
import ResetPassword from "./pages/ResetPassword";
import { useScrollTop } from "./components/Layout/Shared";
import { usePosts } from "./usePosts";
import Toast from "./components/Layout/Toast";
import { useSessionSync } from "./store";

const App = () => {
  const blog = usePosts();
  const location = useLocation();
  useScrollTop(location.pathname, location.hash);
  useSessionSync();

  return (
    <>
      <Navbar />
      <main className="app-main">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/destinations" component={Destinations} />
          <Route exact path="/destinations/:id" component={DestinationDetail} />
          <Route exact path="/tours" component={Tours} />
          <Route exact path="/tours/:id" component={Description} />
          <Route exact path="/hotels" component={List} />
          <Route exact path="/hotels/:id" component={Hoteldescription} />
          <Route exact path="/blog">
            <Blog blog={blog} />
          </Route>
          <Route exact path="/blog/post/:id">
            <SinglePost blog={blog} />
          </Route>
          <Route exact path="/write">
            <Write blog={blog} />
          </Route>
          <Route exact path="/cart" component={Cart} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/reset-password" component={ResetPassword} />
          <Route component={Error} />
        </Switch>
      </main>
      <Footer />
      <Toast />
    </>
  );
};

export default App;
