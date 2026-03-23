import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { BsEye } from "react-icons/bs";

const Signin = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  

  async function fetchData() {
    let isEmpty = false;
    let a = userData.username;
    let b = userData.password;

    // win.setItem('userdata',JSON.stringify(userData));
    // console.log(JSON.parse(win.getItem("userdata")));

    await axios
      .get(`http://127.0.0.1:8000/register?username=${a}&userpass=${b}`)
      .then((resp) => {
        let data = [];
        data = resp.data;
        let result = data
          .filter(
            (log_info) =>
              log_info.UserName === userData.username &&
              log_info.UserPass === userData.password
          );
          // .map((log_info) => log_info.UserName);
        // let regInfo = data
        //   .filter(
        //     (info) =>
        //       info.UserName === userData.username &&
        //       info.UserPass === userData.password
        //   );
        // console.log("data: ", regInfo);
        isEmpty = Object.keys(result).length === 0;
        console.log(result);
        if (isEmpty) {
          setError({ loginError: "Login Unsuccessful. Try Again!" });
          setFormSubmission(false);
        } else {
          console.log("founded");
          fetch(`http://127.0.0.1:8000/login`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              UserName: a,
              UserPass: b,
            }),
          })
            .then((res) => res.json())
            .then(
              (result) => {
                alert(result);
              },
              (error) => {
                alert("Failed");
              }
            );
          setFormSubmission(true);

          // saving status in local storage after successful login
          window.localStorage.setItem("isAuthenticated", true);
          // window.localStorage.setItem(
          //   "userdata",
          //   JSON.stringify(result)
          // );  

          let un = result.map((val) => val.UserName);
          let up = result.map((val) => val.UserEmail);
          let obj = JSON.stringify({
              username: un,
              useremail: up,
            });

          window.localStorage.setItem("userdata", obj);
          
            
          window.location.reload();
        }
      });

      
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
    // if (isValid) setFormSubmission(true);
    // else setFormSubmission(false);
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
            <button className="btn-reg" onClick={fetchData}>
              Login
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Signin;
