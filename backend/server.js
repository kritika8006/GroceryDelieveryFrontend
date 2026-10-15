import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./src/models/User.js";
import Order from "./src/models/Order.js";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
dotenv.config();
connectDB();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFound);
app.use(errorHandler);

// --- Socket.io for live order tracking (OrderTracking.tsx) ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});

// Only logged-in users may connect, and only to rooms for their own orders (admins: any order)
io.use(async (socket, next) => {
  try {
    const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id);
    next(socket.user ? undefined : new Error("unauthorized"));
  } catch {
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  // frontend calls socket.emit("joinOrder", orderId) on the tracking page
  socket.on("joinOrder", async (orderId) => {
    try {
      const order = await Order.findById(orderId).select("user");
      if (order && (socket.user.isAdmin || order.user.toString() === socket.user._id.toString())) {
        socket.join(`order:${orderId}`);
      }
    } catch {
      /* ignore bad ids */
    }
  });
});

app.set("io", io); // controllers read this via req.app.get("io")

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));