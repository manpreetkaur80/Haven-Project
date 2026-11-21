const Order = require("../models/Order");
const razorpay = require("../utils/razorpay");
const { sendEmail } = require("../utils/email");
const { orderPlacedEmail } = require("../utils/emailTemplates");
const { releaseUnpaidOrder } = require("./orderController");

// Marks an online order Paid exactly once (the browser callback and the webhook can both arrive).
async function markPaid(razorpayOrderId, paymentId) {
    const order = await Order.findOneAndUpdate(
        {
            razorpayOrderId,
            paymentMethod: "Razorpay",
            paymentStatus: { $in: ["Pending", "Failed"] },
            orderStatus: { $ne: "Cancelled" },
        },
        { $set: { paymentStatus: "Paid", razorpayPaymentId: paymentId } },
        { new: true }
    );

    if (order) {
        sendEmail({ to: order.customer.email, ...orderPlacedEmail(order) });
    }
    return order;
}

// Money arrived for an order we had already cancelled/expired: give it straight back.
async function refundLatePayment(razorpayOrderId, paymentId) {
    const order = await Order.findOne({
        razorpayOrderId,
        paymentMethod: "Razorpay",
        orderStatus: "Cancelled",
        paymentStatus: "Failed",
    });

    if (!order) return false;

    try {
        await razorpay.refundPayment(paymentId, order.totalAmount);
        order.paymentStatus = "Refunded";
        order.razorpayPaymentId = paymentId;
        await order.save();
        return true;
    } catch (error) {
        console.error(`Late payment refund failed for ${order._id}:`, error.message);
        return false;
    }
}

// POST /api/payments/verify — called by the browser after Razorpay says "paid".
const verifyPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        if (
            typeof orderId !== "string" ||
            typeof razorpay_order_id !== "string" ||
            typeof razorpay_payment_id !== "string" ||
            typeof razorpay_signature !== "string"
        ) {
            return res.status(400).json({ message: "Invalid payment details." });
        }

        const order = await Order.findOne({
            _id: orderId,
            customerId: req.user.userId,
            razorpayOrderId: razorpay_order_id,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.paymentStatus === "Paid") {
            return res.status(200).json({ message: "Payment confirmed.", order });
        }

        if (
            !razorpay.verifyPaymentSignature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            )
        ) {
            return res.status(400).json({
                message: "Payment could not be verified. If money was deducted, it will be refunded.",
            });
        }

        const paid = await markPaid(razorpay_order_id, razorpay_payment_id);

        if (!paid) {
            // Order was cancelled/expired before the payment arrived.
            await refundLatePayment(razorpay_order_id, razorpay_payment_id);
            return res.status(409).json({
                message: "This order expired before payment arrived. Any amount deducted will be refunded.",
            });
        }

        return res.status(200).json({ message: "Payment confirmed.", order: paid });
    } catch (error) {
        console.error("Verify payment error:", error.message);
        return res.status(500).json({ message: "Unable to confirm your payment." });
    }
};

// POST /api/payments/abandon — customer closed the payment window or it failed.
const abandonPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findOne({
            _id: orderId,
            customerId: req.user.userId,
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        await releaseUnpaidOrder(order._id, "Failed");
        return res.status(200).json({ message: "Payment cancelled." });
    } catch (error) {
        console.error("Abandon payment error:", error.message);
        return res.status(500).json({ message: "Unable to cancel the payment." });
    }
};

// POST /api/payments/webhook — Razorpay -> server. Covers customers who pay and then close the tab.
// Needs RAZORPAY_WEBHOOK_SECRET and the "payment.captured" / "order.paid" events enabled in the dashboard.
const webhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];

        if (!razorpay.verifyWebhookSignature(req.rawBody, signature)) {
            return res.status(400).json({ message: "Invalid signature." });
        }

        const { event, payload } = req.body;
        const payment = payload?.payment?.entity;

        if (
            (event === "payment.captured" || event === "order.paid") &&
            payment?.order_id &&
            payment?.id
        ) {
            const paid = await markPaid(payment.order_id, payment.id);
            if (!paid) {
                await refundLatePayment(payment.order_id, payment.id);
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(500).json({ message: "Webhook failed." });
    }
};

module.exports = { verifyPayment, abandonPayment, webhook };
