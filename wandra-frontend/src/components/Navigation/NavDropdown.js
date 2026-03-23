import { useHistory } from "react-router-dom";
import "./navDropdown.css";
import { BiMessageSquareAdd } from "react-icons/bi";
import { MdOutlineManageSearch, MdEditNote } from "react-icons/md";
import { Prevent } from "./Prevent"
import Blog from "../Blog/Blog"
import Write from "../Blog/write/Write";
import { useState, useEffect } from "react";
// import { posts, setPosts } from "../Blog/Blog"
import { Link } from "react-router-dom";
function NavDropdown() {
  const options = ["Browse", "Write"];
  const [postData, setPostData] = useState([]);
  const childToParent = (childdata) => {
    setPostData(childdata);
    postData.forEach(post => console.log(post))
  }
  const history = useHistory();

  const handleRouteBlogWrite = () => {
    // history.push("/write");
    // <Link to="/write" className="col navbar-link">
    //   <Blog />
    //   {/* <Write posts={postData} setPosts={setPostData} /> */}
    // </Link>
    history.push("/write")
  };

  const handleRouteBlog = () => {
    history.push("/blog");

  };

  return (
    <div className="nav-dropdown">
      <div className="nav-dropdown-content">
        {options.map((option) => (
          <div className="nav-dropdown-item">
            {option === "Write" && (
              <button
                className="nav-dropdown-btn"
                onClick={Prevent(() => handleRouteBlogWrite())}
              >
                <MdEditNote size="1.8rem" color="#EC407A" id="nav-drop-icn" />
                {option}
              </button>
            )}
            {option === "Browse" && (
              <button
                className="nav-dropdown-btn"
                onClick={Prevent(() => handleRouteBlog())}
              >
                <MdOutlineManageSearch
                  size="1.7rem"
                  color="#26A69A"
                  id="nav-drop-icn"
                />
                {option}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavDropdown;
