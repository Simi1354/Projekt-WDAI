const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "ratings.db",
});

const authenticate = (req, res, next) => {
  const role = req.user.userRole;
  if (role === "admin") next();
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

const Rating = sequelize.define("Rating", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  rate: { type: DataTypes.DOUBLE, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
});

sequelize.sync().then(() => console.log("Ratings database synced."));

app.get("/ratings", async (req, res) => {
  const ratings = await Rating.findAll();
  res.json(ratings);
});

app.get("/rating/:userId", async (req, res) => {
  const rating = await Rating.findAll({
    where: { userId: req.params.userId },
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
  if (!rating) return res.status(404).json({ message: "Rating not found" });
  res.json(rating);
});

app.head("/ratings/:id", async (req, res) => {
  const rating = await Rating.findByPk(req.params.id);
  if (!rating) return res.status(404).json({ message: "Rating not found" });
  res.status(200).end();
});

app.post("/ratings", authenticate, async (req, res) => {
  const { productId, rate, description } = req.body;

  try {
    const rating = await Rating.create({
      userId: req.user.id,
      productId,
      rate,
      description,
      date: date || new Date(),
    });
    res.status(201).json({ id: rating.id });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

app.delete("/ratings/:id", authenticate, async (req, res) => {
  const result = await Rating.destroy({ where: { id: req.params.id } });
  if (!result) return res.status(404).json({ message: "Rating not found" });
  res.json({ message: "Rating deleted" });
});

app.patch("/ratings/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { rate, description } = req.body;

  try {
    const rating = await Rating.findByPk(id);
    if (!rating) return res.status(404).json({ message: "Rating not found" });

    if (String(rating.userId) !== String(req.user.id)) {
      return res.status(403).json({
        message:
          "Unauthorized to modify this rating: " +
          rating.userId +
          " !== " +
          req.user.id,
      });
    }

    const fieldsToUpdate = {};
    if (rate) fieldsToUpdate.rate = rate;
    if (description) fieldsToUpdate.description = description;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await rating.update(fieldsToUpdate);

    res.json({ message: "Rating updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(3002, () => {
  console.log("Rating Service is running on http://localhost:3004");
});
