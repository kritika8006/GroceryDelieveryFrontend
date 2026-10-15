import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import DeliveryPartner from "../models/DeliveryPartner.js";

// GET /api/admin/dashboard — powers AdminDashboard.tsx
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, totalProducts, totalUsers, recentOrders, revenueAgg, outOfStock] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(10).populate("user", "name email"),
      Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Product.countDocuments({ stock: { $lte: 0 } }),
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      outOfStock,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders — every order, for AdminOrders.tsx
// GET /api/admin/orders?page=&limit= — paginated, for AdminOrders.tsx
export const getAllOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);

    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name email")
        .populate("deliveryPartner", "name phone"),
      Order.countDocuments(),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/delivery-partners
export const getDeliveryPartners = async (req, res, next) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/delivery-partners
export const createDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/delivery-partners/:id
export const updateDeliveryPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    res.json(partner);
  } catch (err) {
    next(err);
  }
};