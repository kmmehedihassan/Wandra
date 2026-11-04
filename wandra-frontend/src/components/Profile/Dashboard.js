import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { BiEdit } from "react-icons/bi";
import { FaStackOverflow } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import ViewProfile from "./ViewProfile";
import EditProfile from "./EditProfile";
import MyBookings from "./MyBookings";
import ChangePassword from "./ChangePassword";
import SavedItems from "./SavedItems";
import { AiOutlineHeart } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { EmptyState } from "../Layout/Shared";
import { notify, openAuthModal, saveProfile, uploadImage, useProfile, useProfileLoaded, useUser } from "../../store";
import { logout } from "../../api";
import "./dashboard.css";

const TABS = [
  { key: "profile", label: "My profile", Icon: CgProfile },
  { key: "edit", label: "Edit profile", Icon: BiEdit },
  { key: "bookings", label: "My bookings", Icon: FaStackOverflow },
  { key: "saved", label: "Saved", Icon: AiOutlineHeart },
  { key: "password", label: "Password", Icon: RiLockPasswordLine },
];

export default function Dashboard() {
  const user = useUser();
  const profile = useProfile();
  const profileLoaded = useProfileLoaded();
  const [uploading, setUploading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get("tab") || "profile";
  const active = TABS.some((t) => t.key === tab) ? tab : "profile";

  if (!user) {
    return (
      <div className="container-w section">
        <div className="card">
          <EmptyState
            title="Log in to see your dashboard"
            text="Your profile and bookings are available once you're signed in."
            onAction={() => openAuthModal("login")}
            actionLabel="Log in"
          />
        </div>
      </div>
    );
  }

  const go = (key) => history.push(key === "profile" ? "/dashboard" : `/dashboard?tab=${key}`);

  const handleAvatar = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const image = await uploadImage(file);
      await saveProfile({ avatar_id: image.id });
      notify("Profile photo updated.", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    history.push("/");
  };

  const displayName = [profile.firstname, profile.lastname].filter(Boolean).join(" ") || user.username;

  return (
    <div className="container-w section">
      <div className="dash-layout">
        <aside className="card card-pad dash-side">
          <div className="dash-user">
            {profile.avatar ? (
              <img className="dash-avatar" src={profile.avatar} alt="" />
            ) : (
              <span className="dash-avatar dash-avatar-letter">{user.username.charAt(0).toUpperCase()}</span>
            )}
            <div style={{ minWidth: 0 }}>
              <strong className="dash-name">{displayName}</strong>
              <span className="muted small dash-email">{user.email}</span>
            </div>
          </div>
          <label className={`btn btn-outline btn-sm btn-block mt-2${uploading ? " is-busy" : ""}`} aria-disabled={uploading}>
            {uploading ? "Uploading…" : profile.avatar ? "Change photo" : "Add a photo"}
            <input type="file" accept="image/*" onChange={handleAvatar} className="visually-hidden" disabled={uploading} />
          </label>
          <nav className="dash-nav mt-2" aria-label="Dashboard">
            {TABS.map(({ key, label, Icon }) => (
              <button key={key} type="button" className={`dash-nav-item${active === key ? " is-active" : ""}`} onClick={() => go(key)}>
                <Icon /> {label}
              </button>
            ))}
            <button type="button" className="dash-nav-item dash-logout" onClick={handleLogout}>
              <MdLogout /> Log out
            </button>
          </nav>
        </aside>

        <section className="card card-pad dash-main">
          {!profileLoaded && (active === "profile" || active === "edit") ? (
            <>
              <div className="skeleton" />
              <div className="skeleton" />
            </>
          ) : (
            <>
              {active === "profile" && <ViewProfile user={user} profile={profile} onEdit={() => go("edit")} />}
              {active === "edit" && <EditProfile profile={profile} onSaved={() => go("profile")} />}
            </>
          )}
          {active === "bookings" && <MyBookings />}
          {active === "saved" && <SavedItems />}
          {active === "password" && <ChangePassword />}
        </section>
      </div>
    </div>
  );
}
