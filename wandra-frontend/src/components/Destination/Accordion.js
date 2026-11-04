import React, { useState } from "react";

const Accordion = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item${open ? " is-open" : ""}`}>
      <button type="button" className="accordion-title" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="accordion-icon" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="accordion-content">{content}</div>}
    </div>
  );
};

export default Accordion;
