import React, { useEffect, useState } from "react";
import { HiOutlineX } from "react-icons/hi";

// Shows messages sent with notify() from store.js.
export default function Toast() {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const show = (e) => setNotice({ ...e.detail, key: Date.now() });
    window.addEventListener("wandra:notice", show);
    return () => window.removeEventListener("wandra:notice", show);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(t);
  }, [notice]);

  if (!notice) return null;
  return (
    <div className={`toast toast-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"} key={notice.key}>
      <span>{notice.message}</span>
      <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => setNotice(null)}>
        <HiOutlineX />
      </button>
    </div>
  );
}
