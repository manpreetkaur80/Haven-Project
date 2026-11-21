const rateLimit = require("express-rate-limit");

// Login / signup / password reset: slow down guessing and abuse.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in a few minutes." }
});

// Whole API: generous, stops scripts hammering the server.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many requests. Please slow down." }
});

// Removes MongoDB operators ({"$ne": ...}) and dotted keys from request bodies
// so user input can never be interpreted as a query.
function stripOperators(value) {
    if (Array.isArray(value)) {
        value.forEach(stripOperators);
    } else if (value && typeof value === "object") {
        for (const key of Object.keys(value)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete value[key];
            } else {
                stripOperators(value[key]);
            }
        }
    }
}

const sanitizeInput = (req, res, next) => {
    stripOperators(req.body);
    stripOperators(req.params);
    next();
};

module.exports = { authLimiter, apiLimiter, sanitizeInput };
