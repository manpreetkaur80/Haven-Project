const Order = require("../models/Order");
const { releaseUnpaidOrder } = require("../controllers/orderController");

const MAX_AGE_MS = 30 * 60 * 1000;

/**
 * Online orders that were started but never paid hold stock. Every few minutes
 * we cancel the ones older than 30 minutes and put their stock back.
 */
async function sweepUnpaidOrders() {
    try {
        const stale = await Order.find({
            paymentMethod: "Razorpay",
            paymentStatus: "Pending",
            orderStatus: "Placed",
            createdAt: { $lt: new Date(Date.now() - MAX_AGE_MS) },
        }).select("_id");

        for (const order of stale) {
            await releaseUnpaidOrder(order._id, "Failed");
        }
    } catch (error) {
        console.error("Unpaid order sweep failed:", error.message);
    }
}

function startPaymentSweeper() {
    const timer = setInterval(sweepUnpaidOrders, 5 * 60 * 1000);
    timer.unref();
    sweepUnpaidOrders();
}

module.exports = { startPaymentSweeper, sweepUnpaidOrders };
