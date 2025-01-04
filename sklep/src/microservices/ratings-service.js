const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "ratings.db",
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  // try {
  //   const decoded = jwt.verify(token, "SECRET_KEY");
  //   req.user = decoded;

  //   if (req.user.role === "admin") {
  //     return next();
  //   }

  //   if (req.params.id) {
  //     const { id } = req.params;
  //     Rating.findByPk(id).then((rating) => {
  //       if (rating && String(rating.userId) === String(req.user.id)) {
  //         return next();
  //       } else {
  //         return res.status(403).json({
  //           message: "You are not authorized to modify this rating",
  //         });
  //       }
  //     });
  //   } else {
  //     return next();
  //   }
  // } catch (error) {
  //   res.status(403).json({ message: "Invalid token" });
  // }
  // };
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
    await axios.head(`http://localhost:3002/products/${productId}`);
    return true;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return false;
    }
    throw new Error("Book service unavailable");
  }
}

const Rating = sequelize.define("Rating", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  rate: { type: DataTypes.DOUBLE, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATE, allowNull: false },
});
sequelize.sync().then(() => console.log("Ratings database synced."));

app.get("/ratings/:productId", async (req, res) => {
  const ratings = await Rating.findAll({
    where: { productId: req.params.productId },
  });

  if (ratings.length === 0) {
    return res.json({ message: "No ratings found for this product" });
  }

  res.json(ratings);
});

// app.get("/rating/:userId", async (req, res) => {
//   const rating = await Rating.findAll({
//     where: { userId: req.params.userId },
//     attributes: { exclude: ["createdAt", "updatedAt"] },
//   });
//   if (!rating) return res.status(404).json({ message: "Rating not found" });
//   res.json(rating);
// });

//Metoda zwracająca informacje czy opinia istnieje (błąd 404 nie pozwalający na dodanie kolejnej opini produktu od danego użytkownika)
// lub zwrócenie statusu 200 w przypadku nie znalezienia takiej opini.

app.head("/ratings/:userId/:productId", async (req, res) => {
  const rating = await Rating.findOne({
    where: {
      userId: req.params.userId,
      productId: req.params.productId,
    },
  });
  if (rating) {
    return res.status(409).json({ message: "Rating already exists" });
  }
  res.status(200).end();
});

app.post("/ratings/:productId", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { rate, description, date } = req.body;

  const exists = await productExists(productId);
  if (!exists) return res.status(404).json({ message: "Product not found" });

  const existingRating = await Rating.findOne({
    where: {
      userId: req.user.id,
      productId: productId,
    },
  });
  if (existingRating) {
    return res
      .status(409)
      .json({ message: "You have already rated this product" });
  }

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
        message: "Unauthorized to modify this rating",
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

app.listen(3004, () => {
  console.log("Rating Service is running on http://localhost:3004");
});
