// Run with: npm test   (no database needed)
process.env.JWT_SECRET = "x".repeat(40);
process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "hook_secret";
process.env.CLIENT_URL = "http://localhost:5173";

const test = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

const app = require("../app");
const razorpay = require("../utils/razorpay");
const Product = require("../models/Product");
const { reserveStock } = require("../utils/inventory");
const { orderPlacedEmail, resetPasswordEmail } = require("../utils/emailTemplates");
const { sanitizeInput } = require("../middleware/security");

let server;
let base;

test.before(async () => {
    server = app.listen(0);
    await new Promise((r) => server.once("listening", r));
    base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test("security headers are sent and x-powered-by is hidden", async () => {
    const res = await fetch(`${base}/`);
    assert.ok(res.headers.get("x-content-type-options"));
    assert.equal(res.headers.get("x-powered-by"), null);
});

test("CORS only allows the configured website", async () => {
    const ok = await fetch(`${base}/api/nothing`, { headers: { Origin: "http://localhost:5173" } });
    const bad = await fetch(`${base}/api/nothing`, { headers: { Origin: "https://evil.example" } });
    assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("unknown API routes return JSON 404", async () => {
    const res = await fetch(`${base}/api/does-not-exist`);
    assert.equal(res.status, 404);
    assert.ok((await res.json()).message);
});

test("oversized and malformed bodies are rejected cleanly", async () => {
    const big = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "a@b.co", password: "x".repeat(200_000) }),
    });
    assert.equal(big.status, 413);

    const bad = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
    });
    assert.equal(bad.status, 400);
});

test("auth endpoints are rate limited", async () => {
    let limited = false;
    for (let i = 0; i < 25 && !limited; i++) {
        const res = await fetch(`${base}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        if (res.status === 429) limited = true;
    }
    assert.ok(limited, "expected a 429 after repeated attempts");
});

test("protected routes need a token", async () => {
    for (const path of ["/api/orders", "/api/payments/verify"]) {
        const res = await fetch(`${base}${path}`, { method: "POST" });
        assert.equal(res.status, 401);
    }
});

test("Mongo operators are stripped from input", () => {
    const req = { body: { email: { $ne: "" }, nested: [{ "a.b": 1, ok: 2 }] }, params: {} };
    sanitizeInput(req, {}, () => {});
    assert.deepEqual(req.body, { email: {}, nested: [{ ok: 2 }] });
});

test("Razorpay signatures: valid passes, tampered fails", () => {
    const sig = crypto.createHmac("sha256", "test_secret").update("order_1|pay_1").digest("hex");
    assert.equal(razorpay.verifyPaymentSignature("order_1", "pay_1", sig), true);
    assert.equal(razorpay.verifyPaymentSignature("order_1", "pay_2", sig), false);
    assert.equal(razorpay.verifyPaymentSignature("order_1", "pay_1", "bad"), false);
});

test("webhook signature check uses the raw body", () => {
    const raw = Buffer.from('{"event":"payment.captured"}');
    const sig = crypto.createHmac("sha256", "hook_secret").update(raw).digest("hex");
    assert.equal(razorpay.verifyWebhookSignature(raw, sig), true);
    assert.equal(razorpay.verifyWebhookSignature(Buffer.from("{}"), sig), false);
});

test("webhook with a bad signature is rejected", async () => {
    const res = await fetch(`${base}/api/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-razorpay-signature": "nope" },
        body: "{}",
    });
    assert.equal(res.status, 400);
});

test("product variants drive sizes, colours and total stock", async () => {
    const product = new Product({
        name: "Tee", description: "d", price: 100, category: "Men", subcategory: "T",
        variants: [
            { size: "S", color: "Black", stock: 2 },
            { size: "M", color: "Black", stock: 3 },
            { size: "M", color: "White", stock: 4 },
        ],
    });
    await product.validate();
    assert.deepEqual(product.sizes.toObject(), ["S", "M"]);
    assert.deepEqual(product.colors.toObject(), ["Black", "White"]);
    assert.equal(product.stock, 9);
});

test("reserveStock takes from the right variant and refuses oversell", async () => {
    const calls = [];
    const original = Product.updateOne;
    Product.updateOne = async (filter, update) => {
        calls.push({ filter, update });
        return { modifiedCount: 1 };
    };

    const product = {
        _id: "p1", name: "Tee",
        variants: [{ size: "M", color: "Black", stock: 3 }, { size: "L", color: "Black", stock: 0 }],
    };

    try {
        await reserveStock(product, { size: "M", color: "Black", quantity: 2 }, null);
        assert.deepEqual(calls[0].update.$inc, { "variants.$.stock": -2, stock: -2 });
        assert.deepEqual(calls[0].filter.variants.$elemMatch, { size: "M", color: "Black", stock: { $gte: 2 } });

        await assert.rejects(reserveStock(product, { size: "M", color: "Black", quantity: 4 }, null), /Only 3 left/);
        await assert.rejects(reserveStock(product, { size: "L", color: "Black", quantity: 1 }, null), /sold out/);
        await assert.rejects(reserveStock(product, { size: "XL", color: "Black", quantity: 1 }, null), /isn't available/);
    } finally {
        Product.updateOne = original;
    }
});

test("email templates escape user content and contain links", () => {
    const mail = orderPlacedEmail({
        _id: "abcdef1234567890", paymentMethod: "COD", paymentStatus: "Pending", totalAmount: 1000,
        items: [{ name: "<script>x</script>", quantity: 1, price: 1000, size: "M", color: "Black" }],
    });
    assert.ok(!mail.html.includes("<script>"));
    assert.ok(mail.html.includes("/orders/abcdef1234567890"));

    const reset = resetPasswordEmail({ name: "Asha" }, "http://localhost:5173/reset-password/tok");
    assert.ok(reset.html.includes("reset-password/tok"));
});
