import User from "../models/User.js";

// GET /api/addresses
export const getAddresses = async (req, res) => {
  res.json(req.user.addresses);
};

// POST /api/addresses
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // if this is set as default, unset any existing default first
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// PUT /api/addresses/:addressId
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/addresses/:addressId
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};
