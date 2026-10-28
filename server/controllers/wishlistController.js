
const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Get the logged-in user's wishlist
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({
            user: req.user.userId,
        }).populate("products");

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.userId,
                products: [],
            });
        }

        return res.status(200).json({
            wishlist: wishlist.products,
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({
            message: "Failed to fetch wishlist.",
        });
    }
};

// Add a product to the wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
            });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user.userId },
            {
                $addToSet: {
                    products: product._id,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).populate("products");

        return res.status(200).json({
            message: "Product added to wishlist.",
            wishlist: wishlist.products,
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);
        return res.status(500).json({
            message: "Failed to add product to wishlist.",
        });
    }
};

// Remove a product from the wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                message: "Invalid product ID.",
            });
        }

        const wishlist = await Wishlist.findOneAndUpdate(
            { user: req.user.userId },
            {
                $pull: {
                    products: productId,
                },
            },
            {
                new: true,
            }
        ).populate("products");

        return res.status(200).json({
            message: "Product removed from wishlist.",
            wishlist: wishlist ? wishlist.products : [],
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            message: "Failed to remove product from wishlist.",
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};
