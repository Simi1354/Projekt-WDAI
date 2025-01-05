const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "orders.db",
});

const Order = sequelize.define("Order", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
});

const OrderProduct = sequelize.define("OrderProduct", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
});

sequelize.sync().then(() => console.log("Orders database synced."));

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
    return response.status === 200; // Product exists
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false; // Product does not exist
    }
    throw new Error("Product service unavailable or error occurred");
  }
}

// async function productExists(productId) {
//   try {
//     await axios.head(`http://localhost:3002/products/${productId}`);
//     return true;
//   } catch (err) {
//     if (err.response && err.response.status === 404) {
//       return false;
//     }
//     throw new Error("Product unavailable");
//   }
// }

app.get("/orders/:userId", async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.params.userId },
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: {
      model: OrderProduct, // Include OrderProduct for quantity information
      include: {
        model: Product, // Retrieve associated Product details (but no need to define Product model here)
        attributes: ["id", "title", "price"], // Adjust attributes as needed
      },
    },
  });
  res.json(orders);
});

app.post("/orders", authenticate, async (req, res) => {
  const { products, date } = req.body; // 'products' is an array of { productId, quantity }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    // Ensure all products exist in the products database
    for (const { productId } of products) {
      const exists = await productExists(productId);
      if (!exists) {
        return res
          .status(404)
          .json({ message: `Product ${productId} not found` });
      }
    }

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      date: date | new Date(),
    });

    // Associate products with the order
    for (const { productId, quantity } of products) {
      await OrderProduct.create({
        orderId: order.id,
        productId,
        quantity,
      });
    }

    res.status(201).json({
      id: order.id,
      userId: order.userId,
      date: order.date,
      products: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/orders/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { products } = req.body; // Array of products { productId, quantity }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data" });
  }

  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderProduct,
          include: {
            model: Product, // You can still fetch product details, but no need to define Product in the current file
            attributes: ["id", "title", "price"], // You may add more attributes to return
          },
        },
      ],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (String(order.userId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "Unauthorized to modify this order",
      });
    }

    // Validate all product IDs before updating
    for (const { productId } of products) {
      const exists = await productExists(productId);
      if (!exists) {
        return res
          .status(404)
          .json({ message: `Product ${productId} not found` });
      }
    }

    // Delete old products and add new ones
    await OrderProduct.destroy({ where: { orderId: order.id } });

    for (const { productId, quantity } of products) {
      await OrderProduct.create({
        orderId: order.id,
        productId,
        quantity,
      });
    }

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.delete("/orders/:id", authenticate, async (req, res) => {
//   const result = await Order.destroy({ where: { id: req.params.id } });
//   if (!result) return res.status(404).json({ message: "Order not found" });
//   res.json({ message: "Order deleted" });
// });

app.listen(3003, () => {
  console.log("Order Service is running on http://localhost:3003");
});
