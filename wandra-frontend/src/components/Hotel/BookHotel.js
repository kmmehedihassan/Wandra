 import "../Hotel/list/list.css";
// import Header from "../header/Header";
import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
// import SearchItem from "../searchItem/SearchItem";
// import { hotel_list } from "../../Database/data";

const BookList = ({date,setDate,handleSubmit}) => {
  const [destination, setDestination] = useState("");
  const [openDate, setOpenDate] = useState(false);
  
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  

  return (
    <div>
      {/* <Header type="list" /> */}
      <div className="listBookContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            {/* <div className="lsItem">
              <label>Destination</label>
              <input placeholder={destination} type="text" />
            </div> */}
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                date[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(date[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDate([item.selection])}
                  minDate={new Date()}
                  ranges={date}
                />
              )}
            </div>
            {/* <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input type="number" className="lsOptionInput" />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input type="number" className="lsOptionInput" />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.adult}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    placeholder={options.children}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    placeholder={options.room}
                  />
                </div>
              </div>
            </div> */}
            <button onClick={handleSubmit}>Search</button>
          </div>
          {/* <div className="listResult">
            {hotel_list.map((h) => (
              <SearchItem
                id={h.id}
                src={h.src}
                name={h.name}
                dist={h.dist}
                service={h.service}
                highlights={h.highlights}
                desc={h.desc}
                category={h.category}
                ratings={h.ratings}
                price={h.price}
              />
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default BookList;
