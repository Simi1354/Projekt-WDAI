const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

// MongoDB URI
const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Define Mongoose schema and model for Cart
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [
    {
      productId: { type: String, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
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
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.post("/cart", authenticate, async (req, res) => {
  const { userId, product } = req.body;

  if (!product.productId || product.quantity == null || product.quantity <= 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const exists = await productExists(product.productId);
    if (!exists) {
      return res
        .status(404)
        .json({ message: `Product ${product.productId} not found` });
    }

    let cart = await Cart.findOne({ userId }).exec();

    if (!cart) {
      cart = new Cart({
        userId,
        products: [product],
      });
    } else {
      const productIndex = cart.products.findIndex(
        (p) => String(p.productId) === String(product.productId)
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += product.quantity;
      } else {
        cart.products.push(product);
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart" });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res.status(500).json({ message: err.message });
  }
});

// Check if product exists
async function productExists(productId) {
  try {
    const response = await axios.post(
      `http://localhost:3002/products/oneproduct`,
      { productId }
    );
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
app.get("/cart/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).exec();
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
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a product from the cart
app.delete("/cart/:userId/:productId", authenticate, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    console.log(`Removing product with ID: ${productId} for user: ${userId}`);
    const cart = await Cart.findOne({ userId }).exec();

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) => String(p.productId) === String(productId)
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);
      await cart.save();
      console.log(`Product with ID: ${productId} removed from cart`);
      return res.status(200).json({ message: "Product removed from cart" });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.error("Error removing product from cart:", err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(3005, () => {
  console.log("Cart service listening on port 3005");
});
