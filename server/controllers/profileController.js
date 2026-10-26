const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");

// GET /api/profile
// Get the logged-in customer's profile.
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email phone addresses role createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Unable to load your profile.",
    });
  }
};

// PATCH /api/profile
// Update the logged-in customer's account details.
const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name is required.",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          message: "Name cannot exceed 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({
          message: "Please provide a valid email address.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address.",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user.userId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "This email address is already registered.",
        });
      }

      updates.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.trim().length > 20) {
        return res.status(400).json({
          message: "Please provide a valid phone number.",
        });
      }

      updates.phone = phone.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("name email phone addresses role createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email address is already registered.",
      });
    }

    return res.status(500).json({
      message: "Unable to update your profile.",
    });
  }
};

// GET /api/profile/orders
// Return only orders belonging to the logged-in customer.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      message: "Unable to load your orders.",
    });
  }
};

// Helper: when an address becomes the default,
// make all other saved addresses non-default.
const applyDefaultAddress = (addresses, selectedAddressId) => {
  addresses.forEach((address) => {
    address.isDefault =
      address._id.toString() === selectedAddressId.toString();
  });
};

// POST /api/profile/addresses
const addMyAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const {
      label,
      recipientName,
      phone,
      addressLine,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const address = {
      label: label || "Home",
      recipientName,
      phone,
      addressLine,
      landmark: landmark || "",
      city,
      state,
      postalCode,
      country: country || "India",
      isDefault: Boolean(isDefault),
    };

    user.addresses.push(address);

    const newAddress = user.addresses[user.addresses.length - 1];

    if (user.addresses.length === 1 || isDefault) {
      applyDefaultAddress(user.addresses, newAddress._id);
    }

    await user.save();

    return res.status(201).json({
      message: "Address saved successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Unable to save this address.",
    });
  }
};

// PATCH /api/profile/addresses/:addressId
const updateMyAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        message: "Saved address not found.",
      });
    }

    const allowedFields = [
      "label",
      "recipientName",
      "phone",
      "addressLine",
      "landmark",
      "city",
      "state",
      "postalCode",
      "country",
      "isDefault",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    }

    if (address.isDefault) {
      applyDefaultAddress(user.addresses, address._id);
    }

    await user.save();

    return res.status(200).json({
      message: "Address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Unable to update this address.",
    });
  }
};

// DELETE /api/profile/addresses/:addressId
const deleteMyAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        message: "Invalid address ID.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        message: "Saved address not found.",
      });
    }

    const wasDefault = address.isDefault;

    user.addresses.pull({ _id: addressId });

    // If the default address was removed, choose another one.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      message: "Unable to delete this address.",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyOrders,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
};