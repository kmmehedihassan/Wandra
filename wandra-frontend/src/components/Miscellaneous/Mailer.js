import React, { useRef } from "react";
import emailjs from "@emailjs/browser";

export const Mailer = (name, send_mail, res_mail, message) => {

    var templateParams = {
      user_name: name,
      sender_email: send_mail,
      res_email: res_mail,
      message: message,
    };

    const sendEmail = () => {
        emailjs.send("service_8h8dopm", "template_bgg27nb", templateParams, "O1-P6q-7AAzb86MXG").then(
          function (response) {
            console.log("SUCCESS!", response.status, response.text);
          },
          function (error) {
            console.log("FAILED...", error);
          }
        );
  };

  return (
    <div>
    {sendEmail}
    </div>
  );
};

export default Mailer;
