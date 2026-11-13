const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// Public shape: never expose the user id or email
const toPublic = (review) => ({
    _id: review._id,
    rating: review.rating,
    comment: review.comment,
    reviewerName: review.reviewerName,
    createdAt: review.createdAt,
    product: review.product && review.product._id
        ? { _id: review.product._id, name: review.product.name }
        : undefined
});

// "Meera Kaur" -> "Meera K."
const publicName = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "HAVEN customer";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

// Latest reviews for the homepage (public)
const getLatestReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ rating: { $gte: 4 } })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("product", "name");

        res.status(200).json(reviews.map(toPublic));
    } catch (error) {
        console.error("Latest reviews error:", error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
};

// Reviews + average for one product (public)
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        const reviews = await Review.find({ product: productId })
            .sort({ createdAt: -1 })
            .limit(50);

        const count = reviews.length;
        const average = count
            ? reviews.reduce((sum, item) => sum + item.rating, 0) / count
            : 0;

        res.status(200).json({
            count,
            average: Math.round(average * 10) / 10,
            reviews: reviews.map(toPublic)
        });
    } catch (error) {
        console.error("Product reviews error:", error);
        res.status(500).json({ message: "Failed to fetch reviews." });
    }
};

// Create a review (logged-in customers who received the product)
const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const rating = Number(req.body.rating);
        const comment = String(req.body.comment || "").trim();

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product ID." });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Please choose a rating from 1 to 5." });
        }

        if (comment.length < 5 || comment.length > 600) {
            return res.status(400).json({
                message: "Please write between 5 and 600 characters."
            });
        }

        const product = await Product.findOne({ _id: productId, isPublished: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const purchased = await Order.exists({
            customerId: req.user.userId,
            orderStatus: "Delivered",
            "items.product": productId
        });

        if (!purchased) {
            return res.status(403).json({
                message: "Only customers whose order has been delivered can review this product."
            });
        }

        const user = await User.findById(req.user.userId).select("name");

        const review = await Review.create({
            user: req.user.userId,
            product: productId,
            reviewerName: publicName(user?.name),
            rating,
            comment
        });

        res.status(201).json(toPublic(review));
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already reviewed this product."
            });
        }

        console.error("Create review error:", error);
        res.status(500).json({ message: "Failed to save your review." });
    }
};

module.exports = { getLatestReviews, getProductReviews, createReview };
