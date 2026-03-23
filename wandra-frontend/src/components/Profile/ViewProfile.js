import React from "react";
import "./viewProfile.css"


const ViewProfile = () => {
  return (
    <div className="view-profile-container">
      {/* <h2>
        Name: {JSON.parse(window.localStorage.getItem("userdata")).username}
      </h2>
      <h2>
        Email: {JSON.parse(window.localStorage.getItem("userdata")).useremail}
      </h2> */}
      <label className="view-prof-title">MY PROFILE</label>

      <label className="info-title">BASIC INFORMATION</label>
      
      <label className="info-row">
        <span className="info-attribute">First Name:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).firstname}
        </span>
      </label>
      <label className="info-row">
        <span className="info-attribute">Last Name:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).lastname}
        </span>
      </label>
      <label className="info-row">
        <span className="info-attribute">Gender:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).gender}
        </span>
      </label>
      <label className="info-title">CONTACT INFORMATION</label>

      <label className="info-row">
        <span className="info-attribute">Phone:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).phone}
        </span>
      </label>
      <label className="info-row">
        <span className="info-attribute">Address:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).address}
        </span>
      </label>
      <label className="info-row">
        <span className="info-attribute">E-mail:</span>
        <span className="info-value">
          {window.localStorage.getItem("formData") &&
            JSON.parse(window.localStorage.getItem("formData")).email}
        </span>
      </label>
    </div>
  );
};

export default ViewProfile;
