
// const express = require("express");

// const {
//     getAllOrders,
//     updateOrderStatus,
// } = require("../controllers/adminOrderController");

// const {
//     authenticate,
//     requireAdmin,
// } = require("../middleware/auth");
// const {
//     reviewReturnRequest,
//     markReturned,
//     markRefunded,
// } = require("../controllers/returnController");
// const router = express.Router();
// router.use(authenticate, requireAdmin);

// router.get("/", getAllOrders);
// router.patch("/:orderId/status", updateOrderStatus);
// // All routes require admin authentication
// router.use(authenticate, requireAdmin);

// // Get all orders
// router.get("/", getAllOrders);
// router.patch("/:orderId/return/review", reviewReturnRequest);
// router.patch("/:orderId/returned", markReturned);
// router.patch("/:orderId/refund", markRefunded);
// // Update a specific order's status
// router.patch("/:orderId/status", updateOrderStatus);

// module.exports = router;

const express = require("express");

const {
    getAllOrders,
    updateOrderStatus,
} = require("../controllers/adminOrderController");

const {
    authenticate,
    requireAdmin,
} = require("../middleware/auth");

const {
    reviewReturnRequest,
    markReturned,
    markRefunded,
} = require("../controllers/returnController");

const router = express.Router();

// All admin order routes require authentication and admin access.
router.use(authenticate, requireAdmin);

// Get all orders
router.get("/", getAllOrders);

// Update order status
router.patch("/:orderId/status", updateOrderStatus);

// Review a customer return request
router.patch("/:orderId/return/review", reviewReturnRequest);

// Mark an approved return as received
router.patch("/:orderId/returned", markReturned);

// Record refund completion
router.patch("/:orderId/refund", markRefunded);

module.exports = router;
