import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { BiImageAdd } from "react-icons/bi";
import { EmptyState } from "../../Layout/Shared";
import { CATEGORIES } from "../../../usePosts";
import { openAuthModal, useUser } from "../../../store";
import "../blog.css";

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

// Shrink large photos so posts fit in browser storage.
function resizeImage(file, maxWidth = 1400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Write({ setPosts }) {
  const user = useUser();
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState("");
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="container-w section">
        <div className="card">
          <EmptyState title="Log in to write a story" text="Share your trip with other travellers." onAction={() => openAuthModal("login")} actionLabel="Log in" />
        </div>
      </div>
    );
  }

  const toggleCategory = (c) =>
    setCategories((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]));

  const handleImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErrors({ ...errors, image: "Please choose an image file." });
    try {
      const data = file.size > MAX_IMAGE_BYTES ? await resizeImage(file) : await resizeImage(file, 2000);
      setImage(data);
      setErrors({ ...errors, image: "" });
    } catch (err) {
      setErrors({ ...errors, image: "We couldn't read that image. Try another one." });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!image) next.image = "Add a cover photo";
    if (title.trim().length < 5) next.title = "Give your post a title (at least 5 characters)";
    if (body.trim().length < 40) next.body = "Tell your story in at least 40 characters";
    if (categories.length === 0) next.categories = "Pick at least one category";
    setErrors(next);
    if (Object.keys(next).length) return;

    const id = Date.now();
    setPosts((posts) => [
      ...posts,
      {
        id,
        Author: user.username,
        title: title.trim(),
        body: body.trim(),
        categories,
        image,
        createdAt: new Date().toISOString(),
        likedBy: [],
      },
    ]);
    history.push(`/blog/post/${id}`);
  };

  return (
    <div className="container-w section write-page">
      <h1 className="section-title">Write a story</h1>
      <p className="section-sub">Share tips and memories from your trip.</p>
      <form className="card card-pad mt-3" onSubmit={handleSubmit} noValidate>
        <label className={`write-cover${image ? " has-image" : ""}${errors.image ? " is-invalid" : ""}`}>
          {image ? (
            <img src={image} alt="Cover preview" />
          ) : (
            <span className="write-cover-empty">
              <BiImageAdd size={36} />
              Add a cover photo
            </span>
          )}
          <input type="file" accept="image/*" onChange={handleImage} className="visually-hidden" />
        </label>
        {image && <p className="muted small mt-1">Click the photo to change it.</p>}
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
        <div className="chip-row mt-3">
          <button type="submit" className="btn btn-primary">Publish</button>
          <button type="button" className="btn btn-outline" onClick={() => history.push("/blog")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
