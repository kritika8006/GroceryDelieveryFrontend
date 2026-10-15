import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Keeps Product.rating/reviewCount matching the real reviews — those two
// fields are what every product card and the product page already show.
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    // aggregate() doesn't auto-cast strings to ObjectId the way find() does —
    // without this cast, $match silently matches nothing and the average
    // always comes back 0.
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
};

// Only someone who actually received this product may review it — matches
// how most real stores gate reviews, and stops reviews on things never bought.
const hasPurchased = (userId, productId) =>
  Order.exists({ user: userId, status: "Delivered", "items.product": productId });

// GET /api/products/:id/can-review  — lets the frontend show/hide the review
// form without the user having to hit Submit first to find out they can't.
export const canReview = async (req, res, next) => {
  try {
    const purchased = await hasPurchased(req.user._id, req.params.id);
    res.json({ canReview: !!purchased });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/reviews
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews  — body: { rating, comment }
// One review per user per product: posting again overwrites their existing one.
export const upsertReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!(await hasPurchased(req.user._id, req.params.id))) {
      return res.status(403).json({ message: "You can only review products from a delivered order." });
    }

    const review = await Review.findOneAndUpdate(
      { product: req.params.id, user: req.user._id },
      { rating: ratingNum, comment: comment || "" },
      { upsert: true, new: true, runValidators: true }
    ).populate("user", "name avatar");

    await recalculateProductRating(req.params.id);
    res.json(review);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/reviews  — removes the logged-in user's own review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ product: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: "You haven't reviewed this product" });

    await recalculateProductRating(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};