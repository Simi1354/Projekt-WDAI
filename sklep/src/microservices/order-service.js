const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "orders.db",
});

const Order = sequelize.define("Order", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
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
    const product = await Product.findByPk(productId);
    return product !== null;
  } catch (err) {
    throw new Error("Product not found");
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
      date: date || new Date(), // Use provided date or default to now
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
          model: Product,
          through: { attributes: ["quantity"] },
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
