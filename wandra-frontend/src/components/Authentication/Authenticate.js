import React, { useEffect, useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import Signup from "./Signup";
import Signin from "./Signin";

const Authenticate = ({ initialTab = "login", onClose }) => {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Log in or register">
        <button type="button" className="icon-btn modal-close" aria-label="Close" onClick={onClose}>
          <HiOutlineX size={18} />
        </button>
        <h2 className="card-title">{tab === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted small mt-0">
          {tab === "login"
            ? "Log in to book tours and hotels, and manage your trips."
            : "Join Wandra to book trips and share your travel stories."}
        </p>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "login"} className={`tab${tab === "login" ? " is-active" : ""}`} onClick={() => setTab("login")}>
            Log in
          </button>
          <button type="button" role="tab" aria-selected={tab === "register"} className={`tab${tab === "register" ? " is-active" : ""}`} onClick={() => setTab("register")}>
            Register
          </button>
        </div>
        {tab === "login" ? <Signin /> : <Signup />}
      </div>
    </div>
  );
};

export default Authenticate;
