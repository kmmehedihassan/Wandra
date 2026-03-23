import Post from "../post/Post";
import "./posts.css";
import { useLocation } from "react-router-dom";

export default function Posts({ posts, updateLike }) {
  const location = useLocation();
  console.log("This is from posts " + location.search);
  const queryParams = new URLSearchParams(location.search);
  const term = queryParams.get("username");
  const catagoryTerm = queryParams.get("cat");
  console.log(term);
  let filteredResults = [];
  if (term != null) {
    filteredResults = posts.filter((post) => post.Author.includes(term));
  } else if (catagoryTerm != null) {
    filteredResults = posts.filter((post) => {
      let op = post.catagory.some((cat) =>
        cat.categoryName.includes(catagoryTerm)
      );

      return op;
    });
  }
  return (
    <div className="posts">
      {term === null && catagoryTerm == null
        ? posts.map((post) => (
            <Post key={post.id} post={post} updateLike={updateLike} />
          ))
        : filteredResults.map((post) => (
            <Post key={post.id} post={post} updateLike={updateLike} />
          ))}
      {Object.keys(posts).length === 0 && (
        <h2 style={{ margin: "100px 250px", color: "#222" }}>
          No match found!
        </h2>
      )}
    </div>
  );
}
