import "./navbar.css";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useHistory, useLocation } from "react-router-dom";
import { AiOutlineShopping } from "react-icons/ai";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { MdLogout, MdEditNote } from "react-icons/md";
import { FaStackOverflow } from "react-icons/fa";
import Authenticate from "../Authentication/Authenticate";
import { navItems } from "./NavItems";
import { useCart, useUser } from "../../store";
import { logout } from "../../api";

const Navbar = () => {
  const user = useUser();
  const cart = useCart();
  const history = useHistory();
  const location = useLocation();
  const [authTab, setAuthTab] = useState(null); // "login" | "register" | null
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close menus when navigating.
  useEffect(() => {
    setMenuOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  // Other components can request the login modal.
  useEffect(() => {
    const open = (e) => setAuthTab(e.detail || "login");
    window.addEventListener("wandra:auth", open);
    return () => window.removeEventListener("wandra:auth", open);
  }, []);

  // Close the login modal once the user is signed in.
  useEffect(() => {
    if (user) setAuthTab(null);
  }, [user]);

  useEffect(() => {
    if (!userMenu) return undefined;
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenu]);

  const handleLogout = async () => {
    await logout();
    setUserMenu(false);
    history.push("/");
  };

  const goDashboard = (tab) => history.push(`/dashboard${tab ? `?tab=${tab}` : ""}`);

  return (
    <>
      <header className="site-nav">
        <div className="container-w site-nav-inner">
          <Link to="/" className="brand" aria-label="Wandra home">
            <span className="brand-mark">W</span>
            <span className="brand-name">Wandra</span>
          </Link>

          <nav className={`nav-links${menuOpen ? " is-open" : ""}`} aria-label="Main">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                exact={item.path === "/"}
                to={item.path}
                className="nav-link"
                activeClassName="is-active"
              >
                {item.title}
              </NavLink>
            ))}
            {!user && (
              <button type="button" className="btn btn-primary nav-login-mobile" onClick={() => setAuthTab("login")}>
                Log in
              </button>
            )}
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="icon-btn nav-cart" aria-label={`Cart, ${cart.length} items`}>
              <AiOutlineShopping size={20} />
              {cart.length > 0 && <span className="nav-cart-count">{cart.length}</span>}
            </Link>

            {user ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-chip"
                  aria-haspopup="menu"
                  aria-expanded={userMenu}
                  onClick={() => setUserMenu(!userMenu)}
                >
                  <span className="avatar">{user.username.charAt(0).toUpperCase()}</span>
                  <span className="user-chip-name">{user.username}</span>
                </button>
                {userMenu && (
                  <div className="menu" role="menu">
                    <div className="menu-head">
                      <strong>{user.username}</strong>
                      <span className="muted small">{user.email}</span>
                    </div>
                    <button type="button" role="menuitem" onClick={() => goDashboard()}>
                      <CgProfile /> My profile
                    </button>
                    <button type="button" role="menuitem" onClick={() => goDashboard("bookings")}>
                      <FaStackOverflow /> My bookings
                    </button>
                    <button type="button" role="menuitem" onClick={() => history.push("/write")}>
                      <MdEditNote /> Write a post
                    </button>
                    <button type="button" role="menuitem" className="menu-danger" onClick={handleLogout}>
                      <MdLogout /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="btn btn-primary nav-login" onClick={() => setAuthTab("login")}>
                Log in
              </button>
            )}

            <button
              type="button"
              className="icon-btn nav-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {authTab && <Authenticate initialTab={authTab} onClose={() => setAuthTab(null)} />}
    </>
  );
};

export default Navbar;
