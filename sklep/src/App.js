import { BrowserRouter, Routes, Route } from "react-router-dom";
import Account from "./pages/components/Account";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import NoPage from "./pages/NoPage";
import Register from "./pages/components/Register";
import Login from "./pages/components/Login";
import ProductList from "./pages/components/ProductList";
import ProductDetail from "./pages/components/ProductDetail";
import ProtectedRoute from "./pages/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="konto"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="koszyk"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route path="rejestracja" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="produkty" element={<ProductList />} />
          <Route path="produkty/:id" element={<ProductDetail />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
