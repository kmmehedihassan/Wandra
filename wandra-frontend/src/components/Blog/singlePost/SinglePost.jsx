import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import Error from "../../../pages/Error";
import { LikeButton, timeAgo } from "../post/Post";
import Comments from "../comments/Comments";
import { Img } from "../../Layout/Shared";
import { formatDate, notify } from "../../../store";
import "../blog.css";

export default function SinglePost({ blog }) {
  const { posts, loading, deletePost, toggleLike, adjustComments } = blog;
  const { id } = useParams();
  const history = useHistory();
  const [deleting, setDeleting] = useState(false);
  const post = posts.find((p) => String(p.id) === id);

  if (loading) {
    return (
      <div className="container-w section single-post">
        <div className="skeleton" style={{ height: 48 }} />
        <div className="skeleton" style={{ height: 360 }} />
      </div>
    );
  }
  if (!post) return <Error />;

  const handleDelete = async () => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      notify("Post deleted.", "success");
      history.push("/blog");
    } catch (err) {
      notify(err.message, "error");
      setDeleting(false);
    }
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
          <Link to={`/blog?author=${encodeURIComponent(post.author)}`} className="post-author">
            {post.author}
          </Link>{" "}
          · {formatDate(post.createdAt)} ({timeAgo(post.createdAt)})
        </span>
        <div className="chip-row" style={{ alignItems: "center" }}>
          <LikeButton post={post} onToggle={toggleLike} />
          {post.canEdit && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              <AiOutlineDelete /> {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
      <Img className="single-post-img" src={post.image} sizes="(max-width: 860px) 100vw, 820px" eager />
      <div className="single-post-body">
        {post.body.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <Comments postId={post.id} onCountChange={(delta) => adjustComments(post.id, delta)} />
      <div className="mt-4">
        <Link to="/blog" className="btn btn-outline">← Back to all posts</Link>
      </div>
    </article>
  );
}
