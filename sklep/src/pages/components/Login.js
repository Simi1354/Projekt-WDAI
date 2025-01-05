import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
      <h2> Logowanie </h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Zaloguj się</button>
      </form>
      <p>{message}</p>
    </>
  );
};

export default Login;
