import React from 'react'
import Booking from './Booking'
import Text_box from './Text_box'
import { Link, useParams } from "react-router-dom";
// this component hold both the right description contianer and left booking form container

export default function Full () {
  const { id } = useParams();
  console.log({ id });
  return (
    <div style={{ width: "100%" }}>
      <Text_box id={Number(id)} />  
       {/* <Booking/>  */}
    </div>
  );
};
