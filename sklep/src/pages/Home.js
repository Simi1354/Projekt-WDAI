import ProductList from "./components/ProductList.js";

function Home() {
  return (
    <>
      <h1> Strona główna </h1>
      <h2>
        Witaj na naszej stronie internetowej, gdzie kupisz wszystkie potrzebne w
        życiu codziennym artykuły.
      </h2>
      <ProductList></ProductList>
    </>
  );
}

export default Home;
