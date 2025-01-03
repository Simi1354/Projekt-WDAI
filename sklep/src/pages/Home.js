import { useEffect, useState } from "react";

function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.products);
      })
      .catch((error) => {
        console.error("Błąd w pobieraniu danych:", error);
      });
  }, []);
  return (
    <>
      <h1> Strona główna </h1>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>{product.price}</p>
        </div>
      ))}
    </>
  );
}

export default Home;
