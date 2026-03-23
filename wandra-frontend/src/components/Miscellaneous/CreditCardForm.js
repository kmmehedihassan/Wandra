import React from "react";
import useForm from "../../useForm";
import { Button, Form, Alert, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CreditCardForm.css";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/es/styles-compiled.css";

const CreditCardForm = () => {
  const { handleChange, handleFocus, handleSubmit, values, errors } = useForm();
  
  return (
    <div>
      <div className="credit-card-container">
        {/* <div className="box justify-content-center align-items-center"> */}
        <div className="formDiv">
          <div className="creditCard">
            <Cards
              cvc={values.cardSecurityCode}
              expiry={values.cardExpiration}
              focused={values.focus}
              name={values.cardName}
              number={values.cardNumber}
            />
          </div>
          <Form onSubmit={handleSubmit} className="credit-card-form">
            <div className="credit-card-input-row">
              <input
                  type="text"
                  id="cardName"
                  data-testid="cardName"
                  name="cardName"
                  placeholder="Cardholder Name"
                  value={values.cardName}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  isValid={errors.cname}
                />
            </div>
            <div className="credit-card-input-row">
              <input
                  type="number"
                  id="cardNumber"
                  data-testid="cardNumber"
                  name="cardNumber"
                  placeholder="Card Number"
                  value={values.cardNumber}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  isValid={errors.cnumber}
                />
            </div>
            <div className="credit-card-input-row">
              <Row>
                {/* <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="cardType"
                    id="cardType"
                    data-testid="cardType"
                    placeholder="Card Type"
                    value={values.cardType}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    isValid={errors.ctype}
                  />
                </Form.Group>
              </Col> */}
                <Col>
                  <input
                      type="text"
                      id="cardExpiration"
                      data-testid="cardExpiration"
                      name="cardExpiration"
                      placeholder="Expiration Date"
                      value={values.cardExpiration}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      isValid={errors.cexp}
                    />
                </Col>
                {/* </Row>
            <Row> */}
                <Col>
                  <input
                      type="number"
                      id="cardSecurityCode"
                      data-testid="cardSecurityCode"
                      name="cardSecurityCode"
                      placeholder="Security Code"
                      value={values.cardSecurityCode}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      isValid={errors.ccvv}
                    />
                </Col>
                {/* <Col>
                <Form.Group>
                  <Form.Control
                    type="text"
                    id="cardPostalCode"
                    data-testid="cardPostalCode"
                    name="cardPostalCode"
                    placeholder="Postal Code"
                    value={values.cardPostalCode}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    isValid={errors.cpostal}
                  />
                </Form.Group>
              </Col> */}
              </Row>
            </div>
            <Alert
              id="alertMessage"
              data-testid="alertMessage"
              variant={errors.variant}
              show={errors.show}
            >
              {errors.message}
            </Alert>
            <button
              size={"block"}
              data-testid="validateButton"
              id="validateButton"
              type="submit"
            >
              Check Out
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
