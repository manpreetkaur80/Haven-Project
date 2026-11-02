
const mongoose = require("mongoose");

// ORDER ITEM SCHEMA
const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        size: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "",
        },
    },
    { _id: false }
);

// RETURN REQUEST SCHEMA
const returnRequestSchema = new mongoose.Schema(
    {
        reason: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "Not Requested",
                "Pending",
                "Approved",
                "Rejected",
            ],
            default: "Not Requested",
        },
        adminNote: {
            type: String,
            trim: true,
            default: "",
        },
        requestedAt: {
            type: Date,
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

// MAIN ORDER SCHEMA
const orderSchema = new mongoose.Schema(
    {
        // Customer contact details
        customer: {
            fullName: {
                type: String,
                required: true,
                trim: true,
            },
            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            phone: {
                type: String,
                required: true,
                trim: true,
            },
        },

        // Registered customer reference
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Delivery address
        shippingAddress: {
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
        },

        // Purchased products
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "An order must contain at least one product.",
            },
        },

        // Order pricing
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        // Payment information
        paymentMethod: {
            type: String,
            enum: ["COD"],
            default: "COD",
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },

        // Order lifecycle
        orderStatus: {
            type: String,
            enum: [
                "Placed",
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Return Requested",
                "Returned",
                "Refunded",
            ],
            default: "Placed",
        },

        // Prevent duplicate stock restoration
        stockRestored: {
            type: Boolean,
            default: false,
        },

        // Return request information
        returnRequest: {
            type: returnRequestSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);
