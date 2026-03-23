import { Link } from "react-router-dom";
import "./post.css";
import Categories from "../categories/Categories";
import { FaInstagramSquare, FaFacebookSquare, FaComment } from "react-icons/fa";
import { AiFillLike } from "react-icons/ai";

export default function Post({ img, vid, post, updateLike }) {
  const refreshPage = () => {
    upLike();
  };
  let upLike = () => {
    post.like++;
    updateLike(post.id, "Posts", post.likes);
    // window.location.reload();
    console.log("Up Like " + post.id + " " + post.likes++);
  };
  return (
    <div className="post">
      {post.imgLink === true ? (
        <img className="postImg" src={post.imgOrVideoLink} alt="" />
      ) : (
        <video className="postImg" controls>
          <source src={post.imgOrVideoLink} type="video/mp4" />
        </video>
      )}

      <div className="postInfo">
        <div id="datePost">
          <p id="square">
            {post.date} {post.month}
          </p>
        </div>
        <div className="postInfoAll">
          <div className="postCats">
            {post.catagory.map((cat) => {
              return <Categories catagory={cat.categoryName} />;
            })}
          </div>
          {/* <span className="postCat">
              <Link className="postlink" to="/blog/posts?cat=Music">
                Music
              </Link>
            </span>
            <span className="postCat">
              <Link className="postlink" to="/blog/posts?cat=Music">
                Life
              </Link>
            </span>
          </div> */}
          <span className="postTitle">
            <Link to={`/blog/post/${post.id}`} className="postlink">
              <p>{post.title}</p>
            </Link>
          </span>
          <hr />
          <span className="postDate">1 hour ago</span>
          <p className="postDesc">{post.body}</p>
          <div className="IconsInPost">
            <p className="LeftSideIcon">
              <AiFillLike className="PostIcon" onClick={refreshPage} />
              {post.likes}
              <FaComment className="PostIcon2" />
              {post.comments}{" "}
            </p>

            <p className="RightSideIcon">
              <FaFacebookSquare className="topIcon" />
              <FaInstagramSquare className="topIcon" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
