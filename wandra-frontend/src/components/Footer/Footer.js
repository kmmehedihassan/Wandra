import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import "./footer.css";

const socials = [
  { href: "https://twitter.com", label: "Twitter", Icon: FaTwitter },
  { href: "https://facebook.com", label: "Facebook", Icon: FaFacebookF },
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedinIn },
];

const Footer = () => (
  <footer className="site-footer">
    <div className="container-w footer-grid">
      <div>
        <Link to="/" className="brand footer-brand">
          <span className="brand-mark">W</span>
          <span className="brand-name">Wandra</span>
        </Link>
        <p className="footer-text">
          Discover Bangladesh — from the coral beaches of St. Martin's to the tea gardens of Srimangal.
          Book tours and hotels in one place.
        </p>
        <div className="footer-socials">
          {socials.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div>
        <h4>Explore</h4>
        <Link to="/destinations">Destinations</Link>
        <Link to="/tours">Tours</Link>
        <Link to="/hotels">Hotels</Link>
        <Link to="/blog">Travel blog</Link>
      </div>
      <div>
        <h4>Account</h4>
        <Link to="/dashboard">My profile</Link>
        <Link to="/dashboard?tab=bookings">My bookings</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/write">Write a post</Link>
      </div>
    </div>
    <div className="container-w footer-bottom">© {new Date().getFullYear()} Wandra. All rights reserved.</div>
  </footer>
);

export default Footer;
