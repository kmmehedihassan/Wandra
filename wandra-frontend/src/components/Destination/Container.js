import React from 'react'
import { Link } from "react-router-dom";
import './Container.css' 

const Container = ({id, link, name}) => {
  return (
      <div className="image_container">
        <Link to={{pathname:`/Destinations/${id}`, state:{stateParam: true}}}>
          <img src={link} alt="" />
          <div className="image_text">
            {name}
            <p className="font">Just Beautiful</p>
          </div>
        </Link>
      </div>
  );
 }
  
export default Container
