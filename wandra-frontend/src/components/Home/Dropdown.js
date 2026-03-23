import { useState } from "react";
import "./dropdown.css"
import { RiArrowDropDownLine } from "react-icons/ri";

function Dropdown ({selected, setSelected}){
    const [isActive, setIsActive] = useState(false);
    const options = ["Destination", "Tour", "Blog"];

    return (
      <div className="dropdown">
        <div className="dropdown-btn" onClick={(e) => setIsActive(!isActive)}>
          {selected}
          <span className="dropdown-icn">
            <RiArrowDropDownLine size="1.5rem" color="black"/>
          </span>
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => (
              <div
                onClick={(e) => {
                  setSelected(option);
                  setIsActive(false);
                }}
                className="dropdown-item"
              >
                {selected !== option && option}
                {selected === option && (
                  <div className="dropdown-highlighted-item">{option}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
}

export default Dropdown;