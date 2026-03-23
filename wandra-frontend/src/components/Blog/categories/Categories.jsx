import React from "react";
import { Link } from "react-router-dom";
import "./categories.css"
export default function Categories({ catagory }) {
  return (
    <span className="postCat">
      <Link className="link" to={`/blog/posts?cat=${catagory}`}>
        {/* to="/posts?cat=Music"> */}
        {catagory}
      </Link>
    </span>
  );
}
