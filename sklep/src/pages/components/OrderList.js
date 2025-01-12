import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3003/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <h2>Order ID: {order._id}</h2>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              <ul>
                {order.products.map((product, index) => (
                  <li key={index}>
                    <strong>{product.name}</strong> - Quantity:{" "}
                    {product.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderList;
