import Topbar from "./topbar/Topbar";
import Homepage from "./homepage/Homepage";
import Login from "./login/Login";
import Register from "./register/Register";
import Settings from "./settings/Settings";
import Write from "./write/Write";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import { Redirect } from "react-router-dom";
import { UseSomeState } from "../../UseSomeState";
import { useState, useEffect } from "react";
import SinglePost from "./singlePost/SinglePost";

const Blog = ({ posts, setPosts }) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    const filteredResults = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(search.toLowerCase()) ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.Author.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredResults.reverse());
    // childToParent(posts);
  }, [posts, search]);

  const handleDelete = (id) => {
    const postsList = posts.filter((post) => post.id !== id);
    setPosts(postsList);
    posts.map((post) => {
      console.log("The post ID in delete" + post.id);
    });
  };

  const currentUser = true;

  const [searchUpdate, setSearchUpdate] = useState(true);

  const handleDefaultSearch = () => {
    if (term != null) {
      setSearch(term);
    }
    setSearchUpdate(false);
  };
  const updatLike = (Id, type, count) => {
    let updatedPosts = [...posts];
    if (type === "Posts") {
      updatedPosts.forEach(
        (data) => {
          if (data.id === Id) {
            data.likes = count;
          }
        }
      )
    }
    setPosts(updatedPosts)
  };

  const location = useLocation();
  console.log("This is from posts Blog " + location.search);
  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get("q");

  return (
    <Router>
      {searchUpdate && handleDefaultSearch()}
      <Topbar search={search} setSearch={setSearch} />
      <Switch>
        <Route exact path="/blog">
          <Homepage posts={searchResults} updateLike={updatLike} />
        </Route>
        <Route path="/blog/posts">
          <Homepage posts={searchResults} updateLike={updatLike} />
        </Route>
        <Route path="/blog/register">
          {currentUser ? <Homepage posts={searchResults} updateLike={updatLike} /> : <Register />}
        </Route>
        <Route path="/login">
          {currentUser ? <Homepage posts={searchResults} updateLike={updatLike} /> : <Login />}
        </Route>
        <Route path="/blog/post/:id">
          <SinglePost posts={posts} handleDelete={handleDelete} />
        </Route>
        <Route path="/write">
          {currentUser ? (
            <Write posts={posts} setPosts={setPosts} />
          ) : (
            <Login />
          )}
        </Route>
        <Route path="/blog/settings">
          {currentUser ? <Settings /> : <Login />}
        </Route>
      </Switch>
    </Router>
  );
};

export default Blog;
