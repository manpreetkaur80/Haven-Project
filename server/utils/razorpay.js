const crypto = require("crypto");

const API = "https://api.razorpay.com/v1";

const isConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const authHeader = () =>
    "Basic " +
    Buffer.from(
        `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

async function call(path, body) {
    const response = await fetch(`${API}${path}`, {
        method: "POST",
        headers: {
            Authorization: authHeader(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.error?.description || `Razorpay error ${response.status}`);
    }
    return data;
}

// amount is in rupees; Razorpay wants paise.
const toPaise = (rupees) => Math.round(Number(rupees) * 100);

function createRazorpayOrder({ amount, receipt }) {
    return call("/orders", {
        amount: toPaise(amount),
        currency: "INR",
        receipt: String(receipt).slice(0, 40)
    });
}

function refundPayment(paymentId, amount) {
    return call(`/payments/${paymentId}/refund`, { amount: toPaise(amount) });
}

const safeEqual = (a, b) => {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
};

// Checkout signature: HMAC-SHA256("<razorpay_order_id>|<razorpay_payment_id>", key secret)
function verifyPaymentSignature(orderId, paymentId, signature) {
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return safeEqual(expected, signature || "");
}

// Webhook signature: HMAC-SHA256(raw request body, webhook secret)
function verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !rawBody) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return safeEqual(expected, signature || "");
}

module.exports = {
    isConfigured,
    createRazorpayOrder,
    refundPayment,
    verifyPaymentSignature,
    verifyWebhookSignature
};
