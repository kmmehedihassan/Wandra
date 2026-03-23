import { Link } from "react-router-dom";
import "./topbar.css";
import { FaSearch } from "react-icons/fa";

export default function Topbar({ search, setSearch }) {
  const user = true;
  return (
    <div className="top">
      <div className="topLeft">
        <i className="topIcon fab fa-facebook-square"></i>
        <i className="topIcon fab fa-instagram-square"></i>
        <i className="topIcon fab fa-pinterest-square"></i>
        <i className="topIcon fab fa-twitter-square"></i>
      </div>
      {/* <div className="topCenter">
        <ul className="topList">
          <li className="topListItem">
            <Link className="link" to="/blog">
              HOME
            </Link>
          </li>
          <li className="topListItem">
            <Link className="link" to="/write">
              WRITE
            </Link>
          </li>
        </ul>
      </div> */}
      <div className="topRight">
        {/* {user ? (
          <Link className="link" to="/settings">
            <img
              className="topImg"
              src="https://ggsc.s3.amazonaws.com/images/uploads/The_Science-Backed_Benefits_of_Being_a_Dog_Owner.jpg"
              alt=""
            />
          </Link>
        ) : (
          <ul className="topList">
            <li className="topListItem">
              <Link className="link" to="/login">
                LOGIN
              </Link>
            </li>
            <li className="topListItem">
              <Link className="link" to="/register">
                REGISTER
              </Link>
            </li>
          </ul>
        )} */}


        <FaSearch className="topSearchIcon" />
        <form className="searchForm" onSubmit={(e) => e.preventDefault()}>
          {/* <label htmlFor="search">Search Posts</label> */}
          <input
            id="search"
            type="text"
            placeholder="Search Posts"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              console.log(search);
            }}
          />
        </form>
      </div>
    </div>
  );
}
