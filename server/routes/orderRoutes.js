
const express = require("express");
const { createOrder } = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Only signed-in users can place orders.
router.post("/", authenticate, createOrder);

module.exports = router;
