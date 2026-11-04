import { useHistory } from "react-router-dom";
import "./profileDropdown.css";
import { CgProfile } from "react-icons/cg";
import { BiEdit } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import {FaStackOverflow} from "react-icons/fa"
import { Prevent } from "./Prevent";
import axios from "axios";
import { API_BASE, authHeaders, logout } from "../../api";

function ProfileDropdown() {
  const options = ["View Profile", "Edit Profile", "My Booking", "Logout"];
  const history = useHistory();


  async function fetchdata(){
    await axios
    .get(`${API_BASE}/uploadprofile/`, { headers: authHeaders() })
    .then((resp) => {
      const data = resp.data || [];
      if (!data.length) return;
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
     
    })
    .catch(() => {});
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

  const handleRouteLogout = async () => {
    await logout();
    window.location.reload();
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
