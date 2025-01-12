import * as Icon from "react-bootstrap-icons";
import "./style.css";

const Account = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserEmail");
    window.location.href = "/login";
  };

  const name = localStorage.getItem("currentUserEmail");
  return (
    <div>
      <h1>Panel użytkownika</h1>
      <h2>Witaj, {name}!</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleLogout}
          className="login-button"
          style={{ width: "30%", alignItems: "center" }}
        >
          <Icon.BoxArrowRight
            size={30}
            style={{
              marginTop: "-4px",
              marginRight: "4px",
              justifyContent: "center",
            }}
          />{" "}
          Wyloguj się{" "}
        </button>
      </div>
    </div>
  );
};

export default Account;
