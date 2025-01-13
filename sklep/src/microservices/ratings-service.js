const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");

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

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Register User model
const User = mongoose.model("User", UserSchema);

// Define the Rating model using Mongoose
const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rate: { type: Number, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
});

const Rating = mongoose.model("Rating", RatingSchema);

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

async function productExists(productId) {
  try {
    const response = await axios.post(
      `http://localhost:3002/products/oneproduct`,
      { productId }
    );
    return response.status === 200;
  } catch (err) {
    console.error("Error checking product:", err);
    return false;
  }
}

// Routes for Ratings

// Get all ratings for a product
app.get("/ratings", async (req, res) => {
  try {
    const ratings = await Rating.find({ productId: req.body.productId });
    if (ratings.length === 0) {
      return res.json({ message: "No ratings found for this product" });
    }
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/ratings/find", async (req, res) => {
  try {
    const ratings = await Rating.find({
      productId: req.body.productId,
    }).populate("userId", "email _id");

    if (ratings.length === 0) {
      return res.json({ message: "No ratings found for this product" });
    }

    const ratingsWithUserEmails = ratings.map((rating) => ({
      _id: rating._id,
      productId: rating.productId,
      rate: rating.rate,
      description: rating.description,
      date: rating.date,
      userId: rating.userId._id,
      userEmail: rating.userId.email,
    }));

    res.json(ratingsWithUserEmails);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// Check if the rating exists (head request)
app.head("/ratings/:userId/:productId", async (req, res) => {
  try {
    const rating = await Rating.findOne({
      userId: req.params.userId,
      productId: req.params.productId,
    });
    if (rating) {
      return res.status(409).json({ message: "Rating already exists" });
    }
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Create a new rating for a product
app.post("/ratings", authenticate, async (req, res) => {
  const { productId, rate, description, date } = req.body;

  const exists = await productExists(productId);
  if (!exists) return res.status(404).json({ message: "Product not found" });

  const existingRating = await Rating.findOne({
    userId: req.user.id,
    productId: productId,
  });
  if (existingRating) {
    return res.status(409).json({ message: "Już oceniłeś/aś ten produkt" });
  }

  try {
    const rating = new Rating({
      userId: req.user.id,
      productId,
      rate,
      description,
      date: date || new Date(),
    });
    await rating.save();
    res.status(201).json({ id: rating._id });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Delete a rating
app.delete("/ratings", authenticate, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      // Admin
      const result = await Rating.deleteOne({
        _id: req.body.id,
        userId: req.user.id,
      });
      res.json({ message: `${_id} rating has been deleted` });
    } else {
      // Normal user
      const result = await Rating.deleteOne({
        _id: req.body.id,
        userId: req.user.id,
      });
      if (result.deletedCount === 0)
        return res
          .status(404)
          .json({
            message:
              "Rating not found or you don't have permission to delete this rating",
          });
      res.json({ message: "Rating deleted" });
    }
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Update a rating
app.patch("/ratings", authenticate, async (req, res) => {
  const { id, rate, description } = req.body;

  try {
    const rating = await Rating.findById(id);
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

    await rating.updateOne(fieldsToUpdate);

    res.json({ message: "Rating updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(3004, () => {
  console.log("Rating Service is running on http://localhost:3004");
});
