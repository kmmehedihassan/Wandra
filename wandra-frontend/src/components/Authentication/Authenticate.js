import React, { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "../Layout/Shared";
import { HiOutlineX } from "react-icons/hi";
import Signup from "./Signup";
import Signin from "./Signin";
import ForgotPassword from "./ForgotPassword";

const COPY = {
  login: { title: "Welcome back", text: "Log in to book tours and hotels, and manage your trips." },
  register: { title: "Create your account", text: "Join Wandra to book trips and share your travel stories." },
  forgot: { title: "Reset your password" },
};

// Login / register / forgot-password modal. `initialTab` is one of the COPY keys.
const Authenticate = ({ initialTab = "login", onClose }) => {
  const [tab, setTab] = useState(COPY[initialTab] ? initialTab : "login");
  const cardRef = useRef(null);
  useFocusTrap(cardRef, true);

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
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={COPY[tab].title} ref={cardRef}>
        <button type="button" className="icon-btn modal-close" aria-label="Close" onClick={onClose}>
          <HiOutlineX size={18} />
        </button>
        <h2 className="card-title">{COPY[tab].title}</h2>

        {tab === "forgot" ? (
          <ForgotPassword onBack={() => setTab("login")} />
        ) : (
          <>
            <p className="muted small mt-0">{COPY[tab].text}</p>
            <div className="tabs" role="tablist">
              {["login", "register"].map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={`tab${tab === key ? " is-active" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {key === "login" ? "Log in" : "Register"}
                </button>
              ))}
            </div>
            {tab === "login" ? <Signin onForgot={() => setTab("forgot")} /> : <Signup />}
          </>
        )}
      </div>
    </div>
  );
};

export default Authenticate;
