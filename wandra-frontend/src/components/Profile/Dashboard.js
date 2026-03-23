import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Avatar from "@mui/material/Avatar";
import ViewProfile from "./ViewProfile";
import EditProfile from "./EditProfile";
import MyBookings from "./MyBookings";
import { useHistory } from "react-router-dom";
import "../Navigation/profileDropdown.css";
import { CgProfile } from "react-icons/cg";
import { BiEdit } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { HiUpload } from "react-icons/hi";
import { FaStackOverflow } from "react-icons/fa";
import { Prevent } from "../Navigation/Prevent";

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [perviewFile, setpreviewFile] = useState(null);
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const changeHandler = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFile(file);
  };
  useEffect(() => {
    let fileReader,
      isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result && !isCancel) {
          setFileDataURL(result);
        }
      };
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    };
  }, [file]);

  

  const [isActive, setIsActive] = useState(1);

  const options = ["My Profile", "Edit Profile", "My Booking", "Logout"];
  const history = useHistory();

  const handleRouteView = () => {
    setIsActive(1);
    history.push("/dashboard");
  };

  const handleRouteEdit = () => {
    setIsActive(2);
    history.push("/dashboard");
  };

  const handleRouteBooking = () => {
    setIsActive(3);
    history.push("/dashboard");
  };

  const handleRouteLogout = () => {
    window.localStorage.clear();
    // history.push("/blog");
  };

  return (
    <div className="dash-main-container">
      <div className="dash-side-tab">
        {options.map((option) => (
          <div className="dash-side-btn-con">
            {option === "My Profile" && (
              <button
                style={{
                  borderRight: isActive === 1 ? "2px solid teal" : "",
                  backgroundColor: isActive === 1 ? "#eee" : "",
                }}
                className="dash-side-btn"
                onClick={Prevent(() => handleRouteView())}
              >
                <CgProfile size="1.4rem" color="#F57F17" id="nav-drop-icn" />
                {option}
              </button>
            )}
            {option === "Edit Profile" && (
              <button
                style={{
                  borderRight: isActive === 2 ? "2px solid teal" : "",
                  backgroundColor: isActive === 2 ? "#eee" : "",
                }}
                className="dash-side-btn"
                onClick={Prevent(() => handleRouteEdit())}
              >
                <BiEdit size="1.5rem" color="#4DD0E1" id="profile-drop-icn" />
                {option}
              </button>
            )}
            {option === "My Booking" && (
              <button
                style={{
                  borderRight: isActive === 3 ? "2px solid teal" : "",
                  backgroundColor: isActive === 3 ? "#eee" : "",
                }}
                className="dash-side-btn"
                onClick={Prevent(() => handleRouteBooking())}
              >
                <FaStackOverflow
                  size="1.5rem"
                  color="#E91E63"
                  id="profile-drop-icn"
                />
                {option}
              </button>
            )}
          </div>
        ))}
      </div>

      {isActive === 1 && <ViewProfile />}
      {isActive === 2 && <EditProfile />}
      {isActive === 3 && <MyBookings />}

      <div className="dash-right-sidebar">
        <Avatar
          className="dash-profile-pic"
          alt="Remy Sharp"
          src={fileDataURL}
          sx={{ width: 200, height: 200 }}
        />
        <label className="dash-username">
          <span className="hello-label">Hello,&nbsp;</span>
          {JSON.parse(window.localStorage.getItem("userdata")).username}!
        </label>

        <button className="dash-upload-btn">
          <label htmlFor="fileInput">
            <HiUpload size="1.5rem" color="teal" id="profile-drop-icn" />
            Upload Picture
          </label>
          <input
            id="fileInput"
            type="file"
            required
            onChange={changeHandler}
            style={{ display: "none" }}
          />
        </button>

        <button
          className="dash-logout-btn"
          onClick={Prevent(() => handleRouteLogout())}
        >
          <MdLogout size="1.5rem" color="#C62828" id="profile-drop-icn" />
          Logout
        </button>
      </div>
    </div>
  );
}
