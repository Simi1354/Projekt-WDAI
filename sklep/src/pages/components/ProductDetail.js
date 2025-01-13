import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import * as Icon from "react-bootstrap-icons";
import ProductRatings from "./ProductRatings.js";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counter, setCounter] = useState(1);
  const inStock = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(
          `http://localhost:3002/products/oneproduct`,
          { productId: id }
        );
        setProduct(response.data);
      } catch (err) {
        setError("Błąd pobierania szczegółów produktu");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const currentUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:3005/cart",
        {
          userId: currentUser,
          product: {
            productId: product._id,
            title: product.title,
            price: product.price.$numberDecimal,
            quantity: counter,
            image: product.image,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/koszyk");
    } catch (err) {
      console.error("Błąd dodawania do koszyka:", err);
    }
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  if (!product) {
    return <div>Produktu nie udało się znaleźć.</div>;
  }

  return (
    <>
      <h1>{product.title}</h1>
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
            <strong>Cena:</strong> ${product.price.$numberDecimal}
          </p>
          <p>
            <strong>Kategoria:</strong> {product.category}
          </p>
          <p>
            <strong>ID Produktu:</strong> {product._id}
          </p>
          <div className="counter">
            <div className="counter-box">
              <button
                onClick={() => setCounter((prev) => Math.max(prev - 1, 1))}
                className={
                  counter > 1
                    ? "active-counter-button"
                    : "inactive-counter-button"
                }
                style={{
                  borderTopLeftRadius: "5px",
                  borderBottomLeftRadius: "5px",
                }}
                disabled={counter <= 1}
              >
                {" "}
                -{" "}
              </button>
            </div>
            <div
              className="counter-box"
              style={{
                border: "1px solid #ddd",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <b>{counter}</b>
            </div>
            <div className="counter-box">
              <button
                onClick={() =>
                  setCounter((prev) => Math.min(prev + 1, inStock))
                }
                className={
                  counter < inStock
                    ? "active-counter-button"
                    : "inactive-counter-button"
                }
                style={{
                  borderTopRightRadius: "5px",
                  borderBottomRightRadius: "5px",
                }}
                disabled={counter >= inStock}
              >
                {" "}
                +{" "}
              </button>
            </div>
            <div className="in-stock"> Dostępnych sztuk: {inStock} </div>
          </div>
          <button className="add-to-cart-button" onClick={handleAddToCart}>
            <Icon.CartPlus
              size={35}
              style={{ marginRight: "10px", marginBottom: "-5px" }}
            />
            Dodaj do koszyka
          </button>
        </div>
      </div>
      <ProductRatings productId={product._id} />
    </>
  );
};

export default ProductDetail;
