import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  verifyOtp,
  updateLocation,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", isAdmin, updateOrderStatus);
router.put("/:id/location", isAdmin, updateLocation);
router.post("/:id/verify-otp", isAdmin, verifyOtp);
router.post("/:id/cancel", cancelOrder);

export default router;