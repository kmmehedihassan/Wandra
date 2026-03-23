import React from "react";
import Navbar from "./components/Navigation/Navbar";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { Route, Switch } from "react-router-dom";
import Home from "./components/Home/HomeMain";
import Destinations from "./components/Destination/Destinations";
import Tours from "./components/Tour/Tours";
import Hotels from "./components/Hotel/Hotels";
import Blog from "./components/Blog/Blog";
import Cart from "./components/Miscellaneous/Cart";
import Error from "./pages/Error";
import StMartin from "./components/Destination/StMartin";
import { UseSomeState } from "./UseSomeState";
import Write from "./components/Blog/write/Write";
import { UseLikedPost } from "./UseLikedPost";
import Description from "./components/Tour/Description";
import Tourdetails from "./components/Tour/Tourdetails";
import Tourimage from "./components/Tour/Tourimage";
import Dashboard from "./components/Profile/Dashboard"
import List from "./components/Hotel/list/List";
import Hoteldescription from "./components/Hotel/Hoteldescription";

const App = () => {
  const { posts, setPosts } = UseSomeState()
  const { postsLiked, setPostsLiked } = UseLikedPost()
  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/destinations" component={Destinations} />
        <Route exact path="/tours" component={Tours} />
        {/* <Route exact path="/hotels" component={Hotels} /> */}
        <Route exact path="/hotels">
          <List />
        </Route>
        <Route path="/hotels/:id" component={Hoteldescription} />
        <Route exact path="/tours/:id">
          <div>
            <Description />
          </div>
        </Route>
        <Route exact path="/blog">
          <Blog posts={posts} setPosts={setPosts} />
        </Route>
        <Route exact path="/hotels">
          <Hotels />
        </Route>
        <Route exact path="/blog/posts">
          <Blog posts={posts} setPosts={setPosts} />
        </Route>
        <Route exact path="/write">
          <Write posts={posts} setPosts={setPosts} />
        </Route>
        <Route exact path="/cart" component={Cart} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route component={Error} />
      </Switch>
    </>
  );
}

export default App;


/*
myenv\Scripts\activate
cd DjangoAPI
py manage.py runserver


py manage.py makemigrations
py manage.py migrate
py manage.py runserver
*/