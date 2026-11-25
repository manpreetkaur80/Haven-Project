
// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");

// require("dotenv").config();
// const wishlistRoutes = require("./routes/wishlistRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const authRoutes = require("./routes/authRoutes");
// const profileRoutes = require("./routes/profileRoutes");
// const adminOrderRoutes = require("./routes/adminOrderRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const {
//     authLimiter,
//     apiLimiter,
//     sanitizeInput
// } = require("./middleware/security");


// // Initialize Express
// const app = express();

// // Behind a host like Render/Railway the real client IP is in X-Forwarded-For.
// if (process.env.TRUST_PROXY) {
//     app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
// }

// // "simple" query parsing stops ?a[$ne]=x from becoming a nested object.
// app.set("query parser", "simple");
// app.disable("x-powered-by");

// // Only your website may call the API from a browser (comma-separated list).
// const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
//     .split(",")
//     .map((origin) => origin.trim())
//     .filter(Boolean);

// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// app.use(
//     cors({
//         origin(origin, callback) {
//             // No Origin header = same-origin / server-to-server / curl.
//             if (!origin || allowedOrigins.includes(origin)) {
//                 return callback(null, true);
//             }
//             return callback(null, false);
//         }
//     })
// );
// app.use(
//     express.json({
//         limit: "100kb",
//         // Razorpay signs the exact bytes of the webhook body, so keep a copy.
//         verify(req, res, buffer) {
//             if (req.originalUrl.startsWith("/api/payments/webhook")) {
//                 req.rawBody = buffer;
//             }
//         }
//     })
// );
// app.use(sanitizeInput);
// app.use("/api", apiLimiter);

// // Home route
// app.get("/", (req, res) => {
//     res.send("Welcome to HAVEN API!");
// });

// // API routes
// app.use("/api/auth", authLimiter, authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/wishlist", wishlistRoutes);
// app.use("/api/admin/orders", adminOrderRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/payments", paymentRoutes);

// // Unknown API routes
// app.use("/api", (req, res) => {
//     res.status(404).json({ message: "Not found." });
// });

// // Last-resort error handler: never leak stack traces to the browser.
// app.use((error, req, res, next) => {
//     if (res.headersSent) return next(error);

//     if (error.type === "entity.too.large") {
//         return res.status(413).json({ message: "Request is too large." });
//     }
//     if (error.type === "entity.parse.failed") {
//         return res.status(400).json({ message: "Invalid request body." });
//     }

//     console.error("Unhandled error:", error.message);
//     return res.status(500).json({ message: "Something went wrong." });
// });

// module.exports = app;


const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();
const wishlistRoutes = require("./routes/wishlistRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const {
    authLimiter,
    apiLimiter,
    sanitizeInput
} = require("./middleware/security");


// Initialize Express
const app = express();

// Behind a host like Render/Railway the real client IP is in X-Forwarded-For.
// Render sets RENDER=true, so the proxy is trusted automatically there.
if (process.env.TRUST_PROXY || process.env.RENDER) {
    app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
}

// "simple" query parsing stops ?a[$ne]=x from becoming a nested object.
app.set("query parser", "simple");
app.disable("x-powered-by");

// Only your website may call the API from a browser (comma-separated list).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
        // Accept "https://site.app/" or "https://site.app/admin" and keep only the address part.
        try {
            return new URL(origin).origin;
        } catch {
            return origin.replace(/\/+$/, "");
        }
    });

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
    cors({
        origin(origin, callback) {
            // No Origin header = same-origin / server-to-server / curl.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        }
    })
);
app.use(
    express.json({
        limit: "100kb",
        // Razorpay signs the exact bytes of the webhook body, so keep a copy.
        verify(req, res, buffer) {
            if (req.originalUrl.startsWith("/api/payments/webhook")) {
                req.rawBody = buffer;
            }
        }
    })
);
app.use(sanitizeInput);
app.use("/api", apiLimiter);

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to HAVEN API!");
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);

// Unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({ message: "Not found." });
});

// Last-resort error handler: never leak stack traces to the browser.
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.type === "entity.too.large") {
        return res.status(413).json({ message: "Request is too large." });
    }
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid request body." });
    }

    console.error("Unhandled error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
});

module.exports = app;