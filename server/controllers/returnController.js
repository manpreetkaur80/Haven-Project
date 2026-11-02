
const mongoose = require("mongoose");
const Order = require("../models/Order");

// CUSTOMER: REQUEST A RETURN
const requestReturn = async (req, res) => {
    const { orderId } = req.params;
    const reason = req.body?.reason;

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    if (
        typeof reason !== "string" ||
        !reason.trim() ||
        reason.trim().length > 500
    ) {
        return res.status(400).json({
            message: "Please provide a return reason (maximum 500 characters).",
        });
    }

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                customerId: req.user.userId,
                orderStatus: "Delivered",
                "returnRequest.status": "Not Requested",
            },
            {
                $set: {
                    orderStatus: "Return Requested",
                    "returnRequest.reason": reason.trim(),
                    "returnRequest.status": "Pending",
                    "returnRequest.requestedAt": new Date(),
                    "returnRequest.adminNote": "",
                    "returnRequest.reviewedAt": null,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            const existingOrder = await Order.findOne({
                _id: orderId,
                customerId: req.user.userId,
            });

            if (!existingOrder) {
                return res.status(404).json({
                    message: "Order not found.",
                });
            }

            return res.status(409).json({
                message:
                    "A return can only be requested once for a delivered order.",
            });
        }

        return res.status(200).json({
            message: "Return request submitted successfully.",
            order,
        });
    } catch (error) {
        console.error("Return request error:", error);

        return res.status(500).json({
            message: "Unable to submit return request.",
        });
    }
};

// ADMIN: APPROVE OR REJECT A RETURN
const reviewReturnRequest = async (req, res) => {
    const { orderId } = req.params;
    const { decision, adminNote = "" } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    if (!["Approved", "Rejected"].includes(decision)) {
        return res.status(400).json({
            message: "Decision must be Approved or Rejected.",
        });
    }

    if (
        typeof adminNote !== "string" ||
        adminNote.length > 500
    ) {
        return res.status(400).json({
            message: "Admin note must be a string of maximum 500 characters.",
        });
    }

    try {
        const order = await Order.findOne({
            _id: orderId,
            orderStatus: "Return Requested",
            "returnRequest.status": "Pending",
        });

        if (!order) {
            return res.status(404).json({
                message: "Pending return request not found.",
            });
        }

        order.returnRequest.status = decision;
        order.returnRequest.adminNote = adminNote.trim();
        order.returnRequest.reviewedAt = new Date();

        if (decision === "Rejected") {
            order.orderStatus = "Delivered";
        }

        await order.save();

        return res.status(200).json({
            message: `Return request ${decision.toLowerCase()} successfully.`,
            order,
        });
    } catch (error) {
        console.error("Review return error:", error);

        return res.status(500).json({
            message: "Unable to review return request.",
        });
    }
};

// ADMIN: MARK APPROVED RETURN AS RECEIVED
const markReturned = async (req, res) => {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                orderStatus: "Return Requested",
                "returnRequest.status": "Approved",
            },
            {
                $set: {
                    orderStatus: "Returned",
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(409).json({
                message: "Only approved return requests can be marked as returned.",
            });
        }

        return res.status(200).json({
            message: "Returned product received and recorded.",
            order,
        });
    } catch (error) {
        console.error("Mark returned error:", error);

        return res.status(500).json({
            message: "Unable to update return status.",
        });
    }
};

// ADMIN: MARK REFUND AS COMPLETED
const markRefunded = async (req, res) => {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
            message: "Invalid order ID.",
        });
    }

    try {
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                orderStatus: "Returned",
                paymentStatus: "Paid",
            },
            {
                $set: {
                    orderStatus: "Refunded",
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(409).json({
                message:
                    "The order must be returned and payment must be marked Paid before recording a refund.",
            });
        }

        return res.status(200).json({
            message: "Refund recorded successfully.",
            order,
        });
    } catch (error) {
        console.error("Mark refunded error:", error);

        return res.status(500).json({
            message: "Unable to record refund.",
        });
    }
};

module.exports = {
    requestReturn,
    reviewReturnRequest,
    markReturned,
    markRefunded,
};
