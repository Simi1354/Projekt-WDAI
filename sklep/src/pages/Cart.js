import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import axios from "axios";
import "./components/style.css";
import "./Cart.css";
import * as Icon from "react-bootstrap-icons";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const currentUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `http://localhost:3005/cart/${currentUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCart(response.data ? response.data.products : []);
      } catch (err) {
        console.error("Błąd pobierania koszyka:", err);
      }
    };

    fetchCart();
  }, []);

  async function removeItemFromCart(productId) {
    console.log(`Removing product with ID: ${productId}`);
    const currentUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    try {
      const deleteResponse = await axios.delete(
        `http://localhost:3005/cart/${currentUser}/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`Product with ID: ${productId} removed`, deleteResponse.data);
      // Refresh the cart after removing the item
      const response = await axios.get(
        `http://localhost:3005/cart/${currentUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(response.data ? response.data.products : []);
    } catch (err) {
      console.error("Błąd usuwania z koszyka:", err);
    }
  }

  let sum = 0;
  cart.forEach((product) => {
    sum += product.price.$numberDecimal * product.quantity;
  });

  const handleAddOrder = async () => {
    const currentUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    // Prepare products array to send in the request body
    const products = cart.map((product) => ({
      productId: product._id,
      quantity: product.quantity,
    }));

    try {
      // Make the order request
      await axios.post(
        "http://localhost:3003/orders",
        {
          products: products,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Now delete the products from the cart
      await axios.delete(`http://localhost:3005/carts/clear/${currentUser}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Zamówienie zostało złożone!");
    } catch (err) {
      console.error("Błąd dodawania do zamówienia:", err);
    }
  };

  return (
    <>
      <h1>Twój koszyk</h1>
      {cart.length === 0 ? (
        <h1>Koszyk jest pusty</h1>
      ) : (
        <>
          <Accordion className="custom-accordion">
            {cart.map((product, index) => (
              <Accordion.Item eventKey={index} key={index}>
                <Accordion.Header>
                  <div className="product-title-cart"> {product.title} </div>
                  <div
                    className="product-price-cart"
                    style={{ marginRight: "10px" }}
                  >
                    $
                    {(product.price.$numberDecimal * product.quantity).toFixed(
                      2
                    )}
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <div
                    className="product-detail-container"
                    style={{ margin: "0", border: "none", boxShadow: "none" }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-detail-image"
                    />
                    <div
                      className="product-detail-info"
                      style={{ Width: "100%", padding: "0" }}
                    >
                      <p>
                        <strong>Opis:</strong> {product.description}
                      </p>
                      <p>
                        <strong>Cena:</strong> ${product.price.$numberDecimal}
                      </p>
                      <p>
                        <strong>Ilość:</strong> {product.quantity}
                      </p>
                      <p>
                        <strong>Suma:</strong> $
                        {(
                          product.price.$numberDecimal * product.quantity
                        ).toFixed(2)}
                      </p>
                      <button
                        className="add-to-cart-button"
                        onClick={() => removeItemFromCart(product._id)}
                      >
                        <Icon.CartDash
                          size={35}
                          style={{ marginRight: "10px", marginTop: "-4px" }}
                        />
                        Usuń z koszyka
                      </button>
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          <h1>Suma: ${sum.toFixed(2)} </h1>
          <button className="order-button" onClick={handleAddOrder}>
            Złóż zamówienie
          </button>
        </>
      )}
    </>
  );
};

export default Cart;
