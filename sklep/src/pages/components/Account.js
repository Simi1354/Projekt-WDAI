import * as Icon from "react-bootstrap-icons";

const Account = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  return (
    <div>
      <h1>Wyloguj się</h1>
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
