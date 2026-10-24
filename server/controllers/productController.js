
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../config/uploadToCloudinary");

// Get all published products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isPublished: true });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// Get one product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isPublished: true
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

// Convert comma-separated form values into arrays
const parseArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return [];
    }

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

// Add a product with Cloudinary images
const createProduct = async (req, res) => {
    const uploadedImages = [];

    try {
        const {
            name,
            description,
            price,
            category,
            subcategory,
            stock
        } = req.body;

        // Upload each selected image to Cloudinary
        for (const file of req.files || []) {
            const image = await uploadToCloudinary(file.buffer);
            uploadedImages.push(image);
        }

        // Save product details and Cloudinary image data in MongoDB
        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            subcategory,
            sizes: parseArray(req.body.sizes),
            colors: parseArray(req.body.colors),
            stock: Number(stock),
            images: uploadedImages
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        // Remove uploaded images if product creation fails
        await Promise.all(
            uploadedImages.map((image) =>
                cloudinary.uploader
                    .destroy(image.publicId)
                    .catch(() => null)
            )
        );

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Failed to create product:", error.message);

        return res.status(500).json({
            message: "Failed to create product or upload images"
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct
};
