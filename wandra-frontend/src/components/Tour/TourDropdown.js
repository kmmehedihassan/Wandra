import { useState } from "react";
import "./searchTour.css";
import { FiCalendar } from "react-icons/fi";

function TourDropdown({ selected, setSelected }) {
    const [isActive, setIsActive] = useState(false);
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <div className="tour-dropdown">
            <span className="date-icn">
                <FiCalendar color="#ff681a" />
            </span>
            <div
                className="tour-dropdown-btn"
                onClick={(e) => setIsActive(!isActive)}
            >
                {selected}
            </div>
            {isActive && (
                <div className="tour-dropdown-content">
                    {months.map((month) => (
                        <div
                            onClick={(e) => {
                                setSelected(month);
                                setIsActive(false);
                            }}
                            className="tour-dropdown-item"
                        >
                            {selected !== month && month}
                            {selected === month && (
                                <div className="tour-dropdown-highlighted-item">{month}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TourDropdown;
