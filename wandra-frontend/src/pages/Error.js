import React from "react";
import { Link } from "react-router-dom";

const Error = () => (
  <section className="container-w section" style={{ textAlign: "center", padding: "96px 16px" }}>
    <span className="eyebrow">Error 404</span>
    <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>This trail doesn't exist</h1>
    <p className="muted">The page you're looking for was moved or never existed.</p>
    <div className="chip-row" style={{ justifyContent: "center", marginTop: 24 }}>
      <Link to="/" className="btn btn-primary">Back to home</Link>
      <Link to="/tours" className="btn btn-outline">Browse tours</Link>
    </div>
  </section>
);

export default Error;
