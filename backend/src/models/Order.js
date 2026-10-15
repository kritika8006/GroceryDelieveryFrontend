import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: "1 pc" },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },

    // snapshot of the address at order time (never mutate the user's saved address)
    shippingAddress: {
      label: String,
      address: String,
      city: String,
      state: String,
      zip: String,
      lat: Number,
      lng: Number,
    },

    paymentMethod: { type: String, default: "COD" },
        paymentIntentId: { type: String },

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: { type: String, enum: ORDER_STATUSES, default: "Placed" },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },
    deliveryOtp: { type: String, required: true },
    liveLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },

    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);