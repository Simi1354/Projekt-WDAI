const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// MongoDB URI for the Order Service (same as product service)
const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Define Mongoose models for Order and OrderProduct
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true },
});

const orderProductSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
});

const Order = mongoose.model("Order", orderSchema);
const OrderProduct = mongoose.model("OrderProduct", orderProductSchema);

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

async function productExists(productId) {
  try {
    // Use axios to send a HEAD request to the product service to check if the product exists
    const response = await axios.head(
      `http://localhost:3002/products/${productId}`
    );
    return response.status === 200; // If the product exists, the status will be 200
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false; // If the product is not found, return false
    }
    // Handle other errors (e.g., product-service is down)
    console.error("Error checking product existence:", err);
    return false;
  }
}

app.get("/orders", authenticate, async (req, res) => {
  try {
    // Fetch all orders for the authenticated user
    const orders = await Order.find({ userId: req.user.id })
      .select("-createdAt -updatedAt")
      .exec();

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        // Fetch all order products for this order
        const orderProducts = await OrderProduct.find({
          orderId: order._id,
        }).exec();

        // Fetch product details for each product in the order
        const productDetails = await Promise.all(
          orderProducts.map(async (orderProduct) => {
            // Fetch the product details from the product-service
            const product = await axios.post(
              `http://localhost:3002/products/oneproduct`,
              { productId: orderProduct.productId }
            );
            // Return the product data along with the quantity from the OrderProduct
            return { ...product.data, quantity: orderProduct.quantity }; // Use `product.data` instead of `product.toObject()`
          })
        );

        // Return the order with the populated product details
        return { ...order.toObject(), products: productDetails };
      })
    );

    res.json(populatedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/orders", authenticate, async (req, res) => {
  const { products, date } = req.body; // 'products' is an array of { productId, quantity }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    // Ensure all products exist in the product-service
    for (const { productId } of products) {
      const exists = await productExists(productId);
      if (!exists) {
        return res
          .status(404)
          .json({ message: `Product ${productId} not found` });
      }
    }

    // Create the order
    const order = new Order({
      userId: req.user.id,
      date: date || new Date(),
    });
    await order.save();

    // Associate products with the order
    const orderProducts = products.map(({ productId, quantity }) => ({
      orderId: order._id,
      productId,
      quantity,
    }));
    await OrderProduct.insertMany(orderProducts);

    res.status(201).json({
      id: order._id,
      userId: order.userId,
      date: order.date,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/orders", authenticate, async (req, res) => {
  const { orderId, products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const order = await Order.findById(orderId).exec();
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (String(order.userId) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to modify this order" });
    }

    // Validate all product IDs before updating
    // for (const { productId } of products) {
    //   const exists = await productExists(productId);
    //   if (!exists) {
    //     return res
    //       .status(404)
    //       .json({ message: `Product ${productId} not found` });
    //   }
    // }

    // Delete old products and add new ones
    await OrderProduct.deleteMany({ orderId: order._id }).exec();

    const orderProducts = products.map(({ productId, quantity }) => ({
      orderId: order._id,
      productId,
      quantity,
    }));
    await OrderProduct.insertMany(orderProducts);

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/orders", authenticate, async (req, res) => {
  try {
    const result = await Order.deleteOne({ _id: req.body.orderId }).exec();
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Order not found" });
    await OrderProduct.deleteMany({ orderId: req.body.orderId }).exec();
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3003, () => {
  console.log("Order Service is running on http://localhost:3003");
});
