import express from "express";
import { getCart, syncCart } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.put("/", syncCart);

export default router;