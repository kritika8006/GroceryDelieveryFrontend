import express from "express";
import {
  getProducts,
  getDeals,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../controllers/productController.js";
import { getReviews, upsertReview, deleteReview, canReview } from "../controllers/reviewController.js";
import { uploadProductImage } from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/deals", getDeals);
router.get("/", getProducts);
router.get("/:id", getProductById);

router.get("/:id/reviews", getReviews);
router.get("/:id/can-review", protect, canReview);
router.post("/:id/reviews", protect, upsertReview);
router.delete("/:id/reviews", protect, deleteReview);

router.post("/upload", protect, isAdmin, uploadProductImage, uploadImage);
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;