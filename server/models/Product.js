
const mongoose = require("mongoose");

// One row per size + colour combination, each with its own stock.
const variantSchema = new mongoose.Schema(
    {
        size: { type: String, trim: true, default: "", maxlength: 20 },
        color: { type: String, trim: true, default: "", maxlength: 30 },
        stock: { type: Number, required: true, default: 0, min: 0 }
    },
    { _id: false }
);

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

        // Per size/colour stock. Products without variants (older data) use `stock` only.
        variants: {
            type: [variantSchema],
            default: []
        },

        // Total stock. When variants exist this is kept equal to their sum automatically.
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

// Keep the summary fields in step with the variants.
productSchema.pre("validate", function () {
    if (this.variants && this.variants.length > 0) {
        const unique = (list) => [...new Set(list.filter(Boolean))];

        this.sizes = unique(this.variants.map((v) => v.size));
        this.colors = unique(this.variants.map((v) => v.color));
        this.stock = this.variants.reduce((sum, v) => sum + v.stock, 0);
    }
});

module.exports = mongoose.model("Product", productSchema);
