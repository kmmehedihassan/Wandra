import "./list.css";
import Header from "../header/Header";
import { useState,useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../searchItem/SearchItem";
import { hotel_list } from "../../Database/data";
// import format from "date-fns/format";
import axios from "axios";
import {
  HotelRoomData,
  SingleHotel,
  HotelRoomState,
} from "../../Database/SingleHotel";
import { parse } from "date-fns/esm";
const List = () => {
  const {hotels,setHotels}=HotelRoomState()
  const [destination, setDestination] = useState("");
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [options, setOptions] = useState({
    adult: 1,
    children: 0,
    room: 1,
  });
  const[minprice,setMinprice]=useState();
  const[maxprice,setMaxprice]=useState();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

   const  handleSearchHotel= ()=>{
    // let total_adult=options.adult
    // let total_children=options.children
    // let intend_room=options.adult
    let total_room=options.room
    let price =minprice
    let pricem =maxprice
    console.log("total all",total_room)
    console.log("total price",price,pricem)
    let date="2-11-2022"
    console.log(format(new Date(date),"yyyy-mmmm-dd"))
    let temp=new Date(date)
    let finaldate=temp.getFullYear()+"-0"+temp.getMonth()+"-"+temp.getDay()
    console.log(finaldate)
    const newBook ={
      hotel_id : 2,
      room : 1,
      guest :"Fahim",
      roomquantity:1,
      check_in : finaldate,
      check_out : finaldate,
      price :4,
      cardata:234

    }
    let b = JSON.stringify(newBook)
    console.log(b)
    axios.get("http://127.0.0.1:8000/reserve/10?"+ new URLSearchParams({
        
      hotel_id : 2,
      room : 1,
      guest :"Fahim",
      roomquantity:1,
      check_in : finaldate,
      check_out : finaldate,
      price :4,
      cardata:234

    
  }), {
      method: 'GET',
      
       
    })
    .then(res => {console.log(res.json())})
    .then((result) => {
      alert(result);
    },
    (error) => {
      alert('posts Failed');
    })
    const filteredResults =hotel_list.filter(
      (grid)=>{
        // let SinglehotelObj=hotels.
      if(search!=""){
        // console.log("Working  ")
        return ( 
          grid.location.toLowerCase().includes(search.toLowerCase())
          && (grid.price>=price && grid.price<=pricem)
        )
      } 
      else {
        return ( 
          
           (grid.price>=price && grid.price<=pricem)
        )

      }
      } 
      
    );
      console.log(filteredResults)
      if(filteredResults.length===0)
        setSearchResults(hotel_list)
      else
        setSearchResults(filteredResults)
  }
  const [inputValue, setInputValue] = useState(0);
  // useEffect(() => {
  //   const filteredResults = hotel_list.filter(
  //     (grid) =>
  //       grid.name.toLowerCase().includes(search.toLowerCase())
  //   );
  //   console.log(searchResults);      
  //   setSearchResults(filteredResults);
  // }, [search]);
  return (
    <div>
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input placeholder={destination} type="text"
              onChange={(e) => {
                
                setSearch(e.target.value);
                console.log(search);
              }} />
            </div>
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
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input type="number" 
                  min={0}
                  onChange={(e)=>{setMinprice(e.target.value)}}
                  className="lsOptionInput" />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input type="number"
                  min={0}
                  onChange={(e)=>{setMaxprice(e.target.value)}}
                  className="lsOptionInput" />
                </div>
                {/* <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    onChange={(e)=>{setOptions({...options,adult:e.target.value})}}
                    placeholder={options.adult}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    onChange={(e)=>{setOptions({...options,children:e.target.value})}}
                    placeholder={options.children}
                  />
                </div> */}
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    onChange={(e)=>{setOptions({...options,room:e.target.value})}}
                    placeholder={options.room}
                  />
                </div>
              </div>
            </div>
            <button onClick={handleSearchHotel}>Search</button>
          </div>
          <div className="listResult">
            {searchResults.map((h) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
