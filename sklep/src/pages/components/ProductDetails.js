import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./style.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3002/products/oneproduct`
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

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Produkt nie znaleziony</div>;

  return (
    <div className="product-detail-container">
      <h1>{product.title}</h1>
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
      </div>
    </div>
  );
};

export default ProductDetail;
