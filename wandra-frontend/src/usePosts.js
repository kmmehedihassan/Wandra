// Blog posts, loaded from and saved to the backend (/api/posts/).
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api";
import { notify, uploadImage, useUser } from "./store";

export const CATEGORIES = ["Beach", "Nature", "Culture", "Adventure", "Food", "Tips"];

export function usePosts() {
  const user = useUser();
  const username = user ? user.username : null;
  const [posts, setPosts] = useState(null); // null while loading
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setPosts(await apiFetch("/api/posts/"));
      setError("");
    } catch (err) {
      setError(err.message);
      setPosts((current) => current || []);
    }
  }, []);

  // Reload when the user changes so "liked" and "can edit" are correct.
  useEffect(() => {
    load();
  }, [load, username]);

  const createPost = useCallback(async ({ title, body, categories, imageFile }) => {
    const image = await uploadImage(imageFile);
    const post = await apiFetch("/api/posts/", {
      method: "POST",
      body: { title, body, categories, image_id: image.id },
    });
    setPosts((current) => [post, ...(current || [])]);
    return post;
  }, []);

  const deletePost = useCallback(async (id) => {
    await apiFetch(`/api/posts/${id}/`, { method: "DELETE" });
    setPosts((current) => (current || []).filter((p) => p.id !== id));
  }, []);

  const patch = (id, changes) =>
    setPosts((current) => (current || []).map((p) => (p.id === id ? { ...p, ...changes } : p)));

  // Optimistic like/unlike; rolls back if the server refuses.
  const toggleLike = useCallback(async (post) => {
    const liked = !post.liked;
    patch(post.id, { liked, likes: post.likes + (liked ? 1 : -1) });
    try {
      const result = await apiFetch(`/api/posts/${post.id}/like/`, { method: liked ? "POST" : "DELETE" });
      patch(post.id, result);
    } catch (err) {
      patch(post.id, { liked: post.liked, likes: post.likes });
      notify(err.message, "error");
    }
  }, []);

  const adjustComments = useCallback((id, delta) => {
    setPosts((current) => (current || []).map((p) => (p.id === id ? { ...p, comments: Math.max(0, (p.comments || 0) + delta) } : p)));
  }, []);

  return { posts: posts || [], loading: posts === null, error, reload: load, createPost, deletePost, toggleLike, adjustComments };
}
