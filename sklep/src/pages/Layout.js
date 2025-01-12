import { useContext } from "react";
import { AuthContext } from "./components/AuthContext.js";
import { Outlet, Link } from "react-router-dom";
import * as Icon from "react-bootstrap-icons";
import "./Layout.css";

const Layout = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <>
      <nav className="Navbar">
        <Link className="account_link" style={{ float: "left" }} to="/">
          <Icon.House size={45} style={{ margin: "5px", marginRight: "7px" }} />
          <b>Strona główna</b>
        </Link>
        {isLoggedIn ? (
          <Link className="account_link" style={{ float: "right" }} to="/konto">
            <Icon.Person
              size={50}
              style={{ margin: "5px", marginRight: "2px" }}
            />
            <b> Twoje konto</b>
          </Link>
        ) : (
          <Link className="account_link" style={{ float: "right" }} to="/login">
            <Icon.Person
              size={50}
              style={{ margin: "5px", marginRight: "2px" }}
            />
            <b> Zaloguj się </b>
          </Link>
        )}
        <Link className="account_link" style={{ float: "right" }} to="/koszyk">
          <Icon.Cart2 size={50} style={{ margin: "5px", marginTop: "1px" }} />
          <b> Koszyk </b>
        </Link>
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;
