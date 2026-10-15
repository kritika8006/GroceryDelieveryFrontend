import Product from "../models/Product.js";

// GET /api/products?category=&search=&sort=&page=&limit=
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/deals  -> products with a real discount, for FlashDeals page
export const getDeals = async (req, res, next) => {
  try {
    const deals = await Product.find({ $expr: { $lt: ["$price", "$originalPrice"] } }).limit(24);
    res.json(deals);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products  (admin)
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id  (admin)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};
// POST /api/products/upload  (admin) — multipart/form-data, field name "image"
// Returns a URL under /uploads/... that can be saved straight into a product's `image` field.
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file received" });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
};
