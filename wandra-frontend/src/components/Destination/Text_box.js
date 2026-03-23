import React from 'react'
import { destinationData } from "../Database/data";
import Accordion_body from './Accordion_body';
import Booking from './Booking';
import './D_header.css'
import Gallery1 from './Gallery1';

const Text_box = ({ id }) => {
  return (
    <div style={{ width: "100vw" }}>

      {destinationData
        .filter((dest) => dest.id === id)
        .map((dest) => (
          <div>
            <img className='image' src={dest.link} alt='intro'></img>
            <h1 className='centered introText' >{dest.title}</h1>
          </div>
        ))}
        <div style={{ width: "70vw" }}>
       <p
        style={{
          color: "#DC582A",
          fontWeight: "bold",
          fontSize: "40px",
          marginLeft: "10px",
        }}
      >
        OVERVIEW:
      </p>

      {destinationData
        .filter((dest) => dest.id === id)
        .map((dest) => (
          <div style={{width: "70vw"}}>
            <h1 style={{marginLeft: "10px"}}>{dest.title}</h1>
            <p
             style={{
              fontWeight: "bold",
              fontSize: "20px",
              marginLeft: "10px",
            }}
            > {dest.body}</p>
          </div>
        ))}
        
      <Accordion_body id={id}/>
      <Gallery1/>
</div>
     

    </div>
  );
};

export default Text_box
// "color: #DC582A;font-weight:bold; font-size:40px;"