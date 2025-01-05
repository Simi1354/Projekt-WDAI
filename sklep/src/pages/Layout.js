import { Outlet, Link } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  return (
    <>
      <nav className="Navbar">
        <Link className="Navbar_link" to="/">
          Strona główna
        </Link>
        <Link className="Navbar_link" to="/koszyk">
          Koszyk
        </Link>
        <Link className="Navbar_link" to="/rejestracja">
          Rejestracja
        </Link>
        <Link className="Navbar_link" to="/login">
          Logowanie
        </Link>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;
