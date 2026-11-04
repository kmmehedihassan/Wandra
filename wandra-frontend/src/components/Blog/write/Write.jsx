import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { BiImageAdd } from "react-icons/bi";
import { EmptyState } from "../../Layout/Shared";
import { CATEGORIES } from "../../../usePosts";
import { notify, openAuthModal, useUser } from "../../../store";
import "../blog.css";

export default function Write({ blog }) {
  const user = useUser();
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [publishing, setPublishing] = useState(false);

  // Free the preview URL when the image changes or the page closes.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  if (!user) {
    return (
      <div className="container-w section">
        <div className="card">
          <EmptyState title="Log in to write a story" headingLevel={1} text="Share your trip with other travellers." onAction={() => openAuthModal("login")} actionLabel="Log in" />
        </div>
      </div>
    );
  }

  const toggleCategory = (c) =>
    setCategories((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors({ ...errors, image: "Please choose an image file." });
    if (file.size > 15 * 1024 * 1024) return setErrors({ ...errors, image: "Please choose an image under 15 MB." });
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!imageFile) next.image = "Add a cover photo";
    if (title.trim().length < 5) next.title = "Give your post a title (at least 5 characters)";
    if (body.trim().length < 40) next.body = "Tell your story in at least 40 characters";
    if (categories.length === 0) next.categories = "Pick at least one category";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPublishing(true);
    try {
      const post = await blog.createPost({ title: title.trim(), body: body.trim(), categories, imageFile });
      notify("Your story is live!", "success");
      history.push(`/blog/post/${post.id}`);
    } catch (err) {
      setErrors({ form: err.message });
      setPublishing(false);
    }
  };

  return (
    <div className="container-w section write-page">
      <h1 className="section-title">Write a story</h1>
      <p className="section-sub">Share tips and memories from your trip.</p>
      <form className="card card-pad mt-3" onSubmit={handleSubmit} noValidate>
        <label className={`write-cover${preview ? " has-image" : ""}${errors.image ? " is-invalid" : ""}`}>
          {preview ? (
            <img src={preview} alt="Cover preview" />
          ) : (
            <span className="write-cover-empty">
              <BiImageAdd size={36} />
              Add a cover photo
            </span>
          )}
          <input type="file" accept="image/*" onChange={handleImage} className="visually-hidden" />
        </label>
        {preview && <p className="muted small mt-1">Click the photo to change it.</p>}
        {errors.image && <span className="field-error">{errors.image}</span>}

        <div className="field mt-3">
          <label className="field-label" htmlFor="post-title">Title</label>
          <input id="post-title" className={`input${errors.title ? " is-invalid" : ""}`} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>
        <div className="field">
          <span className="field-label">Categories</span>
          <div className="chip-row">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={`chip${categories.includes(c) ? " is-active" : ""}`} aria-pressed={categories.includes(c)} onClick={() => toggleCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          {errors.categories && <span className="field-error">{errors.categories}</span>}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="post-body">Your story</label>
          <textarea id="post-body" className={`textarea${errors.body ? " is-invalid" : ""}`} rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Where did you go? What should other travellers know?" />
          <span className="muted small">Leave a blank line between paragraphs.</span>
          {errors.body && <span className="field-error">{errors.body}</span>}
        </div>
        {errors.form && <div className="alert alert-error mt-2" role="alert">{errors.form}</div>}
        <div className="chip-row mt-3">
          <button type="submit" className="btn btn-primary" disabled={publishing}>
            {publishing ? "Publishing…" : "Publish"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => history.push("/blog")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
