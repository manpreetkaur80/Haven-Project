
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in to continue."
        });
    }

    const token = authorization.slice(7).trim();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId || !["customer", "admin"].includes(decoded.role)) {
            return res.status(401).json({
                message: "Invalid authentication token."
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    } catch {
        return res.status(401).json({
            message: "Your session is invalid or expired. Please log in again."
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Administrator access is required."
        });
    }

    next();
};

module.exports = { authenticate, requireAdmin };
