const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Define a Product model using Mongoose
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: false },
  rating: {
    type: Map,
    of: Number,
    default: { rate: 0, count: 0 },
  },
});

const Product = mongoose.model("Product", ProductSchema);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Routes for Products

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Get a product by ID
app.post("/products/oneproduct", async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Head request for checking if product exists
app.head("/products", async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Create a new product
app.post("/products", authenticate, async (req, res) => {
  const { title, price, description, category, image, rating } = req.body;

  try {
    const product = new Product({
      title,
      price,
      description,
      category,
      image,
      rating,
    });
    await product.save();
    res.status(201).json({ id: product._id });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Delete a product
app.delete("/products", authenticate, async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.body.productId });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(3002, () => {
  console.log("Product Service is running on http://localhost:3002");
});
