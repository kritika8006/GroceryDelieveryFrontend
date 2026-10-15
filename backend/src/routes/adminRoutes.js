import express from "express";
import {
  getDashboardStats,
  getAllOrders,
  getDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
} from "../controllers/adminController.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, isAdmin); // everything under /api/admin requires an admin

router.get("/dashboard", getDashboardStats);
router.get("/orders", getAllOrders);
router.get("/delivery-partners", getDeliveryPartners);
router.post("/delivery-partners", createDeliveryPartner);
router.put("/delivery-partners/:id", updateDeliveryPartner);

export default router;
