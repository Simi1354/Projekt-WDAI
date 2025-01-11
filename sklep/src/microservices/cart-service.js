const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// MongoDB URI
const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Define Mongoose schema and model for Cart
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);

// Middleware to authenticate
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

// Check if product exists
async function productExists(productid) {
  try {
    const response = await axios.head(`http://localhost:3002/products`, {
      productId: productid,
    });
    return response.status === 200;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false;
    }
    console.error("Error checking product existence:", err);
    return false;
  }
}

// Get the cart for the authenticated user
app.get("/cart", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).exec();
    if (!cart) return res.json({ products: [] });

    const detailedProducts = await Promise.all(
      cart.products.map(async ({ productId, quantity }) => {
        const product = await axios.post(
          `http://localhost:3002/products/oneproduct`,
          { productId: productId }
        );
        return { ...product.data, quantity };
      })
    );

    res.json({ products: detailedProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add or update products in the cart
app.post("/cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity == null || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const exists = await productExists(productId);
    if (!exists) {
      return res
        .status(404)
        .json({ message: `Product ${productId} not found` });
    }

    let cart = await Cart.findOne({ userId: req.user.id }).exec();

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        products: [{ productId, quantity }],
      });
    } else {
      const productIndex = cart.products.findIndex(
        (p) => String(p.productId) === String(productId)
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a product from the cart
app.delete("/cart", authenticate, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id }).exec();

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => String(p.productId) !== String(productId)
    );

    await cart.save();
    res.status(200).json({ message: "Product removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quantity of a product in the cart
app.patch("/cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity == null || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id }).exec();

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) => String(p.productId) === String(productId)
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ message: "Cart updated" });
    } else {
      res.status(404).json({ message: "Product not in cart" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3005, () => {
  console.log("Cart Service is running on http://localhost:3005");
});
