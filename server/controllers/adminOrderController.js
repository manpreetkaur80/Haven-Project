
const mongoose = require("mongoose");
const Order = require("../models/Order");

// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("customerId", "fullName email");

        return res.status(200).json({
            message: "Orders fetched successfully.",
            orders,
        });
    } catch (error) {
        console.error("Get all orders error:", error);
        return res.status(500).json({
            message: "Failed to fetch orders.",
        });
    }
};

// UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                message: "Invalid order ID.",
            });
        }

        const allowedStatuses = [
            "Placed",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Return Requested",
            "Returned",
            "Refunded",
        ];

        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status.",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found.",
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully.",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({
            message: "Failed to update order status.",
        });
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
};
