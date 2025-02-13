const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

// MongoDB URI for the Order Service (same as product service)
const ATLAS_URI =
  "mongodb+srv://mateuszjestemja90:MEhb52lqmnzfjSvB@cluster0.0yspy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas!"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Mongoose models for Order and OrderProduct
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
    const response = await axios.head(
      `http://localhost:3002/products/${productId}`
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

app.get("/orders/:userId", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .select("-createdAt -updatedAt")
      .exec();

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const orderProducts = await OrderProduct.find({
          orderId: order._id,
        }).exec();
        const productDetails = await Promise.all(
          orderProducts.map(async (orderProduct) => {
            const product = await axios.post(
              `http://localhost:3002/products/oneproduct`,
              { productId: orderProduct.productId }
            );
            return { ...product.data, quantity: orderProduct.quantity };
          })
        );

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
    for (const { productId } of products) {
      const exists = await productExists(productId);
      if (!exists) {
        return res
          .status(404)
          .json({ message: `Product ${productId} not found` });
      }
    }

    const order = new Order({
      userId: req.user.id,
      date: date || new Date(),
    });
    await order.save();

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
