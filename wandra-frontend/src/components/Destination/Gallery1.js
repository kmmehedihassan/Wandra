import { ImageList } from '@mui/material'
import {ImageListItem} from '@mui/material'
import { useState } from 'react'
import React from 'react'
import '../Tour/gallery.css'
// import (ImageList)

const Gallery1 = () => {
  const [itemData,setItemData]=useState([
    {
    title:"first image",
    img:"../../images/st1.jpg"
    },
    {
    title:"first image",
    img:"../../images/st2.jpg"
    },
    {
    title:"first image",
    img:"../../images/st3.jpg"
    },
    {
    title:"first image",
    img:"../../images/st4.jpg"
    },
    {
        title:"first image",
        img:"../../images/st5.jpg"
        },
        {
        title:"first image",
        img:"../../images/st6.jpg"
        },
        {
        title:"first image",
        img:"../../images/st7.jpg"
        },
        {
        title:"first image",
        img:"../../images/st8.jpg"
        },
        {
            title:"first image",
            img:"../../images/st9.jpg"
            }
]);
  return (
    <div>
      <h2 className='gallery-title'>FROM OUR GALLERY</h2>
      <p
      style={{
        fontSize: "20px",
        color: "#FF681A",
        // fontStyle: 'italic',
        textAlign: 'left',
      }}
      >
        Be our guest and see if for yourself</p>

        <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
  {itemData.map((item) => (
    <ImageListItem key={item.img}>
      <img
        src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
        srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
        alt={item.title}
        loading="lazy"
      />
    </ImageListItem>
  ))}
</ImageList>

        {/* <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec posuere metus et tortor pulvinar venenatis. Aliquam erat volutpat. Nam ultrices semper felis, at laoreet metus laoreet </p>
       <div className='gal_image'>
       <img  classname = 'gal_image_container' src="../../images/first.jpg" alt ="intro"></img> 
       <img  classname = 'gal_image_container' src="../../images/one.jpg" alt ="intro"></img> 
       <img  classname = 'gal_image_container' src="../../images/four.jpg" alt ="intro"></img> 
       <img  classname = 'gal_image_container' src="../../images/nilgiri.jpg" alt ="intro"></img> 
       <img  classname = 'gal_image_container' src="../../images/sundarban.jpg" alt ="intro"></img> 
        </div> */}
    </div>
  )
}

export default Gallery1
