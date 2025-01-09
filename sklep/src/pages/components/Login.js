import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      setMessage("Login successful!");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.error(
        "Login failed:",
        err.response?.data?.message || err.message
      );
      setMessage(
        "Login failed: " + (err.response?.data?.message || "Unknown error")
      );
    }
  };

  return (
    <>
      <h1> Zaloguj się </h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button">
          <Icon.BoxArrowInRight
            size={30}
            style={{
              marginTop: "-5px",
              marginBottom: "-9px",
              marginRight: "4px",
              justifyContent: "center",
            }}
          />{" "}
          Zaloguj się
        </button>
        <p className="login_p"> Nie masz konta? </p>
        <Link
          to="/rejestracja"
          className="login-button"
          style={{ alignItems: "center" }}
        >
          <Icon.PersonAdd
            size={30}
            style={{
              marginTop: "-5px",
              marginBottom: "-9px",
              marginRight: "4px",
              justifyContent: "center",
            }}
          />{" "}
          Zarejestruj się{" "}
        </Link>
      </form>
      <h1>{message}</h1>
    </>
  );
};

export default Login;
