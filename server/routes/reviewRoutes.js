const express = require("express");

const {
    getLatestReviews,
    getProductReviews,
    createReview
} = require("../controllers/reviewController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/latest", getLatestReviews);
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", authenticate, createReview);

module.exports = router;
