
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../config/uploadToCloudinary");

const parseArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value !== "string") return [];

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const deleteCloudinaryImages = async (images = []) => {
    await Promise.all(
        images
            .filter((image) => image.publicId)
            .map((image) =>
                cloudinary.uploader
                    .destroy(image.publicId)
                    .catch((error) => {
                        console.error("Cloudinary deletion failed:", error.message);
                        return null;
                    })
            )
    );
};

// Get all published products for customers
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isPublished: true })
            .sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// Get one published product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isPublished: true
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

// Create product
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

        for (const file of req.files || []) {
            const image = await uploadToCloudinary(file.buffer);
            uploadedImages.push(image);
        }

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

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        await deleteCloudinaryImages(uploadedImages);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Failed to create product:", error.message);

        res.status(500).json({
            message: "Failed to create product or upload images"
        });
    }
};

// Admin: get all products, including unpublished ones
const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch admin products",
            error: error.message
        });
    }
};

// Admin: update product details and optionally add images
const updateProduct = async (req, res) => {
    const uploadedImages = [];

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const {
            name,
            description,
            price,
            category,
            subcategory,
            stock,
            sizes,
            colors,
            isFeatured,
            isPublished
        } = req.body;

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (category !== undefined) product.category = category;
        if (subcategory !== undefined) product.subcategory = subcategory;
        if (stock !== undefined) product.stock = Number(stock);
        if (sizes !== undefined) product.sizes = parseArray(sizes);
        if (colors !== undefined) product.colors = parseArray(colors);

        if (isFeatured !== undefined) {
            product.isFeatured = isFeatured === "true" || isFeatured === true;
        }

        if (isPublished !== undefined) {
            product.isPublished = isPublished === "true" || isPublished === true;
        }

        // Add newly uploaded images without removing existing images
        for (const file of req.files || []) {
            const image = await uploadToCloudinary(file.buffer);
            uploadedImages.push(image);
        }

        product.images.push(...uploadedImages);

        await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        await deleteCloudinaryImages(uploadedImages);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }

        console.error("Failed to update product:", error.message);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
};

// Admin: delete product and its Cloudinary images
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.deleteOne();
        await deleteCloudinaryImages(product.images);

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    getAdminProducts,
    updateProduct,
    deleteProduct
};
