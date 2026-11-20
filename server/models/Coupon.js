const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        // Stored upper-case so customers can type it in any case.
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: 30,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },

        // "percent" = value is a percentage (1–90); "flat" = value is rupees off.
        discountType: {
            type: String,
            enum: ["percent", "flat"],
            required: true,
        },

        value: {
            type: Number,
            required: true,
            min: 1,
        },

        // Optional cap for percentage codes (e.g. 10% off, up to ₹500).
        maxDiscount: {
            type: Number,
            min: 0,
            default: 0,
        },

        // Minimum bag subtotal needed to use the code.
        minOrderAmount: {
            type: Number,
            min: 0,
            default: 0,
        },

        // 0 = unlimited uses.
        usageLimit: {
            type: Number,
            min: 0,
            default: 0,
        },

        usedCount: {
            type: Number,
            min: 0,
            default: 0,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
