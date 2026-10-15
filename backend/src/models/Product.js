import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }, // category slug, e.g. "fruits-vegetables"
    unit: { type: String, default: "1 pc" },
    stock: { type: Number, default: 0 },
    isOrganic: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// discount is derived, not stored, so it can never drift out of sync
productSchema.virtual("discount").get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
