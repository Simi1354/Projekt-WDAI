import * as Icon from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Accordion, Card } from "react-bootstrap"; // Import necessary components
import "./style.css";

const Account = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

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
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token, currentUser]);

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

  const calculateOrderTotal = (products) => {
    return products.reduce((total, product) => {
      return (
        total + parseFloat(product.price.$numberDecimal) * product.quantity
      );
    }, 0);
  };

  return (
    <div>
      <h1>Panel użytkownika</h1>
      <h2>Witaj, {name}!</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={handleLogout}
          className="login-button"
          style={{ width: "30%" }}
        >
          <Icon.BoxArrowRight size={30} style={{ marginRight: "8px" }} />
          Wyloguj się
        </button>
      </div>

      <h1>Twoje zamówienia</h1>
      {orders.length === 0 ? (
        <h2>Nie masz jeszcze żadnego zamówienia.</h2>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <h3>Zamówienie ID: {order._id}</h3>
              <p>
                Data zamówienia: {new Date(order.date).toLocaleDateString()}
              </p>

              <div className="products-list">
                <Accordion>
                  {order.products.map((product, index) => (
                    <Card key={product._id}>
                      <Accordion.Item eventKey={index.toString()}>
                        <Accordion.Header className="accordion-header">
                          {product.title} - Ilość sztuk: {product.quantity},
                          Cena za wszytskie sztuki: $
                          {product.quantity * product.price.$numberDecimal}
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="product-item">
                            <div className="product-image-wrapper">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="product-image"
                              />
                            </div>
                            <div className="product-details">
                              <p>Cena: ${product.price.$numberDecimal}</p>
                              <p>Kategoria: {product.category}</p>
                              <p>{product.description}</p>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Card>
                  ))}
                </Accordion>
              </div>

              {/* Calculate and display order total */}
              <div className="order-total">
                <strong>
                  Łączna cena zamówienia: $
                  {calculateOrderTotal(order.products).toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Account;
