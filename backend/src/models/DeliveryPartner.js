import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    avatar: { type: String, default: "" },
    vehicleType: { type: String, enum: ["bike", "scooter", "car"], default: "bike" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryPartner", deliveryPartnerSchema);
