import React from "react";
import Accordion from "./Accordion";
import { accordiondata } from "../Database/data";
import "./Accordion.css";

const Accordionbody = ({ id }) => {
  console.log(typeof(id))
  return (
    // <div className='accordion-item'>
    <div>
      <p
        style={{
          color: "#DC582A",
          fontWeight: "bold",
          fontSize: "30px",
          paddingLeft: "10px",
        }}
      >
        Things to know:
      </p>
      <div className="accordion">
        {accordiondata
          .filter((acc) => acc.id === id)
          .map((acc) => {
            console.log(acc)
            return(
            <div className="accordion">
              {acc.acc_content.map(({ title, content }) => {
                return(
                <Accordion title={title} content={content} />
              );
              })}
            </div>
          );
            }
            )}
      </div>
    </div>
  );
};

export default Accordionbody;
