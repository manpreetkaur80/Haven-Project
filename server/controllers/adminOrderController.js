
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { restoreStock } = require("../utils/inventory");
const { refundIfPaidOnline } = require("./orderController");
const { sendEmail } = require("../utils/email");
const { orderStatusEmail } = require("../utils/emailTemplates");

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
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // const allowedStatuses = [
    //     "Placed",
    //     "Confirmed",
    //     "Processing",
    //     "Shipped",
    //     "Delivered",
    //     "Cancelled",
    //     "Return Requested",
    //     "Returned",
    //     "Refunded",
    // ];
    const allowedStatuses = [
    "Placed",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
            message: "Invalid order status.",
        });
    }

    const session = await mongoose.startSession();

    try {
        let updatedOrder;

        await session.withTransaction(async () => {
            const order = await Order.findById(orderId).session(session);

            if (!order) {
                throw Object.assign(
                    new Error("Order not found."),
                    { statusCode: 404 }
                );
            }

            // An online order can't move forward until the money has arrived.
            if (
                order.paymentMethod === "Razorpay" &&
                order.paymentStatus === "Pending" &&
                orderStatus !== "Cancelled"
            ) {
                throw Object.assign(
                    new Error("This order is still waiting for online payment."),
                    { statusCode: 409 }
                );
            }

            // Cash on delivery is collected when the parcel is handed over.
            if (
                orderStatus === "Delivered" &&
                order.paymentMethod === "COD" &&
                order.paymentStatus === "Pending"
            ) {
                order.paymentStatus = "Paid";
            }

            // Prevent a cancelled order from being reopened.
            if (
                order.orderStatus === "Cancelled" &&
                orderStatus !== "Cancelled"
            ) {
                throw Object.assign(
                    new Error("A cancelled order cannot be reopened."),
                    { statusCode: 409 }
                );
            }

            // Cancellation is allowed only before shipment.
            if (
                orderStatus === "Cancelled" &&
                !["Placed", "Confirmed", "Processing", "Cancelled"].includes(
                    order.orderStatus
                )
            ) {
                throw Object.assign(
                    new Error(
                        "This order cannot be cancelled after shipment. Use the return process instead."
                    ),
                    { statusCode: 409 }
                );
            }

            // Restore stock exactly once.
            if (
                orderStatus === "Cancelled" &&
                !order.stockRestored
            ) {
                for (const item of order.items) {
                    await restoreStock(item, session);
                }

                order.stockRestored = true;
            }

            order.orderStatus = orderStatus;

            await order.save({ session });

            updatedOrder = order;
        });

        if (updatedOrder.orderStatus === "Cancelled") {
            await refundIfPaidOnline(updatedOrder);
        }

        const statusEmail = orderStatusEmail(updatedOrder);
        if (statusEmail) {
            sendEmail({ to: updatedOrder.customer?.email, ...statusEmail });
        }

        return res.status(200).json({
            message: "Order status updated successfully.",
            order: updatedOrder,
        });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        console.error("Update order status error:", error);

        return res.status(500).json({
            message: "Failed to update order status.",
        });

    } finally {
        await session.endSession();
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
};
