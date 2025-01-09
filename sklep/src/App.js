import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.js";
import Home from "./pages/Home.js";
import Cart from "./pages/Cart.js";
import NoPage from "./pages/NoPage.js";
import Register from "./pages/components/Register.js";
import Login from "./pages/components/Login.js";
import ProductList from "./pages/components/ProductList.js";
import ProductDetail from "./pages/components/ProductDetails.js";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="koszyk" element={<Cart />} />
            <Route path="/rejestracja" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="produkty" element={<ProductList />} />
            <Route path="produkty/:id" element={<ProductDetail />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
