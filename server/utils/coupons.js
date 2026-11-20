const Coupon = require("../models/Coupon");

/**
 * Looks a code up and checks every rule against the given subtotal.
 * Returns { coupon, discountAmount } or throws an Error with statusCode 400.
 * Pass a mongoose session to read inside a transaction.
 */
async function evaluateCoupon(rawCode, subtotal, session) {
    const code = String(rawCode || "").trim().toUpperCase();

    if (!code) {
        throw Object.assign(new Error("Enter a discount code."), { statusCode: 400 });
    }

    const query = Coupon.findOne({ code });
    if (session) {
        query.session(session);
    }
    const coupon = await query;

    const fail = (message) =>
        Object.assign(new Error(message), { statusCode: 400 });

    if (!coupon || !coupon.isActive) {
        throw fail("This discount code is not valid.");
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
        throw fail("This discount code has expired.");
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw fail("This discount code has been fully used.");
    }

    if (subtotal < coupon.minOrderAmount) {
        throw fail(
            `Add items worth ₹${coupon.minOrderAmount.toLocaleString("en-IN")} or more to use this code.`
        );
    }

    let discountAmount =
        coupon.discountType === "percent"
            ? Math.floor((subtotal * coupon.value) / 100)
            : coupon.value;

    if (coupon.discountType === "percent" && coupon.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }

    // A code can never make an order cost less than ₹0.
    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return { coupon, discountAmount };
}

module.exports = { evaluateCoupon };
