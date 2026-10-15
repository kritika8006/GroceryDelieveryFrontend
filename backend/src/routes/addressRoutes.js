import express from "express";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // every address route requires login

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);

export default router;
