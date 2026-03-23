import { useState } from "react";
import validateInfo from "./validateInfo";
import { Link, useHistory, useParams } from "react-router-dom";
import emailjs from "@emailjs/browser";

const useForm = () => {
  const [values, setValues] = useState({
    cardName: "",
    cardNumber: "",
    cardType: "",
    cardExpiration: "",
    cardSecurityCode: "",
    cardPostalCode: "",
    focus: "",
  });

  const [errors, setErrors] = useState({});

  const handleFocus = (e) => {
    setValues({
      ...values,
      focus: e.target.name === "cardSecurityCode" ? "cvc" : e.target.name,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateInfo(values);
    setErrors(err);
    console.log("error", err);
    // if(err.variant === 'danger')
    //     console.log("yes");
    if (err.variant === "success") {
      let itemid = JSON.parse(window.localStorage.getItem("ItemId")) || 0;
      itemid = itemid + 1;
      window.localStorage.setItem("ItemId", JSON.stringify(itemid));

      let cart = JSON.parse(window.localStorage.getItem("Cart") || "[]");
      let booklist = JSON.parse(
        window.localStorage.getItem("Booklist") || "[]"
      );
      booklist.push(cart);
      window.localStorage.setItem("Booklist", JSON.stringify(cart));
      window.localStorage.removeItem("Cart");
      const carttotal = 0;
      window.localStorage.setItem("CartTotal", JSON.stringify(carttotal));

      alert("Payment received successfully.");
      ////////////////// email send ////////////////////

      var templateParams = {
        user_name: JSON.parse(
          window.localStorage.getItem("userdata")
        ).username.toString(),
        res_email: JSON.parse(
          window.localStorage.getItem("userdata")
        ).useremail.toString(),
      };

        emailjs
        .send(
          "service_8h8dopm",
          "template_bgg27nb",
          templateParams,
          "O1-P6q-7AAzb86MXG"
        )
        .then(
          function (response) {
            console.log("SUCCESS!", response.status, response.text);
            alert("Booking successful");
          },
          function (error) {
            console.log("FAILED...", error);
          }
        );
        history.push("/dashboard");
    }

  };

  return { handleChange, handleFocus, handleSubmit, values, errors };
};

export default useForm;
