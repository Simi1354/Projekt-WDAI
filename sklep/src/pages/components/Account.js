import * as Icon from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import Accordion from "react-bootstrap/Accordion"; // Import Accordion
import "./style.css";
import ProductRatings from "./ProductRatings"; // If you have this component for ratings

const Account = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [productDetails, setProductDetails] = useState({}); // Keep productDetails in a state
  const [fetchingProductIds, setFetchingProductIds] = useState(new Set()); // Track products being fetched

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("currentUserEmail");
  const currentUser = localStorage.getItem("currentUser");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3003/orders/${currentUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        // setError("Failed to fetch orders");
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      if (fetchingProductIds.has(productId)) return; // Prevent duplicate fetching
      setFetchingProductIds((prevState) => new Set(prevState.add(productId))); // Mark as fetching

      try {
        const response = await axios.post(
          "http://localhost:3002/products/oneproduct",
          { productId }
        );
        setProductDetails((prevState) => ({
          ...prevState,
          [productId]: response.data,
        }));
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setFetchingProductIds((prevState) => {
          const newSet = new Set(prevState);
          newSet.delete(productId);
          return newSet;
        });
      }
    };

    // Fetch product details for all products in the current orders
    orders.forEach((order) => {
      order.products.forEach((orderProduct) => {
        // Only fetch product details if not already loaded
        if (
          !productDetails[orderProduct.productId] &&
          !fetchingProductIds.has(orderProduct.productId)
        ) {
          fetchProductDetails(orderProduct.productId);
        }
      });
    });
  }, [orders, productDetails, fetchingProductIds]); // Keep the dependencies up-to-date

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserEmail");
    window.location.href = "/login";
  };

  if (loading) {
    return <div>Ładowanie danych konta...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Panel użytkownika</h1>
      <h2>Witaj, {name}!</h2>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleLogout}
          className="login-button"
          style={{ width: "30%", alignItems: "center" }}
        >
          <Icon.BoxArrowRight
            size={30}
            style={{
              marginTop: "-4px",
              marginRight: "4px",
              justifyContent: "center",
            }}
          />
          Wyloguj się
        </button>
      </div>

      <h1>Twoje zamówienia</h1>
      {orders.length === 0 ? (
        <h2>Nie masz jeszcze żadnego zamówienia.</h2>
      ) : (
        <Accordion className="custom-accordion">
          {orders.map((order, orderIndex) => (
            <Accordion.Item eventKey={orderIndex} key={order._id}>
              <Accordion.Header>
                <div className="order-header">
                  <div>Order ID: {order._id}</div>
                  <div>
                    Data zamówienia: {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {order.products.map((orderProduct) => {
                  const product = productDetails[orderProduct.productId];

                  if (!product) {
                    return (
                      <div key={orderProduct.productId}>
                        Ładowanie produktu...
                      </div>
                    );
                  }

                  return (
                    <div key={orderProduct.productId}>
                      <Accordion className="product-accordion">
                        <Accordion.Item eventKey={orderProduct.productId}>
                          <Accordion.Header>
                            <div className="product-title">
                              {product.title} - Ilość sztuk:{" "}
                              {orderProduct.quantity}
                            </div>
                            <div
                              className="product-price"
                              style={{ marginRight: "10px" }}
                            >
                              $
                              {(
                                product.price.$numberDecimal *
                                orderProduct.quantity
                              ).toFixed(2)}
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="product-detail-container">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="product-detail-image"
                              />
                              <div className="product-detail-info">
                                <p>
                                  <strong>Opis:</strong> {product.description}
                                </p>
                                <p>
                                  <strong>Cena:</strong> $
                                  {product.price.$numberDecimal}
                                </p>
                                <p>
                                  <strong>Ilość sztuk:</strong>{" "}
                                  {orderProduct.quantity}
                                </p>
                                <p>
                                  <strong>Suma zamówienia:</strong> $
                                  {(
                                    product.price.$numberDecimal *
                                    orderProduct.quantity
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </div>
                  );
                })}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default Account;
