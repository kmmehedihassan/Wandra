import React, { useState } from "react";
import { API_BASE, errorMessage, saveSession } from "../../api";
import "./login.css";
import { BsEye } from "react-icons/bs";

const Signin = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  

  async function fetchData() {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
        }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError({ loginError: errorMessage(data, "Login Unsuccessful. Try Again!") });
        setFormSubmission(false);
        return;
      }
      saveSession(data);
      setFormSubmission(true);
      window.location.reload();
    } catch (e) {
      setError({ loginError: "Could not reach the server. Try again later." });
      setFormSubmission(false);
    }
  }

  const [visibility, setVisibility] = useState({
    password: false,
  });

  const [formSubmission, setFormSubmission] = useState(false);

  const [error, setError] = useState({
    usernameError: "",
    passwordError: "",
    loginError: ""
  });

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUserData({ ...userData, [name]: value });
    return;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formFields = ["username", "password"];
    let isValid = true;
    formFields.forEach((field) => {
      isValid = validateField(field) && isValid;
    });
    if (isValid) fetchData();
    return formSubmission;
  };

  const handleBlur = (e) => {
    const name = e.target.name;
    validateField(name);
    return;
  };

  const toggleVisibility = () => {
    if (visibility.password === true)
      setVisibility({
        password: false,
      });
    else
      setVisibility({
        password: true,
      });
  };

  const validateField = (name) => {
    let isValid = false;
    if (name === "username") isValid = validateUserName();
    else if (name === "password") isValid = validatePassword();
    return isValid;
  };

  const validateUserName = () => {
    let userNameError = "";
    const value = userData.username;
    if (value.trim() === "") userNameError = "User Name is required";
    setError({ usernameError: userNameError });
    return userNameError === "";
  };

  const validatePassword = () => {
    let passError = "";
    const value = userData.password;
    if (value.trim() === "") passError = "Password is required";
    setError({ passwordError: passError });
    return passError === "";
  };

  return (
    <>
      {formSubmission ? (
        <div className="details">
          <h2>Login Successful!</h2>
          <div>User Name: {userData.username}</div>
          <div>Email Address: {userData.email}</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="User Name"
              name="username"
              id="reg-user"
              value={userData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />
            {error.usernameError && (
              <div className="errorMsg">{error.usernameError}</div>
            )}
            <div id="pass-wrapper">
              <input
                type={visibility.password ? "text" : "password"}
                placeholder="Password"
                name="password"
                id="reg-pass"
                value={userData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              <span id="icn-eye" onClick={toggleVisibility}>
                {visibility.password === true && (
                  <BsEye color="#ff681a" size="1rem" />
                )}
                {visibility.password === false && (
                  <BsEye color="black" size="1rem" />
                )}
              </span>
            </div>
            {error.passwordError && (
              <div className="errorMsg">{error.passwordError}</div>
            )}
            {error.loginError && (
              <div className="errorMsg">{error.loginError}</div>
            )}
            <button className="btn-reg" type="submit">
              Login
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Signin;
