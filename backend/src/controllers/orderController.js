import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const CANCELLABLE_STATUSES = ["Placed", "Confirmed"];

import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_OVER = 20; // keep in sync with frontend/src/pages/Checkout.tsx
const TAX_RATE = 0.05;

// POST /api/orders  — body: { items: [{ productId, quantity }], shippingAddress, paymentMethod }
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentIntentId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Never trust prices sent from the client — look them up fresh.
    const orderItems = [];
    let subtotal = 0;

    for (const { productId, quantity } of items) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: `Product ${productId} not found` });
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        unit: product.unit,
      });
      subtotal += product.price * quantity;

      product.stock -= quantity;
      await product.save();
    }

    const deliveryFee = subtotal > FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + deliveryFee + tax;

    // For card orders, never trust the browser about whether payment succeeded.
    // Ask Stripe directly, and check the charged amount actually matches this order's total
    // (a few cents of rounding slack is allowed for floating-point math).
    let isPaid = false;
    if (paymentMethod === "Card") {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // created per-call: see note in paymentRoutes.js
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Missing payment confirmation for card order" });
      }
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const expectedCents = Math.round(total * 100);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment has not completed yet" });
      }
      if (Math.abs(intent.amount - expectedCents) > 2) {
        return res.status(400).json({ message: "Payment amount does not match order total" });
      }
      isPaid = true;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: "Placed",
      statusHistory: [{ status: "Placed", note: "Order placed successfully" }],
      deliveryOtp: generateOtp(),
      isPaid,
      paymentIntentId: paymentMethod === "Card" ? paymentIntentId : undefined,
    });

     res.status(201).json(order);

    // Fire-and-forget: a slow or failing email should never hold up or break
    // an order that already succeeded. sendEmail() catches its own errors.
    const itemsHtml = orderItems
      .map((i) => `<tr><td style="padding:4px 0">${i.name} &times;${i.quantity}</td><td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`)
      .join("");
    sendEmail({
      to: req.user.email,
      subject: `Order confirmed — #${order._id.toString().slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#1F2B1E">Thanks for your order, ${req.user.name}!</h2>
          <p>Your order <b>#${order._id.toString().slice(-8).toUpperCase()}</b> has been placed.</p>
          <table style="width:100%;margin:16px 0">${itemsHtml}</table>
          <table style="width:100%;border-top:1px solid #E4DCC8;padding-top:8px">
            <tr><td>Subtotal</td><td style="text-align:right">$${subtotal.toFixed(2)}</td></tr>
            <tr><td>Delivery</td><td style="text-align:right">${deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</td></tr>
            <tr><td>Tax</td><td style="text-align:right">$${tax.toFixed(2)}</td></tr>
            <tr><td style="font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">$${total.toFixed(2)}</td></tr>
          </table>
          <p>Delivering to: ${shippingAddress.address}, ${shippingAddress.city}</p>
          <p style="color:#6B6355;font-size:13px">Track your order anytime in My Orders.</p>
        </div>
      `,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  — logged-in user's own orders

// GET /api/orders  — logged-in user's own orders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("deliveryPartner", "name phone vehicleType");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // owners and admins only
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status  (admin) — body: { status, note, liveLocation, deliveryPartnerId }
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, liveLocation, deliveryPartnerId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) {
      order.status = status;
      order.statusHistory.push({ status, note });
    }
    if (liveLocation) order.liveLocation = liveLocation;
    if (deliveryPartnerId) order.deliveryPartner = deliveryPartnerId;
    if (status === "Delivered") order.isPaid = true; // simple COD assumption

    await order.save();

    // Push the update in real time to anyone watching this order's tracking page
    const io = req.app.get("io");
    if (io) io.to(`order:${order._id}`).emit("orderUpdated", order);

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:id/verify-otp  — delivery partner confirms drop-off
export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    order.status = "Delivered";
    order.isPaid = true;
    order.statusHistory.push({ status: "Delivered", note: "Confirmed via OTP" });
    await order.save();

    const io = req.app.get("io");
    if (io) io.to(`order:${order._id}`).emit("orderUpdated", order);

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/location  (admin/rider) — body: { lat, lng }
// Called every few seconds by the rider page with the phone's real GPS position.
export const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return res.status(400).json({ message: "Valid lat and lng numbers are required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Out for Delivery") {
      return res.status(400).json({ message: "Location can only be shared while the order is Out for Delivery" });
    }

    order.liveLocation = { lat, lng, updatedAt: new Date() };
    await order.save();

    // small payload on purpose: no OTP, no order details
    const io = req.app.get("io");
    if (io) io.to(`order:${order._id}`).emit("locationUpdated", { orderId: String(order._id), liveLocation: order.liveLocation });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/:id/cancel  — the customer cancels their own order.
// Only allowed while the store hasn't started packing it yet; after that
// they need to contact support (an admin can still cancel from Admin Orders).
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({
        message: `This order is already ${order.status.toLowerCase()} and can no longer be cancelled here. Contact support for help.`,
      });
    }

    // put the stock back for every item in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
    await order.save();

    const io = req.app.get("io");
    if (io) io.to(`order:${order._id}`).emit("orderUpdated", order);

    res.json(order);
  } catch (err) {
    next(err);
  }
};