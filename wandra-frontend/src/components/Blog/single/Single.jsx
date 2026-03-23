import Sidebar from "../sidebar/Sidebar";
import SinglePost from "../singlePost/SinglePost";
import "./single.css";

export default function Single({ posts }) {
  return (
    <div className="single">
      <div className="header">
        <div className="headerTitles">
          <span className="headerTitleSm">React & Node</span>
          <span className="headerTitleLg">BLOG</span>
        </div>
      </div>
      <div className="newSingle">
        <SinglePost posts={posts} />
        <Sidebar />
      </div>
    </div>
  );
}
