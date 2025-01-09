import { Outlet, Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import "./Layout.css";

const Layout = () => {
  return (
    <>
      <nav className="Navbar">
        <Link className="Navbar_link" to="/">
          Strona główna
        </Link>
        <Link className="Navbar_link" to="/koszyk">
          <Icon.Cart2 size={50} style={{ margin: "10px" }} />
          <b> Koszyk </b>
        </Link>

        <Link className="Navbar_link" to="/login">
          <Icon.Person size={50} style={{ margin: "5px" }} />
          <b> Twoje konto</b>
        </Link>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;
