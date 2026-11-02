
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

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
                    const result = await Product.updateOne(
                        { _id: item.product },
                        {
                            $inc: {
                                stock: item.quantity,
                            },
                        },
                        { session }
                    );

                    if (result.matchedCount !== 1) {
                        throw Object.assign(
                            new Error(
                                `Product "${item.name}" no longer exists. Stock could not be restored.`
                            ),
                            { statusCode: 409 }
                        );
                    }
                }

                order.stockRestored = true;
            }

            order.orderStatus = orderStatus;

            await order.save({ session });

            updatedOrder = order;
        });

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
