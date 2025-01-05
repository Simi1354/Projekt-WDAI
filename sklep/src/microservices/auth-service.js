const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "auth.db",
});

const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" },
});

sequelize.sync().then(() => console.log("Auth database synced."));

app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userRole = role === "admin" ? "admin" : "user";
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = await User.create({
      email,
      password: hashedPassword,
      role: userRole,
    });
    res.status(201).json({ id: user.id });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res
      .status(401)
      .json({ message: "No account connected to this email" });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ token });
});

app.listen(3001, () => {
  console.log("Auth Service is running on http://localhost:3001");
});

// // Użyj middleware CORS
// app.use(
//   cors({
//     origin: "http://localhost:3000", // Zezwól na żądania z tej domeny
//     methods: ["GET", "POST", "PUT", "DELETE"], // Zezwolone metody
//     allowedHeaders: ["Content-Type", "Authorization"], // Zezwolone nagłówki
//   })
// );

// app.options("*", cors()); // Obsługa preflight dla wszystkich endpointów

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
//   next();
// });
