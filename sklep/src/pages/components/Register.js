import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setMessage("Hasła nie są takie same");
    } else {
      try {
        // eslint-disable-next-line
        const response = await axios.post("http://localhost:3001/register", {
          email,
          password,
        });
        setMessage("Zarejestrowano pomyślnie! Możesz się zalogować.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data.message);
        } else {
          setMessage("Błąd rejestracji. Spróbuj ponownie");
        }
      }
    }
  };

  return (
    <div>
      <h1>Rejestracja</h1>
      <form onSubmit={handleRegister} className="login-form">
        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="login-input"
          placeholder="Powtórz hasło"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Zarejestruj się
        </button>
      </form>
      <h1>{message}</h1>
    </div>
  );
};

export default Register;
