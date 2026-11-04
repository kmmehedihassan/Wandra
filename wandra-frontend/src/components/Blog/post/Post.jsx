import React from "react";
import { Link } from "react-router-dom";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BiComment } from "react-icons/bi";
import { formatDistanceToNow } from "date-fns";
import { useUser, openAuthModal } from "../../../store";
import { Img } from "../../Layout/Shared";

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
  const liked = Boolean(user && post.liked);
  return (
    <button
      type="button"
      className={`like-btn${liked ? " is-liked" : ""}`}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={(e) => {
        e.preventDefault();
        if (!user) return openAuthModal("login");
        onToggle(post);
      }}
    >
      {liked ? <AiFillHeart /> : <AiOutlineHeart />} {post.likes}
    </button>
  );
}

export default function Post({ post, onToggleLike }) {
  return (
    <article className="media-card post-card">
      <Link to={`/blog/post/${post.id}`} className="media-card-img" aria-label={post.title}>
        <Img src={post.image} />
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
            <Link to={`/blog?author=${encodeURIComponent(post.author)}`} className="post-author">
              {post.author}
            </Link>{" "}
            · {timeAgo(post.createdAt)}
          </span>
          <span className="post-stats">
            <Link to={`/blog/post/${post.id}#comments-title`} className="comment-count" aria-label={`${post.comments || 0} comments`}>
              <BiComment /> {post.comments || 0}
            </Link>
            <LikeButton post={post} onToggle={onToggleLike} />
          </span>
        </div>
      </div>
    </article>
  );
}
