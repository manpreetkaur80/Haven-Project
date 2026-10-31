
const express = require("express");

const {
    getAllOrders,
    updateOrderStatus,
} = require("../controllers/adminOrderController");

const {
    authenticate,
    requireAdmin,
} = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get("/", getAllOrders);
router.patch("/:orderId/status", updateOrderStatus);
// All routes require admin authentication
router.use(authenticate, requireAdmin);

// Get all orders
router.get("/", getAllOrders);

// Update a specific order's status
router.patch("/:orderId/status", updateOrderStatus);

module.exports = router;
