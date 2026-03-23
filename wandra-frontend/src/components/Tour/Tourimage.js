import React from 'react'
import { BsTranslate } from 'react-icons/bs'
import "../Destination/Header.css"

const Tourimage = ({link,name}) => {
    return (
        <div>
        <img className ='image' src={link} alt ="intro"></img> 
        <div 
        //    style={{
        //      position: 'absolute',
        //      top: "40%",
        //     //  left: "10%",
        //     //  transform: tsranslate("-50%", "50%"),
        //      textAlign: 'center',
        //      width: "100%",
        //    }}
        > 
           {/* <h1 className ='text'>
            {name}
           </h1> */}
        </div>
    </div>
  )
}

export default Tourimage
