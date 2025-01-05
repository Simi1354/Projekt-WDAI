const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "products.db",
});

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

const Product = sequelize.define("Product", {
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  rating: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const value = this.getDataValue("rating");
      return value ? JSON.parse(value) : { rate: 0, count: 0 };
    },
    set(value) {
      this.setDataValue("rating", JSON.stringify(value));
    },
  },
});

sequelize.sync().then(() => console.log("Products database synced."));

app.get("/products", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

app.head("/products/:id", async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.status(200).end();
});

app.post("/products", authenticate, async (req, res) => {
  const { title, price, description, category, image, rating } = req.body;

  try {
    const product = await Product.create({
      title,
      price,
      description,
      category,
      image,
      rating,
    });
    res.status(201).json({ id: product.id });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// app.delete("/products/:id", authenticate, async (req, res) => {
//   const result = await Product.destroy({ where: { id: req.params.id } });
//   if (!result) return res.status(404).json({ message: "Product not found" });
//   res.json({ message: "Product deleted" });
// });

app.listen(3002, () => {
  console.log("Product Service is running on http://localhost:3002");
});
