import ProductList from "./components/ProductList.js";

function Home() {
  return (
    <>
      <h1 style={{ marginTop: "20px", marginBottom: "20px" }}>
        {" "}
        Strona główna{" "}
      </h1>
      <ProductList></ProductList>
    </>
  );
}

export default Home;
