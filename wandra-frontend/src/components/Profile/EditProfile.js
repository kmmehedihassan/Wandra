import React, { useState, useEffect } from "react";
import "./viewProfile.css";
import "./editProfile.css";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    phone: "",
    address: "",
    email: "",
    oldpassword: "",
    newpassword: ""
  });

  // const [items, setItems] = useState([]);

  useEffect(() => {
    const formdata = JSON.parse(localStorage.getItem("formData"));
    if (formdata) {
      setFormData(formdata);
    }
  }, []);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
    return;
  };

  const handleSubmit = () => {
      console.log("after save change: ", formData);
      let obj = JSON.stringify({
        firstname: formData.firstname,
        lastname: formData.lastname,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        oldpassword: formData.oldpassword,
        newpassword: formData.newpassword,
      });
      window.localStorage.setItem("formData", obj);

    //   const formdata = JSON.parse(window.localStorage.getItem("formData"));
    //   localStorage.setItem(
    //     "userInfo",
    //     JSON.stringify({ ...formdata, firstname: formData.firstname })
    //   );
  };

  return (
    <div className="edit-profile-container">
      <label className="view-prof-title">EDIT PROFILE</label>

      <label className="info-title">BASIC INFORMATION</label>

      <input
        className="info-row"
        type="text"
        placeholder="First Name"
        name="firstname"
        value={formData.firstname}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        className="info-row"
        type="text"
        placeholder="Last Name"
        name="lastname"
        value={formData.lastname}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        className="info-row"
        type="text"
        placeholder="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        autoComplete="off"
      />

      <label className="info-title">CONTACT INFORMATION</label>

      <input
        className="info-row"
        type="tel"
        placeholder="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        className="info-row"
        type="text"
        placeholder="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        className="info-row"
        type="email"
        placeholder="E-mail"
        name="email"
        value={formData.email}
        onChange={handleChange}
        autoComplete="off"
      />

      <label className="info-title">SECURITY INFORMATION</label>
      <input
        className="info-row"
        type="password"
        placeholder="Old Password"
        name="oldpassword"
        value={formData.oldpassword}
        onChange={handleChange}
        autoComplete="off"
      />
      <input
        className="info-row"
        type="password"
        placeholder="New Password (optional)"
        name="newpassword"
        value={formData.newpassword}
        onChange={handleChange}
        autoComplete="off"
      />
      <div className="save-changes-section">
        <button className="save-changes-btn" onClick={handleSubmit}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
