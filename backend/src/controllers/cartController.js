import Cart from "../models/Cart.js";

// GET /api/cart — returns items with full product details populated.
// Any item whose product was deleted since it was added is silently dropped
// here rather than crashing the response.
export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.json({ items: [] });

    const items = cart.items.filter((i) => i.product).map((i) => ({ product: i.product, quantity: i.quantity }));
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart  — body: { items: [{ productId, quantity }] }
// Replaces the whole cart in one call. The frontend sends its full current
// state (debounced) after every add/remove/quantity change, so this stays
// a simple "overwrite", not a diff.
export const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    const cleanItems = items
      .filter((i) => i.productId && Number(i.quantity) > 0)
      .map((i) => ({ product: i.productId, quantity: Math.floor(Number(i.quantity)) }));

    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: cleanItems },
      { upsert: true, new: true }
    ).populate("items.product");

    const responseItems = cart.items.filter((i) => i.product).map((i) => ({ product: i.product, quantity: i.quantity }));
    res.json({ items: responseItems });
  } catch (err) {
    next(err);
  }
};