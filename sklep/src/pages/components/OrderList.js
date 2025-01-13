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
        setError("Nie udało się załadować zamówień");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) {
    return <div>Ładowanie zamówień...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Twoje zamówienia</h1>
      {orders.length === 0 ? (
        <p>
          Nie masz jeszcze żadnego zamówienia. Dodaj produkty do koszyka i
          zatwierdź koszyk, by pojawiły się tutaj twoje zamówienia.
        </p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <h2>Zamówienie o numerze ID: {order._id}</h2>
              <p>
                Data zamówienia: {new Date(order.date).toLocaleDateString()}
              </p>
              <ul>
                {order.products.map((product, index) => (
                  <li key={index}>
                    <strong>{product.name}</strong> - Ilość produktu:{" "}
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
