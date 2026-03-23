import { useLocation } from "react-router";
import Header from "../header/Header";
import Posts from "../posts/Posts";
import Sidebar from "../sidebar/Sidebar";
import "./homepage.css";

export default function Homepage({ posts, updateLike }) {
  const location = useLocation();
  console.log(location);
  return (
    <>
      <Header />
      <div className="home">
        <Posts posts={posts} updateLike={updateLike} />
        <Sidebar />
      </div>
    </>
  );
}
