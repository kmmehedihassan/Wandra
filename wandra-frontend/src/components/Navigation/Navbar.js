import "./navbar.css";
import React, { useState } from "react";
import Authenticate from "../Authentication/Authenticate";
import NavDropdown from "./NavDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { navItems } from "./NavItems";
import { Link } from "react-router-dom";
import { IconContext } from "react-icons/lib";
import { HiOutlineLogin } from "react-icons/hi";
import { RiMenu3Fill } from "react-icons/ri";
import { AiOutlineShopping } from "react-icons/ai";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import Avatar from "@mui/material/Avatar";
import { Prevent } from "./Prevent"
import { useHistory } from "react-router-dom";

const Navbar = () => {
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    console.log(modal);
    setModal(!modal);
  };

  const [dropdown, setDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const history = useHistory();

  return (
    <IconContext.Provider value={{ color: "white", size: "1rem" }}>
      <div class="navheader fixed-nav-bar">
        <div>
          <Link to="/" class="logo">
            trekker
          </Link>
        </div>

        <div class="section">
          <div class="navtop">
            <Link to={{ pathname: "https://twitter.com" }} target="_blank">
              <FaTwitter class="icn" />
            </Link>
            <Link to={{ pathname: "https://fb.com" }} target="_blank">
              <FaFacebookF class="icn" />
            </Link>
            <Link to={{ pathname: "https://instagram.com" }} target="_blank">
              <FaInstagram class="icn" />
            </Link>
            <Link to={{ pathname: "https://linkedin.com" }} target="_blank">
              <FaLinkedinIn class="icn" />
            </Link>
            {!window.localStorage.getItem("isAuthenticated") && (
              <button onClick={toggleModal} className="top-buttons">
                <HiOutlineLogin class="login-icn" />
                LOGIN
              </button>
            )}
            {window.localStorage.getItem("isAuthenticated") && (
              <Link
                to="/dashboard"
                className="top-buttons profile-link"
                onMouseEnter={() => setProfileDropdown(true)}
                onMouseLeave={() => setProfileDropdown(false)}
              >
                <Avatar
                  alt="Remy Sharp"
                  src="/images/avatar.jpg"
                  sx={{ width: 18, height: 18 }}
                />
                <div className="profile-txt">
                  {JSON.parse(window.localStorage.getItem("userdata")).username}
                </div>
                {profileDropdown && <ProfileDropdown />}
              </Link>
            )}

            {modal && (
              <div className="auth-modal">
                <div onClick={toggleModal} className="overlay"></div>
                <Authenticate />
              </div>
            )}
          </div>

          <div class="bottom">
            <div className="row main-nav">
              {navItems.map((item) => {
                if (item.title === "Blog") {
                  return (
                    <Link
                      to={item.path}
                      className="col navbar-link"
                      onMouseEnter={() => setDropdown(true)}
                      onMouseLeave={() => setDropdown(false)}
                    >
                      {item.title}
                      {dropdown && <NavDropdown />}
                    </Link>
                  );
                }
                return (
                  <div
                    className="col navbar-link"
                    onClick={Prevent(() => history.push(item.path))}
                  >
                    {item.title}
                  </div>
                );
              })}

              <Link to="/cart" className="col-1 menu">
                <AiOutlineShopping size="1.4rem" color="#303030" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </IconContext.Provider>
  );
};

export default Navbar;
