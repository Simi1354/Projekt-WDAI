import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const cartKey = `cart_${currentUser}`;
    const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    setCart(storedCart);
  }, []);

  let sum = 0;
  cart.forEach((product) => {
    sum += product.price.$numberDecimal * product.quantity;
  });

  return (
    <>
      <h1>Twój koszyk</h1>
      {cart.length === 0 ? (
        <h1>Koszyk jest pusty</h1>
      ) : (
        <Accordion className="custom-accordion">
          {cart.map((product, index) => (
            <Accordion.Item eventKey={index} key={index}>
              <Accordion.Header>
                <div className="product-title-cart"> {product.title} </div>
                <div className="product-price-cart">
                  ${product.price.$numberDecimal * product.quantity}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <img
                  src={product.image}
                  alt={product.title}
                  className="cart-item-image"
                />
                <p>
                  <strong>Produkt:</strong> {product.title}
                </p>
                <p>
                  <strong>Cena:</strong> ${product.price.$numberDecimal}
                </p>
                <p>
                  <strong>Ilość:</strong> {product.quantity}
                </p>
                <p>
                  <strong>Suma:</strong> $
                  {product.price.$numberDecimal * product.quantity}
                </p>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
      <h1>Suma: {sum} </h1>
    </>
  );
};

export default Cart;
