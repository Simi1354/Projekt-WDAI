const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

// Connect to MongoDB
const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// User model using Mongoose
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "user" },
});

const User = mongoose.model("User", UserSchema);

// Register route
app.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userRole = role === "admin" ? "admin" : "user";
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const user = new User({
      email,
      password: hashedPassword,
      role: userRole,
    });
    await user.save();
    res.status(201).json({ id: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Database error" });
  }
});

// Login route

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(401)
      .json({ message: "No account connected to this email" });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ token, userId: user._id, role: user.role });
});

app.get("/userrole", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, "SECRET_KEY", async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const userId = decoded.id;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ role: user.role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

app.listen(3001, () => {
  console.log("Auth Service is running on http://localhost:3001");
});
