import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./style.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price");

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sortBy === "price") {
      return (
        parseFloat(a.price.$numberDecimal) - parseFloat(b.price.$numberDecimal)
      );
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list-container">
      <h1>Produkty</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Szukaj produktów..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="sort-options">
        <label htmlFor="sort-by">Sortuj według:</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortChange}
          className="sort-select"
        >
          <option value="price">Cena</option>
          <option value="title">Tytuł</option>
          <option value="category">Kategoria</option>
        </select>
      </div>

      <div className="product-list">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <div className="product-card" key={product._id}>
              <Link
                to={`/produkty/${product._id}`}
                className="product-link"
                style={{ textDecoration: "none" }}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-details">
                  <h2 className="product-title">{product.title}</h2>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">
                    ${product.price.$numberDecimal}
                  </p>
                  <p className="product-category">{product.category}</p>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-results">Brak wyników dla "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
