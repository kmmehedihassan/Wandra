import React from 'react'
import './Header.css'

const Header = () => {
  return (
    <div>
    <h2>Trekker</h2>
    <img className ='image' src="../../images/first.jpg" alt ="intro"></img> 
    <div class="centered"> 
       <h1 className ='text'>
         Destinations List
       </h1>
    </div>
</div>
  )
}

export default Header



// <a class="nav-link active" aria-current="page" href="#" style = "color:purple;">Trekker</a> 