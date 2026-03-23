import { useHistory } from "react-router-dom";
import "./profileDropdown.css";
import { CgProfile } from "react-icons/cg";
import { BiEdit } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import {FaStackOverflow} from "react-icons/fa"
import { Prevent } from "./Prevent";
import axios from "axios";

function ProfileDropdown() {
  const options = ["View Profile", "Edit Profile", "My Booking", "Logout"];
  const history = useHistory();


  async function fetchdata(){
    let a = JSON.parse(window.localStorage.getItem("userdata")).username;

    let isEmpty = false;
    await axios
    .get(`http://127.0.0.1:8000/uploadprofile?username=${a}` )
    .then((resp) => {
      let data = [];
      data = resp.data;
      console.log(data[0].first_name)
      let obj = JSON.stringify({
        firstname: data[0].first_name,
        lastname: data[0].last_name,
        gender: data[0].gender,
        phone: data[0].phone,
        address: data[0].address,
        email: "",
        oldpassword: "",
        newpassword: "",
      });
      window.localStorage.setItem("formData", obj);
     
    });
  };

  const handleRouteView = () => {
   fetchdata()
    history.push("/dashboard");
  };

  // const handleRouteView = () => {
  //   history.push("/dashboard");
  // };

  const handleRouteEdit = () => {
    history.push("/dashboard");
  };

  const handleRouteLogout = () => {
    window.localStorage.clear();
    // history.push("/blog");
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-dropdown-content">
        {options.map((option) => (
          <div className="profile-dropdown-item">
            {option === "View Profile" && (
              <button
                className="profile-dropdown-btn"
                onClick={Prevent(() => handleRouteView())}
              >
                <CgProfile size="1.4rem" color="#FFD54F" id="nav-drop-icn" />
                {option}
              </button>
            )}
            {option === "Edit Profile" && (
              <button
                className="profile-dropdown-btn"
                onClick={Prevent(() => handleRouteEdit())}
              >
                <BiEdit size="1.5rem" color="#4DD0E1" id="profile-drop-icn" />
                {option}
              </button>
            )}
            {option === "My Booking" && (
              <button
                className="profile-dropdown-btn"
                onClick={Prevent(() => handleRouteEdit())}
              >
                <FaStackOverflow
                  size="1.5rem"
                  color="#AB47BC"
                  id="profile-drop-icn"
                />
                {option}
              </button>
            )}
            {option === "Logout" && (
              <button
                className="profile-dropdown-btn"
                onClick={Prevent(() => handleRouteLogout())}
              >
                <MdLogout size="1.5rem" color="#FF8A65" id="profile-drop-icn" />
                {option}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileDropdown;
