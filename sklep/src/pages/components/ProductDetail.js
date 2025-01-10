import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import * as Icon from "react-bootstrap-icons";

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

  const handleAddToCart = () => {
    const currentUser = localStorage.getItem("currentUser");
    const cartKey = `cart_${currentUser}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const productInCart = cart.find((item) => item._id === product._id);

    if (productInCart) {
      productInCart.quantity += counter;
    } else {
      cart.push({ ...product, quantity: counter });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setTimeout(() => {
      navigate("/koszyk");
    }, 1000);
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Produkt nie znaleziony</div>;

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
          <div class name="counter">
            <div className="counter-box">
              <button
                onClick={() => setCounter((prev) => Math.max(prev - 1, 0))}
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
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {counter}
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
          <button
            className="add-to-cart-button"
            onClick={() => {
              handleAddToCart();
              setTimeout(() => {
                navigate("/koszyk");
              }, 1000);
            }}
          >
            <Icon.CartPlus
              size={35}
              style={{ marginRight: "10px", marginBottom: "-5px" }}
            ></Icon.CartPlus>
            Dodaj do koszyka
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
