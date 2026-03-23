import React from 'react'
import './D_header.css'

const D_header = ({link, text}) => {
  return (
    <div>
      <img className='image' src={link}
  alt ="st_intro"></img>
    <div className='centered'> 
       <h1 >
         {text}
       </h1>
    </div>
    </div>
  )
}

export default D_header
