import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  lat: { type: Number },
  lng: { type: Number },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    addresses: [addressSchema],
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Expose _id-style address subdocs the same way the frontend expects
userSchema.set("toJSON", { virtuals: true });

export default mongoose.model("User", userSchema);