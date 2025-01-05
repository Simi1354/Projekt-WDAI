import { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3002/products");
        setProducts(response.data);
      } catch (err) {
        setError("Błąd pobierania danych");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div> Ładowanie...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Produkty</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category}</p>
            <img
              src={product.image}
              alt={product.title}
              style={{ width: "100px" }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
