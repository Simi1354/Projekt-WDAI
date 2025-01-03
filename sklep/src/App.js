import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.js";
import Home from "./pages/Home.js";
import Cart from "./pages/Cart.js";
import NoPage from "./pages/NoPage.js";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="koszyk" element={<Cart />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
