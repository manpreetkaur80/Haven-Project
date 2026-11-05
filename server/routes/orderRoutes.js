
const express = require("express");

const {
    createOrder,
    cancelMyOrder,
} = require("../controllers/orderController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Only signed-in users can place orders.
router.post("/", authenticate, createOrder);

// Customers can cancel their own eligible orders.
router.patch("/:orderId/cancel", authenticate, cancelMyOrder);

const {
    requestReturn,
} = require("../controllers/returnController");

// Existing routes
router.post("/", authenticate, createOrder);
router.patch("/:orderId/cancel", authenticate, cancelMyOrder);

// New return route
router.post("/:orderId/return", authenticate, requestReturn);
module.exports = router;
