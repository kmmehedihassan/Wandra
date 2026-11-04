import React from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { formatDistanceToNow } from "date-fns";
import { useUser, openAuthModal } from "../../../store";

export function postExcerpt(body, length = 140) {
  const text = String(body || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export function timeAgo(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${formatDistanceToNow(d)} ago`;
}

export function LikeButton({ post, onToggle }) {
  const user = useUser();
  const likedBy = post.likedBy || [];
  const liked = user ? likedBy.includes(user.username) : false;
  return (
    <button
      type="button"
      className={`like-btn${liked ? " is-liked" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={(e) => {
        e.preventDefault();
        if (!user) return openAuthModal("login");
        onToggle(post.id, user.username);
      }}
    >
      {liked ? <AiFillHeart /> : <AiOutlineHeart />} {likedBy.length}
    </button>
  );
}

export default function Post({ post, onToggleLike }) {
  return (
    <article className="media-card post-card">
      <Link to={`/blog/post/${post.id}`} className="media-card-img" aria-label={post.title}>
        <img src={post.image} alt="" loading="lazy" />
      </Link>
      <div className="media-card-body">
        <div className="chip-row">
          {post.categories.map((c) => (
            <Link key={c} to={`/blog?cat=${encodeURIComponent(c)}`} className="badge">
              {c}
            </Link>
          ))}
        </div>
        <h3 className="media-card-title">
          <Link to={`/blog/post/${post.id}`} className="post-title-link">
            {post.title}
          </Link>
        </h3>
        <p className="media-card-desc">{postExcerpt(post.body)}</p>
        <div className="media-card-foot">
          <span className="muted small">
            <Link to={`/blog?author=${encodeURIComponent(post.Author)}`} className="post-author">
              {post.Author}
            </Link>{" "}
            · {timeAgo(post.createdAt)}
          </span>
          <LikeButton post={post} onToggle={onToggleLike} />
        </div>
      </div>
    </article>
  );
}
