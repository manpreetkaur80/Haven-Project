const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const { evaluateCoupon } = require("../utils/coupons");

/* ---------- Customer: preview a code in the bag/checkout ---------- */

// POST /api/coupons/validate   { code, subtotal }
const validateCoupon = async (req, res) => {
    try {
        const subtotal = Number(req.body.subtotal);

        if (!Number.isFinite(subtotal) || subtotal < 0) {
            return res.status(400).json({ message: "Invalid order amount." });
        }

        const { coupon, discountAmount } = await evaluateCoupon(
            req.body.code,
            subtotal
        );

        return res.json({
            code: coupon.code,
            description: coupon.description,
            discountAmount,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error("Validate coupon error:", error);
        return res.status(500).json({ message: "Unable to check this code." });
    }
};

/* ---------- Admin CRUD ---------- */

function cleanCouponBody(body) {
    const discountType = body.discountType;
    const value = Number(body.value);
    const maxDiscount = Number(body.maxDiscount || 0);
    const minOrderAmount = Number(body.minOrderAmount || 0);
    const usageLimit = Number(body.usageLimit || 0);
    const code = String(body.code || "").trim().toUpperCase();

    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
        throw Object.assign(
            new Error("Code must be 3–30 letters, numbers, - or _."),
            { statusCode: 400 }
        );
    }
    if (!["percent", "flat"].includes(discountType)) {
        throw Object.assign(new Error("Choose a discount type."), { statusCode: 400 });
    }
    if (!Number.isFinite(value) || value < 1) {
        throw Object.assign(new Error("Enter a discount value."), { statusCode: 400 });
    }
    if (discountType === "percent" && value > 90) {
        throw Object.assign(new Error("Percentage discounts can be at most 90%."), {
            statusCode: 400,
        });
    }
    if (
        [maxDiscount, minOrderAmount, usageLimit].some(
            (n) => !Number.isFinite(n) || n < 0
        )
    ) {
        throw Object.assign(new Error("Amounts cannot be negative."), { statusCode: 400 });
    }

    let expiresAt = null;
    if (body.expiresAt) {
        expiresAt = new Date(body.expiresAt);
        if (Number.isNaN(expiresAt.getTime())) {
            throw Object.assign(new Error("Invalid expiry date."), { statusCode: 400 });
        }
        // Valid through the end of the chosen day.
        expiresAt.setHours(23, 59, 59, 999);
    }

    return {
        code,
        description: String(body.description || "").trim().slice(0, 120),
        discountType,
        value,
        maxDiscount: discountType === "percent" ? maxDiscount : 0,
        minOrderAmount,
        usageLimit: Math.floor(usageLimit),
        expiresAt,
        isActive: body.isActive !== false,
    };
}

function sendError(res, error, fallback) {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.code === 11000) {
        return res.status(409).json({ message: "That code already exists." });
    }
    console.error(fallback, error);
    return res.status(500).json({ message: fallback });
}

// GET /api/admin/coupons
const listCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ coupons });
    } catch (error) {
        sendError(res, error, "Unable to load coupons.");
    }
};

// POST /api/admin/coupons
const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(cleanCouponBody(req.body));
        res.status(201).json({ coupon });
    } catch (error) {
        sendError(res, error, "Unable to create the coupon.");
    }
};

// PATCH /api/admin/coupons/:id   (full edit, or { isActive } to switch on/off)
const updateCoupon = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid coupon." });
        }

        const existing = await Coupon.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: "Coupon not found." });
        }

        const onlyToggle =
            Object.keys(req.body).length === 1 && "isActive" in req.body;

        if (onlyToggle) {
            existing.isActive = Boolean(req.body.isActive);
        } else {
            existing.set(cleanCouponBody({ ...existing.toObject(), ...req.body }));
        }

        await existing.save();
        res.json({ coupon: existing });
    } catch (error) {
        sendError(res, error, "Unable to update the coupon.");
    }
};

// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid coupon." });
        }
        const removed = await Coupon.findByIdAndDelete(req.params.id);
        if (!removed) {
            return res.status(404).json({ message: "Coupon not found." });
        }
        res.json({ message: "Coupon deleted." });
    } catch (error) {
        sendError(res, error, "Unable to delete the coupon.");
    }
};

module.exports = {
    validateCoupon,
    listCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
