import React from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { MdEditNote } from "react-icons/md";
import Post from "./post/Post";
import { PageHero, EmptyState } from "../Layout/Shared";
import { CATEGORIES } from "../../usePosts";
import "./blog.css";

const Blog = ({ blog }) => {
  const { posts, loading, error, reload, toggleLike } = blog;
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  const cat = params.get("cat") || "";
  const author = params.get("author") || "";

  const setParam = (key, value) => {
    const next = new URLSearchParams(location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    history.replace(`/blog${qs ? `?${qs}` : ""}`);
  };

  const term = q.trim().toLowerCase();
  const results = posts
    .filter((p) => !cat || p.categories.includes(cat))
    .filter((p) => !author || p.author === author)
    .filter((p) => !term || `${p.title} ${p.body} ${p.author}`.toLowerCase().includes(term));

  return (
    <>
      <PageHero
        eyebrow="Wandra blog"
        title="Travel stories"
        subtitle="Tips, itineraries and stories from travellers exploring Bangladesh."
        image="/images/four.jpg"
      >
        <Link to="/write" className="btn btn-primary mt-2">
          <MdEditNote size={20} /> Write a story
        </Link>
      </PageHero>
      <div className="container-w section">
        <h2 className="visually-hidden">Latest stories</h2>
        <div className="section-head">
          <div className="chip-row">
            <button type="button" className={`chip${!cat ? " is-active" : ""}`} onClick={() => setParam("cat", "")}>
              All
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={`chip${cat === c ? " is-active" : ""}`} onClick={() => setParam("cat", c)}>
                {c}
              </button>
            ))}
          </div>
          <label className="input-icon blog-search">
            <BiSearch />
            <span className="visually-hidden">Search posts</span>
            <input className="input" placeholder="Search posts" value={q} onChange={(e) => setParam("q", e.target.value)} />
          </label>
        </div>
        {author && (
          <p className="muted">
            Posts by <strong>{author}</strong> ·{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setParam("author", "")}>
              Show everyone
            </button>
          </p>
        )}
        {loading ? (
          <div className="grid-cards blog-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 360, marginTop: 0 }} />
            ))}
          </div>
        ) : error && posts.length === 0 ? (
          <EmptyState title="We couldn't load the blog" text={error} onAction={reload} actionLabel="Try again" />
        ) : results.length === 0 ? (
          <EmptyState title="No posts found" text="Try another search or category." actionTo="/blog" actionLabel="See all posts" />
        ) : (
          <div className="grid-cards blog-grid">
            {results.map((post) => (
              <Post key={post.id} post={post} onToggleLike={toggleLike} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Blog;
