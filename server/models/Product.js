
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true,
            enum: ["Women", "Men"]
        },

        subcategory: {
            type: String,
            required: true,
            trim: true
        },

        images: {
            type: [
                {
                    url: { type: String, required: true },
                    publicId: { type: String, required: true }
                }
            ],
            default: []
        },

        sizes: {
            type: [String],
            required: true
        },

        colors: {
            type: [String],
            required: true
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
