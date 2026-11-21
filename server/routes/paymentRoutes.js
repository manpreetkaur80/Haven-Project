const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
    verifyPayment,
    abandonPayment,
    webhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/verify", authenticate, verifyPayment);
router.post("/abandon", authenticate, abandonPayment);
router.post("/webhook", webhook); // authenticated by Razorpay's signature

module.exports = router;
