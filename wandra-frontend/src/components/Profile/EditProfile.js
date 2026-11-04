import React, { useState } from "react";
import { localISODate, saveProfile } from "../../store";

const EditProfile = ({ profile, onSaved }) => {
  const [form, setForm] = useState({
    firstname: profile.firstname || "",
    lastname: profile.lastname || "",
    gender: profile.gender || "",
    birthday: profile.birthday || "",
    phone: profile.phone || "",
    address: profile.address || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone.trim())) next.phone = "Enter a valid phone number";
    if (form.birthday && form.birthday > localISODate(0)) next.birthday = "Birthday can't be in the future";
    setErrors(next);
    if (Object.keys(next).length) return;
    const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    saveProfile({ ...profile, ...trimmed });
    onSaved();
  };

  const input = (name, label, props = {}) => (
    <div className="field">
      <label className="field-label" htmlFor={`profile-${name}`}>{label}</label>
      <input
        id={`profile-${name}`}
        name={name}
        className={`input${errors[name] ? " is-invalid" : ""}`}
        value={form[name]}
        onChange={handleChange}
        {...props}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="card-title">Edit profile</h1>
      <div className="field-row">
        {input("firstname", "First name", { autoComplete: "given-name" })}
        {input("lastname", "Last name", { autoComplete: "family-name" })}
      </div>
      <div className="field-row mt-2">
        <div className="field">
          <label className="field-label" htmlFor="profile-gender">Gender</label>
          <select id="profile-gender" name="gender" className="select" value={form.gender} onChange={handleChange}>
            <option value="">Prefer not to say</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>
        {input("birthday", "Birthday", { type: "date", max: localISODate(0) })}
      </div>
      <div className="mt-2">{input("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+880 1XXX XXXXXX" })}</div>
      <div className="mt-2">{input("address", "Address", { autoComplete: "street-address" })}</div>
      <div className="chip-row mt-3">
        <button type="submit" className="btn btn-primary">Save changes</button>
        <button type="button" className="btn btn-outline" onClick={onSaved}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProfile;
