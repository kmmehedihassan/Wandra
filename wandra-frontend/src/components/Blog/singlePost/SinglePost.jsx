import React from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import Error from "../../../pages/Error";
import { LikeButton, timeAgo } from "../post/Post";
import { toggleLike } from "../Blog";
import { formatDate, useUser } from "../../../store";
import "../blog.css";

export default function SinglePost({ posts, setPosts }) {
  const { id } = useParams();
  const history = useHistory();
  const user = useUser();
  const post = posts.find((p) => String(p.id) === id);
  if (!post) return <Error />;

  const canDelete = user && user.username === post.Author;

  const handleDelete = () => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setPosts((list) => list.filter((p) => p.id !== post.id));
    history.push("/blog");
  };

  return (
    <article className="container-w section single-post">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/blog">Blog</Link> <span>/</span> {post.title}
      </nav>
      <div className="chip-row">
        {post.categories.map((c) => (
          <Link key={c} to={`/blog?cat=${encodeURIComponent(c)}`} className="badge">
            {c}
          </Link>
        ))}
      </div>
      <h1 className="single-post-title">{post.title}</h1>
      <div className="row-between single-post-meta">
        <span className="muted">
          By{" "}
          <Link to={`/blog?author=${encodeURIComponent(post.Author)}`} className="post-author">
            {post.Author}
          </Link>{" "}
          · {formatDate(post.createdAt)} ({timeAgo(post.createdAt)})
        </span>
        <div className="chip-row" style={{ alignItems: "center" }}>
          <LikeButton post={post} onToggle={toggleLike(setPosts)} />
          {canDelete && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
              <AiOutlineDelete /> Delete
            </button>
          )}
        </div>
      </div>
      <img className="single-post-img" src={post.image} alt="" />
      <div className="single-post-body">
        {post.body.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <div className="mt-4">
        <Link to="/blog" className="btn btn-outline">← Back to all posts</Link>
      </div>
    </article>
  );
}
