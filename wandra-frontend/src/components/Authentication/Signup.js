import React, { useState, useEffect } from "react";
import "./register.css";
import { BsEye, BsRainbow } from "react-icons/bs";
import axios from "axios";

const emailValidator =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const passwordValidator = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;

const Signup = () => {

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  async function addData(user) {
    console.log("userdata", user);
    const { data } = await axios
      .post("http://localhost:8000/log_info", JSON.stringify(user))
      .then(function (response) {
        console.log(response);
      });
  }

  const [visibility, setVisibility] = useState({
    password: false,
    repeatPassword: false,
  });

  const [formSubmission, setFormSubmission] = useState(false);


  const [error, setError] = useState({
    usernameError: "",
    emailError: "",
    passwordError: "",
    repeatPasswordError: "",
  });



  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUserData({ ...userData, [name]: value });
    console.log(name, value);

    console.log("1", error.usernameError);
    console.log("2", error.emailError);
    console.log("3", error.passwordError);
    console.log("4", error.repeatPasswordError);
    return;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let formFields = [
      "username",
      "email",
      "password",
      "repeatPassword",
    ];
    let isValid = true;
    formFields.forEach((field) => {
      isValid = validateField(field) && isValid;
    });

    if (isValid) {
      let a = userData.username;
      let b = userData.password;
      let c = userData.email;
      fetch(`http://127.0.0.1:8000/register`, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              UserName: a,
              UserPass: b,
              UserEmail: c
          })
      })
          .then(res => res.json())
          .then((result) => {
              alert(result);
          },
              (error) => {
                  alert('Failed');
              })
      setFormSubmission(true);
    }
    else {setFormSubmission(false);alert("Failed")};
    console.log(isValid);


    return formSubmission;
  };

  const handleBlur = (e) => {
    const name = e.target.name;
    validateField(name);


    console.log(name);
    return;
  };

  const toggleVisibility = () => {
    if (visibility.password === true)
      setVisibility({ password: false, repeatPassword: visibility.repeatPassword });
    else setVisibility({ password: true, repeatPassword: visibility.repeatPassword });
  };

  const toggleRVisibility = () => {
    if (visibility.repeatPassword === true)
      setVisibility({
        repeatPassword: false,
        password: visibility.password
      });
    else setVisibility({ repeatPassword: true, password: visibility.password });
  };

  const validateField = (name) => {
    let isValid = false;
    console.log("validate", name);
    if (name === "username") isValid = validateUserName();
    else if (name === "email") isValid = validateEmailAddress();
    else if (name === "password") isValid = validatePassword();
    else if (name === "repeatPassword")
      isValid = validatePasswordConfirmation();
    return isValid;
  }

  const validateUserName = () => {
    let userNameError = "";
    const value = userData.username;
    if (value.trim() === "") userNameError = "User Name is required";
    console.log(value, "usercalled");
    setError({ usernameError: userNameError });

    return userNameError === "";
  }

  const validateEmailAddress = () => {
    let emailAddressError = "";
    const value = userData.email;
    if (value.trim() === "") emailAddressError = "Email Address is required";
    else if (!emailValidator.test(value))
      emailAddressError = "Email is not valid";
    console.log(value, "emailcalled");
    setError({ emailError: emailAddressError });
    return emailAddressError === "";
  }

  const validatePassword = () => {
    let passError = "";
    const value = userData.password;
    if (value.trim() === "") passError = "Password is required";
    else if (!passwordValidator.test(value))
      passError =
        "Password must contain at least 8 characters, 1 number, 1 upper and 1 lowercase!";
    console.log(value, "passcalled");
    setError({ passwordError: passError });
    return passError === "";
  }

  const validatePasswordConfirmation = () => {
    let passwordConfirmationError = "";
    if (userData.password !== userData.repeatPassword)
      passwordConfirmationError = "Password does not match Confirmation";
    console.log(userData.repeatPassword, "confcalled");
    setError({ RepeadPasswordError: passwordConfirmationError });
    return passwordConfirmationError === "";
  }


  return (
    <>
      {formSubmission ? (
        <div className="details">
          <h2>Registration Successful!</h2>
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
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              id="reg-email"
              value={userData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
            />
            {error.emailError && (
              <div className="errorMsg">{error.emailError}</div>
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
            <div id="pass-wrapper">
              <input
                type={visibility.repeatPassword ? "text" : "password"}
                placeholder="Confirm Password"
                name="repeatPassword"
                id="reg-c-pass"
                value={userData.repeatPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
              />
              <span id="icn-eye" onClick={toggleRVisibility}>
                {visibility.repeatPassword === true && (
                  <BsEye color="#ff681a" size="1rem" />
                )}
                {visibility.repeatPassword === false && (
                  <BsEye color="black" size="1rem" />
                )}
              </span>
            </div>
            {error.repeatPasswordError && (
              <div className="errorMsg">{error.repeatPasswordError}</div>
            )}
            <button className="btn-reg">REGISTER</button>
          </form>
        </div>
      )}
    </>
  );
};
export default Signup;
